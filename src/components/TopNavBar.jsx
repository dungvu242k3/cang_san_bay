import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PERMISSIONS } from '../utils/rbac'
import './TopNavBar.css'

const navItems = [
    { path: '/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard', pKey: PERMISSIONS.DASHBOARD },
    { path: '/cong-viec', icon: 'fas fa-briefcase', label: 'Công việc', pKey: PERMISSIONS.TASKS },
    { path: '/calendar', icon: 'fas fa-calendar-alt', label: 'Lịch', pKey: PERMISSIONS.CALENDAR },
    { path: '/cham-diem', icon: 'fas fa-chart-bar', label: 'Chấm điểm', pKey: PERMISSIONS.GRADING },
    { path: '/leaves', icon: 'fas fa-umbrella-beach', label: 'Nghỉ phép', pKey: PERMISSIONS.LEAVES },
    { path: '/thu-vien', icon: 'fas fa-book', label: 'Thư viện', pKey: null }, // Global
    { path: '/bao-cao', icon: 'fas fa-file-alt', label: 'Báo cáo', pKey: null }, // Global
    { path: '/thao-luan', icon: 'fas fa-comments', label: 'Thảo luận', pKey: null }, // Global - Team discussion
    { path: '/employees', icon: 'fas fa-user', label: 'Hồ sơ', pKey: PERMISSIONS.PROFILES },
    { path: '/to-chuc', icon: 'fas fa-sitemap', label: 'Tổ chức', pKey: PERMISSIONS.ORGANIZATION },
    { path: '/quan-ly-nv', icon: 'fas fa-user-shield', label: 'Quản lý NV', pKey: PERMISSIONS.SETTINGS },
    { path: '/cai-dat', icon: 'fas fa-cog', label: 'Cài đặt', pKey: PERMISSIONS.SETTINGS },
]

function TopNavBar() {
    const location = useLocation()
    const { checkPermission, loading } = useAuth()

    if (loading) return <nav className="top-nav-bar"><div className="top-nav-container"></div></nav>

    return (
        <nav className="top-nav-bar">
            <div className="top-nav-container">
                {navItems.map((item) => {
                    // Nếu có pKey thì check, không thì cho qua (Global)
                    if (item.pKey && !checkPermission(item.pKey)) return null

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `top-nav-item ${isActive || location.pathname.startsWith(item.path) ? 'active' : ''}`
                            }
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </div>
        </nav>
    )
}

export default TopNavBar
