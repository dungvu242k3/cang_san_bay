import moment from 'moment';
import { useEffect, useState } from 'react';
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
    const [showModal, setShowModal] = useState(false);
    const [myProfile, setMyProfile] = useState(null);

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
                if (!newRequest.employee_code) {
                    setNewRequest(prev => ({ ...prev, employee_code: data.employee_code }));
                }
            }
        }
    };

    const fetchEmployees = async () => {
        const { data } = await supabase.from('employee_profiles').select('employee_code, first_name, last_name');
        if (data) setEmployees(data);
    };

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // 1. Fetch Leaves
            const { data: leavesData, error: leavesError } = await supabase
                .from('employee_leaves')
                .select('*')
                .order('created_at', { ascending: false });

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
            // Allow selecting employee if Admin/No profile, or default to selected
            const targetCode = newRequest.employee_code || myProfile?.employee_code;

            if (!targetCode) return alert('Vui lòng chọn nhân viên!');

            // Calculate days
            const start = moment(newRequest.from_date);
            const end = moment(newRequest.to_date);
            const days = end.diff(start, 'days') + 1;

            if (days <= 0) return alert('Ngày kết thúc phải sau ngày bắt đầu!');

            const payload = {
                employee_code: targetCode,
                leave_type: newRequest.leave_type,
                from_date: newRequest.from_date,
                to_date: newRequest.to_date,
                leave_days: days,
                reason: newRequest.reason,
                status: 'Chờ duyệt' // Default
            };

            const { error } = await supabase.from('employee_leaves').insert([payload]);
            if (error) throw error;

            alert('Đã gửi đơn xin nghỉ thành công!');
            setShowModal(false);
            fetchLeaves();
            // Reset form
            setNewRequest({ ...newRequest, reason: '' });

        } catch (error) {
            alert('Lỗi tạo đơn: ' + error.message);
        }
    };

    const handleExport = () => {
        if (leaves.length === 0) return alert('Không có dữ liệu để xuất!');

        // Prepare export data
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

        // Generate buffer
        XLSX.writeFile(workbook, `NghiPhep_${moment().format('YYYYMMDD')}.xlsx`);
    };

    return (
        <div className="leaves-page-container fade-in p-4">
            {/* Premium Header */}
            <div className="leaves-header">
                <div className="leaves-title">
                    <h2>
                        <i className="fas fa-plane-departure"></i> Quản lý Nghỉ phép
                    </h2>
                    <p className="leaves-subtitle">Theo dõi ngày nghỉ và duyệt đơn từ</p>
                </div>
                <button className="btn-create-leave" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus"></i> Tạo đơn nghỉ
                </button>
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

            {/* Action Bar */}
            <div className="d-flex justify-content-end mb-3">
                <button className="btn-export-excel shadow-sm" onClick={handleExport}>
                    <i className="fas fa-file-excel"></i> Xuất Excel
                </button>
            </div>

            {/* List Table */}
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
                        </tr>
                    </thead>
                    <tbody>
                        {leaves.map(leave => (
                            <tr key={leave.id}>
                                <td className="font-weight-bold">{leave.employee_code}</td>
                                <td style={{ fontWeight: '600', color: '#2d3748' }}>{leave.employee_name}</td>
                                <td>{leave.leave_type}</td>
                                <td>{moment(leave.from_date).format('DD/MM/YYYY')}</td>
                                <td>{moment(leave.to_date).format('DD/MM/YYYY')}</td>
                                <td>{leave.leave_days}</td>
                                <td>{leave.reason}</td>
                                <td>
                                    <span className={`badge-status status-${leave.status === 'Đã duyệt' ? 'approved' : leave.status === 'Từ chối' ? 'rejected' : 'pending'}`}>
                                        {leave.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {leaves.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center p-5 text-muted">Chưa có dữ liệu nghỉ phép</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                                        onChange={e => setNewRequest({ ...newRequest, leave_type: e.target.value })}
                                    >
                                        <option value="Nghỉ phép năm">🏖️ Nghỉ phép năm</option>
                                        <option value="Nghỉ ốm">u002795; Nghỉ ốm</option>
                                        <option value="Nghỉ không lương">💸 Nghỉ không lương</option>
                                        <option value="Nghỉ chế độ">👶 Nghỉ chế độ (Thai sản/Cưới hỏi)</option>
                                    </select>
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
        </div>
    );
}
