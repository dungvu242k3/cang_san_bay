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
        status: 'Mới',
        progress: 0,
        primary_assignee_type: 'PERSON',
        primary_assignee_code: '',
        collab_assignees: []
    })

    // Load Initial Data
    useEffect(() => {
        loadMyProfile()
        loadDictionaries()
        loadTasks()
    }, [user])

    const loadMyProfile = async () => {
        if (user?.email) {
            const { data } = await supabase.from('employee_profiles').select('*').or(`email_acv.eq.${user.email},email_personal.eq.${user.email}`).maybeSingle()
            if (data) setMyProfile(data)
        } else {
            const { data } = await supabase.from('employee_profiles').select('*').limit(1).maybeSingle()
            if (data) setMyProfile(data)
        }
    }

    const loadDictionaries = async () => {
        const { data } = await supabase.from('employee_profiles').select('id, employee_code, first_name, last_name, department')
        if (data) {
            const emps = data.map(e => ({
                code: e.employee_code,
                name: `${e.last_name} ${e.first_name}`,
                dept: e.department
            }))
            setEmployees(emps)
            const depts = [...new Set(data.map(e => e.department).filter(Boolean))].sort()
            setDepartments(depts)
        }
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
        let filtered = tasks

        let subjectCode = null
        let subjectDept = null

        if (filterEmployee) {
            subjectCode = filterEmployee
            const emp = employees.find(e => e.code === filterEmployee)
            if (emp) subjectDept = emp.dept
        } else if (activeTab === 'mine' && myProfile) {
            subjectCode = myProfile.employee_code
            subjectDept = myProfile.department
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
            } else if (subTab === 'sent') {
                filtered = filtered.filter(t => t.created_by === subjectCode && t.assignments.length > 0)
            } else if (subTab === 'unassigned') {
                filtered = filtered.filter(t => t.created_by === subjectCode && t.assignments.length === 0)
            }
        }

        // Common Filters
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
            status: 'Mới', progress: 0,
            primary_assignee_type: 'PERSON', primary_assignee_code: '',
            collab_assignees: []
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
            collab_assignees: collabs.map(c => ({ code: c.assignee_code, type: c.assignee_type }))
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

    // Styles Helpers
    const getStatusClass = (status) => {
        switch (status) {
            case 'Mới': return 'status-new'
            case 'Đang thực hiện': return 'status-progress'
            case 'Hoàn thành': return 'status-done'
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
                        <button className={`btn ${subTab === 'sent' ? 'btn-info' : ''}`} onClick={() => setSubTab('sent')}>Đã giao</button>
                        <button className={`btn ${subTab === 'unassigned' ? 'btn-info' : ''}`} onClick={() => setSubTab('unassigned')}>Chưa giao</button>
                    </div>
                )}

                <div className="task-filter-group">
                    <div className="search-input-wrapper" style={{ maxWidth: '220px' }}>
                        <i className="fas fa-user-tag"></i>
                        <select
                            className="input-styled"
                            style={{ paddingLeft: '36px' }}
                            value={filterEmployee}
                            onChange={e => setFilterEmployee(e.target.value)}
                        >
                            <option value="">-- Tất cả nhân viên --</option>
                            {employees.map(e => (
                                <option key={e.code} value={e.code}>{e.name}</option>
                            ))}
                        </select>
                    </div>

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
                        <option value="Mới">Mới</option>
                        <option value="Đang thực hiện">Đang thực hiện</option>
                        <option value="Hoàn thành">Hoàn thành</option>
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
                            <th width="35%">Tiêu đề</th>
                            <th width="10%">Mức độ</th>
                            <th width="12%">Trạng thái</th>
                            <th width="13%">Tiến độ</th>
                            <th width="15%">Xử lý chính</th>
                            <th width="10%">Hạn xử lý</th>
                            <th width="5%" className="text-center"><i className="fas fa-cog"></i></th>
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
                                    <td className="text-center">
                                        <button className="btn btn-sm btn-light rounded-circle text-primary" style={{ width: '32px', height: '32px' }} onClick={() => handleOpenEdit(task)}>
                                            <i className="fas fa-pen"></i>
                                        </button>
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
                                                                ? employees.map(e => <option key={e.code} value={e.code}>{e.name} ({e.dept})</option>)
                                                                : departments.map(d => <option key={d} value={d}>{d}</option>)
                                                            }
                                                        </select>
                                                    </div>
                                                    <div className="col-md-7 border-left pl-4">
                                                        <label className="form-label-premium text-secondary">Phối hợp thực hiện</label>
                                                        <div style={{ maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                                                            {departments.map(d => (
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
                                                            {employees.map(e => (
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
                                                        <option>Mới</option>
                                                        <option>Đang thực hiện</option>
                                                        <option>Hoàn thành</option>
                                                        <option>Tạm dừng</option>
                                                        <option>Hủy</option>
                                                    </select>
                                                </div>

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
                            <button className="btn-secondary-premium" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                            {modalTab === 'detail' && (
                                <button className="btn-primary-premium" onClick={handleSave}>
                                    <i className="fas fa-check mr-2"></i> Lưu công việc
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tasks
