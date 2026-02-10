import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { canPerformAction, canViewPage } from '../utils/rbac'

const AuthContext = createContext()

// Simple password hashing (for development - in production use proper hashing)
const hashPassword = async (password) => {
    // Use Web Crypto API for hashing
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

const verifyPassword = async (password, hashedPassword) => {
    // If password is null/empty in DB, allow default password '123456'
    if (!hashedPassword || hashedPassword.trim() === '') {
        return password === '123456'
    }
    // If password is plain text (short), compare directly
    if (hashedPassword.length < 64) {
        return password === hashedPassword
    }
    // Otherwise, hash and compare
    const hashed = await hashPassword(password)
    return hashed === hashedPassword
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for existing session from localStorage
        const savedEmployeeCode = localStorage.getItem('currentEmployeeCode')
        if (savedEmployeeCode) {
            fetchUserRole(savedEmployeeCode).catch(err => {
                console.warn("Session restore failed, clearing:", err)
                localStorage.removeItem('currentEmployeeCode')
                setUser(null)
            })
        } else {
            setLoading(false)
        }
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

            // 2. Logic synchronized with UserManagement.jsx (Roles Tab)
            const pos = (profile.current_position || '').toLowerCase()
            let userLevel = 'STAFF' // default
            let deptScope = null
            let teamScope = null

            // Use flexible matching with includes() - SAME AS UserManagement.jsx
            if (pos.includes('giám đốc') && !pos.includes('phó')) {
                userLevel = 'BOARD_DIRECTOR'
            } else if (pos.includes('phó giám đốc')) {
                userLevel = 'BOARD_DIRECTOR'
            } else if (pos.includes('trưởng phòng') && !pos.includes('phó')) {
                userLevel = 'DEPT_HEAD'
                deptScope = profile.department
            } else if (pos.includes('phó trưởng phòng') || pos.includes('phó phòng')) {
                userLevel = 'DEPT_HEAD'
                deptScope = profile.department
            } else if (pos.includes('đội trưởng') || pos.includes('tổ trưởng') || pos.includes('chủ đội') || pos.includes('chủ tổ')) {
                userLevel = 'TEAM_LEADER'
                deptScope = profile.department
                teamScope = profile.team
            } else if (pos.includes('đội phó') || pos.includes('tổ phó')) {
                userLevel = 'TEAM_LEADER'
                deptScope = profile.department
                teamScope = profile.team
            }

            // EXTRA: Super Admin Logic (based on position or code)
            if (pos.includes('admin') || employeeCode === 'ADMIN') {
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

        // 1. Fetch employee profile with password
        const { data: profile, error: profileError } = await supabase
            .from('employee_profiles')
            .select('*')
            .eq('employee_code', code)
            .single()

        if (profileError || !profile) {
            console.error('❌ [Login] Employee not found:', profileError)
            throw new Error('Mã nhân viên hoặc mật khẩu không đúng')
        }

        // 2. Verify password
        const passwordMatch = await verifyPassword(password, profile.password)

        if (!passwordMatch) {
            console.error('❌ [Login] Password mismatch')
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

        // 4. Fetch user role and permissions
        await fetchUserRole(code)

        return { success: true }
    }

    const logout = async () => {
        localStorage.removeItem('currentEmployeeCode')
        setUser(null)
    }

    const checkPermission = (page) => canViewPage(user, page)
    const checkAction = (action, target) => canPerformAction(user, action, target)

    return (
        <AuthContext.Provider value={{
            user,
            loading,
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
