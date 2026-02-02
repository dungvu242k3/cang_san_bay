import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Profile.css'

function Profile() {
    const { user, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState('info')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    
    // Password change
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [passwordError, setPasswordError] = useState('')
    const [passwordSuccess, setPasswordSuccess] = useState('')

    // Avatar
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarLoading, setAvatarLoading] = useState(false)

    // Login history
    const [loginHistory, setLoginHistory] = useState([])

    useEffect(() => {
        if (user?.profile) {
            setAvatarPreview(user.profile.avatar_url)
        }
        loadLoginHistory()
    }, [user])

    const loadLoginHistory = async () => {
        try {
            // Get auth user to check last sign in
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const history = []
                if (authUser.last_sign_in_at) {
                    history.push({
                        date: new Date(authUser.last_sign_in_at),
                        ip: 'N/A',
                        device: 'N/A'
                    })
                }
                if (authUser.created_at) {
                    history.push({
                        date: new Date(authUser.created_at),
                        ip: 'N/A',
                        device: 'Tài khoản được tạo',
                        isCreation: true
                    })
                }
                setLoginHistory(history.sort((a, b) => b.date - a.date))
            }
        } catch (err) {
            console.error('Error loading login history:', err)
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File ảnh không được vượt quá 5MB')
                return
            }
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleAvatarUpload = async () => {
        if (!avatarFile || !user?.employee_code) return

        try {
            setAvatarLoading(true)
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${user.employee_code}_${Date.now()}.${fileExt}`
            const filePath = fileName

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
                    alert('⚠️ Bucket "avatars" chưa được tạo!\n\nVui lòng:\n1. Mở Supabase Dashboard > SQL Editor\n2. Chạy file: supabase/create_avatars_bucket.sql\n\nHoặc tạo bucket thủ công:\n- Vào Storage > Create bucket\n- Tên: avatars\n- Public: Yes')
                    throw new Error('Bucket avatars chưa tồn tại')
                }
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update employee profile
            const { error: updateError } = await supabase
                .from('employee_profiles')
                .update({ avatar_url: publicUrl })
                .eq('employee_code', user.employee_code)

            if (updateError) throw updateError

            alert('Đã cập nhật avatar thành công!')
            setAvatarFile(null)
            refreshUser()
        } catch (err) {
            console.error('Error uploading avatar:', err)
            if (err.message.includes('Bucket not found') || err.message.includes('not found')) {
                alert('⚠️ Bucket "avatars" chưa được tạo!\n\nVui lòng:\n1. Mở Supabase Dashboard > SQL Editor\n2. Chạy file: supabase/create_avatars_bucket.sql\n\nHoặc tạo bucket thủ công:\n- Vào Storage > Create bucket\n- Tên: avatars\n- Public: Yes')
            } else {
                alert('Lỗi cập nhật avatar: ' + err.message)
            }
        } finally {
            setAvatarLoading(false)
        }
    }

    const hashPassword = async (password) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hash = await crypto.subtle.digest('SHA-256', data)
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    }

    const verifyPassword = async (password, hashedPassword) => {
        if (!hashedPassword || hashedPassword.length < 64) {
            return password === hashedPassword
        }
        const hashed = await hashPassword(password)
        return hashed === hashedPassword
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setPasswordError('')
        setPasswordSuccess('')

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('Vui lòng điền đầy đủ thông tin')
            return
        }

        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp')
            return
        }

        try {
            setSaving(true)

            // Verify current password
            const { data: profile } = await supabase
                .from('employee_profiles')
                .select('password')
                .eq('employee_code', user.employee_code)
                .single()

            if (!profile) {
                setPasswordError('Không tìm thấy thông tin tài khoản')
                setSaving(false)
                return
            }

            const isCurrentPasswordValid = await verifyPassword(currentPassword, profile.password)
            if (!isCurrentPasswordValid) {
                setPasswordError('Mật khẩu hiện tại không đúng')
                setSaving(false)
                return
            }

            // Hash new password (for now, store plain text for compatibility)
            // In production, should hash before storing
            const hashedNewPassword = await hashPassword(newPassword)

            // Update password in database
            const { error } = await supabase
                .from('employee_profiles')
                .update({ password: hashedNewPassword })
                .eq('employee_code', user.employee_code)

            if (error) {
                setPasswordError('Lỗi cập nhật mật khẩu: ' + error.message)
                setSaving(false)
                return
            }

            setPasswordSuccess('Đã đổi mật khẩu thành công!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setSaving(false)
        } catch (err) {
            console.error('Error changing password:', err)
            setPasswordError('Lỗi đổi mật khẩu: ' + err.message)
            setSaving(false)
        }
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    const profile = user.profile || {}

    return (
        <div className="profile-page">
            <div className="page-header">
                <h1><i className="fas fa-user-circle"></i> Tài khoản cá nhân</h1>
                <p>Quản lý thông tin và cài đặt tài khoản của bạn</p>
            </div>

            <div className="profile-container">
                {/* Sidebar */}
                <div className="profile-sidebar">
                    <div className="profile-avatar-section">
                        <div className="avatar-wrapper">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {profile.first_name?.[0] || 'U'}
                                </div>
                            )}
                            <label className="avatar-upload-btn" htmlFor="avatar-input">
                                <i className="fas fa-camera"></i>
                            </label>
                            <input
                                id="avatar-input"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {avatarFile && (
                            <button
                                className="btn-save-avatar"
                                onClick={handleAvatarUpload}
                                disabled={avatarLoading}
                            >
                                {avatarLoading ? 'Đang tải...' : 'Lưu ảnh'}
                            </button>
                        )}
                        <h3>{profile.last_name} {profile.first_name}</h3>
                        <p className="employee-code">{profile.employee_code}</p>
                        <p className="role-badge">{user.role_level}</p>
                    </div>

                    <div className="sidebar-nav">
                        <button
                            className={`nav-item ${activeTab === 'info' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <i className="fas fa-info-circle"></i> Thông tin tài khoản
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                            onClick={() => setActiveTab('password')}
                        >
                            <i className="fas fa-key"></i> Đổi mật khẩu
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <i className="fas fa-history"></i> Lịch sử đăng nhập
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="profile-content">
                    {activeTab === 'info' && (
                        <div className="content-section">
                            <h2>Thông tin tài khoản</h2>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Mã nhân viên</label>
                                    <div className="info-value">{profile.employee_code}</div>
                                </div>
                                <div className="info-item">
                                    <label>Họ và tên</label>
                                    <div className="info-value">{profile.last_name} {profile.first_name}</div>
                                </div>
                                <div className="info-item">
                                    <label>Email ACV</label>
                                    <div className="info-value">{profile.email_acv || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Email cá nhân</label>
                                    <div className="info-value">{profile.email_personal || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Phòng ban</label>
                                    <div className="info-value">{profile.department || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Đội</label>
                                    <div className="info-value">{profile.team || '-'}</div>
                                </div>
                                <div className="info-item">
                                    <label>Vai trò</label>
                                    <div className="info-value">{user.role_level}</div>
                                </div>
                                <div className="info-item">
                                    <label>Tài khoản hệ thống</label>
                                    <div className="info-value">{profile.employee_code}@cangsanbay.local</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'password' && (
                        <div className="content-section">
                            <h2>Đổi mật khẩu</h2>
                            <form onSubmit={handlePasswordChange} className="password-form">
                                <div className="form-group">
                                    <label>Mật khẩu hiện tại</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPasswords.current ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu hiện tại"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        >
                                            <i className={`fas ${showPasswords.current ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        >
                                            <i className={`fas ${showPasswords.new ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            className="toggle-password"
                                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        >
                                            <i className={`fas ${showPasswords.confirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {passwordError && (
                                    <div className="alert alert-error">
                                        <i className="fas fa-exclamation-circle"></i> {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="alert alert-success">
                                        <i className="fas fa-check-circle"></i> {passwordSuccess}
                                    </div>
                                )}

                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="content-section">
                            <h2>Lịch sử đăng nhập</h2>
                            {loginHistory.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-history"></i>
                                    <p>Chưa có lịch sử đăng nhập</p>
                                </div>
                            ) : (
                                <div className="history-list">
                                    {loginHistory.map((item, index) => (
                                        <div key={index} className="history-item">
                                            <div className="history-icon">
                                                <i className={`fas ${item.isCreation ? 'fa-user-plus' : 'fa-sign-in-alt'}`}></i>
                                            </div>
                                            <div className="history-info">
                                                <div className="history-action">
                                                    {item.isCreation ? 'Tài khoản được tạo' : 'Đăng nhập thành công'}
                                                </div>
                                                <div className="history-date">
                                                    {item.date.toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
