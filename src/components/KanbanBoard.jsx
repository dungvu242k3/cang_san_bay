import { useState } from 'react'
import './KanbanBoard.css'

const STATUSES = ['Mới giao', 'Đang làm', 'Hoàn thành', 'Từ chối', 'Tạm dừng', 'Hủy']

function KanbanBoard({ tasks, onTaskUpdate, onTaskClick, getPriorityClass, getStatusClass, isMobile }) {
    const [draggedTask, setDraggedTask] = useState(null)
    const [editingProgress, setEditingProgress] = useState(null)
    const [activeStatusTab, setActiveStatusTab] = useState(STATUSES[0])

    const handleDragStart = (e, task) => {
        setDraggedTask(task)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, newStatus) => {
        e.preventDefault()
        if (draggedTask && draggedTask.status !== newStatus) {
            onTaskUpdate(draggedTask.id, { status: newStatus })
        }
        setDraggedTask(null)
    }

    const handleProgressClick = (e, task) => {
        e.stopPropagation()
        e.preventDefault()
        setEditingProgress(task.id)
    }

    const handleProgressChange = (taskId, newProgress) => {
        onTaskUpdate(taskId, { progress: parseInt(newProgress) })
    }

    const handleProgressBlur = () => {
        setEditingProgress(null)
    }

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status)
    }

    const renderProgressBar = (task) => {
        if (editingProgress === task.id) {
            return (
                <div className="progress-bar-editable" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress || 0}
                        onChange={(e) => handleProgressChange(task.id, e.target.value)}
                        onBlur={handleProgressBlur}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="progress-input"
                        autoFocus
                    />
                    <div className="progress-bar-wrapper" onClick={(e) => e.stopPropagation()}>
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${task.progress || 0}%` }}
                        />
                    </div>
                    <div className="progress-percentage">
                        {task.progress || 0}%
                    </div>
                </div>
            )
        }

        return (
            <div>
                <div
                    className="progress-bar-wrapper clickable"
                    onClick={(e) => handleProgressClick(e, task)}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <div
                        className={`progress-bar-fill ${task.progress === 100 ? 'completed' : ''}`}
                        style={{ width: `${task.progress || 0}%` }}
                    />
                </div>
                <div className="progress-percentage">
                    {task.progress || 0}%
                </div>
            </div>
        )
    }

    return (
        <div className={`kanban-container ${isMobile ? 'mobile-kanban' : ''}`}>
            {isMobile && (
                <div className="kanban-mobile-tabs">
                    {STATUSES.map(status => (
                        <button
                            key={status}
                            className={`kanban-tab-btn ${activeStatusTab === status ? 'active' : ''}`}
                            onClick={() => setActiveStatusTab(status)}
                        >
                            {status}
                            <span className="tab-count">{tasks.filter(t => t.status === status).length}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="kanban-board">
                {STATUSES.map(status => {
                    const statusTasks = getTasksByStatus(status)

                    if (isMobile && activeStatusTab !== status) return null;

                    return (
                        <div
                            key={status}
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="kanban-column-header">
                                <h3>{status}</h3>
                                <span className="task-count">{statusTasks.length}</span>
                            </div>
                            <div className="kanban-column-content">
                                {statusTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="kanban-card"
                                        draggable={!isMobile}
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        onClick={(e) => {
                                            // Prevent opening edit when clicking on progress bar
                                            if (e.target.closest('.progress-bar-wrapper') ||
                                                e.target.closest('.progress-input') ||
                                                e.target.closest('.progress-bar-editable')) {
                                                return
                                            }
                                            onTaskClick(task, e)
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                onTaskClick(task, e)
                                            }
                                        }}
                                        aria-label={`Công việc: ${task.title}. Nhấn Enter để mở chi tiết`}
                                    >
                                        <div className="kanban-card-header">
                                            <span className={getPriorityClass(task.priority)}>
                                                {task.priority === 'Khẩn cấp' && <i className="fas fa-fire"></i>}
                                                {task.priority}
                                            </span>
                                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="kanban-card-title">{task.title}</div>
                                        {task.description && (
                                            <div className="kanban-card-description">
                                                {task.description.substring(0, 100)}
                                                {task.description.length > 100 && '...'}
                                            </div>
                                        )}
                                        <div className="kanban-card-progress">
                                            {renderProgressBar(task)}
                                        </div>
                                        <div className="kanban-card-footer">
                                            {task.primary && (
                                                <div className="assignee">
                                                    <i className="fas fa-user"></i>
                                                    {task.primary.assignee_code}
                                                </div>
                                            )}
                                            {task.due_date && (
                                                <div className={`due-date ${new Date(task.due_date) < new Date() ? 'overdue' : ''}`}>
                                                    <i className="fas fa-calendar"></i>
                                                    {new Date(task.due_date).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default KanbanBoard
