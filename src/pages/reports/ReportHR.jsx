import { useState } from 'react'
import {
    Bar, BarChart, CartesianGrid, Cell,
    Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const deptData = [
    { name: 'Văn phòng', value: 85, fill: '#10b981' },
    { name: 'TCKH', value: 70, fill: '#3b82f6' },
    { name: 'Phục vụ MD', value: 85, fill: '#8b5cf6' },
    { name: 'Kỹ thuật', value: 75, fill: '#f59e0b' },
    { name: 'Điều hành', value: 65, fill: '#ec4899' },
]

const ageData = [
    { name: 'Dưới 30', value: 105, fill: '#10b981' },
    { name: '30-40', value: 122, fill: '#3b82f6' },
    { name: '41-50', value: 77, fill: '#f59e0b' },
    { name: 'Trên 50', value: 46, fill: '#ef4444' },
]

const certRows = [
    { stt: 1, name: 'Nguyễn Văn A', dept: 'Kỹ thuật', cert: 'ATPL', date: '15/03/2026', status: 'Quá hạn', color: 'red' },
    { stt: 2, name: 'Trần Thị B', dept: 'Phục vụ MD', cert: 'Tay nghề', date: '20/04/2026', status: '60 ngày', color: 'yellow' },
    { stt: 3, name: 'Phạm Văn C', dept: 'Điều hành', cert: 'Quản lý', date: '10/05/2026', status: '75 ngày', color: 'yellow' },
]

const salaryRows = [
    { stt: 1, name: 'Lê Văn D', dept: 'Văn phòng', grade: 'Bậc 4', date: '01/03/2026', status: 'Chuẩn bị', color: 'green' },
    { stt: 2, name: 'Hoàng Thị E', dept: 'TCKH', grade: 'Bậc 3', date: '15/03/2026', status: 'Chuẩn bị', color: 'green' },
    { stt: 3, name: 'Đặng Văn F', dept: 'Phục vụ MD', grade: 'Bậc 5', date: '01/04/2026', status: 'Chờ duyệt', color: 'blue' },
]

const retireRows = [
    { stt: 1, name: 'Vũ Văn G', dept: 'Kỹ thuật', dob: '1962', date: '15/06/2026', remain: '4 tháng', color: 'red' },
    { stt: 2, name: 'Bùi Thị H', dept: 'Văn phòng', dob: '1965', date: '01/09/2026', remain: '7 tháng', color: 'yellow' },
    { stt: 3, name: 'Đinh Văn I', dept: 'Điều hành', dob: '1964', date: '20/11/2026', remain: '9 tháng', color: 'yellow' },
]

const leaveRows = [
    { stt: 1, name: 'Phan Văn K', dept: 'Phục vụ MD', type: 'Nghỉ phép', typeColor: 'blue', from: '20/02/2026', to: '28/02/2026' },
    { stt: 2, name: 'Chu Thị L', dept: 'TCKH', type: 'Thai sản', typeColor: 'pink', from: '01/01/2026', to: '15/05/2026' },
    { stt: 3, name: 'Tô Văn M', dept: 'Kỹ thuật', type: 'Nghỉ phép', typeColor: 'blue', from: '24/02/2026', to: '01/03/2026' },
]

const BADGE_CLASSES = {
    red: 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700',
    yellow: 'px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700',
    green: 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700',
    blue: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
    pink: 'px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700',
    amber: 'px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
}

function ReportHR({ showPage }) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)

    const openDrawer = (emp) => {
        setSelectedEmployee(emp)
        setDrawerOpen(true)
    }

    return (
        <main className="w-full" style={{ padding: '20px 24px 24px 24px' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-users text-green-600"></i> NHÂN SỰ
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Cảng HKQT Cát Bi</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Kỳ báo cáo</label>
                        <input type="month" defaultValue="2026-02" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Phòng ban</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20">
                            <option>Tất cả phòng ban</option><option>Văn phòng</option><option>Tài chính kế hoạch</option>
                            <option>Phục vụ mặt đất</option><option>Kỹ thuật hạ tầng</option><option>Điều hành sân bay</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Lọc</button>
                        <button className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Xuất Excel</button>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Tổng nhân sự</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">350</p>
                    <p className="text-xs text-green-500 mt-1">người</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Đang nghỉ phép</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
                    <p className="text-xs text-blue-500 mt-1">3.4% tổng số</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-pink-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Đang nghỉ thai sản</p>
                    <p className="text-3xl font-bold text-pink-600 mt-2">5</p>
                    <p className="text-xs text-pink-500 mt-1">1.4% tổng số</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-amber-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Sắp về hưu</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">8</p>
                    <p className="text-xs text-amber-500 mt-1">12 tháng tới</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Nhân sự theo phòng ban</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={deptData} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Số người">
                                {deptData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Cơ cấu theo độ tuổi</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={ageData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {ageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                {/* Certificate Expiry */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Sắp gia hạn chứng chỉ</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Trong 90 ngày</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Chứng chỉ</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Hạn</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {certRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.cert}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                                        <td className="px-4 py-3 text-center"><span className={BADGE_CLASSES[r.color]}>{r.status}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openDrawer(r)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                                <i className="fas fa-eye text-[10px]"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Salary Increase */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Sắp nâng bậc lương</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Trong quý này</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Bậc hiện tại</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ngày nâng</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salaryRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.grade}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                                        <td className="px-4 py-3 text-center"><span className={BADGE_CLASSES[r.color]}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tables Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retirement */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Sắp về hưu</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Trong 12 tháng</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Năm sinh</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Dự kiến hưu</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Còn lại</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {retireRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dob}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                                        <td className="px-4 py-3 text-center"><span className={BADGE_CLASSES[r.color]}>{r.remain}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openDrawer(r)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                                <i className="fas fa-eye text-[10px]"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Current Leave */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Danh sách nghỉ hiện tại</h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">NPhép: 12</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">TSản: 5</span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Loại nghỉ</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Từ ngày</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Đến ngày</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaveRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3"><span className={BADGE_CLASSES[r.typeColor]}>{r.type}</span></td>
                                        <td className="px-4 py-3 text-slate-600">{r.from}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.to}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openDrawer(r)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                                <i className="fas fa-eye text-[10px]"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Employee Details Drawer */}
            {drawerOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDrawerOpen(false)}></div>}
            <div className={`rpt-drawer fixed right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto ${drawerOpen ? 'open' : ''}`} style={{ top: '150px', height: 'calc(100vh - 150px)' }}>
                {/* Header */}
                <div className="bg-linear-to-r from-teal-600 to-green-600 text-white" style={{ padding: '20px 24px' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-md">
                                {selectedEmployee?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold max-w-[220px] truncate" title={selectedEmployee?.name}>{selectedEmployee?.name}</h3>
                                <p className="text-green-100 text-sm mt-0.5">{selectedEmployee?.dept}</p>
                            </div>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                            <i className="fas fa-times text-white text-sm"></i>
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="space-y-6">
                        {/* Status Highlights */}
                        {selectedEmployee?.status && (
                            <div className="bg-amber-50 rounded-xl border border-amber-100" style={{ padding: '16px' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-slate-800">Trạng thái đáng chú ý</p>
                                    <span className={BADGE_CLASSES[selectedEmployee.color] || BADGE_CLASSES.amber}>{selectedEmployee.status}</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {selectedEmployee.cert ? `Chứng chỉ ${selectedEmployee.cert} sắp hết hạn vào ngày ${selectedEmployee.date}.` : 
                                     selectedEmployee.grade ? `Dự kiến nâng lên ${selectedEmployee.grade} vào ngày ${selectedEmployee.date}.` : ''}
                                </p>
                            </div>
                        )}
                        {selectedEmployee?.remain && (
                            <div className="bg-red-50 rounded-xl border border-red-100" style={{ padding: '16px' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-slate-800">Sắp nghỉ hưu</p>
                                    <span className={BADGE_CLASSES[selectedEmployee.color] || BADGE_CLASSES.red}>{selectedEmployee.remain}</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Dự kiến nghỉ hưu vào ngày {selectedEmployee.date}.
                                </p>
                            </div>
                        )}
                        {selectedEmployee?.type && (
                            <div className="bg-blue-50 rounded-xl border border-blue-100" style={{ padding: '16px' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-slate-800">Đang trong kỳ nghỉ</p>
                                    <span className={BADGE_CLASSES[selectedEmployee.typeColor] || BADGE_CLASSES.blue}>{selectedEmployee.type}</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Thời gian: <span className="font-medium text-slate-800">{selectedEmployee.from}</span> đến <span className="font-medium text-slate-800">{selectedEmployee.to}</span>.
                                </p>
                            </div>
                        )}

                        {/* Employee Information */}
                        <div className="border-t border-slate-200 pt-5 mt-5">
                            <h4 className="text-sm font-semibold text-slate-700 mb-4">Thông tin nhân sự</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Mã NV</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">NV{String(selectedEmployee?.stt || Math.floor(Math.random() * 1000)).padStart(4, '0')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Chức vụ</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">Chuyên viên</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Số điện thoại</p>
                                        <p className="text-sm font-semibold text-blue-600 mt-0.5">090* *** ***</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Email</p>
                                        <p className="text-sm font-semibold text-blue-600 mt-0.5 text-truncate">nv*@cangcatbi.vn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3" style={{ marginTop: '32px' }}>
                        <button className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors" style={{ padding: '12px' }}>
                            <i className="fas fa-id-card text-xs"></i>
                            Mở hồ sơ
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors" style={{ padding: '12px' }}>
                            <i className="fas fa-comment-dots text-xs"></i>
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ReportHR
