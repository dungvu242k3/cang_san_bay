import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { formatDateDisplay, formatMonthYearDisplay } from '../utils/helpers'

import './EmployeeDetail.css'

const CRITERIA_NVTT = [
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

// TODO: Update specific criteria for NVGT and CBQL when available
const CRITERIA_NVGT = [...CRITERIA_NVTT]
const CRITERIA_CBQL = [...CRITERIA_NVTT]

const getCriteria = (templateCode) => {
    switch (templateCode) {
        case 'NVGT': return CRITERIA_NVGT
        case 'CBQL': return CRITERIA_CBQL
        default: return CRITERIA_NVTT
    }
}

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
    score_template_code: 'NVTT', // Default template
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

const EmployeeDetail = ({ employee, onSave, onCancel, activeSection = 'ly_lich', onSectionChange, allowEditProfile = true }) => {
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
    const [editingFamilyMember, setEditingFamilyMember] = useState(null)

    // Welfare States
    const [salaries, setSalaries] = useState([])
    const [jobSalaries, setJobSalaries] = useState([])
    const [allowances, setAllowances] = useState([])
    const [otherIncomes, setOtherIncomes] = useState([])

    const [editingSalary, setEditingSalary] = useState(null)
    const [editingJobSalary, setEditingJobSalary] = useState(null)
    const [editingAllowance, setEditingAllowance] = useState(null)
    const [editingOtherIncome, setEditingOtherIncome] = useState(null)

    // Work Process States (4.x)
    const [leaves, setLeaves] = useState([])
    const [appointments, setAppointments] = useState([])
    const [workJournals, setWorkJournals] = useState([])

    const [editingLeave, setEditingLeave] = useState(null)
    const [editingAppointment, setEditingAppointment] = useState(null)
    const [editingWorkJournal, setEditingWorkJournal] = useState(null)

    // Knowledge States (5.x)
    const [trainingSpecializations, setTrainingSpecializations] = useState([])
    const [certificates, setCertificates] = useState([])
    const [internalTrainings, setInternalTrainings] = useState([])

    const [editingSpecialization, setEditingSpecialization] = useState(null)
    const [editingCertificate, setEditingCertificate] = useState(null)
    const [editingInternalTraining, setEditingInternalTraining] = useState(null)

    // Rewards & Discipline States (6.x)
    const [rewards, setRewards] = useState([])
    const [disciplines, setDisciplines] = useState([])

    const [editingReward, setEditingReward] = useState(null)
    const [editingDiscipline, setEditingDiscipline] = useState(null)

    // Health & Activities States (7.x)
    const [healthInsurance, setHealthInsurance] = useState(null)
    const [workAccidents, setWorkAccidents] = useState([])
    const [healthCheckups, setHealthCheckups] = useState([])

    const [editingHealthInsurance, setEditingHealthInsurance] = useState(null)
    const [editingWorkAccident, setEditingWorkAccident] = useState(null)
    const [editingHealthCheckup, setEditingHealthCheckup] = useState(null)

    // Helper: Get suggested template based on employee type
    const getSuggestedTemplate = (type) => {
        const map = {
            'MB NVCT': 'NVTT',
            'NVTV': 'NVTT',
            'NVTT': 'NVTT',
            'NVGT': 'NVGT',
            'CBQL': 'CBQL'
        }
        return map[type] || 'NVTT'
    }

    // Handler for Employee Type change with auto-suggest
    const handleEmployeeTypeChange = (e) => {
        const newType = e.target.value
        setFormData(prev => ({
            ...prev,
            employee_type: newType,
            score_template_code: getSuggestedTemplate(newType)
        }))
    }

    const handleSaveFamilyMember = async (member) => {
        if (!member.relationship || !member.first_name || !member.last_name) {
            alert('Vui lòng nhập đầy đủ: Quan hệ, Họ và Tên')
            return
        }
        try {
            const payload = {
                employee_code: employee.employeeId,
                relationship: member.relationship,
                first_name: member.first_name,
                last_name: member.last_name,
                date_of_birth: member.date_of_birth || null,
                gender: member.gender,
                is_dependent: member.is_dependent || false,
                dependent_from_month: member.is_dependent && member.dependent_from_month ? (member.dependent_from_month.includes('/') ? `${member.dependent_from_month.split('/')[1]}-${member.dependent_from_month.split('/')[0]}-01` : member.dependent_from_month) : null,
                note: member.note
            }
            let res
            if (member.id) {
                res = await supabase.from('family_members').update(payload).eq('id', member.id).select()
            } else {
                res = await supabase.from('family_members').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('family_members').select('*').eq('employee_code', employee.employeeId)
            setFamilyMembers(data || [])
            setEditingFamilyMember(null)
        } catch (err) {
            alert('Lỗi lưu thân nhân: ' + err.message)
        }
    }

    const handleDeleteFamilyMember = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa?')) return
        try {
            const { error } = await supabase.from('family_members').delete().eq('id', id)
            if (error) throw error
            setFamilyMembers(prev => prev.filter(item => item.id !== id))
        } catch (err) {
            alert('Lỗi xóa: ' + err.message)
        }
    }

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

    // Work Process Handler: 4.1 Nghỉ phép (Leaves)
    const handleSaveLeave = async (item) => {
        try {
            // Calculate leave_days if not provided
            let leave_days = item.leave_days
            if (!leave_days && item.from_date && item.to_date) {
                const from = new Date(item.from_date)
                const to = new Date(item.to_date)
                leave_days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1
            }

            const payload = {
                employee_code: employee.employeeId,
                leave_type: item.leave_type,
                reason: item.reason,
                from_date: item.from_date,
                to_date: item.to_date,
                leave_days: leave_days,
                total_deducted: item.total_deducted,
                remaining_leave: item.remaining_leave,
                status: item.status || 'Chờ duyệt',
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_leaves').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_leaves').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_leaves').select('*').eq('employee_code', employee.employeeId).order('from_date', { ascending: false })
            setLeaves(data || [])
            setEditingLeave(null)
        } catch (err) {
            alert('Lỗi lưu nghỉ phép: ' + err.message)
        }
    }
    const handleDeleteLeave = async (id) => {
        if (!confirm('Xóa thông tin nghỉ phép này?')) return
        try {
            await supabase.from('employee_leaves').delete().eq('id', id)
            setLeaves(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Work Process Handler: 4.2 Bổ nhiệm - Điều chuyển (Appointments)
    const handleSaveAppointment = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                applied_date: item.applied_date,
                job_title: item.job_title,
                position: item.position,
                department: item.department,
                workplace: item.workplace,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_appointments').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_appointments').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_appointments').select('*').eq('employee_code', employee.employeeId).order('applied_date', { ascending: false })
            setAppointments(data || [])
            setEditingAppointment(null)
        } catch (err) {
            alert('Lỗi lưu bổ nhiệm: ' + err.message)
        }
    }
    const handleDeleteAppointment = async (id) => {
        if (!confirm('Xóa thông tin bổ nhiệm này?')) return
        try {
            await supabase.from('employee_appointments').delete().eq('id', id)
            setAppointments(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Work Process Handler: 4.3 Nhật ký công tác (Work Journals)
    const handleSaveWorkJournal = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                from_date: item.from_date,
                to_date: item.to_date,
                work_location: item.work_location,
                purpose: item.purpose,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_work_journals').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_work_journals').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_work_journals').select('*').eq('employee_code', employee.employeeId).order('from_date', { ascending: false })
            setWorkJournals(data || [])
            setEditingWorkJournal(null)
        } catch (err) {
            alert('Lỗi lưu nhật ký công tác: ' + err.message)
        }
    }
    const handleDeleteWorkJournal = async (id) => {
        if (!confirm('Xóa nhật ký công tác này?')) return
        try {
            await supabase.from('employee_work_journals').delete().eq('id', id)
            setWorkJournals(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Knowledge Handler: 5.1 Chuyên ngành đào tạo (Training Specializations)
    const handleSaveSpecialization = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                specialization: item.specialization,
                from_date: item.from_date,
                to_date: item.to_date,
                training_place: item.training_place,
                education_level: item.education_level,
                training_type: item.training_type,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_training_specializations').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_training_specializations').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_training_specializations').select('*').eq('employee_code', employee.employeeId).order('from_date', { ascending: false })
            setTrainingSpecializations(data || [])
            setEditingSpecialization(null)
        } catch (err) {
            alert('Lỗi lưu chuyên ngành: ' + err.message)
        }
    }
    const handleDeleteSpecialization = async (id) => {
        if (!confirm('Xóa chuyên ngành đào tạo này?')) return
        try {
            await supabase.from('employee_training_specializations').delete().eq('id', id)
            setTrainingSpecializations(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Knowledge Handler: 5.2 Chứng chỉ (Certificates)
    const handleSaveCertificate = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                certificate_name: item.certificate_name,
                level: item.level,
                training_place: item.training_place,
                from_date: item.from_date,
                to_date: item.to_date,
                certificate_number: item.certificate_number,
                issue_date: item.issue_date,
                expiry_date: item.expiry_date,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_certificates').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_certificates').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_certificates').select('*').eq('employee_code', employee.employeeId).order('issue_date', { ascending: false })
            setCertificates(data || [])
            setEditingCertificate(null)
        } catch (err) {
            alert('Lỗi lưu chứng chỉ: ' + err.message)
        }
    }
    const handleDeleteCertificate = async (id) => {
        if (!confirm('Xóa chứng chỉ này?')) return
        try {
            await supabase.from('employee_certificates').delete().eq('id', id)
            setCertificates(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Knowledge Handler: 5.3 Đào tạo nội bộ (Internal Trainings)
    const handleSaveInternalTraining = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                class_code: item.class_code,
                from_date: item.from_date,
                to_date: item.to_date,
                decision_number: item.decision_number,
                training_place: item.training_place,
                training_course: item.training_course,
                result: item.result,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_internal_trainings').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_internal_trainings').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_internal_trainings').select('*').eq('employee_code', employee.employeeId).order('from_date', { ascending: false })
            setInternalTrainings(data || [])
            setEditingInternalTraining(null)
        } catch (err) {
            alert('Lỗi lưu đào tạo nội bộ: ' + err.message)
        }
    }
    const handleDeleteInternalTraining = async (id) => {
        if (!confirm('Xóa đào tạo nội bộ này?')) return
        try {
            await supabase.from('employee_internal_trainings').delete().eq('id', id)
            setInternalTrainings(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Rewards & Discipline Handler: 6.1 Khen thưởng (Rewards)
    const handleSaveReward = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                reward_type: item.reward_type,
                reward_content: item.reward_content,
                signed_date: item.signed_date,
                amount: item.amount,
                reward_date: item.reward_date,
                applied_year: item.applied_year,
                attachment_url: item.attachment_url,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_rewards').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_rewards').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_rewards').select('*').eq('employee_code', employee.employeeId).order('reward_date', { ascending: false })
            setRewards(data || [])
            setEditingReward(null)
        } catch (err) {
            alert('Lỗi lưu khen thưởng: ' + err.message)
        }
    }
    const handleDeleteReward = async (id) => {
        if (!confirm('Xóa khen thưởng này?')) return
        try {
            await supabase.from('employee_rewards').delete().eq('id', id)
            setRewards(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Rewards & Discipline Handler: 6.2 Kỷ luật (Disciplines)
    const handleSaveDiscipline = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                decision_number: item.decision_number,
                signed_date: item.signed_date,
                discipline_type: item.discipline_type,
                from_date: item.from_date,
                to_date: item.to_date,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_disciplines').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_disciplines').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_disciplines').select('*').eq('employee_code', employee.employeeId).order('signed_date', { ascending: false })
            setDisciplines(data || [])
            setEditingDiscipline(null)
        } catch (err) {
            alert('Lỗi lưu kỷ luật: ' + err.message)
        }
    }
    const handleDeleteDiscipline = async (id) => {
        if (!confirm('Xóa kỷ luật này?')) return
        try {
            await supabase.from('employee_disciplines').delete().eq('id', id)
            setDisciplines(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Health Handler: 7.1 Thẻ bảo hiểm y tế (Health Insurance)
    const handleSaveHealthInsurance = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                from_date: item.from_date,
                to_date: item.to_date,
                medical_facility: item.medical_facility,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_health_insurance').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_health_insurance').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_health_insurance').select('*').eq('employee_code', employee.employeeId).single()
            setHealthInsurance(data || null)
            setEditingHealthInsurance(null)
        } catch (err) {
            alert('Lỗi lưu thẻ BHYT: ' + err.message)
        }
    }

    // Health Handler: 7.2 Tai nạn lao động (Work Accidents)
    const handleSaveWorkAccident = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                accident_date: item.accident_date,
                accident_location: item.accident_location,
                leave_reason: item.leave_reason,
                accident_type: item.accident_type,
                leave_days: item.leave_days,
                employee_cost: item.employee_cost,
                property_damage: item.property_damage,
                compensation_amount: item.compensation_amount,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_work_accidents').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_work_accidents').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_work_accidents').select('*').eq('employee_code', employee.employeeId).order('accident_date', { ascending: false })
            setWorkAccidents(data || [])
            setEditingWorkAccident(null)
        } catch (err) {
            alert('Lỗi lưu tai nạn lao động: ' + err.message)
        }
    }
    const handleDeleteWorkAccident = async (id) => {
        if (!confirm('Xóa tai nạn lao động này?')) return
        try {
            await supabase.from('employee_work_accidents').delete().eq('id', id)
            setWorkAccidents(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Health Handler: 7.3 Khám sức khỏe (Health Checkups)
    const handleSaveHealthCheckup = async (item) => {
        try {
            const payload = {
                employee_code: employee.employeeId,
                checkup_date: item.checkup_date,
                expiry_date: item.expiry_date,
                checkup_location: item.checkup_location,
                cost: item.cost,
                result: item.result,
                attachment_url: item.attachment_url,
                note: item.note
            }
            let res
            if (item.id) {
                res = await supabase.from('employee_health_checkups').update(payload).eq('id', item.id).select()
            } else {
                res = await supabase.from('employee_health_checkups').insert([payload]).select()
            }
            if (res.error) throw res.error

            const { data } = await supabase.from('employee_health_checkups').select('*').eq('employee_code', employee.employeeId).order('checkup_date', { ascending: false })
            setHealthCheckups(data || [])
            setEditingHealthCheckup(null)
        } catch (err) {
            alert('Lỗi lưu khám sức khỏe: ' + err.message)
        }
    }
    const handleDeleteHealthCheckup = async (id) => {
        if (!confirm('Xóa khám sức khỏe này?')) return
        try {
            await supabase.from('employee_health_checkups').delete().eq('id', id)
            setHealthCheckups(prev => prev.filter(i => i.id !== id))
        } catch (err) { alert('Lỗi xóa: ' + err.message) }
    }

    // Grading States
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
    const [gradingReviewId, setGradingReviewId] = useState(null)
    const [selfAssessment, setSelfAssessment] = useState({})
    const [supervisorAssessment, setSupervisorAssessment] = useState({})
    const [selfComment, setSelfComment] = useState('')
    const [supervisorComment, setSupervisorComment] = useState('')
    const [isGradingLocked, setIsGradingLocked] = useState(false)

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
        const criteria = getCriteria(formData.score_template_code)

        let scoreA = 20
        const sectionA = criteria.find(c => c.section === 'A')
        sectionA.items.forEach(item => {
            if (!item.isHeader) scoreA -= Number(data[item.id] || 0)
        })
        scoreA = Math.max(0, scoreA)

        let scoreB = 0
        const sectionB = criteria.find(c => c.section === 'B')
        sectionB.items.forEach(item => {
            if (!item.isHeader) scoreB += Number(data[item.id] || 0)
        })
        scoreB = Math.min(80, scoreB)

        let scoreC = 0
        const sectionC = criteria.find(c => c.section === 'C')
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
            score_template_code: emp.score_template_code || 'NVTT',
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

            // Parallel fetch all data using Promise.all for better performance
            const [
                familyResult,
                bankResult,
                contractResult,
                passportResult,
                salaryResult,
                jobSalaryResult,
                allowanceResult,
                incomeResult,
                leaveResult,
                appointmentResult,
                journalResult,
                specResult,
                certResult,
                intTrainResult,
                rewardResult,
                disciplineResult,
                hiResult,
                accidentResult,
                checkupResult
            ] = await Promise.all([
                // Family members
                supabase.from('family_members').select('*').eq('employee_code', empCode),
                // Bank Accounts
                supabase.from('employee_bank_accounts').select('*').eq('employee_code', empCode),
                // Labor Contracts (3.0)
                supabase.from('labor_contracts').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false }),
                // Passports
                supabase.from('employee_passports').select('*').eq('employee_code', empCode),
                // Salaries (3.1)
                supabase.from('employee_salaries').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false }),
                // Job Salaries (3.2)
                supabase.from('employee_job_salaries').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false }),
                // Allowances (3.3)
                supabase.from('employee_allowances').select('*').eq('employee_code', empCode).order('effective_date', { ascending: false }),
                // Other Incomes (3.4)
                supabase.from('employee_other_incomes').select('*').eq('employee_code', empCode).order('date_incurred', { ascending: false }),
                // Leaves (4.1)
                supabase.from('employee_leaves').select('*').eq('employee_code', empCode).order('from_date', { ascending: false }),
                // Appointments (4.2)
                supabase.from('employee_appointments').select('*').eq('employee_code', empCode).order('applied_date', { ascending: false }),
                // Work Journals (4.3)
                supabase.from('employee_work_journals').select('*').eq('employee_code', empCode).order('from_date', { ascending: false }),
                // Training Specializations (5.1)
                supabase.from('employee_training_specializations').select('*').eq('employee_code', empCode).order('from_date', { ascending: false }),
                // Certificates (5.2)
                supabase.from('employee_certificates').select('*').eq('employee_code', empCode).order('issue_date', { ascending: false }),
                // Internal Trainings (5.3)
                supabase.from('employee_internal_trainings').select('*').eq('employee_code', empCode).order('from_date', { ascending: false }),
                // Rewards (6.1)
                supabase.from('employee_rewards').select('*').eq('employee_code', empCode).order('reward_date', { ascending: false }),
                // Disciplines (6.2)
                supabase.from('employee_disciplines').select('*').eq('employee_code', empCode).order('signed_date', { ascending: false }),
                // Health Insurance (7.1)
                supabase.from('employee_health_insurance').select('*').eq('employee_code', empCode).maybeSingle(),
                // Work Accidents (7.2)
                supabase.from('employee_work_accidents').select('*').eq('employee_code', empCode).order('accident_date', { ascending: false }),
                // Health Checkups (7.3)
                supabase.from('employee_health_checkups').select('*').eq('employee_code', empCode).order('checkup_date', { ascending: false })
            ])

            // Set all data states
            if (familyResult.data) setFamilyMembers(familyResult.data)
            if (bankResult.data) setBankAccounts(bankResult.data)
            if (contractResult.data) setLaborContracts(contractResult.data)
            if (passportResult.data) setPassports(passportResult.data)
            if (salaryResult.data) setSalaries(salaryResult.data)
            if (jobSalaryResult.data) setJobSalaries(jobSalaryResult.data)
            if (allowanceResult.data) setAllowances(allowanceResult.data)
            if (incomeResult.data) setOtherIncomes(incomeResult.data)
            if (leaveResult.data) setLeaves(leaveResult.data)
            if (appointmentResult.data) setAppointments(appointmentResult.data)
            if (journalResult.data) setWorkJournals(journalResult.data)
            if (specResult.data) setTrainingSpecializations(specResult.data)
            if (certResult.data) setCertificates(certResult.data)
            if (intTrainResult.data) setInternalTrainings(intTrainResult.data)
            if (rewardResult.data) setRewards(rewardResult.data)
            if (disciplineResult.data) setDisciplines(disciplineResult.data)
            setHealthInsurance(hiResult.data || null)
            if (accidentResult.data) setWorkAccidents(accidentResult.data)
            if (checkupResult.data) setHealthCheckups(checkupResult.data)
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

    const renderActions = (customAction) => {
        if (!allowEditProfile) return null
        return (
            <div className="header-actions">
                {customAction}
                {!isEditing ? (
                    <button className="btn-premium-outline btn-premium-sm"
                        onClick={() => setIsEditing(true)}
                        title="Chỉnh sửa hồ sơ"
                    >
                        <i className="fas fa-pencil-alt"></i> Sửa
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-premium-outline btn-premium-sm"
                            style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
                            onClick={() => {
                                setIsEditing(false)
                                if (employee) loadEmployeeData(employee)
                                else onCancel()
                            }}
                        >
                            <i className="fas fa-times"></i> Hủy
                        </button>
                        <button className="btn-premium btn-premium-sm"
                            onClick={handleSubmit}
                        >
                            <i className="fas fa-check"></i> Lưu
                        </button>
                    </div>
                )}
            </div>
        )
    }

    const renderSectionMenu = () => (
        <div className="section-menu">
            <div className="menu-tools">
                <span className="menu-title">MỤC LỤC</span>
                <div className="tool-actions">
                    <button className="btn-premium-outline btn-premium-sm" style={{ padding: '2px 10px', fontSize: '0.75rem' }}><i className="fas fa-file-export"></i> Export</button>
                    <button className="btn-premium-outline btn-premium-sm" style={{ padding: '2px 10px', fontSize: '0.75rem' }}><i className="fas fa-file-import"></i> Import</button>
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
            <div className="section-header-modern">
                <h3><i className="fas fa-users"></i> Thân nhân</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingFamilyMember({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
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
                            <th className="text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {familyMembers.length > 0 ? (
                            familyMembers.map((mem, idx) => (
                                <tr key={mem.id || idx}>
                                    <td>{mem.relationship}</td>
                                    <td>{`${mem.last_name || ''} ${mem.first_name || ''}`.trim()}</td>
                                    <td>{formatDateDisplay(mem.date_of_birth)}</td>
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
                                                        Từ: {formatMonthYearDisplay(mem.dependent_from_month)}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#ccc' }}>-</span>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <button className="btn-table-action" onClick={() => setEditingFamilyMember(mem)}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeleteFamilyMember(mem.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">Chưa có thông tin thân nhân</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingFamilyMember && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '650px', maxWidth: '95%', padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
                        <div className="modal-header" style={{ background: 'var(--primary)', color: '#fff', padding: '15px 25px' }}>
                            <h4 style={{ margin: 0, color: '#fff' }}>
                                <i className={`fas ${editingFamilyMember.id ? 'fa-user-edit' : 'fa-user-plus'}`} style={{ marginRight: '10px' }}></i>
                                {editingFamilyMember.id ? 'Cập nhật thân nhân' : 'Thêm mới thân nhân'}
                            </h4>
                            <button onClick={() => setEditingFamilyMember(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div className="modal-body" style={{ padding: '25px' }}>
                            <div className="form-section-title">
                                <i className="fas fa-info-circle"></i> Thông tin cơ bản
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label>Họ và tên đệm</label>
                                    <input type="text" placeholder="Vd: Nguyễn Văn" value={editingFamilyMember.last_name || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, last_name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Tên</label>
                                    <input type="text" placeholder="Vd: An" value={editingFamilyMember.first_name || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, first_name: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Mối quan hệ</label>
                                    <select value={editingFamilyMember.relationship || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, relationship: e.target.value })}>
                                        <option value="">Chọn quan hệ</option>
                                        <option value="Cha ruột">Cha ruột</option>
                                        <option value="Mẹ ruột">Mẹ ruột</option>
                                        <option value="Vợ">Vợ</option>
                                        <option value="Chồng">Chồng</option>
                                        <option value="Con ruột">Con ruột</option>
                                        <option value="Anh ruột">Anh ruột</option>
                                        <option value="Chị ruột">Chị ruột</option>
                                        <option value="Em ruột">Em ruột</option>
                                        <option value="Anh vợ">Anh vợ</option>
                                        <option value="Chị vợ">Chị vợ</option>
                                        <option value="Em vợ">Em vợ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Giới tính</label>
                                    <select value={editingFamilyMember.gender || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, gender: e.target.value })}>
                                        <option value="">Chọn giới tính</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Ngày sinh</label>
                                    <input type="date" value={editingFamilyMember.date_of_birth || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, date_of_birth: e.target.value })} />
                                </div>
                            </div>

                            <div className="form-section-title" style={{ marginTop: '20px' }}>
                                <i className="fas fa-hand-holding-usd"></i> Chính sách phụ thuộc
                            </div>

                            <div className="premium-switch-container">
                                <div className="switch-label-group">
                                    <span className="switch-main-label">Giảm trừ gia cảnh</span>
                                    <span className="switch-sub-label">Đăng ký người phụ thuộc để giảm trừ thuế TNCN</span>
                                </div>
                                <label className="premium-switch">
                                    <input type="checkbox" checked={editingFamilyMember.is_dependent || false} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, is_dependent: e.target.checked })} />
                                    <span className="premium-slider"></span>
                                </label>
                            </div>

                            {editingFamilyMember.is_dependent && (
                                <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                                    <label>Giảm trừ từ tháng (MM/YYYY)</label>
                                    <div style={{ position: 'relative' }}>
                                        <i className="far fa-calendar-alt" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}></i>
                                        <input type="text" placeholder="Vd: 01/2026" style={{ paddingLeft: '35px' }} value={editingFamilyMember.dependent_from_month || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, dependent_from_month: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            <div className="form-group full-width">
                                <label>Ghi chú</label>
                                <textarea rows="2" placeholder="Thêm ghi chú nếu có..." value={editingFamilyMember.note || ''} onChange={e => setEditingFamilyMember({ ...editingFamilyMember, note: e.target.value })} />
                            </div>
                        </div>

                        <div className="modal-actions" style={{ padding: '20px 25px', background: '#f9f9f9', borderTop: '1px solid #eee' }}>
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingFamilyMember(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveFamilyMember(editingFamilyMember)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderDang = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-flag"></i> Hồ sơ Đảng</h3>
                {renderActions()}
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
            <div className="section-header-modern">
                <h3><i className="fas fa-star"></i> Đoàn thanh niên</h3>
                {renderActions()}
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
            <div className="section-header-modern">
                <h3><i className="fas fa-users-cog"></i> Công đoàn</h3>
                {renderActions()}
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
            <div className="section-header-modern">
                <h3><i className="fas fa-user-circle"></i> Lý lịch cá nhân</h3>
                {renderActions()}
            </div>
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
            <div className="section-header-modern">
                <h3><i className="fas fa-address-book"></i> Thông tin liên hệ</h3>
                {renderActions()}
            </div>
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
            <div className="section-header-modern">
                <h3><i className="fas fa-briefcase"></i> Thông tin công việc</h3>
                {renderActions()}
            </div>
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
                    <select name="employee_type" value={formData.employee_type} onChange={handleEmployeeTypeChange} disabled={!isEditing}>
                        <option value="MB NVCT">Nhân viên chính thức (NVCT)</option>
                        <option value="NVGT">Nhân viên gián tiếp (NVGT)</option>
                        <option value="NVTV">Nhân viên thời vụ (NVTV)</option>
                        <option value="NVTT">Nhân viên trực tiếp (NVTT)</option>
                        <option value="CBQL">Cán bộ quản lý (CBQL)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Mẫu chấm điểm</label>
                    <select name="score_template_code" value={formData.score_template_code} onChange={handleChange} disabled={!isEditing}>
                        <option value="NVTT">Trực tiếp (NVTT)</option>
                        <option value="NVGT">Gián tiếp (NVGT)</option>
                        <option value="CBQL">Quản lý (CBQL)</option>
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
            <div className="section-header-modern">
                <h3><i className="fas fa-id-card"></i> Số CCCD - Số BH</h3>
                {renderActions()}
            </div>
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
            <div className="section-header-modern">
                <h3><i className="fas fa-university"></i> Tài khoản cá nhân</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingBank({})}>
                        <i className="fas fa-plus"></i> Thêm tài khoản
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                                        <button className="btn-table-action" onClick={() => setEditingBank(item)}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeleteBank(item.id)}>
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
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingBank(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveBank(editingBank)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderHopDongLaoDong = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-file-contract"></i> Hợp đồng lao động</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingContract({})}>
                        <i className="fas fa-plus"></i> Thêm hợp đồng
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                                        <button className="btn-table-action" onClick={() => setEditingContract(item)}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeleteContract(item.id)}>
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
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingContract(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveContract(editingContract)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderHoChieu = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-passport"></i> Hộ chiếu</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingPassport({})}>
                        <i className="fas fa-plus"></i> Thêm hộ chiếu
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

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
                                        <button className="btn-table-action" onClick={() => setEditingPassport(item)}>
                                            <i className="fas fa-pencil-alt"></i>
                                        </button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeletePassport(item.id)}>
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
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingPassport(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSavePassport(editingPassport)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    const renderGrading = () => {
        // Derived state for calculations
        const criteria = getCriteria(formData.score_template_code)

        // Ensure states are initialized
        const currentSelf = selfAssessment || {}
        const currentSupervisor = supervisorAssessment || {}

        const selfTotals = calculateTotals(currentSelf)
        const supervisorTotals = calculateTotals(currentSupervisor)
        const selfGrade = getGrade(selfTotals.total)
        const supervisorGrade = getGrade(supervisorTotals.total)

        return (
            <div className="section-content">
                <div className="section-header-modern">
                    <div>
                        <h3 style={{ marginBottom: '5px' }}><i className="fas fa-star-half-alt"></i> Chấm điểm - Tháng {month ? month.split('-').reverse().join('/') : ''}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            Mẫu: <span className="badge badge-info" style={{ background: '#e1f5fe', color: '#01579b', border: 'none', padding: '2px 8px' }}>{
                                {
                                    'NVTT': 'Nhân viên trực tiếp (NVTT)',
                                    'NVGT': 'Nhân viên gián tiếp (NVGT)',
                                    'CBQL': 'Cán bộ quản lý (CBQL)'
                                }[formData.score_template_code || 'NVTT'] || formData.score_template_code
                            }</span>
                        </div>
                    </div>
                    {renderActions(
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="form-control"
                            style={{ width: 'auto', height: '32px', fontSize: '0.85rem' }}
                        />
                    )}
                </div>
                <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

                {/* Detail Table */}
                <div className="table-wrapper">
                    <div className="grading-table-container">
                        <table className="table grading-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50%' }}>Tiêu chí đánh giá</th>
                                    <th style={{ width: '10%', textAlign: 'center' }}>Max</th>
                                    <th className="col-self" style={{ width: '15%', textAlign: 'center' }}>Tự ĐG</th>
                                    <th className="col-supervisor" style={{ width: '15%', textAlign: 'center' }}>QL ĐG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Section A */}
                                <tr className="grading-section-header section-negative">
                                    <td>A. KHUNG ĐIỂM TRỪ [20 - Điểm trừ]</td>
                                    <td className="text-center">20</td>
                                    <td className="text-center text-danger font-weight-bold col-self">{selfTotals.scoreA}</td>
                                    <td className="text-center text-danger font-weight-bold col-supervisor">{supervisorTotals.scoreA}</td>
                                </tr>
                                {criteria.find(c => c.section === 'A').items.map(item => (
                                    <tr key={item.id} className={item.isHeader ? 'grading-group-header' : 'grading-item-row'}>
                                        <td className={item.isHeader ? 'pl-2' : 'pl-4'}>
                                            {item.id} {item.title}
                                        </td>
                                        <td className="text-center">{item.isHeader ? item.maxScore : item.range}</td>
                                        <td className="text-center col-self">
                                            {!item.isHeader && (
                                                <input
                                                    type="number"
                                                    className="grading-input"
                                                    value={selfAssessment[item.id] || ''}
                                                    onChange={(e) => setSelfAssessment({ ...selfAssessment, [item.id]: e.target.value })}
                                                    disabled={isGradingLocked}
                                                />
                                            )}
                                        </td>
                                        <td className="text-center col-supervisor">
                                            {!item.isHeader && (
                                                <input
                                                    type="number"
                                                    className="grading-input"
                                                    value={supervisorAssessment[item.id] || ''}
                                                    onChange={(e) => setSupervisorAssessment({ ...supervisorAssessment, [item.id]: e.target.value })}
                                                    disabled={isGradingLocked}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Section B */}
                                <tr className="grading-section-header section-positive">
                                    <td>B. KHUNG ĐIỂM ĐẠT</td>
                                    <td className="text-center">80</td>
                                    <td className="text-center text-success font-weight-bold col-self">{selfTotals.scoreB}</td>
                                    <td className="text-center text-success font-weight-bold col-supervisor">{supervisorTotals.scoreB}</td>
                                </tr>
                                {criteria.find(c => c.section === 'B').items.map(item => (
                                    <tr key={item.id} className={item.isHeader ? 'grading-group-header' : 'grading-item-row'}>
                                        <td className={item.isHeader ? 'pl-2' : 'pl-4'}>
                                            {item.id.length > 5 ? `${item.id.split('.').slice(1).join('.')} ${item.title}` : `${item.id} ${item.title}`}
                                        </td>
                                        <td className="text-center">{item.isHeader ? item.maxScore : item.range}</td>
                                        <td className="text-center col-self">
                                            {!item.isHeader && (
                                                <input
                                                    type="number"
                                                    className="grading-input"
                                                    value={selfAssessment[item.id] || ''}
                                                    onChange={(e) => setSelfAssessment({ ...selfAssessment, [item.id]: e.target.value })}
                                                    min="0" max="10"
                                                    disabled={isGradingLocked}
                                                />
                                            )}
                                        </td>
                                        <td className="text-center col-supervisor">
                                            {!item.isHeader && (
                                                <input
                                                    type="number"
                                                    className="grading-input"
                                                    value={supervisorAssessment[item.id] || ''}
                                                    onChange={(e) => setSupervisorAssessment({ ...supervisorAssessment, [item.id]: e.target.value })}
                                                    min="0" max="10"
                                                    disabled={isGradingLocked}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Section C */}
                                <tr className="grading-section-header section-bonus">
                                    <td>C. KHUNG ĐIỂM CỘNG</td>
                                    <td className="text-center">15</td>
                                    <td className="text-center text-primary font-weight-bold col-self">{selfTotals.scoreC}</td>
                                    <td className="text-center text-primary font-weight-bold col-supervisor">{supervisorTotals.scoreC}</td>
                                </tr>
                                {criteria.find(c => c.section === 'C').items.map(item => (
                                    <tr key={item.id} className="grading-item-row">
                                        <td className="pl-2">
                                            {item.id} {item.title}
                                        </td>
                                        <td className="text-center">{item.range}</td>
                                        <td className="text-center col-self">
                                            <input
                                                type="number"
                                                className="grading-input"
                                                value={selfAssessment[item.id] || ''}
                                                onChange={(e) => setSelfAssessment({ ...selfAssessment, [item.id]: e.target.value })}
                                                min="0" max="15"
                                                disabled={isGradingLocked}
                                            />
                                        </td>
                                        <td className="text-center col-supervisor">
                                            <input
                                                type="number"
                                                className="grading-input"
                                                value={supervisorAssessment[item.id] || ''}
                                                onChange={(e) => setSupervisorAssessment({ ...supervisorAssessment, [item.id]: e.target.value })}
                                                min="0" max="15"
                                                disabled={isGradingLocked}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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

                <div className="grading-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                    {isGradingLocked ? (
                        <button className="btn-premium-outline btn-premium-sm" onClick={() => setIsGradingLocked(false)}>
                            <i className="fas fa-pencil-alt"></i> Sửa
                        </button>
                    ) : (
                        <button className="btn-premium btn-premium-sm" onClick={() => handleGradingSave()}>
                            <i className="fas fa-check"></i> Lưu
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
                <div className="section-header-modern">
                    <h3><i className="fas fa-money-bill-wave"></i> Lương cơ bản</h3>
                    {renderActions()}
                </div>
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
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-light)' }}>Diễn biến lương</h4>
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingSalary({})}>
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
                                        <button className="btn-table-action" onClick={() => setEditingSalary(item)}><i className="fas fa-edit"></i></button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeleteSalary(item.id)}><i className="fas fa-trash"></i></button>
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
                                <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingSalary(null)}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                                <button className="btn-premium btn-premium-sm" onClick={() => handleSaveSalary(editingSalary)}>
                                    <i className="fas fa-check"></i> Lưu
                                </button>
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
                <div className="section-header-modern">
                    <h3><i className="fas fa-hand-holding-usd"></i> Lương theo vị trí công việc</h3>
                    {renderActions()}
                </div>
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
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-light)' }}>Diễn biến lương theo vị trí</h4>
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingJobSalary({})}>
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
                                        <button className="btn-table-action" onClick={() => setEditingJobSalary(item)}><i className="fas fa-pencil-alt"></i></button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeleteJobSalary(item.id)}><i className="fas fa-trash"></i></button>
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
                                <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingJobSalary(null)}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                                <button className="btn-premium btn-premium-sm" onClick={() => handleSaveJobSalary(editingJobSalary)}>
                                    <i className="fas fa-check"></i> Lưu
                                </button>
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
                <div className="section-header-modern">
                    <h3><i className="fas fa-coins"></i> Phụ cấp</h3>
                    {renderActions()}
                </div>
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
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-light)' }}>Bảng diễn biến phụ cấp</h4>
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingAllowance({})}>
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
                                        <button className="btn-table-action" onClick={() => setEditingAllowance(item)}><i className="fas fa-pencil-alt"></i></button>
                                        <button className="btn-table-action text-danger" onClick={() => handleDeleteAllowance(item.id)}><i className="fas fa-trash"></i></button>
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
                                <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingAllowance(null)}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                                <button className="btn-premium btn-premium-sm" onClick={() => handleSaveAllowance(editingAllowance)}>
                                    <i className="fas fa-check"></i> Lưu
                                </button>
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
            <div className="section-header-modern">
                <h3><i className="fas fa-chart-line"></i> Thu nhập khác</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingOtherIncome({})}>
                        <i className="fas fa-plus"></i> Thêm thu nhập
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
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
                                    <button className="btn-table-action" onClick={() => setEditingOtherIncome(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteOtherIncome(item.id)}><i className="fas fa-trash"></i></button>
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
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingOtherIncome(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveOtherIncome(editingOtherIncome)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 4.1 Nghỉ phép
    const renderNghiPhep = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-calendar-check"></i> Nghỉ phép</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingLeave({})}>
                        <i className="fas fa-plus"></i> Đăng ký nghỉ phép
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Loại ngày nghỉ</th>
                            <th>Lý do</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Số ngày nghỉ</th>
                            <th>Tổng ngày trừ</th>
                            <th>Phép còn lại</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.length > 0 ? leaves.map(item => (
                            <tr key={item.id}>
                                <td>{item.leave_type}</td>
                                <td>{item.reason}</td>
                                <td>{item.from_date}</td>
                                <td>{item.to_date}</td>
                                <td>{item.leave_days}</td>
                                <td>{item.total_deducted}</td>
                                <td>{item.remaining_leave}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingLeave(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteLeave(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="9" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingLeave && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                        <h4>{editingLeave.id ? 'Cập nhật nghỉ phép' : 'Đăng ký nghỉ phép'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Loại ngày nghỉ</label>
                                <select value={editingLeave.leave_type || ''} onChange={e => setEditingLeave({ ...editingLeave, leave_type: e.target.value })}>
                                    <option value="">Chọn loại</option>
                                    <option value="Phép năm">Phép năm</option>
                                    <option value="Việc riêng">Việc riêng</option>
                                    <option value="Ốm đau">Ốm đau</option>
                                    <option value="Thai sản">Thai sản</option>
                                    <option value="Không lương">Không lương</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Lý do</label><input type="text" value={editingLeave.reason || ''} onChange={e => setEditingLeave({ ...editingLeave, reason: e.target.value })} /></div>
                            <div className="form-group"><label>Từ ngày</label><input type="date" value={editingLeave.from_date || ''} onChange={e => setEditingLeave({ ...editingLeave, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến ngày</label><input type="date" value={editingLeave.to_date || ''} onChange={e => setEditingLeave({ ...editingLeave, to_date: e.target.value })} /></div>
                            <div className="form-group"><label>Số ngày nghỉ</label><input type="number" step="0.5" value={editingLeave.leave_days || ''} onChange={e => setEditingLeave({ ...editingLeave, leave_days: e.target.value })} /></div>
                            <div className="form-group"><label>Tổng ngày trừ</label><input type="number" step="0.5" value={editingLeave.total_deducted || ''} onChange={e => setEditingLeave({ ...editingLeave, total_deducted: e.target.value })} /></div>
                            <div className="form-group"><label>Phép còn lại</label><input type="number" step="0.5" value={editingLeave.remaining_leave || ''} onChange={e => setEditingLeave({ ...editingLeave, remaining_leave: e.target.value })} /></div>
                            <div className="form-group"><label>Trạng thái</label>
                                <select value={editingLeave.status || 'Chờ duyệt'} onChange={e => setEditingLeave({ ...editingLeave, status: e.target.value })}>
                                    <option value="Chờ duyệt">Chờ duyệt</option>
                                    <option value="Đã duyệt">Đã duyệt</option>
                                    <option value="Từ chối">Từ chối</option>
                                </select>
                            </div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingLeave.note || ''} onChange={e => setEditingLeave({ ...editingLeave, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingLeave(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveLeave(editingLeave)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 4.2 Bổ nhiệm - Điều chuyển
    const renderBoNhiem = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-user-tie"></i> Bổ nhiệm - Điều chuyển</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingAppointment({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Số quyết định</th>
                            <th>Ngày áp dụng</th>
                            <th>Chức danh</th>
                            <th>Chức vụ</th>
                            <th>Bộ phận làm việc</th>
                            <th>Nơi làm việc</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length > 0 ? appointments.map(item => (
                            <tr key={item.id}>
                                <td>{item.decision_number}</td>
                                <td>{item.applied_date}</td>
                                <td>{item.job_title}</td>
                                <td>{item.position}</td>
                                <td>{item.department}</td>
                                <td>{item.workplace}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingAppointment(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteAppointment(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="8" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingAppointment && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                        <h4>{editingAppointment.id ? 'Cập nhật bổ nhiệm' : 'Thêm bổ nhiệm'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Số quyết định</label><input type="text" value={editingAppointment.decision_number || ''} onChange={e => setEditingAppointment({ ...editingAppointment, decision_number: e.target.value })} /></div>
                            <div className="form-group"><label>Ngày áp dụng</label><input type="date" value={editingAppointment.applied_date || ''} onChange={e => setEditingAppointment({ ...editingAppointment, applied_date: e.target.value })} /></div>
                            <div className="form-group"><label>Chức danh</label><input type="text" value={editingAppointment.job_title || ''} onChange={e => setEditingAppointment({ ...editingAppointment, job_title: e.target.value })} /></div>
                            <div className="form-group"><label>Chức vụ</label><input type="text" value={editingAppointment.position || ''} onChange={e => setEditingAppointment({ ...editingAppointment, position: e.target.value })} /></div>
                            <div className="form-group"><label>Bộ phận làm việc</label><input type="text" value={editingAppointment.department || ''} onChange={e => setEditingAppointment({ ...editingAppointment, department: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi làm việc</label><input type="text" value={editingAppointment.workplace || ''} onChange={e => setEditingAppointment({ ...editingAppointment, workplace: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingAppointment.note || ''} onChange={e => setEditingAppointment({ ...editingAppointment, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingAppointment(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveAppointment(editingAppointment)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 4.3 Nhật ký công tác
    const renderNhatKyCongTac = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-plane-departure"></i> Nhật ký công tác</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingWorkJournal({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Số quyết định</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Nơi công tác</th>
                            <th>Mục đích</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workJournals.length > 0 ? workJournals.map(item => (
                            <tr key={item.id}>
                                <td>{item.decision_number}</td>
                                <td>{item.from_date}</td>
                                <td>{item.to_date}</td>
                                <td>{item.work_location}</td>
                                <td>{item.purpose}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingWorkJournal(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteWorkJournal(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="7" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingWorkJournal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '700px', maxWidth: '95%' }}>
                        <h4>{editingWorkJournal.id ? 'Cập nhật nhật ký công tác' : 'Thêm nhật ký công tác'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Số quyết định</label><input type="text" value={editingWorkJournal.decision_number || ''} onChange={e => setEditingWorkJournal({ ...editingWorkJournal, decision_number: e.target.value })} /></div>
                            <div className="form-group"><label>Từ ngày</label><input type="date" value={editingWorkJournal.from_date || ''} onChange={e => setEditingWorkJournal({ ...editingWorkJournal, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến ngày</label><input type="date" value={editingWorkJournal.to_date || ''} onChange={e => setEditingWorkJournal({ ...editingWorkJournal, to_date: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi công tác</label><input type="text" value={editingWorkJournal.work_location || ''} onChange={e => setEditingWorkJournal({ ...editingWorkJournal, work_location: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Mục đích</label><input type="text" value={editingWorkJournal.purpose || ''} onChange={e => setEditingWorkJournal({ ...editingWorkJournal, purpose: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingWorkJournal.note || ''} onChange={e => setEditingWorkJournal({ ...editingWorkJournal, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingWorkJournal(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveWorkJournal(editingWorkJournal)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 5.1 Chuyên ngành đào tạo
    const renderChuyenNganh = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-graduation-cap"></i> Chuyên ngành đào tạo</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingSpecialization({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Chuyên ngành</th>
                            <th>Thời gian đào tạo từ</th>
                            <th>Đến</th>
                            <th>Nơi đào tạo</th>
                            <th>Trình độ</th>
                            <th>Loại hình đào tạo</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainingSpecializations.length > 0 ? trainingSpecializations.map(item => (
                            <tr key={item.id}>
                                <td>{item.specialization}</td>
                                <td>{item.from_date}</td>
                                <td>{item.to_date}</td>
                                <td>{item.training_place}</td>
                                <td>{item.education_level}</td>
                                <td>{item.training_type}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingSpecialization(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteSpecialization(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="8" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingSpecialization && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                        <h4>{editingSpecialization.id ? 'Cập nhật chuyên ngành' : 'Thêm chuyên ngành đào tạo'}</h4>
                        <div className="grid-2">
                            <div className="form-group full-width"><label>Chuyên ngành</label><input type="text" value={editingSpecialization.specialization || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, specialization: e.target.value })} /></div>
                            <div className="form-group"><label>Thời gian từ</label><input type="date" value={editingSpecialization.from_date || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến</label><input type="date" value={editingSpecialization.to_date || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, to_date: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi đào tạo</label><input type="text" value={editingSpecialization.training_place || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, training_place: e.target.value })} /></div>
                            <div className="form-group"><label>Trình độ</label>
                                <select value={editingSpecialization.education_level || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, education_level: e.target.value })}>
                                    <option value="">Chọn trình độ</option>
                                    <option value="Tiến sĩ">Tiến sĩ</option>
                                    <option value="Thạc sĩ">Thạc sĩ</option>
                                    <option value="Đại học">Đại học</option>
                                    <option value="Cao đẳng">Cao đẳng</option>
                                    <option value="Trung cấp">Trung cấp</option>
                                    <option value="Sơ cấp">Sơ cấp</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Loại hình đào tạo</label>
                                <select value={editingSpecialization.training_type || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, training_type: e.target.value })}>
                                    <option value="">Chọn loại hình</option>
                                    <option value="Chính quy">Chính quy</option>
                                    <option value="Tại chức">Tại chức</option>
                                    <option value="Từ xa">Từ xa</option>
                                    <option value="Liên thông">Liên thông</option>
                                </select>
                            </div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingSpecialization.note || ''} onChange={e => setEditingSpecialization({ ...editingSpecialization, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingSpecialization(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveSpecialization(editingSpecialization)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 5.2 Chứng chỉ
    const renderChungChi = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-certificate"></i> Chứng chỉ</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingCertificate({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Tên chứng chỉ</th>
                            <th>Trình độ</th>
                            <th>Nơi đào tạo</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Số hiệu</th>
                            <th>Ngày cấp</th>
                            <th>Hiệu lực đến</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates.length > 0 ? certificates.map(item => (
                            <tr key={item.id}>
                                <td>{item.certificate_name}</td>
                                <td>{item.level}</td>
                                <td>{item.training_place}</td>
                                <td>{item.from_date}</td>
                                <td>{item.to_date}</td>
                                <td>{item.certificate_number}</td>
                                <td>{item.issue_date}</td>
                                <td>{item.expiry_date}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingCertificate(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteCertificate(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="10" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingCertificate && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '900px', maxWidth: '95%' }}>
                        <h4>{editingCertificate.id ? 'Cập nhật chứng chỉ' : 'Thêm chứng chỉ'}</h4>
                        <div className="grid-2">
                            <div className="form-group full-width"><label>Tên chứng chỉ</label><input type="text" value={editingCertificate.certificate_name || ''} onChange={e => setEditingCertificate({ ...editingCertificate, certificate_name: e.target.value })} /></div>
                            <div className="form-group"><label>Trình độ</label><input type="text" value={editingCertificate.level || ''} onChange={e => setEditingCertificate({ ...editingCertificate, level: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi đào tạo</label><input type="text" value={editingCertificate.training_place || ''} onChange={e => setEditingCertificate({ ...editingCertificate, training_place: e.target.value })} /></div>
                            <div className="form-group"><label>Từ ngày</label><input type="date" value={editingCertificate.from_date || ''} onChange={e => setEditingCertificate({ ...editingCertificate, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến ngày</label><input type="date" value={editingCertificate.to_date || ''} onChange={e => setEditingCertificate({ ...editingCertificate, to_date: e.target.value })} /></div>
                            <div className="form-group"><label>Số hiệu</label><input type="text" value={editingCertificate.certificate_number || ''} onChange={e => setEditingCertificate({ ...editingCertificate, certificate_number: e.target.value })} /></div>
                            <div className="form-group"><label>Ngày cấp</label><input type="date" value={editingCertificate.issue_date || ''} onChange={e => setEditingCertificate({ ...editingCertificate, issue_date: e.target.value })} /></div>
                            <div className="form-group"><label>Hiệu lực đến ngày</label><input type="date" value={editingCertificate.expiry_date || ''} onChange={e => setEditingCertificate({ ...editingCertificate, expiry_date: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingCertificate.note || ''} onChange={e => setEditingCertificate({ ...editingCertificate, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingCertificate(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveCertificate(editingCertificate)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 5.3 Đào tạo nội bộ
    const renderDaoTaoNoiBo = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-chalkboard-teacher"></i> Đào tạo nội bộ</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingInternalTraining({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Mã lớp</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Số quyết định</th>
                            <th>Nơi đào tạo</th>
                            <th>Khóa đào tạo</th>
                            <th>Kết quả</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {internalTrainings.length > 0 ? internalTrainings.map(item => (
                            <tr key={item.id}>
                                <td>{item.class_code}</td>
                                <td>{item.from_date}</td>
                                <td>{item.to_date}</td>
                                <td>{item.decision_number}</td>
                                <td>{item.training_place}</td>
                                <td>{item.training_course}</td>
                                <td>{item.result}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingInternalTraining(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteInternalTraining(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="9" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingInternalTraining && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                        <h4>{editingInternalTraining.id ? 'Cập nhật đào tạo nội bộ' : 'Thêm đào tạo nội bộ'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Mã lớp</label><input type="text" value={editingInternalTraining.class_code || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, class_code: e.target.value })} /></div>
                            <div className="form-group"><label>Số quyết định</label><input type="text" value={editingInternalTraining.decision_number || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, decision_number: e.target.value })} /></div>
                            <div className="form-group"><label>Từ ngày</label><input type="date" value={editingInternalTraining.from_date || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến ngày</label><input type="date" value={editingInternalTraining.to_date || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, to_date: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi đào tạo</label><input type="text" value={editingInternalTraining.training_place || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, training_place: e.target.value })} /></div>
                            <div className="form-group"><label>Khóa đào tạo</label><input type="text" value={editingInternalTraining.training_course || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, training_course: e.target.value })} /></div>
                            <div className="form-group"><label>Kết quả</label>
                                <select value={editingInternalTraining.result || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, result: e.target.value })}>
                                    <option value="">Chọn kết quả</option>
                                    <option value="Đạt">Đạt</option>
                                    <option value="Không đạt">Không đạt</option>
                                    <option value="Giỏi">Giỏi</option>
                                    <option value="Khá">Khá</option>
                                    <option value="Trung bình">Trung bình</option>
                                </select>
                            </div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingInternalTraining.note || ''} onChange={e => setEditingInternalTraining({ ...editingInternalTraining, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingInternalTraining(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveInternalTraining(editingInternalTraining)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 6.1 Khen thưởng
    const renderKhenThuong = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-trophy"></i> Khen thưởng</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingReward({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Số quyết định</th>
                            <th>Hình thức khen thưởng</th>
                            <th>Nội dung khen thưởng</th>
                            <th>Ngày ký</th>
                            <th>Số tiền</th>
                            <th>Ngày khen thưởng</th>
                            <th>Tính vào năm</th>
                            <th>File đính kèm</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rewards.length > 0 ? rewards.map(item => (
                            <tr key={item.id}>
                                <td>{item.decision_number}</td>
                                <td>{item.reward_type}</td>
                                <td>{item.reward_content}</td>
                                <td>{item.signed_date}</td>
                                <td>{item.amount?.toLocaleString()}</td>
                                <td>{item.reward_date}</td>
                                <td>{item.applied_year}</td>
                                <td>{item.attachment_url ? <a href={item.attachment_url} target="_blank" rel="noreferrer">Xem file</a> : ''}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingReward(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteReward(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="10" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingReward && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '900px', maxWidth: '95%' }}>
                        <h4>{editingReward.id ? 'Cập nhật khen thưởng' : 'Thêm khen thưởng'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Số quyết định</label><input type="text" value={editingReward.decision_number || ''} onChange={e => setEditingReward({ ...editingReward, decision_number: e.target.value })} /></div>
                            <div className="form-group"><label>Hình thức khen thưởng</label>
                                <select value={editingReward.reward_type || ''} onChange={e => setEditingReward({ ...editingReward, reward_type: e.target.value })}>
                                    <option value="">Chọn hình thức</option>
                                    <option value="Bằng khen">Bằng khen</option>
                                    <option value="Giấy khen">Giấy khen</option>
                                    <option value="Thưởng tiền">Thưởng tiền</option>
                                    <option value="Thăng chức">Thăng chức</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="form-group full-width"><label>Nội dung khen thưởng</label><textarea rows="2" value={editingReward.reward_content || ''} onChange={e => setEditingReward({ ...editingReward, reward_content: e.target.value })} /></div>
                            <div className="form-group"><label>Ngày ký</label><input type="date" value={editingReward.signed_date || ''} onChange={e => setEditingReward({ ...editingReward, signed_date: e.target.value })} /></div>
                            <div className="form-group"><label>Số tiền</label><input type="number" value={editingReward.amount || ''} onChange={e => setEditingReward({ ...editingReward, amount: e.target.value })} /></div>
                            <div className="form-group"><label>Ngày khen thưởng</label><input type="date" value={editingReward.reward_date || ''} onChange={e => setEditingReward({ ...editingReward, reward_date: e.target.value })} /></div>
                            <div className="form-group"><label>Tính vào năm</label><input type="number" value={editingReward.applied_year || new Date().getFullYear()} onChange={e => setEditingReward({ ...editingReward, applied_year: parseInt(e.target.value) })} /></div>
                            <div className="form-group full-width"><label>File đính kèm (URL)</label><input type="text" value={editingReward.attachment_url || ''} onChange={e => setEditingReward({ ...editingReward, attachment_url: e.target.value })} placeholder="https://..." /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingReward.note || ''} onChange={e => setEditingReward({ ...editingReward, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingReward(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveReward(editingReward)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 6.2 Kỷ luật
    const renderKyLuat = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-gavel"></i> Kỷ luật</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingDiscipline({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Số quyết định</th>
                            <th>Ngày ký</th>
                            <th>Hình thức kỷ luật</th>
                            <th>Từ ngày</th>
                            <th>Đến ngày</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {disciplines.length > 0 ? disciplines.map(item => (
                            <tr key={item.id}>
                                <td>{item.decision_number}</td>
                                <td>{item.signed_date}</td>
                                <td>{item.discipline_type}</td>
                                <td>{item.from_date}</td>
                                <td>{item.to_date}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingDiscipline(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteDiscipline(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="7" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingDiscipline && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '700px', maxWidth: '95%' }}>
                        <h4>{editingDiscipline.id ? 'Cập nhật kỷ luật' : 'Thêm kỷ luật'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Số quyết định</label><input type="text" value={editingDiscipline.decision_number || ''} onChange={e => setEditingDiscipline({ ...editingDiscipline, decision_number: e.target.value })} /></div>
                            <div className="form-group"><label>Ngày ký</label><input type="date" value={editingDiscipline.signed_date || ''} onChange={e => setEditingDiscipline({ ...editingDiscipline, signed_date: e.target.value })} /></div>
                            <div className="form-group"><label>Hình thức kỷ luật</label>
                                <select value={editingDiscipline.discipline_type || ''} onChange={e => setEditingDiscipline({ ...editingDiscipline, discipline_type: e.target.value })}>
                                    <option value="">Chọn hình thức</option>
                                    <option value="Khiển trách">Khiển trách</option>
                                    <option value="Cảnh cáo">Cảnh cáo</option>
                                    <option value="Cách chức">Cách chức</option>
                                    <option value="Buộc thôi việc">Buộc thôi việc</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Từ ngày</label><input type="date" value={editingDiscipline.from_date || ''} onChange={e => setEditingDiscipline({ ...editingDiscipline, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến ngày</label><input type="date" value={editingDiscipline.to_date || ''} onChange={e => setEditingDiscipline({ ...editingDiscipline, to_date: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingDiscipline.note || ''} onChange={e => setEditingDiscipline({ ...editingDiscipline, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingDiscipline(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveDiscipline(editingDiscipline)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 7.1 Thẻ bảo hiểm y tế
    const renderTheBHYT = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-id-card-alt"></i> Thẻ bảo hiểm y tế</h3>
                {renderActions(
                    !healthInsurance && !editingHealthInsurance && (
                        <button className="btn-premium btn-premium-sm" onClick={() => setEditingHealthInsurance({})}>
                            <i className="fas fa-plus"></i> Thêm thông tin
                        </button>
                    )
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>

            {!healthInsurance && !editingHealthInsurance && (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                    <p style={{ color: '#666' }}>Chưa có thông tin thẻ BHYT</p>
                </div>
            )}

            {healthInsurance && !editingHealthInsurance && (
                <div className="form-section">
                    <div className="grid-2">
                        <div className="form-group"><label>Từ ngày</label><input type="date" value={healthInsurance.from_date || ''} disabled /></div>
                        <div className="form-group"><label>Đến ngày</label><input type="date" value={healthInsurance.to_date || ''} disabled /></div>
                        <div className="form-group full-width"><label>Nơi khám chữa bệnh (KCB)</label><input type="text" value={healthInsurance.medical_facility || ''} disabled /></div>
                        <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={healthInsurance.note || ''} disabled /></div>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '15px' }}>
                        <button className="btn-premium btn-premium-sm" onClick={() => setEditingHealthInsurance(healthInsurance)}>
                            <i className="fas fa-edit"></i> Cập nhật
                        </button>
                    </div>
                </div>
            )}

            {editingHealthInsurance && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '600px', maxWidth: '95%' }}>
                        <h4>{healthInsurance ? 'Cập nhật thẻ BHYT' : 'Thêm thẻ BHYT'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Từ ngày</label><input type="date" value={editingHealthInsurance.from_date || ''} onChange={e => setEditingHealthInsurance({ ...editingHealthInsurance, from_date: e.target.value })} /></div>
                            <div className="form-group"><label>Đến ngày</label><input type="date" value={editingHealthInsurance.to_date || ''} onChange={e => setEditingHealthInsurance({ ...editingHealthInsurance, to_date: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Nơi KCB</label><input type="text" value={editingHealthInsurance.medical_facility || ''} onChange={e => setEditingHealthInsurance({ ...editingHealthInsurance, medical_facility: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingHealthInsurance.note || ''} onChange={e => setEditingHealthInsurance({ ...editingHealthInsurance, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingHealthInsurance(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveHealthInsurance(editingHealthInsurance)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 7.2 Tai nạn lao động
    const renderTaiNanLaoDong = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-user-injured"></i> Tai nạn lao động</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingWorkAccident({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Ngày xảy ra</th>
                            <th>Nơi xảy ra</th>
                            <th>Lý do nghỉ</th>
                            <th>Loại tai nạn</th>
                            <th>Số ngày nghỉ</th>
                            <th>Chi phí cho NLĐ</th>
                            <th>Thiệt hại tài sản</th>
                            <th>Tiền đền bù</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workAccidents.length > 0 ? workAccidents.map(item => (
                            <tr key={item.id}>
                                <td>{item.accident_date}</td>
                                <td>{item.accident_location}</td>
                                <td>{item.leave_reason}</td>
                                <td>{item.accident_type}</td>
                                <td>{item.leave_days}</td>
                                <td>{item.employee_cost?.toLocaleString()}</td>
                                <td>{item.property_damage?.toLocaleString()}</td>
                                <td>{item.compensation_amount?.toLocaleString()}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingWorkAccident(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteWorkAccident(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="9" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingWorkAccident && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '900px', maxWidth: '95%' }}>
                        <h4>{editingWorkAccident.id ? 'Cập nhật tai nạn lao động' : 'Thêm tai nạn lao động'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Ngày xảy ra</label><input type="date" value={editingWorkAccident.accident_date || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, accident_date: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi xảy ra</label><input type="text" value={editingWorkAccident.accident_location || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, accident_location: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Lý do nghỉ</label><input type="text" value={editingWorkAccident.leave_reason || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, leave_reason: e.target.value })} /></div>
                            <div className="form-group"><label>Loại tai nạn lao động</label>
                                <select value={editingWorkAccident.accident_type || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, accident_type: e.target.value })}>
                                    <option value="">Chọn loại</option>
                                    <option value="Nhẹ">Nhẹ</option>
                                    <option value="Nặng">Nặng</option>
                                    <option value="Chết người">Chết người</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Số ngày nghỉ do tai nạn</label><input type="number" value={editingWorkAccident.leave_days || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, leave_days: parseInt(e.target.value) })} /></div>
                            <div className="form-group"><label>Tổng chi phí cho NLĐ</label><input type="number" value={editingWorkAccident.employee_cost || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, employee_cost: e.target.value })} /></div>
                            <div className="form-group"><label>Giá trị tài sản thiệt hại</label><input type="number" value={editingWorkAccident.property_damage || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, property_damage: e.target.value })} /></div>
                            <div className="form-group"><label>Tổng tiền đền bù</label><input type="number" value={editingWorkAccident.compensation_amount || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, compensation_amount: e.target.value })} /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingWorkAccident.note || ''} onChange={e => setEditingWorkAccident({ ...editingWorkAccident, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingWorkAccident(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveWorkAccident(editingWorkAccident)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    // 7.3 Khám sức khỏe
    const renderKhamSucKhoe = () => (
        <div className="section-content">
            <div className="section-header-modern">
                <h3><i className="fas fa-heartbeat"></i> Khám sức khỏe</h3>
                {renderActions(
                    <button className="btn-premium btn-premium-sm" onClick={() => setEditingHealthCheckup({})}>
                        <i className="fas fa-plus"></i> Thêm mới
                    </button>
                )}
            </div>
            <p className="subtitle">{formData.employeeId} - {formData.ho_va_ten}</p>
            <div className="table-wrapper">
                <table className="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Ngày khám</th>
                            <th>Ngày hết hạn</th>
                            <th>Nơi khám</th>
                            <th>Chi phí</th>
                            <th>Kết quả</th>
                            <th>File đính kèm</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {healthCheckups.length > 0 ? healthCheckups.map(item => (
                            <tr key={item.id}>
                                <td>{item.checkup_date}</td>
                                <td>{item.expiry_date}</td>
                                <td>{item.checkup_location}</td>
                                <td>{item.cost?.toLocaleString()}</td>
                                <td>{item.result}</td>
                                <td>{item.attachment_url ? <a href={item.attachment_url} target="_blank" rel="noreferrer">Xem file</a> : ''}</td>
                                <td>{item.note}</td>
                                <td className="text-center">
                                    <button className="btn-table-action" onClick={() => setEditingHealthCheckup(item)}><i className="fas fa-pencil-alt"></i></button>
                                    <button className="btn-table-action text-danger" onClick={() => handleDeleteHealthCheckup(item.id)}><i className="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="8" className="text-center">Chưa có dữ liệu</td></tr>}
                    </tbody>
                </table>
            </div>

            {editingHealthCheckup && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '800px', maxWidth: '95%' }}>
                        <h4>{editingHealthCheckup.id ? 'Cập nhật khám sức khỏe' : 'Thêm khám sức khỏe'}</h4>
                        <div className="grid-2">
                            <div className="form-group"><label>Ngày khám</label><input type="date" value={editingHealthCheckup.checkup_date || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, checkup_date: e.target.value })} /></div>
                            <div className="form-group"><label>Ngày hết hạn</label><input type="date" value={editingHealthCheckup.expiry_date || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, expiry_date: e.target.value })} /></div>
                            <div className="form-group"><label>Nơi khám</label><input type="text" value={editingHealthCheckup.checkup_location || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, checkup_location: e.target.value })} /></div>
                            <div className="form-group"><label>Chi phí</label><input type="number" value={editingHealthCheckup.cost || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, cost: e.target.value })} /></div>
                            <div className="form-group"><label>Kết quả</label>
                                <select value={editingHealthCheckup.result || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, result: e.target.value })}>
                                    <option value="">Chọn kết quả</option>
                                    <option value="Đủ sức khỏe">Đủ sức khỏe</option>
                                    <option value="Cần theo dõi">Cần theo dõi</option>
                                    <option value="Không đủ sức khỏe">Không đủ sức khỏe</option>
                                </select>
                            </div>
                            <div className="form-group full-width"><label>File đính kèm (URL)</label><input type="text" value={editingHealthCheckup.attachment_url || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, attachment_url: e.target.value })} placeholder="https://..." /></div>
                            <div className="form-group full-width"><label>Ghi chú</label><textarea rows="2" value={editingHealthCheckup.note || ''} onChange={e => setEditingHealthCheckup({ ...editingHealthCheckup, note: e.target.value })} /></div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-premium-outline btn-premium-sm" onClick={() => setEditingHealthCheckup(null)}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium btn-premium-sm" onClick={() => handleSaveHealthCheckup(editingHealthCheckup)}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <div className="employee-detail">
            {/* Actions are now integrated into section headers */}
            <div className="detail-main" style={{ position: 'relative' }}>
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
                    {activeSection === 'nghi_phep' && renderNghiPhep()}
                    {activeSection === 'bo_nhiem' && renderBoNhiem()}
                    {activeSection === 'nhat_ky_cong_tac' && renderNhatKyCongTac()}
                    {activeSection === 'chuyen_nganh' && renderChuyenNganh()}
                    {activeSection === 'chung_chi' && renderChungChi()}
                    {activeSection === 'dao_tao_noi_bo' && renderDaoTaoNoiBo()}
                    {activeSection === 'khen_thuong' && renderKhenThuong()}
                    {activeSection === 'ky_luat' && renderKyLuat()}
                    {activeSection === 'the_bhyt' && renderTheBHYT()}
                    {activeSection === 'tai_nan_lao_dong' && renderTaiNanLaoDong()}
                    {activeSection === 'kham_suc_khoe' && renderKhamSucKhoe()}
                    {activeSection === 'grading' && renderGrading()}
                </div>
            </div>
        </div>
    )
}

export default EmployeeDetail
