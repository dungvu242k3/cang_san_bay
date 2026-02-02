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

            // Special handling removed - Fetch from DB


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

            console.log('   ✅ Profile found:', profile?.last_name, profile?.first_name)

            // 2. Fetch Assigned Role & Scope from user_roles table
            const { data: roleData, error: roleError } = await supabase
                .from('user_roles')
                .select('*')
                .eq('employee_code', employeeCode)
                .maybeSingle()

            if (roleError) {
                console.warn('⚠️ [Login Flow] Role error:', roleError)
            }

            // 3. Fetch Dynamic Matrix for this Role Level from rbac_matrix table
            let userLevel = roleData?.role_level
            let deptScope = roleData?.dept_scope
            let teamScope = roleData?.team_scope

            // Fallback: Infer role from profile if not in user_roles DB
            if (!userLevel) {
                const pos = profile.current_position || ''
                if (['Giám đốc', 'Phó giám đốc'].includes(pos)) {
                    userLevel = 'BOARD_DIRECTOR'
                } else if (['Trưởng phòng', 'Phó trưởng phòng'].includes(pos)) {
                    userLevel = 'DEPT_HEAD'
                    deptScope = profile.department // Auto-assign scope
                } else if (['Đội trưởng', 'Đội phó', 'Chủ đội', 'Tổ trưởng', 'Tổ phó', 'Chủ tổ'].includes(pos)) {
                    userLevel = 'TEAM_LEADER'
                    teamScope = profile.team // Auto-assign scope
                } else {
                    userLevel = 'STAFF'
                }
                console.log(`   ⚠️ Role not in DB. Inferred '${userLevel}' from position '${pos}'`)
            }
            console.log('   🔐 Role level:', userLevel)

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

        // Special handling removed - Check DB


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
