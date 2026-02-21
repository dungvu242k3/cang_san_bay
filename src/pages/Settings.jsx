import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { PERMISSIONS } from '../utils/rbac'
import './Settings.css'

const ROLE_OPTIONS = [
    { value: 'SUPER_ADMIN', label: 'Cấp 1: Super Admin' },
    { value: 'BOARD_DIRECTOR', label: 'Cấp 2: Ban giám đốc' },
    { value: 'DEPT_HEAD', label: 'Cấp 3: Trưởng phòng' },
    { value: 'TEAM_LEADER', label: 'Cấp 4: Trưởng đội' },
    { value: 'STAFF', label: 'Cấp 5: Nhân viên' }
]

const MODULES = [
    { key: PERMISSIONS.DASHBOARD, label: 'Dashboard' },
    { key: PERMISSIONS.TASKS, label: 'Công việc' },
    { key: PERMISSIONS.CALENDAR, label: 'Lịch' },
    { key: PERMISSIONS.GRADING, label: 'Chấm điểm' },
    { key: PERMISSIONS.LEAVES, label: 'Nghỉ phép' },
    { key: PERMISSIONS.PROFILES, label: 'Hồ sơ' },
    { key: PERMISSIONS.ORGANIZATION, label: 'Tổ chức' },
    { key: PERMISSIONS.SETTINGS, label: 'Cài đặt' },
    { key: PERMISSIONS.LIBRARY, label: 'Thư viện' }
]

