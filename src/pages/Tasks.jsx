import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import KanbanBoard from '../components/KanbanBoard';
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
    const [viewMode, setViewMode] = useState('list') // 'list' | 'kanban'
    const [editingProgress, setEditingProgress] = useState(null)

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
    
    // Discussion/Comments state
    const [taskComments, setTaskComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)
    const [sendingComment, setSendingComment] = useState(false)
    
    // Attachments state
    const [taskAttachments, setTaskAttachments] = useState([])
    const [loadingAttachments, setLoadingAttachments] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(false)
    const fileInputRef = useRef(null)

    // Load Initial Data
    useEffect(() => {
        loadMyProfile()
        loadDictionaries()
        loadTasks()
    }, [user])

    // Load comments when switching to discussion tab
    useEffect(() => {
        if (modalTab === 'discussion' && editingTask?.id) {
            loadTaskComments(editingTask.id)
        }
    }, [modalTab, editingTask])

    // Load attachments when switching to attachments tab
    useEffect(() => {
        if (modalTab === 'attachments' && editingTask?.id) {
            loadTaskAttachments(editingTask.id)
        }
    }, [modalTab, editingTask])

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
                    const needsAction = ['Mới giao', 'Đang làm'].includes(t.status)
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

    const handleOpenEdit = (task, event) => {
        // Prevent event bubbling
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        try {
            // Log action for analytics/debugging
            console.log('📝 [Edit Task] Opening task editor:', {
                taskId: task?.id,
                taskTitle: task?.title,
                status: task?.status,
                timestamp: new Date().toISOString()
            })

            // Validate task data
            if (!task || !task.id) {
                console.warn('⚠️ [Edit Task] Invalid task data:', task)
                alert('Không thể mở chỉnh sửa: Dữ liệu công việc không hợp lệ')
                return
            }

            // Set modal tab to detail
            setModalTab('detail')
            
            // Set editing task
            setEditingTask(task)
            
            // Extract primary assignee and collaborators
            const primary = task.primary || {}
            const collabs = task.collabs || []
            
            // Populate form data
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Trung bình',
                due_date: task.due_date ? task.due_date.slice(0, 10) : '',
                status: task.status || 'Mới giao',
                progress: task.progress || 0,
                primary_assignee_type: primary.assignee_type || 'PERSON',
                primary_assignee_code: primary.assignee_code || '',
                collab_assignees: collabs.map(c => ({ 
                    code: c.assignee_code || '', 
                    type: c.assignee_type || 'PERSON' 
                })),
                rejection_reason: task.rejection_reason || ''
            })
            
            // Show modal
            setShowModal(true)
            
            // Load related data (comments and attachments) when opening task
            if (task.id) {
                // Load comments in background
                loadTaskComments(task.id).catch(err => {
                    console.error('❌ [Edit Task] Error loading comments:', err)
                })
                
                // Load attachments in background
                loadTaskAttachments(task.id).catch(err => {
                    console.error('❌ [Edit Task] Error loading attachments:', err)
                })
            }

            console.log('✅ [Edit Task] Task editor opened successfully')
        } catch (error) {
            console.error('❌ [Edit Task] Error opening task editor:', error)
            alert('Lỗi khi mở chỉnh sửa công việc: ' + error.message)
        }
    }

    const loadTaskComments = async (taskId) => {
        if (!taskId) return
        
        try {
            setLoadingComments(true)
            const { data, error } = await supabase
                .from('task_comments')
                .select(`
                    *,
                    employee_profiles:sender_code (
                        employee_code,
                        first_name,
                        last_name,
                        avatar_url
                    )
                `)
                .eq('task_id', taskId)
                .order('created_at', { ascending: true })

            if (error) throw error

            setTaskComments(data || [])
        } catch (err) {
            console.error('Error loading comments:', err)
            if (err.message.includes('Could not find the table')) {
                console.warn('Bảng task_comments chưa được tạo. Vui lòng chạy migration SQL.')
            }
            setTaskComments([])
        } finally {
            setLoadingComments(false)
        }
    }

    const handleSendComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim() || !editingTask?.id || !user?.employee_code || sendingComment) return

        try {
            setSendingComment(true)
            const { error } = await supabase
                .from('task_comments')
                .insert([{
                    task_id: editingTask.id,
                    sender_code: user.employee_code,
                    comment: newComment.trim()
                }])

            if (error) {
                if (error.message.includes('Could not find the table')) {
                    alert('⚠️ Bảng task_comments chưa được tạo!\n\nVui lòng chạy migration SQL:\nsupabase/migrations/20260202_create_task_comments.sql')
                    throw error
                }
                throw error
            }

            setNewComment('')
            // Reload comments
            await loadTaskComments(editingTask.id)
        } catch (err) {
            console.error('Error sending comment:', err)
            if (!err.message.includes('Could not find the table')) {
                alert('Lỗi gửi comment: ' + err.message)
            }
        } finally {
            setSendingComment(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa comment này?')) return

        try {
            const { error } = await supabase
                .from('task_comments')
                .delete()
                .eq('id', commentId)

            if (error) throw error

            // Reload comments
            if (editingTask?.id) {
                await loadTaskComments(editingTask.id)
            }
        } catch (err) {
            console.error('Error deleting comment:', err)
            alert('Lỗi xóa comment: ' + err.message)
        }
    }

    const formatCommentTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Vừa xong'
        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        if (days < 7) return `${days} ngày trước`

        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const loadTaskAttachments = async (taskId) => {
        if (!taskId) return
        
        try {
            setLoadingAttachments(true)
            const { data, error } = await supabase
                .from('task_attachments')
                .select(`
                    *,
                    employee_profiles:uploaded_by (
                        employee_code,
                        first_name,
                        last_name
                    )
                `)
                .eq('task_id', taskId)
                .order('created_at', { ascending: false })

            if (error) {
                if (error.message.includes('Could not find the table')) {
                    console.warn('Bảng task_attachments chưa được tạo. Vui lòng chạy migration SQL.')
                }
                throw error
            }

            setTaskAttachments(data || [])
        } catch (err) {
            console.error('Error loading attachments:', err)
            setTaskAttachments([])
        } finally {
            setLoadingAttachments(false)
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file || !editingTask?.id || !user?.employee_code) return

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File không được vượt quá 10MB')
            return
        }

        try {
            setUploadingFile(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${editingTask.id}_${Date.now()}.${fileExt}`
            const filePath = fileName

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('task-attachments')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    alert('⚠️ Bucket "task-attachments" chưa được tạo!\n\nVui lòng chạy SQL:\nsupabase/create_task_attachments_bucket.sql')
                    throw uploadError
                }
                throw uploadError
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('task-attachments')
                .getPublicUrl(filePath)

            // Save attachment record to database
            const { error: dbError } = await supabase
                .from('task_attachments')
                .insert([{
                    task_id: editingTask.id,
                    uploaded_by: user.employee_code,
                    file_name: file.name,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type
                }])

            if (dbError) {
                if (dbError.message.includes('Could not find the table')) {
                    alert('⚠️ Bảng task_attachments chưa được tạo!\n\nVui lòng chạy migration SQL:\nsupabase/migrations/20260202_create_task_attachments.sql')
                    throw dbError
                }
                throw dbError
            }

            // Reload attachments
            await loadTaskAttachments(editingTask.id)
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (err) {
            console.error('Error uploading file:', err)
            if (!err.message.includes('Bucket not found') && !err.message.includes('Could not find the table')) {
                alert('Lỗi upload file: ' + err.message)
            }
        } finally {
            setUploadingFile(false)
        }
    }

    const handleDeleteAttachment = async (attachmentId, filePath) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa file đính kèm này?')) return

        try {
            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('task-attachments')
                .remove([filePath])

            if (storageError) {
                console.warn('Error deleting from storage:', storageError)
                // Continue to delete from database even if storage delete fails
            }

            // Delete from database
            const { error: dbError } = await supabase
                .from('task_attachments')
                .delete()
                .eq('id', attachmentId)

            if (dbError) throw dbError

            // Reload attachments
            if (editingTask?.id) {
                await loadTaskAttachments(editingTask.id)
            }
        } catch (err) {
            console.error('Error deleting attachment:', err)
            alert('Lỗi xóa file: ' + err.message)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getFileIcon = (fileType) => {
        if (fileType?.includes('pdf')) return 'fa-file-pdf'
        if (fileType?.includes('word') || fileType?.includes('document')) return 'fa-file-word'
        if (fileType?.includes('excel') || fileType?.includes('spreadsheet')) return 'fa-file-excel'
        if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'fa-file-powerpoint'
        if (fileType?.includes('image')) return 'fa-file-image'
        if (fileType?.includes('zip') || fileType?.includes('compressed')) return 'fa-file-archive'
        if (fileType?.includes('text')) return 'fa-file-alt'
        return 'fa-file'
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

    const handleTaskUpdate = async (taskId, updates) => {
        try {
            await supabase
                .from('tasks')
                .update(updates)
                .eq('id', taskId)
            loadTasks()
        } catch (err) {
            console.error('Error updating task:', err)
            alert('Lỗi cập nhật công việc: ' + err.message)
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
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="custom-tabs" style={{ margin: 0 }}>
                        <button 
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`} 
                            onClick={() => setViewMode('list')}
                            title="Danh sách"
                        >
                            <i className="fas fa-list"></i>
                        </button>
                        <button 
                            className={`btn ${viewMode === 'kanban' ? 'btn-primary' : ''}`} 
                            onClick={() => setViewMode('kanban')}
                            title="Kanban"
                        >
                            <i className="fas fa-columns"></i>
                        </button>
                    </div>
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

            {/* View Toggle */}
            {viewMode === 'list' ? (
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {editingProgress === task.id ? (
                                                <div className="progress-editable-wrapper" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="100"
                                                        value={task.progress || 0}
                                                        onChange={(e) => handleTaskUpdate(task.id, { progress: parseInt(e.target.value) })}
                                                        onBlur={() => setEditingProgress(null)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        className="progress-range-input"
                                                        autoFocus
                                                    />
                                                    <div className="progress" style={{ marginTop: '4px' }}>
                                                        <div className={`progress-bar ${task.progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${task.progress || 0}%` }}></div>
                                                    </div>
                                                    <div className="progress-percentage" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#667eea', marginTop: '4px' }}>
                                                        {task.progress || 0}%
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div 
                                                        className="progress-clickable" 
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingProgress(task.id)
                                                        }}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    >
                                                        <div className={`progress-bar ${task.progress === 100 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${task.progress || 0}%` }}></div>
                                                    </div>
                                                    <div className="progress-percentage" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#667eea' }}>
                                                        {task.progress || 0}%
                                                    </div>
                                                </>
                                            )}
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
                                            {['Mới giao'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-primary" title="Nhận việc" onClick={() => handleQuickAction(task, 'start')}>
                                                    <i className="fas fa-play"></i>
                                                </button>
                                            )}
                                            {['Đang làm'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-success" title="Xác nhận xong" onClick={() => handleQuickAction(task, 'complete')}>
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            )}
                                            {['Mới giao', 'Đang làm'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-danger" title="Từ chối" onClick={() => handleQuickAction(task, 'reject')}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                            {['Hoàn thành', 'Từ chối', 'Hủy'].includes(task.status) && (
                                                <button className="btn-task-action btn-task-action-danger" title="Xóa vĩnh viễn" onClick={() => handleDeleteTask(task)}>
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            )}
                                            <button 
                                                className="btn-task-action btn-task-action-light" 
                                                title="Sửa chi tiết" 
                                                onClick={(e) => handleOpenEdit(task, e)}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.1)'
                                                    e.currentTarget.style.transition = 'all 0.2s ease'
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)'
                                                }}
                                                aria-label={`Sửa công việc: ${task.title}`}
                                            >
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
            ) : (
                <KanbanBoard
                    tasks={getFilteredTasks()}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskClick={handleOpenEdit}
                    getPriorityClass={getPriorityClass}
                    getStatusClass={getStatusClass}
                />
            )}

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
                                <div className="discussion-panel" style={{ maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                                    {/* Comments List */}
                                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
                                        {loadingComments ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        ) : taskComments.length === 0 ? (
                                            <div className="text-center text-muted py-5">
                                                <i className="far fa-comments fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                                                <p>Chưa có thảo luận nào. Hãy bắt đầu cuộc trò chuyện!</p>
                                            </div>
                                        ) : (
                                            <div className="comments-list">
                                                {taskComments.map((comment) => {
                                                    const sender = comment.employee_profiles
                                                    const isMyComment = comment.sender_code === user?.employee_code
                                                    const senderName = sender 
                                                        ? `${sender.last_name || ''} ${sender.first_name || ''}`.trim() || sender.employee_code
                                                        : comment.sender_code

                                                    return (
                                                        <div key={comment.id} className="comment-item" style={{
                                                            display: 'flex',
                                                            gap: '12px',
                                                            marginBottom: '16px',
                                                            padding: '12px',
                                                            background: isMyComment ? '#f0f7ff' : '#f8f9fa',
                                                            borderRadius: '10px',
                                                            borderLeft: `3px solid ${isMyComment ? '#0d6efd' : '#6c757d'}`
                                                        }}>
                                                            <div className="comment-avatar" style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                background: isMyComment ? 'linear-gradient(135deg, #0d6efd, #0b5ed7)' : 'linear-gradient(135deg, #6c757d, #5a6268)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#fff',
                                                                fontWeight: '700',
                                                                fontSize: '1rem',
                                                                flexShrink: 0
                                                            }}>
                                                                {sender?.avatar_url ? (
                                                                    <img src={sender.avatar_url} alt={senderName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    senderName.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className="comment-content" style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                                    <div>
                                                                        <strong style={{ color: '#212529', fontSize: '0.9rem' }}>{senderName}</strong>
                                                                        {isMyComment && (
                                                                            <span style={{ 
                                                                                marginLeft: '8px',
                                                                                padding: '2px 8px',
                                                                                background: '#0d6efd',
                                                                                color: '#fff',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: '600'
                                                                            }}>Bạn</span>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                                                                            {formatCommentTime(comment.created_at)}
                                                                        </span>
                                                                        {isMyComment && (
                                                                            <button
                                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                                style={{
                                                                                    background: 'transparent',
                                                                                    border: 'none',
                                                                                    color: '#dc3545',
                                                                                    cursor: 'pointer',
                                                                                    padding: '4px 8px',
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '0.8rem'
                                                                                }}
                                                                                title="Xóa comment"
                                                                            >
                                                                                <i className="fas fa-trash"></i>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div style={{ 
                                                                    color: '#495057',
                                                                    fontSize: '0.9rem',
                                                                    lineHeight: '1.5',
                                                                    whiteSpace: 'pre-wrap',
                                                                    wordWrap: 'break-word'
                                                                }}>
                                                                    {comment.comment}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment Input Form */}
                                    <form onSubmit={handleSendComment} style={{
                                        borderTop: '1px solid #e9ecef',
                                        paddingTop: '16px'
                                    }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Nhập bình luận..."
                                                    rows="3"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '2px solid #e9ecef',
                                                        borderRadius: '8px',
                                                        fontSize: '0.9rem',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit'
                                                    }}
                                                    disabled={sendingComment}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim() || sendingComment}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: sendingComment || !newComment.trim() 
                                                        ? '#6c757d' 
                                                        : 'linear-gradient(135deg, #0d6efd, #0b5ed7)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: sendingComment || !newComment.trim() ? 'not-allowed' : 'pointer',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    whiteSpace: 'nowrap',
                                                    opacity: sendingComment || !newComment.trim() ? 0.6 : 1
                                                }}
                                            >
                                                {sendingComment ? (
                                                    <><i className="fas fa-spinner fa-spin mr-2"></i> Đang gửi...</>
                                                ) : (
                                                    <><i className="fas fa-paper-plane mr-2"></i> Gửi</>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {modalTab === 'attachments' && (
                                <div className="attachments-panel" style={{ maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                                    {/* Upload Section */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '20px',
                                        padding: '16px',
                                        borderRadius: '10px',
                                        border: '2px dashed #dee2e6',
                                        background: '#f8f9fa'
                                    }}>
                                        <div>
                                            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <i className="fas fa-cloud-upload-alt"></i> Tải lên tài liệu
                                            </strong>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6c757d' }}>
                                                Chọn tệp từ máy tính (Tối đa 10MB)
                                            </p>
                                        </div>
                                        <label style={{
                                            padding: '8px 16px',
                                            background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            cursor: uploadingFile ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            opacity: uploadingFile ? 0.6 : 1,
                                            display: 'inline-block'
                                        }}>
                                            {uploadingFile ? (
                                                <><i className="fas fa-spinner fa-spin mr-2"></i> Đang tải...</>
                                            ) : (
                                                <><i className="fas fa-plus mr-2"></i> Chọn tệp</>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                disabled={uploadingFile}
                                                style={{ display: 'none' }}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt,.zip"
                                            />
                                        </label>
                                    </div>

                                    {/* Attachments List */}
                                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
                                        {loadingAttachments ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        ) : taskAttachments.length === 0 ? (
                                            <div className="text-center text-muted py-5">
                                                <i className="far fa-folder-open fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                                                <p>Chưa có tệp đính kèm nào.</p>
                                            </div>
                                        ) : (
                                            <div className="attachments-list">
                                                {taskAttachments.map((attachment) => {
                                                    const uploader = attachment.employee_profiles
                                                    const isMyAttachment = attachment.uploaded_by === user?.employee_code
                                                    const uploaderName = uploader 
                                                        ? `${uploader.last_name || ''} ${uploader.first_name || ''}`.trim() || uploader.employee_code
                                                        : attachment.uploaded_by

                                                    // Get file URL
                                                    const { data: { publicUrl } } = supabase.storage
                                                        .from('task-attachments')
                                                        .getPublicUrl(attachment.file_path)

                                                    return (
                                                        <div key={attachment.id} style={{
                                                            display: 'flex',
                                                            gap: '12px',
                                                            padding: '12px',
                                                            background: '#fff',
                                                            borderRadius: '10px',
                                                            border: '1px solid #e9ecef',
                                                            marginBottom: '12px',
                                                            alignItems: 'center'
                                                        }}>
                                                            <div style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                borderRadius: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#fff',
                                                                fontSize: '1.5rem',
                                                                flexShrink: 0
                                                            }}>
                                                                <i className={`fas ${getFileIcon(attachment.file_type)}`}></i>
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                                    <a
                                                                        href={publicUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{
                                                                            fontWeight: '600',
                                                                            color: '#0d6efd',
                                                                            textDecoration: 'none',
                                                                            fontSize: '0.9rem',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            display: 'block',
                                                                            maxWidth: '300px'
                                                                        }}
                                                                        title={attachment.file_name}
                                                                    >
                                                                        {attachment.file_name}
                                                                    </a>
                                                                    {isMyAttachment && (
                                                                        <button
                                                                            onClick={() => handleDeleteAttachment(attachment.id, attachment.file_path)}
                                                                            style={{
                                                                                background: 'transparent',
                                                                                border: 'none',
                                                                                color: '#dc3545',
                                                                                cursor: 'pointer',
                                                                                padding: '4px 8px',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.8rem'
                                                                            }}
                                                                            title="Xóa file"
                                                                        >
                                                                            <i className="fas fa-trash"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                                                    <span>{formatFileSize(attachment.file_size || 0)}</span>
                                                                    <span style={{ margin: '0 8px' }}>•</span>
                                                                    <span>{uploaderName}</span>
                                                                    <span style={{ margin: '0 8px' }}>•</span>
                                                                    <span>{formatCommentTime(attachment.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
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
