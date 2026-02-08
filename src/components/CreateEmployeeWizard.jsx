import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import './CreateEmployeeWizard.css'
import SearchableDropdown from './SearchableDropdown'

const STEPS = [
    { id: 'ly_lich', title: 'Sơ yếu lý lịch', icon: 'fa-user' },
    { id: 'phap_ly', title: 'Thông tin pháp lý', icon: 'fa-id-card' },
    { id: 'phuc_loi', title: 'Phúc lợi', icon: 'fa-gift' },
    { id: 'qua_trinh', title: 'Quá trình làm việc', icon: 'fa-briefcase' },
    { id: 'kien_thuc', title: 'Kiến thức', icon: 'fa-graduation-cap' },
    { id: 'khen_ky_luat', title: 'Khen thưởng - Kỷ luật', icon: 'fa-medal' },
    { id: 'suc_khoe', title: 'Sức khoẻ', icon: 'fa-heartbeat' }
]

function CreateEmployeeWizard({ onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [departments, setDepartments] = useState([])
    const [teams, setTeams] = useState([])
    const [groups, setGroups] = useState([])
    const [formData, setFormData] = useState({
        // Lý lịch cá nhân
        employeeId: '', ho_va_ten: '', gioi_tinh: 'Nam', ngay_sinh: '',
        nationality: 'Việt Nam', place_of_birth: '', ethnicity: 'Kinh', religion: 'Không',
        // Liên hệ
        permanent_address: '', temporary_address: '', hometown: '', phone: '',
        email_acv: '', email_personal: '', relative_phone: '', relative_relation: 'Khác',
        // Công việc
        department: '', team: '', group_name: '', job_position: '', employee_type: 'MB NVCT',
        join_date: '', official_date: '', current_position: 'Khác', labor_type: '',
        // Đảng/Đoàn/Công đoàn
        is_party_member: false, party_card_number: '', party_join_date: '',
        is_youth_union_member: false, youth_union_card_number: '',
        is_trade_union_member: false, trade_union_card_number: '',
        // Pháp lý
        identity_card_number: '', identity_card_issue_date: '', identity_card_issue_place: '',
        tax_code: '', social_insurance_number: '', health_insurance_number: '',
        // Lists
        familyMembers: [], bankAccounts: [], contracts: [], passports: [],
        salaries: [], allowances: [], leaves: [], appointments: [],
        certifications: [], trainings: [], rewards: [], disciplines: [],
        healthChecks: [], accidents: [], insuranceCards: []
    })

    // Load distinct departments and teams from database
    useEffect(() => {
        const loadOptions = async () => {
            // Load departments
            const { data: deptData } = await supabase
                .from('employee_profiles')
                .select('department')
                .not('department', 'is', null)
            if (deptData) {
                const uniqueDepts = [...new Set(deptData.map(d => d.department).filter(Boolean))]
                setDepartments(uniqueDepts.sort())
            }

            // Load teams
            const { data: teamData } = await supabase
                .from('employee_profiles')
                .select('team')
                .not('team', 'is', null)
            if (teamData) {
                const uniqueTeams = [...new Set(teamData.map(t => t.team).filter(Boolean))]
                setTeams(uniqueTeams.sort())
            }

            // Load groups
            const { data: groupData } = await supabase
                .from('employee_profiles')
                .select('group_name')
                .not('group_name', 'is', null)
            if (groupData) {
                const uniqueGroups = [...new Set(groupData.map(g => g.group_name).filter(Boolean))]
                setGroups(uniqueGroups.sort())
            }
        }
        loadOptions()
    }, [])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addListItem = (listName, item) => {
        setFormData(prev => ({ ...prev, [listName]: [...prev[listName], item] }))
    }

    const removeListItem = (listName, index) => {
        setFormData(prev => ({
            ...prev,
            [listName]: prev[listName].filter((_, i) => i !== index)
        }))
    }

    // Inline form states for adding items
    const [showFamilyForm, setShowFamilyForm] = useState(false)
    const [newFamily, setNewFamily] = useState({ name: '', relation: '', birth_year: '', phone: '', job: '', address: '' })

    const [showBankForm, setShowBankForm] = useState(false)
    const [newBank, setNewBank] = useState({ bank: '', number: '', owner: '' })

    const [showContractForm, setShowContractForm] = useState(false)
    const [newContract, setNewContract] = useState({ number: '', type: '', effectiveDate: '', expiryDate: '', signedDate: '' })

    const [showPassportForm, setShowPassportForm] = useState(false)
    const [newPassport, setNewPassport] = useState({ number: '', type: '', issueDate: '', issuePlace: '', expiryDate: '' })

    const [showSalaryForm, setShowSalaryForm] = useState(false)
    const [newSalary, setNewSalary] = useState({ amount: '', effectiveDate: '', decisionNumber: '' })

    const [showAllowanceForm, setShowAllowanceForm] = useState(false)
    const [newAllowance, setNewAllowance] = useState({ type: '', amount: '', effectiveDate: '', decisionNumber: '' })

    const [showAppointmentForm, setShowAppointmentForm] = useState(false)
    const [newAppointment, setNewAppointment] = useState({ decisionNumber: '', appliedDate: '', position: '', jobTitle: '', department: '' })

    const [showCertForm, setShowCertForm] = useState(false)
    const [newCert, setNewCert] = useState({ name: '', number: '', level: '', trainingPlace: '', issueDate: '', expiryDate: '' })

    const [showTrainingForm, setShowTrainingForm] = useState(false)
    const [newTraining, setNewTraining] = useState({ course: '', decisionNumber: '', fromDate: '', toDate: '', place: '', result: '' })

    const [showRewardForm, setShowRewardForm] = useState(false)
    const [newReward, setNewReward] = useState({ decisionNumber: '', type: '', content: '', date: '', amount: '' })

    const [showDisciplineForm, setShowDisciplineForm] = useState(false)
    const [newDiscipline, setNewDiscipline] = useState({ decisionNumber: '', type: '', signedDate: '', fromDate: '', toDate: '', note: '' })

    const [showHealthForm, setShowHealthForm] = useState(false)
    const [newHealth, setNewHealth] = useState({ date: '', location: '', result: '', note: '' })

    const [showAccidentForm, setShowAccidentForm] = useState(false)
    const [newAccident, setNewAccident] = useState({ date: '', location: '', type: '', description: '', note: '' })

    const handleSubmit = () => {
        if (!formData.employeeId || !formData.ho_va_ten || !formData.email_acv || !formData.department) {
            alert('Vui lòng điền đầy đủ: Mã NV, Họ tên, Email, Phòng ban')
            setCurrentStep(0)
            return
        }
        onComplete(formData)
    }

    const renderStep = () => {
        switch (STEPS[currentStep].id) {
            case 'ly_lich': return renderLyLich()
            case 'phap_ly': return renderPhapLy()
            case 'phuc_loi': return renderPhucLoi()
            case 'qua_trinh': return renderQuaTrinh()
            case 'kien_thuc': return renderKienThuc()
            case 'khen_ky_luat': return renderKhenKyLuat()
            case 'suc_khoe': return renderSucKhoe()
            default: return null
        }
    }

    const renderLyLich = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-user"></i> Lý lịch cá nhân</h3>
            <div className="wizard-subsection">
                <h4><i className="fas fa-info-circle"></i> Thông tin cơ bản</h4>
                <div className="wizard-form-grid">
                    <div className="wizard-form-group">
                        <label>Mã nhân viên <span className="required">*</span></label>
                        <input type="text" placeholder="CBA0001" value={formData.employeeId}
                            onChange={e => handleChange('employeeId', e.target.value.toUpperCase())} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Họ và tên <span className="required">*</span></label>
                        <input type="text" value={formData.ho_va_ten}
                            onChange={e => handleChange('ho_va_ten', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Giới tính</label>
                        <select value={formData.gioi_tinh} onChange={e => handleChange('gioi_tinh', e.target.value)}>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                    </div>
                    <div className="wizard-form-group">
                        <label>Ngày sinh</label>
                        <input type="date" value={formData.ngay_sinh}
                            onChange={e => handleChange('ngay_sinh', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Nơi sinh</label>
                        <input type="text" value={formData.place_of_birth}
                            onChange={e => handleChange('place_of_birth', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Quốc tịch</label>
                        <input type="text" value={formData.nationality}
                            onChange={e => handleChange('nationality', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Dân tộc</label>
                        <input type="text" value={formData.ethnicity}
                            onChange={e => handleChange('ethnicity', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Tôn giáo</label>
                        <input type="text" value={formData.religion}
                            onChange={e => handleChange('religion', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-phone"></i> Thông tin liên hệ</h4>
                <div className="wizard-form-grid">
                    <div className="wizard-form-group full-width">
                        <label>Địa chỉ thường trú</label>
                        <input type="text" value={formData.permanent_address}
                            onChange={e => handleChange('permanent_address', e.target.value)} />
                    </div>
                    <div className="wizard-form-group full-width">
                        <label>Địa chỉ tạm trú</label>
                        <input type="text" value={formData.temporary_address}
                            onChange={e => handleChange('temporary_address', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Quê quán</label>
                        <input type="text" value={formData.hometown}
                            onChange={e => handleChange('hometown', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Số điện thoại</label>
                        <input type="tel" value={formData.phone}
                            onChange={e => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Email doanh nghiệp <span className="required">*</span></label>
                        <input type="email" value={formData.email_acv}
                            onChange={e => handleChange('email_acv', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Email cá nhân</label>
                        <input type="email" value={formData.email_personal}
                            onChange={e => handleChange('email_personal', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-briefcase"></i> Thông tin công việc</h4>
                <div className="wizard-form-grid">
                    <div className="wizard-form-group">
                        <label>Phòng ban <span className="required">*</span></label>
                        <SearchableDropdown
                            options={departments}
                            value={formData.department}
                            onChange={(val) => handleChange('department', val)}
                            placeholder="Tìm phòng ban..."
                            allowCustom={true}
                        />
                    </div>
                    <div className="wizard-form-group">
                        <label>Đội/Tổ</label>
                        <SearchableDropdown
                            options={teams}
                            value={formData.team}
                            onChange={(val) => handleChange('team', val)}
                            placeholder="Tìm đội/tổ..."
                            allowCustom={true}
                        />
                    </div>

                    <div className="wizard-form-group">
                        <label>Vị trí công việc</label>
                        <input type="text" value={formData.job_position}
                            onChange={e => handleChange('job_position', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Loại nhân viên</label>
                        <select value={formData.employee_type} onChange={e => handleChange('employee_type', e.target.value)}>
                            <option value="MB NVCT">MB NVCT</option>
                            <option value="MB CBQL">MB CBQL</option>
                            <option value="HĐ NVGT">HĐ NVGT</option>
                        </select>
                    </div>
                    <div className="wizard-form-group">
                        <label>Ngày vào làm</label>
                        <input type="date" value={formData.join_date}
                            onChange={e => handleChange('join_date', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Chức vụ hiện tại</label>
                        <select value={formData.current_position} onChange={e => handleChange('current_position', e.target.value)}>
                            <option value="Giám đốc">Giám đốc</option>
                            <option value="Phó giám đốc">Phó giám đốc</option>
                            <option value="Trưởng phòng">Trưởng phòng</option>
                            <option value="Phó phòng">Phó phòng</option>
                            <option value="Đội trưởng">Đội trưởng</option>
                            <option value="Đội phó">Đội phó</option>
                            <option value="Tổ trưởng">Tổ trưởng</option>
                            <option value="Tổ phó">Tổ phó</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-users"></i> Thân nhân</h4>

                {/* Table of existing family members */}
                {formData.familyMembers.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>Quan hệ</th>
                                <th>Năm sinh</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.familyMembers.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.name}</td>
                                    <td>{m.relation}</td>
                                    <td>{m.birth_year}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('familyMembers', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Inline Add Form */}
                {showFamilyForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Họ tên <span className="required">*</span></label>
                                <input type="text" value={newFamily.name}
                                    onChange={e => setNewFamily({ ...newFamily, name: e.target.value })}
                                    placeholder="Nhập họ tên" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Quan hệ <span className="required">*</span></label>
                                <select value={newFamily.relation}
                                    onChange={e => setNewFamily({ ...newFamily, relation: e.target.value })}>
                                    <option value="">-- Chọn --</option>
                                    <option value="Cha ruột">Bố</option>
                                    <option value="Mẹ ruột">Mẹ</option>
                                    <option value="Vợ">Vợ</option>
                                    <option value="Chồng">Chồng</option>
                                    <option value="Con ruột">Con</option>
                                    <option value="Anh ruột">Anh</option>
                                    <option value="Chị ruột">Chị</option>
                                    <option value="Em ruột">Em</option>
                                    <option value="Anh vợ">Anh vợ</option>
                                    <option value="Chị vợ">Chị vợ</option>
                                    <option value="Em vợ">Em vợ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="wizard-form-group">
                                <label>Năm sinh</label>
                                <input type="number" value={newFamily.birth_year}
                                    onChange={e => setNewFamily({ ...newFamily, birth_year: e.target.value })}
                                    placeholder="VD: 1990" min="1900" max="2025" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newFamily.name || !newFamily.relation) {
                                    alert('Vui lòng nhập họ tên và quan hệ!')
                                    return
                                }
                                addListItem('familyMembers', { ...newFamily })
                                setNewFamily({ name: '', relation: '', birth_year: '' })
                                setShowFamilyForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewFamily({ name: '', relation: '', birth_year: '' })
                                setShowFamilyForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowFamilyForm(true)}>
                        <i className="fas fa-plus"></i> Thêm thân nhân
                    </button>
                )}
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-flag"></i> Hồ sơ Đảng / Đoàn / Công đoàn</h4>

                {/* Đảng viên */}
                <div className="wizard-membership-block">
                    <div className="wizard-checkbox-group">
                        <input type="checkbox" id="is_party_member" checked={formData.is_party_member}
                            onChange={e => handleChange('is_party_member', e.target.checked)} />
                        <label htmlFor="is_party_member"><strong>Đảng viên</strong></label>
                    </div>
                    {formData.is_party_member && (
                        <div className="wizard-form-grid wizard-nested">
                            <div className="wizard-form-group">
                                <label>Số thẻ Đảng viên</label>
                                <input type="text" value={formData.party_card_number}
                                    onChange={e => handleChange('party_card_number', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày vào Đảng</label>
                                <input type="date" value={formData.party_join_date}
                                    onChange={e => handleChange('party_join_date', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày chính thức</label>
                                <input type="date" value={formData.party_official_date || ''}
                                    onChange={e => handleChange('party_official_date', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Chi bộ</label>
                                <input type="text" value={formData.party_cell || ''}
                                    onChange={e => handleChange('party_cell', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Đoàn viên */}
                <div className="wizard-membership-block">
                    <div className="wizard-checkbox-group">
                        <input type="checkbox" id="is_youth_union_member" checked={formData.is_youth_union_member}
                            onChange={e => handleChange('is_youth_union_member', e.target.checked)} />
                        <label htmlFor="is_youth_union_member"><strong>Đoàn viên</strong></label>
                    </div>
                    {formData.is_youth_union_member && (
                        <div className="wizard-form-grid wizard-nested">
                            <div className="wizard-form-group">
                                <label>Số thẻ Đoàn viên</label>
                                <input type="text" value={formData.youth_union_card_number}
                                    onChange={e => handleChange('youth_union_card_number', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày vào Đoàn</label>
                                <input type="date" value={formData.youth_union_join_date || ''}
                                    onChange={e => handleChange('youth_union_join_date', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Chi đoàn</label>
                                <input type="text" value={formData.youth_union_cell || ''}
                                    onChange={e => handleChange('youth_union_cell', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Công đoàn viên */}
                <div className="wizard-membership-block">
                    <div className="wizard-checkbox-group">
                        <input type="checkbox" id="is_trade_union_member" checked={formData.is_trade_union_member}
                            onChange={e => handleChange('is_trade_union_member', e.target.checked)} />
                        <label htmlFor="is_trade_union_member"><strong>Công đoàn viên</strong></label>
                    </div>
                    {formData.is_trade_union_member && (
                        <div className="wizard-form-grid wizard-nested">
                            <div className="wizard-form-group">
                                <label>Số thẻ Công đoàn</label>
                                <input type="text" value={formData.trade_union_card_number}
                                    onChange={e => handleChange('trade_union_card_number', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày gia nhập</label>
                                <input type="date" value={formData.trade_union_join_date || ''}
                                    onChange={e => handleChange('trade_union_join_date', e.target.value)} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Công đoàn cơ sở</label>
                                <input type="text" value={formData.trade_union_base || ''}
                                    onChange={e => handleChange('trade_union_base', e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )

    const renderPhapLy = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-id-card"></i> Thông tin pháp lý</h3>
            <div className="wizard-subsection">
                <h4><i className="fas fa-address-card"></i> CCCD / Bảo hiểm</h4>
                <div className="wizard-form-grid">
                    <div className="wizard-form-group">
                        <label>Số CCCD</label>
                        <input type="text" value={formData.identity_card_number}
                            onChange={e => handleChange('identity_card_number', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Ngày cấp</label>
                        <input type="date" value={formData.identity_card_issue_date}
                            onChange={e => handleChange('identity_card_issue_date', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Nơi cấp</label>
                        <input type="text" value={formData.identity_card_issue_place}
                            onChange={e => handleChange('identity_card_issue_place', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Mã số thuế</label>
                        <input type="text" value={formData.tax_code}
                            onChange={e => handleChange('tax_code', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Số BHXH</label>
                        <input type="text" value={formData.social_insurance_number}
                            onChange={e => handleChange('social_insurance_number', e.target.value)} />
                    </div>
                    <div className="wizard-form-group">
                        <label>Số BHYT</label>
                        <input type="text" value={formData.health_insurance_number}
                            onChange={e => handleChange('health_insurance_number', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-university"></i> Tài khoản ngân hàng</h4>

                {/* Table of existing bank accounts */}
                {formData.bankAccounts.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Ngân hàng</th>
                                <th>Số TK</th>
                                <th>Chủ TK</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.bankAccounts.map((b, i) => (
                                <tr key={i}>
                                    <td>{b.bank}</td>
                                    <td>{b.number}</td>
                                    <td>{b.owner}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('bankAccounts', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Inline Add Bank Form */}
                {showBankForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Tên Ngân hàng <span className="required">*</span></label>
                                <input type="text" value={newBank.bank}
                                    onChange={e => setNewBank({ ...newBank, bank: e.target.value })}
                                    placeholder="Vietcombank, Techcombank..." />
                            </div>
                            <div className="wizard-form-group">
                                <label>Số tài khoản <span className="required">*</span></label>
                                <input type="text" value={newBank.number}
                                    onChange={e => setNewBank({ ...newBank, number: e.target.value })}
                                    placeholder="Số tài khoản" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Chủ tài khoản</label>
                                <input type="text" value={newBank.owner}
                                    onChange={e => setNewBank({ ...newBank, owner: e.target.value })}
                                    placeholder="Tên chủ thẻ" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newBank.bank || !newBank.number) {
                                    alert('Vui lòng nhập Tên ngân hàng và Số tài khoản!')
                                    return
                                }
                                addListItem('bankAccounts', { ...newBank })
                                setNewBank({ bank: '', number: '', owner: '' })
                                setShowBankForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewBank({ bank: '', number: '', owner: '' })
                                setShowBankForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowBankForm(true)}>
                        <i className="fas fa-plus"></i> Thêm tài khoản
                    </button>
                )}
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-file-contract"></i> Hợp đồng lao động</h4>
                {formData.contracts.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số HĐ</th>
                                <th>Loại</th>
                                <th>Hiệu lực</th>
                                <th>Hết hạn</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.contracts.map((c, i) => (
                                <tr key={i}>
                                    <td>{c.number}</td>
                                    <td>{c.type}</td>
                                    <td>{c.effectiveDate}</td>
                                    <td>{c.expiryDate}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('contracts', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showContractForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số hợp đồng <span className="required">*</span></label>
                                <input type="text" value={newContract.number}
                                    onChange={e => setNewContract({ ...newContract, number: e.target.value })}
                                    placeholder="Số HĐ / QĐ" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Loại hợp đồng <span className="required">*</span></label>
                                <select value={newContract.type}
                                    onChange={e => setNewContract({ ...newContract, type: e.target.value })}>
                                    <option value="">-- Chọn --</option>
                                    <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                                    <option value="Xác định thời hạn 1 năm">Xác định thời hạn 1 năm</option>
                                    <option value="Xác định thời hạn 2 năm">Xác định thời hạn 2 năm</option>
                                    <option value="Thử việc">Thử việc</option>
                                    <option value="Khoán">Khoán</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày hiệu lực</label>
                                <input type="date" value={newContract.effectiveDate}
                                    onChange={e => setNewContract({ ...newContract, effectiveDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày hết hạn</label>
                                <input type="date" value={newContract.expiryDate}
                                    onChange={e => setNewContract({ ...newContract, expiryDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày ký</label>
                                <input type="date" value={newContract.signedDate}
                                    onChange={e => setNewContract({ ...newContract, signedDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newContract.number || !newContract.type) {
                                    alert('Vui lòng nhập Số hợp đồng và Loại hợp đồng!')
                                    return
                                }
                                addListItem('contracts', { ...newContract })
                                setNewContract({ number: '', type: '', effectiveDate: '', expiryDate: '', signedDate: '' })
                                setShowContractForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewContract({ number: '', type: '', effectiveDate: '', expiryDate: '', signedDate: '' })
                                setShowContractForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowContractForm(true)}>
                        <i className="fas fa-plus"></i> Thêm hợp đồng
                    </button>
                )}
            </div>

            <div className="wizard-subsection">
                <h4><i className="fas fa-passport"></i> Hộ chiếu</h4>
                {formData.passports.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số HC</th>
                                <th>Loại</th>
                                <th>Ngày cấp</th>
                                <th>Hết hạn</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.passports.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.number}</td>
                                    <td>{p.type}</td>
                                    <td>{p.issueDate}</td>
                                    <td>{p.expiryDate}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('passports', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showPassportForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số hộ chiếu <span className="required">*</span></label>
                                <input type="text" value={newPassport.number}
                                    onChange={e => setNewPassport({ ...newPassport, number: e.target.value })}
                                    placeholder="Nhập số HC" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Loại hộ chiếu</label>
                                <select value={newPassport.type}
                                    onChange={e => setNewPassport({ ...newPassport, type: e.target.value })}>
                                    <option value="">-- Chọn --</option>
                                    <option value="Phổ thông">Phổ thông</option>
                                    <option value="Công vụ">Công vụ</option>
                                    <option value="Ngoại giao">Ngoại giao</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày cấp</label>
                                <input type="date" value={newPassport.issueDate}
                                    onChange={e => setNewPassport({ ...newPassport, issueDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Nơi cấp</label>
                                <input type="text" value={newPassport.issuePlace}
                                    onChange={e => setNewPassport({ ...newPassport, issuePlace: e.target.value })}
                                    placeholder="Cục QLXNC" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày hết hạn</label>
                                <input type="date" value={newPassport.expiryDate}
                                    onChange={e => setNewPassport({ ...newPassport, expiryDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newPassport.number) {
                                    alert('Vui lòng nhập Số hộ chiếu!')
                                    return
                                }
                                addListItem('passports', { ...newPassport })
                                setNewPassport({ number: '', type: '', issueDate: '', issuePlace: '', expiryDate: '' })
                                setShowPassportForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewPassport({ number: '', type: '', issueDate: '', issuePlace: '', expiryDate: '' })
                                setShowPassportForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowPassportForm(true)}>
                        <i className="fas fa-plus"></i> Thêm hộ chiếu
                    </button>
                )}
            </div>
        </>
    )

    const renderPhucLoi = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-gift"></i> Phúc lợi</h3>
            <div className="wizard-subsection">
                <h4><i className="fas fa-money-bill"></i> Lương cơ bản</h4>
                {formData.salaries.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Mức lương</th>
                                <th>Ngày hiệu lực</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.salaries.map((s, i) => (
                                <tr key={i}>
                                    <td>{s.decisionNumber}</td>
                                    <td>{s.amount}</td>
                                    <td>{s.effectiveDate}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('salaries', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showSalaryForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số QĐ</label>
                                <input type="text" value={newSalary.decisionNumber}
                                    onChange={e => setNewSalary({ ...newSalary, decisionNumber: e.target.value })}
                                    placeholder="Số quyết định" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Mức lương <span className="required">*</span></label>
                                <input type="text" value={newSalary.amount}
                                    onChange={e => setNewSalary({ ...newSalary, amount: e.target.value })}
                                    placeholder="Nhập mức lương" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày hiệu lực</label>
                                <input type="date" value={newSalary.effectiveDate}
                                    onChange={e => setNewSalary({ ...newSalary, effectiveDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newSalary.amount) {
                                    alert('Vui lòng nhập Mức lương!')
                                    return
                                }
                                addListItem('salaries', { ...newSalary })
                                setNewSalary({ amount: '', effectiveDate: '', decisionNumber: '' })
                                setShowSalaryForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewSalary({ amount: '', effectiveDate: '', decisionNumber: '' })
                                setShowSalaryForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowSalaryForm(true)}>
                        <i className="fas fa-plus"></i> Thêm lương cơ bản
                    </button>
                )}
            </div>
            <div className="wizard-subsection">
                <h4><i className="fas fa-hand-holding-usd"></i> Phụ cấp</h4>
                {formData.allowances.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Loại</th>
                                <th>Số tiền</th>
                                <th>Ngày HL</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.allowances.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.decisionNumber}</td>
                                    <td>{a.type}</td>
                                    <td>{a.amount}</td>
                                    <td>{a.effectiveDate}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('allowances', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showAllowanceForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số QĐ</label>
                                <input type="text" value={newAllowance.decisionNumber}
                                    onChange={e => setNewAllowance({ ...newAllowance, decisionNumber: e.target.value })}
                                    placeholder="Số quyết định" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Loại phụ cấp <span className="required">*</span></label>
                                <input type="text" value={newAllowance.type}
                                    onChange={e => setNewAllowance({ ...newAllowance, type: e.target.value })}
                                    placeholder="Tên loại phụ cấp" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Số tiền <span className="required">*</span></label>
                                <input type="text" value={newAllowance.amount}
                                    onChange={e => setNewAllowance({ ...newAllowance, amount: e.target.value })}
                                    placeholder="VNĐ" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày hiệu lực</label>
                                <input type="date" value={newAllowance.effectiveDate}
                                    onChange={e => setNewAllowance({ ...newAllowance, effectiveDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newAllowance.type || !newAllowance.amount) {
                                    alert('Vui lòng nhập Loại và Số tiền!')
                                    return
                                }
                                addListItem('allowances', { ...newAllowance })
                                setNewAllowance({ type: '', amount: '', effectiveDate: '', decisionNumber: '' })
                                setShowAllowanceForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewAllowance({ type: '', amount: '', effectiveDate: '', decisionNumber: '' })
                                setShowAllowanceForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowAllowanceForm(true)}>
                        <i className="fas fa-plus"></i> Thêm phụ cấp
                    </button>
                )}
            </div>
        </>
    )

    const renderQuaTrinh = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-briefcase"></i> Quá trình làm việc</h3>
            <div className="wizard-subsection">
                <h4><i className="fas fa-calendar-alt"></i> Nghỉ phép</h4>
                <p className="text-muted">Dữ liệu nghỉ phép sẽ được quản lý sau khi tạo nhân viên.</p>
            </div>
            <div className="wizard-subsection">
                <h4><i className="fas fa-exchange-alt"></i> Bổ nhiệm - Điều chuyển</h4>
                {formData.appointments.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Chức vụ</th>
                                <th>Chức danh</th>
                                <th>Phòng ban</th>
                                <th>Ngày HL</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.appointments.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.decisionNumber}</td>
                                    <td>{a.position}</td>
                                    <td>{a.jobTitle}</td>
                                    <td>{a.department}</td>
                                    <td>{a.appliedDate}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('appointments', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showAppointmentForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số QĐ</label>
                                <input type="text" value={newAppointment.decisionNumber}
                                    onChange={e => setNewAppointment({ ...newAppointment, decisionNumber: e.target.value })}
                                    placeholder="Số quyết định" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày hiệu lực</label>
                                <input type="date" value={newAppointment.appliedDate}
                                    onChange={e => setNewAppointment({ ...newAppointment, appliedDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Chức vụ</label>
                                <input type="text" value={newAppointment.position}
                                    onChange={e => setNewAppointment({ ...newAppointment, position: e.target.value })}
                                    placeholder="Chức vụ" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Chức danh</label>
                                <input type="text" value={newAppointment.jobTitle}
                                    onChange={e => setNewAppointment({ ...newAppointment, jobTitle: e.target.value })}
                                    placeholder="Chức danh" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Phòng ban</label>
                                <input type="text" value={newAppointment.department}
                                    onChange={e => setNewAppointment({ ...newAppointment, department: e.target.value })}
                                    placeholder="Phòng ban" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newAppointment.position && !newAppointment.jobTitle) {
                                    alert('Vui lòng nhập Chức vụ hoặc Chức danh!')
                                    return
                                }
                                addListItem('appointments', { ...newAppointment })
                                setNewAppointment({ decisionNumber: '', appliedDate: '', position: '', jobTitle: '', department: '' })
                                setShowAppointmentForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewAppointment({ decisionNumber: '', appliedDate: '', position: '', jobTitle: '', department: '' })
                                setShowAppointmentForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowAppointmentForm(true)}>
                        <i className="fas fa-plus"></i> Thêm quyết định
                    </button>
                )}
            </div>
        </>
    )

    const renderKienThuc = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-graduation-cap"></i> Kiến thức</h3>

            {/* Chứng chỉ */}
            <div className="wizard-subsection">
                <h4><i className="fas fa-certificate"></i> Chứng chỉ</h4>
                {formData.certifications.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Tên chứng chỉ</th>
                                <th>Số hiệu</th>
                                <th>Nơi cấp</th>
                                <th>Ngày cấp</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.certifications.map((c, i) => (
                                <tr key={i}>
                                    <td>{c.name}</td>
                                    <td>{c.number}</td>
                                    <td>{c.trainingPlace}</td>
                                    <td>{c.issueDate}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('certifications', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showCertForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Tên chứng chỉ <span className="required">*</span></label>
                                <input type="text" value={newCert.name}
                                    onChange={e => setNewCert({ ...newCert, name: e.target.value })}
                                    placeholder="Tên chứng chỉ" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Số hiệu</label>
                                <input type="text" value={newCert.number}
                                    onChange={e => setNewCert({ ...newCert, number: e.target.value })}
                                    placeholder="Số hiệu" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Nơi đào tạo/Cấp</label>
                                <input type="text" value={newCert.trainingPlace}
                                    onChange={e => setNewCert({ ...newCert, trainingPlace: e.target.value })}
                                    placeholder="Nơi cấp" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày cấp</label>
                                <input type="date" value={newCert.issueDate}
                                    onChange={e => setNewCert({ ...newCert, issueDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newCert.name) {
                                    alert('Vui lòng nhập Tên chứng chỉ!')
                                    return
                                }
                                addListItem('certifications', { ...newCert })
                                setNewCert({ name: '', number: '', level: '', trainingPlace: '', issueDate: '', expiryDate: '' })
                                setShowCertForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewCert({ name: '', number: '', level: '', trainingPlace: '', issueDate: '', expiryDate: '' })
                                setShowCertForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowCertForm(true)}>
                        <i className="fas fa-plus"></i> Thêm chứng chỉ
                    </button>
                )}
            </div>

            {/* Đào tạo nội bộ */}
            <div className="wizard-subsection">
                <h4><i className="fas fa-chalkboard-teacher"></i> Đào tạo nội bộ</h4>
                {formData.trainings.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Khóa đào tạo</th>
                                <th>Số QĐ</th>
                                <th>Thời gian</th>
                                <th>Kết quả</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.trainings.map((t, i) => (
                                <tr key={i}>
                                    <td>{t.course}</td>
                                    <td>{t.decisionNumber}</td>
                                    <td>{t.fromDate} - {t.toDate}</td>
                                    <td>{t.result}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('trainings', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showTrainingForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Khóa đào tạo <span className="required">*</span></label>
                                <input type="text" value={newTraining.course}
                                    onChange={e => setNewTraining({ ...newTraining, course: e.target.value })}
                                    placeholder="Tên khóa đào tạo" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Số QĐ</label>
                                <input type="text" value={newTraining.decisionNumber}
                                    onChange={e => setNewTraining({ ...newTraining, decisionNumber: e.target.value })}
                                    placeholder="Số quyết định" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Từ ngày</label>
                                <input type="date" value={newTraining.fromDate}
                                    onChange={e => setNewTraining({ ...newTraining, fromDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Đến ngày</label>
                                <input type="date" value={newTraining.toDate}
                                    onChange={e => setNewTraining({ ...newTraining, toDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Kết quả</label>
                                <input type="text" value={newTraining.result}
                                    onChange={e => setNewTraining({ ...newTraining, result: e.target.value })}
                                    placeholder="Giỏi, Khá, Đạt..." />
                            </div>
                            <div className="wizard-form-group">
                                <label>Nơi đào tạo</label>
                                <input type="text" value={newTraining.place}
                                    onChange={e => setNewTraining({ ...newTraining, place: e.target.value })}
                                    placeholder="Cơ sở đào tạo" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newTraining.course) {
                                    alert('Vui lòng nhập Tên khóa đào tạo!')
                                    return
                                }
                                addListItem('trainings', { ...newTraining })
                                setNewTraining({ course: '', decisionNumber: '', fromDate: '', toDate: '', place: '', result: '' })
                                setShowTrainingForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewTraining({ course: '', decisionNumber: '', fromDate: '', toDate: '', place: '', result: '' })
                                setShowTrainingForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowTrainingForm(true)}>
                        <i className="fas fa-plus"></i> Thêm đào tạo
                    </button>
                )}
            </div>
        </>
    )

    const renderKhenKyLuat = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-medal"></i> Khen thưởng - Kỷ luật</h3>

            {/* Khen thưởng */}
            <div className="wizard-subsection">
                <h4><i className="fas fa-trophy"></i> Khen thưởng</h4>
                {formData.rewards.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Hình thức</th>
                                <th>Nội dung</th>
                                <th>Số tiền</th>
                                <th>Ngày</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.rewards.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.decisionNumber}</td>
                                    <td>{r.type}</td>
                                    <td>{r.content}</td>
                                    <td>{r.amount}</td>
                                    <td>{r.date}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('rewards', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showRewardForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số QĐ</label>
                                <input type="text" value={newReward.decisionNumber}
                                    onChange={e => setNewReward({ ...newReward, decisionNumber: e.target.value })}
                                    placeholder="Số quyết định" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Hình thức <span className="required">*</span></label>
                                <input type="text" value={newReward.type}
                                    onChange={e => setNewReward({ ...newReward, type: e.target.value })}
                                    placeholder="Giấy khen, Bằng khen..." />
                            </div>
                            <div className="wizard-form-group">
                                <label>Nội dung/Danh hiệu</label>
                                <input type="text" value={newReward.content}
                                    onChange={e => setNewReward({ ...newReward, content: e.target.value })}
                                    placeholder="Nội dung" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Số tiền</label>
                                <input type="text" value={newReward.amount}
                                    onChange={e => setNewReward({ ...newReward, amount: e.target.value })}
                                    placeholder="VNĐ" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày khen thưởng</label>
                                <input type="date" value={newReward.date}
                                    onChange={e => setNewReward({ ...newReward, date: e.target.value })} />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newReward.type) {
                                    alert('Vui lòng nhập Hình thức khen thưởng!')
                                    return
                                }
                                addListItem('rewards', { ...newReward })
                                setNewReward({ decisionNumber: '', type: '', content: '', date: '', amount: '' })
                                setShowRewardForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewReward({ decisionNumber: '', type: '', content: '', date: '', amount: '' })
                                setShowRewardForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowRewardForm(true)}>
                        <i className="fas fa-plus"></i> Thêm khen thưởng
                    </button>
                )}
            </div>

            {/* Kỷ luật */}
            <div className="wizard-subsection">
                <h4><i className="fas fa-gavel"></i> Kỷ luật</h4>
                {formData.disciplines.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Số QĐ</th>
                                <th>Hình thức</th>
                                <th>Thời gian</th>
                                <th>Ghi chú</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.disciplines.map((d, i) => (
                                <tr key={i}>
                                    <td>{d.decisionNumber}</td>
                                    <td>{d.type}</td>
                                    <td>{d.fromDate} - {d.toDate}</td>
                                    <td>{d.note}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('disciplines', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showDisciplineForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Số QĐ</label>
                                <input type="text" value={newDiscipline.decisionNumber}
                                    onChange={e => setNewDiscipline({ ...newDiscipline, decisionNumber: e.target.value })}
                                    placeholder="Số quyết định" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Hình thức <span className="required">*</span></label>
                                <input type="text" value={newDiscipline.type}
                                    onChange={e => setNewDiscipline({ ...newDiscipline, type: e.target.value })}
                                    placeholder="Khiển trách, Cảnh cáo..." />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ngày ban hành</label>
                                <input type="date" value={newDiscipline.signedDate}
                                    onChange={e => setNewDiscipline({ ...newDiscipline, signedDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Từ ngày</label>
                                <input type="date" value={newDiscipline.fromDate}
                                    onChange={e => setNewDiscipline({ ...newDiscipline, fromDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Đến ngày</label>
                                <input type="date" value={newDiscipline.toDate}
                                    onChange={e => setNewDiscipline({ ...newDiscipline, toDate: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Ghi chú</label>
                                <input type="text" value={newDiscipline.note}
                                    onChange={e => setNewDiscipline({ ...newDiscipline, note: e.target.value })}
                                    placeholder="Lý do/Ghi chú" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newDiscipline.type) {
                                    alert('Vui lòng nhập Hình thức kỷ luật!')
                                    return
                                }
                                addListItem('disciplines', { ...newDiscipline })
                                setNewDiscipline({ decisionNumber: '', type: '', signedDate: '', fromDate: '', toDate: '', note: '' })
                                setShowDisciplineForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewDiscipline({ decisionNumber: '', type: '', signedDate: '', fromDate: '', toDate: '', note: '' })
                                setShowDisciplineForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowDisciplineForm(true)}>
                        <i className="fas fa-plus"></i> Thêm kỷ luật
                    </button>
                )}
            </div>
        </>
    )

    const renderSucKhoe = () => (
        <>
            <h3 className="wizard-section-title"><i className="fas fa-heartbeat"></i> Sức khoẻ - Hoạt động</h3>

            {/* Khám sức khỏe */}
            <div className="wizard-subsection">
                <h4><i className="fas fa-notes-medical"></i> Khám sức khỏe</h4>
                {formData.healthChecks.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Ngày khám</th>
                                <th>Nơi khám</th>
                                <th>Kết quả</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.healthChecks.map((h, i) => (
                                <tr key={i}>
                                    <td>{h.date}</td>
                                    <td>{h.location}</td>
                                    <td>{h.result}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('healthChecks', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showHealthForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Ngày khám <span className="required">*</span></label>
                                <input type="date" value={newHealth.date}
                                    onChange={e => setNewHealth({ ...newHealth, date: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Nơi khám</label>
                                <input type="text" value={newHealth.location}
                                    onChange={e => setNewHealth({ ...newHealth, location: e.target.value })}
                                    placeholder="Bệnh viện..." />
                            </div>
                            <div className="wizard-form-group">
                                <label>Kết quả</label>
                                <input type="text" value={newHealth.result}
                                    onChange={e => setNewHealth({ ...newHealth, result: e.target.value })}
                                    placeholder="Kết quả/Xếp loại" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newHealth.date) {
                                    alert('Vui lòng nhập Ngày khám!')
                                    return
                                }
                                addListItem('healthChecks', { ...newHealth })
                                setNewHealth({ date: '', location: '', result: '', note: '' })
                                setShowHealthForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewHealth({ date: '', location: '', result: '', note: '' })
                                setShowHealthForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowHealthForm(true)}>
                        <i className="fas fa-plus"></i> Thêm khám SK
                    </button>
                )}
            </div>

            {/* Tai nạn lao động */}
            <div className="wizard-subsection">
                <h4><i className="fas fa-ambulance"></i> Tai nạn lao động</h4>
                {formData.accidents.length > 0 && (
                    <table className="wizard-mini-table">
                        <thead>
                            <tr>
                                <th>Ngày bị</th>
                                <th>Nơi bị</th>
                                <th>Loại</th>
                                <th>Mô tả</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.accidents.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.date}</td>
                                    <td>{a.location}</td>
                                    <td>{a.type}</td>
                                    <td>{a.description}</td>
                                    <td>
                                        <button className="btn-remove" onClick={() => removeListItem('accidents', i)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {showAccidentForm ? (
                    <div className="wizard-inline-form">
                        <div className="wizard-form-grid">
                            <div className="wizard-form-group">
                                <label>Ngày bị nạn <span className="required">*</span></label>
                                <input type="date" value={newAccident.date}
                                    onChange={e => setNewAccident({ ...newAccident, date: e.target.value })} />
                            </div>
                            <div className="wizard-form-group">
                                <label>Nơi bị</label>
                                <input type="text" value={newAccident.location}
                                    onChange={e => setNewAccident({ ...newAccident, location: e.target.value })}
                                    placeholder="Địa điểm" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Loại tai nạn</label>
                                <input type="text" value={newAccident.type}
                                    onChange={e => setNewAccident({ ...newAccident, type: e.target.value })}
                                    placeholder="Loại tai nạn" />
                            </div>
                            <div className="wizard-form-group">
                                <label>Mô tả/Hậu quả</label>
                                <input type="text" value={newAccident.description}
                                    onChange={e => setNewAccident({ ...newAccident, description: e.target.value })}
                                    placeholder="Mô tả chi tiết" />
                            </div>
                        </div>
                        <div className="wizard-inline-actions">
                            <button className="wizard-btn wizard-btn-success" onClick={() => {
                                if (!newAccident.date) {
                                    alert('Vui lòng nhập Ngày bị nạn!')
                                    return
                                }
                                addListItem('accidents', { ...newAccident })
                                setNewAccident({ date: '', location: '', type: '', description: '', note: '' })
                                setShowAccidentForm(false)
                            }}>
                                <i className="fas fa-check"></i> Thêm
                            </button>
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => {
                                setNewAccident({ date: '', location: '', type: '', description: '', note: '' })
                                setShowAccidentForm(false)
                            }}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="wizard-add-row-btn" onClick={() => setShowAccidentForm(true)}>
                        <i className="fas fa-plus"></i> Thêm tai nạn
                    </button>
                )}
            </div>
        </>
    )

    return (
        <div className="wizard-overlay" onClick={onClose}>
            <div className="wizard-modal" onClick={e => e.stopPropagation()}>
                <div className="wizard-header">
                    <h2><i className="fas fa-user-plus"></i> Thêm nhân viên mới</h2>
                    <button className="wizard-close" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <div className="wizard-body">
                    <div className="wizard-sidebar">
                        {STEPS.map((step, idx) => (
                            <div key={step.id}
                                className={`wizard-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(idx)}>
                                <div className="step-indicator">
                                    {idx < currentStep ? <i className="fas fa-check"></i> : idx + 1}
                                </div>
                                <span className="step-label">{step.title}</span>
                            </div>
                        ))}
                    </div>
                    <div className="wizard-content">{renderStep()}</div>
                </div>
                <div className="wizard-footer">
                    <div className="wizard-footer-left">
                        <button className="wizard-btn wizard-btn-secondary" onClick={onClose}>
                            <i className="fas fa-times"></i> Hủy
                        </button>
                    </div>
                    <div className="wizard-footer-right">
                        {currentStep > 0 && (
                            <button className="wizard-btn wizard-btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                                <i className="fas fa-arrow-left"></i> Quay lại
                            </button>
                        )}
                        {currentStep < STEPS.length - 1 ? (
                            <button className="wizard-btn wizard-btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>
                                Tiếp theo <i className="fas fa-arrow-right"></i>
                            </button>
                        ) : (
                            <button className="wizard-btn wizard-btn-success" onClick={handleSubmit}>
                                <i className="fas fa-save"></i> Hoàn thành
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateEmployeeWizard
