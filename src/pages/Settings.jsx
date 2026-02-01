import { useEffect, useState } from 'react'
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
    { key: PERMISSIONS.SETTINGS, label: 'Cài đặt' }
]

function Settings() {
    const [activeTab, setActiveTab] = useState('roles') // 'roles' or 'matrix'
    const [employees, setEmployees] = useState([])
    const [rolesMap, setRolesMap] = useState({})
    const [matrix, setMatrix] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState(null)
    const [departments, setDepartments] = useState([])
    const [teams, setTeams] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)

            // 1. Fetch Employees
            const { data: empData } = await supabase
                .from('employee_profiles')
                .select('employee_code, first_name, last_name, department, team, group_name, current_position')
                .order('last_name', { ascending: true })
                .range(0, 5000)

            // 2. Fetch Assigned Roles
            const { data: roleData } = await supabase.from('user_roles').select('*')

            // 3. Fetch Matrix
            const { data: matrixData } = await supabase.from('rbac_matrix').select('*')

            setEmployees(empData || [])

            const rMap = {}
            if (roleData) roleData.forEach(r => { rMap[r.employee_code] = r })
            setRolesMap(rMap)
            setMatrix(matrixData || [])

            const uniqueDepts = [...new Set(empData.map(e => e.department).filter(Boolean))].sort()
            const uniqueTeams = [...new Set(empData.map(e => e.team).filter(Boolean))].sort()
            setDepartments(uniqueDepts)
            setTeams(uniqueTeams)

            setLoading(false)
        } catch (err) {
            console.error("Error fetching settings data:", err)
            setLoading(false)
        }
    }

    const handleUpdateUserRole = async (empCode, updates) => {
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
        try {
            setSaving(`${roleLevel}-${moduleKey}`)
            const existing = matrix.find(m => m.role_level === roleLevel && m.permission_key === moduleKey)

            const payload = {
                role_level: roleLevel,
                permission_key: moduleKey,
                [field]: value,
                updated_at: new Date().toISOString()
            }

            const { error } = existing
                ? await supabase.from('rbac_matrix').update(payload).eq('id', existing.id)
                : await supabase.from('rbac_matrix').insert([payload])

            if (error) throw error

            // Refetch or update local state
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
                                                        <small>{emp.employee_code} • {emp.department} / {emp.team} / {emp.group_name || 'N/A'}</small>
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
                                                    {(r?.role_level === 'DEPT_HEAD' || r?.role_level === 'TEAM_LEADER') && (
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
                                                    {r?.role_level === 'TEAM_LEADER' && (
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
                ) : (
                    <div className="tab-content">
                        <div className="matrix-grid-wrapper">
                            <table className="matrix-table">
                                <thead>
                                    <tr>
                                        <th>Module / Role</th>
                                        {ROLE_OPTIONS.map(role => <th key={role.value}>{role.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODULES.map(mod => (
                                        <tr key={mod.key}>
                                            <td className="mod-label">{mod.label}</td>
                                            {ROLE_OPTIONS.map(role => {
                                                const rule = matrix.find(m => m.role_level === role.value && m.permission_key === mod.key)
                                                const isSaving = saving === `${role.value}-${mod.key}`
                                                return (
                                                    <td key={role.value} className="matrix-cell">
                                                        <div className="check-group">
                                                            <label title="Xem">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rule?.can_view || false}
                                                                    onChange={(e) => handleUpdateMatrix(role.value, mod.key, 'can_view', e.target.checked)}
                                                                />
                                                                <span>V</span>
                                                            </label>
                                                            <label title="Sửa">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rule?.can_edit || false}
                                                                    onChange={(e) => handleUpdateMatrix(role.value, mod.key, 'can_edit', e.target.checked)}
                                                                />
                                                                <span>E</span>
                                                            </label>
                                                            <label title="Xóa">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={rule?.can_delete || false}
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
                )}
            </div>
        </div>
    )
}

export default Settings
