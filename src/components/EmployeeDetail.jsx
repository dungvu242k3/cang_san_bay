import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

import './EmployeeDetail.css'

const CRITERIA = [
    {
        section: 'A',
        title: 'KHUNG ĐIỂM TRỪ [A = 20 - 1.1 - 1.2 - 1.3]',
        maxScore: 20,
        isDeduction: true,
        items: [
            { id: '1', title: 'Chấp hành Nội quy lao động', maxScore: 20, isHeader: true },
            { id: '1.1', title: 'Nhóm hành vi Điều 23 - Nội quy lao động', range: '1 - 9' },
            { id: '1.2', title: 'Nhóm hành vi Điều 24 - Nội quy lao động', range: '10 - 15' },
            { id: '1.3', title: 'Nhóm hành vi Điều 25, Điều 26 - Nội quy lao động', range: '16 - 20' },
        ]
    },
    {
        section: 'B',
        title: 'KHUNG ĐIỂM ĐẠT',
        maxScore: 80,
        items: [
            { id: '2', title: 'Hiệu quả công việc', maxScore: 45, isHeader: true },
            { id: '2.1', title: 'Khối lượng công việc', range: '1 - 10' },
            { id: '2.2', title: 'Thời gian thực hiện, tiến độ hoàn thành', range: '1 - 10' },
            { id: '2.3', title: 'Chất lượng công việc', maxScore: 15, isHeader: true },
            { id: '2.3.1', title: 'Tính chính xác so với mục tiêu, yêu cầu đề ra (hiệu quả)', range: '1 - 5' },
            { id: '2.3.2', title: 'Đúng phương pháp, quy trình, hướng dẫn (hiệu suất)', range: '1 - 5' },
            { id: '2.3.3', title: 'Mức độ khả thi, có thể áp dụng (thực tiễn)', range: '1 - 5' },
            { id: '2.4', title: 'Sắp xếp, quản lý công việc và ý thức tiết kiệm', maxScore: 10, isHeader: true },
            { id: '2.4.1', title: 'Tính khoa học, hợp lý trong quản lý công việc', range: '1 - 5' },
            { id: '2.4.2', title: 'Ý thức tiết kiệm (thời gian làm việc, nguồn lực, tài nguyên)', range: '1 - 5' },
            { id: '3', title: 'Tinh thần trách nhiệm, ý thức hợp tác, linh hoạt và thích ứng', maxScore: 15, isHeader: true },
            { id: '3.1', title: 'Tinh thần trách nhiệm', range: '1 - 5' },
            { id: '3.2', title: 'Ý thức hợp tác và giải quyết vấn đề', range: '1 - 5' },
            { id: '3.3', title: 'Khả năng chủ động thay đổi, thích ứng linh hoạt, kịp thời xử lý', range: '1 - 5' },
            { id: '4', title: 'Hiệu quả quản lý, điều hành, chỉ đạo', maxScore: 20, isHeader: true },
            { id: '4.1', title: 'Hiệu quả quản lý, chỉ đạo, điều hành công việc', range: '1 - 5' },
            { id: '4.2', title: 'Thực hiện chế độ họp, hội nghị, đào tạo - huấn luyện', range: '1 - 5' },
            { id: '4.3', title: 'Trách nhiệm thực hiện chế độ báo cáo, thông tin phản hồi với lãnh đạo', range: '1 - 5' },
            { id: '4.4', title: 'Hiệu quả hoạt động của cơ quan đơn vị', range: '1 - 5' },
        ]
    },
    {
        section: 'C',
        title: 'KHUNG ĐIỂM CỘNG',
        maxScore: 15,
        items: [
            { id: '5', title: 'Điểm cộng động viên, khuyến khích (04 tiêu chí)', range: '1 - 15' }
        ]
    }
]

const DEFAULT_FORM_DATA = {
    ho_va_ten: '',
    employeeId: '',
    email: '',
    sđt: '',
    chi_nhanh: 'HCM',
    bo_phan: '',
    vi_tri: '',
    trang_thai: 'Thử việc',
    ca_lam_viec: 'Ca full',
    ngay_vao_lam: '',
    ngay_lam_chinh_thuc: '',
    cccd: '',
    ngay_cap: '',
    noi_cap: '',
    dia_chi_thuong_tru: '',
    que_quan: '',
    ngay_sinh: '',
    gioi_tinh: '',
    tinh_trang_hon_nhan: '',
    avatarDataUrl: '',
    images: [],
    files: [],
    // New Profile Fields
    nationality: 'Việt Nam',
    place_of_birth: '',
    ethnicity: 'Kinh',
    religion: 'Không',
    education_level: '12/12',
    training_form: 'Phổ Thông',
    academic_level_code: 'DH',
    marital_status_code: 1, // Default 'Độc thân'
    card_number: '',
    // 1.2 Contact Info (match DB schema)
    permanent_address: '',
    temporary_address: '',
    hometown: '',
    phone: '',
    email_acv: '',
    email_personal: '',
    relative_phone: '',
    relative_relation: 'Khác',
    // 1.3 Work Info
    decision_number: '',
    join_date: '',
    official_date: '',
    job_position: '',
    department: '',
    team: '',
    group_name: '',
    employee_type: 'MB NVCT',
    labor_type: '',
    job_title: '',
    date_received_job_title: '',
    current_position: 'Khác',
    appointment_date: '',
    concurrent_position: '',
    concurrent_job_title: '',
    concurrent_start_date: '',
    concurrent_end_date: '',
    leave_calculation_type: 'Có cộng dồn',

    // Party Records (Hồ sơ Đảng)
    is_party_member: false,
    party_card_number: '',
    party_join_date: '',
    party_official_date: '',
    party_position: '',
    party_activity_location: '',
    political_education_level: '',
    party_notes: '',

    // Youth Union (Đoàn thanh niên)
    is_youth_union_member: false,
    youth_union_card_number: '',
    youth_union_join_date: '',
    youth_union_join_location: '',
    youth_union_position: '',
    youth_union_activity_location: '',
    youth_union_notes: '',

    // Trade Union (Công đoàn)
    is_trade_union_member: false,
    trade_union_card_number: '',
    trade_union_join_date: '',
    trade_union_position: '',
    trade_union_activity_location: '',
    trade_union_notes: ''
}

