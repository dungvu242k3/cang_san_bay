import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, user } = useAuth()
    const [employeeCode, setEmployeeCode] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        // Check if already logged in
        if (user) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!employeeCode.trim()) {
                setError('Vui lòng nhập mã nhân viên')
                setLoading(false)
                return
            }

            if (!password) {
                setError('Vui lòng nhập mật khẩu')
                setLoading(false)
                return
            }

            await login(employeeCode.trim().toUpperCase(), password)

            const from = location.state?.from?.pathname || '/dashboard'
            navigate(from, { replace: true })
        } catch (err) {
            console.error('Login error:', err)
            if (err.message?.includes('Invalid login credentials')) {
                setError('Mã nhân viên hoặc mật khẩu không đúng')
            } else {
                setError(err.message || 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.')
            }
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header" style={{ background: '#1e3e72', borderRadius: '16px 16px 0 0', padding: '24px', margin: '-48px -48px 24px -48px' }}>
                    <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="/1.png" alt="ACV Logo" loading="eager" style={{ height: '80px', width: 'auto', marginBottom: '15px' }} />
                        <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.4rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>CẢNG HÀNG KHÔNG</h2>
                        <span style={{ fontSize: '0.9rem', color: '#fdb813', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}>Quốc Tế</span>
                    </div>
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="employeeCode">
                            <i className="fas fa-user"></i> Mã nhân viên
                        </label>
                        <input
                            id="employeeCode"
                            type="text"
                            value={employeeCode}
                            onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                            placeholder="Nhập mã nhân viên"
                            autoFocus
                            disabled={loading}
                            className={error ? 'error' : ''}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fas fa-lock"></i> Mật khẩu
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                disabled={loading}
                                className={error ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-small"></div>
                                <span>Đang đăng nhập...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Đăng nhập</span>
                            </>
                        )}
                    </button>

                    <div className="login-footer">
                        <p className="forgot-password">
                            Quên mật khẩu? <span>Liên hệ Admin để reset</span>
                        </p>
                    </div>
                </form>

                {/* Thông tin đăng nhập mặc định */}
                <div className="login-credentials">
                    <div className="credentials-header">
                        <i className="fas fa-key"></i>
                        <span>Thông tin đăng nhập mặc định</span>
                    </div>
                    <div className="credentials-list">
                        <div className="credential-item">
                            <div className="credential-role">
                                <i className="fas fa-user-shield"></i>
                                <span>Admin (Quản trị viên)</span>
                            </div>
                            <div className="credential-details">
                                <div className="credential-row">
                                    <span className="label">Mã nhân viên:</span>
                                    <span className="value" onClick={() => setEmployeeCode('ADMIN')} style={{ cursor: 'pointer' }}>ADMIN</span>
                                </div>
                                <div className="credential-row">
                                    <span className="label">Mật khẩu:</span>
                                    <span className="value" onClick={() => setPassword('123456')} style={{ cursor: 'pointer' }}>123456</span>
                                </div>
                            </div>
                        </div>
                        <div className="credential-item">
                            <div className="credential-role">
                                <i className="fas fa-user-tie"></i>
                                <span>Nhân viên mẫu</span>
                            </div>
                            <div className="credential-details">
                                <div className="credential-row">
                                    <span className="label">Mã nhân viên:</span>
                                    <span className="value" onClick={() => setEmployeeCode('CBA0001')} style={{ cursor: 'pointer' }}>CBA0001</span>
                                </div>
                                <div className="credential-row">
                                    <span className="label">Mật khẩu:</span>
                                    <span className="value" onClick={() => setPassword('123456')} style={{ cursor: 'pointer' }}>123456</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="credentials-note">
                        <i className="fas fa-info-circle"></i>
                        Click vào mã nhân viên hoặc mật khẩu để tự động điền
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