function Settings() {
    const { user, checkAction } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('roles') // 'roles', 'matrix', or 'leaves'
    const [employees, setEmployees] = useState([])
    const [rolesMap, setRolesMap] = useState({})
    const [matrix, setMatrix] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState(null)
    const [departments, setDepartments] = useState([])
    const [teams, setTeams] = useState([])
    const [leaveSettings, setLeaveSettings] = useState([])
    const [editingLeaveSetting, setEditingLeaveSetting] = useState(null)
    const [newLeaveSetting, setNewLeaveSetting] = useState({ department: '', annual_leave_days: 12, description: '' })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        if (!checkAction('view', { module: 'settings' })) {
            navigate('/')
            return
        }
        try {
            setLoading(true)

            // 1. Fetch Employees
            const { data: empData } = await supabase
                .from('employee_profiles')
                .select('employee_code, first_name, last_name, department, team, group_name, current_position')
                .range(0, 5000)

            // 2. Fetch Assigned Roles (only for SUPER_ADMIN override)
            const { data: roleData } = await supabase.from('user_roles').select('*')

            // 3. Fetch Matrix
            const { data: matrixData } = await supabase.from('rbac_matrix').select('*')

            // Helper function to infer role from current_position
            const inferRoleFromPosition = (position) => {
                const pos = (position || '').toLowerCase()
                if (pos.includes('giám đốc') && !pos.includes('phó')) {
                    return 'BOARD_DIRECTOR'
                } else if (pos.includes('phó giám đốc')) {
                    return 'BOARD_DIRECTOR'
                } else if (pos.includes('trưởng phòng') && !pos.includes('phó')) {
                    return 'DEPT_HEAD'
                } else if (pos.includes('phó trưởng phòng')) {
                    return 'DEPT_HEAD'
                } else if (pos.includes('đội trưởng') || pos.includes('tổ trưởng') || pos.includes('chủ đội') || pos.includes('chủ tổ')) {
                    return 'TEAM_LEADER'
                } else if (pos.includes('đội phó') || pos.includes('tổ phó')) {
                    return 'TEAM_LEADER'
                } else {
                    return 'STAFF'
                }
            }

            // Build Roles Map: Infer from position, override with SUPER_ADMIN only
            const superAdminSet = new Set()
            if (roleData) {
                roleData.forEach(r => {
                    if (r.role_level === 'SUPER_ADMIN') {
                        superAdminSet.add(r.employee_code)
                    }
                })
            }

            // Build role map based on current_position with SUPER_ADMIN override
            const rMap = {}
            if (empData) {
                empData.forEach(emp => {
                    let inferredRole = inferRoleFromPosition(emp.current_position)

                    // Override with SUPER_ADMIN if set in user_roles
                    if (superAdminSet.has(emp.employee_code)) {
                        inferredRole = 'SUPER_ADMIN'
                    }

                    // Find existing user_roles entry for scope data
                    const existingRole = roleData?.find(r => r.employee_code === emp.employee_code)

                    rMap[emp.employee_code] = {
                        employee_code: emp.employee_code,
                        role_level: inferredRole,
                        dept_scope: existingRole?.dept_scope || emp.department,
                        team_scope: existingRole?.team_scope || emp.team
                    }
                })
            }
            setRolesMap(rMap)
            setMatrix(matrixData || [])

            // Hierarchical Sorting Logic using rMap
            const roleOrder = {
                'SUPER_ADMIN': 1,
                'BOARD_DIRECTOR': 2,
                'DEPT_HEAD': 3,
                'TEAM_LEADER': 4,
                'STAFF': 5
            }

            const sortedData = (empData || []).sort((a, b) => {
                const levelA = rMap[a.employee_code]?.role_level || 'STAFF'
                const levelB = rMap[b.employee_code]?.role_level || 'STAFF'

                if (levelA !== levelB) {
                    return (roleOrder[levelA] || 99) - (roleOrder[levelB] || 99)
                }
                // If same level, sort by last name
                return (a.last_name || '').localeCompare(b.last_name || '')
            })

            setEmployees(sortedData)

            if (empData) {
                const uniqueDepts = [...new Set(empData.map(e => e.department).filter(Boolean))].sort()
                const uniqueTeams = [...new Set(empData.map(e => e.team).filter(Boolean))].sort()
                setDepartments(uniqueDepts)
                setTeams(uniqueTeams)
            }

            // 4. Fetch Leave Settings
            const { data: leaveData } = await supabase
                .from('department_leave_settings')
                .select('*')
                .order('department')

            setLeaveSettings(leaveData || [])

            setLoading(false)
        } catch (err) {
            console.error("Error fetching settings data:", err)
            setLoading(false)
        }
    }

    const handleUpdateUserRole = async (empCode, updates) => {
        if (!checkAction('edit', { module: 'settings' })) {
            alert('Bạn không có quyền sửa cài đặt!')
            return
        }
        try {
            setSaving(empCode)
            const existing = rolesMap[empCode]
            const payload = { employee_code: empCode, ...updates, updated_at: new Date().toISOString() }

            const { error } = existing
                ? await supabase.from('user_roles').update(payload).eq('employee_code', empCode)
                : await supabase.from('user_roles').insert([payload])

            if (error) throw error
            setRolesMap(prev => ({ ...prev, [empCode]: { ...(prev[empCode] || {}), ...payload } }))
            setSaving(null)
        } catch (err) { alert(err.message); setSaving(null); }
    }

    const handleUpdateMatrix = async (roleLevel, moduleKey, field, value) => {
        if (!checkAction('edit', { module: 'settings' })) {
            alert('Bạn không có quyền sửa phân quyền!')
            return
        }
        if (roleLevel === 'SUPER_ADMIN') return // Always full access for super admin

        // 1. Optimistic Update
        const oldMatrix = [...matrix]
        const newMatrix = [...matrix]
        const idx = newMatrix.findIndex(m => m.role_level === roleLevel && m.permission_key === moduleKey)

        if (idx > -1) {
            newMatrix[idx] = { ...newMatrix[idx], [field]: value }
        } else {
            newMatrix.push({ role_level: roleLevel, permission_key: moduleKey, [field]: value })
        }
        setMatrix(newMatrix)

        try {
            setSaving(`${roleLevel}-${moduleKey}`)
            const existing = oldMatrix.find(m => m.role_level === roleLevel && m.permission_key === moduleKey)

            const payload = {
                role_level: roleLevel,
                permission_key: moduleKey,
                [field]: value,
                updated_at: new Date().toISOString()
            }

            let result
            if (existing && existing.id) {
                result = await supabase
                    .from('rbac_matrix')
                    .update(payload)
                    .eq('id', existing.id)
                    .select()
                    .single()
            } else {
                result = await supabase
                    .from('rbac_matrix')
                    .insert([payload])
                    .select()
                    .single()
            }

            const { data: savedRecord, error } = result

            if (error) throw error

            // Update state with real ID from DB to prevent future "undefined id" errors
            setMatrix(prev => {
                const updated = [...prev]
                const targetIdx = updated.findIndex(m => m.role_level === roleLevel && m.permission_key === moduleKey)
                if (targetIdx > -1) {
                    updated[targetIdx] = savedRecord
                } else {
                    updated.push(savedRecord)
                }
                return updated
            })

            setSaving(null)
        } catch (err) {
            setMatrix(oldMatrix) // Revert on failure
            console.error(err)
            alert('Lỗi lưu quyền: ' + err.message)
            setSaving(null)
        }
    }

    const handleBatchUpdate = async (type, id, value) => {
        if (!checkAction('edit', { module: 'settings' })) {
            alert('Bạn không có quyền sửa phân quyền!')
            return
        }
        if (type === 'column' && id === 'SUPER_ADMIN') return

        const confirmMsg = value ? `Cấp toàn bộ quyền?` : `Gỡ bỏ toàn bộ quyền?`
        if (!window.confirm(confirmMsg)) return

        setSaving(`batch-${id}`)
        try {
            const updates = []
            if (type === 'column') {
                MODULES.forEach(mod => {
                    updates.push({
                        role_level: id,
                        permission_key: mod.key,
                        can_view: value,
                        can_edit: value,
                        can_delete: value,
                        updated_at: new Date().toISOString()
                    })
                })
            } else {
                ROLE_OPTIONS.filter(r => r.value !== 'SUPER_ADMIN').forEach(role => {
                    updates.push({
                        role_level: role.value,
                        permission_key: id,
                        can_view: value,
                        can_edit: value,
                        can_delete: value,
                        updated_at: new Date().toISOString()
                    })
                })
            }

            const { error } = await supabase
                .from('rbac_matrix')
                .upsert(updates, { onConflict: 'role_level,permission_key' })

            if (error) throw error
            const { data: newMatrix } = await supabase.from('rbac_matrix').select('*')
            setMatrix(newMatrix)
            setSaving(null)
        } catch (err) { alert(err.message); setSaving(null); }
    }

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.last_name} ${emp.first_name}`.toLowerCase()
        const code = (emp.employee_code || '').toLowerCase()
        return fullName.includes(search.toLowerCase()) || code.includes(search.toLowerCase())
    })

    const handleSaveLeaveSetting = async (setting) => {
        if (!checkAction('edit', { module: 'settings' })) {
            alert('Bạn không có quyền sửa cài đặt nghỉ phép!')
            return
        }
        try {
            setSaving(`leave-${setting.department}`)
            const payload = {
                ...setting,
                updated_at: new Date().toISOString()
            }

            const { error } = setting.id
                ? await supabase.from('department_leave_settings').update(payload).eq('id', setting.id)
                : await supabase.from('department_leave_settings').insert([payload])

            if (error) throw error

            const { data } = await supabase
                .from('department_leave_settings')
                .select('*')
                .order('department')

            setLeaveSettings(data || [])
            setEditingLeaveSetting(null)
            setNewLeaveSetting({ department: '', annual_leave_days: 12, description: '' })
            setSaving(null)
        } catch (err) {
            alert('Lỗi: ' + err.message)
            setSaving(null)
        }
    }

    const handleDeleteLeaveSetting = async (id) => {
        if (!checkAction('edit', { module: 'settings' })) {
            alert('Bạn không có quyền xóa cài đặt nghỉ phép!')
            return
        }
        if (!window.confirm('Bạn có chắc chắn muốn xóa cài đặt này?')) return

        try {
            setSaving(`delete-${id}`)
            const { error } = await supabase
                .from('department_leave_settings')
                .delete()
                .eq('id', id)

            if (error) throw error

            const { data } = await supabase
                .from('department_leave_settings')
                .select('*')
                .order('department')

            setLeaveSettings(data || [])
            setSaving(null)
        } catch (err) {
            alert('Lỗi: ' + err.message)
            setSaving(null)
        }
    }

    // Get departments that don't have leave settings yet
    const availableDepartments = departments.filter(dept =>
        !leaveSettings.some(setting => setting.department === dept)
    )

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div className="header-title">
                    <h1><i className="fas fa-cog"></i> Cài đặt Hệ thống</h1>
                    <p>Quản lý vai trò và ma trận quyền hạn</p>
                </div>
                <div className="settings-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        <i className="fas fa-users-cog"></i> Phân quyền
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matrix')}
                    >
                        <i className="fas fa-th"></i> Ma trận Quyền hạn
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaves')}
                    >
                        <i className="fas fa-calendar-alt"></i> Nghỉ phép
                    </button>
                </div>
            </div>

            <div className="settings-body">
                {activeTab === 'roles' ? (
                    <div className="tab-content">
                        <div className="search-bar-roles">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Tìm nhân viên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="table-wrapper">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Họ tên & Mã NV</th>
                                        <th>Vai trò hệ thống</th>
                                        <th>Phạm vi (Dept)</th>
                                        <th>Phạm vi (Team)</th>
                                        <th>Lưu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(emp => {
                                        const r = rolesMap[emp.employee_code]
                                        return (
                                            <tr key={emp.employee_code}>
                                                <td>
                                                    <div className="emp-label">
                                                        <strong>{emp.last_name} {emp.first_name}</strong>
                                                        <small>{emp.employee_code} • {emp.department} / {emp.team}{emp.group_name ? ` / ${emp.group_name}` : ''}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <select
                                                        className={`level-sel ${r?.role_level}`}
                                                        value={r?.role_level || 'STAFF'}
                                                        onChange={(e) => handleUpdateUserRole(emp.employee_code, { role_level: e.target.value })}
                                                    >
                                                        {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                    </select>
                                                </td>
                                                <td>
                                                    {r?.role_level !== 'SUPER_ADMIN' && (
                                                        <select
                                                            className="scope-sel"
                                                            value={r?.dept_scope || ''}
                                                            onChange={(e) => handleUpdateUserRole(emp.employee_code, { dept_scope: e.target.value })}
                                                        >
                                                            <option value="">-- Chọn Phòng --</option>
                                                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                                        </select>
                                                    )}
                                                </td>
                                                <td>
                                                    {r?.role_level !== 'SUPER_ADMIN' && (
                                                        <select
                                                            className="scope-sel"
                                                            value={r?.team_scope || ''}
                                                            onChange={(e) => handleUpdateUserRole(emp.employee_code, { team_scope: e.target.value })}
                                                        >
                                                            <option value="">-- Chọn Đội --</option>
                                                            {teams.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    )}
                                                </td>
                                                <td>
                                                    {saving === emp.employee_code ? <i className="fas fa-spinner fa-spin"></i> : r ? <i className="fas fa-check text-success"></i> : null}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : activeTab === 'matrix' ? (
                    <div className="tab-content">
                        <div className="matrix-grid-wrapper">
                            <table className="matrix-table">
                                <thead>
                                    <tr>
                                        <th>Module / Role</th>
                                        {ROLE_OPTIONS.map(role => (
                                            <th key={role.value}>
                                                <div className="th-batch">
                                                    {role.label}
                                                    {role.value !== 'SUPER_ADMIN' && (
                                                        <div className="batch-btns">
                                                            <button title="Chọn hết" onClick={() => handleBatchUpdate('column', role.value, true)}><i className="fas fa-check-double"></i></button>
                                                            <button title="Bỏ hết" onClick={() => handleBatchUpdate('column', role.value, false)}><i className="fas fa-times"></i></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULES.map(mod => (
                                        <tr key={mod.key}>
                                            <td className="mod-label">
                                                <div className="td-batch">
                                                    <span>{mod.label}</span>
                                                    <div className="batch-btns">
                                                        <button title="Chọn hết" onClick={() => handleBatchUpdate('row', mod.key, true)}><i className="fas fa-check-double"></i></button>
                                                        <button title="Bỏ hết" onClick={() => handleBatchUpdate('row', mod.key, false)}><i className="fas fa-times"></i></button>
                                                    </div>
                                                </div>
                                            </td>
                                            {ROLE_OPTIONS.map(role => {
                                                const rule = matrix.find(m => m.role_level === role.value && m.permission_key === mod.key)
                                                const isSaving = saving === `${role.value}-${mod.key}` || saving === `batch-${role.value}` || saving === `batch-${mod.key}`
                                                const isSuper = role.value === 'SUPER_ADMIN'

                                                return (
                                                    <td key={role.value} className={`matrix-cell ${isSuper ? 'cell-locked' : ''}`}>
                                                        <div className="check-group">
                                                            <label title="Xem">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled={isSuper}
                                                                    checked={isSuper ? true : (rule?.can_view || false)}
                                                                    onChange={(e) => handleUpdateMatrix(role.value, mod.key, 'can_view', e.target.checked)}
                                                                />
                                                                <span>V</span>
                                                            </label>
                                                            <label title="Sửa">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled={isSuper}
                                                                    checked={isSuper ? true : (rule?.can_edit || false)}
                                                                    onChange={(e) => handleUpdateMatrix(role.value, mod.key, 'can_edit', e.target.checked)}
                                                                />
                                                                <span>E</span>
                                                            </label>
                                                            <label title="Xóa">
                                                                <input
                                                                    type="checkbox"
                                                                    disabled={isSuper}
                                                                    checked={isSuper ? true : (rule?.can_delete || false)}
                                                                    onChange={(e) => handleUpdateMatrix(role.value, mod.key, 'can_delete', e.target.checked)}
                                                                />
                                                                <span>D</span>
                                                            </label>
                                                        </div>
                                                        {isSaving && <div className="cell-loading"><i className="fas fa-sync fa-spin"></i></div>}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="matrix-legend">
                            <p><strong>Chú thích:</strong> <strong>V</strong>: Xem (View), <strong>E</strong>: Sửa (Edit), <strong>D</strong>: Xóa (Delete)</p>
                            <p className="notice">* Thay đổi được áp dụng ngay lập tức cho người dùng tương ứng.</p>
                        </div>
                    </div>
                ) : activeTab === 'leaves' ? (
                    <div className="tab-content">
                        <div className="leave-settings-header">
                            <h3><i className="fas fa-calendar-check"></i> Cài đặt số ngày nghỉ phép năm theo phòng ban</h3>
                            <p className="subtitle">Quản lý số ngày nghỉ phép được hưởng trong 1 năm cho từng phòng ban</p>
                        </div>

                        {/* Add New Setting */}
                        <div className="add-leave-setting-card">
                            <h4><i className="fas fa-plus-circle"></i> Thêm cài đặt mới</h4>
                            <div className="leave-setting-form">
                                <div className="form-group full-width">
                                    <label>Phòng ban</label>
                                    <select
                                        value={newLeaveSetting.department}
                                        onChange={(e) => setNewLeaveSetting({ ...newLeaveSetting, department: e.target.value })}
                                    >
                                        <option value="">-- Chọn phòng ban --</option>
                                        {availableDepartments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Số ngày nghỉ/năm</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="365"
                                        value={newLeaveSetting.annual_leave_days}
                                        onChange={(e) => setNewLeaveSetting({ ...newLeaveSetting, annual_leave_days: parseInt(e.target.value) || 12 })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Mô tả (tùy chọn)</label>
                                    <input
                                        type="text"
                                        value={newLeaveSetting.description}
                                        onChange={(e) => setNewLeaveSetting({ ...newLeaveSetting, description: e.target.value })}
                                        placeholder="Ví dụ: Áp dụng cho nhân viên chính thức"
                                    />
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSaveLeaveSetting(newLeaveSetting)}
                                    disabled={!newLeaveSetting.department || saving}
                                >
                                    <i className="fas fa-save"></i> Thêm
                                </button>
                            </div>
                        </div>

                        {/* Existing Settings */}
                        <div className="leave-settings-list">
                            <h4><i className="fas fa-list"></i> Danh sách cài đặt ({leaveSettings.length})</h4>
                            {leaveSettings.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-inbox"></i>
                                    <p>Chưa có cài đặt nào. Hãy thêm cài đặt cho phòng ban đầu tiên.</p>
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table className="settings-table">
                                        <thead>
                                            <tr>
                                                <th>Phòng ban</th>
                                                <th>Số ngày nghỉ/năm</th>
                                                <th>Mô tả</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaveSettings.map(setting => (
                                                <tr key={setting.id}>
                                                    <td>
                                                        {editingLeaveSetting?.id === setting.id ? (
                                                            <select
                                                                value={editingLeaveSetting.department}
                                                                onChange={(e) => setEditingLeaveSetting({ ...editingLeaveSetting, department: e.target.value })}
                                                            >
                                                                {departments.map(dept => (
                                                                    <option key={dept} value={dept}>{dept}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <strong>{setting.department}</strong>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingLeaveSetting?.id === setting.id ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="365"
                                                                value={editingLeaveSetting.annual_leave_days}
                                                                onChange={(e) => setEditingLeaveSetting({ ...editingLeaveSetting, annual_leave_days: parseInt(e.target.value) || 12 })}
                                                                style={{ width: '100px' }}
                                                            />
                                                        ) : (
                                                            <span className="leave-days-badge">{setting.annual_leave_days} ngày</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingLeaveSetting?.id === setting.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingLeaveSetting.description || ''}
                                                                onChange={(e) => setEditingLeaveSetting({ ...editingLeaveSetting, description: e.target.value })}
                                                                placeholder="Mô tả..."
                                                                style={{ width: '100%' }}
                                                            />
                                                        ) : (
                                                            <span className="text-muted">{setting.description || '—'}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingLeaveSetting?.id === setting.id ? (
                                                            <div className="action-buttons">
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleSaveLeaveSetting(editingLeaveSetting)}
                                                                    disabled={saving}
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() => setEditingLeaveSetting(null)}
                                                                    disabled={saving}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="action-buttons">
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => setEditingLeaveSetting({ ...setting })}
                                                                    disabled={saving}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDeleteLeaveSetting(setting.id)}
                                                                    disabled={saving}
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default Settings
