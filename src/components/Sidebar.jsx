import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ className = '', onLinkClick }) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { path: '/ho-so-cua-toi', icon: 'fas fa-user', label: 'Hồ sơ của tôi' },
    { path: '/employees', icon: 'fas fa-users', label: 'Danh sách nhân viên' },
    { path: '/quan-ly-nv', icon: 'fas fa-user-cog', label: 'Quản lý NV (Admin)' },
    { path: '/cau-truc-ho-so', icon: 'fas fa-folder-open', label: 'Cấu trúc hồ sơ (Admin)' }
  ]

  const handleLinkClick = () => {
    // Close mobile menu when link is clicked
    if (window.innerWidth <= 768 && onLinkClick) {
      onLinkClick()
    }
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Menu</span>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={item.label}
            onClick={handleLinkClick}
          >
            <i className={item.icon}></i>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
