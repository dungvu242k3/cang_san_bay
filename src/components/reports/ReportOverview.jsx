import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

const MiniatureAreaChart = ({ data, dataKey, color }) => (
    <div className="h-16 w-full mt-4 flex items-center justify-center">
        {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }} content={() => null} />
                    <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color${dataKey})`} />
                </AreaChart>
            </ResponsiveContainer>
        ) : (
            <span className="text-gray-300 text-xs">Chưa có dữ liệu</span>
        )}
    </div>
)

const MiniatureBarChart = ({ data, dataKey, color }) => (
    <div className="h-16 w-full mt-4 flex items-center justify-center">
        {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={() => null} />
                    <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <span className="text-gray-300 text-xs">Chưa có dữ liệu</span>
        )}
    </div>
)

const MiniaturePieChart = ({ data }) => (
    <div className="h-16 w-full mt-4 flex items-center justify-center">
        {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={15}
                        outerRadius={30}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={() => null} />
                </PieChart>
            </ResponsiveContainer>
        ) : (
            <span className="text-gray-300 text-xs">Chưa có dữ liệu</span>
        )}
    </div>
)

function ReportOverview({ onNavigate }) {
    // Empty stats for now (placeholder for real data integration later)
    const [miniData, setMiniData] = useState({
        production: [],
        finance: [],
        hr: []
    });

    return (
        <div className="report-overview animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section with Dropdowns */}
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 hidden sm:block">Tổng quan</h2>
                    <div className="flex items-center gap-3">
                        <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                            <option>Năm: 2026</option>
                            <option>Năm: 2025</option>
                            <option>Năm: 2024</option>
                        </select>
                        <select className="bg-white border border-slate-200 text-sm rounded-xl px-4 py-2.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                            <option>Khoảng thời gian: YTD</option>
                            <option>Tháng này</option>
                            <option>Quý này</option>
                        </select>
                    </div>
                </div>
                <button className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_12px_-2px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_16px_-2px_rgba(79,70,229,0.4)] transform hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-blue-200 border-none flex items-center w-full sm:w-auto justify-center">
                    <i className="fas fa-download mr-2"></i> Tải báo cáo
                </button>
            </div>

            {/* Row KPI mini */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                    <p className="text-slate-500 text-sm font-medium mb-1">Hành khách</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">2.4M</span>
                        <span className="text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">80% KH</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                    <p className="text-slate-500 text-sm font-medium mb-1">Giải ngân</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">320tỷ</span>
                        <span className="text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">64%</span>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center">
                    <p className="text-slate-500 text-sm font-medium mb-1">Tổng nhân sự</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">350</span>
                        <span className="text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">+5</span>
                    </div>
                </div>
            </div>

            {/* 3 Cards điều hướng */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">

                {/* Production Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100/90 p-7 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-blue-200 cursor-pointer group relative overflow-hidden h-full"
                    onClick={() => onNavigate('production')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-blue-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <i className="fas fa-box-open text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Sản Lượng</h3>
                    </div>

                    <div className="space-y-3.5 mb-6 relative z-10 flex-1">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Hành khách</span>
                            <span className="font-semibold text-slate-800">2.4M</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Hàng hóa (Tấn)</span>
                            <span className="font-semibold text-slate-800">150,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">% Kế hoạch</span>
                            <span className="font-semibold text-emerald-600">80%</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <MiniatureAreaChart data={miniData.production} dataKey="value" color="#3b82f6" />
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center text-sm font-semibold text-blue-600 relative z-10">
                        <span>Truy cập báo cáo</span>
                        <span className="flex items-center group-hover:translate-x-1 transition-transform">
                            Xem chi tiết <i className="fas fa-arrow-right ml-1.5 text-xs"></i>
                        </span>
                    </div>
                </div>

                {/* Finance Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100/90 p-7 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-emerald-200 cursor-pointer group relative overflow-hidden h-full"
                    onClick={() => onNavigate('finance')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <i className="fas fa-wallet text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Tài Chính</h3>
                    </div>

                    <div className="space-y-3.5 mb-6 relative z-10 flex-1">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Tổng vốn</span>
                            <span className="font-semibold text-slate-800">500 Tỷ</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">% Giải ngân</span>
                            <span className="font-semibold text-emerald-600">64%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Còn lại</span>
                            <span className="font-semibold text-amber-500">180 Tỷ</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {/* Using Area Chart for Progress/Line mockup as requested */}
                        <MiniatureAreaChart data={miniData.finance} dataKey="value" color="#10b981" />
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center text-sm font-semibold text-emerald-600 relative z-10">
                        <span>Truy cập báo cáo</span>
                        <span className="flex items-center group-hover:translate-x-1 transition-transform">
                            Xem chi tiết <i className="fas fa-arrow-right ml-1.5 text-xs"></i>
                        </span>
                    </div>
                </div>

                {/* HR Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100/90 p-7 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-purple-200 cursor-pointer group relative overflow-hidden h-full"
                    onClick={() => onNavigate('hr')}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-purple-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>

                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <i className="fas fa-users text-xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Nhân Sự</h3>
                    </div>

                    <div className="space-y-3.5 mb-6 relative z-10 flex-1">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Tổng</span>
                            <span className="font-semibold text-slate-800">350</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Đảng viên %</span>
                            <span className="font-semibold text-slate-800">45%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Đoàn viên %</span>
                            <span className="font-semibold text-slate-800">55%</span>
                        </div>
                    </div>

                    <div className="relative z-10">
                        {/* Using Bar Chart for HR as requested */}
                        <MiniatureBarChart data={miniData.hr} dataKey="value" color="#a855f7" />
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center text-sm font-semibold text-purple-600 relative z-10">
                        <span>Truy cập báo cáo</span>
                        <span className="flex items-center group-hover:translate-x-1 transition-transform">
                            Xem chi tiết <i className="fas fa-arrow-right ml-1.5 text-xs"></i>
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Important Metrics */}
            <div className="mt-8 grid grid-cols-1">
                <div className="bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-md flex items-center justify-center min-h-[120px]">
                    <div className="text-center opacity-70">
                        <i className="fas fa-lightbulb text-3xl mb-3"></i>
                        <p className="text-sm">Hệ thống đang chờ đồng bộ Insight tự động từ AI...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportOverview
