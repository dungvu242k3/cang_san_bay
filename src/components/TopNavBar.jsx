import { NavLink, useLocation } from 'react-router-dom'
import './TopNavBar.css'

const navItems = [
    { path: '/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard' },
    { path: '/cong-viec', icon: 'fas fa-briefcase', label: 'Công việc' },
    { path: '/lich', icon: 'fas fa-calendar-alt', label: 'Lịch' },
    { path: '/cham-diem', icon: 'fas fa-chart-bar', label: 'Chấm điểm' },
    { path: '/nghi-phep', icon: 'fas fa-umbrella-beach', label: 'Nghỉ phép' },
    { path: '/thu-vien', icon: 'fas fa-book', label: 'Thư viện' },
    { path: '/bao-cao', icon: 'fas fa-file-alt', label: 'Báo cáo' },
    { path: '/employees', icon: 'fas fa-user', label: 'Hồ sơ' },
    { path: '/to-chuc', icon: 'fas fa-sitemap', label: 'Tổ chức' },
    { path: '/cai-dat', icon: 'fas fa-cog', label: 'Cài đặt' },
]

function TopNavBar() {
    const location = useLocation()

    return (
        <nav className="top-nav-bar">
            <div className="top-nav-container">
                {navItems.map((item) => (
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
                ))}
            </div>
        </nav>
    )
}

export default TopNavBar
