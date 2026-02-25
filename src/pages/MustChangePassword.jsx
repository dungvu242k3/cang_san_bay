import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Login.css'

function MustChangePassword() {
    const navigate = useNavigate()
    const { user, login } = useAuth()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Regex for at least 1 letter, 1 number, and min 6 characters
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (!password) {
                setError('Vui lòng nhập mật khẩu mới')
                setLoading(false)
                return
            }

            if (!passwordRegex.test(password)) {
                setError('Mật khẩu phải dài ít nhất 6 ký tự và bao gồm CẢ chữ và số.')
                setLoading(false)
                return
            }

            if (password !== confirmPassword) {
                setError('Mật khẩu nhập lại không khớp')
                setLoading(false)
                return
            }

            // Get current employee code directly from localStorage 
            // because AuthContext might not have finished setting the user yet on first redirect
            const employeeCode = localStorage.getItem('currentEmployeeCode')

            if (!employeeCode) {
                setError('Mất phiên đăng nhập, vui lòng đăng nhập lại.')
                setLoading(false)
                return;
            }

            // 1. Dùng RPC để băm và lưu mật khẩu
            const { data: successUpdate, error: rpcError } = await supabase.rpc(
                'update_user_password',
                { p_employee_code: employeeCode, p_new_password: password }
            )

            if (rpcError || !successUpdate) {
                console.error('Lỗi khi đổi mật khẩu:', rpcError)
                throw new Error('Lỗi hệ thống khi cập nhật mật khẩu.')
            }

            setSuccess(true)

            // Re-login with the new password to clear the requirePasswordChange flag securely
            await login(employeeCode, password)

            setTimeout(() => {
                navigate('/dashboard', { replace: true })
            }, 2000)

        } catch (err) {
            console.error('Đổi mật khẩu thất bại:', err)
            setError(err.message || 'Đã xảy ra lỗi khi đổi mật khẩu.')
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="login-page">
                <div className="login-container" style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-check-circle" style={{ fontSize: '64px', color: '#2ecc71', marginBottom: '20px' }}></i>
                    <h2 style={{ color: '#2ecc71', marginBottom: '10px' }}>Đổi Mật Khẩu Thành Công!</h2>
                    <p style={{ color: '#2ecc71' }}>Hệ thống đang chuyển hướng tới bảng điều khiển...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header" style={{ background: '#e74c3c', borderRadius: '16px 16px 0 0', padding: '24px', margin: '-48px -48px 24px -48px' }}>
                    <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <i className="fas fa-shield-alt" style={{ fontSize: '48px', color: '#fff', marginBottom: '15px' }}></i>
                        <h2 style={{ margin: 0, color: '#fff', fontWeight: '800', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>BẢO MẬT TÀI KHOẢN</h2>
                        <span style={{ fontSize: '0.9rem', color: '#fmd', fontWeight: 'bold', letterSpacing: '1px' }}>Bạn cần đổi mật khẩu mặc định</span>
                    </div>
                </div>

                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fdf3f2', borderLeft: '4px solid #e74c3c', borderRadius: '4px', color: '#c0392b', fontSize: '0.95rem' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                    Vì lý do bảo mật, bạn bắt buộc phải đổi mật khẩu ở lần đăng nhập đầu tiên.
                </div>

                <div style={{ marginBottom: '24px', padding: '12px 15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef', fontSize: '0.9rem', color: '#495057' }}>
                    <strong>Yêu cầu mật khẩu:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                        <li>Ít nhất <strong>6 ký tự</strong></li>
                        <li>Phải bao gồm <strong>CẢ chữ cái và chữ số</strong></li>
                    </ul>
                </div>

                <form className="login-form" onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="fas fa-lock"></i> Mật khẩu mới
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                autoFocus
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            <i className="fas fa-check-double"></i> Nhập lại mật khẩu mới
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Xác nhận mật khẩu mới"
                                disabled={loading}
                                className={error && error.includes('không khớp') ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                            >
                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: '#e74c3c', backgroundColor: '#fdf3f2', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-small"></div>
                                <span>Đang xử lý...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                <span>Lưu mật khẩu & Đăng nhập</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default MustChangePassword
