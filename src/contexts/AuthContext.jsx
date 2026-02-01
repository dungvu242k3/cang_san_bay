import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    // Luôn luôn có user (Bỏ qua đăng nhập)
    const [user] = useState({
        id: 'mock-user-id',
        email: 'admin@cangsanbay.local',
        role: 'admin',
        profile: {
            employee_code: 'ADMIN',
            first_name: 'Admin',
            last_name: 'System',
            job_title: 'Administrator'
        }
    })

    const login = async () => true
    const logout = async () => { }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading: false }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
