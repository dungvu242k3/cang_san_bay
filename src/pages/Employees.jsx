import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CreateEmployeeWizard from '../components/CreateEmployeeWizard'
import EmployeeDetail from '../components/EmployeeDetail'
import ProfileMenu from '../components/ProfileMenu'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Employees.css'

function Employees() {
    const { user, checkAction } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [employees, setEmployees] = useState([])
    const [filteredEmployees, setFilteredEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterBranch, setFilterBranch] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [activeSection, setActiveSection] = useState('ly_lich')
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
    const [employeeToReset, setEmployeeToReset] = useState(null)
    const [showCreateWizard, setShowCreateWizard] = useState(false)
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

    // Handle navigation from other pages (e.g. UserManagement)
    useEffect(() => {
        if (!loading && employees.length > 0 && location.state?.selectedEmployeeCode) {
            const { selectedEmployeeCode, mode } = location.state
            const emp = employees.find(e => e.employee_code === selectedEmployeeCode)
            if (emp) {
                setSelectedEmployee(emp)
                // Clear state to avoid re-selecting on refresh/updates (optional but good practice)
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [loading, employees, location.state, navigate, location.pathname])

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

    // Group employees by department
    const groupedEmployees = () => {
        const groups = {}
        filteredEmployees.forEach(emp => {
            const dept = emp.bo_phan || 'Chưa phân loại'
            if (!groups[dept]) {
                groups[dept] = []
            }
            groups[dept].push(emp)
        })
        // Sort departments alphabetically
        return Object.keys(groups).sort().map(dept => ({
            department: dept,
            employees: groups[dept],
            count: groups[dept].length
        }))
    }

    const handleDisableEmployee = async (employee) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ngừng hoạt động nhân viên ${employee.employeeId}?`)) {
            return
        }

        try {
            await supabase
                .from('employee_profiles')
                .update({ status: 'Nghỉ việc' })
                .eq('id', employee.id)

            alert('Đã ngừng hoạt động nhân viên thành công!')
            loadEmployees()
        } catch (err) {
            console.error('Error disabling employee:', err)
            alert('Lỗi: ' + err.message)
        }
    }

    const handleActivateEmployee = async (employee) => {
        try {
            await supabase
                .from('employee_profiles')
                .update({ status: 'Đang làm việc' })
                .eq('id', employee.id)

            alert('Đã kích hoạt nhân viên thành công!')
            loadEmployees()
        } catch (err) {
            console.error('Error activating employee:', err)
            alert('Lỗi: ' + err.message)
        }
    }

    const handleDeleteEmployee = async (employee) => {
        // Check permission first
        const canDelete = checkAction('delete', { module: 'profiles', ...employee })
        if (!canDelete) {
            alert('Bạn không có quyền xóa nhân viên!')
            return
        }

        if (!window.confirm(`⚠️ XÓA VĨNH VIỄN nhân viên ${employee.employeeId} - ${employee.ho_va_ten}?\n\nHành động này KHÔNG THỂ hoàn tác!`)) {
            return
        }
        // Double confirm for safety
        if (!window.confirm('Xác nhận lần cuối: Bạn thực sự muốn xóa?')) {
            return
        }

        try {
            const { error } = await supabase
                .from('employee_profiles')
                .delete()
                .eq('id', employee.id)

            if (error) throw error

            // Update local state directly - no reload needed
            setEmployees(prev => prev.filter(e => e.id !== employee.id))
            if (selectedEmployee?.id === employee.id) {
                setSelectedEmployee(null)
            }
        } catch (err) {
            console.error('Error deleting employee:', err)
            alert('Lỗi xóa: ' + err.message)
        }
    }

    const handleResetPassword = (employee) => {
        setEmployeeToReset(employee)
        setShowResetPasswordModal(true)
    }

    const hashPassword = async (password) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hash = await crypto.subtle.digest('SHA-256', data)
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')
    }

    const confirmResetPassword = async () => {
        if (!employeeToReset) return

        try {
            // Hash default password
            const hashedPassword = await hashPassword('123456')

            // Reset password in database
            const { error } = await supabase
                .from('employee_profiles')
                .update({ password: hashedPassword })
                .eq('employee_code', employeeToReset.employeeId)

            if (error) {
                throw error
            }

            alert(`Đã reset mật khẩu về mặc định (123456) cho ${employeeToReset.employeeId}`)
            setShowResetPasswordModal(false)
            setEmployeeToReset(null)
        } catch (err) {
            console.error('Error resetting password:', err)
            alert('Lỗi reset mật khẩu: ' + err.message)
        }
    }

    const handleSaveEmployee = async (formData, id) => {
        // Validation for new employees
        if (!id) {
            if (!formData.employeeId || !formData.employeeId.trim()) {
                alert('Vui lòng nhập mã nhân viên')
                return
            }
            if (!formData.ho_va_ten || !formData.ho_va_ten.trim()) {
                alert('Vui lòng nhập họ tên')
                return
            }
            if (!formData.email_acv || !formData.email_acv.trim()) {
                alert('Vui lòng nhập email doanh nghiệp')
                return
            }
            if (!formData.department || !formData.department.trim()) {
                alert('Vui lòng chọn phòng ban')
                return
            }
        }

        try {
            // Map formData to database columns
            const nameParts = (formData.ho_va_ten || '').trim().split(' ')
            const firstName = nameParts.pop() || ''
            const lastName = nameParts.join(' ') || ''

            const dbPayload = {
                employee_code: formData.employeeId ? formData.employeeId.trim().toUpperCase() : null,
                first_name: firstName,
                last_name: lastName,
                status: formData.status || formData.trang_thai || 'Đang làm việc',
                score_template_code: formData.score_template_code || 'NVTT',
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
                unemployment_insurance_issue_date: formData.unemployment_insurance_issue_date || null,

                // Party / Union Details
                is_party_member: formData.is_party_member || false,
                party_card_number: formData.party_card_number || null,
                party_join_date: formData.party_join_date || null,
                party_official_date: formData.party_official_date || null,
                party_position: formData.party_position || null,
                party_activity_location: formData.party_cell || formData.party_activity_location || null,
                political_education_level: formData.political_education_level || null,
                party_notes: formData.party_notes || null,

                is_youth_union_member: formData.is_youth_union_member || false,
                youth_union_card_number: formData.youth_union_card_number || null,
                youth_union_join_date: formData.youth_union_join_date || null,
                youth_union_join_location: formData.youth_union_join_location || null,
                youth_union_position: formData.youth_union_position || null,
                youth_union_activity_location: formData.youth_union_cell || formData.youth_union_activity_location || null,
                youth_union_notes: formData.youth_union_notes || null,

                is_trade_union_member: formData.is_trade_union_member || false,
                trade_union_card_number: formData.trade_union_card_number || null,
                trade_union_join_date: formData.trade_union_join_date || null,
                trade_union_position: formData.trade_union_position || null,
                trade_union_activity_location: formData.trade_union_base || formData.trade_union_activity_location || null,
                trade_union_notes: formData.trade_union_notes || null,
            }

            console.log('dbPayload to save:', dbPayload)

            let result
            if (id) {
                // Update existing employee
                result = await supabase
                    .from('employee_profiles')
                    .update(dbPayload)
                    .eq('id', id)
                    .select()
            } else {
                // Check if employee_code already exists
                const { data: existing } = await supabase
                    .from('employee_profiles')
                    .select('employee_code')
                    .eq('employee_code', dbPayload.employee_code)
                    .maybeSingle()

                if (existing) {
                    alert('Mã nhân viên đã tồn tại!')
                    return
                }

                // Hash default password
                const hashPassword = async (password) => {
                    const encoder = new TextEncoder()
                    const data = encoder.encode(password)
                    const hash = await crypto.subtle.digest('SHA-256', data)
                    return Array.from(new Uint8Array(hash))
                        .map(b => b.toString(16).padStart(2, '0'))
                        .join('')
                }

                const hashedPassword = await hashPassword('123456')
                dbPayload.password = hashedPassword

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

            // Save related data if this was a new employee creation (Wizard)
            if (!id && result.data && result.data.length > 0) {
                const newEmployeeCode = result.data[0].employee_code

                // Save Family Members
                if (formData.familyMembers && formData.familyMembers.length > 0) {
                    const familyPayload = formData.familyMembers.map(m => {
                        // Split name roughly
                        const nameParts = m.name.trim().split(' ')
                        const firstName = nameParts.pop() || ''
                        const lastName = nameParts.join(' ') || ''

                        return {
                            employee_code: newEmployeeCode,
                            first_name: firstName,
                            last_name: lastName,
                            relationship: m.relation,
                            date_of_birth: m.birth_year ? `${m.birth_year}-01-01` : null,
                            is_dependent: false
                        }
                    })
                    const { error: famError } = await supabase.from('family_members').insert(familyPayload)
                    if (famError) console.error('Error saving family members:', famError)
                }

                // Save Bank Accounts
                if (formData.bankAccounts && formData.bankAccounts.length > 0) {
                    const bankPayload = formData.bankAccounts.map(b => ({
                        employee_code: newEmployeeCode,
                        bank_name: b.bank,
                        account_number: b.number,
                        account_name: b.owner,
                        note: null
                    }))
                    const { error: bankError } = await supabase.from('employee_bank_accounts').insert(bankPayload)
                    if (bankError) console.error('Error saving bank accounts:', bankError)
                }

                // Save Contracts
                if (formData.contracts && formData.contracts.length > 0) {
                    const contractsPayload = formData.contracts.map(c => ({
                        employee_code: newEmployeeCode,
                        contract_number: c.number,
                        contract_type: c.type,
                        effective_date: c.effectiveDate || null,
                        expiration_date: c.expiryDate || null,
                        signed_date: c.signedDate || null
                    }))
                    const { error: contractError } = await supabase.from('labor_contracts').insert(contractsPayload)
                    if (contractError) console.error('Error saving contracts:', contractError)
                }

                // Save Passports
                if (formData.passports && formData.passports.length > 0) {
                    const passportsPayload = formData.passports.map(p => ({
                        employee_code: newEmployeeCode,
                        passport_number: p.number,
                        passport_type: p.type,
                        issue_date: p.issueDate || null,
                        issue_place: p.issuePlace || null,
                        expiration_date: p.expiryDate || null,
                        note: null
                    }))
                    const { error: passportError } = await supabase.from('employee_passports').insert(passportsPayload)
                    if (passportError) console.error('Error saving passports:', passportError)
                }

                // Save Basic Salaries
                if (formData.salaries && formData.salaries.length > 0) {
                    const salariesPayload = formData.salaries.map(s => ({
                        employee_code: newEmployeeCode,
                        decision_number: s.decisionNumber || null,
                        basic_salary: s.amount ? parseFloat(s.amount.toString().replace(/\./g, "").replace(",", ".")) : 0,
                        effective_date: s.effectiveDate || null,
                        is_active: true
                    }))
                    const { error: salaryError } = await supabase.from('employee_salaries').insert(salariesPayload)
                    if (salaryError) console.error('Error saving salaries:', salaryError)
                }

                // Save Allowances
                if (formData.allowances && formData.allowances.length > 0) {
                    const allowancesPayload = formData.allowances.map(a => ({
                        employee_code: newEmployeeCode,
                        decision_number: a.decisionNumber || null,
                        allowance_type: a.type,
                        amount: a.amount ? parseFloat(a.amount.toString().replace(/\./g, "").replace(",", ".")) : 0,
                        effective_date: a.effectiveDate || null,
                        is_active: true
                    }))
                    const { error: allowError } = await supabase.from('employee_allowances').insert(allowancesPayload)
                    if (allowError) console.error('Error saving allowances:', allowError)
                }

                // Save Appointments
                if (formData.appointments && formData.appointments.length > 0) {
                    const appointmentsPayload = formData.appointments.map(a => ({
                        employee_code: newEmployeeCode,
                        decision_number: a.decisionNumber || null,
                        applied_date: a.appliedDate || null,
                        position: a.position || null,
                        job_title: a.jobTitle || null,
                        department: a.department || null
                    }))
                    const { error: apptError } = await supabase.from('employee_appointments').insert(appointmentsPayload)
                    if (apptError) console.error('Error saving appointments:', apptError)
                }

                // Save Certificates
                if (formData.certifications && formData.certifications.length > 0) {
                    const certsPayload = formData.certifications.map(c => ({
                        employee_code: newEmployeeCode,
                        certificate_name: c.name,
                        certificate_number: c.number || null,
                        training_place: c.trainingPlace || null,
                        issue_date: c.issueDate || null,
                        expiry_date: c.expiryDate || null
                    }))
                    const { error: certError } = await supabase.from('employee_certificates').insert(certsPayload)
                    if (certError) console.error('Error saving certificates:', certError)
                }

                // Save Internal Trainings
                if (formData.trainings && formData.trainings.length > 0) {
                    const trainingsPayload = formData.trainings.map(t => ({
                        employee_code: newEmployeeCode,
                        training_course: t.course,
                        decision_number: t.decisionNumber || null,
                        from_date: t.fromDate || null,
                        to_date: t.toDate || null,
                        training_place: t.place || null,
                        result: t.result || null
                    }))
                    const { error: trainError } = await supabase.from('employee_internal_trainings').insert(trainingsPayload)
                    if (trainError) console.error('Error saving trainings:', trainError)
                }

                // Save Rewards
                if (formData.rewards && formData.rewards.length > 0) {
                    const rewardsPayload = formData.rewards.map(r => ({
                        employee_code: newEmployeeCode,
                        decision_number: r.decisionNumber || null,
                        reward_type: r.type,
                        reward_content: r.content || null,
                        amount: r.amount ? parseFloat(r.amount.toString().replace(/\./g, "").replace(",", ".")) : 0,
                        reward_date: r.date || null
                    }))
                    const { error: rewardError } = await supabase.from('employee_rewards').insert(rewardsPayload)
                    if (rewardError) console.error('Error saving rewards:', rewardError)
                }

                // Save Disciplines
                if (formData.disciplines && formData.disciplines.length > 0) {
                    const disciplinesPayload = formData.disciplines.map(d => ({
                        employee_code: newEmployeeCode,
                        decision_number: d.decisionNumber || null,
                        discipline_type: d.type,
                        signed_date: d.signedDate || null,
                        from_date: d.fromDate || null,
                        to_date: d.toDate || null,
                        note: d.note || null
                    }))
                    const { error: disciplineError } = await supabase.from('employee_disciplines').insert(disciplinesPayload)
                    if (disciplineError) console.error('Error saving disciplines:', disciplineError)
                }

                // Save Health Checks
                if (formData.healthChecks && formData.healthChecks.length > 0) {
                    const healthPayload = formData.healthChecks.map(h => ({
                        employee_code: newEmployeeCode,
                        checkup_date: h.date || null,
                        checkup_location: h.location || null,
                        result: h.result || null
                    }))
                    const { error: healthError } = await supabase.from('employee_health_checkups').insert(healthPayload)
                    if (healthError) console.error('Error saving health checks:', healthError)
                }

                // Save Accidents
                if (formData.accidents && formData.accidents.length > 0) {
                    const accidentsPayload = formData.accidents.map(a => ({
                        employee_code: newEmployeeCode,
                        accident_date: a.date || null,
                        accident_location: a.location || null,
                        accident_type: a.type || null,
                        note: a.description || null
                    }))
                    const { error: accidentError } = await supabase.from('employee_work_accidents').insert(accidentsPayload)
                    if (accidentError) console.error('Error saving accidents:', accidentError)
                }
            }

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
                {/* LEFT PANEL: LIST VIEW */}
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
                        <table className="employees-table-compact">
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Họ Tên</th>
                                    <th>Phòng Ban</th>
                                    <th>Vị Trí</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedEmployees().map(group => (
                                    <React.Fragment key={group.department}>
                                        {/* Department Header */}
                                        <tr className="department-header-row">
                                            <td colSpan="4" className="department-header">
                                                <strong>{group.department}</strong>
                                                <span className="employee-count">({group.count} nhân viên)</span>
                                            </td>
                                        </tr>
                                        {/* Employees in this department */}
                                        {group.employees.map(emp => (
                                            <tr
                                                key={emp.id}
                                                onClick={() => setSelectedEmployee(emp)}
                                                className={selectedEmployee && selectedEmployee.id === emp.id ? 'active-row' : ''}
                                            >
                                                <td className="employee-code">{emp.employeeId}</td>
                                                <td className="employee-name">{emp.ho_va_ten}</td>
                                                <td className="employee-department">{emp.bo_phan || '-'}</td>
                                                <td className="employee-position">{emp.vi_tri || '-'}</td>
                                            </tr >
                                        ))
                                        }
                                    </React.Fragment >
                                ))
                                }
                                {
                                    filteredEmployees.length === 0 && (
                                        <tr><td colSpan="4" className="empty-state">Không tìm thấy nhân viên</td></tr>
                                    )
                                }
                            </tbody >
                        </table >
                    </div >
                </div >

                {/* RIGHT PANEL: DETAIL VIEW */}
                < div className="detail-panel" ref={detailRef} >
                    <div className="panel-header">
                        <h2><i className="fas fa-id-card"></i> Hồ sơ nhân viên</h2>
                        <div className="panel-actions">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => navigate('/import-nhan-vien')}
                                style={{ marginRight: '8px' }}
                            >
                                <i className="fas fa-file-import"></i> Import
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowCreateWizard(true)}>
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
                            onDisable={handleDisableEmployee}
                            onActivate={handleActivateEmployee}
                            onDelete={handleDeleteEmployee}
                            onResetPassword={handleResetPassword}
                            canManage={true}
                            onSelectEmployee={setSelectedEmployee}
                        />
                    </div>
                </div >
            </div >

            {/* Reset Password Modal */}
            {
                showResetPasswordModal && employeeToReset && (
                    <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>
                                    <i className="fas fa-key"></i> Reset mật khẩu
                                </h2>
                                <button className="close-btn" onClick={() => setShowResetPasswordModal(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn reset mật khẩu của <strong>{employeeToReset.employeeId}</strong> về mặc định (123456)?</p>
                                <p className="text-muted">Người dùng sẽ phải đổi mật khẩu trong lần đăng nhập tiếp theo.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowResetPasswordModal(false)}>
                                    Hủy
                                </button>
                                <button className="btn btn-primary" onClick={confirmResetPassword}>
                                    <i className="fas fa-check"></i> Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Create Employee Wizard */}
            {
                showCreateWizard && (
                    <CreateEmployeeWizard
                        onClose={() => setShowCreateWizard(false)}
                        onComplete={async (wizardData) => {
                            try {
                                await handleSaveEmployee(wizardData, null)
                                setShowCreateWizard(false)
                                loadEmployees()
                            } catch (err) {
                                console.error('Error creating employee:', err)
                            }
                        }}
                    />
                )
            }
        </div >
    )
}

export default Employees


