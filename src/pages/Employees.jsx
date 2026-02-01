import { useEffect, useRef, useState } from 'react'
import EmployeeDetail from '../components/EmployeeDetail'
import ProfileMenu from '../components/ProfileMenu'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Employees.css'

function Employees() {
    const { user } = useAuth()
    const [employees, setEmployees] = useState([])
    const [filteredEmployees, setFilteredEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterBranch, setFilterBranch] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [activeSection, setActiveSection] = useState('ly_lich')
    const fileInputRef = useRef(null)

    // Scroll ref to top on selection
    const detailRef = useRef(null)

    useEffect(() => {
        if (user) loadEmployees()
    }, [user])

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
            let query = supabase
                .from('employee_profiles')
                .select('*, user_roles(role_level)')

            // Apply strict server-side filtering if not admin
            if (user?.role_level === 'DEPT_HEAD' && user.dept_scope) {
                query = query.eq('department', user.dept_scope)
            } else if (user?.role_level === 'TEAM_LEADER' && user.team_scope) {
                query = query.eq('team', user.team_scope)
            } else if (user?.role_level === 'STAFF') {
                query = query.eq('employee_code', user.employee_code)
            }

            const { data, error } = await query

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
                return (roleOrder[levelA] || 99) - (roleOrder[levelB] || 99)
            })

            const mappedData = sortedData.map(profile => ({
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
        console.log('handleSaveEmployee called with formData:', {
            ho_va_ten: formData.ho_va_ten,
            ngay_sinh: formData.ngay_sinh,
            gioi_tinh: formData.gioi_tinh,
            nationality: formData.nationality,
            ethnicity: formData.ethnicity,
        })
        console.log('Employee ID:', id)
        try {
            // Map formData to database columns
            const nameParts = (formData.ho_va_ten || '').trim().split(' ')
            const firstName = nameParts.pop() || ''
            const lastName = nameParts.join(' ') || ''

            const dbPayload = {
                employee_code: formData.employeeId || null,
                first_name: firstName,
                last_name: lastName,
                gender: formData.gioi_tinh || null,
                date_of_birth: formData.ngay_sinh || null,
                nationality: formData.nationality || 'Việt Nam',
                place_of_birth: formData.place_of_birth || null,
                ethnicity: formData.ethnicity || 'Kinh',
                religion: formData.religion || 'Không',
                education_level: formData.education_level || '12/12',
                training_form: formData.training_form || 'Phổ Thông',
                academic_level_code: formData.academic_level_code || 'DH',
                marital_status_code: formData.marital_status_code || 1,
                card_number: formData.card_number || null,
                // Contact info
                permanent_address: formData.permanent_address || formData.dia_chi_thuong_tru || null,
                temporary_address: formData.temporary_address || null,
                hometown: formData.hometown || formData.que_quan || null,
                phone: formData.phone || formData.sđt || null,
                email_acv: formData.email_acv || null,
                email_personal: formData.email_personal || formData.email || null,
                relative_phone: formData.relative_phone || null,
                relative_relation: formData.relative_relation || 'Khác',
                // Work info
                decision_number: formData.decision_number || null,
                join_date: formData.join_date || formData.ngay_vao_lam || null,
                official_date: formData.official_date || formData.ngay_lam_chinh_thuc || null,
                job_position: formData.job_position || formData.vi_tri || null,
                department: formData.department || formData.bo_phan || null,
                team: formData.team || null,
                group_name: formData.group_name || null,
                employee_type: formData.employee_type || 'MB NVCT',
                score_template_code: formData.score_template_code || 'NVTT',
                labor_type: formData.labor_type || null,
                job_title: formData.job_title || null,
                date_received_job_title: formData.date_received_job_title || null,
                current_position: formData.current_position || 'Khác',
                appointment_date: formData.appointment_date || null,
                concurrent_position: formData.concurrent_position || null,
                concurrent_job_title: formData.concurrent_job_title || null,
                concurrent_start_date: formData.concurrent_start_date || null,
                concurrent_end_date: formData.concurrent_end_date || null,
                leave_calculation_type: formData.leave_calculation_type || 'Có cộng dồn',
                // Party records
                is_party_member: formData.is_party_member || false,
                party_card_number: formData.party_card_number || null,
                party_join_date: formData.party_join_date || null,
                party_official_date: formData.party_official_date || null,
                party_position: formData.party_position || null,
                party_activity_location: formData.party_activity_location || null,
                political_education_level: formData.political_education_level || null,
                party_notes: formData.party_notes || null,
                // Youth union
                is_youth_union_member: formData.is_youth_union_member || false,
                youth_union_card_number: formData.youth_union_card_number || null,
                youth_union_join_date: formData.youth_union_join_date || null,
                youth_union_join_location: formData.youth_union_join_location || null,
                youth_union_position: formData.youth_union_position || null,
                youth_union_activity_location: formData.youth_union_activity_location || null,
                youth_union_notes: formData.youth_union_notes || null,
                // Trade union
                is_trade_union_member: formData.is_trade_union_member || false,
                trade_union_card_number: formData.trade_union_card_number || null,
                trade_union_join_date: formData.trade_union_join_date || null,
                trade_union_position: formData.trade_union_position || null,
                trade_union_activity_location: formData.trade_union_activity_location || null,
                trade_union_notes: formData.trade_union_notes || null,
                // Legal Info
                identity_card_number: formData.cccd || formData.identity_card_number || null,
                identity_card_issue_date: formData.ngay_cap || formData.identity_card_issue_date || null,
                identity_card_issue_place: formData.noi_cap || formData.identity_card_issue_place || null,
                tax_code: formData.tax_code || null,
                health_insurance_number: formData.health_insurance_number || null,
                health_insurance_issue_date: formData.health_insurance_issue_date || null,
                health_insurance_place: formData.health_insurance_place || null,
                social_insurance_number: formData.social_insurance_number || null,
                social_insurance_issue_date: formData.social_insurance_issue_date || null,
                unemployment_insurance_number: formData.unemployment_insurance_number || null,
                unemployment_insurance_issue_date: formData.unemployment_insurance_issue_date || null
            }

            console.log('dbPayload to save:', dbPayload)

            let result
            if (id) {
                // Update existing employee
                console.log('Updating employee with id:', id)
                result = await supabase
                    .from('employee_profiles')
                    .update(dbPayload)
                    .eq('id', id)
                    .select()  // Add .select() to get the updated row back
            } else {
                // Insert new employee
                result = await supabase
                    .from('employee_profiles')
                    .insert([dbPayload])
                    .select()
            }

            console.log('Supabase result:', result)

            if (result.error) {
                console.error("Error saving employee:", result.error)
                alert('Lỗi khi lưu: ' + result.error.message)
                return
            }

            console.log('Save successful! Rows affected:', result.data)
            alert('Đã lưu thành công!')

            // Reload employees and update selectedEmployee
            const { data: refreshedData } = await supabase
                .from('employee_profiles')
                .select('*')
                .order('created_at', { ascending: true })

            if (refreshedData) {
                const mappedData = refreshedData.map(profile => ({
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
                    so_the: profile.card_number || '',
                    dia_chi_thuong_tru: profile.permanent_address || '',
                    que_quan: profile.hometown || '',
                    ...profile
                }))
                setEmployees(mappedData)

                // Re-select the updated employee
                if (id) {
                    const updatedEmp = mappedData.find(e => e.id === id)
                    console.log('Updated employee data:', updatedEmp)
                    if (updatedEmp) {
                        // Force a state update with new object reference
                        setSelectedEmployee({ ...updatedEmp })
                    }
                }
            }
        } catch (err) {
            console.error("Error saving employee:", err)
            alert('Lỗi khi lưu: ' + err.message)
        }
    }

    const departments = [...new Set(employees.map(e => e.bo_phan).filter(Boolean))].sort()

    // Map ProfileMenu section IDs to EmployeeDetail section IDs
    const handleSectionChange = (sectionId) => {
        const sectionMap = {
            'ly-lich-ca-nhan': 'ly_lich',
            'thong-tin-lien-he': 'lien_he',
            'thong-tin-cong-viec': 'cong_viec',
            'than-nhan': 'than_nhan',
            'ho-so-dang': 'ho_so_dang',
            'doan-thanh-nien': 'doan_thanh_nien',
            'cong-doan': 'cong_doan',
            'phap-ly-chung': 'phap_ly_chung',
            'tai-khoan-ngan-hang': 'tai_khoan',
            'hop-dong-lao-dong': 'hop_dong',
            'ho-chieu': 'ho_chieu',
            'khac': 'khac',
            'grading': 'grading',
            'luong-co-ban': 'luong_co_ban',
            'luong-vi-tri': 'luong_vi_tri',
            'phu-cap': 'phu_cap',
            'thu-nhap-khac': 'thu_nhap_khac',
            'nghi-phep': 'nghi_phep',
            'bo-nhiem': 'bo_nhiem',
            'nhat-ky-cong-tac': 'nhat_ky_cong_tac',
            'chuyen-nganh': 'chuyen_nganh',
            'chung-chi': 'chung_chi',
            'dao-tao-noi-bo': 'dao_tao_noi_bo',
            'khen-thuong': 'khen_thuong',
            'ky-luat': 'ky_luat',
            'the-bhyt': 'the_bhyt',
            'tai-nan-lao-dong': 'tai_nan_lao_dong',
            'kham-suc-khoe': 'kham_suc_khoe'
        }
        setActiveSection(sectionMap[sectionId] || sectionId)
    }

    return (
        <div className="employees-page">
            {/* LEFT: PROFILE MENU */}
            <ProfileMenu
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
            />

            {/* RIGHT: MAIN CONTENT */}
            <div className="employees-content">
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
                            activeSection={activeSection}
                            onSectionChange={setActiveSection}
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
        </div>
    )
}

export default Employees


