import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './TeamDiscussion.css'

function TeamDiscussion() {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    // Filter states
    const [allTeams, setAllTeams] = useState([])
    const [allEmployees, setAllEmployees] = useState([])
    const [filterTeam, setFilterTeam] = useState('')
    const [filterEmployee, setFilterEmployee] = useState('')

    const isAdmin = ['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(user?.role_level)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (user) {
            loadFilters()
            loadMessages()
        }
    }, [user])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadFilters = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('employee_code, first_name, last_name, team')

            if (error) throw error

            // Get unique teams
            const teams = [...new Set(data.map(e => e.team).filter(Boolean))].sort()
            setAllTeams(teams)

            // Get employees for filter
            const employees = data.map(e => ({
                code: e.employee_code,
                name: `${e.last_name || ''} ${e.first_name || ''}`.trim() || e.employee_code
            })).sort((a, b) => a.name.localeCompare(b.name))
            setAllEmployees(employees)
        } catch (err) {
            console.error('Error loading filters:', err)
        }
    }

    const loadMessages = async () => {
        try {
            setLoading(true)

            let query = supabase
                .from('team_discussions')
                .select(`
                    *,
                    employee_profiles!fk_team_discussion_sender (
                        employee_code,
                        first_name,
                        last_name,
                        avatar_url,
                        team
                    )
                `)
                .order('created_at', { ascending: true })
                .limit(200) // Limit to recent 200 messages

            // Non-admin: only load messages from their team
            if (!isAdmin && user?.profile?.team) {
                query = query.eq('team', user.profile.team)
            }

            const { data, error } = await query

            if (error) {
                if (error.message.includes('Could not find')) {
                    console.warn('Bảng team_discussions chưa tồn tại')
                }
                throw error
            }

            setMessages(data || [])
        } catch (err) {
            console.error('Error loading messages:', err)
            setMessages([])
        } finally {
            setLoading(false)
        }
    }

    // Filter messages client-side
    const getFilteredMessages = () => {
        let filtered = messages

        if (filterTeam) {
            filtered = filtered.filter(m => m.team === filterTeam)
        }

        if (filterEmployee) {
            filtered = filtered.filter(m => m.sender_code === filterEmployee)
        }

        return filtered
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        const targetTeam = isAdmin ? (filterTeam || user?.profile?.team || 'Chung') : user?.profile?.team
        if (!newMessage.trim() || !user?.employee_code) return

        try {
            setSending(true)
            const { error } = await supabase
                .from('team_discussions')
                .insert([{
                    team: targetTeam || 'Chung',
                    sender_code: user.employee_code,
                    message: newMessage.trim()
                }])

            if (error) throw error

            setNewMessage('')
            // Reload messages
            await loadMessages()
        } catch (err) {
            console.error('Error sending message:', err)
            alert('Lỗi gửi tin nhắn: ' + err.message)
        } finally {
            setSending(false)
        }
    }

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) return

        try {
            const { error } = await supabase
                .from('team_discussions')
                .delete()
                .eq('id', messageId)

            if (error) throw error
            await loadMessages()
        } catch (err) {
            console.error('Error deleting message:', err)
            alert('Lỗi xóa tin nhắn: ' + err.message)
        }
    }

    const formatTime = (dateString) => {
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

    const filteredMessages = getFilteredMessages()

    return (
        <div className="team-discussion-page">
            <div className="discussion-header">
                <div className="header-info">
                    <h1><i className="fas fa-comments"></i> Thảo luận Team</h1>
                    {isAdmin && (
                        <p className="admin-badge">
                            <i className="fas fa-shield-alt"></i> Admin Mode - Xem tất cả
                        </p>
                    )}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="filter-group">
                    <label><i className="fas fa-users"></i> Lọc theo đội:</label>
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">-- Tất cả đội --</option>
                        {allTeams.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label><i className="fas fa-user"></i> Lọc theo NV:</label>
                    <select
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">-- Tất cả NV --</option>
                        {allEmployees.map(e => (
                            <option key={e.code} value={e.code}>{e.name} ({e.code})</option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn-clear-filter"
                    onClick={() => { setFilterTeam(''); setFilterEmployee(''); }}
                >
                    <i className="fas fa-times"></i> Xóa lọc
                </button>

                <span className="message-count">
                    {filteredMessages.length} tin nhắn
                </span>
            </div>

            <div className="discussion-container">
                <div className="messages-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải tin nhắn...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-comment-slash"></i>
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        <div className="messages-list">
                            {filteredMessages.map((msg) => {
                                const sender = msg.employee_profiles
                                const isMyMessage = msg.sender_code === user?.employee_code
                                const senderName = sender
                                    ? `${sender.last_name || ''} ${sender.first_name || ''}`.trim() || sender.employee_code
                                    : msg.sender_code

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-item ${isMyMessage ? 'my-message' : ''}`}
                                    >
                                        <div className="message-avatar">
                                            {sender?.avatar_url ? (
                                                <img src={sender.avatar_url} alt={senderName} />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {senderName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="message-content">
                                            <div className="message-header">
                                                <span className="sender-name">{senderName}</span>
                                                <span className="team-badge">{msg.team}</span>
                                                <span className="message-time">{formatTime(msg.created_at)}</span>
                                            </div>
                                            <div className="message-text">{msg.message}</div>
                                            {isMyMessage && (
                                                <button
                                                    className="delete-message-btn"
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    title="Xóa tin nhắn"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..."
                            disabled={sending}
                            maxLength={1000}
                        />
                        <button
                            type="submit"
                            className="send-btn"
                            disabled={!newMessage.trim() || sending}
                        >
                            {sending ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TeamDiscussion
