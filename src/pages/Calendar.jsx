import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
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

const abbreviateName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName;

    // Abbreviate all but the last part
    const abbreviated = parts.slice(0, -1).map(part => `${part.charAt(0).toUpperCase()}.`);
    const lastName = parts[parts.length - 1];

    return [...abbreviated, lastName].join('');
};

const MultiEmployeeSelector = ({
    label,
    selectedCodes = [],
    onChange,
    employees = [],
    placeholder = "Chọn nhân viên..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleEmployee = (code) => {
        if (selectedCodes.includes(code)) {
            onChange(selectedCodes.filter(c => c !== code));
        } else {
            onChange([...selectedCodes, code]);
        }
    };

    const filtered = employees.filter(emp => {
        const term = searchTerm.toLowerCase();
        const name = `${emp.last_name || ''} ${emp.first_name || ''}`.trim().toLowerCase();
        const code = (emp.employee_code || '').toLowerCase();
        const dept = (emp.department || '').toLowerCase();
        return name.includes(term) || code.includes(term) || dept.includes(term);
    });

    const selectedEmps = selectedCodes.map(code =>
        employees.find(e => e.employee_code === code)
    ).filter(Boolean);

    // Handle missing employees (preserved codes that aren't in list)
    const missingCodes = selectedCodes.filter(code => !employees.find(e => e.employee_code === code));

    return (
        <div className="mb-3" ref={containerRef}>
            {label && <label className="form-label-premium">{label}</label>}
            <div
                className="employee-select-wrapper"
                style={{ position: 'relative' }}
            >
                <div
                    className="employee-select-input"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        background: '#fdfdfd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        minHeight: '42px',
                        transition: 'all 0.2s'
                    }}
                >
                    {selectedEmps.length > 0 || missingCodes.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
                            {selectedEmps.map(emp => (
                                <span key={emp.employee_code} style={{
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    border: '1px solid #bbdefb'
                                }}>
                                    {abbreviateName(`${emp.last_name || ''} ${emp.first_name || ''}`)}
                                    <i className="fas fa-times ml-1"
                                        style={{ cursor: 'pointer', opacity: 0.6 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleEmployee(emp.employee_code);
                                        }}
                                    ></i>
                                </span>
                            ))}
                            {missingCodes.map(code => (
                                <span key={code} style={{
                                    background: '#f1f1f1',
                                    color: '#666',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}>
                                    {code}
                                    <i className="fas fa-times ml-1"
                                        style={{ cursor: 'pointer', opacity: 0.6 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleEmployee(code);
                                        }}
                                    ></i>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span style={{ color: '#a0aec0', fontSize: '0.9rem' }}>{placeholder}</span>
                    )}
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ marginLeft: 'auto', color: '#a0aec0', fontSize: '0.8rem' }}></i>
                </div>
                {isOpen && (
                    <div className="employee-dropdown" style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxHeight: '250px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem'
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
                            {filtered.length > 0 ? (
                                filtered.map(emp => {
                                    const isSelected = selectedCodes.includes(emp.employee_code);
                                    return (
                                        <div
                                            key={emp.employee_code}
                                            onClick={() => toggleEmployee(emp.employee_code)}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                background: isSelected ? '#f0f9ff' : 'white',
                                                transition: 'background 0.2s',
                                                borderLeft: isSelected ? '3px solid #1976d2' : '3px solid transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = '#f7fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.background = 'white';
                                            }}
                                        >
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: '#e2e8f0', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: '12px', fontWeight: '600',
                                                color: '#4a5568', overflow: 'hidden'
                                            }}>
                                                {emp.avatar_url ? (
                                                    <img src={emp.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    (emp.last_name?.[0] || '') + (emp.first_name?.[0] || '')
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#2d3748' }}>
                                                    {emp.last_name} {emp.first_name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                    {emp.current_position || emp.department || emp.employee_code}
                                                </div>
                                            </div>
                                            {isSelected && <i className="fas fa-check text-primary"></i>}
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ padding: '12px', textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem' }}>
                                    Không tìm thấy kết quả
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Custom Agenda View to force date repetition
const CustomAgenda = ({ events, date }) => {
    // 1. Filter events for current month
    const startOfMonth = moment(date).startOf('month');
    const endOfMonth = moment(date).endOf('month');

    const filteredEvents = events.filter(event =>
        moment(event.start).isBetween(startOfMonth, endOfMonth, null, '[]')
    );

    // 2. Sort events by date
    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start) - new Date(b.start));

    if (sortedEvents.length === 0) {
        return <div className="p-3 text-center text-muted">Không có sự kiện nào trong tháng này.</div>;
    }

    return (
        <div className="rbc-agenda-view">
            <table className="rbc-agenda-table">
                <thead>
                    <tr>
                        <th className="rbc-header">Ngày</th>
                        <th className="rbc-header">Thời gian</th>
                        <th className="rbc-header">Sự kiện</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedEvents.map((event, idx) => (
                        <tr key={idx} style={{
                            backgroundColor: event.color,
                            color: event.textColor || '#fff',
                            borderBottom: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <td className="rbc-agenda-date-cell" style={{ color: 'inherit', fontWeight: 'bold' }}>
                                {moment(event.start).format('DD/MM/YYYY')}
                            </td>
                            <td className="rbc-agenda-time-cell" style={{ color: 'inherit' }}>
                                {event.allDay ? 'Cả ngày' : moment(event.start).format('HH:mm')}
                            </td>
                            <td className="rbc-agenda-event-cell" style={{ color: 'inherit', fontWeight: '500' }}>
                                {event.title}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

CustomAgenda.range = (date) => {
    const start = moment(date).startOf('month').toDate();
    const end = moment(date).endOf('month').toDate();
    return { start, end }; // Show full month by default in Agenda
};

CustomAgenda.navigate = (date, action) => {
    if (action === 'PREV') return moment(date).add(-1, 'month').toDate();
    if (action === 'NEXT') return moment(date).add(1, 'month').toDate();
    return date;
};

CustomAgenda.title = (date) => {
    return `Tháng ${moment(date).format('MM/YYYY')}`;
};

const CalendarToolbar = (toolbar) => {
    const { label, view, views, onNavigate, onView, localizer, filterLocation, setFilterLocation, filterScope, setFilterScope, getUniqueLocations } = toolbar;

    const goToBack = () => {
        onNavigate('PREV');
    };

    const goToNext = () => {
        onNavigate('NEXT');
    };

    const goToToday = () => {
        onNavigate('TODAY');
    };

    return (
        <div className="rbc-toolbar">
            <span className="rbc-btn-group">
                <button type="button" onClick={goToBack}><i className="fas fa-chevron-left"></i></button>
                <button type="button" onClick={goToToday}>Hôm nay</button>
                <button type="button" onClick={goToNext}><i className="fas fa-chevron-right"></i></button>
            </span>

            <span className="rbc-toolbar-label">{label}</span>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="form-select-macos"
                    style={{
                        border: '1px solid #e5e5e7',
                        borderRadius: '6px',
                        padding: '4px 24px 4px 10px',
                        fontSize: '12px',
                        background: '#f5f5f7',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '120px',
                        height: '30px'
                    }}
                >
                    <option value="">-- Địa điểm --</option>
                    {getUniqueLocations().map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>

                <select
                    value={filterScope}
                    onChange={(e) => setFilterScope(e.target.value)}
                    className="form-select-macos"
                    style={{
                        border: '1px solid #e5e5e7',
                        borderRadius: '6px',
                        padding: '4px 24px 4px 10px',
                        fontSize: '12px',
                        background: '#f5f5f7',
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: '120px',
                        height: '30px'
                    }}
                >
                    <option value="">-- Đơn vị --</option>
                    <option value="PERSONAL">Cá nhân</option>
                    <option value="UNIT">Đội</option>
                    <option value="OFFICE">Phòng</option>
                    <option value="COMPANY">Cảng</option>
                </select>

                <span className="rbc-btn-group">
                    {views.map(v => (
                        <button
                            key={v}
                            type="button"
                            className={view === v ? 'rbc-active' : ''}
                            onClick={() => onView(v)}
                        >
                            {messages[v] || v}
                        </button>
                    ))}
                </span>
            </div>
        </div>
    );
};

export default function CalendarPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [myProfile, setMyProfile] = useState(null)
    const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' or 'duty'

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
        location: '',
        participants: ''
    });
    const [eventEmployees, setEventEmployees] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [participantsSearchTerm, setParticipantsSearchTerm] = useState('');
    const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
    const participantsDropdownRef = useRef(null);

    // Duty Schedule State
    const [dutySchedules, setDutySchedules] = useState([]);
    const [dutyEmployees, setDutyEmployees] = useState([]);
    const [showDutyModal, setShowDutyModal] = useState(false);
    const [dutyWeek, setDutyWeek] = useState(new Date());
    const [dutyFormData, setDutyFormData] = useState({
        duty_date: '',
        director_on_duty: [],
        port_duty_officer: [],
        office_duty: [],
        finance_planning_duty: [],
        operations_duty: [],
        technical_duty: [],
        atc_duty: []
    });
    // Removed searchTerms state as it is now handled internally by MultiEmployeeSelector
    const [dutyView, setDutyView] = useState('week');
    const [contactModalData, setContactModalData] = useState(null);
    // Removed openDropdowns and dropdownRefs as they are no longer used

    // Filters
    const [filterLocation, setFilterLocation] = useState('');
    const [filterScope, setFilterScope] = useState('');

    // Derived Filter Options
    const getUniqueLocations = () => {
        const locs = new Set();
        events.forEach(e => {
            if (e.resource?.type === 'EVENT' && e.resource?.data?.location) {
                const loc = e.resource.data.location.trim();
                if (loc) locs.add(loc);
            }
        });
        return Array.from(locs).sort();
    };

    const getFilteredEvents = () => {
        return events.filter(e => {
            // 1. Apply Location Filter
            if (filterLocation) {
                // If the item is an EVENT, check its location
                if (e.resource?.type === 'EVENT') {
                    const eventLoc = (e.resource?.data?.location || '').trim();
                    if (eventLoc !== filterLocation) return false;
                } else {
                    // For non-events (Tasks, Leaves, etc.), strictly hide them when filtering by location
                    // because they don't have a location.
                    return false;
                }
            }

            // 2. Apply Scope Filter
            if (filterScope) {
                const itemType = e.resource?.type;

                if (itemType === 'EVENT') {
                    // Strict match for explicit Events
                    if (e.resource?.data?.scope !== filterScope) return false;
                }
                else if (itemType === 'TASK' || itemType === 'LEAVE') {
                    // Tasks and Leaves are considering 'PERSONAL'
                    if (filterScope !== 'PERSONAL') return false;
                }
                else if (itemType === 'BIRTHDAY') {
                    // Birthdays are considered 'OFFICE' (Department level) or 'UNIT' depending on view
                    // Let's assume 'OFFICE' (Phòng ban) for now as they are fetched by Dept
                    if (filterScope !== 'OFFICE') return false;
                }
            }

            return true;
        });
    };

    useEffect(() => {
        loadMyProfile();
    }, [user]);

    useEffect(() => {
        // Always fetch events on mount (or when date/view changes), verified by RLS
        if (activeTab === 'calendar') {
            fetchAllEvents();
            loadEventEmployees();
        } else if (activeTab === 'duty') {
            loadDutyEmployees();
            loadDutySchedules();
        }
    }, [user, date, view, activeTab, dutyWeek, myProfile]);

    // Close participants dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (participantsDropdownRef.current && !participantsDropdownRef.current.contains(event.target)) {
                setShowParticipantsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            const myCode = user?.employee_code;
            const myDept = user?.dept_scope || myProfile?.department;
            const myTeam = user?.team_scope || myProfile?.team;
            const myRole = user?.role_level || 'STAFF';

            // 1. Fetch Calendar Events with Scope Filtering
            let eventQuery = supabase.from('events').select('*');
            if (myRole === 'STAFF') {
                eventQuery = eventQuery.or(`created_by.eq.${myCode},scope.eq.COMPANY`);
            } else if (myRole === 'TEAM_LEADER' && myTeam) {
                eventQuery = eventQuery.or(`created_by.eq.${myCode},scope.eq.COMPANY,scope.eq.UNIT`);
                // Actually UNIT might be Dept. Let's assume UNIT filter is based on creator's team or dept.
            } else if (myRole === 'DEPT_HEAD' && myDept) {
                eventQuery = eventQuery.or(`created_by.eq.${myCode},scope.eq.COMPANY,scope.eq.UNIT,scope.eq.OFFICE`);
            }
            const { data: calendarEvents } = await eventQuery;

            // 2. Fetch Tasks (Apply Privacy)
            let taskQuery = supabase.from('tasks').select('id, title, due_date, status, created_by, task_assignments(*)').not('due_date', 'is', null);
            const { data: rawTasks } = await taskQuery;

            const tasks = (rawTasks || []).filter(t => {
                if (['SUPER_ADMIN', 'BOARD_DIRECTOR'].includes(myRole)) return true;
                const assignments = t.task_assignments || [];
                const isCreator = t.created_by === myCode;
                const isAssigned = assignments.some(a =>
                    (a.assignee_type === 'PERSON' && a.assignee_code === myCode) ||
                    (a.assignee_type === 'DEPARTMENT' && a.assignee_code === myDept)
                );
                if (isCreator || isAssigned) return true;
                if (myRole === 'DEPT_HEAD' && myDept) {
                    return assignments.some(a => a.assignee_code === myDept);
                }
                return false;
            });

            // 3. Fetch Leaves (Filter by Role)
            let leaveQuery = supabase.from('employee_leaves').select('*').eq('status', 'Đã duyệt');
            if (myRole === 'STAFF') {
                leaveQuery = leaveQuery.eq('employee_code', myCode);
            } else if (myRole === 'DEPT_HEAD' && myDept) {
                const { data: deptEmps } = await supabase.from('employee_profiles').select('employee_code').eq('department', myDept);
                leaveQuery = leaveQuery.in('employee_code', deptEmps.map(e => e.employee_code));
            }
            const { data: leaves } = await leaveQuery;

            // 4. Fetch Birthdays (Filter by Dept for privacy)
            let profileQuery = supabase.from('employee_profiles').select('employee_code, first_name, last_name, date_of_birth, department').not('date_of_birth', 'is', null);
            if (myRole === 'STAFF' || myRole === 'TEAM_LEADER' || myRole === 'DEPT_HEAD') {
                profileQuery = profileQuery.eq('department', myDept);
            }
            const { data: profiles } = await profileQuery;

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

            // Convert selected participants array to string (comma-separated employee codes)
            const participantsCodes = selectedParticipants.join(', ');

            const payload = {
                title: newEvent.title,
                description: newEvent.description,
                start_time: newEvent.start,
                end_time: newEvent.end,
                is_all_day: newEvent.allDay,
                location: newEvent.location,
                participants: participantsCodes || newEvent.participants,
                event_type: newEvent.type,
                scope: newEvent.scope,
                created_by: creatorCode
            };

            if (newEvent.id) {
                // Update existing event
                const { error } = await supabase
                    .from('events')
                    .update(payload)
                    .eq('id', newEvent.id);
                if (error) throw error;
                alert('Đã cập nhật sự kiện thành công!');
            } else {
                // Insert new event
                const { error } = await supabase.from('events').insert([payload]);
                if (error) throw error;
                alert('Đã lưu sự kiện thành công!');
            }

            setShowModal(false);
            setNewEvent({
                title: '',
                description: '',
                start: new Date(),
                end: new Date(),
                allDay: false,
                type: 'EVENT',
                scope: 'PERSONAL',
                location: '',
                participants: ''
            });
            setSelectedParticipants([]);
            setParticipantsSearchTerm('');
            fetchAllEvents();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleEditEvent = () => {
        if (!selectedEvent) return;

        const eventType = selectedEvent.resource?.type;

        // Handle different event types
        if (eventType === 'EVENT') {
            const eventData = selectedEvent.resource.data;
            // Parse participants string to array of employee codes (comma-separated)
            const participantsStr = eventData.participants || '';
            const participantsArray = participantsStr
                ? participantsStr.split(',').map(code => code.trim()).filter(Boolean)
                : [];

            setNewEvent({
                id: eventData.id,
                title: eventData.title,
                description: eventData.description || '',
                start: new Date(eventData.start_time),
                end: new Date(eventData.end_time),
                allDay: eventData.is_all_day,
                type: eventData.event_type || 'EVENT',
                scope: eventData.scope || 'PERSONAL',
                location: eventData.location || '',
                participants: eventData.participants || ''
            });
            setSelectedParticipants(participantsArray);
            setShowDetailModal(false);
            setShowModal(true);
        } else if (eventType === 'LEAVE') {
            // Navigate to leaves page or show edit modal for leave
            alert('Vui lòng sửa nghỉ phép tại trang Quản lý nghỉ phép');
        } else if (eventType === 'TASK') {
            // Navigate to tasks page
            alert('Vui lòng sửa công việc tại trang Công việc');
        } else {
            alert('Không thể sửa loại sự kiện này');
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        const eventType = selectedEvent.resource?.type;

        if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;

        try {
            if (eventType === 'EVENT') {
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', selectedEvent.resource.data.id);

                if (error) throw error;
                alert('Đã xóa sự kiện thành công!');
            } else if (eventType === 'LEAVE') {
                const { error } = await supabase
                    .from('employee_leaves')
                    .delete()
                    .eq('id', selectedEvent.resource.data.id);

                if (error) throw error;
                alert('Đã xóa đơn nghỉ phép thành công!');
            } else if (eventType === 'TASK') {
                const { error } = await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', selectedEvent.resource.data.id);

                if (error) throw error;
                alert('Đã xóa công việc thành công!');
            } else {
                alert('Không thể xóa loại sự kiện này');
                return;
            }

            setShowDetailModal(false);
            setSelectedEvent(null);
            fetchAllEvents();
        } catch (error) {
            alert('Lỗi xóa sự kiện: ' + error.message);
        }
    };

    const eventStyleGetter = (event) => {
        // macOS style colors - clean and modern
        const colorMap = {
            '#0d6efd': '#007aff', // Primary Blue
            '#198754': '#34c759', // Green
            '#dc3545': '#ff3b30', // Red
            '#ffc107': '#ff9500', // Orange
            '#6f42c1': '#af52de'  // Purple
        };

        const bgColor = colorMap[event.color] || event.color || '#007aff';
        const isLight = ['#ffc107', '#ff9500'].includes(event.color);

        const style = {
            backgroundColor: bgColor,
            borderRadius: '4px',
            opacity: 0.95,
            color: isLight ? '#1d1d1f' : (event.textColor || 'white'),
            border: 'none',
            display: 'block',
            fontWeight: 400,
            fontSize: '12px',
            padding: '3px 6px',
            boxShadow: 'none',
            transition: 'all 0.15s ease'
        };
        return { style };
    };

    // Load employees for event participants (all departments)
    const loadEventEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('employee_code, first_name, last_name, avatar_url, department')
                .order('department')
                .order('last_name')
                .order('first_name')

            if (error) throw error
            setEventEmployees(data || [])
        } catch (error) {
            console.error('Error loading employees:', error)
        }
    }

    // Duty Schedule Functions (all departments)
    const loadDutyEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('employee_code, first_name, last_name, avatar_url, department, current_position, phone')
                .order('department')
                .order('last_name')
                .order('first_name')

            if (error) throw error
            setDutyEmployees(data || [])
        } catch (error) {
            console.error('Error loading employees:', error)
        }
    }

    const loadDutySchedules = async () => {
        try {
            let startRange, endRange;

            if (dutyView === 'week') {
                // Get start and end of week (Monday to Sunday)
                const startOfWeek = new Date(dutyWeek)
                startOfWeek.setDate(dutyWeek.getDate() - dutyWeek.getDay() + 1) // Monday
                startOfWeek.setHours(0, 0, 0, 0)

                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
                endOfWeek.setHours(23, 59, 59, 999)

                startRange = startOfWeek;
                endRange = endOfWeek;
            } else {
                // Get start and end of MONTH
                startRange = new Date(dutyWeek.getFullYear(), dutyWeek.getMonth(), 1);
                endRange = new Date(dutyWeek.getFullYear(), dutyWeek.getMonth() + 1, 0, 23, 59, 59, 999);
            }

            const { data, error } = await supabase
                .from('duty_schedules')
                .select('*')
                .gte('duty_date', startRange.toISOString().split('T')[0])
                .lte('duty_date', endRange.toISOString().split('T')[0])
                .order('duty_date')

            if (error) throw error
            setDutySchedules(data || [])
        } catch (error) {
            console.error('Error loading duty schedules:', error)
        }
    }

    const getMonthDays = () => {
        const year = dutyWeek.getFullYear();
        const month = dutyWeek.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 0 = Sunday, 1 = Monday. We want start on Monday.
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7; // Convert Sun(0) to 7 for easier math if Mon is 1

        // Days from prev month to fill row
        const days = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Previous month filler
        for (let i = startDay - 1; i > 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i + 1).toISOString().split('T')[0],
                day: prevMonthLastDay - i + 1,
                isCurrentMonth: false,
                isToday: false
            });
        }

        // Current month days
        const todayStr = new Date().toISOString().split('T')[0];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateStr = new Date(year, month, i).toISOString().split('T')[0];
            days.push({
                date: dateStr,
                day: i,
                isCurrentMonth: true,
                isToday: dateStr === todayStr,
                schedule: dutySchedules.find(s => s.duty_date === dateStr)
            });
        }

        // Next month filler
        const remainingCells = 42 - days.length; // 6 rows * 7 days
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i).toISOString().split('T')[0],
                day: i,
                isCurrentMonth: false,
                isToday: false
            });
        }

        return days;
    }

    const handleDutyDateClick = (dateStr, schedule) => {
        if (schedule) {
            const split = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
            setDutyFormData({
                duty_date: schedule.duty_date,
                director_on_duty: split(schedule.director_on_duty),
                port_duty_officer: split(schedule.port_duty_officer),
                office_duty: split(schedule.office_duty),
                finance_planning_duty: split(schedule.finance_planning_duty),
                operations_duty: split(schedule.operations_duty),
                technical_duty: split(schedule.technical_duty),
                atc_duty: split(schedule.atc_duty)
            });
        } else {
            setDutyFormData({
                duty_date: dateStr,
                director_on_duty: [],
                port_duty_officer: [],
                office_duty: [],
                finance_planning_duty: [],
                operations_duty: [],
                technical_duty: [],
                atc_duty: []
            });
        }
        setShowDutyModal(true);
    };

    const getWeekDays = () => {
        const startOfWeek = new Date(dutyWeek)
        startOfWeek.setDate(dutyWeek.getDate() - dutyWeek.getDay() + 1) // Monday
        startOfWeek.setHours(0, 0, 0, 0)

        const days = []
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            const dateStr = date.toISOString().split('T')[0]
            const schedule = dutySchedules.find(s => s.duty_date === dateStr)

            days.push({
                date: dateStr,
                day: date.getDate(),
                month: date.getMonth() + 1,
                dayName: dayNames[date.getDay()],
                dayIndex: date.getDay(),
                schedule: schedule || null
            })
        }

        return days
    }

    const getDutyFieldValue = (schedule, field) => {
        if (!schedule) return ''
        return schedule[field] || ''
    }

    const renderDutyEmployees = (codeString) => {
        if (!codeString) return '-';
        const codes = codeString.split(',').map(s => s.trim()).filter(Boolean);
        if (codes.length === 0) return '-';

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {codes.map(code => {
                    const emp = dutyEmployees.find(e => e.employee_code === code);
                    const name = emp ? abbreviateName(`${emp.last_name || ''} ${emp.first_name || ''}`) : code;
                    const phone = emp?.phone;

                    return (
                        <div key={code} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span>{name}</span>
                            {phone && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContactModalData({
                                            name: emp ? `${emp.last_name || ''} ${emp.first_name || ''}`.trim() : code,
                                            phone: phone,
                                            avatar_url: emp?.avatar_url,
                                            department: emp?.department,
                                            position: emp?.current_position
                                        });
                                    }}
                                    title={`Xem liên hệ: ${phone}`}
                                    style={{ marginLeft: '6px', color: '#28a745', cursor: 'pointer' }}
                                >
                                    <i className="fas fa-phone-alt" style={{ fontSize: '0.9em' }}></i>
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    const handleWeekChange = (direction) => {
        const newDate = new Date(dutyWeek)
        newDate.setDate(dutyWeek.getDate() + (direction === 'next' ? 7 : -7))
        setDutyWeek(newDate)
    }

    const formatWeekRange = () => {
        const startOfWeek = new Date(dutyWeek)
        startOfWeek.setDate(dutyWeek.getDate() - dutyWeek.getDay() + 1)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        return `${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}/${endOfWeek.getFullYear()}`
    }

    const handleSaveDuty = async () => {
        try {
            const scheduleDate = new Date(dutyFormData.duty_date)
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
            const dayOfWeek = days[scheduleDate.getDay()]

            const scheduleData = {
                duty_date: dutyFormData.duty_date,
                day_of_week: dayOfWeek,
                director_on_duty: dutyFormData.director_on_duty.join(', '),
                port_duty_officer: dutyFormData.port_duty_officer.join(', '),
                office_duty: dutyFormData.office_duty.join(', '),
                finance_planning_duty: dutyFormData.finance_planning_duty.join(', '),
                operations_duty: dutyFormData.operations_duty.join(', '),
                technical_duty: dutyFormData.technical_duty.join(', '),
                atc_duty: dutyFormData.atc_duty.join(', '),
                created_by: myProfile?.employee_code || user?.email || 'ADMIN'
            }

            // Check if exists, then update or insert
            const { data: existing } = await supabase
                .from('duty_schedules')
                .select('id')
                .eq('duty_date', dutyFormData.duty_date)
                .maybeSingle()

            if (existing) {
                const { error } = await supabase
                    .from('duty_schedules')
                    .update(scheduleData)
                    .eq('id', existing.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('duty_schedules')
                    .insert(scheduleData)
                if (error) throw error
            }

            setShowDutyModal(false)
            setDutyFormData({
                duty_date: '',
                director_on_duty: [],
                port_duty_officer: [],
                office_duty: [],
                finance_planning_duty: [],
                operations_duty: [],
                technical_duty: [],
                atc_duty: []
            })
            loadDutySchedules()
            alert('Đã lưu lịch trực thành công!')
        } catch (error) {
            console.error('Error saving duty schedule:', error)
            alert('Lỗi khi lưu lịch trực: ' + error.message)
        }
    }

    const getEmployeeName = (code) => {
        if (!code) return '-'
        const emp = dutyEmployees.find(e => e.employee_code === code)
        if (emp) {
            return `${emp.last_name || ''} ${emp.first_name || ''}`.trim() || code
        }
        return code
    }

    const getEmployeeAvatar = (code) => {
        if (!code) return null
        const emp = dutyEmployees.find(e => e.employee_code === code)
        return emp?.avatar_url || null
    }

    const getEligibleEmployees = (field) => {
        return dutyEmployees.filter(emp => {
            const dept = (emp.department || '').toLowerCase()
            const pos = (emp.current_position || '').toLowerCase()

            // Filter logic based on field
            if (field === 'director_on_duty') {
                const isDirectorDept = dept.includes('ban giám đốc');
                const isDirectorTitle = pos.includes('giám đốc') && !pos.includes('thư ký');
                if (!isDirectorDept && !isDirectorTitle) return false;
            }
            else if (field === 'office_duty') {
                if (!dept.includes('văn phòng')) return false;
            }
            else if (field === 'finance_planning_duty') {
                if (!dept.includes('tài chính') && !dept.includes('kế hoạch') && !dept.includes('tc-kh')) return false;
            }
            else if (field === 'operations_duty') {
                if (!dept.includes('phục vụ mặt đất') && !dept.includes('pvmd')) return false;
            }
            else if (field === 'technical_duty') {
                if (!dept.includes('kỹ thuật') && !dept.includes('hạ tầng') && !dept.includes('ktht')) return false;
            }
            else if (field === 'atc_duty') {
                if (!dept.includes('điều hành') && !dept.includes('đhsb')) return false;
            }
            else if (field === 'port_duty_officer') {
                // Trực ban cảng thường là lãnh đạo các phòng vận hành hoặc ban giám đốc
                const relevantDepts = ['điều hành', 'an ninh', 'phục vụ mặt đất', 'kỹ thuật', 'ban giám đốc'];
                const hasRelevantDept = relevantDepts.some(d => dept.includes(d));
                const isDutyRole = pos.includes('trực ban') || pos.includes('đội trưởng');

                if (!hasRelevantDept && !isDutyRole) return false;
            }

            return true;
        })
    }

    // Removed toggleDropdown and handleEmployeeSelect as they are replaced by MultiEmployeeSelector logic

    // Participants selector for events (multi-select)
    const filteredParticipants = () => {
        const searchTerm = participantsSearchTerm.toLowerCase();
        return eventEmployees.filter(emp => {
            const name = `${emp.last_name || ''} ${emp.first_name || ''}`.trim().toLowerCase();
            const code = (emp.employee_code || '').toLowerCase();
            const dept = (emp.department || '').toLowerCase();
            return name.includes(searchTerm) || code.includes(searchTerm) || dept.includes(searchTerm);
        });
    }

    const handleParticipantToggle = (employeeCode) => {
        setSelectedParticipants(prev => {
            if (prev.includes(employeeCode)) {
                return prev.filter(code => code !== employeeCode);
            } else {
                return [...prev, employeeCode];
            }
        });
    }

    const renderParticipantsSelector = () => {
        const selectedEmps = selectedParticipants.map(code =>
            eventEmployees.find(e => e.employee_code === code)
        ).filter(Boolean);

        return (
            <div className="mb-4">
                <label className="form-label-premium"><i className="fas fa-users text-info"></i> Thành phần tham dự</label>
                <div
                    className="employee-select-wrapper"
                    style={{ position: 'relative' }}
                    ref={participantsDropdownRef}
                >
                    <div
                        className="employee-select-input"
                        onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            background: '#fdfdfd',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            minHeight: '48px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        {selectedEmps.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                                {selectedEmps.slice(0, 3).map(emp => (
                                    <span key={emp.employee_code} style={{
                                        background: '#e3f2fd',
                                        color: '#1976d2',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {`${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                    </span>
                                ))}
                                {selectedEmps.length > 3 && (
                                    <span style={{ color: '#1976d2', fontSize: '12px' }}>
                                        +{selectedEmps.length - 3} khác
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span style={{ color: '#a0aec0' }}>-- Chọn nhân viên --</span>
                        )}
                        <i className={`fas fa-chevron-${showParticipantsDropdown ? 'up' : 'down'}`} style={{ marginLeft: 'auto', color: '#a0aec0' }}></i>
                    </div>
                    {showParticipantsDropdown && (
                        <div className="employee-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            maxHeight: '300px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên hoặc mã nhân viên..."
                                    value={participantsSearchTerm}
                                    onChange={(e) => setParticipantsSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                {filteredParticipants().length > 0 ? (
                                    filteredParticipants().map(emp => {
                                        const isSelected = selectedParticipants.includes(emp.employee_code);
                                        return (
                                            <div
                                                key={emp.employee_code}
                                                onClick={() => handleParticipantToggle(emp.employee_code)}
                                                style={{
                                                    padding: '12px 16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #f1f3f5',
                                                    background: isSelected ? '#e3f2fd' : 'white',
                                                    transition: 'background 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) e.currentTarget.style.background = '#f8f9fa'
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) e.currentTarget.style.background = 'white'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleParticipantToggle(emp.employee_code)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                {emp.avatar_url ? (
                                                    <img
                                                        src={emp.avatar_url}
                                                        alt="Avatar"
                                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px', fontWeight: '600' }}>
                                                        {(emp.first_name || emp.last_name || 'U')[0]}
                                                    </div>
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>
                                                        {`${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#86868b' }}>
                                                        {emp.employee_code} {emp.department ? `• ${emp.department}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#86868b' }}>
                                        Không tìm thấy nhân viên
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderEmployeeSelector = (field, label, icon) => {
        const selectedCode = dutyFormData[field]
        const selectedEmp = dutyEmployees.find(e => e.employee_code === selectedCode)

        return (
            <div className="mb-4">
                <label className="form-label-premium"><i className={icon}></i> {label}</label>
                <div
                    className="employee-select-wrapper"
                    style={{ position: 'relative' }}
                    ref={el => dropdownRefs.current[field] = el}
                >
                    <div
                        className="employee-select-input"
                        onClick={() => toggleDropdown(field)}
                        style={{
                            padding: '12px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            background: '#fdfdfd',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1976d2'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                        {selectedCode && selectedEmp ? (
                            <>
                                {selectedEmp.avatar_url ? (
                                    <img
                                        src={selectedEmp.avatar_url}
                                        alt="Avatar"
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px', fontWeight: '600' }}>
                                        {(selectedEmp.first_name || selectedEmp.last_name || 'U')[0]}
                                    </div>
                                )}
                                <span>{`${selectedEmp.last_name || ''} ${selectedEmp.first_name || ''}`.trim()}</span>
                            </>
                        ) : (
                            <span style={{ color: '#a0aec0' }}>-- Chọn --</span>
                        )}
                        <i className={`fas fa-chevron-${openDropdowns[field] ? 'up' : 'down'}`} style={{ marginLeft: 'auto', color: '#a0aec0' }}></i>
                    </div>
                    {openDropdowns[field] && (
                        <div className="employee-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '14px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            maxHeight: '300px',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tên hoặc mã nhân viên..."
                                    value={searchTerms[field] || ''}
                                    onChange={(e) => setSearchTerms({ ...searchTerms, [field]: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
                                {filteredEmployees(field).length > 0 ? (
                                    filteredEmployees(field).map(emp => (
                                        <div
                                            key={emp.employee_code}
                                            onClick={() => handleEmployeeSelect(field, emp.employee_code)}
                                            style={{
                                                padding: '12px 16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f1f3f5',
                                                background: selectedCode === emp.employee_code ? '#e3f2fd' : 'white',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedCode !== emp.employee_code) {
                                                    e.currentTarget.style.background = '#f8f9fa'
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedCode !== emp.employee_code) {
                                                    e.currentTarget.style.background = 'white'
                                                }
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCode === emp.employee_code}
                                                onChange={() => { }}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1976d2' }}
                                            />
                                            {emp.avatar_url ? (
                                                <img
                                                    src={emp.avatar_url}
                                                    alt={`${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '16px', fontWeight: '600' }}>
                                                    {(emp.first_name || emp.last_name || 'U')[0]}
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                                    {`${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                                                    {emp.employee_code} {emp.department ? `• ${emp.department}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>
                                        Không tìm thấy nhân viên
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="calendar-page-container fade-in min-vh-100">
            <div className="card-macos" style={{
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
            }}>
                <div className="card-header-macos" style={{
                    background: '#ffffff',
                    padding: '0 20px',
                    borderBottom: '1px solid #e5e5e7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Tabs section */}
                    <div style={{
                        display: 'flex',
                        gap: '0'
                    }}>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            style={{
                                border: 'none',
                                background: 'none',
                                color: activeTab === 'calendar' ? '#007aff' : '#86868b',
                                fontWeight: activeTab === 'calendar' ? '600' : '400',
                                fontSize: '13px',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: activeTab === 'calendar' ? '2px solid #007aff' : '2px solid transparent',
                                marginBottom: '-1px',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== 'calendar') {
                                    e.currentTarget.style.color = '#1d1d1f'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== 'calendar') {
                                    e.currentTarget.style.color = '#86868b'
                                }
                            }}
                        >
                            <i className="far fa-calendar-alt"></i>
                            <span>Lịch sự kiện</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('duty')}
                            style={{
                                border: 'none',
                                background: 'none',
                                color: activeTab === 'duty' ? '#007aff' : '#86868b',
                                fontWeight: activeTab === 'duty' ? '600' : '400',
                                fontSize: '13px',
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: activeTab === 'duty' ? '2px solid #007aff' : '2px solid transparent',
                                marginBottom: '-1px',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== 'duty') {
                                    e.currentTarget.style.color = '#1d1d1f'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== 'duty') {
                                    e.currentTarget.style.color = '#86868b'
                                }
                            }}
                        >
                            <i className="fas fa-calendar-check"></i>
                            <span>Lịch trực</span>
                        </button>
                    </div>
                    {/* Action button */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {activeTab === 'calendar' && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                    className="btn-macos-primary"
                                    onClick={() => {
                                        setNewEvent({ ...newEvent, start: new Date(), end: new Date() });
                                        setSelectedParticipants([]);
                                        setParticipantsSearchTerm('');
                                        setShowModal(true);
                                    }}
                                    style={{
                                        background: '#007aff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0 14px',
                                        height: '32px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#0051d5'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#007aff'}
                                >
                                    <i className="fas fa-plus"></i>
                                    <span>Tạo sự kiện</span>
                                </button>
                            </div>
                        )}
                        {activeTab === 'duty' && (
                            <button
                                className="btn-macos-primary"
                                onClick={() => {
                                    setDutyFormData({
                                        duty_date: '',
                                        director_on_duty: [],
                                        port_duty_officer: [],
                                        office_duty: [],
                                        finance_planning_duty: [],
                                        operations_duty: [],
                                        technical_duty: [],
                                        atc_duty: []
                                    });
                                    setShowDutyModal(true);
                                }}
                                style={{
                                    background: '#007aff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0 14px',
                                    height: '32px',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#0051d5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#007aff'}
                            >
                                <i className="fas fa-plus"></i>
                                <span>Thêm lịch trực</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="card-body-macos" style={{
                    padding: '0',
                    height: 'calc(100vh - 200px)',
                    background: '#ffffff'
                }}>
                    {activeTab === 'calendar' ? (
                        <BigCalendar
                            localizer={localizer}
                            events={getFilteredEvents()}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            messages={messages}
                            view={view}
                            onView={setView}
                            views={{
                                month: true,
                                week: true,
                                day: true,
                                agenda: CustomAgenda
                            }}
                            components={{
                                toolbar: (props) => (
                                    <CalendarToolbar
                                        {...props}
                                        filterLocation={filterLocation}
                                        setFilterLocation={setFilterLocation}
                                        filterScope={filterScope}
                                        setFilterScope={setFilterScope}
                                        getUniqueLocations={getUniqueLocations}
                                    />
                                )
                            }}
                            date={date}
                            onNavigate={setDate}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            eventPropGetter={eventStyleGetter}
                            popup
                            formats={{
                                monthHeaderFormat: 'MM/YYYY',
                                dayHeaderFormat: 'DD/MM',
                                dayRangeHeaderFormat: ({ start, end }, culture, local) =>
                                    local.format(start, 'DD/MM/YYYY', culture) + ' - ' +
                                    local.format(end, 'DD/MM/YYYY', culture),
                                agendaDateFormat: 'DD/MM/YYYY',
                                agendaTimeFormat: 'HH:mm',
                                agendaHeaderFormat: ({ start, end }, culture, local) =>
                                    local.format(start, 'DD/MM/YYYY', culture) + ' - ' +
                                    local.format(end, 'DD/MM/YYYY', culture)
                            }}
                        />
                    ) : (
                        <div className="duty-schedule-calendar-view">

                            <div className="d-flex flex-column mb-4" style={{ gap: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>

                                {/* Row 1: Title */}
                                <div>
                                    <h6 className="mb-0" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2d3748' }}>
                                        {dutyView === 'week' ? `Tuần: ${formatWeekRange()}` : `Tháng ${dutyWeek.getMonth() + 1}/${dutyWeek.getFullYear()}`}
                                    </h6>
                                </div>

                                {/* Row 2: Controls */}
                                <div className="d-flex align-items-center justify-content-between">
                                    {/* View Toggles */}
                                    <div className="btn-group btn-group-sm" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        <button
                                            className={`btn ${dutyView === 'week' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setDutyView('week')}
                                            style={{ padding: '6px 20px' }}
                                        >
                                            Tuần
                                        </button>
                                        <button
                                            className={`btn ${dutyView === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setDutyView('month')}
                                            style={{ padding: '6px 20px' }}
                                        >
                                            Tháng
                                        </button>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                                const newDate = new Date(dutyWeek);
                                                if (dutyView === 'week') newDate.setDate(dutyWeek.getDate() - 7);
                                                else newDate.setMonth(dutyWeek.getMonth() - 1);
                                                setDutyWeek(newDate);
                                            }}
                                            style={{ padding: '6px 14px' }}
                                        >
                                            <i className="fas fa-chevron-left"></i> {dutyView === 'week' ? 'Tuần trước' : 'Tháng trước'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setDutyWeek(new Date())}
                                            style={{ padding: '6px 16px', fontWeight: '500' }}
                                        >
                                            Hôm nay
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                                const newDate = new Date(dutyWeek);
                                                if (dutyView === 'week') newDate.setDate(dutyWeek.getDate() + 7);
                                                else newDate.setMonth(dutyWeek.getMonth() + 1);
                                                setDutyWeek(newDate);
                                            }}
                                            style={{ padding: '6px 14px' }}
                                        >
                                            {dutyView === 'week' ? 'Tuần sau' : 'Tháng sau'} <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {dutyView === 'week' ? (
                                // WEEK VIEW
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover" style={{ fontSize: '0.9rem' }}>
                                        <thead className="thead-light">
                                            <tr>
                                                <th style={{ minWidth: '150px', position: 'sticky', left: 0, background: '#f8f9fa', zIndex: 10 }}>Phòng ban / Vị trí</th>
                                                {getWeekDays().map((day, idx) => (
                                                    <th key={idx} style={{ textAlign: 'center', minWidth: '120px' }}>
                                                        <div style={{ fontWeight: '600', color: '#1976d2' }}>{day.dayName}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                                                            {day.day}/{day.month}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>Trực Giám đốc</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'director_on_duty'))}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>Trực Ban Cảng (đ.c)</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'port_duty_officer'))}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>VĂN PHÒNG</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'office_duty'))}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>PHÒNG TC-KH</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'finance_planning_duty'))}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>PHÒNG PVMD</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'operations_duty'))}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>P. KTHT</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'technical_duty'))}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td style={{ position: 'sticky', left: 0, background: 'white', fontWeight: '600', zIndex: 5 }}>PHÒNG ĐHSB</td>
                                                {getWeekDays().map((day, idx) => (
                                                    <td
                                                        key={idx}
                                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDutyDateClick(day.date, day.schedule);
                                                        }}
                                                    >
                                                        {renderDutyEmployees(getDutyFieldValue(day.schedule, 'atc_duty'))}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                // MONTH VIEW
                                <div className="month-view-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '1px',
                                    background: '#e2e8f0',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Headers */}
                                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'].map(d => (
                                        <div key={d} style={{
                                            background: '#f8f9fa',
                                            padding: '10px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            color: '#4a5568',
                                            fontSize: '0.85rem'
                                        }}>
                                            {d}
                                        </div>
                                    ))}

                                    {/* Days */}
                                    {getMonthDays().map((day, idx) => {
                                        const hasDuty = !!day.schedule;
                                        const filledPositions = day.schedule ? [
                                            day.schedule.director_on_duty,
                                            day.schedule.port_duty_officer,
                                            day.schedule.office_duty,
                                            day.schedule.finance_planning_duty,
                                            day.schedule.operations_duty,
                                            day.schedule.technical_duty,
                                            day.schedule.atc_duty
                                        ].filter(Boolean).length : 0;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (day.isCurrentMonth || true) { // Allow clicking any visible date
                                                        handleDutyDateClick(day.date, day.schedule);
                                                    }
                                                }}
                                                style={{
                                                    background: day.isToday ? '#e3f2fd' : (day.isCurrentMonth ? 'white' : '#f9fafb'),
                                                    minHeight: '120px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '4px',
                                                    color: day.isCurrentMonth ? 'inherit' : '#a0aec0',
                                                    transition: 'background 0.2s',
                                                    border: day.isToday ? '1px solid #1976d2' : 'none'
                                                }}
                                                className="month-day-cell"
                                            >
                                                <div style={{
                                                    fontWeight: day.isToday ? 'bold' : 'normal',
                                                    color: day.isToday ? '#1976d2' : 'inherit',
                                                    marginBottom: '4px'
                                                }}>
                                                    {day.day}
                                                </div>

                                                {hasDuty ? (
                                                    <>
                                                        {day.schedule.director_on_duty && (
                                                            <div style={{ fontSize: '11px', background: '#eef2ff', color: '#4f46e5', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                GD: {renderDutyEmployees(day.schedule.director_on_duty)}
                                                            </div>
                                                        )}
                                                        {day.schedule.port_duty_officer && (
                                                            <div style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                TB: {renderDutyEmployees(day.schedule.port_duty_officer)}
                                                            </div>
                                                        )}
                                                        {filledPositions > 2 && (
                                                            <div style={{ fontSize: '11px', color: '#64748b', paddingLeft: '4px' }}>
                                                                +{filledPositions - 2} vị trí khác
                                                            </div>
                                                        )}
                                                    </>
                                                ) : day.isCurrentMonth && (
                                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="hover-show-add">
                                                        <i className="fas fa-plus-circle text-muted"></i>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Premium Detail Modal */}
            {
                showDetailModal && selectedEvent && (
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
                                            <i className="fas fa-users mr-2" style={{ width: '20px' }}></i>
                                            <span>
                                                {selectedEvent.resource.data.participants
                                                    ? selectedEvent.resource.data.participants.split(',').map(code => {
                                                        const codeTrimmed = code.trim();
                                                        const emp = eventEmployees.find(e => e.employee_code === codeTrimmed);
                                                        return emp
                                                            ? `${emp.last_name || ''} ${emp.first_name || ''}`.trim()
                                                            : codeTrimmed;
                                                    }).join(', ')
                                                    : 'Chưa cập nhật thành phần tham dự'
                                                }
                                            </span>
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
                            <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {selectedEvent?.resource?.type && selectedEvent.resource.type !== 'BIRTHDAY' && (
                                        <>
                                            <button
                                                className="btn-primary-premium"
                                                onClick={handleEditEvent}
                                                style={{
                                                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                                                    margin: 0
                                                }}
                                            >
                                                <i className="fas fa-edit mr-2"></i> Sửa
                                            </button>
                                            <button
                                                className="btn-secondary-premium"
                                                onClick={handleDeleteEvent}
                                                style={{
                                                    background: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    margin: 0
                                                }}
                                            >
                                                <i className="fas fa-trash mr-2"></i> Xóa
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button className="btn-secondary-premium" onClick={() => setShowDetailModal(false)} style={{ margin: 0 }}>Đóng</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Contact Modal */}
            {
                contactModalData && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 1070, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div className="modal-content-premium" style={{ width: '400px', textAlign: 'center', padding: '30px' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: '#e2e8f0', margin: '0 auto 20px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                border: '4px solid #fff', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                            }}>
                                {contactModalData.avatar_url ? (
                                    <img src={contactModalData.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#718096' }}>
                                        {contactModalData.name.charAt(0)}
                                    </span>
                                )}
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2d3748', marginBottom: '5px' }}>
                                {contactModalData.name}
                            </h3>
                            <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '20px' }}>
                                {contactModalData.position || 'Nhân viên'} - {contactModalData.department || 'Chưa phân loại'}
                            </p>

                            <div style={{
                                background: '#f0fff4', border: '1px solid #c6f6d5',
                                borderRadius: '12px', padding: '15px', marginBottom: '25px'
                            }}>
                                <div style={{ fontSize: '0.85rem', color: '#2f855a', marginBottom: '5px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    Số điện thoại
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#22543d', fontFamily: 'monospace' }}>
                                    {contactModalData.phone}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-secondary-premium"
                                    onClick={() => setContactModalData(null)}
                                    style={{ flex: 1 }}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="btn-primary-premium"
                                    onClick={() => {
                                        navigator.clipboard.writeText(contactModalData.phone);
                                        alert('Đã sao chép số điện thoại!');
                                    }}
                                    style={{ flex: 1, background: '#28a745' }}
                                >
                                    <i className="fas fa-copy mr-2"></i> Sao chép
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Premium Event Modal */}
            {
                showModal && (
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

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label className="form-label-premium"><i className="fas fa-map-marker-alt text-primary"></i> Địa điểm</label>
                                        <input
                                            className="form-control-premium"
                                            value={newEvent.location}
                                            onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                            placeholder="Nhập địa điểm..."
                                        />
                                    </div>
                                </div>

                                {renderParticipantsSelector()}

                                <div className="mb-0">
                                    <label className="form-label-premium"><i className="fas fa-align-left text-muted"></i> Mô tả chi tiết</label>
                                    <textarea
                                        className="form-control-premium"
                                        rows="3"
                                        value={newEvent.description}
                                        onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                        placeholder="Nội dung chi tiết, link họp online..."
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
                )
            }

            {/* Duty Schedule Modal */}
            {
                showDutyModal && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div className="modal-content-premium" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header-premium">
                                <div className="modal-title">
                                    <i className="fas fa-calendar-check"></i>
                                    <span>Thêm/Sửa lịch trực</span>
                                </div>
                                <button className="btn-close-modal" onClick={() => setShowDutyModal(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="modal-body-premium">
                                <div className="mb-4">
                                    <label className="form-label-premium"><i className="far fa-calendar text-primary"></i> Ngày trực <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className="form-control-premium"
                                        value={dutyFormData.duty_date}
                                        onChange={(e) => setDutyFormData({ ...dutyFormData, duty_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <MultiEmployeeSelector
                                            label={<span><i className="fas fa-user-tie text-muted mr-1"></i> Trực Giám đốc</span>}
                                            selectedCodes={dutyFormData.director_on_duty}
                                            onChange={(codes) => setDutyFormData({ ...dutyFormData, director_on_duty: codes })}
                                            employees={getEligibleEmployees('director_on_duty')}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <MultiEmployeeSelector
                                            label={<span><i className="fas fa-user-shield text-muted mr-1"></i> Trực Ban Cảng (đ.c)</span>}
                                            selectedCodes={dutyFormData.port_duty_officer}
                                            onChange={(codes) => setDutyFormData({ ...dutyFormData, port_duty_officer: codes })}
                                            employees={getEligibleEmployees('port_duty_officer')}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <MultiEmployeeSelector
                                            label={<span><i className="fas fa-building text-muted mr-1"></i> VĂN PHÒNG</span>}
                                            selectedCodes={dutyFormData.office_duty}
                                            onChange={(codes) => setDutyFormData({ ...dutyFormData, office_duty: codes })}
                                            employees={getEligibleEmployees('office_duty')}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <MultiEmployeeSelector
                                            label={<span><i className="fas fa-calculator text-muted mr-1"></i> PHÒNG TC-KH</span>}
                                            selectedCodes={dutyFormData.finance_planning_duty}
                                            onChange={(codes) => setDutyFormData({ ...dutyFormData, finance_planning_duty: codes })}
                                            employees={getEligibleEmployees('finance_planning_duty')}
                                        />
                                    </div>
                                </div>

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <MultiEmployeeSelector
                                            label={<span><i className="fas fa-cogs text-muted mr-1"></i> PHÒNG PVMD</span>}
                                            selectedCodes={dutyFormData.operations_duty}
                                            onChange={(codes) => setDutyFormData({ ...dutyFormData, operations_duty: codes })}
                                            employees={getEligibleEmployees('operations_duty')}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <MultiEmployeeSelector
                                            label={<span><i className="fas fa-tools text-muted mr-1"></i> P. KTHT</span>}
                                            selectedCodes={dutyFormData.technical_duty}
                                            onChange={(codes) => setDutyFormData({ ...dutyFormData, technical_duty: codes })}
                                            employees={getEligibleEmployees('technical_duty')}
                                        />
                                    </div>
                                </div>

                                <MultiEmployeeSelector
                                    label={<span><i className="fas fa-plane text-muted mr-1"></i> PHÒNG ĐHSB</span>}
                                    selectedCodes={dutyFormData.atc_duty}
                                    onChange={(codes) => setDutyFormData({ ...dutyFormData, atc_duty: codes })}
                                    employees={getEligibleEmployees('atc_duty')}
                                />
                            </div>
                            <div className="modal-footer-premium">
                                <button className="btn-secondary-premium" onClick={() => setShowDutyModal(false)}>
                                    Đóng
                                </button>
                                <button className="btn-primary-premium" onClick={handleSaveDuty}>
                                    <i className="fas fa-save mr-2"></i> Lưu lịch trực
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
