import { useState } from 'react'
import {
    Area, AreaChart,
    Bar, BarChart,
    CartesianGrid,
    Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const monthlyData = [
    { month: 'T1', actual: 260, plan: 300 },
    { month: 'T2', actual: 300, plan: 300 },
    { month: 'T3', actual: 240, plan: 300 },
    { month: 'T4', actual: 270, plan: 290 },
    { month: 'T5', actual: 320, plan: 280 },
    { month: 'T6', actual: 340, plan: 270 },
    { month: 'T7', actual: 310, plan: 270 },
    { month: 'T8', actual: 280, plan: 280 },
    { month: 'T9', actual: 250, plan: 290 },
    { month: 'T10', actual: 220, plan: 300 },
    { month: 'T11', actual: 200, plan: 310 },
    { month: 'T12', actual: 180, plan: 320 },
]

const yoyData = [
    { month: 'T1', y2026: 260, y2025: 220 },
    { month: 'T2', y2026: 300, y2025: 240 },
    { month: 'T3', y2026: 240, y2025: 230 },
    { month: 'T4', y2026: 270, y2025: 250 },
    { month: 'T5', y2026: 320, y2025: 260 },
    { month: 'T6', y2026: 340, y2025: 280 },
    { month: 'T7', y2026: 310, y2025: 290 },
    { month: 'T8', y2026: 280, y2025: 270 },
    { month: 'T9', y2026: 250, y2025: 250 },
]

const structureData = [
    { month: 'T1', quocTe: 150, quocNoi: 110 },
    { month: 'T2', quocTe: 180, quocNoi: 120 },
    { month: 'T3', quocTe: 135, quocNoi: 105 },
    { month: 'T4', quocTe: 160, quocNoi: 110 },
    { month: 'T5', quocTe: 195, quocNoi: 125 },
    { month: 'T6', quocTe: 205, quocNoi: 135 },
    { month: 'T7', quocTe: 185, quocNoi: 125 },
]

const tableData = [
    { month: 'Tháng 1', hk: '260,000', hh: '1,250', qt: '58%', qn: '42%', kh: 87, color: 'amber' },
    { month: 'Tháng 2', hk: '300,000', hh: '1,480', qt: '60%', qn: '40%', kh: 100, color: 'green' },
    { month: 'Tháng 3', hk: '240,000', hh: '1,100', qt: '55%', qn: '45%', kh: 80, color: 'amber' },
]

function ReportProduction({ showPage }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerMonth, setDrawerMonth] = useState('')

    const openDrawer = (month) => { setDrawerMonth(month); setDrawerOpen(true) }

    return (
        <main className="w-full" style={{ padding: '20px 24px 24px 24px' }}>
            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-bold text-slate-800">SẢN LƯỢNG</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Từ ngày</label>
                        <input type="date" defaultValue="2026-01-01" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Đến ngày</label>
                        <input type="date" defaultValue="2026-02-24" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Loại</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option>Hành khách</option><option>Hàng hóa</option><option>Lượt chuyến</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Phạm vi</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option>Tất cả</option><option>Quốc nội</option><option>Quốc tế</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Hướng</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option>Tổng</option><option>Đi</option><option>Đến</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Chế độ</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                            <option>Theo tháng</option><option>Theo quý</option><option>Theo năm</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">YTD Thực hiện</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">2.4M</p>
                    <p className="text-xs text-slate-400 mt-1">người</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Kế hoạch năm</p>
                    <p className="text-2xl font-bold text-slate-700 mt-1">3.0M</p>
                    <p className="text-xs text-slate-400 mt-1">người</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">% Đạt kế hoạch</p>
                    <p className="text-2xl font-bold text-amber-500 mt-1">80%</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">So cùng kỳ (YoY)</p>
                    <p className="text-2xl font-bold text-green-500 mt-1">+6%</p>
                    <p className="text-xs text-green-600 mt-1">↑ Tăng trưởng</p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px', marginBottom: '24px' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Biểu đồ sản lượng theo tháng</h3>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded"></span><span className="text-slate-600">Thực hiện</span></span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 bg-slate-300 rounded"></span><span className="text-slate-600">Kế hoạch</span></span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v}K`} />
                        <Tooltip formatter={(v) => `${v}K`} />
                        <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Thực hiện" />
                        <Bar dataKey="plan" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Kế hoạch" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Xu hướng YoY</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={yoyData}>
                            <defs>
                                <linearGradient id="yoy2026" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="yoy2025" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v) => `${v}K`} />
                            <Legend />
                            <Area type="monotone" dataKey="y2026" stroke="#3b82f6" fillOpacity={1} fill="url(#yoy2026)" name="2026" strokeWidth={2.5} />
                            <Area type="monotone" dataKey="y2025" stroke="#94a3b8" fillOpacity={1} fill="url(#yoy2025)" name="2025" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Cơ cấu Quốc tế / Quốc nội</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={structureData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(v) => `${v}K`} />
                            <Legend />
                            <Bar dataKey="quocTe" stackId="a" fill="#3b82f6" name="Quốc tế" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="quocNoi" stackId="a" fill="#93c5fd" name="Quốc nội" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tabs & Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-200">
                    {[['overview', 'Tổng quan'], ['structure', 'Cơ cấu'], ['top-routes', 'Top tuyến/điểm'], ['details', 'Chi tiết']].map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'rpt-tab-active' : 'text-slate-600 hover:text-blue-700 border-transparent'}`}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tháng</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">HK (người)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">HH (tấn)</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Quốc tế</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Quốc nội</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">% KH</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Xem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tableData.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 cursor-pointer" onClick={() => openDrawer(row.month)}>
                                    <td className="px-6 py-4 font-medium text-slate-800">{row.month}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{row.hk}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{row.hh}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{row.qt}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">{row.qn}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{row.kh}%</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openDrawer(row.month)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                            <i className="fas fa-eye text-[10px]"></i>
                                            Xem
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Drawer */}
            {drawerOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDrawerOpen(false)}></div>}
            <div className={`rpt-drawer fixed right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto ${drawerOpen ? 'open' : ''}`} style={{ top: '150px', height: 'calc(100vh - 150px)' }}>
                {/* Header */}
                <div className="bg-linear-to-r from-blue-700 to-indigo-600 text-white" style={{ padding: '20px 24px' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-200 text-xs font-medium">Chi tiết sản lượng</p>
                            <h3 className="text-xl font-bold mt-1">{drawerMonth}</h3>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors">
                            <i className="fas fa-times text-white text-sm"></i>
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="space-y-5">
                        {/* Tổng hành khách */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100" style={{ padding: '20px' }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Tổng hành khách</p>
                                    <p className="text-3xl font-bold text-slate-800 mt-1">260,000</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <i className="fas fa-users text-blue-600 text-lg"></i>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full text-xs font-medium" style={{ padding: '3px 10px' }}>
                                    <i className="fas fa-arrow-up text-[9px]"></i> 5%
                                </span>
                                <span className="text-xs text-slate-400">so với cùng kỳ</span>
                            </div>
                        </div>

                        {/* Quốc tế / Quốc nội */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-slate-200" style={{ padding: '16px' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-plane text-blue-600 text-xs"></i>
                                    </div>
                                    <p className="text-xs text-blue-600 font-semibold">Quốc tế</p>
                                </div>
                                <p className="text-xl font-bold text-slate-800">150,800</p>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '58%' }}></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">58% tổng</p>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200" style={{ padding: '16px' }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-plane text-green-600 text-xs"></i>
                                    </div>
                                    <p className="text-xs text-green-600 font-semibold">Quốc nội</p>
                                </div>
                                <p className="text-xl font-bold text-slate-800">109,200</p>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '42%' }}></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">42% tổng</p>
                            </div>
                        </div>

                        {/* % Kế hoạch */}
                        <div className="bg-white rounded-xl border border-slate-200" style={{ padding: '16px' }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-slate-500 font-medium">Đạt kế hoạch</p>
                                <span className="text-sm font-bold text-amber-600">87%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full">
                                <div className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: '87%' }}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">260,000 / 300,000 người</p>
                        </div>

                        {/* Top tuyến bay */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Top tuyến bay</h4>
                            <div className="space-y-2">
                                {[
                                    ['SGN - HAN', '42,500', '1'],
                                    ['HAN - DAD', '28,300', '2'],
                                    ['SGN - ICN', '22,100', '3']
                                ].map(([route, val, rank]) => (
                                    <div key={route} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors" style={{ padding: '12px 16px' }}>
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${rank === '1' ? 'bg-amber-500' : rank === '2' ? 'bg-slate-400' : 'bg-orange-400'}`}>
                                                {rank}
                                            </span>
                                            <span className="text-sm font-medium text-slate-700">{route}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-800">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button onClick={() => setDrawerOpen(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-colors" style={{ marginTop: '24px', padding: '12px' }}>
                        Đóng
                    </button>
                </div>
            </div>
        </main>
    )
}

export default ReportProduction
