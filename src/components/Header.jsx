import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header({ onMenuToggle }) {
  const { user, switchUser, logout } = useAuth()
  const navigate = useNavigate()

  // Determine display name: real name -> email -> 'N/A'
  const displayName = user?.profile?.ho_va_ten || user?.email || 'N/A'
  const initial = displayName.charAt(0).toUpperCase()
  
  const getRoleLabel = (roleLevel) => {
    const roleMap = {
      'SUPER_ADMIN': 'Quản trị viên',
      'BOARD_DIRECTOR': 'Ban Giám đốc',
      'DEPT_HEAD': 'Trưởng phòng',
      'TEAM_LEADER': 'Đội trưởng',
      'STAFF': 'Nhân viên'
    }
    return roleMap[roleLevel] || 'Nhân viên'
  }

  const getRoleBadgeClass = (roleLevel) => {
    const classMap = {
      'SUPER_ADMIN': 'super-admin',
      'BOARD_DIRECTOR': 'board-director',
      'DEPT_HEAD': 'dept-head',
      'TEAM_LEADER': 'team-leader',
      'STAFF': 'staff'
    }
    return classMap[roleLevel] || 'staff'
  }

  const currentRoleLabel = getRoleLabel(user?.role_level)
  const roleBadgeClass = getRoleBadgeClass(user?.role_level)

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout()
      navigate('/login')
    }
  }

  return (
    <header className="header">
      <button 
        className="mobile-menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <i className="fas fa-bars"></i>
      </button>
      <div className="logo" onClick={() => navigate('/dashboard')}>
        <div className="logo-icon">
          <i className="fas fa-plane-departure"></i>
        </div>
        <div className="logo-text">
          <h1>CẢNG HÀNG KHÔNG</h1>
          <span className="subtitle">Quốc Tế</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="identity-switcher">
          <i className="fas fa-user-shield"></i>
          <span className="label">Identity (Demo):</span>
          <select
            value={user?.employee_code || 'ADMIN'}
            onChange={(e) => switchUser(e.target.value)}
          >
            <option value="ADMIN">Admin Hệ Thống (SUPER_ADMIN)</option>
            <option value="CBA0001">Nguyễn Anh (Giám đốc)</option>
            <option value="CBA0004">Lê Dũng (Trưởng phòng KT)</option>
            <option value="CBA0016">Trần Bình (Trưởng phòng KT)</option>
            <option value="CBA0040">Bùi Minh (Nhân viên KT)</option>
          </select>
        </div>
      </div>

      <div className="user-info">
        <div className="user-profile" onClick={() => navigate('/tai-khoan')}>
          <div className="user-details">
            <div className="user-name">{displayName}</div>
            <div className="user-role">
              <span className={`role-badge ${roleBadgeClass}`}>{currentRoleLabel}</span>
            </div>
          </div>
          <div className="user-avatar">
            {user?.profile?.avatar_url ? (
              <img 
                src={user.profile.avatar_url} 
                alt="Avatar"
              />
            ) : (
              initial
            )}
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Đăng xuất"
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  )
}

export default Header
