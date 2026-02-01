import { useEffect, useRef, useState } from 'react'
import EmployeeDetail from '../components/EmployeeDetail'
import { supabase } from '../services/supabase'
import './Employees.css'; // Reuse styles from Employees page

function GradingPage() {
    const [employees, setEmployees] = useState([])
    const [filteredEmployees, setFilteredEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState(null)

    // Scroll ref to top on selection
    const detailRef = useRef(null)

    useEffect(() => {
        loadEmployees()
    }, [])

    useEffect(() => {
        filterEmployees()
    }, [employees, searchTerm, filterDept])

    useEffect(() => {
        if (selectedEmployee && detailRef.current) {
            detailRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [selectedEmployee])

    const loadEmployees = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error

            const mappedData = (data || []).map(profile => ({
                id: profile.id,
                employeeId: profile.employee_code || '',
                ho_va_ten: (profile.last_name || '') + ' ' + (profile.first_name || ''),
                email: profile.email_acv || '',
                sđt: profile.phone || '',
                bo_phan: profile.department || '',
                vi_tri: profile.job_position || profile.current_position || '',
                trang_thai: 'Đang làm việc',
                ngay_vao_lam: profile.join_date || '',
                ngay_sinh: profile.date_of_birth || '',
                gioi_tinh: profile.gender || '',
                score_template_code: profile.score_template_code, // Ensure this is passed
                ...profile
            }))
            setEmployees(mappedData)

            // Auto-select first employee if none selected
            if (!selectedEmployee && mappedData.length > 0) {
                setSelectedEmployee(mappedData[0])
            }

            setLoading(false)
        } catch (err) {
            console.error("Error loading employees:", err)
            setEmployees([])
            setLoading(false)
        }
    }

    const filterEmployees = () => {
        let filtered = employees.filter(item => {
            if (!item) return false
            const nameField = item.ho_va_ten || ''
            const matchSearch = !searchTerm ||
                nameField.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.employeeId && item.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchDept = !filterDept || item.bo_phan === filterDept
            return matchSearch && matchDept
        })
        setFilteredEmployees(filtered)
    }

    const handleSave = async (formData, id) => {
        // Since we are in Grading Mode, we might not need to save Profile info here.
        // But EmployeeDetail requires onSave. We can leave it empty or log.
        console.log("Save triggered from GradingPage (Profile save disabled)")
    }

    const departments = [...new Set(employees.map(e => e.bo_phan).filter(Boolean))].sort()

    return (
        <div className="employees-page" style={{ height: 'auto', minHeight: '100vh', padding: '20px' }}>
            <div className="employees-content" style={{ width: '100%', margin: '0 auto' }}>

                {/* TOP PANEL: GRADING VIEW */}
                <div className="detail-panel" ref={detailRef} style={{ marginBottom: '20px' }}>
                    <div className="panel-header" style={{ background: '#28a745', color: 'white' }}>
                        <h2><i className="fas fa-star-half-alt"></i> Chấm điểm KPI</h2>
                    </div>
                    <div className="detail-content">
                        {loading ? (
                            <div className="p-4 text-center">Đang tải dữ liệu...</div>
                        ) : selectedEmployee ? (
                            <EmployeeDetail
                                employee={selectedEmployee}
                                activeSection="grading"
                                allowEditProfile={false}
                                onSave={handleSave}
                                onCancel={() => { }}
                                onSectionChange={() => { }}
                            />
                        ) : (
                            <div className="p-4 text-center">Vui lòng chọn nhân viên để chấm điểm</div>
                        )}
                    </div>
                </div>

                {/* BOTTOM PANEL: LIST VIEW */}
                <div className="list-panel">
                    <div className="list-toolbar">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Tìm nhân viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                                <option value="">Tất cả phòng ban</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="list-stats">
                            {filteredEmployees.length} / {employees.length} nhân viên
                        </div>
                    </div>

                    <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Họ Tên</th>
                                    <th>Phòng ban</th>
                                    <th>Vị trí</th>
                                    <th>Mẫu chấm điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => setSelectedEmployee(emp)}
                                        className={selectedEmployee && selectedEmployee.id === emp.id ? 'active-row' : ''}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{emp.employeeId}</td>
                                        <td>{emp.ho_va_ten}</td>
                                        <td>{emp.bo_phan}</td>
                                        <td>{emp.vi_tri}</td>
                                        <td>
                                            <span className="badge badge-info">{emp.score_template_code || 'NVTT'}</span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr><td colSpan="5" className="empty-state">Không tìm thấy nhân viên</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GradingPage
