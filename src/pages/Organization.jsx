import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import './Organization.css'

function Organization() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [expandedDepts, setExpandedDepts] = useState({})

    useEffect(() => {
        loadEmployees()
    }, [])

    const loadEmployees = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('id, employee_code, first_name, last_name, department, team, group_name, current_position, avatar_url')
                .order('department', { ascending: true })
                .range(0, 5000)

            if (error) throw error
            setEmployees(data || [])
            setLoading(false)
        } catch (err) {
            console.error("Error loading employees:", err)
            setLoading(false)
        }
    }

    const toggleDept = (dept) => {
        setExpandedDepts(prev => ({
            ...prev,
            [dept]: !prev[dept]
        }))
    }

    // Grouping logic
    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.last_name} ${emp.first_name}`.toLowerCase()
        const code = (emp.employee_code || '').toLowerCase()
        const search = searchTerm.toLowerCase()
        return fullName.includes(search) || code.includes(search)
    })

    const groupedData = filteredEmployees.reduce((acc, emp) => {
        const dept = emp.department || 'Khác'
        const team = emp.team || 'Văn phòng Đội'

        if (!acc[dept]) acc[dept] = {}
        if (!acc[dept][team]) acc[dept][team] = []

        acc[dept][team].push(emp)
        return acc
    }, {})

    return (
        <div className="organization-page">
            <div className="org-header">
                <div className="header-title">
                    <h1><i className="fas fa-sitemap"></i> Sơ đồ tổ chức</h1>
                    <p>Danh sách nhân sự phân cấp theo phòng ban và đội</p>
                </div>
                <div className="org-search">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm nhân viên theo tên hoặc mã..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                            <span>{Object.values(teams).flat().length} nhân viên</span>
                                        </div>
                                    </div>
                                    <i className={`fas fa-chevron-${expandedDepts[dept] ? 'up' : 'down'} toggle-icon`}></i>
                                </div>

                                {expandedDepts[dept] && (
                                    <div className="dept-content">
                                        {Object.entries(teams).map(([team, members]) => (
                                            <div key={team} className="team-section">
                                                <h4 className="team-title">
                                                    <i className="fas fa-users"></i> {team}
                                                </h4>
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
