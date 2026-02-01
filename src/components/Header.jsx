import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Header() {
  const { user, switchUser } = useAuth()
  const navigate = useNavigate()

  // Determine display name: real name -> email -> 'N/A'
  const displayName = user?.profile?.ho_va_ten || user?.email || 'N/A'
  const initial = displayName.charAt(0).toUpperCase()
  const currentRoleLabel = user?.role_level === 'SUPER_ADMIN' ? 'Quản trị viên' : user?.role_level || 'Nhân viên'

  const handleLogout = () => {
    switchUser('ADMIN')
    alert('Đã reset về tài khoản Admin mặc định')
  }

  return (
    <header className="header">
      <div className="logo">
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#fff',
          marginRight: '15px'
        }}>
          <i className="fas fa-plane-departure"></i>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: '1.4rem', margin: 0, lineHeight: 1 }}>CẢNG HÀNG KHÔNG</h1>
          <span style={{ fontSize: '0.8rem', opacity: 0.8, letterSpacing: '2px', textTransform: 'uppercase' }}>Quốc Tế</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div className="identity-switcher" style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <i className="fas fa-user-shield" style={{ color: '#ffd700' }}></i>
          <span style={{ color: '#fff', opacity: 0.8 }}>Identity (Demo):</span>
          <select
            style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
            value={user?.employee_code || 'ADMIN'}
            onChange={(e) => switchUser(e.target.value)}
          >
            <option value="ADMIN" style={{ color: '#000' }}>Admin Hệ Thống (SUPER_ADMIN)</option>
            <option value="CBA0001" style={{ color: '#000' }}>Nguyễn Anh (Giám đốc)</option>
            <option value="CBA0004" style={{ color: '#000' }}>Lê Dũng (Trưởng phòng KT)</option>
            <option value="CBA0016" style={{ color: '#000' }}>Trần Bình (Trưởng phòng KT)</option>
            <option value="CBA0040" style={{ color: '#000' }}>Bùi Minh (Nhân viên KT)</option>
          </select>
        </div>
      </div>

      <div className="user-info" style={{ gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600' }}>{displayName}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{currentRoleLabel}</div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            {initial}
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Đăng xuất"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,0,0,0.4)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </header>
  )
}

export default Header

