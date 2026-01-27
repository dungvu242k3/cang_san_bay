import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

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
    leave_calculation_type: 'Có cộng dồn'
}

function EmployeeModal({ employee, isOpen, onClose, onSave, readOnly = false }) {
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
    const [avatarPreview, setAvatarPreview] = useState('')
    const [imagesPreview, setImagesPreview] = useState([])
    const [filesPreview, setFilesPreview] = useState([])

    // State for URL inputs
    const [avatarUrlInput, setAvatarUrlInput] = useState('')
    const [galleryUrlInput, setGalleryUrlInput] = useState('')

    useEffect(() => {
        if (employee) {
            setFormData({
                ...DEFAULT_FORM_DATA, // Merge with defaults to ensure all keys exist
                ho_va_ten: employee.ho_va_ten || '',
                employeeId: employee.employeeId || '',
                email: employee.email || '',
                sđt: employee.sđt || employee.sdt || '',
                chi_nhanh: employee.chi_nhanh || 'HCM',
                bo_phan: employee.bo_phan || '',
                vi_tri: employee.vi_tri || '',
                trang_thai: employee.trang_thai || employee.status || 'Thử việc',
                ca_lam_viec: employee.ca_lam_viec || 'Ca full',
                ngay_vao_lam: employee.ngay_vao_lam || '',
                ngay_lam_chinh_thuc: employee.ngay_lam_chinh_thuc || '',
                cccd: employee.cccd || '',
                ngay_cap: employee.ngay_cap || '',
                noi_cap: employee.noi_cap || '',
                dia_chi_thuong_tru: employee.dia_chi_thuong_tru || '',
                que_quan: employee.que_quan || '',
                ngay_sinh: employee.ngay_sinh || employee.dob || '',
                gioi_tinh: employee.gioi_tinh || '',
                tinh_trang_hon_nhan: employee.tinh_trang_hon_nhan || '',
                avatarDataUrl: employee.avatarDataUrl || employee.avatarUrl || employee.avatar || '',
                images: employee.images || [],
                files: employee.files || []
            })

            const initialAvatar = employee.avatarDataUrl || employee.avatarUrl || employee.avatar || ''
            setAvatarPreview(initialAvatar)
            // If the initial avatar is a URL (starts with http), set it to the input too
            if (initialAvatar.startsWith('http')) {
                setAvatarUrlInput(initialAvatar)
            } else {
                setAvatarUrlInput('')
            }

            setImagesPreview(employee.images || [])
            setFilesPreview(employee.files || [])

            // Fetch extended profile
            if (employee.employeeId) {
                supabase
                    .from('employee_profiles')
                    .select('*')
                    .eq('employee_code', employee.employeeId)
                    .single()
                    .then(({ data, error }) => {
                        if (data && !error) {
                            setFormData(prev => ({
                                ...prev,
                                nationality: data.nationality || 'Việt Nam',
                                place_of_birth: data.place_of_birth || '',
                                ethnicity: data.ethnicity || 'Kinh',
                                religion: data.religion || 'Không',
                                education_level: data.education_level || '12/12',
                                training_form: data.training_form || 'Phổ Thông',
                                academic_level_code: data.academic_level_code || 'DH',
                                marital_status_code: data.marital_status_code || 1,
                                card_number: data.card_number || '',
                                permanent_address: data.permanent_address || '',
                                temporary_address: data.temporary_address || '',
                                hometown: data.hometown || '',
                                phone: data.phone || '',
                                email_acv: data.email_acv || '',
                                email_personal: data.email_personal || '',
                                relative_phone: data.relative_phone || '',
                                relative_relation: data.relative_relation || 'Khác',
                                // 1.3 Work
                                decision_number: data.decision_number || '',
                                join_date: data.join_date || '',
                                official_date: data.official_date || '',
                                job_position: data.job_position || '',
                                department: data.department || '',
                                team: data.team || '',
                                group_name: data.group_name || '',
                                employee_type: data.employee_type || 'MB NVCT',
                                labor_type: data.labor_type || '',
                                job_title: data.job_title || '',
                                date_received_job_title: data.date_received_job_title || '',
                                current_position: data.current_position || 'Khác',
                                appointment_date: data.appointment_date || '',
                                concurrent_position: data.concurrent_position || '',
                                concurrent_job_title: data.concurrent_job_title || '',
                                concurrent_start_date: data.concurrent_start_date || '',
                                concurrent_end_date: data.concurrent_end_date || '',
                                leave_calculation_type: data.leave_calculation_type || 'Có cộng dồn'
                            }))
                        }
                    })
            }
        } else {
            resetForm()
        }
    }, [employee, isOpen])

    const resetForm = () => {
        setFormData(DEFAULT_FORM_DATA)
        setAvatarPreview('')
        setImagesPreview([])
        setFilesPreview([])
        setAvatarUrlInput('')
        setGalleryUrlInput('')
    }
}