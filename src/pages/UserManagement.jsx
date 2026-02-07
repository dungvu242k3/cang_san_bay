import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchableDropdown from '../components/SearchableDropdown'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './UserManagement.css'

function UserManagement() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('')
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showUserModal, setShowUserModal] = useState(false)
    const [modalMode, setModalMode] = useState('view') // 'view' or 'edit'
    const [editingRole, setEditingRole] = useState('')

    useEffect(() => {
        loadEmployees()
    }, [])

    const loadEmployees = async () => {
        try {
            setLoading(true)

            // 1. Fetch Profiles
            const { data: profiles, error: profileError } = await supabase
                .from('employee_profiles')
                .select(`
                    id,
                    employee_code,
                    first_name,
                    last_name,
                    email_acv,
                    email_personal,
                    department,
                    team,
                    password,
                    current_position
                `)
                .order('employee_code')

            if (profileError) throw profileError

            // 2. Fetch All Roles
            const { data: allRoles, error: rolesError } = await supabase
                .from('user_roles')
                .select('employee_code, role_level')

            if (rolesError) throw rolesError

            // Create a lookup map for roles
            const roleMap = {}
            if (allRoles) {
                allRoles.forEach(r => {
                    roleMap[r.employee_code] = r.role_level
                })
            }

            // 3. Merge Data
            const employeesWithAuth = (profiles || []).map(emp => {
                // ALWAYS infer role from current_position first
                const pos = (emp.current_position || '').toLowerCase()
                let role = 'STAFF' // default

                // Use flexible matching with includes()
                if (pos.includes('giám đốc') && !pos.includes('phó')) {
                    role = 'BOARD_DIRECTOR'
                } else if (pos.includes('phó giám đốc')) {
                    role = 'BOARD_DIRECTOR'
                } else if (pos.includes('trưởng phòng') && !pos.includes('phó')) {
                    role = 'DEPT_HEAD'
                } else if (pos.includes('phó trưởng phòng')) {
                    role = 'DEPT_HEAD'
                } else if (pos.includes('đội trưởng') || pos.includes('tổ trưởng') || pos.includes('chủ đội') || pos.includes('chủ tổ')) {
                    role = 'TEAM_LEADER'
                } else if (pos.includes('đội phó') || pos.includes('tổ phó')) {
                    role = 'TEAM_LEADER'
                }

                // ONLY override if user_roles has SUPER_ADMIN (for special admin accounts)
                if (roleMap[emp.employee_code] === 'SUPER_ADMIN') {
                    role = 'SUPER_ADMIN'
                }

                return {
                    ...emp,
                    hasAccount: !!emp.password, // Check if password exists
                    authInfo: emp.password ? {
                        hasPassword: true
                    } : null,
                    role: role
                }
            })

            // Sort by role priority
            const roleOrder = {
                'SUPER_ADMIN': 1,
                'BOARD_DIRECTOR': 2,
                'DEPT_HEAD': 3,
                'TEAM_LEADER': 4,
                'STAFF': 5
            }

            employeesWithAuth.sort((a, b) => {
                const orderA = roleOrder[a.role] || 99
                const orderB = roleOrder[b.role] || 99

                if (orderA !== orderB) {
                    return orderA - orderB
                }

                // Tie-breaker for same role: 'Giám đốc' comes before 'Phó giám đốc'
                const posA = (a.current_position || '').toLowerCase()
                const posB = (b.current_position || '').toLowerCase()

                if (posA.includes('phó') && !posB.includes('phó')) return 1
                if (!posA.includes('phó') && posB.includes('phó')) return -1

                return 0
            })

            setEmployees(employeesWithAuth)
            setLoading(false)
        } catch (err) {
            console.error('Error loading employees:', err)
            setLoading(false)
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

    const handleCreateAccount = async (employee) => {
        try {
            const defaultPassword = '123456'
            const hashedPassword = await hashPassword(defaultPassword)

            // Update password in employee_profiles
            const { error } = await supabase
                .from('employee_profiles')
                .update({ password: hashedPassword })
                .eq('employee_code', employee.employee_code)

            if (error) throw error

            alert(`Đã tạo tài khoản cho ${employee.employee_code}!\nMật khẩu mặc định: ${defaultPassword}`)
            loadEmployees()
        } catch (err) {
            console.error('Error creating account:', err)
            alert('Lỗi tạo tài khoản: ' + err.message)
        }
    }

    const handleResetPassword = (employee) => {
        setSelectedEmployee(employee)
        setNewPassword('')
        setConfirmPassword('')
        setShowPasswordModal(true)
    }

    const handleSavePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp')
            return
        }

        try {
            if (!selectedEmployee?.employee_code) {
                alert('Nhân viên không hợp lệ')
                return
            }

            // Hash password
            const hashedPassword = await hashPassword(newPassword)

            // Update password in database
            const { error } = await supabase
                .from('employee_profiles')
                .update({ password: hashedPassword })
                .eq('employee_code', selectedEmployee.employee_code)

            if (error) throw error

            alert('Đã đặt lại mật khẩu thành công!')
            setShowPasswordModal(false)
            setSelectedEmployee(null)
            setNewPassword('')
            setConfirmPassword('')
            loadEmployees()
        } catch (err) {
            console.error('Error resetting password:', err)
            alert('Lỗi đặt lại mật khẩu: ' + err.message)
        }
    }

    const handleDeleteAccount = async (employee) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản của ${employee.employee_code}?`)) {
            return
        }

        try {
            if (!employee.employee_code) {
                alert('Nhân viên không hợp lệ')
                return
            }

            // Remove password from database (disable account)
            const { error } = await supabase
                .from('employee_profiles')
                .update({ password: null })
                .eq('employee_code', employee.employee_code)

            if (error) throw error

            alert('Đã xóa tài khoản thành công!')
            loadEmployees()
        } catch (err) {
            console.error('Error deleting account:', err)
            alert('Lỗi xóa tài khoản: ' + err.message)
        }
    }

    const handleViewUser = (employee) => {
        setSelectedEmployee(employee)
        setModalMode('view')
        setShowUserModal(true)
    }

    const handleEditUser = (employee) => {
        setSelectedEmployee(employee)
        setEditingRole(employee.role)
        setModalMode('edit')
        setShowUserModal(true)
    }

    const handleUpdateRole = async () => {
        if (!selectedEmployee) return

        try {
            // Check if role entry exists
            const { data: existingRole } = await supabase
                .from('user_roles')
                .select('id')
                .eq('employee_code', selectedEmployee.employee_code)
                .maybeSingle()

            // Calculate scopes based on the NEW role
            let deptScope = null
            let teamScope = null

            // Logic: Assign scopes based on the Employee's current Department/Team
            if (editingRole === 'DEPT_HEAD') {
                deptScope = selectedEmployee.department
            } else if (editingRole === 'TEAM_LEADER') {
                deptScope = selectedEmployee.department
                teamScope = selectedEmployee.team
            }

            const roleData = {
                employee_code: selectedEmployee.employee_code,
                role_level: editingRole,
                dept_scope: deptScope,
                team_scope: teamScope,
                updated_at: new Date().toISOString()
            }

            let error;

            if (existingRole) {
                // Update existing rule
                const { error: updateError } = await supabase
                    .from('user_roles')
                    .update({
                        role_level: editingRole,
                        dept_scope: deptScope,
                        team_scope: teamScope
                    })
                    .eq('employee_code', selectedEmployee.employee_code)
                error = updateError
            } else {
                // Insert new rule
                const { error: insertError } = await supabase
                    .from('user_roles')
                    .insert(roleData)
                error = insertError
            }

            if (error) throw error

            alert(`Đã cập nhật vai trò: ${getRoleLabel(editingRole)}\nPhạm vi: ${deptScope || 'Toàn bộ'} / ${teamScope || '-'}`)
            setShowUserModal(false)
            loadEmployees() // Refresh list to update UI
        } catch (err) {
            console.error('Error updating role:', err)
            alert('Lỗi cập nhật vai trò: ' + err.message)
        }
    }
    const handleUpdateDepartment = async (employee, newDept) => {
        try {
            const { error } = await supabase
                .from('employee_profiles')
                .update({
                    department: newDept,
                    bo_phan: newDept // Update both fields to be safe
                })
                .eq('employee_code', employee.employee_code)

            if (error) throw error

            // Optimistic update
            setEmployees(prev => prev.map(emp =>
                emp.employee_code === employee.employee_code
                    ? { ...emp, department: newDept }
                    : emp
            ))
        } catch (err) {
            console.error('Error updating department:', err)
            alert('Lỗi cập nhật phòng ban: ' + err.message)
            loadEmployees() // Revert on error
        }
    }

    const handleUpdateTeam = async (employee, newTeam) => {
        try {
            const { error } = await supabase
                .from('employee_profiles')
                .update({
                    team: newTeam,
                    doi: newTeam // Update both fields if needed (assuming 'doi' might be used loosely)
                })
                .eq('employee_code', employee.employee_code)

            if (error) throw error

            // Optimistic update
            setEmployees(prev => prev.map(emp =>
                emp.employee_code === employee.employee_code
                    ? { ...emp, team: newTeam }
                    : emp
            ))
        } catch (err) {
            console.error('Error updating team:', err)
            alert('Lỗi cập nhật đội: ' + err.message)
            loadEmployees() // Revert on error
        }
    }

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${emp.last_name} ${emp.first_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = !filterRole || emp.role === filterRole
        return matchesSearch && matchesRole
    })

    // Get unique departments and teams for dropdowns
    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))].sort()
    const teams = [...new Set(employees.map(e => e.team).filter(Boolean))].sort()

    const getRoleLabel = (role) => {
        const labels = {
            'SUPER_ADMIN': 'Siêu quản trị',
            'BOARD_DIRECTOR': 'Giám đốc',
            'DEPT_HEAD': 'Trưởng phòng',
            'TEAM_LEADER': 'Đội trưởng',
            'STAFF': 'Nhân viên'
        }
        return labels[role] || role
    }

    if (loading) {
        return (
            <div className="user-management-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="user-management-page">
            <div className="page-header">
                <h1><i className="fas fa-user-shield"></i> Quản lý tài khoản</h1>
                <p>Quản lý tài khoản và mật khẩu nhân viên</p>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc tên nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="SUPER_ADMIN">Siêu quản trị</option>
                    <option value="BOARD_DIRECTOR">Ban giám đốc</option>
                    <option value="DEPT_HEAD">Trưởng phòng</option>
                    <option value="TEAM_LEADER">Đội trưởng</option>
                    <option value="STAFF">Nhân viên</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Mã NV</th>
                            <th>Họ tên</th>
                            <th>Phòng/Đội</th>
                            <th>Vai trò</th>
                            <th>Email</th>
                            <th>Trạng thái</th>
                            <th>Đăng nhập cuối</th>
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center empty-state">
                                    Không tìm thấy nhân viên nào
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td className="font-weight-bold">{emp.employee_code}</td>
                                    <td>{emp.last_name} {emp.first_name}</td>
                                    <td style={{ minWidth: '250px' }}>
                                        <div className="dept-team-edit">
                                            <div style={{ marginBottom: '5px' }}>
                                                <SearchableDropdown
                                                    options={departments}
                                                    value={emp.department}
                                                    onChange={(val) => handleUpdateDepartment(emp, val)}
                                                    placeholder="Chọn phòng ban..."
                                                    allowCustom={true}
                                                />
                                            </div>
                                            <div>
                                                <SearchableDropdown
                                                    options={teams}
                                                    value={emp.team}
                                                    onChange={(val) => handleUpdateTeam(emp, val)}
                                                    placeholder="Chọn đội..."
                                                    allowCustom={true}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="role-display">
                                            <span className={`role-badge role-${emp.role.toLowerCase()}`}>
                                                {getRoleLabel(emp.role)}
                                            </span>
                                            {emp.current_position && emp.current_position !== getRoleLabel(emp.role) && (
                                                <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem', display: 'block' }}>
                                                    {emp.current_position}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {emp.hasAccount ? (
                                            <span className="email-text">{emp.authInfo.email}</span>
                                        ) : (
                                            <span className="text-muted">Chưa có tài khoản</span>
                                        )}
                                    </td>
                                    <td>
                                        {emp.hasAccount ? (
                                            <span className={`status-badge ${emp.authInfo.confirmed ? 'status-active' : 'status-pending'}`}>
                                                <i className="fas fa-check-circle"></i> {emp.authInfo.confirmed ? 'Đã kích hoạt' : 'Chờ kích hoạt'}
                                            </span>
                                        ) : (
                                            <span className="status-badge status-inactive">
                                                <i className="fas fa-times-circle"></i> Chưa tạo
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {emp.hasAccount && emp.authInfo.lastSignIn ? (
                                            <span className="last-login">
                                                {new Date(emp.authInfo.lastSignIn).toLocaleString('vi-VN')}
                                            </span>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-view"
                                                onClick={() => handleViewUser(emp)}
                                                title="Xem thông tin tài khoản"
                                            >
                                                <i className="fas fa-eye"></i> Xem
                                            </button>
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEditUser(emp)}
                                                title="Phân quyền / Sửa vai trò"
                                            >
                                                <i className="fas fa-edit"></i> Sửa
                                            </button>
                                            {!emp.hasAccount ? (
                                                <button
                                                    className="btn-action btn-create"
                                                    onClick={() => handleCreateAccount(emp)}
                                                    title="Tạo tài khoản"
                                                >
                                                    <i className="fas fa-user-plus"></i> Tạo
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn-action btn-reset"
                                                        onClick={() => handleResetPassword(emp)}
                                                        title="Đặt lại mật khẩu"
                                                    >
                                                        <i className="fas fa-key"></i> Đặt lại
                                                    </button>
                                                    <button
                                                        className="btn-action btn-delete"
                                                        onClick={() => handleDeleteAccount(emp)}
                                                        title="Xóa tài khoản"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Details / Role Edit Modal */}
            {showUserModal && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <i className={`fas ${modalMode === 'edit' ? 'fa-user-cog' : 'fa-id-badge'}`}></i>
                                {modalMode === 'edit' ? 'Phân quyền tài khoản' : 'Thông tin tài khoản'}
                            </h2>
                            <button className="close-btn" onClick={() => setShowUserModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="user-info-card">
                                <div className="info-row">
                                    <span className="label">Nhân viên:</span>
                                    <span className="value"><strong>{selectedEmployee.employee_code}</strong> - {selectedEmployee.last_name} {selectedEmployee.first_name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Phòng ban:</span>
                                    <span className="value">{selectedEmployee.department || '-'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Vị trí:</span>
                                    <span className="value">{selectedEmployee.current_position || '-'}</span>
                                </div>
                            </div>

                            {modalMode === 'edit' ? (
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>Vai trò hệ thống (Phân quyền)</label>
                                    <select
                                        className="form-input"
                                        value={editingRole}
                                        onChange={(e) => setEditingRole(e.target.value)}
                                    >
                                        <option value="SUPER_ADMIN">Siêu quản trị (Super Admin)</option>
                                        <option value="BOARD_DIRECTOR">Ban giám đốc (Director)</option>
                                        <option value="DEPT_HEAD">Trưởng phòng (Department Head)</option>
                                        <option value="TEAM_LEADER">Đội trưởng (Team Leader)</option>
                                        <option value="STAFF">Nhân viên (Staff)</option>
                                    </select>
                                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
                                        <i className="fas fa-info-circle"></i> Việc thay đổi vai trò sẽ ảnh hưởng đến quyền hạn truy cập dữ liệu của nhân viên này trên toàn hệ thống.
                                    </p>
                                </div>
                            ) : (
                                <div className="account-details-view" style={{ marginTop: '20px' }}>
                                    <div className="info-row">
                                        <span className="label">Tên đăng nhập:</span>
                                        <span className="value" style={{ fontWeight: 'bold', color: '#0d6efd', fontSize: '1.1rem' }}>
                                            {selectedEmployee.employee_code}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Vai trò hiện tại:</span>
                                        <span className={`role-badge role-${selectedEmployee.role?.toLowerCase()}`}>
                                            {getRoleLabel(selectedEmployee.role)}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Trạng thái:</span>
                                        {selectedEmployee.hasAccount ? (
                                            <span className={`status-badge ${selectedEmployee.authInfo?.confirmed ? 'status-active' : 'status-pending'}`}>
                                                Đã kích hoạt
                                            </span>
                                        ) : (
                                            <span className="status-badge status-inactive">Chưa có tài khoản</span>
                                        )}
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Mật khẩu:</span>
                                        <span className="value" style={{ fontFamily: 'monospace', color: '#6c757d', letterSpacing: '2px' }}>
                                            {selectedEmployee.hasAccount ? '••••••••' : 'Chưa thiết lập'}
                                        </span>
                                        {selectedEmployee.hasAccount && (
                                            <span style={{ fontSize: '0.8rem', color: '#dc3545', marginLeft: '8px', fontStyle: 'italic' }}>
                                                (Đã mã hóa)
                                            </span>
                                        )}
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Đăng nhập lần cuối:</span>
                                        <span className="value last-login">
                                            {selectedEmployee.hasAccount && selectedEmployee.authInfo?.lastSignIn
                                                ? new Date(selectedEmployee.authInfo.lastSignIn).toLocaleString('vi-VN')
                                                : 'Chưa bao giờ'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                                Đóng
                            </button>
                            {modalMode === 'view' && selectedEmployee.hasAccount && (
                                <button className="btn btn-reset" onClick={() => {
                                    setShowUserModal(false);
                                    handleResetPassword(selectedEmployee);
                                }}>
                                    <i className="fas fa-key"></i> Đặt lại mật khẩu
                                </button>
                            )}
                            {modalMode === 'edit' && (
                                <button className="btn btn-primary" onClick={handleUpdateRole}>
                                    <i className="fas fa-save"></i> Lưu thay đổi
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                <i className="fas fa-key"></i> Đặt lại mật khẩu
                            </h2>
                            <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nhân viên</label>
                                <div className="employee-info">
                                    <strong>{selectedEmployee.employee_code}</strong> - {selectedEmployee.last_name} {selectedEmployee.first_name}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Mật khẩu mới <span className="text-danger">*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClick={handleSavePassword}>
                                <i className="fas fa-save"></i> Lưu mật khẩu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManagement
