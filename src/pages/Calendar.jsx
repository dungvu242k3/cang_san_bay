import moment from 'moment';
import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import './Calendar.css';

import 'moment/locale/vi';
moment.locale('vi');
const localizer = momentLocalizer(moment);

const messages = {
    allDay: 'Cả ngày',
    previous: 'Trước',
    next: 'Sau',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    agenda: 'Lịch biểu',
    date: 'Ngày',
    time: 'Thời gian',
    event: 'Sự kiện',
    noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này.',
    showMore: total => `+ Xem thêm (${total})`
};

export default function CalendarPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [myProfile, setMyProfile] = useState(null)

    // Detail Modal State
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        allDay: false,
        type: 'EVENT', // EVENT, MEETING, REMINDER
        scope: 'PERSONAL', // PERSONAL, UNIT, OFFICE, COMPANY
        location: ''
    });

    useEffect(() => {
        loadMyProfile();
    }, [user]);

    useEffect(() => {
        loadMyProfile();
        // Always fetch events on mount (or when date/view changes), verified by RLS
        fetchAllEvents();
    }, [user, date, view]);

    const loadMyProfile = async () => {
        if (user?.email) {
            // Try to load profile but don't block
            const { data } = await supabase.from('employee_profiles').select('*').or(`email_acv.eq.${user.email},email_personal.eq.${user.email}`).maybeSingle()
            if (data) setMyProfile(data)
        }
    };

    const fetchAllEvents = async () => {
        setLoading(true);
        try {
            // 1. Fetch Calendar Events
            const { data: calendarEvents } = await supabase.from('events').select('*');

            // 2. Fetch Tasks (Due Date)
            const { data: tasks } = await supabase.from('tasks').select('id, title, due_date, status').not('due_date', 'is', null);

            // 3. Fetch Leaves (Approved)
            const { data: leaves } = await supabase.from('employee_leaves').select('*').eq('status', 'Đã duyệt');

            // 4. Fetch Birthdays
            const { data: profiles } = await supabase.from('employee_profiles').select('employee_code, first_name, last_name, date_of_birth').not('date_of_birth', 'is', null);

            const formattedEvents = [];

            // Process Calendar Events
            if (calendarEvents) {
                calendarEvents.forEach(e => {
                    formattedEvents.push({
                        id: e.id,
                        title: e.title,
                        start: new Date(e.start_time),
                        end: new Date(e.end_time),
                        allDay: e.is_all_day,
                        resource: { type: 'EVENT', data: e },
                        color: '#0d6efd' // Primary Blue
                    });
                });
            }

            // Process Tasks
            if (tasks) {
                tasks.forEach(t => {
                    const dueDate = new Date(t.due_date);
                    formattedEvents.push({
                        id: `task-${t.id}`,
                        title: `[Task] ${t.title}`,
                        start: dueDate,
                        end: dueDate,
                        allDay: true,
                        resource: { type: 'TASK', data: t },
                        color: t.status === 'Hoàn thành' ? '#198754' : '#dc3545' // Green or Red
                    });
                });
            }

            // Process Leaves
            if (leaves) {
                leaves.forEach(l => {
                    formattedEvents.push({
                        id: `leave-${l.id}`,
                        title: `Nghỉ phép: ${l.employee_code}`,
                        start: new Date(l.from_date),
                        end: new Date(l.to_date),
                        allDay: true,
                        resource: { type: 'LEAVE', data: l },
                        color: '#ffc107', // Warning Yellow
                        textColor: '#000'
                    });
                });
            }

            // Process Birthdays (Map to current year)
            if (profiles) {
                const currentYear = new Date().getFullYear();
                profiles.forEach(p => {
                    const dob = new Date(p.date_of_birth);
                    const birthday = new Date(currentYear, dob.getMonth(), dob.getDate());
                    formattedEvents.push({
                        id: `dob-${p.employee_code}`,
                        title: `🎂 SN ${p.last_name} ${p.first_name}`,
                        start: birthday,
                        end: birthday,
                        allDay: true,
                        resource: { type: 'BIRTHDAY', data: p },
                        color: '#6f42c1' // Purple
                    });
                });
            }

            setEvents(formattedEvents);

        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = ({ start, end }) => {
        setNewEvent({
            ...newEvent,
            start,
            end,
            allDay: true
        });
        setShowModal(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setShowDetailModal(true);
    };

    const handleSaveEvent = async () => {
        try {
            // Allow Admin to save even without profile
            const creatorCode = myProfile?.employee_code || user?.email || 'ADMIN';

            const payload = {
                title: newEvent.title,
                description: newEvent.description,
                start_time: newEvent.start,
                end_time: newEvent.end,
                is_all_day: newEvent.allDay,
                location: newEvent.location,
                event_type: newEvent.type,
                scope: newEvent.scope,
                created_by: creatorCode
            };

            const { error } = await supabase.from('events').insert([payload]);
            if (error) throw error;

            setShowModal(false);
            fetchAllEvents();
            alert('Đã lưu sự kiện thành công!');
        } catch (error) {
            alert('Lỗi tạo sự kiện: ' + error.message);
        }
    };

    const eventStyleGetter = (event) => {
        const style = {
            backgroundColor: event.color,
            borderRadius: '4px',
            opacity: 0.9,
            color: event.textColor || 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="calendar-page-container fade-in p-4 bg-light min-vh-100">
            <div className="card shadow-sm border-0 rounded-lg">
                <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="m-0 font-weight-bold text-primary"><i className="far fa-calendar-alt mr-2"></i> Lịch làm việc</h5>
                    <div>
                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => {
                            setNewEvent({ ...newEvent, start: new Date(), end: new Date() });
                            setShowModal(true);
                        }}>
                            <i className="fas fa-plus mr-1"></i> Tạo sự kiện
                        </button>
                    </div>
                </div>
                <div className="card-body p-3" style={{ height: 'calc(100vh - 150px)' }}>
                    <BigCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        messages={messages}
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        popup
                    />
                </div>
            </div>

            {/* Premium Detail Modal */}
            {showDetailModal && selectedEvent && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content-premium" style={{ width: '500px' }}>
                        <div className="modal-header-premium">
                            <div className="modal-title">
                                <i className="fas fa-info-circle"></i>
                                <span>Chi tiết sự kiện</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowDetailModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body-premium">
                            <h4 className="text-primary font-weight-bold mb-3">{selectedEvent.title}</h4>

                            <div className="mb-3 d-flex align-items-center text-muted">
                                <i className="far fa-clock mr-2" style={{ width: '20px' }}></i>
                                <span>
                                    {moment(selectedEvent.start).format('HH:mm DD/MM')} - {moment(selectedEvent.end).format('HH:mm DD/MM/YYYY')}
                                </span>
                            </div>

                            {selectedEvent.resource?.type === 'EVENT' && (
                                <>
                                    <div className="mb-3 d-flex align-items-center text-muted">
                                        <i className="fas fa-map-marker-alt mr-2" style={{ width: '20px' }}></i>
                                        <span>{selectedEvent.resource.data.location || 'Chưa cập nhật địa điểm'}</span>
                                    </div>
                                    <div className="mb-3 d-flex align-items-center text-muted">
                                        <i className="fas fa-align-left mr-2" style={{ width: '20px' }}></i>
                                        <span>{selectedEvent.resource.data.description || 'Không có mô tả'}</span>
                                    </div>
                                    <div className="mb-3">
                                        <span className={`badge badge-${selectedEvent.resource.data.scope === 'COMPANY' ? 'danger' : 'info'}`}>
                                            {selectedEvent.resource.data.scope}
                                        </span>
                                    </div>
                                </>
                            )}

                            {selectedEvent.resource?.type === 'TASK' && (
                                <div className="alert alert-light border">
                                    <small className="d-block text-muted font-weight-bold mb-1">TRẠNG THÁI CÔNG VIỆC</small>
                                    <span className={`badge badge-${selectedEvent.resource.data.status === 'Hoàn thành' ? 'success' : 'warning'}`}>
                                        {selectedEvent.resource.data.status}
                                    </span>
                                </div>
                            )}

                            {selectedEvent.resource?.type === 'LEAVE' && (
                                <div className="alert alert-warning border-warning">
                                    <small className="d-block text-muted font-weight-bold mb-1">LOẠI NGHỈ PHÉP</small>
                                    <span>{selectedEvent.resource.data.leave_type} - {selectedEvent.resource.data.reason}</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer-premium">
                            <button className="btn-secondary-premium" onClick={() => setShowDetailModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Event Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content-premium" style={{ width: '600px' }}>

                        {/* Header */}
                        <div className="modal-header-premium">
                            <div className="modal-title">
                                <i className="fas fa-calendar-plus"></i>
                                <span>Tạo sự kiện mới</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="modal-body-premium">
                            <div className="mb-4">
                                <label className="form-label-premium"><i className="fas fa-heading text-primary"></i> Tiêu đề sự kiện</label>
                                <input
                                    className="form-control-premium"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Nhập tên cuộc họp, sự kiện..."
                                    autoFocus
                                />
                            </div>

                            <div className="row mb-4">
                                <div className="col-6">
                                    <label className="form-label-premium"><i className="far fa-clock text-success"></i> Bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control-premium"
                                        value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                                        onChange={e => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label-premium"><i className="far fa-clock text-danger"></i> Kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control-premium"
                                        value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                                        onChange={e => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-6">
                                    <label className="form-label-premium"><i className="fas fa-tag text-warning"></i> Loại sự kiện</label>
                                    <select className="form-control-premium" value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}>
                                        <option value="EVENT">📅 Sự kiện chung</option>
                                        <option value="MEETING">🤝 Cuộc họp</option>
                                        <option value="REMINDER">⏰ Nhắc nhở</option>
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label-premium"><i className="fas fa-globe text-info"></i> Phạm vi</label>
                                    <select className="form-control-premium" value={newEvent.scope} onChange={e => setNewEvent({ ...newEvent, scope: e.target.value })}>
                                        <option value="PERSONAL">👤 Cá nhân</option>
                                        <option value="UNIT">🏢 Đơn vị</option>
                                        <option value="OFFICE">🏢 Văn phòng</option>
                                        <option value="COMPANY">🌍 Toàn công ty</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        className="checkbox-premium"
                                        checked={newEvent.allDay}
                                        onChange={e => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                                    />
                                    <span className="text-secondary font-weight-bold">Sự kiện cả ngày (All Day)</span>
                                </label>
                            </div>

                            <div className="mb-0">
                                <label className="form-label-premium"><i className="fas fa-align-left text-muted"></i> Mô tả chi tiết</label>
                                <textarea
                                    className="form-control-premium"
                                    rows="3"
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Nội dung chi tiết, địa điểm, link họp online..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer-premium">
                            <button className="btn-secondary-premium" onClick={() => setShowModal(false)}>
                                Đóng
                            </button>
                            <button className="btn-primary-premium" onClick={handleSaveEvent}>
                                <i className="fas fa-save mr-2"></i> Lưu sự kiện
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
