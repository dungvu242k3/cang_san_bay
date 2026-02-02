import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Header.css'

function Header({ onMenuToggle }) {
  const { user, switchUser, logout } = useAuth()
  const navigate = useNavigate()
  const [demoUsers, setDemoUsers] = useState([])

  useEffect(() => {
    const fetchDemoUsers = async () => {
      const { data } = await supabase
        .from('employee_profiles')
        .select('employee_code, first_name, last_name, current_position, job_title')
        .limit(10)

      if (data && data.length > 0) {
        setDemoUsers(data)
      }
    }
    fetchDemoUsers()
  }, [])

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
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="logo" onClick={() => navigate('/dashboard')}>
        <img src="/1.png" className="logo-img" />
        <div className="logo-text">
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="identity-switcher">
          <i className="fas fa-user-shield"></i>
          <span className="label">Identity (Demo):</span>
          <select
            value={user?.employee_code || ''}
            onChange={(e) => switchUser(e.target.value)}
          >
            <option value="">-- Chọn Identity --</option>
            {demoUsers.map(u => (
              <option key={u.employee_code} value={u.employee_code}>
                {u.last_name} {u.first_name} ({u.current_position || 'Nhân viên'})
              </option>
            ))}
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
