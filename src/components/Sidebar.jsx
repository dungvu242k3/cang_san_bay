import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-home', label: 'Tổng quan' },
    { path: '/employees', icon: 'fas fa-users', label: 'Danh sách nhân viên' }
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <i className="fas fa-layer-group"></i>
        <span>HRM Cảng Hàng Không</span>
      </div>

      {menuItems.map(item => {
        // Handle external or special links if needed, logic from before
        const isExternal = item.path.startsWith('http');

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </aside>
  )
}

export default Sidebar