function EmployeeDetail({ employee, onSave, onCancel }) {
    const { user: authUser } = useAuth()
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
    const [activeSection, setActiveSection] = useState('ly_lich') // ly_lich, lien_he, cong_viec, grading, ...
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Sub-data states
    const [familyMembers, setFamilyMembers] = useState([])

    // Grading States
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
    const [gradingReviewId, setGradingReviewId] = useState(null)
    const [gradingStatus, setGradingStatus] = useState('draft')
    const [selfAssessment, setSelfAssessment] = useState({})
    const [supervisorAssessment, setSupervisorAssessment] = useState({})
    const [selfComment, setSelfComment] = useState('')
    const [supervisorComment, setSupervisorComment] = useState('')

    // Initialize data when employee changes
    useEffect(() => {
        if (employee) {
            // Edit Mode or View Mode for existing employee
            loadEmployeeData(employee)
            setIsEditing(false)
            // Load grading if active section is grading
            if (activeSection === 'grading') loadGradingData()
        } else {
            // Create Mode (empty form)
            setFormData(DEFAULT_FORM_DATA)
            setIsEditing(true)
        }
    }, [employee])

    useEffect(() => {
        if (activeSection === 'grading' && employee) {
            loadGradingData()
        }
    }, [activeSection, month, employee])

    const calculateTotals = (data) => {
        let scoreA = 20
        const sectionA = CRITERIA.find(c => c.section === 'A')
        sectionA.items.forEach(item => {
            if (!item.isHeader) scoreA -= Number(data[item.id] || 0)
        })
        scoreA = Math.max(0, scoreA)

        let scoreB = 0
        const sectionB = CRITERIA.find(c => c.section === 'B')
        sectionB.items.forEach(item => {
            if (!item.isHeader) scoreB += Number(data[item.id] || 0)
        })
        scoreB = Math.min(80, scoreB)

        let scoreC = 0
        const sectionC = CRITERIA.find(c => c.section === 'C')
        sectionC.items.forEach(item => {
            scoreC += Number(data[item.id] || 0)
        })
        scoreC = Math.min(15, scoreC)

        return { scoreA, scoreB, scoreC, total: scoreA + scoreB + scoreC }
    }

    const getGrade = (total) => {
        if (total >= 101) return 'A1'
        if (total >= 91) return 'A'
        if (total >= 76) return 'B'
        if (total >= 66) return 'C'
        return 'D'
    }

    const loadGradingData = async () => {
        if (!employee || !employee.employeeId) return

        try {
            const { data, error } = await supabase
                .from('performance_reviews')
                .select('*')
                .eq('employee_code', employee.employeeId)
                .eq('month', month)
                .maybeSingle()

            if (data) {
                setGradingReviewId(data.id)
                setGradingStatus(data.status || 'draft')
                setSelfAssessment(data.self_assessment || {})
                setSupervisorAssessment(data.supervisor_assessment || {})
                setSelfComment(data.self_comment || '')
                setSupervisorComment(data.supervisor_comment || '')
            } else {
                setGradingReviewId(null)
                setGradingStatus('draft')
                setSelfAssessment({})
                setSupervisorAssessment({})
                setSelfComment('')
                setSupervisorComment('')
            }
        } catch (err) {
            console.error("Error loading grading:", err)
        }
    }

    const handleGradingSave = async (newStatus = 'draft') => {
        if (!employee || !employee.employeeId) return

        const selfTotals = calculateTotals(selfAssessment)
        const supervisorTotals = calculateTotals(supervisorAssessment)

        const payload = {
            employee_code: employee.employeeId,
            month,
            self_assessment: selfAssessment,
            supervisor_assessment: supervisorAssessment,
            self_comment: selfComment,
            supervisor_comment: supervisorComment,
            self_total_score: selfTotals.total,
            self_grade: getGrade(selfTotals.total),
            supervisor_total_score: supervisorTotals.total,
            supervisor_grade: getGrade(supervisorTotals.total),
            status: newStatus
        }

        try {
            if (gradingReviewId) {
                await supabase.from('performance_reviews').update(payload).eq('id', gradingReviewId)
            } else {
                await supabase.from('performance_reviews').insert([payload])
            }
            alert('Đã lưu đánh giá!')
            loadGradingData()
        } catch (e) {
            alert('Lỗi khi lưu: ' + e.message)
        }
    }

    const loadEmployeeData = (emp) => {
        console.log('loadEmployeeData called with:', emp.ho_va_ten, emp.ngay_sinh || emp.date_of_birth, emp.gioi_tinh || emp.gender)
        // emp already contains spread profile data from Employees.jsx mapping
        setFormData(prev => ({
            ...DEFAULT_FORM_DATA,
            // Basic info - mapped from both Vietnamese keys and DB columns
            ho_va_ten: emp.ho_va_ten || ((emp.last_name || '') + ' ' + (emp.first_name || '')).trim() || '',
            employeeId: emp.employeeId || emp.employee_code || '',
            email: emp.email || emp.email_personal || '',
            sđt: emp.sđt || emp.sdt || emp.phone || '',
            chi_nhanh: emp.chi_nhanh || 'HCM',
            bo_phan: emp.bo_phan || emp.department || '',
            vi_tri: emp.vi_tri || emp.job_position || emp.current_position || '',
            trang_thai: emp.trang_thai || emp.status || 'Thử việc',
            ca_lam_viec: emp.ca_lam_viec || 'Ca full',
            ngay_vao_lam: emp.ngay_vao_lam || emp.join_date || '',
            ngay_lam_chinh_thuc: emp.ngay_lam_chinh_thuc || emp.official_date || '',
            cccd: emp.cccd || '',
            ngay_cap: emp.ngay_cap || '',
            noi_cap: emp.noi_cap || '',
            dia_chi_thuong_tru: emp.dia_chi_thuong_tru || emp.permanent_address || '',
            que_quan: emp.que_quan || emp.hometown || '',
            ngay_sinh: emp.ngay_sinh || emp.date_of_birth || '',
            gioi_tinh: emp.gioi_tinh || emp.gender || '',
            tinh_trang_hon_nhan: emp.tinh_trang_hon_nhan || '',
            avatarDataUrl: emp.avatarDataUrl || emp.avatarUrl || emp.avatar || '',
            // Extended profile fields - already in emp from spread
            nationality: emp.nationality || 'Việt Nam',
            place_of_birth: emp.place_of_birth || '',
            ethnicity: emp.ethnicity || 'Kinh',
            religion: emp.religion || 'Không',
            education_level: emp.education_level || '12/12',
            training_form: emp.training_form || 'Phổ Thông',
            academic_level_code: emp.academic_level_code || 'DH',
            marital_status_code: emp.marital_status_code || 1,
            card_number: emp.card_number || emp.so_the || '',
            // Contact info
            permanent_address: emp.permanent_address || emp.dia_chi_thuong_tru || '',
            temporary_address: emp.temporary_address || '',
            hometown: emp.hometown || emp.que_quan || '',
            phone: emp.phone || emp.sđt || '',
            email_acv: emp.email_acv || '',
            email_personal: emp.email_personal || emp.email || '',
            relative_phone: emp.relative_phone || '',
            relative_relation: emp.relative_relation || 'Khác',
            // Work info
            decision_number: emp.decision_number || '',
            join_date: emp.join_date || emp.ngay_vao_lam || '',
            official_date: emp.official_date || emp.ngay_lam_chinh_thuc || '',
            job_position: emp.job_position || emp.vi_tri || '',
            department: emp.department || emp.bo_phan || '',
            team: emp.team || '',
            group_name: emp.group_name || '',
            employee_type: emp.employee_type || 'MB NVCT',
            labor_type: emp.labor_type || '',
            job_title: emp.job_title || '',
            date_received_job_title: emp.date_received_job_title || '',
            current_position: emp.current_position || 'Khác',
            appointment_date: emp.appointment_date || '',
            concurrent_position: emp.concurrent_position || '',
            concurrent_job_title: emp.concurrent_job_title || '',
            concurrent_start_date: emp.concurrent_start_date || '',
            concurrent_end_date: emp.concurrent_end_date || '',
            leave_calculation_type: emp.leave_calculation_type || 'Có cộng dồn',
            // Party records
            is_party_member: emp.is_party_member || false,
            party_card_number: emp.party_card_number || '',
            party_join_date: emp.party_join_date || '',
            party_official_date: emp.party_official_date || '',
            party_position: emp.party_position || '',
            party_activity_location: emp.party_activity_location || '',
            political_education_level: emp.political_education_level || '',
            party_notes: emp.party_notes || '',
            // Youth union
            is_youth_union_member: emp.is_youth_union_member || false,
            youth_union_card_number: emp.youth_union_card_number || '',
            youth_union_join_date: emp.youth_union_join_date || '',
            youth_union_join_location: emp.youth_union_join_location || '',
            youth_union_position: emp.youth_union_position || '',
            youth_union_activity_location: emp.youth_union_activity_location || '',
            youth_union_notes: emp.youth_union_notes || '',
            // Trade union
            is_trade_union_member: emp.is_trade_union_member || false,
            trade_union_card_number: emp.trade_union_card_number || '',
            trade_union_join_date: emp.trade_union_join_date || '',
            trade_union_position: emp.trade_union_position || '',
            trade_union_activity_location: emp.trade_union_activity_location || '',
            trade_union_notes: emp.trade_union_notes || ''
        }))

        // Load Family Members if we have an employee code
        if (emp.employeeId || emp.employee_code) {
            const empCode = emp.employeeId || emp.employee_code
            const fetchFamily = async () => {
                let { data, error } = await supabase
                    .from('family_members')
                    .select('*')
                    .eq('employee_code', empCode)

                if (data) {
                    setFamilyMembers(data)
                }
            }
            fetchFamily()
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async () => {
        // Trigger save callback with data
        // For now, assume parent handles the actual DB save or we can do it here.
        // Re-using logic from EmployeeModal would be best.
        await onSave(formData, employee ? employee.id : null)
        setIsEditing(false)
    }

    const renderSectionMenu = () => (
        <div className="section-menu">
            <div className="menu-tools">
                <span className="menu-title">MỤC LỤC</span>
                <div className="tool-actions">
                    <button className="btn-tool"><i className="fas fa-file-export"></i> Export</button>
                    <button className="btn-tool"><i className="fas fa-file-import"></i> Import</button>
                </div>
            </div>
            <div className="menu-search">
                <input type="text" placeholder="Tìm mục..." />
            </div>

            <div className="menu-group">
                <div className="group-header">Sơ yếu lý lịch</div>
                <div className="group-content open">
                    <div className="sub-group-header"><i className="fas fa-caret-down"></i> Sơ yếu lý lịch</div>
                    <ul>
                        <li className={activeSection === 'ly_lich' ? 'active' : ''} onClick={() => setActiveSection('ly_lich')}>Lý lịch cá nhân</li>
                        <li className={activeSection === 'lien_he' ? 'active' : ''} onClick={() => setActiveSection('lien_he')}>Thông tin liên hệ</li>
                        <li className={activeSection === 'cong_viec' ? 'active' : ''} onClick={() => setActiveSection('cong_viec')}>Thông tin công việc</li>
                        <li className={activeSection === 'than_nhan' ? 'active' : ''} onClick={() => setActiveSection('than_nhan')}>Thân nhân</li>
                        <li className={activeSection === 'ho_so_dang' ? 'active' : ''} onClick={() => setActiveSection('ho_so_dang')}>Hồ sơ Đảng</li>
                        <li className={activeSection === 'doan_thanh_nien' ? 'active' : ''} onClick={() => setActiveSection('doan_thanh_nien')}>Đoàn thanh niên</li>
                        <li className={activeSection === 'cong_doan' ? 'active' : ''} onClick={() => setActiveSection('cong_doan')}>Công đoàn</li>
                        <li className={activeSection === 'grading' ? 'active' : ''} onClick={() => setActiveSection('grading')}>Đánh giá KPI</li>
                        <li className={activeSection === 'khac' ? 'active' : ''} onClick={() => setActiveSection('khac')}>Khác</li>
                    </ul>
                </div>
            </div>

            <div className="menu-group">
                <div className="group-header collapsed"><i className="fas fa-caret-right"></i> Thông tin pháp lý</div>
            </div>
            <div className="menu-group">
                <div className="group-header collapsed"><i className="fas fa-caret-right"></i> Phúc lợi</div>
            </div>
            <div className="menu-group">
                <div className="group-header collapsed"><i className="fas fa-caret-right"></i> Quá trình làm việc</div>
            </div>
            <div className="menu-group">
                <div className="group-header collapsed"><i className="fas fa-caret-right"></i> Kiến thức</div>
            </div>
            <div className="menu-group">
                <div className="group-header collapsed"><i className="fas fa-caret-right"></i> Khen thưởng kỷ luật</div>
            </div>
            <div className="menu-group">
                <div className="group-header collapsed"><i className="fas fa-caret-right"></i> Sức khoẻ - Hoạt động</div>
            </div>
        </div>
    )

    const renderThanNhan = () => (
        <div className="section-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Thân nhân</h3>
                <button className="btn btn-sm btn-outline-primary"><i className="fas fa-plus"></i> Thêm</button>
            </div>

            <div className="table-wrapper">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Quan hệ</th>
                            <th>Họ và tên</th>
                            <th>Ngày sinh</th>
                            <th>Giới tính</th>
                            <th>Giảm trừ gia cảnh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {familyMembers.length > 0 ? (
                            familyMembers.map((mem, idx) => (
                                <tr key={idx}>
                                    <td>{mem.relationship}</td>
                                    <td>{`${mem.last_name || ''} ${mem.first_name || ''}`.trim()}</td>
                                    <td>{mem.date_of_birth}</td>
                                    <td>{mem.gender}</td>
                                    <td className="text-center">
                                        {mem.is_dependent ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                                                    <i className="fas fa-check"></i> Có
                                                </span>
                                                {mem.dependent_from_month && (
                                                    <small className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                                                        Từ: {mem.dependent_from_month}
                                                    </small>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Chưa có thông tin thân nhân</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderDang = () => (
        <div className="section-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Hồ sơ Đảng</h3>
            </div>

            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600 }}>
                    <input
                        type="checkbox"
                        name="is_party_member"
                        checked={formData.is_party_member || false}
                        onChange={(e) => setFormData({ ...formData, is_party_member: e.target.checked })}
                        disabled={!isEditing}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Là Đảng viên
                </label>
            </div>

            {formData.is_party_member && (
                <>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Số thẻ Đảng viên</label>
                            <input
                                type="text"
                                name="party_card_number"
                                value={formData.party_card_number || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Chức vụ Đảng</label>
                            <input
                                type="text"
                                name="party_position"
                                value={formData.party_position || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Ngày kết nạp</label>
                            <input
                                type="date"
                                name="party_join_date"
                                value={formData.party_join_date || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày chính thức</label>
                            <input
                                type="date"
                                name="party_official_date"
                                value={formData.party_official_date || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Nơi sinh hoạt</label>
                        <input
                            type="text"
                            name="party_activity_location"
                            value={formData.party_activity_location || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Trình độ chính trị</label>
                        <select
                            name="political_education_level"
                            value={formData.political_education_level || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        >
                            <option value="">-- Chọn trình độ --</option>
                            <option value="Sơ cấp">Sơ cấp</option>
                            <option value="Trung cấp">Trung cấp</option>
                            <option value="Cao cấp">Cao cấp</option>
                            <option value="Cử nhân">Cử nhân</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Ghi chú</label>
                        <textarea
                            name="party_notes"
                            value={formData.party_notes || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={3}
                            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
                        />
                    </div>
                </>
            )}
        </div>
    )

    const renderDoan = () => (
        <div className="section-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Đoàn thanh niên</h3>
            </div>

            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600 }}>
                    <input
                        type="checkbox"
                        name="is_youth_union_member"
                        checked={formData.is_youth_union_member || false}
                        onChange={(e) => setFormData({ ...formData, is_youth_union_member: e.target.checked })}
                        disabled={!isEditing}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Là Đoàn viên
                </label>
            </div>

            {formData.is_youth_union_member && (
                <>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Số thẻ Đoàn viên</label>
                            <input
                                type="text"
                                name="youth_union_card_number"
                                value={formData.youth_union_card_number || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Chức vụ Đoàn</label>
                            <input
                                type="text"
                                name="youth_union_position"
                                value={formData.youth_union_position || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Ngày vào Đoàn</label>
                            <input
                                type="date"
                                name="youth_union_join_date"
                                value={formData.youth_union_join_date || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nơi vào Đoàn</label>
                            <input
                                type="text"
                                name="youth_union_join_location"
                                value={formData.youth_union_join_location || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Nơi sinh hoạt</label>
                        <input
                            type="text"
                            name="youth_union_activity_location"
                            value={formData.youth_union_activity_location || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Ghi chú</label>
                        <textarea
                            name="youth_union_notes"
                            value={formData.youth_union_notes || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={3}
                            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
                        />
                    </div>
                </>
            )}
        </div>
    )

    const renderCongDoan = () => (
        <div className="section-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Công đoàn</h3>
            </div>

            <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600 }}>
                    <input
                        type="checkbox"
                        name="is_trade_union_member"
                        checked={formData.is_trade_union_member || false}
                        onChange={(e) => setFormData({ ...formData, is_trade_union_member: e.target.checked })}
                        disabled={!isEditing}
                        style={{ width: '20px', height: '20px' }}
                    />
                    Là Công đoàn viên
                </label>
            </div>

            {formData.is_trade_union_member && (
                <>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Số thẻ Công đoàn</label>
                            <input
                                type="text"
                                name="trade_union_card_number"
                                value={formData.trade_union_card_number || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Chức vụ Công đoàn</label>
                            <input
                                type="text"
                                name="trade_union_position"
                                value={formData.trade_union_position || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Ngày gia nhập</label>
                            <input
                                type="date"
                                name="trade_union_join_date"
                                value={formData.trade_union_join_date || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nơi sinh hoạt</label>
                            <input
                                type="text"
                                name="trade_union_activity_location"
                                value={formData.trade_union_activity_location || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Ghi chú</label>
                        <textarea
                            name="trade_union_notes"
                            value={formData.trade_union_notes || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={3}
                            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
                        />
                    </div>
                </>
            )}
        </div>
    )

    const renderLyLich = () => (
        <div className="section-content">
            <h3>Lý lịch cá nhân</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

            <div className="grid-2">
                <div className="form-group">
                    <label>Mã nhân viên</label>
                    <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Số thẻ</label>
                    <input type="text" name="card_number" value={formData.card_number} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Họ</label>
                    <input type="text" value={formData.ho_va_ten.split(' ').slice(0, -1).join(' ')} disabled />
                </div>
                <div className="form-group">
                    <label>Tên</label>
                    <input type="text" value={formData.ho_va_ten.split(' ').slice(-1).join(' ')} disabled />
                </div>
                <div className="form-group full-width">
                    <label>Họ và tên đầy đủ</label>
                    <input type="text" name="ho_va_ten" value={formData.ho_va_ten} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Giới tính</label>
                    <select name="gioi_tinh" value={formData.gioi_tinh} onChange={handleChange} disabled={!isEditing}>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Ngày sinh</label>
                    <input type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Quốc tịch</label>
                    <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Nơi sinh</label>
                    <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Dân tộc</label>
                    <input type="text" name="ethnicity" value={formData.ethnicity} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Tôn giáo</label>
                    <input type="text" name="religion" value={formData.religion} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Trình độ văn hoá</label>
                    <select name="education_level" value={formData.education_level} onChange={handleChange} disabled={!isEditing}>
                        <option value="12/12">12/12</option>
                        <option value="10/12">10/12</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Hình thức đào tạo</label>
                    <select name="training_form" value={formData.training_form} onChange={handleChange} disabled={!isEditing}>
                        <option value="Phổ Thông">Phổ Thông</option>
                        <option value="Bổ túc">Bổ túc</option>
                    </select>
                </div>
            </div>
            <div className="grid-2">
                <div className="form-group">
                    <label>Tình trạng hôn nhân</label>
                    <select name="marital_status_code" value={formData.marital_status_code} onChange={handleChange} disabled={!isEditing}>
                        <option value={1}>Độc thân</option>
                        <option value={2}>Đã kết hôn</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Trình độ học vấn</label>
                    <select name="academic_level_code" value={formData.academic_level_code} onChange={handleChange} disabled={!isEditing}>
                        <option value="DH">Đại học</option>
                        <option value="CD">Cao đẳng</option>
                    </select>
                </div>
            </div>
        </div>
    )

    const renderLienHe = () => (
        <div className="section-content">
            <h3>Thông tin liên hệ</h3>
            <div className="grid-2">
                <div className="form-group">
                    <label>Số điện thoại</label>
                    <input type="text" name="sđt" value={formData.sđt} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Email cá nhân</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Email ACV</label>
                    <input type="email" name="email_acv" value={formData.email_acv} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Điện thoại người thân</label>
                    <input type="text" name="relative_phone" value={formData.relative_phone} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>
            <div className="form-group full-width">
                <label>Địa chỉ thường trú</label>
                <input type="text" name="permanent_address" value={formData.permanent_address} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="form-group full-width">
                <label>Địa chỉ tạm trú</label>
                <input type="text" name="temporary_address" value={formData.temporary_address} onChange={handleChange} disabled={!isEditing} />
            </div>
            <div className="form-group full-width">
                <label>Quê quán</label>
                <input type="text" name="que_quan" value={formData.que_quan} onChange={handleChange} disabled={!isEditing} />
            </div>
        </div>

    )

    const renderCongViec = () => (
        <div className="section-content">
            <h3>Thông tin công việc</h3>

            <div className="form-group full-width" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    disabled={true}
                    style={{ background: '#f5f5f5', border: 'none', fontWeight: 'bold', width: '100px' }}
                />
                <span style={{ fontWeight: 'bold', marginLeft: '10px' }}>{formData.ho_va_ten}</span>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Số QĐ</label>
                    <input type="text" name="decision_number" value={formData.decision_number} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày vào làm</label>
                    <input type="date" name="join_date" value={formData.join_date} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày thành NVCT</label>
                    <input type="date" name="official_date" value={formData.official_date} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Vị trí công việc</label>
                    <input type="text" name="job_position" value={formData.job_position} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Phòng</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Tổ</label>
                    <input type="text" name="group_name" value={formData.group_name} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Đội</label>
                    <input type="text" name="team" value={formData.team} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Loại nhân viên</label>
                    <select name="employee_type" value={formData.employee_type} onChange={handleChange} disabled={!isEditing}>
                        <option value="MB NVCT">Nhân viên chính thức (MB NVCT)</option>
                        <option value="NVGT">Nhân viên gián tiếp (NVGT)</option>
                        <option value="NVTV">Nhân viên thời vụ (NVTV)</option>
                        <option value="NVTT">Nhân viên trực tiếp (NVTT)</option>
                        <option value="CBQL">Cán bộ quản lý (CBQL)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Loại lao động</label>
                    <input type="text" name="labor_type" value={formData.labor_type} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Chức danh công việc</label>
                    <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày nhận chức danh</label>
                    <input type="date" name="date_received_job_title" value={formData.date_received_job_title} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>

            <div className="grid-2">
                <div className="form-group">
                    <label>Chức vụ hiện tại</label>
                    <select name="current_position" value={formData.current_position} onChange={handleChange} disabled={!isEditing}>
                        <option value="Giám đốc">Giám đốc</option>
                        <option value="Phó giám đốc">Phó giám đốc</option>
                        <option value="Trưởng phòng">Trưởng phòng</option>
                        <option value="Phó trưởng phòng">Phó trưởng phòng</option>
                        <option value="Đội trưởng">Đội trưởng</option>
                        <option value="Đội phó">Đội phó</option>
                        <option value="Chủ đội">Chủ đội</option>
                        <option value="Tổ trưởng">Tổ trưởng</option>
                        <option value="Tổ phó">Tổ phó</option>
                        <option value="Chủ tổ">Chủ tổ</option>
                        <option value="Khác">Khác</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Ngày bổ nhiệm</label>
                    <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>
            <div className="grid-2">
                <div className="form-group">
                    <label>Chức vụ kiêm nhiệm</label>
                    <input type="text" name="concurrent_position" value={formData.concurrent_position} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Chức danh kiêm nhiệm</label>
                    <input type="text" name="concurrent_job_title" value={formData.concurrent_job_title} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>
            <div className="grid-2">
                <div className="form-group">
                    <label>Thời gian kiêm nhiệm từ ngày</label>
                    <input type="date" name="concurrent_start_date" value={formData.concurrent_start_date} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Đến ngày</label>
                    <input type="date" name="concurrent_end_date" value={formData.concurrent_end_date} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>
            <div className="grid-2">
                <div className="form-group">
                    <label>Đối tượng tính phép</label>
                    <select name="leave_calculation_type" value={formData.leave_calculation_type} onChange={handleChange} disabled={!isEditing}>
                        <option value="Có cộng dồn">Có cộng dồn</option>
                        <option value="Không cộng dồn">Không cộng dồn</option>
                    </select>
                </div>
            </div>
        </div>
    )

    const renderGrading = () => {
        // Derived state for calculations
        const selfTotals = calculateTotals(selfAssessment)
        const supervisorTotals = calculateTotals(supervisorAssessment)
        const selfGrade = getGrade(selfTotals.total)
        const supervisorGrade = getGrade(supervisorTotals.total)

        return (
            <div className="section-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Đánh giá KPI - Tháng {month}</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="form-control"
                            style={{ width: 'auto' }}
                        />
                        <span className={`badge badge-${gradingStatus === 'submitted' ? 'warning' : gradingStatus === 'approved' ? 'success' : 'secondary'}`}>
                            {gradingStatus === 'draft' ? 'Nháp' : gradingStatus === 'submitted' ? 'Đã nộp' : gradingStatus === 'approved' ? 'Đã duyệt' : gradingStatus}
                        </span>
                    </div>
                </div>

                {/* Detail Table */}
                <div className="table-wrapper">
                    <table className="table table-bordered table-hover">
                        <thead className="thead-light">
                            <tr>
                                <th style={{ width: '50%' }}>Tiêu chí đánh giá</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Max</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Tự ĐG</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>QL ĐG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Section A */}
                            <tr style={{ background: '#fff3cd' }}>
                                <td style={{ fontWeight: 'bold' }}>A. KHUNG ĐIỂM TRỪ [20 - Điểm trừ]</td>
                                <td className="text-center">20</td>
                                <td className="text-center text-danger font-weight-bold">{selfTotals.scoreA}</td>
                                <td className="text-center text-danger font-weight-bold">{supervisorTotals.scoreA}</td>
                            </tr>
                            {CRITERIA.find(c => c.section === 'A').items.map(item => (
                                <tr key={item.id}>
                                    <td style={{ paddingLeft: item.isHeader ? '10px' : '30px', fontWeight: item.isHeader ? 'bold' : 'normal' }}>
                                        {item.id} {item.title}
                                    </td>
                                    <td className="text-center">{item.isHeader ? item.maxScore : item.range}</td>
                                    <td className="text-center">
                                        {!item.isHeader && (
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={selfAssessment[item.id] || ''}
                                                onChange={(e) => setSelfAssessment({ ...selfAssessment, [item.id]: e.target.value })}
                                                style={{ width: '80px', margin: '0 auto' }}
                                            />
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {!item.isHeader && (
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={supervisorAssessment[item.id] || ''}
                                                onChange={(e) => setSupervisorAssessment({ ...supervisorAssessment, [item.id]: e.target.value })}
                                                style={{ width: '80px', margin: '0 auto' }}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Section B */}
                            <tr style={{ background: '#d4edda' }}>
                                <td style={{ fontWeight: 'bold' }}>B. KHUNG ĐIỂM ĐẠT</td>
                                <td className="text-center">80</td>
                                <td className="text-center text-success font-weight-bold">{selfTotals.scoreB}</td>
                                <td className="text-center text-success font-weight-bold">{supervisorTotals.scoreB}</td>
                            </tr>
                            {CRITERIA.find(c => c.section === 'B').items.map(item => (
                                <tr key={item.id}>
                                    <td style={{ paddingLeft: item.isHeader ? '10px' : '30px', fontWeight: item.isHeader ? 'bold' : 'normal' }}>
                                        {item.id.length > 5 ? `${item.id.split('.').slice(1).join('.')} ${item.title}` : `${item.id} ${item.title}`}
                                    </td>
                                    <td className="text-center">{item.isHeader ? item.maxScore : item.range}</td>
                                    <td className="text-center">
                                        {!item.isHeader && (
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={selfAssessment[item.id] || ''}
                                                onChange={(e) => setSelfAssessment({ ...selfAssessment, [item.id]: e.target.value })}
                                                min="0" max="10"
                                                style={{ width: '80px', margin: '0 auto' }}
                                            />
                                        )}
                                    </td>
                                    <td className="text-center">
                                        {!item.isHeader && (
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={supervisorAssessment[item.id] || ''}
                                                onChange={(e) => setSupervisorAssessment({ ...supervisorAssessment, [item.id]: e.target.value })}
                                                min="0" max="10"
                                                style={{ width: '80px', margin: '0 auto' }}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {/* Section C */}
                            <tr style={{ background: '#cce5ff' }}>
                                <td style={{ fontWeight: 'bold' }}>C. KHUNG ĐIỂM CỘNG</td>
                                <td className="text-center">15</td>
                                <td className="text-center text-primary font-weight-bold">{selfTotals.scoreC}</td>
                                <td className="text-center text-primary font-weight-bold">{supervisorTotals.scoreC}</td>
                            </tr>
                            {CRITERIA.find(c => c.section === 'C').items.map(item => (
                                <tr key={item.id}>
                                    <td style={{ paddingLeft: '10px' }}>{item.id} {item.title}</td>
                                    <td className="text-center">{item.range}</td>
                                    <td className="text-center">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-center"
                                            value={selfAssessment[item.id] || ''}
                                            onChange={(e) => setSelfAssessment({ ...selfAssessment, [item.id]: e.target.value })}
                                            min="0" max="15"
                                            style={{ width: '80px', margin: '0 auto' }}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm text-center"
                                            value={supervisorAssessment[item.id] || ''}
                                            onChange={(e) => setSupervisorAssessment({ ...supervisorAssessment, [item.id]: e.target.value })}
                                            min="0" max="15"
                                            style={{ width: '80px', margin: '0 auto' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Table */}
                <table className="table table-bordered mb-4" style={{ marginBottom: '20px' }}>
                    <thead className="thead-light">
                        <tr>
                            <th>Tiêu chí tổng hợp</th>
                            <th className="text-center">Tự ĐG</th>
                            <th className="text-center">Quản lý ĐG</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Tổng điểm</td>
                            <td className="text-center" style={{ fontWeight: 'bold', color: '#007bff' }}>{selfTotals.total}</td>
                            <td className="text-center" style={{ fontWeight: 'bold', color: '#007bff' }}>{supervisorTotals.total}</td>
                        </tr>
                        <tr>
                            <td>Xếp loại</td>
                            <td className="text-center">
                                <span className={`badge badge-${['A', 'A1'].includes(selfGrade) ? 'success' : selfGrade === 'B' ? 'primary' : 'warning'}`}>{selfGrade}</span>
                            </td>
                            <td className="text-center">
                                <span className={`badge badge-${['A', 'A1'].includes(supervisorGrade) ? 'success' : supervisorGrade === 'B' ? 'primary' : 'warning'}`}>{supervisorGrade}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="row mt-3">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Giải trình / Ý kiến nhân viên:</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={selfComment}
                                onChange={e => setSelfComment(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label>Ý kiến quản lý:</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={supervisorComment}
                                onChange={e => setSupervisorComment(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-right" style={{ textAlign: 'right' }}>
                    <button className="btn btn-primary" onClick={() => handleGradingSave('submitted')}>
                        <i className="fas fa-save"></i> Lưu kết quả đánh giá
                    </button>
                </div>
            </div>
        )
    }


    // End of renderGrading

    return (
        <div className="employee-detail-container">
            <div className="detail-sidebar">
                {renderSectionMenu()}
            </div>
            <div className="detail-main">
                <div className="detail-toolbar">
                    <div className="breadcrumbs">
                        Hồ sơ / <span>{activeSection}</span>
                    </div>
                    <div className="actions">
                        {!isEditing ? (
                            <button className="btn btn-link" onClick={() => setIsEditing(true)}>Sửa</button>
                        ) : (
                            <>
                                <button className="btn btn-link warning" onClick={() => {
                                    setIsEditing(false)
                                    if (employee) loadEmployeeData(employee) // reset
                                    else onCancel()
                                }}>Hủy</button>
                                <button className="btn btn-link primary" onClick={handleSubmit}>Lưu</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="detail-form-area">
                    {activeSection === 'ly_lich' && renderLyLich()}
                    {activeSection === 'lien_he' && renderLienHe()}
                    {activeSection === 'cong_viec' && renderCongViec()}

                    {activeSection === 'than_nhan' && renderThanNhan()}
                    {activeSection === 'ho_so_dang' && renderDang()}
                    {activeSection === 'doan_thanh_nien' && renderDoan()}
                    {activeSection === 'cong_doan' && renderCongDoan()}
                    {activeSection === 'grading' && renderGrading()}
                </div>
            </div>

        </div>
    )
}

export default EmployeeDetail
