import { useState } from 'react'
import {
    Area, AreaChart, CartesianGrid,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const disbursementTrend = [
    { month: 'T1', value: 40 }, { month: 'T2', value: 75 },
    { month: 'T3', value: 110 }, { month: 'T4', value: 155 },
    { month: 'T5', value: 195 }, { month: 'T6', value: 230 },
    { month: 'T7', value: 265 }, { month: 'T8', value: 295 },
    { month: 'T9', value: 320 },
]

const projects = [
    { id: 'da1', name: 'Dự án A - Mở rộng sân bay', progress: 85, budget: 200, spent: 170, status: 'Đạt tiến độ', statusColor: 'green' },
    { id: 'da2', name: 'Dự án B - Mua máy bay', progress: 45, budget: 200, spent: 90, status: 'Cần đẩy nhanh', statusColor: 'amber' },
    { id: 'da3', name: 'Dự án C - CNTT', progress: 60, budget: 100, spent: 60, status: 'Đang triển khai', statusColor: 'blue' },
]

const gradientColors = {
    green: 'from-green-400 to-emerald-500',
    amber: 'from-amber-400 to-orange-500',
    blue: 'from-blue-400 to-blue-500',
}

const STATUS_TEXT = {
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
}

const STATUS_BADGE = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
}

function ReportFinance({ showPage }) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState(projects[0])

    const openDrawer = (proj) => { setSelectedProject(proj); setDrawerOpen(true) }

    return (
        <main className="w-full" style={{ padding: '20px 24px 24px 24px' }}>
            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-slate-800">TÀI CHÍNH</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Năm</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                            <option>2026</option><option>2025</option><option>2024</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Kỳ</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                            <option>YTD</option><option>Quý 1</option><option>Quý 2</option><option>Quý 3</option><option>Quý 4</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Nhóm</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                            <option>Tất cả</option><option>Đầu tư</option><option>Mua sắm</option><option>Vận hành</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Dự án</label>
                        <input type="text" placeholder="Tìm dự án..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Chế độ</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                            <option>Theo dự án</option><option>Theo thời gian</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-amber-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Tổng vốn</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">500 tỷ</p>
                    <p className="text-xs text-slate-400 mt-1">VNĐ</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Đã giải ngân</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">320 tỷ</p>
                    <p className="text-xs text-green-500 mt-1">↑ +45 tỷ tháng này</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-slate-400" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Còn lại</p>
                    <p className="text-2xl font-bold text-slate-600 mt-1">180 tỷ</p>
                    <p className="text-xs text-slate-400 mt-1">VNĐ</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-700" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">% Giải ngân</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">64%</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                        <div className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                </div>
            </div>

            {/* Gauge Chart */}
            <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="font-semibold text-slate-800 mb-4">Tiến độ giải ngân tổng thể</h3>
                <div className="flex items-center justify-center">
                    <div className="relative w-64 h-32">
                        <svg viewBox="0 0 200 100" className="w-full h-full">
                            <defs>
                                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#f59e0b' }} />
                                    <stop offset="100%" style={{ stopColor: '#f97316' }} />
                                </linearGradient>
                            </defs>
                            <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
                            <path d="M 20 90 A 80 80 0 0 1 140 25" fill="none" stroke="url(#gauge-gradient)" strokeWidth="16" strokeLinecap="round" />
                        </svg>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                            <p className="text-3xl font-bold text-slate-800">64%</p>
                            <p className="text-xs text-slate-500">Đã giải ngân</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-8 mt-4 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-full"></span><span className="text-slate-600">Ngưỡng mục tiêu: 70%</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span><span className="text-slate-600">Cảnh báo: &lt;50%</span></div>
                </div>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Giải ngân theo dự án</h3>
                    <div className="space-y-4">
                        {projects.map(proj => (
                            <div key={proj.id} className="cursor-pointer hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors" style={{ padding: '16px', margin: '0 -16px' }} onClick={() => openDrawer(proj)}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-800 font-bold max-w-[200px] truncate" title={proj.name}>{proj.name}</span>
                                    <button className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors border border-transparent" style={{ padding: '6px 12px' }}>
                                        Chi tiết <i className="fas fa-chevron-right text-[10px]"></i>
                                    </button>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                                    <div className={`h-full bg-linear-to-r ${gradientColors[proj.statusColor]} rounded-full`} style={{ width: `${proj.progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs items-center">
                                    <span className="text-slate-500 font-medium"><span className="text-slate-700 font-bold">{proj.progress}%</span> ({proj.spent}/{proj.budget} tỷ)</span>
                                    <span className={`${STATUS_TEXT[proj.statusColor]} font-semibold`}>{proj.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Tốc độ giải ngân theo tháng</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={disbursementTrend}>
                            <defs>
                                <linearGradient id="finLineGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v} tỷ`} />
                            <Tooltip formatter={v => `${v} tỷ`} />
                            <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#finLineGrad)" name="Lũy kế" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Drawer */}
            {drawerOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDrawerOpen(false)}></div>}
            <div className={`rpt-drawer fixed right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto ${drawerOpen ? 'open' : ''}`} style={{ top: '150px', height: 'calc(100vh - 150px)' }}>
                {/* Header */}
                <div className="bg-linear-to-r from-amber-500 to-orange-500 text-white" style={{ padding: '20px 24px' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-xs font-medium">Chi tiết dự án</p>
                            <h3 className="text-xl font-bold mt-1 max-w-[280px] truncate" title={selectedProject.name}>{selectedProject.name}</h3>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                            <i className="fas fa-times text-white text-sm"></i>
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-bold text-slate-800">Giải ngân</h4>
                            <span className={`px-2.5 py-1 ${STATUS_BADGE[selectedProject.statusColor]} rounded-full text-xs font-bold`}>{selectedProject.status}</span>
                        </div>

                        {/* Tổng quan giải ngân */}
                        <div className="bg-slate-50 rounded-xl border border-slate-100" style={{ padding: '20px' }}>
                            <div className="flex items-end justify-between mb-2">
                                <div>
                                    <p className="text-2xl font-bold text-slate-800">{selectedProject.spent} / {selectedProject.budget} tỷ</p>
                                </div>
                                <span className="text-lg font-bold text-slate-700">{selectedProject.progress}%</span>
                            </div>
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div className={`h-full bg-linear-to-r ${gradientColors[selectedProject.statusColor]} rounded-full transition-all`} style={{ width: `${selectedProject.progress}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-right">Đã giải ngân / Tổng ngân sách</p>
                        </div>

                        {/* Timeline */}
                        <div className="border-t border-slate-200 pt-5 mt-5">
                            <h4 className="text-sm font-semibold text-slate-700 mb-4">Timeline tiến độ</h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'Đợt 1 - Khởi công', date: '01/2026 - Hoàn thành', color: 'bg-green-500', done: true },
                                    { label: 'Đợt 2 - Xây dựng hạ tầng', date: '03/2026 - Hoàn thành', color: 'bg-green-500', done: true },
                                    { label: 'Đợt 3 - Lắp đặt thiết bị', date: '06/2026 - Đang thực hiện', color: 'bg-amber-500', done: false },
                                    { label: 'Đợt 4 - Nghiệm thu', date: '09/2026 - Chưa bắt đầu', color: 'bg-slate-300', done: false },
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 ${step.color} rounded-full mt-1 shrink-0 ${step.done ? 'ring-4 ring-green-100' : ''}`}></div>
                                            {i < 3 && <div className="w-0.5 h-full bg-slate-100 my-1"></div>}
                                        </div>
                                        <div className="pb-3">
                                            <p className={`text-sm font-semibold ${step.color === 'bg-slate-300' ? 'text-slate-400' : 'text-slate-800'}`}>{step.label}</p>
                                            <p className={`text-xs mt-0.5 ${step.color === 'bg-amber-500' ? 'text-amber-600 font-medium' : 'text-slate-500'}`}>{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3" style={{ marginTop: '32px' }}>
                        <button className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors" style={{ padding: '12px' }}>
                            <i className="fas fa-download text-xs"></i>
                            Tải hồ sơ
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors" style={{ padding: '12px' }}>
                            <i className="fas fa-file-excel text-xs"></i>
                            Xuất Excel
                        </button>
                    </div>

                    {/* Close Button */}
                    <button onClick={() => setDrawerOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors" style={{ marginTop: '12px', padding: '12px' }}>
                        Đóng
                    </button>
                </div>
            </div>
        </main>
    )
}

export default ReportFinance
