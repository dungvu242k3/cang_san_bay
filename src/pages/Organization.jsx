import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import './Organization.css'

function Organization() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedDepts, setExpandedDepts] = useState({})
    const [expandedPositions, setExpandedPositions] = useState({})

    useEffect(() => {
        loadEmployees()
    }, [])

    const loadEmployees = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('id, employee_code, first_name, last_name, department, team, current_position, avatar_url, user_roles(role_level)')
                .neq('status', 'Nghỉ việc')

            if (error) throw error

            const roleOrder = {
                'SUPER_ADMIN': 1,
                'BOARD_DIRECTOR': 2,
                'DEPT_HEAD': 3,
                'TEAM_LEADER': 4,
                'STAFF': 5
            }

            const sortedData = (data || []).sort((a, b) => {
                const levelA = a.user_roles?.[0]?.role_level || 'STAFF'
                const levelB = b.user_roles?.[0]?.role_level || 'STAFF'
                if (levelA !== levelB) {
                    return (roleOrder[levelA] || 99) - (roleOrder[levelB] || 99)
                }
                return (a.department || '').localeCompare(b.department || '')
            })

            setEmployees(sortedData || [])

            // Expand all by default
            const depts = [...new Set((sortedData || []).map(e => e.department || 'Khác'))]
            const expanded = {}
            depts.forEach(d => expanded[d] = true)
            setExpandedDepts(expanded)

            // Expand all positions by default
            const positions = {}
            sortedData.forEach(emp => {
                const dept = emp.department || 'Khác'
                const team = emp.team || 'Văn phòng Đội'
                const position = emp.current_position || 'Nhân viên'
                const key = `${dept}|${team}|${position}`
                positions[key] = true
            })
            setExpandedPositions(positions)

            setLoading(false)
        } catch (err) {
            console.error("Error loading employees:", err)
            setLoading(false)
        }
    }

    const toggleAll = (show) => {
        const depts = [...new Set(employees.map(e => e.department || 'Khác'))]
        const expanded = {}
        depts.forEach(d => expanded[d] = show)
        setExpandedDepts(expanded)

        // Also toggle all positions
        const positions = {}
        employees.forEach(emp => {
            const dept = emp.department || 'Khác'
            const team = emp.team || 'Văn phòng Đội'
            const position = emp.current_position || 'Nhân viên'
            const key = `${dept}|${team}|${position}`
            positions[key] = show
        })
        setExpandedPositions(positions)
    }

    const toggleDept = (dept) => {
        setExpandedDepts(prev => ({
            ...prev,
            [dept]: !prev[dept]
        }))
    }

    const togglePosition = (dept, team, position) => {
        const key = `${dept}|${team}|${position}`
        setExpandedPositions(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    // Grouping logic
    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.last_name} ${emp.first_name}`.toLowerCase()
        const code = (emp.employee_code || '').toLowerCase()
        const search = searchTerm.toLowerCase()
        return fullName.includes(search) || code.includes(search)
    })

    // Position order for sorting
    const positionOrder = {
        'Đội trưởng': 1,
        'Đội phó': 2,
        'Nhân viên': 3
    }

    const groupedData = filteredEmployees.reduce((acc, emp) => {
        const dept = emp.department || 'Khác'
        const team = emp.team || 'Văn phòng Đội'
        const position = emp.current_position || 'Nhân viên'

        if (!acc[dept]) acc[dept] = {}
        if (!acc[dept][team]) acc[dept][team] = {}
        if (!acc[dept][team][position]) acc[dept][team][position] = []

        acc[dept][team][position].push(emp)
        return acc
    }, {})

    // Sort positions within each team
    Object.keys(groupedData).forEach(dept => {
        Object.keys(groupedData[dept]).forEach(team => {
            const positions = Object.keys(groupedData[dept][team])
            const sortedPositions = positions.sort((a, b) => {
                const orderA = positionOrder[a] || 99
                const orderB = positionOrder[b] || 99
                if (orderA !== orderB) return orderA - orderB
                return a.localeCompare(b)
            })
            const sorted = {}
            sortedPositions.forEach(pos => {
                sorted[pos] = groupedData[dept][team][pos]
            })
            groupedData[dept][team] = sorted
        })
    })

    return (
        <div className="organization-page">
            <div className="org-header">
                <div className="header-title">
                    <h1><i className="fas fa-sitemap"></i> Sơ đồ tổ chức</h1>
                    <p>Danh sách nhân sự phân cấp theo phòng ban, đội và vị trí</p>
                </div>
                <div className="header-actions">
                    <div className="org-search">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm nhân viên theo tên hoặc mã..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="view-controls">
                        <button className="btn-control" onClick={() => toggleAll(true)} title="Expand All">
                            <i className="fas fa-expand-arrows-alt"></i> Mở rộng hết
                        </button>
                        <button className="btn-control" onClick={() => toggleAll(false)} title="Collapse All">
                            <i className="fas fa-compress-arrows-alt"></i> Thu gọn hết
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải sơ đồ tổ chức...</p>
                </div>
            ) : (
                <div className="org-container">
                    {Object.keys(groupedData).length > 0 ? (
                        Object.entries(groupedData).map(([dept, teams]) => (
                            <div key={dept} className={`dept-card ${expandedDepts[dept] ? 'expanded' : ''}`}>
                                <div className="dept-header" onClick={() => toggleDept(dept)}>
                                    <div className="dept-info">
                                        <div className="dept-icon">
                                            <i className="fas fa-building"></i>
                                        </div>
                                        <div className="dept-name">
                                            <h3>{dept}</h3>
                                            <span>{Object.values(teams).reduce((total, positions) => total + Object.values(positions).flat().length, 0)} nhân viên</span>
                                        </div>
                                    </div>
                                    <i className={`fas fa-chevron-${expandedDepts[dept] ? 'up' : 'down'} toggle-icon`}></i>
                                </div>

                                {expandedDepts[dept] && (
                                    <div className="dept-content">
                                        {Object.entries(teams).map(([team, positions]) => (
                                            <div key={team} className="team-section">
                                                <h4 className="team-title">
                                                    <i className="fas fa-users"></i> {team}
                                                </h4>
                                                {Object.entries(positions).map(([position, members]) => {
                                                    const positionKey = `${dept}|${team}|${position}`
                                                    const isExpanded = expandedPositions[positionKey] !== false
                                                    return (
                                                        <div key={position} className="position-section">
                                                            <div className="position-header" onClick={() => togglePosition(dept, team, position)}>
                                                                <div className="position-info">
                                                                    <i className="fas fa-user-tie position-icon"></i>
                                                                    <span className="position-name">{position}</span>
                                                                    <span className="position-count">({members.length} người)</span>
                                                                </div>
                                                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} toggle-icon-small`}></i>
                                                            </div>
                                                            {isExpanded && (
                                                                <div className="employee-grid">
                                                                    {members.map(emp => (
                                                                        <div key={emp.id} className="employee-card-narrow">
                                                                            <div className="emp-avatar">
                                                                                {emp.avatar_url ? (
                                                                                    <img src={emp.avatar_url} alt={emp.first_name} />
                                                                                ) : (
                                                                                    <div className="avatar-placeholder">
                                                                                        {emp.first_name[0]}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <div className="emp-details">
                                                                                <span className="emp-name">{emp.last_name} {emp.first_name}</span>
                                                                                <span className="emp-role">{emp.current_position || 'Nhân viên'}</span>
                                                                                <span className="emp-code">{emp.employee_code}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-users-slash"></i>
                            <p>Không tìm thấy nhân viên nào phù hợp</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Organization
