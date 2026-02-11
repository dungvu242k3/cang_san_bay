import { useEffect, useRef, useState } from 'react';
import EmployeeDetail from '../components/EmployeeDetail';
import GradingModal from '../components/GradingModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { canGrade, inferRoleFromPosition } from '../utils/rbac';
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
            let query = supabase.from('employee_profiles').select('*').neq('status', 'Nghỉ việc');

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

            // Get current month for checking grading status
            const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

            // Load performance reviews for current month to check grading status
            const { data: reviews } = await supabase
                .from('performance_reviews')
                .select('employee_code, self_assessment, supervisor_assessment')
                .eq('month', currentMonth)

            const reviewMap = new Map();
            (reviews || []).forEach(r => {
                reviewMap.set(r.employee_code, {
                    hasSelf: r.self_assessment && Object.keys(r.self_assessment).length > 0,
                    hasSupervisor: r.supervisor_assessment && Object.keys(r.supervisor_assessment).length > 0
                });
            });

            const mappedData = (data || []).map(profile => {
                const review = reviewMap.get(profile.employee_code) || { hasSelf: false, hasSupervisor: false };

                // Determine Status Based on User Perspective
                // 1. Employee View (Viewing themselves)
                //    - Not Started -> NEED_GRADING (High Priority)
                //    - Self Done -> COMPLETED (Low Priority)
                // 2. Supervisor View (Viewing others)
                //    - Not Started -> WAITING_FOR_EMPLOYEE (Low Priority)
                //    - Self Done -> READY_FOR_SUPERVISOR (High Priority)
                //    - Supervisor Done -> COMPLETED (Low Priority)

                let gradingStatus = 'WAITING_FOR_EMPLOYEE';
                const isViewingSelf = user?.employee_code === profile.employee_code;

                if (review.hasSupervisor) {
                    gradingStatus = 'COMPLETED';
                } else if (review.hasSelf) {
                    // Self is done
                    if (isViewingSelf) {
                        gradingStatus = 'COMPLETED'; // For employee, they are done
                    } else {
                        gradingStatus = 'READY_FOR_SUPERVISOR'; // For supervisor, they need to grade
                    }
                } else {
                    // Not started
                    if (isViewingSelf) {
                        gradingStatus = 'READY_FOR_SELF'; // New status for clarity, maps to "Cần chấm"
                    } else {
                        gradingStatus = 'WAITING_FOR_EMPLOYEE';
                    }
                }

                return {
                    id: profile.id,
                    employeeId: profile.employee_code || '',
                    ho_va_ten: (profile.last_name || '') + ' ' + (profile.first_name || ''),
                    email: profile.email_acv || '',
                    sđt: profile.phone || '',
                    bo_phan: profile.department || '',
                    vi_tri: profile.job_position || profile.current_position || '',
                    trang_thai: profile.status || 'Đang làm việc',
                    ngay_vao_lam: profile.join_date || '',
                    ngay_sinh: profile.date_of_birth || '',
                    gioi_tinh: profile.gender || '',
                    score_template_code: profile.score_template_code,
                    team: profile.team || profile.to_doi || profile.group_name || '', // Map team for RBAC
                    department: profile.department || profile.bo_phan || '', // Map dept for RBAC

                    // Logic from UserManagement.jsx and user request: prefer inference if role is STAFF
                    role_level: (profile.role_level && profile.role_level !== 'STAFF')
                        ? profile.role_level
                        : inferRoleFromPosition(profile.current_position || profile.job_position || profile.vi_tri),

                    // Add current_position mapping explicitly
                    current_position: profile.current_position || profile.job_position || profile.vi_tri || '',

                    gradingStatus, // Add for debugging/UI if needed
                    ...profile
                }
            })
                // Filter: Only show employees that the current user CAN grade
                // 1. User can always see themselves (isViewingSelf)
                // 2. OR User must have higher rank than the employee AND be in same scope (canGrade)
                .filter(emp => {
                    const isViewingSelf = user?.employee_code === emp.employee_code

                    // Ensure roles are strings to avoid undefined errors
                    const safeUser = { ...user, role_level: user?.role_level || '' }
                    const safeEmp = { ...emp, role_level: emp.role_level || '' }

                    const canGradeHim = canGrade(safeUser, safeEmp)

                    if (user?.role_level === 'TEAM_LEADER' && emp.role_level === 'TEAM_LEADER' && !isViewingSelf) {
                        console.log(`[DEBUG] TL viewing TL: ${emp.employee_code}`)
                        console.log(`[DEBUG] CanGrade: ${canGradeHim}`)
                        console.log(`[DEBUG] User Role: ${user.role_level} (${user.team_scope})`)
                        console.log(`[DEBUG] Target Role: ${emp.role_level} (${emp.team})`)
                    }

                    if (user?.role_level === 'TEAM_LEADER') {
                        if (!isViewingSelf && !canGradeHim) {
                            // Log failed candidates to see WHY they failed
                            // Only log a few to avoid spamming
                            if (Math.random() < 0.1) {
                                console.log(`[DEBUG-FILTER] TL ${user.employee_code} (${user.team_scope}) CANNOT grade ${emp.employee_code} (${emp.team})`)
                                console.log(`Target Role: ${safeEmp.role_level}, Expected: STAFF`)
                                console.log('User:', user)
                                console.log('Emp:', emp)
                            }
                        }
                    }

                    return isViewingSelf || canGradeHim
                })

            // Sort Priority: READY_FOR_SUPERVISOR/READY_FOR_SELF -> WAITING_FOR_EMPLOYEE -> COMPLETED
            const statusPriority = {
                'READY_FOR_SELF': 1,
                'READY_FOR_SUPERVISOR': 1,
                'WAITING_FOR_EMPLOYEE': 2,
                'COMPLETED': 3
            };

            mappedData.sort((a, b) => {
                const priorityA = statusPriority[a.gradingStatus];
                const priorityB = statusPriority[b.gradingStatus];

                if (priorityA !== priorityB) {
                    return priorityA - priorityB;
                }
                return (a.ho_va_ten || '').localeCompare(b.ho_va_ten || '')
            })

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

    const handleSelectEmployee = (emp) => {
        setSelectedEmployee(emp);
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

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

                {user?.role_level !== 'STAFF' && (
                    <>
                        <div className="sidebar-toolbar">
                            <div className="sidebar-search">
                                <input
                                    type="text"
                                    placeholder="Tìm tên hoặc mã nhân viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(user?.role_level) && (
                                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                                        <option value="">Tất cả phòng ban</option>
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="sidebar-stats">
                            Hiển thị {filteredEmployees.length} nhân viên
                        </div>
                    </>
                )}

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
                                {emp.gradingStatus === 'READY_FOR_SUPERVISOR' && <span className="status-badge status-ready" title="Nhân viên đã tự chấm xong">Cần chấm</span>}
                                {emp.gradingStatus === 'READY_FOR_SELF' && <span className="status-badge status-ready" title="Bạn cần tự chấm điểm">Cần chấm</span>}
                                {emp.gradingStatus === 'WAITING_FOR_EMPLOYEE' && <span className="status-badge status-waiting" title="Chờ nhân viên tự chấm">Chờ NV</span>}
                                {emp.gradingStatus === 'COMPLETED' && <span className="status-badge status-completed" title="Đã hoàn thành đánh giá">Đã xong</span>}
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
                            onSelectEmployee={setSelectedEmployee}
                            employees={filteredEmployees}
                            currentMonth={new Date().toISOString().slice(0, 7)}
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
