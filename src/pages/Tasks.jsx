import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import './Tasks.css';

function Tasks() {
    const { user } = useAuth()
    const [myProfile, setMyProfile] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)

    // Dictionary Data
    const [employees, setEmployees] = useState([])
    const [departments, setDepartments] = useState([])

    // UI States
    const [activeTab, setActiveTab] = useState('common') // 'common' | 'mine'
    const [subTab, setSubTab] = useState('received') // 'received' | 'sent' | 'unassigned'

    // Filters
    const [filterStatus, setFilterStatus] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [filterEmployee, setFilterEmployee] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [modalTab, setModalTab] = useState('detail')
    const [editingTask, setEditingTask] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Trung bình',
        due_date: '',
        status: 'Mới giao',
        progress: 0,
        primary_assignee_type: 'PERSON',
        primary_assignee_code: '',
        collab_assignees: [],
        rejection_reason: ''
    })

    const [rejectionModal, setRejectionModal] = useState({ show: false, task: null, reason: '' })

    // Load Initial Data
    useEffect(() => {
        loadMyProfile()
        loadDictionaries()
        loadTasks()
    }, [user])

    const loadMyProfile = async () => {
        let profile = null
        const selectStr = '*, user_roles(role_level, dept_scope, team_scope)'

        if (user?.email) {
            const { data } = await supabase.from('employee_profiles')
                .select(selectStr)
                .or(`email_acv.eq.${user.email},email_personal.eq.${user.email}`)
                .maybeSingle()
            profile = data
        } else {
            const { data } = await supabase.from('employee_profiles')
                .select(selectStr)
                .limit(1)
                .maybeSingle()
            profile = data
        }

        if (profile) {
            const roleInfo = Array.isArray(profile.user_roles) ? profile.user_roles[0] : (profile.user_roles || {})
            setMyProfile({
                ...profile,
                role: roleInfo.role_level || 'STAFF',
                dept_scope: roleInfo.dept_scope,
                team_scope: roleInfo.team_scope
            })
        }
    }

    const loadDictionaries = async () => {
        const { data } = await supabase.from('employee_profiles').select('employee_code, first_name, last_name, department, team')
        if (data) {
            const emps = data.map(e => ({
                code: e.employee_code,
                name: `${e.last_name} ${e.first_name}`.trim(),
                dept: e.department,
                team: e.team
            }))
            setEmployees(emps)
            const depts = [...new Set(data.map(e => e.department).filter(Boolean))].sort()
            setDepartments(depts)
        }
    }

    const getVisibleEmployees = () => {
        if (!myProfile) return []
        if (['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(myProfile.role)) return employees
        if (myProfile.role === 'DEPT_HEAD') return employees.filter(e => e.dept === myProfile.dept_scope)
        if (myProfile.role === 'TEAM_LEADER') return employees.filter(e => e.team === myProfile.team_scope)
        return employees.filter(e => e.code === myProfile.employee_code)
    }

    const getVisibleDepartments = () => {
        if (!myProfile) return []
        if (['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(myProfile.role)) return departments
        return departments.filter(d => d === (myProfile.dept_scope || myProfile.department))
    }

    const loadTasks = async () => {
        try {
            setLoading(true)
            const { data: tasksData, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
            if (error) {
                console.error("Error loading tasks:", error)
                throw error
            }

            const { data: assignmentsData, error: assignError } = await supabase.from('task_assignments').select('*')
            if (assignError) console.warn("Error loading assignments:", assignError)

            const safeAssignments = assignmentsData || []

            const fullTasks = tasksData.map(t => {
                const taskAssignments = safeAssignments.filter(a => a.task_id === t.id)
                return {
                    ...t,
                    assignments: taskAssignments,
                    primary: taskAssignments.find(a => a.role === 'PRIMARY'),
                    collabs: taskAssignments.filter(a => a.role === 'COLLAB')
                }
            })
            setTasks(fullTasks)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    // Filter Logic
    const getFilteredTasks = () => {
        if (!myProfile) return []

        let filtered = tasks
        const myCode = myProfile.employee_code
        const myDept = myProfile.department
        const myRole = myProfile.role

        // Base Permission Filter: Only show tasks where user is involved (unless Admin)
        if (!['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(myRole)) {
            filtered = filtered.filter(t => {
                const isCreator = t.created_by === myCode
                const isAssignedToMe = t.assignments.some(a =>
                    (a.assignee_type === 'PERSON' && a.assignee_code === myCode) ||
                    (a.assignee_type === 'DEPARTMENT' && a.assignee_code === myDept)
                )

                if (isCreator || isAssignedToMe) return true

                // Dept Head can see tasks of their department
                if (myRole === 'DEPT_HEAD' && myProfile.dept_scope) {
                    const isDeptRelated = t.assignments.some(a => {
                        if (a.assignee_type === 'DEPARTMENT') return a.assignee_code === myProfile.dept_scope
                        if (a.assignee_type === 'PERSON') {
                            const emp = employees.find(e => e.code === a.assignee_code)
                            return emp && emp.dept === myProfile.dept_scope
                        }
                        return false
                    })
                    if (isDeptRelated) return true
                }

                return false
            })
        }

        // Apply Tab/Sub-tab/Search/Date filters on top of the permission-filtered list
        let subjectCode = null
        let subjectDept = null

        if (filterEmployee) {
            subjectCode = filterEmployee
            const emp = employees.find(e => e.code === filterEmployee)
            if (emp) subjectDept = emp.dept
        } else if (activeTab === 'mine') {
            subjectCode = myCode
            subjectDept = myDept
        }

        // Sub-tab Logic
        if (subjectCode) {
            if (subTab === 'received') {
                filtered = filtered.filter(t => {
                    return t.assignments.some(a =>
                        (a.assignee_type === 'PERSON' && a.assignee_code === subjectCode) ||
                        (a.assignee_type === 'DEPARTMENT' && a.assignee_code === subjectDept)
                    )
                })
            } else if (subTab === 'actions') {
                filtered = filtered.filter(t => {
                    const isAssignee = t.assignments.some(a =>
                        (a.assignee_type === 'PERSON' && a.assignee_code === subjectCode) ||
                        (a.assignee_type === 'DEPARTMENT' && a.assignee_code === subjectDept)
                    )
                    const needsAction = ['Mới giao', 'Mới', 'Đang làm', 'Đang thực hiện'].includes(t.status)
                    return isAssignee && needsAction
                })
            } else if (subTab === 'sent') {
                filtered = filtered.filter(t => t.created_by === subjectCode && t.assignments.length > 0)
            } else if (subTab === 'unassigned') {
                filtered = filtered.filter(t => t.created_by === subjectCode && t.assignments.length === 0)
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
        }
        if (filterStatus) {
            filtered = filtered.filter(t => t.status === filterStatus)
        }
        if (fromDate) {
            filtered = filtered.filter(t => t.due_date && t.due_date >= fromDate)
        }
        if (toDate) {
            filtered = filtered.filter(t => t.due_date && t.due_date <= toDate)
        }

        return filtered
    }

    // Modal Handlers
    const handleOpenCreate = () => {
        setModalTab('detail')
        setEditingTask(null)
        setFormData({
            title: '', description: '', priority: 'Trung bình', due_date: '',
            status: 'Mới giao', progress: 0,
            primary_assignee_type: 'PERSON', primary_assignee_code: '',
            collab_assignees: [],
            rejection_reason: ''
        })
        setShowModal(true)
    }

    const handleOpenEdit = (task) => {
        setModalTab('detail')
        setEditingTask(task)
        const primary = task.primary || {}
        const collabs = task.collabs || []
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            due_date: task.due_date ? task.due_date.slice(0, 10) : '',
            status: task.status,
            progress: task.progress,
            primary_assignee_type: primary.assignee_type || 'PERSON',
            primary_assignee_code: primary.assignee_code || '',
            collab_assignees: collabs.map(c => ({ code: c.assignee_code, type: c.assignee_type })),
            rejection_reason: task.rejection_reason || ''
        })
        setShowModal(true)
    }

    const handleSave = async () => {
        try {
            if (!myProfile) return alert('Không xác định được người dùng hiện tại')
            const taskPayload = {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                due_date: formData.due_date || null,
                status: formData.status,
                progress: formData.progress,
                rejection_reason: formData.rejection_reason || null,
                created_by: editingTask ? editingTask.created_by : myProfile.employee_code
            }

            let taskId
            if (editingTask) {
                await supabase.from('tasks').update(taskPayload).eq('id', editingTask.id)
                taskId = editingTask.id
                await supabase.from('task_assignments').delete().eq('task_id', taskId)
            } else {
                const { data, error } = await supabase.from('tasks').insert([taskPayload]).select().single()
                if (error) throw error
                taskId = data.id
            }

            const assignments = []
            if (formData.primary_assignee_code) {
                assignments.push({
                    task_id: taskId,
                    assignee_code: formData.primary_assignee_code,
                    assignee_type: formData.primary_assignee_type,
                    role: 'PRIMARY'
                })
            }
            formData.collab_assignees.forEach(c => {
                if (c.code) {
                    assignments.push({
                        task_id: taskId,
                        assignee_code: c.code,
                        assignee_type: c.type,
                        role: 'COLLAB'
                    })
                }
            })
            if (assignments.length > 0) {
                await supabase.from('task_assignments').insert(assignments)
            }

            setShowModal(false)
            loadTasks()
        } catch (err) {
            alert('Lỗi lưu công việc: ' + err.message)
        }
    }

    const handleQuickAction = async (task, action) => {
        try {
            let updates = {}
            if (action === 'start') {
                updates = { status: 'Đang làm' }
            } else if (action === 'complete') {
                updates = { status: 'Hoàn thành', progress: 100 }
            } else if (action === 'reject') {
                setRejectionModal({ show: true, task: task, reason: '' })
                return
            }

            const { error } = await supabase.from('tasks').update(updates).eq('id', task.id)
            if (error) throw error
            loadTasks()
            if (showModal) setShowModal(false)
        } catch (err) { alert('Lỗi: ' + err.message) }
    }

    const confirmReject = async () => {
        try {
            if (!rejectionModal.reason.trim()) return alert('Vui lòng nhập lý do từ chối')
            const { error } = await supabase.from('tasks').update({
                status: 'Từ chối',
                rejection_reason: rejectionModal.reason
            }).eq('id', rejectionModal.task.id)

            if (error) throw error
            setRejectionModal({ show: false, task: null, reason: '' })
            loadTasks()
        } catch (err) { alert('Lỗi: ' + err.message) }
    }

    const handleDeleteTask = async (task) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa công việc: "${task.title}"?`)) return
        try {
            // Delete assignments first (if not cascaded in DB)
            await supabase.from('task_assignments').delete().eq('task_id', task.id)
            const { error } = await supabase.from('tasks').delete().eq('id', task.id)
            if (error) throw error

            if (showModal) setShowModal(false)
            loadTasks()
        } catch (err) {
            alert('Lỗi khi xóa công việc: ' + err.message)
        }
    }

    // Styles Helpers
    const getStatusClass = (status) => {
        switch (status) {
            case 'Mới giao':
            case 'Mới': return 'status-new'
            case 'Đang làm':
            case 'Đang thực hiện': return 'status-progress'
            case 'Hoàn thành': return 'status-done'
            case 'Từ chối': return 'status-cancel'
            case 'Tạm dừng': return 'status-hold'
            case 'Hủy': return 'status-cancel'
            default: return ''
        }
    }

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'Khẩn cấp': return 'priority-high'
            case 'Cao': return 'priority-medium' // Design tweak
            case 'Trung bình': return 'text-primary'
            case 'Thấp': return 'priority-low'
            default: return ''
        }
    }

    const renderAssignee = (code, type) => {
        if (type === 'DEPARTMENT') return <span className="badge badge-info">{code}</span>
        const emp = employees.find(e => e.code === code)
        return emp ? emp.name : code
    }

    return (
        <div className="task-page-container fade-in">
            {/* Toolbar */}
            <div className="task-toolbar">
                <div className="custom-tabs">
                    <button className={`btn ${activeTab === 'common' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('common')}>
                        <i className="fas fa-globe mr-2"></i> Công việc chung
                    </button>
                    <button className={`btn ${activeTab === 'mine' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('mine')}>
                        <i className="fas fa-user-circle mr-2"></i> Của tôi
                    </button>
                </div>
                <div>
                    <button className="btn btn-create-task" onClick={handleOpenCreate}>
                        <i className="fas fa-plus"></i> Tạo việc mới
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="task-filters mb-4">
                {(activeTab === 'mine' || filterEmployee) && (
                    <div className="custom-tabs mr-4">
                        <button className={`btn ${subTab === 'received' ? 'btn-info' : ''}`} onClick={() => setSubTab('received')}>Đã nhận</button>
                        <button className={`btn ${subTab === 'actions' ? 'btn-info' : ''}`} onClick={() => setSubTab('actions')}>Cần xử lý</button>
                        <button className={`btn ${subTab === 'sent' ? 'btn-info' : ''}`} onClick={() => setSubTab('sent')}>Đã giao</button>
                        <button className={`btn ${subTab === 'unassigned' ? 'btn-info' : ''}`} onClick={() => setSubTab('unassigned')}>Chưa giao</button>
                    </div>
                )}

                <div className="task-filter-group">
                    {['SUPER_ADMIN', 'BOARD_DIRECTOR', 'DEPT_HEAD', 'TEAM_LEADER'].includes(myProfile?.role) && (
                        <div className="search-input-wrapper" style={{ maxWidth: '220px' }}>
                            <i className="fas fa-user-tag"></i>
                            <select
                                className="input-styled"
                                style={{ paddingLeft: '36px' }}
                                value={filterEmployee}
                                onChange={e => setFilterEmployee(e.target.value)}
                            >
                                <option value="">-- Tất cả nhân viên --</option>
                                {getVisibleEmployees()
                                    .map(e => (
                                        <option key={e.code} value={e.code}>{e.name}</option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <div className="search-input-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            className="input-styled"
                            placeholder="Tìm kiếm công việc..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="date-filter-container" title="Lọc theo ngày hết hạn">
                        <i className="far fa-calendar-alt text-muted"></i>
                        <input type="date" className="date-filter-input" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                        <span className="text-muted">-</span>
                        <input type="date" className="date-filter-input" value={toDate} onChange={e => setToDate(e.target.value)} />
                    </div>

                    <select
                        className="select-styled"
                        style={{ width: '150px' }}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="">-- Trạng thái --</option>
                        <option value="Mới giao">Mới giao</option>
                        <option value="Đang làm">Đang làm</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Từ chối">Từ chối</option>
                        <option value="Tạm dừng">Tạm dừng</option>
                        <option value="Hủy">Hủy</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="task-table-container">
                <table className="table task-table mb-0">
                    <thead>
                        <tr>
                            <th width="30%">Tiêu đề</th>
                            <th width="10%">Mức độ</th>
                            <th width="12%">Trạng thái</th>
                            <th width="10%">Tiến độ</th>
                            <th width="14%">Xử lý chính</th>
                            <th width="10%">Hạn xử lý</th>
                            <th width="14%" className="text-center" style={{ color: 'var(--primary)', fontWeight: '700' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center p-4">Đang tải dữ liệu...</td></tr>
                        ) : getFilteredTasks().length === 0 ? (
                            <tr><td colSpan="7" className="text-center p-4 text-muted">Không tìm thấy công việc nào.</td></tr>
                        ) : (
                            getFilteredTasks().map(task => (
                                <tr key={task.id}>
                                    <td>
                                        <div className="task-title">{task.title}</div>
                                        {task.collabs && task.collabs.length > 0 && (
                                            <small className="text-muted"><i className="fas fa-users mr-1"></i> {task.collabs.length} phối hợp</small>
                                        )}
                                    </td>
                                    <td>
                                        <span className={getPriorityClass(task.priority)}>
                                            {task.priority === 'Khẩn cấp' && <i className="fas fa-fire mr-1"></i>}
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td><span className={`status-badge ${getStatusClass(task.status)}`}>{task.status}</span></td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="progress flex-grow-1 mr-2" style={{ height: '6px', borderRadius: '3px', background: '#e9ecef' }}>
                                                <div className={`progress-bar ${task.progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${task.progress}%` }}></div>
                                            </div>
                                            <small className="text-muted font-weight-bold" style={{ minWidth: '35px' }}>{task.progress}%</small>
                                        </div>
                                    </td>
                                    <td>
                                        {task.primary ? renderAssignee(task.primary.assignee_code, task.primary.assignee_type) : '-'}
                                    </td>
                                    <td className={task.due_date && new Date(task.due_date) < new Date() ? 'text-danger font-weight-bold' : ''}>
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : '-'}
                                    </td>
                                    <td className="text-center action-column-premium">
                                        <div className="action-uniform-container">
                                            {['Mới giao', 'Mới'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-primary" title="Nhận việc" onClick={() => handleQuickAction(task, 'start')}>
                                                    <i className="fas fa-play"></i>
                                                </button>
                                            )}
                                            {['Đang làm', 'Đang thực hiện'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-success" title="Xác nhận xong" onClick={() => handleQuickAction(task, 'complete')}>
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            )}
                                            {['Mới giao', 'Mới', 'Đang làm', 'Đang thực hiện'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-danger" title="Từ chối" onClick={() => handleQuickAction(task, 'reject')}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                            {['Hoàn thành', 'Từ chối', 'Hủy'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-danger" title="Xóa vĩnh viễn" onClick={() => handleDeleteTask(task)}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                            <button className="btn-task-action btn-task-action-light" title="Sửa chi tiết" onClick={() => handleOpenEdit(task)}>
                                                <i className="fas fa-pen"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="modal-content-premium fade-in" style={{ width: '900px', height: 'auto', maxHeight: '90vh' }}>

                        {/* Header */}
                        <div className="modal-header-premium">
                            <div className="modal-title">
                                <i className={`fas ${editingTask ? 'fa-edit' : 'fa-magic'}`}></i>
                                {editingTask ? 'Cập nhật công việc' : 'Tạo công việc mới'}
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Navigation */}
                        <div className="modal-nav">
                            <div className={`modal-nav-item ${modalTab === 'detail' ? 'active' : ''}`} onClick={() => setModalTab('detail')}>
                                <i className="far fa-file-alt mr-2"></i> Thông tin chung
                            </div>
                            {editingTask && (
                                <>
                                    <div className={`modal-nav-item ${modalTab === 'discussion' ? 'active' : ''}`} onClick={() => setModalTab('discussion')}>
                                        <i className="far fa-comments mr-2"></i> Thảo luận
                                    </div>
                                    <div className={`modal-nav-item ${modalTab === 'attachments' ? 'active' : ''}`} onClick={() => setModalTab('attachments')}>
                                        <i className="fas fa-paperclip mr-2"></i> Đính kèm
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Body */}
                        <div className="modal-body-premium">
                            {modalTab === 'detail' && (
                                <div className="fade-in">
                                    <div className="row">
                                        {/* Main Column */}
                                        <div className="col-md-8">
                                            <div className="form-group mb-4">
                                                <label className="form-label-premium">Tiêu đề công việc <span className="text-danger">*</span></label>
                                                <input className="form-control-premium" style={{ fontWeight: 600, fontSize: '1.05rem' }} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Nhập tên công việc..." autoFocus />
                                            </div>

                                            <div className="form-group mb-4">
                                                <label className="form-label-premium">Mô tả chi tiết</label>
                                                <textarea className="form-control-premium" rows="5" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả nội dung, yêu cầu, mục tiêu..." />
                                            </div>

                                            {/* Assignment Section - Styled as a card */}
                                            <div className="assignment-box">
                                                <h6 className="form-section-title"><i className="fas fa-users-cog mr-2"></i> Phân công thực hiện</h6>

                                                <div className="row mb-3">
                                                    <div className="col-md-5">
                                                        <label className="form-label-premium text-primary">Người xử lý chính</label>
                                                        <div className="d-flex gap-3 mb-2">
                                                            <div className="custom-control custom-radio">
                                                                <input type="radio" id="assignPerson" name="assignType" className="custom-control-input"
                                                                    checked={formData.primary_assignee_type === 'PERSON'}
                                                                    onChange={() => setFormData({ ...formData, primary_assignee_type: 'PERSON', primary_assignee_code: '' })}
                                                                />
                                                                <label className="custom-control-label" htmlFor="assignPerson">Cá nhân</label>
                                                            </div>
                                                            <div className="custom-control custom-radio">
                                                                <input type="radio" id="assignDept" name="assignType" className="custom-control-input"
                                                                    checked={formData.primary_assignee_type === 'DEPARTMENT'}
                                                                    onChange={() => setFormData({ ...formData, primary_assignee_type: 'DEPARTMENT', primary_assignee_code: '' })}
                                                                />
                                                                <label className="custom-control-label" htmlFor="assignDept">Đơn vị</label>
                                                            </div>
                                                        </div>
                                                        <select className="form-control-premium" value={formData.primary_assignee_code} onChange={e => setFormData({ ...formData, primary_assignee_code: e.target.value })}>
                                                            <option value="">-- Chọn người/đơn vị --</option>
                                                            {formData.primary_assignee_type === 'PERSON'
                                                                ? getVisibleEmployees().map(e => <option key={e.code} value={e.code}>{e.name} ({e.dept})</option>)
                                                                : getVisibleDepartments().map(d => <option key={d} value={d}>{d}</option>)
                                                            }
                                                        </select>
                                                    </div>
                                                    <div className="col-md-7 border-left pl-4">
                                                        <label className="form-label-premium text-secondary">Phối hợp thực hiện</label>
                                                        <div style={{ maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                                                            {getVisibleDepartments().map(d => (
                                                                <div key={'dept-' + d} className="assignment-option">
                                                                    <input type="checkbox" className="checkbox-premium" id={'chk-dept-' + d}
                                                                        checked={formData.collab_assignees.some(c => c.type === 'DEPARTMENT' && c.code === d)}
                                                                        onChange={e => {
                                                                            const checked = e.target.checked
                                                                            let newCollabs = [...formData.collab_assignees]
                                                                            if (checked) newCollabs.push({ type: 'DEPARTMENT', code: d })
                                                                            else newCollabs = newCollabs.filter(c => !(c.type === 'DEPARTMENT' && c.code === d))
                                                                            setFormData({ ...formData, collab_assignees: newCollabs })
                                                                        }}
                                                                    />
                                                                    <label htmlFor={'chk-dept-' + d} style={{ marginBottom: 0, cursor: 'pointer' }}>[Đơn vị] {d}</label>
                                                                </div>
                                                            ))}
                                                            {getVisibleEmployees().map(e => (
                                                                <div key={'emp-' + e.code} className="assignment-option">
                                                                    <input type="checkbox" className="checkbox-premium" id={'chk-emp-' + e.code}
                                                                        checked={formData.collab_assignees.some(c => c.type === 'PERSON' && c.code === e.code)}
                                                                        onChange={e_evt => {
                                                                            const checked = e_evt.target.checked
                                                                            let newCollabs = [...formData.collab_assignees]
                                                                            if (checked) newCollabs.push({ type: 'PERSON', code: e.code })
                                                                            else newCollabs = newCollabs.filter(c => !(c.type === 'PERSON' && c.code === e.code))
                                                                            setFormData({ ...formData, collab_assignees: newCollabs })
                                                                        }}
                                                                    />
                                                                    <label htmlFor={'chk-emp-' + e.code} style={{ marginBottom: 0, cursor: 'pointer' }}>{e.name}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meta Column */}
                                        <div className="col-md-4">
                                            <div className="bg-light p-4 rounded-xl h-100" style={{ borderRadius: '16px', background: '#f8f9fa' }}>
                                                <h6 className="form-section-title"><i className="fas fa-sliders-h mr-2"></i> Thiết lập</h6>

                                                <div className="form-group mb-3">
                                                    <label className="form-label-premium">Độ ưu tiên</label>
                                                    <select className="form-control-premium" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                                        <option>Thấp</option>
                                                        <option>Trung bình</option>
                                                        <option>Cao</option>
                                                        <option>Khẩn cấp</option>
                                                    </select>
                                                </div>

                                                <div className="form-group mb-3">
                                                    <label className="form-label-premium">Hạn xử lý</label>
                                                    <input type="date" className="form-control-premium" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                                                </div>

                                                <div className="form-group mb-3">
                                                    <label className="form-label-premium">Trạng thái</label>
                                                    <select className="form-control-premium" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                        <option>Mới giao</option>
                                                        <option>Đang làm</option>
                                                        <option>Hoàn thành</option>
                                                        <option>Từ chối</option>
                                                        <option>Tạm dừng</option>
                                                        <option>Hủy</option>
                                                    </select>
                                                </div>

                                                {formData.status === 'Từ chối' && (
                                                    <div className="form-group mb-3 fadeIn">
                                                        <label className="form-label-premium text-danger font-weight-bold">Lý do từ chối</label>
                                                        <textarea
                                                            className="form-control-premium border-danger"
                                                            rows="3"
                                                            value={formData.rejection_reason}
                                                            onChange={e => setFormData({ ...formData, rejection_reason: e.target.value })}
                                                            placeholder="Nhập lý do chi tiết để người giao biết..."
                                                        />
                                                    </div>
                                                )}

                                                <div className="form-group mb-3">
                                                    <label className="form-label-premium d-flex justify-content-between">
                                                        <span>Tiến độ</span>
                                                        <span className="text-primary">{formData.progress}%</span>
                                                    </label>
                                                    <input type="range" className="custom-range" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'discussion' && (
                                <div className="discussion-panel">
                                    <div className="text-center text-muted mt-5">
                                        <div className="mb-3"><i className="far fa-comments fa-3x text-light"></i></div>
                                        <p>Tính năng thảo luận đang được phát triển.</p>
                                    </div>
                                </div>
                            )}

                            {modalTab === 'attachments' && (
                                <div className="attachments-panel">
                                    <div className="d-flex justify-content-between align-items-center mb-4 p-4 rounded border border-dashed" style={{ background: '#f8f9fa', borderStyle: 'dashed', borderWidth: '2px' }}>
                                        <div>
                                            <strong><i className="fas fa-cloud-upload-alt mr-2"></i> Tải lên tài liệu</strong>
                                            <p className="text-muted small mb-0 mt-1">Kéo thả hoặc chọn tệp từ máy tính (Max 10MB)</p>
                                        </div>
                                        <button className="btn btn-primary-premium btn-sm"><i className="fas fa-plus"></i> Chọn tệp</button>
                                    </div>
                                    <div className="text-center text-muted mt-5">
                                        <i className="far fa-folder-open fa-3x mb-3 text-light"></i>
                                        <p>Chưa có tệp đính kèm.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer-premium">
                            <div className="mr-auto d-flex gap-3">
                                {editingTask && ['Mới giao', 'Mới'].includes(formData.status) && (
                                    <button className="btn-primary-premium" style={{ background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)' }} onClick={() => handleQuickAction(editingTask, 'start')}>
                                        <i className="fas fa-play mr-2"></i> Nhận việc ngay
                                    </button>
                                )}
                                {editingTask && ['Đang làm', 'Đang thực hiện'].includes(formData.status) && (
                                    <button className="btn-primary-premium" style={{ background: 'linear-gradient(135deg, #198754, #157347)' }} onClick={() => handleQuickAction(editingTask, 'complete')}>
                                        <i className="fas fa-check mr-2"></i> Đã hoàn thành
                                    </button>
                                )}
                                {editingTask && (
                                    <button className="btn btn-outline-danger btn-sm ml-2" style={{ borderRadius: '10px' }} onClick={() => handleDeleteTask(editingTask)}>
                                        <i className="fas fa-trash-alt mr-2"></i> Xóa công việc
                                    </button>
                                )}
                            </div>
                            <button className="btn-secondary-premium" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                            {modalTab === 'detail' && (
                                <button className="btn-primary-premium" onClick={handleSave}>
                                    <i className="fas fa-save mr-2"></i> Lưu dữ liệu
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {rejectionModal.show && (
                <div className="modal-overlay" style={{ zIndex: 2000 }}>
                    <div className="modal-content-premium fade-in" style={{ width: '450px' }}>
                        <div className="modal-header-premium border-bottom-0">
                            <div className="modal-title font-weight-bold text-danger">Báo cáo Từ chối công việc</div>
                            <button className="btn-close-modal" onClick={() => setRejectionModal({ show: false, task: null, reason: '' })}><i className="fas fa-times"></i></button>
                        </div>
                        <div className="modal-body-premium pt-0">
                            <p className="mb-3 text-muted">Bạn đang từ chối việc: <strong>{rejectionModal.task?.title}</strong>. Vui lòng ghi rõ lý do chi tiết:</p>
                            <textarea
                                className="form-control-premium border-danger"
                                rows="4"
                                value={rejectionModal.reason}
                                onChange={e => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                placeholder="Ghi chú lý do..."
                                autoFocus
                            />
                        </div>
                        <div className="modal-footer-premium border-top-0">
                            <button className="btn btn-secondary-premium btn-sm" onClick={() => setRejectionModal({ show: false, task: null, reason: '' })}>Quay lại</button>
                            <button className="btn btn-primary-premium bg-danger border-0" style={{ background: '#dc3545', color: 'white' }} onClick={confirmReject}>Xác nhận Từ chối</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tasks
