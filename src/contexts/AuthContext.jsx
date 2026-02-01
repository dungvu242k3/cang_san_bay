import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { canPerformAction, canViewPage } from '../utils/rbac'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchUserRole()
    }, [])

    const fetchUserRole = async () => {
        try {
            setLoading(true)
            const loggedInCode = localStorage.getItem('userCode') || 'ADMIN'

            // 1. Fetch Profile
            const { data: profile } = await supabase
                .from('employee_profiles')
                .select('*')
                .eq('employee_code', loggedInCode)
                .single()

            // 2. Fetch Assigned Role & Scope
            const { data: roleData } = await supabase
                .from('user_roles')
                .select('*')
                .eq('employee_code', loggedInCode)
                .single()

            // 3. Fetch Dynamic Matrix for this Role Level
            const userLevel = roleData?.role_level || 'STAFF'

            const { data: permissionMatrix } = await supabase
                .from('rbac_matrix')
                .select('*')
                .eq('role_level', userLevel)

            if (profile) {
                setUser({
                    id: profile.id,
                    email: profile.email_acv,
                    employee_code: profile.employee_code,
                    role_level: userLevel,
                    dept_scope: roleData?.dept_scope,
                    team_scope: roleData?.team_scope,
                    permissions: permissionMatrix || [], // Store full matrix here
                    profile: {
                        ...profile,
                        ho_va_ten: `${profile.last_name} ${profile.first_name}`
                    }
                })
            }
            setLoading(false)
        } catch (err) {
            console.error("Error fetching user role:", err)
            setLoading(false)
        }
    }

    const checkPermission = (page) => canViewPage(user, page)
    const checkAction = (action, target) => canPerformAction(user, action, target)

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            checkPermission,
            checkAction,
            refreshUser: fetchUserRole,
            switchUser: (code) => {
                localStorage.setItem('userCode', code)
                fetchUserRole()
            }
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
