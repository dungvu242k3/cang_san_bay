import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// --- Mock Data cho Wireframe ---
const projectData = [
    { name: 'Xây dựng nhà ga T3', actual: 120, plan: 150 },
    { name: 'Mở rộng sân đỗ', actual: 80, plan: 80 },
    { name: 'Nâng cấp đường băng', actual: 45, plan: 50 },
    { name: 'Hệ thống an ninh', actual: 30, plan: 40 },
    { name: 'Cơ sở hạ tầng IT', actual: 25, plan: 30 },
];

const disbursementTrendData = [
    { month: 'T1', value: 20 },
    { month: 'T2', value: 45 },
    { month: 'T3', value: 80 },
    { month: 'T4', value: 130 },
    { month: 'T5', value: 190 },
    { month: 'T6', value: 260 },
    { month: 'T7', value: 320 },
];

// Dữ liệu cho Gauge Chart (sử dụng PieChart hack của Recharts)
const gaugeData = [
    { name: 'Đã giải ngân', value: 64, color: '#10b981' },
    { name: 'Còn lại', value: 36, color: '#f1f5f9' }
];

function FinanceReport() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = (project) => {
        setSelectedProject(project);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedProject(null), 300); // Đợi animation đóng
    };

    return (
        <div className="finance-report space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header & Filter Bar */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 flex flex-col gap-5 sticky top-4 z-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mr-4 shadow-md">
                            <i className="fas fa-wallet"></i>
                        </div>
                        TÀI CHÍNH
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <select className="bg-slate-50 border border-slate-200/60 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none cursor-pointer">
                            <option>Năm: 2026</option>
                            <option>Năm: 2025</option>
                        </select>
                        <select className="bg-slate-50 border border-slate-200/60 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none cursor-pointer">
                            <option>Kỳ: YTD</option>
                            <option>Tháng này</option>
                            <option>Quý này</option>
                        </select>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        <button className="bg-white border text-slate-600 border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-file-csv text-emerald-600"></i> Download CSV
                        </button>
                        <button className="bg-white border text-slate-600 border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-file-image text-indigo-600"></i> Export PNG
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full">
                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Nhóm: Tất cả</option>
                        <option>Đầu tư</option>
                        <option>Mua sắm</option>
                        <option>Vận hành</option>
                    </select>

                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Dự án: Tất cả</option>
                        <option>Xây dựng nhà ga T3</option>
                        <option>Mở rộng sân đỗ</option>
                    </select>

                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
                        <input type="text" placeholder="Search dự án..." className="w-full bg-white border border-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
                    </div>

                    <div className="hidden lg:block w-px h-8 bg-slate-200 mx-2"></div>

                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Chế độ: Theo dự án</option>
                        <option>Theo thời gian</option>
                    </select>

                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50 ml-auto">
                        <option>Hiển thị: Cột ngang</option>
                        <option>Waterfall</option>
                        <option>Line</option>
                    </select>
                </div>
            </div>

            {/* Row 4.2: KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-slate-400">
                    <p className="text-slate-500 text-sm font-medium mb-1">Tổng vốn</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">500 tỷ</span>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-emerald-500">
                    <p className="text-slate-500 text-sm font-medium mb-1">Đã giải ngân</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">320 tỷ</span>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-amber-500">
                    <p className="text-slate-500 text-sm font-medium mb-1">Còn lại</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">180 tỷ</span>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-blue-500">
                    <p className="text-slate-500 text-sm font-medium mb-1">% giải ngân</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">64%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-auto overflow-hidden">
                            <div className="bg-blue-500 h-full w-[64%] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4.3: Khu biểu đồ */}
            <div className="space-y-6">
                {/* Chart A - Main (Gauge) */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 w-full">
                        <h3 className="text-lg font-bold text-slate-800">Tiến độ Giải ngân Tổng thể YTD</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-6">Trạng thái: <span className="text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded">Đạt tiến độ</span></p>

                        <div className="space-y-5">
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-slate-500">Ngưỡng cảnh báo rủi ro chậm tiến độ: <strong className="text-amber-500">&lt; 50%</strong></span>
                                <span className="text-emerald-600">Hiện tại: 64%</span>
                            </div>
                            <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '64%' }}></div>
                                <div className="absolute top-0 left-[50%] h-full w-0.5 bg-amber-500 z-10" title="Ngưỡng cảnh báo"></div>
                            </div>
                            <div className="flex justify-between text-xs font-semibold text-slate-400">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 h-[250px] relative flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={gaugeData}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius="75%"
                                    outerRadius="100%"
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {gaugeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-4 text-center w-full flex flex-col">
                            <span className="text-4xl font-extrabold text-slate-800">64<span className="text-2xl">%</span></span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Đã giải ngân</span>
                        </div>
                    </div>
                </div>

                {/* Row Chart B + C */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart B: Bar theo dự án */}
                    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8 flex flex-col">
                        <div className="mb-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Giải ngân theo dự án (Tỷ VNĐ)</h3>
                                <p className="text-sm text-slate-500 mt-1">Thực tế vs Kế hoạch</p>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} width={140} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                                    <Bar dataKey="plan" name="Kế hoạch" fill="#cbd5e1" radius={[0, 4, 4, 0]} maxBarSize={15} onClick={(data) => openDrawer(data?.payload || data)} style={{ cursor: 'pointer' }} />
                                    <Bar dataKey="actual" name="Thực tế" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={15} onClick={(data) => openDrawer(data?.payload || data)} style={{ cursor: 'pointer' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            <button className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors" onClick={() => openDrawer({ name: 'Tất cả dự án' })}>
                                Xem chi tiết tất cả dự án <i className="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>

                    {/* Chart C: Line giải ngân theo tháng */}
                    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Tốc độ giải ngân (Lũy kế - Tỷ VNĐ)</h3>
                            <p className="text-sm text-slate-500 mt-1">Năm 2026</p>
                        </div>
                        <div className="h-[280px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={disbursementTrendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="value" name="Giá trị Lũy kế" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, fill: '#10b981', stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4.4 Drill-down dự án (drawer bên phải) */}
            {/* Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity backdrop-blur-sm"
                    onClick={closeDrawer}
                ></div>
            )}

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md md:max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Drawer Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
                            <i className="fas fa-building"></i> Đầu tư
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{selectedProject?.name || 'Chi tiết dự án'}</h3>
                        <p className="text-sm text-slate-500 mt-1">Mã DA: INV-2026-001</p>
                    </div>
                    <button
                        onClick={closeDrawer}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {/* KPI Mini */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Ngân sách (KH)</p>
                            <p className="text-xl font-bold text-slate-800">150 Tỷ</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                            <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">Đã thực hiện</p>
                            <p className="text-xl font-bold text-emerald-700">120 Tỷ</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                            <span className="text-slate-700">Tiến độ giải ngân</span>
                            <span className="text-emerald-600">80%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full w-[80%]"></div>
                        </div>
                    </div>

                    <hr className="border-slate-100 border-dashed" />

                    {/* Timeline */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Timeline Thực hiện</h4>
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                            <div className="relative pl-6">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"></span>
                                <p className="text-xs font-bold text-emerald-600 mb-0.5">Tháng 1/2026</p>
                                <p className="text-sm font-semibold text-slate-800">Khởi công & Tạm ứng đợt 1</p>
                                <p className="text-sm text-slate-500 mt-1">30 Tỷ VNĐ</p>
                            </div>
                            <div className="relative pl-6">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500"></span>
                                <p className="text-xs font-bold text-emerald-600 mb-0.5">Tháng 3/2026</p>
                                <p className="text-sm font-semibold text-slate-800">Nghiệm thu GĐ 1</p>
                                <p className="text-sm text-slate-500 mt-1">50 Tỷ VNĐ</p>
                            </div>
                            <div className="relative pl-6">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-500"></span>
                                <p className="text-xs font-bold text-blue-600 mb-0.5">Tháng 6/2026</p>
                                <p className="text-sm font-semibold text-slate-800">Nghiệm thu GĐ 2 (Dự kiến)</p>
                                <p className="text-sm text-slate-500 mt-1">40 Tỷ VNĐ</p>
                            </div>
                            <div className="relative pl-6">
                                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white bg-slate-300"></span>
                                <p className="text-xs font-bold text-slate-400 mb-0.5">Tháng 12/2026</p>
                                <p className="text-sm font-semibold text-slate-400">Quyết toán hoàn thành</p>
                                <p className="text-sm text-slate-400 mt-1">30 Tỷ VNĐ</p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 border-dashed" />

                    {/* Danh sách đợt thanh toán */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex justify-between items-center">
                            Danh sách chứng từ
                            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">2 records</span>
                        </h4>
                        <div className="space-y-3">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-emerald-300 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <i className="fas fa-file-invoice-dollar"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">UNC-001/2026</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Tạm ứng đợt 1 • 15/01/2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">30.0 Tỷ</p>
                                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">Đã duyệt</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-emerald-300 cursor-pointer transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <i className="fas fa-file-invoice-dollar"></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">UNC-089/2026</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Thanh toán GĐ 1 • 10/03/2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-800">50.0 Tỷ</p>
                                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">Đã duyệt</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="bg-white p-5 border-t border-slate-200 grid grid-cols-2 gap-3">
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                        <i className="fas fa-file-excel text-emerald-600"></i> Xuất Excel
                    </button>
                    <button className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2">
                        <i className="fas fa-cloud-download-alt"></i> Tải hồ sơ
                    </button>
                </div>
            </div>
        </div >
    )
}

export default FinanceReport
