import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { canPerformAction, canViewPage, inferRoleFromPosition } from '../utils/rbac'

const AuthContext = createContext()

// The client-side password hashing logic (SHA-256) has been removed.
// We are migrating to PostgreSQL `pgcrypto` bcrypt hashing at the database layer.

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        const initAuth = async () => {
            const savedEmployeeCode = localStorage.getItem('currentEmployeeCode')
            if (!savedEmployeeCode) {
                setInitialized(true)
                return
            }

            // OPTIMISTIC RESTORE: immediately load from cache so UI never flashes login
            const cachedUser = localStorage.getItem('cachedUserData')
            if (cachedUser) {
                try {
                    const parsed = JSON.parse(cachedUser)
                    if (parsed.employee_code === savedEmployeeCode) {
                        setUser(parsed)
                        setInitialized(true)
                        console.log('⚡ [Auth Init] Session restored instantly from cache')
                    }
                } catch {
                    localStorage.removeItem('cachedUserData')
                }
            }

            // BACKGROUND: verify & refresh from Supabase without blocking UI
            setLoading(true)
            try {
                await fetchUserRole(savedEmployeeCode)
                console.log('✅ [Auth Init] Session verified with Supabase')
            } catch (err) {
                console.error('❌ [Auth Init] Session verify failed:', err)
                if (err.message?.includes('Không tìm thấy') || err.message?.includes('Nghỉ việc')) {
                    localStorage.removeItem('currentEmployeeCode')
                    localStorage.removeItem('cachedUserData')
                    setUser(null)
                }
                // Network error: keep cached user, don't log them out
            } finally {
                setLoading(false)
                setInitialized(true) // ensure initialized even if no cache
            }
        }

        initAuth()
    }, [])

    const fetchUserRole = async (employeeCode) => {
        try {
            setLoading(true)

            console.log('🔍 [Login Flow] Fetching user data...')
            console.log('   👤 Employee code:', employeeCode)
            console.log('   🔑 Source: employee_profiles table (database)')

            // 1. Fetch Profile from employee_profiles table
            const { data: profile, error: profileError } = await supabase
                .from('employee_profiles')
                .select('*')
                .eq('employee_code', employeeCode)
                .single()

            if (profileError) {
                console.error('❌ [Login Flow] Profile error:', profileError)
                throw new Error(`Không tìm thấy thông tin nhân viên: ${employeeCode}`)
            }

            if (!profile) {
                console.error('❌ [Login Flow] Profile is null!')
                throw new Error('Không tìm thấy thông tin nhân viên')
            }

            // Check if account is deactivated
            if (profile.status === 'Nghỉ việc') {
                console.error('❌ [Login Flow] Account deactivated:', employeeCode)
                localStorage.removeItem('currentEmployeeCode')
                setUser(null)
                setLoading(false)
                return
            }

            console.log('   ✅ Profile found:', profile?.last_name, profile?.first_name)

            // 2. Logic synchronized with rbac.js and UserManagement.jsx
            let userLevel = inferRoleFromPosition(profile.current_position)
            let deptScope = null
            let teamScope = null

            // Assign scopes based on the inferred role
            if (userLevel === 'DEPT_HEAD') {
                deptScope = profile.department
            } else if (userLevel === 'TEAM_LEADER') {
                deptScope = profile.department || profile.bo_phan
                teamScope = profile.team || profile.to_doi || profile.group_name
                console.log(`[AuthContext] Role: TEAM_LEADER, Team Scope: ${teamScope}`)
            } else if (userLevel === 'BOARD_DIRECTOR' || userLevel === 'SUPER_ADMIN') {
                deptScope = null
                teamScope = null
            }

            // EXTRA: Super Admin Logic (based on code - hard override)
            if (employeeCode === 'ADMIN') {
                userLevel = 'SUPER_ADMIN'
                deptScope = null
                teamScope = null
            }



            console.log(`   🔐 Final Role: ${userLevel} (Source: ${profile.role_level ? 'Database' : 'Inferred'})`)

            const { data: permissionMatrix, error: matrixError } = await supabase
                .from('rbac_matrix')
                .select('*')
                .eq('role_level', userLevel)

            if (matrixError) {
                console.warn('⚠️ [Login Flow] Permission matrix error:', matrixError)
            }

            console.log('   ✅ Permissions loaded:', permissionMatrix?.length || 0, 'items')

            const userData = {
                id: profile.id,
                email: profile.email_acv || `${employeeCode}@cangsanbay.local`,
                employee_code: profile.employee_code,
                role_level: userLevel,
                dept_scope: deptScope,
                team_scope: teamScope,
                permissions: permissionMatrix || [], // Store full matrix here
                profile: {
                    ...profile,
                    ho_va_ten: `${profile.last_name} ${profile.first_name}`
                }
            }

            console.log('   ✅ [Login Flow] User data set successfully')
            console.log('   📋 User info:', {
                employee_code: userData.employee_code,
                role_level: userData.role_level,
                name: userData.profile.ho_va_ten
            })

            setUser(userData)
            // Cache user data for instant restore on next page load
            localStorage.setItem('cachedUserData', JSON.stringify(userData))
            setLoading(false)
        } catch (err) {
            console.error("❌ [Login Flow] Error fetching user role:", err)
            setUser(null)
            setLoading(false)
            throw err
        }
    }

    const login = async (employeeCode, password) => {
        console.log('🔐 [Login] Attempting login...')
        console.log('   👤 Employee code:', employeeCode)
        console.log('   🔑 Source: employee_profiles table (database)')

        const code = employeeCode.trim().toUpperCase()

        // 1. Dùng Database Backend RPC "verify_user_password" để so sánh mật khẩu
        // Đầu tiên check password (so sánh với plain-text cũ "123456" hoặc bcrypt mới)
        const { data: isPasswordValid, error: rpcError } = await supabase.rpc(
            'verify_user_password',
            { p_employee_code: code, p_password: password }
        )

        if (rpcError) {
            console.error('❌ [Login] RPC Error calling verify_user_password:', rpcError)
            throw new Error('Lỗi xác thực hệ thống: ' + rpcError.message)
        }

        if (!isPasswordValid) {
            console.error('❌ [Login] Password mismatch or user not found')
            throw new Error('Mã nhân viên hoặc mật khẩu không đúng')
        }

        // 2. Fetch employee profile
        const { data: profile, error: profileError } = await supabase
            .from('employee_profiles')
            .select('*')
            .eq('employee_code', code)
            .single()

        if (profileError || !profile) {
            console.error('❌ [Login] Employee profile fetch failed:', profileError)
            throw new Error('Mã nhân viên hoặc mật khẩu không đúng')
        }

        // 3. Check if account is deactivated
        if (profile.status === 'Nghỉ việc') {
            console.error('❌ [Login] Account deactivated:', code)
            throw new Error('Tài khoản đã ngưng hoạt động, liên hệ ADMIN để tìm hiểu thêm')
        }

        console.log('✅ [Login] Password verified!')
        console.log('   ⏭️  Next: Fetching user profile and permissions...')

        // 3. Save session to localStorage
        localStorage.setItem('currentEmployeeCode', code)

        // 4. Lấy Role và Quyền (Permissions)
        await fetchUserRole(code)

        // 5. Kiểm tra trạng thái buộc đổi mật khẩu (nếu đang dùng "123456")
        // Trả cờ về Frontend để Frontend điều hướng qua màn hình/nhập khẩu mới
        const requirePasswordChange = password === '123456' || profile.password === '123456';

        return { success: true, requirePasswordChange }
    }

    const logout = async () => {
        localStorage.removeItem('currentEmployeeCode')
        localStorage.removeItem('cachedUserData')
        setUser(null)
    }

    const checkPermission = (page) => canViewPage(user, page)
    const checkAction = (action, target) => canPerformAction(user, action, target)

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            initialized,
            checkPermission,
            checkAction,
            refreshUser: () => {
                const employeeCode = localStorage.getItem('currentEmployeeCode')
                if (employeeCode) {
                    fetchUserRole(employeeCode)
                }
            },
            login,
            logout,
            switchUser: async (code) => {
                try {
                    await fetchUserRole(code)
                    localStorage.setItem('currentEmployeeCode', code)
                } catch (err) {
                    console.error("Switch failed:", err)
                    alert(`Lỗi: Không thể chuyển sang user ${code}. User có thể không tồn tại.`)
                }
            }
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
