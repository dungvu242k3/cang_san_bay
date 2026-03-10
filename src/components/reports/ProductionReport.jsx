import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

// --- Mock Data cho Wireframe ---
const mainChartData = [
    { month: 'Tháng 1', actual: 400, plan: 450, percent: 88 },
    { month: 'Tháng 2', actual: 300, plan: 350, percent: 85 },
    { month: 'Tháng 3', actual: 550, plan: 500, percent: 110 },
    { month: 'Tháng 4', actual: 480, plan: 500, percent: 96 },
    { month: 'Tháng 5', actual: 600, plan: 550, percent: 109 },
    { month: 'Tháng 6', actual: 650, plan: 600, percent: 108 },
];

const yoyData = [
    { month: 'Tháng 1', currentYear: 400, lastYear: 380 },
    { month: 'Tháng 2', currentYear: 300, lastYear: 280 },
    { month: 'Tháng 3', currentYear: 550, lastYear: 500 },
    { month: 'Tháng 4', currentYear: 480, lastYear: 450 },
    { month: 'Tháng 5', currentYear: 600, lastYear: 550 },
    { month: 'Tháng 6', currentYear: 650, lastYear: 600 },
];

const structureData = [
    { month: 'T1', qt: 30, qn: 70 },
    { month: 'T2', qt: 35, qn: 65 },
    { month: 'T3', qt: 40, qn: 60 },
    { month: 'T4', qt: 45, qn: 55 },
    { month: 'T5', qt: 50, qn: 50 },
    { month: 'T6', qt: 55, qn: 45 },
];

const tableData = [
    { month: 'Tháng 1/2026', hk: '400,000', hh: '25,000', qt: '30%', qn: '70%' },
    { month: 'Tháng 2/2026', hk: '300,000', hh: '20,000', qt: '35%', qn: '65%' },
    { month: 'Tháng 3/2026', hk: '550,000', hh: '35,000', qt: '40%', qn: '60%' },
    { month: 'Tháng 4/2026', hk: '480,000', hh: '30,000', qt: '45%', qn: '55%' },
    { month: 'Tháng 5/2026', hk: '600,000', hh: '38,000', qt: '50%', qn: '50%' },
];

