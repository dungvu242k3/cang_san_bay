import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

function Header({ onMenuToggle, isMenuOpen = false }) {
  const { user } = useAuth()
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


  return (
    <header className={`header ${isMenuOpen ? 'menu-open' : ''}`}>
      <button
        className="mobile-menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="logo" onClick={() => navigate('/dashboard')}>
        <img src="/1.png" alt="ACV Logo" className="logo-img" loading="eager" />
        <div className="logo-text">
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
      </div>
    </header>
  )
}

export default Header
