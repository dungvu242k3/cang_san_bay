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
    trade_union_notes: '',

    // Legal Info
    identity_card_number: '',
    identity_card_issue_date: '',
    identity_card_issue_place: '',
    tax_code: '',
    health_insurance_number: '',
    health_insurance_issue_date: '',
    health_insurance_place: '',
    social_insurance_number: '',
    social_insurance_issue_date: '',
    unemployment_insurance_number: '',
    unemployment_insurance_issue_date: ''
}

function EmployeeDetail({ employee, onSave, onCancel, activeSection = 'ly_lich', onSectionChange }) {
    const { user: authUser } = useAuth()
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Use internal state if no external control
    const setActiveSection = onSectionChange || (() => { })

    // Sub-data states
    const [familyMembers, setFamilyMembers] = useState([])
    const [bankAccounts, setBankAccounts] = useState([])
    const [laborContracts, setLaborContracts] = useState([])
    const [passports, setPassports] = useState([])

    // Editing States for Lists
    const [editingBank, setEditingBank] = useState(null)
    const [editingContract, setEditingContract] = useState(null)
    const [editingPassport, setEditingPassport] = useState(null)

    // Welfare States
    const [salaries, setSalaries] = useState([])
    const [jobSalaries, setJobSalaries] = useState([])
    const [allowances, setAllowances] = useState([])
    const [otherIncomes, setOtherIncomes] = useState([])

    const [editingSalary, setEditingSalary] = useState(null)
    const [editingJobSalary, setEditingJobSalary] = useState(null)
    const [editingAllowance, setEditingAllowance] = useState(null)
    const [editingOtherIncome, setEditingOtherIncome] = useState(null)

    // CRUD Handlers
    // Bank Accounts
    const handleSaveBank = async (bank) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                bank_name: bank.bank_name,
                account_name: bank.account_name,
                account_number: bank.account_number,
                note: bank.note
            }
            let res
            if (bank.id) {
                res = await supabase.from('employee_bank_accounts').update(payload).eq('id', bank.id).select()
            } else {
                res = await supabase.from('employee_bank_accounts').insert([payload]).select()
            }
            if (res.error) throw res.error

            // Reload list
            const { data } = await supabase.from('employee_bank_accounts').select('*').eq('employee_code', employee.employeeId)
            setBankAccounts(data || [])
            setEditingBank(null)
        } catch (err) {
            alert('Lỗi lưu ngân hàng: ' + err.message)
        }
    }
    const handleDeleteBank = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return
        try {
            const { error } = await supabase.from('employee_bank_accounts').delete().eq('id', id)
            if (error) throw error
            setBankAccounts(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            alert('Lỗi xóa: ' + err.message)
        }
    }

    // Labor Contracts
    const handleSaveContract = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                contract_number: item.contract_number,
                signed_date: item.signed_date || null,
                effective_date: item.effective_date || null,
                expiration_date: item.expiration_date || null,
                contract_type: item.contract_type,
                duration: item.duration,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('labor_contracts').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('labor_contracts').insert([payload]).select()
            }
            if (res.error) throw res.error

            // Reload list
            const { data } = await supabase.from('labor_contracts').select('*').eq('employee_code', employee.employeeId).order('effective_date', { ascending: false })
            setLaborContracts(data || [])
            setEditingContract(null)
        } catch (err) {
            alert('Lỗi lưu hợp đồng: ' + err.message)
        }
    }
    const handleDeleteContract = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return
        try {
            const { error } = await supabase.from('labor_contracts').delete().eq('id', id)
            if (error) throw error
            setLaborContracts(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            alert('Lỗi xóa: ' + err.message)
        }
    }

    // Passports
    const handleSavePassport = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                passport_number: item.passport_number,
                passport_type: item.passport_type,
                issue_date: item.issue_date || null,
                issue_place: item.issue_place,
                expiration_date: item.expiration_date || null,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_passports').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_passports').insert([payload]).select()
            }
            if (res.error) throw res.error

            // Reload list
            const { data } = await supabase.from('employee_passports').select('*').eq('employee_code', employee.employeeId)
            setPassports(data || [])
            setEditingPassport(null)
        } catch (err) {
            alert('Lỗi lưu hộ chiếu: ' + err.message)
        }
    }
    const handleDeletePassport = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return
        try {
            const { error } = await supabase.from('employee_passports').delete().eq('id', id)
            if (error) throw error
            setPassports(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            alert('Lỗi xóa: ' + err.message)
        }
    }

    // Welfare Handler: 3.1 Basic Salary
    const handleSaveSalary = async (item) => {
        try {
            // Auto calc basic_salary if missing
            let basic_salary = item.basic_salary
            if (!basic_salary && item.minimum_wage && item.salary_coefficient) {
                basic_salary = Number(item.minimum_wage) * Number(item.salary_coefficient)
            }

            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                effective_date: item.effective_date,
                salary_scale: item.salary_scale,
                salary_level: item.salary_level,
                salary_coefficient: item.salary_coefficient,
                minimum_wage: item.minimum_wage,
                basic_salary: basic_salary,
                social_insurance_salary: item.social_insurance_salary,
                salary_unit_price: item.salary_unit_price,
                contract_salary: item.contract_salary,
                date_received_level: item.date_received_level,
                is_active: item.is_active || false,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_salaries').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_salaries').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_salaries').select('*').eq('employee_code', employee.employeeId).order('effective_date', { ascending: false })
            setSalaries(data || [])
            setEditingSalary(null)
        } catch (err) {
            alert('Lỗi lưu lương cơ bản: ' + err.message)
        }
    }
    const handleDeleteSalary = async (id) => {
        if (!confirm('Xóa thông tin lương cơ bản này?')) return
        try {
            await supabase.from('employee_salaries').delete().eq('id', id)
            setSalaries(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Welfare Handler: 3.2 Job Position Salary
    const handleSaveJobSalary = async (item) => {
        try {
            let position_salary = item.position_salary
            if (!position_salary && item.minimum_wage && item.salary_level && item.salary_coefficient) {
                position_salary = Number(item.minimum_wage) * Number(item.salary_level) * Number(item.salary_coefficient)
            }

            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                effective_date: item.effective_date,
                salary_scale: item.salary_scale,
                minimum_wage: item.minimum_wage,
                salary_level: item.salary_level,
                salary_coefficient: item.salary_coefficient,
                position_salary: position_salary,
                signed_date: item.signed_date,
                attachment_url: item.attachment_url,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_job_salaries').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_job_salaries').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_job_salaries').select('*').eq('employee_code', employee.employeeId).order('effective_date', { ascending: false })
            setJobSalaries(data || [])
            setEditingJobSalary(null)
        } catch (err) {
            alert('Lỗi lưu lương vị trí: ' + err.message)
        }
    }
    const handleDeleteJobSalary = async (id) => {
        if (!confirm('Xóa thông tin lương vị trí này?')) return
        try {
            await supabase.from('employee_job_salaries').delete().eq('id', id)
            setJobSalaries(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Welfare Handler: 3.3 Allowances
    const handleSaveAllowance = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                effective_date: item.effective_date,
                allowance_type: item.allowance_type,
                allowance_level: item.allowance_level,
                amount: item.amount,
                attachment_url: item.attachment_url,
                is_active: item.is_active || false,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_allowances').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_allowances').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_allowances').select('*').eq('employee_code', employee.employeeId).order('effective_date', { ascending: false })
            setAllowances(data || [])
            setEditingAllowance(null)
        } catch (err) {
            alert('Lỗi lưu phụ cấp: ' + err.message)
        }
    }
    const handleDeleteAllowance = async (id) => {
        if (!confirm('Xóa phụ cấp này?')) return
        try {
            await supabase.from('employee_allowances').delete().eq('id', id)
            setAllowances(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Welfare Handler: 3.4 Other Income
    const handleSaveOtherIncome = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                date_incurred: item.date_incurred,
                income_type: item.income_type,
                amount: item.amount,
                tax_amount: item.tax_amount,
                applied_month: item.applied_month,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_other_incomes').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_other_incomes').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_other_incomes').select('*').eq('employee_code', employee.employeeId).order('date_incurred', { ascending: false })
            setOtherIncomes(data || [])
            setEditingOtherIncome(null)
        } catch (err) {
            alert('Lỗi lưu thu nhập khác: ' + err.message)
        }
    }
    const handleDeleteOtherIncome = async (id) => {
        if (!confirm('Xóa khoản thu nhập này?')) return
        try {
            await supabase.from('employee_other_incomes').delete().eq('id', id)
            setOtherIncomes(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Grading States
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
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
                setSelfAssessment(data.self_assessment || {})
                setSupervisorAssessment(data.supervisor_assessment || {})
                setSelfComment(data.self_comment || '')
                setSupervisorComment(data.supervisor_comment || '')
                setIsGradingLocked(true) // Lock if data exists
            } else {
                setGradingReviewId(null)
                setSelfAssessment({})
                setSupervisorAssessment({})
                setSelfComment('')
                setSupervisorComment('')
            }
        } catch (err) {
            console.error("Error loading grading:", err)
        }
    }

    const handleGradingSave = async () => {
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
            supervisor_grade: getGrade(supervisorTotals.total)
        }

        try {
            if (gradingReviewId) {
                await supabase.from('performance_reviews').update(payload).eq('id', gradingReviewId)
            } else {
                await supabase.from('performance_reviews').insert([payload])
            }
            alert('Đã lưu đánh giá!')
            setIsGradingLocked(true) // Lock after save
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
            trade_union_notes: emp.trade_union_notes || '',
            // Legal items
            identity_card_number: emp.identity_card_number || emp.cccd || '',
            identity_card_issue_date: emp.identity_card_issue_date || emp.ngay_cap || '',
            identity_card_issue_place: emp.identity_card_issue_place || emp.noi_cap || '',
            tax_code: emp.tax_code || '',
            health_insurance_number: emp.health_insurance_number || '',
            health_insurance_issue_date: emp.health_insurance_issue_date || '',
            health_insurance_place: emp.health_insurance_place || '',
            social_insurance_number: emp.social_insurance_number || '',
            social_insurance_issue_date: emp.social_insurance_issue_date || '',
            unemployment_insurance_number: emp.unemployment_insurance_number || '',
            unemployment_insurance_issue_date: emp.unemployment_insurance_issue_date || ''
        }))

        const empCode = emp.employeeId || emp.employee_code
        console.log('loadEmployeeData: Determined empCode:', empCode)
        const fetchFamily = async () => {
            if (!empCode) {
                console.error('No empCode found, skipping fetch')
                return
            }
            console.log('Fetching sub-data for empCode:', empCode)
            let { data, error } = await supabase
                .from('family_members')
                .select('*')
                .eq('employee_code', empCode)

            if (data) {
                setFamilyMembers(data)
            }

            // Fetch Bank Accounts
            const { data: bankData, error: bankError } = await supabase.from('employee_bank_accounts').select('*').eq('employee_code', empCode)
            console.log('Bank Data fetched:', bankData, 'Error:', bankError)
            if (bankData) setBankAccounts(bankData)

            // Fetch Labor Contracts
            const { data: contractData } = await supabase.from('labor_contracts').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false })
            if (contractData) setLaborContracts(contractData)

            // Fetch Passports
            const { data: passportData } = await supabase.from('employee_passports').select('*').eq('employee_code', empCode)
            if (passportData) setPassports(passportData)
            // Fetch Welfare Data
            // Salaries (3.1)
            const { data: salaryData } = await supabase.from('employee_salaries').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false })
            if (salaryData) setSalaries(salaryData)

            // Job Salaries (3.2)
            const { data: jobSalaryData } = await supabase.from('employee_job_salaries').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false })
            if (jobSalaryData) setJobSalaries(jobSalaryData)

            // Allowances (3.3)
            const { data: allowanceData } = await supabase.from('employee_allowances').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false })
            if (allowanceData) setAllowances(allowanceData)

            // Other Incomes (3.4)
            const { data: incomeData } = await supabase.from('employee_other_incomes').select('*').eq('employee_code', empCode).order('date_incurred', { ascending: false })
            if (incomeData) setOtherIncomes(incomeData)
        }
        fetchFamily()
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

    const renderActions = () => (
        <div className="section-actions" style={{
            position: 'absolute',
            top: '8px',
            right: '15px',
            zIndex: 100,
            background: 'rgba(255,255,255,0.5)',
            padding: '2px 8px',
            borderRadius: '4px'
        }}>
            {!isEditing ? (
                <button className="btn btn-link primary"
                    onClick={() => setIsEditing(true)}
                    style={{ fontSize: '0.8rem', padding: '2px 5px' }}
                >
                    <i className="fas fa-edit"></i> Sửa
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-link warning"
                        onClick={() => {
                            setIsEditing(false)
                            if (employee) loadEmployeeData(employee)
                            else onCancel()
                        }}
                        style={{ fontSize: '0.8rem', padding: '2px 5px' }}
                    >
                        <i className="fas fa-times"></i> Hủy
                    </button>
                    <button className="btn btn-link primary"
                        onClick={handleSubmit}
                        style={{ fontSize: '0.8rem', padding: '2px 5px' }}
                    >
                        <i className="fas fa-save"></i> Lưu
                    </button>
                </div>
            )}
        </div>
    )

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
                <input
                    type="text"
                    placeholder="Tìm mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="menu-group">
                <div className="group-header">Sơ yếu lý lịch</div>
                <div className="group-content open">
                    <div className="sub-group-header"><i className="fas fa-caret-down"></i> Sơ yếu lý lịch</div>
                    <ul>
                        {[
                            { id: 'ly_lich', label: 'Lý lịch cá nhân' },
                            { id: 'lien_he', label: 'Thông tin liên hệ' },
                            { id: 'cong_viec', label: 'Thông tin công việc' },
                            { id: 'than_nhan', label: 'Thân nhân' },
                            { id: 'ho_so_dang', label: 'Hồ sơ Đảng' },
                            { id: 'doan_thanh_nien', label: 'Đoàn thanh niên' },
                            { id: 'cong_doan', label: 'Công đoàn' },
                            { id: 'grading', label: 'Chấm điểm' },
                            { id: 'khac', label: 'Khác' },
                        ].filter(item =>
                            item.label.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(item => (
                            <li
                                key={item.id}
                                className={activeSection === item.id ? 'active' : ''}
                                onClick={() => setActiveSection(item.id)}
                            >
                                {item.label}
                            </li>
                        ))}
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
        <div className="section-content" style={{ background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Thân nhân</h3>
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                                    <td>
                                        {mem.is_dependent ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                                <span style={{
                                                    background: '#e8f5e9',
                                                    color: '#2e7d32',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <i className="fas fa-check" style={{ fontSize: '0.65rem' }}></i> Đang giảm trừ
                                                </span>
                                                {mem.dependent_from_month && (
                                                    <span style={{ fontSize: '0.7rem', color: '#999' }}>
                                                        Từ: {mem.dependent_from_month}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#ccc' }}>-</span>
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
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                            />
                        </div>
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
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                            />
                        </div>
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
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                        <div className="form-group full-width">
                            <label>Ghi chú</label>
                            <textarea
                                name="trade_union_notes"
                                value={formData.trade_union_notes || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                                rows={3}
                            />
                        </div>
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
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
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
        </div>

    )

    const renderCongViec = () => (
        <div className="section-content">
            <h3>Thông tin công việc</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                <div className="form-group">
                    <label>Vị trí công việc</label>
                    <input type="text" name="job_position" value={formData.job_position} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Phòng</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Tổ</label>
                    <input type="text" name="group_name" value={formData.group_name} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Đội</label>
                    <input type="text" name="team" value={formData.team} onChange={handleChange} disabled={!isEditing} />
                </div>
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
                <div className="form-group">
                    <label>Chức danh công việc</label>
                    <input type="text" name="job_title" value={formData.job_title} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày nhận chức danh</label>
                    <input type="date" name="date_received_job_title" value={formData.date_received_job_title} onChange={handleChange} disabled={!isEditing} />
                </div>
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
                <div className="form-group">
                    <label>Chức vụ kiêm nhiệm</label>
                    <input type="text" name="concurrent_position" value={formData.concurrent_position} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Chức danh kiêm nhiệm</label>
                    <input type="text" name="concurrent_job_title" value={formData.concurrent_job_title} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Thời gian kiêm nhiệm từ ngày</label>
                    <input type="date" name="concurrent_start_date" value={formData.concurrent_start_date} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Đến ngày</label>
                    <input type="date" name="concurrent_end_date" value={formData.concurrent_end_date} onChange={handleChange} disabled={!isEditing} />
                </div>
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

    const renderPhapLyChung = () => (
        <div className="section-content">
            <h3>Số CCCD - Số BH</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="grid-2">
                {/* CCCD */}
                <div className="form-group">
                    <label>Số CCCD / CMND</label>
                    <input type="text" name="identity_card_number" value={formData.identity_card_number} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày cấp</label>
                    <input type="date" name="identity_card_issue_date" value={formData.identity_card_issue_date} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group full-width">
                    <label>Nơi cấp</label>
                    <input type="text" name="identity_card_issue_place" value={formData.identity_card_issue_place} onChange={handleChange} disabled={!isEditing} />
                </div>

                {/* Tax */}
                <div className="form-group full-width">
                    <label>Mã số thuế</label>
                    <input type="text" name="tax_code" value={formData.tax_code} onChange={handleChange} disabled={!isEditing} />
                </div>

                {/* Insurance */}
                <div className="form-group">
                    <label>Số Bảo hiểm y tế</label>
                    <input type="text" name="health_insurance_number" value={formData.health_insurance_number} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Nơi KCB ban đầu</label>
                    <input type="text" name="health_insurance_place" value={formData.health_insurance_place} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày cấp BHYT</label>
                    <input type="date" name="health_insurance_issue_date" value={formData.health_insurance_issue_date} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group"></div> {/* Spacer */}

                <div className="form-group">
                    <label>Số Bảo hiểm xã hội</label>
                    <input type="text" name="social_insurance_number" value={formData.social_insurance_number} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày cấp BHXH</label>
                    <input type="date" name="social_insurance_issue_date" value={formData.social_insurance_issue_date} onChange={handleChange} disabled={!isEditing} />
                </div>

                <div className="form-group">
                    <label>Số Bảo hiểm thất nghiệp</label>
                    <input type="text" name="unemployment_insurance_number" value={formData.unemployment_insurance_number} onChange={handleChange} disabled={!isEditing} />
                </div>
                <div className="form-group">
                    <label>Ngày cấp BHTN</label>
                    <input type="date" name="unemployment_insurance_issue_date" value={formData.unemployment_insurance_issue_date} onChange={handleChange} disabled={!isEditing} />
                </div>
            </div>
        </div>
    )

    const renderTaiKhoanNganHang = () => (
        <div className="section-content">
            <h3>Tài khoản cá nhân</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

            <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingBank({})}>
                    <i className="fas fa-plus"></i> Thêm tài khoản
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Ngân hàng</th>
                            <th>Tên tài khoản</th>
                            <th>Số tài khoản</th>
                            <th>Ghi chú</th>
                            <th style={{ width: '100px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bankAccounts.length > 0 ? bankAccounts.map((item, index) => (
                            <tr key={item.id}>
                                <td className="text-center">{index + 1}</td>
                                <td>{item.bank_name}</td>
                                <td>{item.account_name}</td>
                                <td>{item.account_number}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button className="btn btn-sm btn-link" onClick={() => setEditingBank(item)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteBank(item.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center">Chưa có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingBank && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
                        <h4>{editingBank.id ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</h4>
                        <div className="form-group">
                            <label>Ngân hàng</label>
                            <input type="text" value={editingBank.bank_name || ''} onChange={e => setEditingBank({ ...editingBank, bank_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Tên tài khoản</label>
                            <input type="text" value={editingBank.account_name || ''} onChange={e => setEditingBank({ ...editingBank, account_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Số tài khoản</label>
                            <input type="text" value={editingBank.account_number || ''} onChange={e => setEditingBank({ ...editingBank, account_number: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Ghi chú</label>
                            <input type="text" value={editingBank.note || ''} onChange={e => setEditingBank({ ...editingBank, note: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditingBank(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleSaveBank(editingBank)}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderHopDongLaoDong = () => (
        <div className="section-content">
            <h3>Hợp đồng lao động</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

            <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingContract({})}>
                    <i className="fas fa-plus"></i> Thêm hợp đồng
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Số HĐ</th>
                            <th>Ngày ký</th>
                            <th>Hiệu lực</th>
                            <th>Hết hạn</th>
                            <th>Loại HĐ</th>
                            <th>Thời hạn</th>
                            <th>Ghi chú</th>
                            <th style={{ width: '90px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laborContracts.length > 0 ? laborContracts.map((item) => (
                            <tr key={item.id}>
                                <td>{item.contract_number}</td>
                                <td>{item.signed_date}</td>
                                <td>{item.effective_date}</td>
                                <td>{item.expiration_date}</td>
                                <td>{item.contract_type}</td>
                                <td>{item.duration}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button className="btn btn-sm btn-link" onClick={() => setEditingContract(item)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteContract(item.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="text-center">Chưa có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingContract && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h4>{editingContract.id ? 'Cập nhật hợp đồng' : 'Thêm hợp đồng mới'}</h4>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Số hợp đồng</label>
                                <input type="text" value={editingContract.contract_number || ''} onChange={e => setEditingContract({ ...editingContract, contract_number: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Loại hợp đồng</label>
                                <input type="text" value={editingContract.contract_type || ''} onChange={e => setEditingContract({ ...editingContract, contract_type: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ngày ký</label>
                                <input type="date" value={editingContract.signed_date || ''} onChange={e => setEditingContract({ ...editingContract, signed_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ngày hiệu lực</label>
                                <input type="date" value={editingContract.effective_date || ''} onChange={e => setEditingContract({ ...editingContract, effective_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ngày hết hạn</label>
                                <input type="date" value={editingContract.expiration_date || ''} onChange={e => setEditingContract({ ...editingContract, expiration_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Thời hạn</label>
                                <input type="text" value={editingContract.duration || ''} onChange={e => setEditingContract({ ...editingContract, duration: e.target.value })} />
                            </div>
                            <div className="form-group full-width">
                                <label>Ghi chú</label>
                                <textarea rows="2" value={editingContract.note || ''} onChange={e => setEditingContract({ ...editingContract, note: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditingContract(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleSaveContract(editingContract)}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderHoChieu = () => (
        <div className="section-content">
            <h3>Hộ chiếu</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

            <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingPassport({})}>
                    <i className="fas fa-plus"></i> Thêm hộ chiếu
                </button>
            </div>

            <div className="table-wrapper">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Số hộ chiếu</th>
                            <th>Loại</th>
                            <th>Ngày cấp</th>
                            <th>Nơi cấp</th>
                            <th>Hết hạn</th>
                            <th>Ghi chú</th>
                            <th style={{ width: '90px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {passports.length > 0 ? passports.map((item) => (
                            <tr key={item.id}>
                                <td>{item.passport_number}</td>
                                <td>{item.passport_type}</td>
                                <td>{item.issue_date}</td>
                                <td>{item.issue_place}</td>
                                <td>{item.expiration_date}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        <button className="btn btn-sm btn-link" onClick={() => setEditingPassport(item)}>
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeletePassport(item.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" className="text-center">Chưa có dữ liệu</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingPassport && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
                        <h4>{editingPassport.id ? 'Cập nhật hộ chiếu' : 'Thêm hộ chiếu mới'}</h4>
                        <div className="grid-2">
                            <div className="form-group">
                                <label>Số hộ chiếu</label>
                                <input type="text" value={editingPassport.passport_number || ''} onChange={e => setEditingPassport({ ...editingPassport, passport_number: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Loại hộ chiếu</label>
                                <input type="text" value={editingPassport.passport_type || ''} onChange={e => setEditingPassport({ ...editingPassport, passport_type: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ngày cấp</label>
                                <input type="date" value={editingPassport.issue_date || ''} onChange={e => setEditingPassport({ ...editingPassport, issue_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Nơi cấp</label>
                                <input type="text" value={editingPassport.issue_place || ''} onChange={e => setEditingPassport({ ...editingPassport, issue_place: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ngày hết hạn</label>
                                <input type="date" value={editingPassport.expiration_date || ''} onChange={e => setEditingPassport({ ...editingPassport, expiration_date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú</label>
                                <input type="text" value={editingPassport.note || ''} onChange={e => setEditingPassport({ ...editingPassport, note: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditingPassport(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleSavePassport(editingPassport)}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
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
                    <h3>Chấm điểm - Tháng {month ? month.split('-').reverse().join('/') : ''}</h3>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="form-control"
                        style={{ width: 'auto' }}
                    />
                </div>
                <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                                                disabled={isGradingLocked}
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
                                                disabled={isGradingLocked}
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
                                                disabled={isGradingLocked}
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
                                                disabled={isGradingLocked}
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
                                            disabled={isGradingLocked}
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
                                            disabled={isGradingLocked}
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
                                disabled={isGradingLocked}
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
                                disabled={isGradingLocked}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-right" style={{ textAlign: 'right' }}>
                    {isGradingLocked ? (
                        <button className="btn btn-warning" onClick={() => setIsGradingLocked(false)}>
                            <i className="fas fa-edit"></i> Sửa
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => handleGradingSave()}>
                            <i className="fas fa-save"></i> Lưu
                        </button>
                    )}
                </div>
            </div>
        )
    }


    // End of renderGrading

    // Welfare Render Functions
    // 3.1 Lương cơ bản
    const renderLuongCoBan = () => {
        const activeSalary = salaries.find(s => s.is_active) || {}

        // Calculate custom salary warning (3 years cycle)
        let warningMsg = null
        if (activeSalary.date_received_level) {
            const received = new Date(activeSalary.date_received_level)
            const nextRaise = new Date(received)
            nextRaise.setFullYear(received.getFullYear() + 3)
            const today = new Date()
            const diffDays = Math.ceil((nextRaise - today) / (1000 * 60 * 60 * 24))

            if (diffDays <= 90 && diffDays > 0) {
                warningMsg = <span className="text-warning"><i className="fas fa-exclamation-triangle"></i> Sắp nâng bậc: {nextRaise.toLocaleDateString('vi-VN')} ({diffDays} ngày)</span>
            } else if (diffDays <= 0) {
                warningMsg = <span className="text-danger"><i className="fas fa-exclamation-circle"></i> Quá hạn nâng bậc: {nextRaise.toLocaleDateString('vi-VN')}</span>
            }
        }

        return (
            <div className="section-content">
                <h3>Lương cơ bản</h3>
                <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

                {/* AREA 1: CURRENT INFO */}
                <div className="current-salary-info" style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1976d2', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        Thông tin hiện tại
                        {activeSalary.is_active && <span className="badge badge-success ml-2" style={{ marginLeft: '10px' }}>Đang hiệu lực</span>}
                    </h4>
                    <div className="grid-2">
                        <div className="form-group"><label>Số QĐ lương CB</label><div className="field-value">{activeSalary.decision_number || '-'}</div></div>
                        <div className="form-group"><label>Ngày hiệu lực</label><div className="field-value">{activeSalary.effective_date || '-'}</div></div>
                        <div className="form-group"><label>Ngạch lương</label><div className="field-value">{activeSalary.salary_scale || '-'}</div></div>
                        <div className="form-group"><label>Lương tối thiểu</label><div className="field-value">{activeSalary.minimum_wage ? Number(activeSalary.minimum_wage).toLocaleString('vi-VN') : '-'}</div></div>
                        <div className="form-group"><label>Bậc lương</label><div className="field-value">{activeSalary.salary_level || '-'}</div></div>
                        <div className="form-group">
                            <label>Ngày nhận bậc lương</label>
                            <div className="field-value">
                                {activeSalary.date_received_level || '-'}
                                {warningMsg && <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>{warningMsg}</div>}
                            </div>
                        </div>
                        <div className="form-group"><label>Hệ số lương</label><div className="field-value">{activeSalary.salary_coefficient || '-'}</div></div>
                        <div className="form-group"><label>Lương cơ bản</label><div className="field-value font-weight-bold">{activeSalary.basic_salary ? Number(activeSalary.basic_salary).toLocaleString('vi-VN') : '-'}</div></div>
                        <div className="form-group"><label>Lương đóng BHXH</label><div className="field-value">{activeSalary.social_insurance_salary ? Number(activeSalary.social_insurance_salary).toLocaleString('vi-VN') : '-'}</div></div>
                        <div className="form-group full-width"><label>Ghi chú</label><div className="field-value">{activeSalary.note || '-'}</div></div>
                    </div>
                </div>

                {/* AREA 2: HISTORY TABLE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Diễn biến lương</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setEditingSalary({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Ngày hiệu lực</th>
                                <th>Hệ số</th>
                                <th>Lương CB</th>
                                <th>Lương BHXH</th>
                                <th>Đơn giá</th>
                                <th>Lương khoán</th>
                                <th style={{ textAlign: 'center' }}>Hiệu lực</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaries.length > 0 ? salaries.map(item => (
                                <tr key={item.id}>
                                    <td>{item.decision_number}</td>
                                    <td>{item.effective_date}</td>
                                    <td>{item.salary_coefficient}</td>
                                    <td>{Number(item.basic_salary).toLocaleString('vi-VN')}</td>
                                    <td>{Number(item.social_insurance_salary).toLocaleString('vi-VN')}</td>
                                    <td>{item.salary_unit_price ? Number(item.salary_unit_price).toLocaleString('vi-VN') : '-'}</td>
                                    <td>{item.contract_salary ? Number(item.contract_salary).toLocaleString('vi-VN') : '-'}</td>
                                    <td className="text-center">
                                        <input type="checkbox" checked={item.is_active || false} disabled />
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-link btn-sm" onClick={() => setEditingSalary(item)}><i className="fas fa-edit"></i></button>
                                        <button className="btn btn-link btn-sm text-danger" onClick={() => handleDeleteSalary(item.id)}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="9" className="text-center">Chưa có dữ liệu</td></tr>}
                        </tbody>
                    </table>
                </div>

                {editingSalary && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                            <h4>{editingSalary.id ? 'Cập nhật lương cơ bản' : 'Thêm mới lương cơ bản'}</h4>
                            <div className="grid-2">
                                <div className="form-group"><label>Số QĐ</label><input type="text" value={editingSalary.decision_number || ''} onChange={e => setEditingSalary({ ...editingSalary, decision_number: e.target.value })} /></div>
                                <div className="form-group"><label>Ngày hiệu lực</label><input type="date" value={editingSalary.effective_date || ''} onChange={e => setEditingSalary({ ...editingSalary, effective_date: e.target.value })} /></div>
                                <div className="form-group"><label>Ngạch lương</label><input type="text" value={editingSalary.salary_scale || ''} onChange={e => setEditingSalary({ ...editingSalary, salary_scale: e.target.value })} /></div>
                                <div className="form-group"><label>Bậc lương</label><input type="text" value={editingSalary.salary_level || ''} onChange={e => setEditingSalary({ ...editingSalary, salary_level: e.target.value })} /></div>
                                <div className="form-group"><label>Lương tối thiểu</label><input type="number" value={editingSalary.minimum_wage || ''} onChange={e => setEditingSalary({ ...editingSalary, minimum_wage: e.target.value })} /></div>
                                <div className="form-group"><label>Hệ số lương</label><input type="number" step="0.01" value={editingSalary.salary_coefficient || ''} onChange={e => setEditingSalary({ ...editingSalary, salary_coefficient: e.target.value })} /></div>
                                <div className="form-group"><label>Lương đóng BHXH</label><input type="number" value={editingSalary.social_insurance_salary || ''} onChange={e => setEditingSalary({ ...editingSalary, social_insurance_salary: e.target.value })} /></div>
                                <div className="form-group"><label>Đơn giá lương</label><input type="number" value={editingSalary.salary_unit_price || ''} onChange={e => setEditingSalary({ ...editingSalary, salary_unit_price: e.target.value })} /></div>
                                <div className="form-group"><label>Mức lương khoán</label><input type="number" value={editingSalary.contract_salary || ''} onChange={e => setEditingSalary({ ...editingSalary, contract_salary: e.target.value })} /></div>
                                <div className="form-group"><label>Ngày nhận bậc</label><input type="date" value={editingSalary.date_received_level || ''} onChange={e => setEditingSalary({ ...editingSalary, date_received_level: e.target.value })} /></div>
                                <div className="form-group full-width">
                                    <label><input type="checkbox" checked={editingSalary.is_active || false} onChange={e => setEditingSalary({ ...editingSalary, is_active: e.target.checked })} /> Đang hiệu lực</label>
                                </div>
                                <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingSalary.note || ''} onChange={e => setEditingSalary({ ...editingSalary, note: e.target.value })} /></div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setEditingSalary(null)}>Hủy</button>
                                <button className="btn btn-primary" onClick={() => handleSaveSalary(editingSalary)}>Lưu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // 3.2 Lương vị trí
    const renderLuongViTriCV = () => {
        // Since we order by effective_date desc, the first one is the "Current" or "Latest"
        const currentJobSalary = jobSalaries.length > 0 ? jobSalaries[0] : {}

        return (
            <div className="section-content">
                <h3>Lương theo vị trí công việc</h3>
                <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

                {/* AREA 1: CURRENT INFO */}
                <div className="current-salary-info" style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1976d2', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        Thông tin hiện tại
                    </h4>
                    <div className="grid-2">
                        <div className="form-group"><label>Số quyết định</label><div className="field-value">{currentJobSalary.decision_number || '-'}</div></div>
                        <div className="form-group"><label>Ngày hiệu lực</label><div className="field-value">{currentJobSalary.effective_date || '-'}</div></div>
                        <div className="form-group"><label>Ngạch lương</label><div className="field-value">{currentJobSalary.salary_scale || '-'}</div></div>
                        <div className="form-group"><label>Mức tối thiểu</label><div className="field-value">{currentJobSalary.minimum_wage ? Number(currentJobSalary.minimum_wage).toLocaleString('vi-VN') : '-'}</div></div>
                        <div className="form-group"><label>Bậc lương</label><div className="field-value">{currentJobSalary.salary_level || '-'}</div></div>
                        <div className="form-group"><label>Hệ số lương</label><div className="field-value">{currentJobSalary.salary_coefficient || '-'}</div></div>
                        <div className="form-group"><label>Lương theo tính chất CV</label><div className="field-value font-weight-bold">{currentJobSalary.position_salary ? Number(currentJobSalary.position_salary).toLocaleString('vi-VN') : '-'}</div></div>
                        <div className="form-group"><label>Ngày ký</label><div className="field-value">{currentJobSalary.signed_date || '-'}</div></div>
                        <div className="form-group"><label>TT đính kèm</label>
                            <div className="field-value">
                                {currentJobSalary.attachment_url ? (
                                    <a href={currentJobSalary.attachment_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <i className="fas fa-paperclip"></i> Xem file
                                    </a>
                                ) : '-'}
                            </div>
                        </div>
                        <div className="form-group full-width"><label>Ghi chú</label><div className="field-value">{currentJobSalary.note || '-'}</div></div>
                    </div>
                </div>

                {/* AREA 2: HISTORY TABLE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Diễn biến lương theo vị trí</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setEditingJobSalary({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Ngày hiệu lực</th>
                                <th>Ngạch/Bậc</th>
                                <th>Hệ số</th>
                                <th>Lương vị trí</th>
                                <th>Ngày ký</th>
                                <th>File</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobSalaries.length > 0 ? jobSalaries.map(item => (
                                <tr key={item.id}>
                                    <td>{item.decision_number}</td>
                                    <td>{item.effective_date}</td>
                                    <td>{item.salary_scale} / {item.salary_level}</td>
                                    <td>{item.salary_coefficient}</td>
                                    <td>{Number(item.position_salary).toLocaleString('vi-VN')}</td>
                                    <td>{item.signed_date}</td>
                                    <td>
                                        {item.attachment_url ? <a href={item.attachment_url} target="_blank" rel="noopener noreferrer"><i className="fas fa-file-pdf"></i></a> : '-'}
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-link btn-sm" onClick={() => setEditingJobSalary(item)}><i className="fas fa-edit"></i></button>
                                        <button className="btn btn-link btn-sm text-danger" onClick={() => handleDeleteJobSalary(item.id)}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="8" className="text-center">Chưa có dữ liệu</td></tr>}
                        </tbody>
                    </table>
                </div>

                {editingJobSalary && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                            <h4>{editingJobSalary.id ? 'Cập nhật lương vị trí' : 'Thêm mới lương vị trí'}</h4>
                            <div className="grid-2">
                                <div className="form-group"><label>Số QĐ</label><input type="text" value={editingJobSalary.decision_number || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, decision_number: e.target.value })} /></div>
                                <div className="form-group"><label>Ngày hiệu lực</label><input type="date" value={editingJobSalary.effective_date || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, effective_date: e.target.value })} /></div>
                                <div className="form-group"><label>Ngạch lương</label><input type="text" value={editingJobSalary.salary_scale || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, salary_scale: e.target.value })} /></div>
                                <div className="form-group"><label>Mức tối thiểu</label><input type="number" value={editingJobSalary.minimum_wage || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, minimum_wage: e.target.value })} /></div>
                                <div className="form-group"><label>Bậc lương</label><input type="number" value={editingJobSalary.salary_level || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, salary_level: e.target.value })} /></div>
                                <div className="form-group"><label>Hệ số lương</label><input type="number" step="0.01" value={editingJobSalary.salary_coefficient || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, salary_coefficient: e.target.value })} /></div>
                                <div className="form-group"><label>Ngày ký</label><input type="date" value={editingJobSalary.signed_date || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, signed_date: e.target.value })} /></div>
                                <div className="form-group"><label>Link đính kèm</label><input type="text" value={editingJobSalary.attachment_url || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, attachment_url: e.target.value })} /></div>
                                <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingJobSalary.note || ''} onChange={e => setEditingJobSalary({ ...editingJobSalary, note: e.target.value })} /></div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setEditingJobSalary(null)}>Hủy</button>
                                <button className="btn btn-primary" onClick={() => handleSaveJobSalary(editingJobSalary)}>Lưu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // 3.3 Phụ cấp
    const renderPhuCap = () => {
        // Find the latest active allowance or just the first one
        const currentAllowance = allowances.find(a => a.is_active) || allowances[0] || {}

        return (
            <div className="section-content">
                <h3>Phụ cấp</h3>
                <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

                {/* AREA 1: CURRENT INFO */}
                <div className="current-salary-info" style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1976d2', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        Thông tin hiện tại
                    </h4>
                    <div className="grid-2">
                        <div className="form-group"><label>Số quyết định</label><div className="field-value">{currentAllowance.decision_number || '-'}</div></div>
                        <div className="form-group"><label>Ngày hiệu lực</label><div className="field-value">{currentAllowance.effective_date || '-'}</div></div>
                        <div className="form-group"><label>Loại phụ cấp</label><div className="field-value">{currentAllowance.allowance_type || '-'}</div></div>
                        <div className="form-group"><label>Mức phụ cấp</label><div className="field-value">{currentAllowance.allowance_level || '-'}</div></div>
                        <div className="form-group"><label>Số tiền</label><div className="field-value font-weight-bold">{currentAllowance.amount ? Number(currentAllowance.amount).toLocaleString('vi-VN') : '-'}</div></div>
                        <div className="form-group"><label>TT đính kèm</label>
                            <div className="field-value">
                                {currentAllowance.attachment_url ? (
                                    <a href={currentAllowance.attachment_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <i className="fas fa-paperclip"></i> Xem file
                                    </a>
                                ) : '-'}
                            </div>
                        </div>
                        <div className="form-group full-width"><label>Ghi chú</label><div className="field-value">{currentAllowance.note || '-'}</div></div>
                    </div>
                </div>

                {/* AREA 2: HISTORY TABLE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Bảng diễn biến phụ cấp</h4>
                    <button className="btn btn-primary btn-sm" onClick={() => setEditingAllowance({})}>
                        <i className="fas fa-plus"></i> Thêm phụ cấp
                    </button>
                </div>

                <div className="table-wrapper">
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Ngày hiệu lực</th>
                                <th>Số quyết định</th>
                                <th>Loại phụ cấp</th>
                                <th>Số tiền</th>
                                <th>Mức phụ cấp</th>
                                <th style={{ textAlign: 'center' }}>Đang hiệu lực</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allowances.length > 0 ? allowances.map(item => (
                                <tr key={item.id}>
                                    <td>{item.effective_date}</td>
                                    <td>{item.decision_number}</td>
                                    <td>{item.allowance_type}</td>
                                    <td>{Number(item.amount).toLocaleString('vi-VN')}</td>
                                    <td>{item.allowance_level}</td>
                                    <td className="text-center">
                                        <input type="checkbox" checked={item.is_active || false} disabled />
                                    </td>
                                    <td className="text-center">
                                        <button className="btn btn-link btn-sm" onClick={() => setEditingAllowance(item)}><i className="fas fa-edit"></i></button>
                                        <button className="btn btn-link btn-sm text-danger" onClick={() => handleDeleteAllowance(item.id)}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="7" className="text-center">Chưa có dữ liệu</td></tr>}
                        </tbody>
                    </table>
                </div>

                {editingAllowance && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                            <h4>{editingAllowance.id ? 'Cập nhật phụ cấp' : 'Thêm phụ cấp'}</h4>
                            <div className="grid-2">
                                <div className="form-group"><label>Số quyết định</label><input type="text" value={editingAllowance.decision_number || ''} onChange={e => setEditingAllowance({ ...editingAllowance, decision_number: e.target.value })} /></div>
                                <div className="form-group"><label>Ngày hiệu lực</label><input type="date" value={editingAllowance.effective_date || ''} onChange={e => setEditingAllowance({ ...editingAllowance, effective_date: e.target.value })} /></div>
                                <div className="form-group"><label>Loại phụ cấp</label><input type="text" value={editingAllowance.allowance_type || ''} onChange={e => setEditingAllowance({ ...editingAllowance, allowance_type: e.target.value })} /></div>
                                <div className="form-group"><label>Mức phụ cấp</label><input type="text" value={editingAllowance.allowance_level || ''} onChange={e => setEditingAllowance({ ...editingAllowance, allowance_level: e.target.value })} /></div>
                                <div className="form-group"><label>Số tiền</label><input type="number" value={editingAllowance.amount || ''} onChange={e => setEditingAllowance({ ...editingAllowance, amount: e.target.value })} /></div>
                                <div className="form-group"><label>Link đính kèm</label><input type="text" value={editingAllowance.attachment_url || ''} onChange={e => setEditingAllowance({ ...editingAllowance, attachment_url: e.target.value })} /></div>
                                <div className="form-group full-width"><label><input type="checkbox" checked={editingAllowance.is_active || false} onChange={e => setEditingAllowance({ ...editingAllowance, is_active: e.target.checked })} /> Đang hiệu lực</label></div>
                                <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingAllowance.note || ''} onChange={e => setEditingAllowance({ ...editingAllowance, note: e.target.value })} /></div>
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setEditingAllowance(null)}>Hủy</button>
                                <button className="btn btn-primary" onClick={() => handleSaveAllowance(editingAllowance)}>Lưu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // 3.4 Thu nhập khác
    const renderThuNhapKhac = () => (
        <div className="section-content">
            <h3>Thu nhập khác</h3>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingOtherIncome({})}>
                    <i className="fas fa-plus"></i> Thêm thu nhập
                </button>
            </div>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Ngày phát sinh</th>
                            <th>Loại thu nhập</th>
                            <th>Số tiền</th>
                            <th>Thuế TN</th>
                            <th>Tính vào tháng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {otherIncomes.length > 0 ? otherIncomes.map(item => (
                            <tr key={item.id}>
                                <td>{item.date_incurred}</td>
                                <td>{item.income_type}</td>
                                <td>{Number(item.amount).toLocaleString('vi-VN')}</td>
                                <td>{Number(item.tax_amount).toLocaleString('vi-VN')}</td>
                                <td>{item.applied_month}</td>
                                <td className="text-center">
                                    <button className="btn btn-link btn-sm" onClick={() => setEditingOtherIncome(item)}><i className="fas fa-edit"></i></button>
                                    <button className="btn btn-link btn-sm text-danger" onClick={() => handleDeleteOtherIncome(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingOtherIncome && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '600px', maxWidth: '95%' }}>
                        <h4>{editingOtherIncome.id ? 'Cập nhật thu nhập' : 'Thêm thu nhập'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Ngày phát sinh</label><input type="date" value={editingOtherIncome.date_incurred || ''} onChange={e => setEditingOtherIncome({ ...editingOtherIncome, date_incurred: e.target.value })} /></div>
                            <div className="form-group"><label>Loại thu nhập</label><input type="text" value={editingOtherIncome.income_type || ''} onChange={e => setEditingOtherIncome({ ...editingOtherIncome, income_type: e.target.value })} /></div>
                            <div className="form-group"><label>Số tiền</label><input type="number" value={editingOtherIncome.amount || ''} onChange={e => setEditingOtherIncome({ ...editingOtherIncome, amount: e.target.value })} /></div>
                            <div className="form-group"><label>Thuế TN</label><input type="number" value={editingOtherIncome.tax_amount || ''} onChange={e => setEditingOtherIncome({ ...editingOtherIncome, tax_amount: e.target.value })} /></div>
                            <div className="form-group"><label>Tính vào tháng</label><input type="month" value={editingOtherIncome.applied_month || ''} onChange={e => setEditingOtherIncome({ ...editingOtherIncome, applied_month: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingOtherIncome.note || ''} onChange={e => setEditingOtherIncome({ ...editingOtherIncome, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setEditingOtherIncome(null)}>Hủy</button>
                            <button className="btn btn-primary" onClick={() => handleSaveOtherIncome(editingOtherIncome)}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="employee-detail-container">
            <div className="detail-main" style={{ position: 'relative' }}>
                {renderActions()}
                <div className="detail-form-area">
                    {activeSection === 'ly_lich' && renderLyLich()}
                    {activeSection === 'lien_he' && renderLienHe()}
                    {activeSection === 'cong_viec' && renderCongViec()}

                    {activeSection === 'than_nhan' && renderThanNhan()}
                    {activeSection === 'ho_so_dang' && renderDang()}
                    {activeSection === 'doan_thanh_nien' && renderDoan()}
                    {activeSection === 'cong_doan' && renderCongDoan()}
                    {activeSection === 'phap_ly_chung' && renderPhapLyChung()}
                    {activeSection === 'tai_khoan' && renderTaiKhoanNganHang()}
                    {activeSection === 'hop_dong' && renderHopDongLaoDong()}
                    {activeSection === 'ho_chieu' && renderHoChieu()}
                    {activeSection === 'luong_co_ban' && renderLuongCoBan()}
                    {activeSection === 'luong_vi_tri' && renderLuongViTriCV()}
                    {activeSection === 'phu_cap' && renderPhuCap()}
                    {activeSection === 'thu_nhap_khac' && renderThuNhapKhac()}
                    {activeSection === 'grading' && renderGrading()}
                </div>
            </div>
        </div>
    )
}

export default EmployeeDetail
