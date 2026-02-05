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
    const [teamMembers, setTeamMembers] = useState([])
    const messagesEndRef = useRef(null)
    const [myTeam, setMyTeam] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (user?.profile?.team) {
            setMyTeam(user.profile.team)
            loadMessages()
            loadTeamMembers()

            const unsubscribe = subscribeToMessages()

            return () => {
                if (unsubscribe) unsubscribe()
            }
        }
    }, [user])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadMessages = async () => {
        if (!user?.profile?.team) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('team_discussions')
                .select(`
                    *,
                    employee_profiles!fk_team_discussion_sender (
                        employee_code,
                        first_name,
                        last_name,
                        avatar_url
                    )
                `)
                .eq('team', user.profile.team)
                .order('created_at', { ascending: true })

            if (error) {
                if (error.message.includes('Could not find the table')) {
                    alert('Bảng team_discussions chưa được tạo. Vui lòng chạy migration SQL trong Supabase Dashboard:\n\nFile: supabase/fix_team_discussions.sql')
                    throw new Error('Bảng team_discussions chưa tồn tại. Vui lòng chạy migration SQL.')
                }
                throw error
            }

            setMessages(data || [])
        } catch (err) {
            console.error('Error loading messages:', err)
            if (err.message.includes('Could not find the table')) {
                alert('⚠️ Bảng team_discussions chưa được tạo!\n\nVui lòng:\n1. Mở Supabase Dashboard > SQL Editor\n2. Chạy file: supabase/fix_team_discussions.sql\n\nHoặc chạy SQL migration: supabase/migrations/20260202_create_team_discussions.sql')
            } else {
                alert('Lỗi tải tin nhắn: ' + err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const loadTeamMembers = async () => {
        if (!user?.profile?.team) return

        try {
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('employee_code, first_name, last_name, avatar_url')
                .eq('team', user.profile.team)
                .order('first_name')

            if (error) throw error

            setTeamMembers(data || [])
        } catch (err) {
            console.error('Error loading team members:', err)
        }
    }

    const subscribeToMessages = () => {
        if (!user?.profile?.team) return null

        const channel = supabase
            .channel(`team_discussions:${user.profile.team}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'team_discussions',
                    filter: `team=eq.${user.profile.team}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        loadMessages()
                    } else if (payload.eventType === 'UPDATE') {
                        loadMessages()
                    } else if (payload.eventType === 'DELETE') {
                        loadMessages()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !user?.profile?.team || !user?.employee_code) return

        try {
            setSending(true)
            const { error } = await supabase
                .from('team_discussions')
                .insert([{
                    team: user.profile.team,
                    sender_code: user.employee_code,
                    message: newMessage.trim()
                }])

            if (error) {
                if (error.message.includes('Could not find the table')) {
                    alert('⚠️ Bảng team_discussions chưa được tạo!\n\nVui lòng:\n1. Mở Supabase Dashboard > SQL Editor\n2. Chạy file: supabase/fix_team_discussions.sql')
                    throw new Error('Bảng team_discussions chưa tồn tại.')
                }
                throw error
            }

            setNewMessage('')
        } catch (err) {
            console.error('Error sending message:', err)
            if (err.message.includes('Could not find the table')) {
                alert('⚠️ Bảng team_discussions chưa được tạo!\n\nVui lòng:\n1. Mở Supabase Dashboard > SQL Editor\n2. Chạy file: supabase/fix_team_discussions.sql\n\nHoặc chạy SQL migration: supabase/migrations/20260202_create_team_discussions.sql')
            } else {
                alert('Lỗi gửi tin nhắn: ' + err.message)
            }
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

    if (!user?.profile?.team) {
        return (
            <div className="team-discussion-page">
                <div className="no-team-message">
                    <i className="fas fa-users-slash"></i>
                    <h3>Bạn chưa được phân vào team nào</h3>
                    <p>Vui lòng liên hệ quản trị viên để được phân vào team</p>
                </div>
            </div>
        )
    }

    return (
        <div className="team-discussion-page">
            <div className="discussion-header">
                <div className="header-info">
                    <h1><i className="fas fa-comments"></i> Thảo luận Team</h1>
                    <p className="team-name">
                        <i className="fas fa-users"></i> {myTeam}
                        <span className="member-count">({teamMembers.length} thành viên)</span>
                    </p>
                </div>
            </div>

            <div className="discussion-container">
                <div className="messages-container">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Đang tải tin nhắn...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-comment-slash"></i>
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        <div className="messages-list">
                            {messages.map((msg) => {
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
