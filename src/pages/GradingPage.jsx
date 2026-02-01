import { useEffect, useRef, useState } from 'react';
import EmployeeDetail from '../components/EmployeeDetail';
import { supabase } from '../services/supabase';
import './GradingPage.css'; // Dedicated styles

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
            detailRef.current.scrollTop = 0
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
                score_template_code: profile.score_template_code,
                ...profile
            }))
            setEmployees(mappedData)

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
        console.log("Save triggered from GradingPage (Profile save disabled)")
    }

    const departments = [...new Set(employees.map(e => e.bo_phan).filter(Boolean))].sort()

    return (
        <div className="grading-page-container">
            {/* LEFT SIDEBAR: LIST VIEW */}
            <div className="grading-sidebar">
                <div className="grading-sidebar-header">
                    <h2><i className="fas fa-list-ul"></i> Danh sách nhân sự</h2>
                </div>

                <div className="sidebar-toolbar">
                    <div className="sidebar-search">
                        <input
                            type="text"
                            placeholder="Tìm tên hoặc mã nhân viên..."
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
                </div>

                <div className="sidebar-stats">
                    Hiển thị {filteredEmployees.length} nhân viên
                </div>

                <div className="grading-sidebar-list">
                    {loading ? (
                        <div className="p-4 text-center">Đang tải...</div>
                    ) : filteredEmployees.map(emp => (
                        <div
                            key={emp.id}
                            className={`employee-item ${selectedEmployee && selectedEmployee.id === emp.id ? 'active' : ''}`}
                            onClick={() => setSelectedEmployee(emp)}
                        >
                            <div className="item-main">
                                <span className="item-name">{emp.ho_va_ten}</span>
                                <span className="item-code">{emp.employeeId}</span>
                            </div>
                            <div className="item-sub">
                                <span>{emp.bo_phan}</span>
                                <span className="item-badge">{emp.score_template_code || 'NVTT'}</span>
                            </div>
                        </div>
                    ))}
                    {!loading && filteredEmployees.length === 0 && (
                        <div className="empty-state">Không tìm thấy kết quả</div>
                    )}
                </div>
            </div>

            {/* RIGHT MAIN CONTENT: GRADING VIEW */}
            <div className="grading-main-content" ref={detailRef}>
                {selectedEmployee ? (
                    <EmployeeDetail
                        employee={selectedEmployee}
                        activeSection="grading"
                        allowEditProfile={false}
                        onSave={handleSave}
                        onCancel={() => { }}
                        onSectionChange={() => { }}
                    />
                ) : (
                    <div className="grading-empty-state">
                        <i className="fas fa-user-edit"></i>
                        <p>Chọn nhân viên từ danh sách bên trái để chấm điểm</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GradingPage
