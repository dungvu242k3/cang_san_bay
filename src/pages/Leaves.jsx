import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import * as XLSX from 'xlsx'; // Basic export support
import { useAuth } from '../contexts/AuthContext';
import '../pages/Calendar.css'; // Reuse premium modal styles
import { supabase } from '../services/supabase';
import './Leaves.css';

export default function LeavesPage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // UI States
    const [showModal, setShowModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedLeaveId, setSelectedLeaveId] = useState(null);

    const [myProfile, setMyProfile] = useState(null);
    const [isCustomLeaveType, setIsCustomLeaveType] = useState(false);
    const [customLeaveType, setCustomLeaveType] = useState('');

    // Filters
    const [filterStatus, setFilterStatus] = useState('Chờ duyệt'); // Default pending
    const [filterDate, setFilterDate] = useState('');

    // Form State
    const [newRequest, setNewRequest] = useState({
        employee_code: '',
        leave_type: 'Nghỉ phép năm',
        from_date: moment().format('YYYY-MM-DD'),
        to_date: moment().format('YYYY-MM-DD'),
        reason: '',
        note: ''
    });

    const [stats, setStats] = useState({
        total: 12,
        used: 0,
        remaining: 12
    });

    useEffect(() => {
        loadMyProfile();
        fetchEmployees();
    }, [user]);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const loadMyProfile = async () => {
        if (user?.email) {
            const { data } = await supabase.from('employee_profiles').select('*').or(`email_acv.eq.${user.email},email_personal.eq.${user.email}`).maybeSingle();
            if (data) {
                setMyProfile(data);
            }
        }
    };

    // Auto-suggest current user when modal opens
    useEffect(() => {
        if (showModal && myProfile) {
            setNewRequest(prev => ({ ...prev, employee_code: myProfile.employee_code }));
        }
    }, [showModal, myProfile]);

    const fetchEmployees = async () => {
        let query = supabase.from('employee_profiles').select('employee_code, first_name, last_name, department, team');

        // Filter dropdown based on role
        if (user?.role_level === 'DEPT_HEAD' && user.dept_scope) {
            query = query.eq('department', user.dept_scope);
        } else if (user?.role_level === 'TEAM_LEADER' && user.team_scope) {
            query = query.eq('team', user.team_scope);
        } else if (user?.role_level === 'STAFF') {
            query = query.eq('employee_code', user.employee_code);
        }

        const { data } = await query;
        if (data) setEmployees(data);
    };

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // 1. Fetch Leaves with role-based filtering
            let query = supabase.from('employee_leaves').select('*');

            if (user?.role_level === 'DEPT_HEAD' && user.dept_scope) {
                // To filter leaves by department, we might need a join or a subquery. 
                // Since leave table only has employee_code, we use a subquery/join logic or filter after fetching profiles.
                // For simplicity and security, let's fetch profiles in the dept first.
                const { data: deptEmps } = await supabase.from('employee_profiles').select('employee_code').eq('department', user.dept_scope);
                const codes = deptEmps.map(e => e.employee_code);
                query = query.in('employee_code', codes);
            } else if (user?.role_level === 'TEAM_LEADER' && user.team_scope) {
                const { data: teamEmps } = await supabase.from('employee_profiles').select('employee_code').eq('team', user.team_scope);
                const codes = teamEmps.map(e => e.employee_code);
                query = query.in('employee_code', codes);
            } else if (user?.role_level === 'STAFF') {
                query = query.eq('employee_code', user.employee_code);
            }

            const { data: leavesData, error: leavesError } = await query.order('created_at', { ascending: false });

            if (leavesError) throw leavesError;

            // 2. Fetch Profiles for mapping names
            const employeeCodes = [...new Set(leavesData.map(l => l.employee_code))];
            let profilesMap = {};

            if (employeeCodes.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('employee_profiles')
                    .select('employee_code, first_name, last_name')
                    .in('employee_code', employeeCodes);

                if (!profilesError && profilesData) {
                    profilesMap = profilesData.reduce((acc, profile) => {
                        acc[profile.employee_code] = `${profile.last_name || ''} ${profile.first_name || ''}`.trim();
                        return acc;
                    }, {});
                }
            }

            // 3. Map names
            const leavesWithNames = leavesData.map(l => ({
                ...l,
                employee_name: profilesMap[l.employee_code] || 'Không xác định'
            }));

            setLeaves(leavesWithNames || []);

            // Calculate basic stats (mock logic for now)
            if (leavesData) {
                const used = leavesData.filter(l => l.status === 'Đã duyệt').reduce((sum, l) => sum + (l.leave_days || 0), 0);
                setStats(prev => ({ ...prev, used, remaining: prev.total - used }));
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const targetCode = newRequest.employee_code || myProfile?.employee_code;
            if (!targetCode) return alert('Vui lòng chọn nhân viên!');

            const start = moment(newRequest.from_date);
            const end = moment(newRequest.to_date);
            const days = end.diff(start, 'days') + 1;

            if (days <= 0) return alert('Ngày kết thúc phải sau ngày bắt đầu!');

            // Determine Leave Type
            let finalLeaveType = newRequest.leave_type;
            if (newRequest.leave_type === 'Other') {
                if (!customLeaveType.trim()) return alert('Vui lòng nhập loại nghỉ phép!');
                finalLeaveType = customLeaveType.trim();
            }

            const payload = {
                employee_code: targetCode,
                leave_type: finalLeaveType,
                from_date: newRequest.from_date,
                to_date: newRequest.to_date,
                leave_days: days,
                reason: newRequest.reason,
                status: 'Chờ duyệt'
            };

            const { error } = await supabase.from('employee_leaves').insert([payload]);
            if (error) throw error;

            alert('Đã gửi đơn xin nghỉ thành công!');
            setShowModal(false);
            setCustomLeaveType(''); // Reset custom
            setIsCustomLeaveType(false);
            fetchLeaves();
            setNewRequest({ ...newRequest, reason: '', leave_type: 'Nghỉ phép năm' });

        } catch (error) {
            alert('Lỗi tạo đơn: ' + error.message);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Bạn có chắc muốn CHẤP THUẬN đơn này?')) return;
        try {
            const { error } = await supabase.from('employee_leaves').update({ status: 'Đã duyệt' }).eq('id', id);
            if (error) throw error;
            fetchLeaves();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const initiateReject = (id) => {
        setSelectedLeaveId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return alert('Vui lòng nhập lý do từ chối!');
        try {
            const { error } = await supabase.from('employee_leaves')
                .update({
                    status: 'Từ chối',
                    note: rejectReason // Save reason to note or a new column if exists. Using note for now.
                })
                .eq('id', selectedLeaveId);

            if (error) throw error;
            setShowRejectModal(false);
            fetchLeaves();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleExport = () => {
        if (leaves.length === 0) return alert('Không có dữ liệu để xuất!');

        const exportData = leaves.map(l => ({
            'Mã NV': l.employee_code,
            'Họ và tên': l.employee_name,
            'Loại nghỉ': l.leave_type,
            'Từ ngày': moment(l.from_date).format('DD/MM/YYYY'),
            'Đến ngày': moment(l.to_date).format('DD/MM/YYYY'),
            'Số ngày': l.leave_days,
            'Lý do': l.reason,
            'Trạng thái': l.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");
        XLSX.writeFile(workbook, `NghiPhep_${moment().format('YYYYMMDD')}.xlsx`);
    };

    // Filter Logic
    const filteredLeaves = leaves.filter(l => {
        const matchStatus = filterStatus === 'Dauet' ? true : // Special 'All' value?? No, let's use '' for All
            filterStatus ? l.status === filterStatus : true;

        const matchDate = filterDate ? (
            moment(l.from_date).isSame(filterDate, 'day') ||
            moment(l.to_date).isSame(filterDate, 'day')
        ) : true;

        return matchStatus && matchDate;
    });

    // Grouping Logic (Sort by date then Group by Date String)
    const groupedLeaves = {};
    filteredLeaves.forEach(l => {
        const dateKey = moment(l.from_date).format('DD/MM/YYYY');
        if (!groupedLeaves[dateKey]) groupedLeaves[dateKey] = [];
        groupedLeaves[dateKey].push(l);
    });

    const sortedDates = Object.keys(groupedLeaves).sort((a, b) =>
        moment(b, 'DD/MM/YYYY').diff(moment(a, 'DD/MM/YYYY'))
    );


    return (
        <div className="leaves-page-container fade-in p-4">
            {/* Header */}
            <div className="leaves-header">
                <div className="leaves-title">
                    <h2><i className="fas fa-plane-departure"></i> Quản lý Nghỉ phép</h2>
                    <p className="leaves-subtitle">Theo dõi ngày nghỉ và duyệt đơn từ</p>
                </div>
                <div className="header-actions">
                    <button className="btn-export-excel shadow-sm" onClick={handleExport}>
                        <i className="fas fa-file-excel"></i> Xuất Excel
                    </button>
                    <button className="btn-create-leave" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> Tạo đơn nghỉ
                    </button>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="leave-dashboard">
                <div className="leave-card">
                    <div className="leave-card-icon" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="leave-card-info">
                        <h3>{stats.total}</h3>
                        <p>Tổng phép năm</p>
                    </div>
                </div>
                <div className="leave-card">
                    <div className="leave-card-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #d39e00)' }}>
                        <i className="fas fa-business-time"></i>
                    </div>
                    <div className="leave-card-info">
                        <h3>{stats.used}</h3>
                        <p>Đã sử dụng</p>
                    </div>
                </div>
                <div className="leave-card">
                    <div className="leave-card-icon" style={{ background: 'linear-gradient(135deg, #198754, #157347)' }}>
                        <i className="fas fa-umbrella-beach"></i>
                    </div>
                    <div className="leave-card-info">
                        <h3>{stats.remaining}</h3>
                        <p>Còn lại</p>
                    </div>
                </div>
            </div>

            {/* Action Bar & Filters */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="filter-container mb-0">
                    <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="Chờ duyệt">⏳ Chờ duyệt (Mặc định)</option>
                        <option value="Đã duyệt">✅ Đã duyệt</option>
                        <option value="Từ chối">❌ Từ chối</option>
                        <option value="">📋 Tất cả</option>
                    </select>

                    <input
                        type="date"
                        className="filter-date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        placeholder="Lọc theo ngày"
                    />
                </div>
            </div>

            {/* List Table or Mobile Cards */}
            {isMobile ? (
                <div className="mobile-leaves-list">
                    {sortedDates.map(dateKey => (
                        <div key={dateKey} className="mobile-date-group">
                            <div className="mobile-date-header">
                                <i className="far fa-calendar-alt"></i> {dateKey}
                            </div>
                            {groupedLeaves[dateKey].map(leave => (
                                <div key={leave.id} className="mobile-leave-card">
                                    <div className="card-header">
                                        <div className="emp-info">
                                            <span className="emp-code">{leave.employee_code}</span>
                                            <span className="emp-name">{leave.employee_name}</span>
                                        </div>
                                        <span className={`badge-status status-${leave.status.toLowerCase().replace(/ /g, '-')}`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <div className="info-row">
                                            <span className="label">Loại nghỉ:</span>
                                            <span className="value">{leave.leave_type} ({leave.leave_days} ngày)</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Thời gian:</span>
                                            <span className="value">{moment(leave.from_date).format('DD/MM')} - {moment(leave.to_date).format('DD/MM')}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Lý do:</span>
                                            <span className="value">{leave.reason}</span>
                                        </div>
                                    </div>
                                    {leave.status === 'Chờ duyệt' && (
                                        <div className="card-footer">
                                            <button className="btn-mobile-approve" onClick={() => handleApprove(leave.id)}>
                                                <i className="fas fa-check"></i> Duyệt
                                            </button>
                                            <button className="btn-mobile-reject" onClick={() => initiateReject(leave.id)}>
                                                <i className="fas fa-times"></i> Từ chối
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                    {sortedDates.length === 0 && (
                        <div className="text-center p-5 text-muted bg-white rounded-lg shadow-sm">
                            {filterStatus === 'Chờ duyệt' ? 'Không có đơn chờ duyệt nào' : 'Không tìm thấy dữ liệu'}
                        </div>
                    )}
                </div>
            ) : (
                <div className="leaves-table-container">
                    <table className="leaves-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ và tên</th>
                                <th>Loại nghỉ</th>
                                <th>Từ ngày</th>
                                <th>Đến ngày</th>
                                <th>Số ngày</th>
                                <th>Lý do</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedDates.map(dateKey => (
                                <Fragment key={dateKey}>
                                    <tr key={`header-${dateKey}`} className="group-header-row">
                                        <td colSpan="9">
                                            <i className="far fa-calendar-alt mr-2"></i> {dateKey}
                                        </td>
                                    </tr>
                                    {groupedLeaves[dateKey].map(leave => (
                                        <tr key={leave.id}>
                                            <td className="font-weight-bold">{leave.employee_code}</td>
                                            <td style={{ fontWeight: '600', color: '#2d3748' }}>{leave.employee_name}</td>
                                            <td>{leave.leave_type}</td>
                                            <td>{moment(leave.from_date).format('DD/MM/YYYY')}</td>
                                            <td>{moment(leave.to_date).format('DD/MM/YYYY')}</td>
                                            <td>{leave.leave_days}</td>
                                            <td>{leave.reason}</td>
                                            <td>
                                                <span className={`badge-status status-${leave.status.toLowerCase().replace(/ /g, '-')}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td>
                                                {leave.status === 'Chờ duyệt' && (
                                                    <div className="d-flex">
                                                        <button
                                                            className="btn-action-approve"
                                                            title="Duyệt"
                                                            onClick={() => handleApprove(leave.id)}
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        <button
                                                            className="btn-action-reject"
                                                            title="Từ chối"
                                                            onClick={() => initiateReject(leave.id)}
                                                        >
                                                            <i className="fas fa-times"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}

                            {sortedDates.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center p-5 text-muted">
                                        {filterStatus === 'Chờ duyệt' ? 'Không có đơn chờ duyệt nào' : 'Không tìm thấy dữ liệu'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Premium Create Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 1060, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content-premium" style={{ width: '600px' }}>
                        <div className="modal-header-premium">
                            <div className="modal-title">
                                <i className="fas fa-pen-fancy"></i>
                                <span>Tạo đơn xin nghỉ</span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body-premium">
                            <div className="row mb-4">
                                <div className="col-12">
                                    <label className="form-label-premium"><i className="fas fa-user text-info"></i> Nhân viên</label>
                                    <select
                                        className="form-control-premium"
                                        value={newRequest.employee_code}
                                        onChange={e => setNewRequest({ ...newRequest, employee_code: e.target.value })}
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {employees.map(emp => (
                                            <option key={emp.employee_code} value={emp.employee_code}>
                                                {emp.employee_code} - {emp.last_name} {emp.first_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-4">
                                <div className="col-12">
                                    <label className="form-label-premium"><i className="fas fa-tag text-primary"></i> Loại nghỉ phép</label>
                                    <select
                                        className="form-control-premium"
                                        value={newRequest.leave_type}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setNewRequest({ ...newRequest, leave_type: val });
                                            setIsCustomLeaveType(val === 'Other');
                                        }}
                                    >
                                        <option value="Nghỉ phép năm">🏖️ Nghỉ phép năm</option>
                                        <option value="Nghỉ ốm">💊 Nghỉ ốm</option>
                                        <option value="Nghỉ không lương">💸 Nghỉ không lương</option>
                                        <option value="Nghỉ chế độ">👶 Nghỉ chế độ (Thai sản/Cưới hỏi)</option>
                                        <option value="Other">➕ Khác (Nhập thủ công)</option>
                                    </select>
                                    {isCustomLeaveType && (
                                        <input
                                            type="text"
                                            className="form-control-premium mt-2"
                                            placeholder="Nhập loại nghỉ phép..."
                                            value={customLeaveType}
                                            onChange={(e) => setCustomLeaveType(e.target.value)}
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="row mb-4">
                                <div className="col-6">
                                    <label className="form-label-premium"><i className="far fa-calendar-check text-success"></i> Từ ngày</label>
                                    <input
                                        type="date"
                                        className="form-control-premium"
                                        value={newRequest.from_date}
                                        onChange={e => setNewRequest({ ...newRequest, from_date: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label-premium"><i className="far fa-calendar-times text-danger"></i> Đến ngày</label>
                                    <input
                                        type="date"
                                        className="form-control-premium"
                                        value={newRequest.to_date}
                                        onChange={e => setNewRequest({ ...newRequest, to_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="mb-0">
                                <label className="form-label-premium"><i className="fas fa-align-left text-muted"></i> Lý do nghỉ</label>
                                <textarea
                                    className="form-control-premium"
                                    rows="3"
                                    value={newRequest.reason}
                                    onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                                    placeholder="Nhập lý do chi tiết..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer-premium">
                            <button className="btn-secondary-premium" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-primary-premium" onClick={handleCreate}>
                                <i className="fas fa-paper-plane mr-2"></i> Gửi đơn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 1070, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content-premium" style={{ width: '400px' }}>
                        <div className="modal-header-premium bg-danger text-white">
                            <div className="modal-title text-white">
                                <i className="fas fa-exclamation-triangle text-white"></i>
                                <span>Lý do từ chối</span>
                            </div>
                            <button className="btn-close-modal text-white" onClick={() => setShowRejectModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body-premium">
                            <label className="form-label-premium">Vui lòng nhập lý do:</label>
                            <textarea
                                className="form-control-premium"
                                rows="3"
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                placeholder="VD: Không đủ nhân sự..."
                                autoFocus
                            ></textarea>
                        </div>
                        <div className="modal-footer-premium">
                            <button className="btn-secondary-premium" onClick={() => setShowRejectModal(false)}>Hủy</button>
                            <button className="btn btn-danger rounded-pill px-4" onClick={handleReject}>
                                <i className="fas fa-times-circle mr-2"></i> Từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