function ProductionReport() {
    const [activeTab, setActiveTab] = useState('tong_quan');

    return (
        <div className="production-report space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Filter Bar (Cố định trên cấu trúc module) */}
            <div className="bg-white p-5 md:p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 flex flex-col gap-5 sticky top-4 z-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-4 shadow-md">
                            <i className="fas fa-box-open"></i>
                        </div>
                        SẢN LƯỢNG
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                            <input type="date" defaultValue="2026-01-01" className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none" />
                            <span className="text-slate-400 font-medium">-</span>
                            <input type="date" defaultValue="2026-02-24" className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none" />
                        </div>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        <button className="bg-white border text-slate-600 border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-file-csv text-emerald-600"></i> Download CSV
                        </button>
                        <button className="bg-white border text-slate-600 border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <i className="fas fa-file-image text-indigo-600"></i> Export PNG
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Loại: Hành khách</option>
                        <option>Loại: Hàng hóa</option>
                        <option>Loại: Lượt chuyến</option>
                    </select>

                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Phạm vi: Tất cả</option>
                        <option>Quốc nội</option>
                        <option>Quốc tế</option>
                    </select>

                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Hướng: Đi/Đến/Tổng</option>
                        <option>Quốc nội đi</option>
                        <option>Quốc nội đến</option>
                    </select>

                    <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2 text-slate-700 font-medium outline-none shadow-sm cursor-pointer hover:bg-slate-50">
                        <option>Chế độ: Theo tháng</option>
                        <option>Lũy kế YTD</option>
                        <option>So KH</option>
                        <option>So cùng kỳ</option>
                    </select>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl ml-auto">
                        <button className="bg-white shadow px-3 py-1.5 rounded-lg text-sm font-medium text-slate-800 flex items-center gap-2">
                            <i className="fas fa-chart-column text-blue-600"></i> Biểu đồ
                        </button>
                        <button className="bg-transparent hover:bg-slate-200/50 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 flex items-center gap-2 transition-colors">
                            <i className="fas fa-table text-slate-400"></i> Bảng
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 3.2: KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-blue-500">
                    <p className="text-slate-500 text-sm font-medium mb-1">YTD Thực hiện</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">2.4M</span>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-slate-300">
                    <p className="text-slate-500 text-sm font-medium mb-1">Kế hoạch năm</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">3.0M</span>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-emerald-500">
                    <p className="text-slate-500 text-sm font-medium mb-1">% đạt KH</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">80%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-auto overflow-hidden">
                            <div className="bg-emerald-500 h-full w-[80%] rounded-full"></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col justify-center border-l-4 border-l-purple-500">
                    <p className="text-slate-500 text-sm font-medium mb-1">YoY</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">+6%</span>
                        <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full"><i className="fas fa-arrow-up mr-1"></i>Tăng trưởng</span>
                    </div>
                </div>
            </div>

            {/* Row 3.3: Khu biểu đồ */}
            <div className="space-y-6">
                {/* Chart A - Main */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">Thực hiện theo tháng (Thực tế vs Kế hoạch)</h3>
                        <p className="text-sm text-slate-500 mt-1">Đơn vị: Người</p>
                    </div>
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={mainChartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dx={-10} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dx={10} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                                    formatter={(value, name) => [value, name === 'actual' ? 'Thực tế' : (name === 'plan' ? 'Kế hoạch' : '% Đạt')]}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                <Bar yAxisId="left" dataKey="actual" name="Thực tế" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                <Line yAxisId="left" type="monotone" dataKey="plan" name="Kế hoạch" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="percent" name="% Đạt" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row Chart B + C */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart B */}
                    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Xu hướng YoY</h3>
                            <p className="text-sm text-slate-500 mt-1">So sánh Sản lượng năm nay với năm trước</p>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={yoyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="plainline" />
                                    <Line type="monotone" dataKey="currentYear" name="Năm 2026" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 1 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="lastYear" name="Năm 2025" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 1 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart C */}
                    <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Cơ cấu Quốc tế / Quốc nội</h3>
                            <p className="text-sm text-slate-500 mt-1">Tỷ trọng (%) theo từng tháng</p>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={structureData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="qt" name="Quốc tế (%)" stackId="a" fill="#f59e0b" maxBarSize={40} />
                                    <Bar dataKey="qn" name="Quốc nội (%)" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3.4: Drill-down & bảng chi tiết */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden mt-8">
                {/* Tabs */}
                <div className="border-b border-slate-100 px-6 pt-4 flex gap-6 overflow-x-auto no-scrollbar">
                    {['tong_quan', 'co_cau', 'top_tuyen', 'chi_tiet'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold uppercase tracking-wider relative whitespace-nowrap transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab === 'tong_quan' ? 'Tổng quan' : tab === 'co_cau' ? 'Cơ cấu' : tab === 'top_tuyen' ? 'Top tuyến/điểm' : 'Chi tiết'}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 sticky top-0">
                            <tr>
                                <th className="px-6 md:px-8 py-5 font-semibold tracking-wider">Tháng</th>
                                <th className="px-6 md:px-8 py-5 font-semibold tracking-wider text-right">HK (người)</th>
                                <th className="px-6 md:px-8 py-5 font-semibold tracking-wider text-right">HH (tấn)</th>
                                <th className="px-6 md:px-8 py-5 font-semibold tracking-wider text-center">QT (%)</th>
                                <th className="px-6 md:px-8 py-5 font-semibold tracking-wider text-center">QN (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tableData.map((row) => (
                                <tr key={row.month} className="bg-white hover:bg-blue-50/40 transition-colors cursor-pointer group">
                                    <td className="px-6 md:px-8 py-4 font-semibold text-slate-800 border-l-[3px] border-transparent group-hover:border-blue-500">{row.month}</td>
                                    <td className="px-6 md:px-8 py-4 font-medium text-right text-slate-700">{row.hk}</td>
                                    <td className="px-6 md:px-8 py-4 font-medium text-right text-slate-700">{row.hh}</td>
                                    <td className="px-6 md:px-8 py-4 text-center">
                                        <span className="inline-block bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">{row.qt}</span>
                                    </td>
                                    <td className="px-6 md:px-8 py-4 text-center">
                                        <span className="inline-block bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-bold">{row.qn}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                    <button className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
                        Xem tất cả các tháng <i className="fas fa-chevron-down ml-1 text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductionReport
