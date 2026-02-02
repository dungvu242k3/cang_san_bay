import { useEffect, useRef, useState } from 'react';
import EmployeeDetail from '../components/EmployeeDetail';
import GradingModal from '../components/GradingModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import './GradingPage.css'; // Dedicated styles

function GradingPage() {
    const { user } = useAuth()
    const [employees, setEmployees] = useState([])
    const [filteredEmployees, setFilteredEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDept, setFilterDept] = useState('')
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [gradingModalEmployee, setGradingModalEmployee] = useState(null)

    // Scroll ref to top on selection
    const detailRef = useRef(null)

    useEffect(() => {
        if (user) loadEmployees()
    }, [user])

    useEffect(() => {
        filterEmployees()
    }, [employees, searchTerm, filterDept])

    useEffect(() => {
        if (selectedEmployee && detailRef.current) {
            detailRef.current.scrollTop = 0
        }
        // Close mobile menu when employee is selected
        if (selectedEmployee && window.innerWidth <= 768) {
            setIsMobileMenuOpen(false)
        }
    }, [selectedEmployee])

    // Handle window resize and mobile detection
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            if (!mobile) {
                setIsMobileMenuOpen(false)
            }
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const loadEmployees = async () => {
        try {
            setLoading(true)
            let query = supabase.from('employee_profiles').select('*');

            // Apply role filter (Secure by Default)
            if (['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(user?.role_level)) {
                // View All - No filter applied
            } else if (user?.role_level === 'DEPT_HEAD' && user.dept_scope) {
                query = query.eq('department', user.dept_scope)
            } else if (user?.role_level === 'TEAM_LEADER' && user.team_scope) {
                query = query.eq('team', user.team_scope)
            } else {
                // Default: STAFF and fallback for any missing scope -> View Self Only
                query = query.eq('employee_code', user?.employee_code)
            }

            const { data, error } = await query.order('created_at', { ascending: true })

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

    const handleOpenEmployeeSelector = () => {
        if (isMobile) {
            setIsMobileMenuOpen(true)
        } else {
            // Trên desktop, focus vào sidebar hoặc scroll đến nó
            const sidebar = document.querySelector('.grading-sidebar')
            if (sidebar) {
                sidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                // Focus vào search input
                const searchInput = sidebar.querySelector('input[type="text"]')
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 300)
                }
            }
        }
    }

    return (
        <div className="grading-page-container">
            {/* MOBILE OVERLAY */}
            {isMobileMenuOpen && (
                <div 
                    className="mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* LEFT SIDEBAR: LIST VIEW */}
            <div className={`grading-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="grading-sidebar-header">
                    <h2><i className="fas fa-list-ul"></i> Danh sách nhân sự</h2>
                    <button 
                        className="mobile-close-btn"
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        <i className="fas fa-times"></i>
                    </button>
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
                            onClick={() => {
                                // Mở popup chấm điểm khi click vào dòng
                                setGradingModalEmployee(emp);
                                if (isMobile) {
                                    setIsMobileMenuOpen(false);
                                }
                            }}
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
                    <div className="grading-content-wrapper">
                        <div className="grading-content-header">
                            <div className="employee-header-info">
                                <h3 className="employee-name">{selectedEmployee.ho_va_ten}</h3>
                                <div className="employee-meta">
                                    <span className="employee-code">{selectedEmployee.employeeId}</span>
                                    <span className="employee-dept">{selectedEmployee.bo_phan}</span>
                                </div>
                            </div>
                        </div>
                        <EmployeeDetail
                            employee={selectedEmployee}
                            activeSection="grading"
                            allowEditProfile={false}
                            onSave={handleSave}
                            onCancel={() => { }}
                            onSectionChange={() => { }}
                            onOpenEmployeeSelector={handleOpenEmployeeSelector}
                        />
                    </div>
                ) : (
                    <div className="grading-empty-state">
                        <div className="empty-state-icon">
                            <i className="fas fa-user-edit"></i>
                        </div>
                        <h3>Chọn nhân viên để chấm điểm</h3>
                        <p>Chọn nhân viên từ danh sách bên trái để bắt đầu chấm điểm</p>
                        {isMobile && (
                            <button 
                                className="btn-select-employee"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <i className="fas fa-list"></i> Xem danh sách
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Grading Modal */}
            <GradingModal
                employee={gradingModalEmployee}
                isOpen={!!gradingModalEmployee}
                onClose={() => setGradingModalEmployee(null)}
                onSave={() => {
                    // Reload employees sau khi lưu
                    if (user) loadEmployees();
                }}
            />
        </div>
    )
}

export default GradingPage
