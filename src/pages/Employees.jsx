import { useEffect, useRef, useState } from 'react'
import EmployeeDetail from '../components/EmployeeDetail'
import { supabase } from '../services/supabase'
import './Employees.css'

function Employees() {
    const [employees, setEmployees] = useState([])
    const [filteredEmployees, setFilteredEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterBranch, setFilterBranch] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const fileInputRef = useRef(null)

    // Scroll ref to top on selection
    const detailRef = useRef(null)

    useEffect(() => {
        loadEmployees()
    }, [])

    useEffect(() => {
        filterEmployees()
    }, [employees, searchTerm, filterBranch, filterDept])

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
                trang_thai: 'Đang làm việc', // Default logic could be improved
                ngay_vao_lam: profile.join_date || '',
                ngay_sinh: profile.date_of_birth || '',
                gioi_tinh: profile.gender || '',
                so_the: profile.card_number || '',
                dia_chi_thuong_tru: profile.permanent_address || '',
                que_quan: profile.hometown || '',
                // Pass raw profile usage
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

            const matchBranch = !filterBranch || item.chi_nhanh === filterBranch // Note: chi_nhanh not always in profile
            const matchDept = !filterDept || item.bo_phan === filterDept
            return matchSearch && matchBranch && matchDept
        })
        setFilteredEmployees(filtered)
    }

    const handleSaveEmployee = async (formData, id) => {
        // Here we would implement the save logic similar to EmployeeModal
        // For now, reload data
        console.log("Saving employee...", formData)
        // Assume save was successful
        await loadEmployees()
    }

    const departments = [...new Set(employees.map(e => e.bo_phan).filter(Boolean))].sort()

    return (
        <div className="employees-page">
            {/* TOP PANEL: DETAIL VIEW */}
            <div className="detail-panel" ref={detailRef}>
                <div className="panel-header">
                    <h2><i className="fas fa-id-card"></i> Hồ sơ nhân viên</h2>
                    <div className="panel-actions">
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedEmployee(null)}>
                            <i className="fas fa-plus"></i> Thêm mới
                        </button>
                    </div>
                </div>
                <div className="detail-content">
                    <EmployeeDetail
                        employee={selectedEmployee}
                        onSave={handleSaveEmployee}
                        onCancel={() => {
                            // If canceling creation, re-select the first one or clear
                            if (!selectedEmployee && employees.length > 0) setSelectedEmployee(employees[0])
                        }}
                    />
                </div>
            </div>

            {/* BOTTOM PANEL: LIST VIEW */}
            <div className="list-panel">
                <div className="list-toolbar">
                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Tìm NV..."
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

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Họ Tên</th>
                                <th>Phòng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className={selectedEmployee && selectedEmployee.id === emp.id ? 'active-row' : ''}
                                >
                                    <td>{emp.employeeId}</td>
                                    <td>{emp.ho_va_ten}</td>
                                    <td>{emp.bo_phan}</td>
                                    <td>
                                        <span className={`status-badge ${emp.trang_thai === 'Nghỉ việc' ? 'inactive' : 'active'}`}>
                                            {emp.trang_thai}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr><td colSpan="4" className="empty-state">Không tìm thấy nhân viên</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default Employees
