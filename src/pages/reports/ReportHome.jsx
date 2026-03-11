function ReportHome({ showPage }) {
    return (
        <main className="w-full" style={{ padding: '20px 24px 24px 24px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 className="text-2xl font-bold text-slate-800">Cảng HKQT Cát Bi</h2>
                <p className="text-slate-500 mt-1">Báo cáo tổng hợp tình hình hoạt động</p>
            </div>

            {/* Mini KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '20px' }}>
                <div className="rpt-kpi-card bg-white rounded-xl shadow-sm rpt-animate-in rpt-delay-1 overflow-hidden" style={{ padding: '24px', opacity: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Hành khách</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">2.4M</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">80% KH</span>
                                <span className="text-xs text-green-600 font-medium">↑ 6%</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-users text-blue-700 text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="rpt-kpi-card bg-white rounded-xl shadow-sm rpt-animate-in rpt-delay-2 overflow-hidden" style={{ padding: '24px', opacity: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Giải ngân</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">320 tỷ</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">64%</span>
                                <span className="text-xs text-slate-500">/ 500 tỷ</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-dollar-sign text-amber-600 text-xl"></i>
                        </div>
                    </div>
                </div>
                <div className="rpt-kpi-card bg-white rounded-xl shadow-sm rpt-animate-in rpt-delay-3 overflow-hidden" style={{ padding: '24px', opacity: 0 }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Tổng nhân sự</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">350</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">+5</span>
                                <span className="text-xs text-slate-500">tháng này</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-user-friends text-green-600 text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <h3 className="text-lg font-semibold text-slate-700" style={{ marginTop: '40px', marginBottom: '16px' }}>Báo cáo chi tiết</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Production Card */}
                <div className="rpt-nav-card bg-white rounded-2xl shadow-sm cursor-pointer border-2 border-transparent hover:border-blue-200 overflow-hidden" style={{ padding: '24px' }} onClick={() => showPage('production')}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)' }}>
                            <i className="fas fa-chart-bar text-white text-xl"></i>
                        </div>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Đang cập nhật</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">SẢN LƯỢNG</h4>
                    <p className="text-sm text-slate-500 mb-4">KPI: Hành khách, Hàng hóa, % Kế hoạch</p>
                    {/* Mini Sparkline */}
                    <div className="h-12 mb-4">
                        <svg viewBox="0 0 200 50" className="w-full h-full">
                            <defs>
                                <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            <path d="M0,40 L20,35 L40,38 L60,30 L80,32 L100,25 L120,20 L140,22 L160,15 L180,18 L200,10 L200,50 L0,50 Z" fill="url(#sparkline-gradient)" />
                            <path d="M0,40 L20,35 L40,38 L60,30 L80,32 L100,25 L120,20 L140,22 L160,15 L180,18 L200,10" fill="none" stroke="#3b82f6" strokeWidth="2" className="sparkline" />
                        </svg>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div><p className="text-xs text-slate-400">YTD</p><p className="text-sm font-semibold text-slate-700">2.4M</p></div>
                            <div><p className="text-xs text-slate-400">KH</p><p className="text-sm font-semibold text-slate-700">3.0M</p></div>
                            <div className="border-l border-slate-200 pl-4"><p className="text-xs text-slate-400">Đạt</p><p className="text-sm font-semibold text-amber-600">80% KH</p></div>
                        </div>
                        <span className="flex items-center gap-1 text-blue-700 font-medium text-sm">Xem <i className="fas fa-chevron-right text-xs"></i></span>
                    </div>
                </div>

                {/* Finance Card */}
                <div className="rpt-nav-card bg-white rounded-2xl shadow-sm cursor-pointer border-2 border-transparent hover:border-amber-200 overflow-hidden" style={{ padding: '24px' }} onClick={() => showPage('finance')}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 10px 15px -3px rgba(245,158,11,0.3)' }}>
                            <i className="fas fa-coins text-white text-xl"></i>
                        </div>
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">64% giải ngân</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">TÀI CHÍNH</h4>
                    <p className="text-sm text-slate-500 mb-4">KPI: Tổng vốn, % Giải ngân, Còn lại</p>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Tiến độ giải ngân</span><span>320/500 tỷ</span></div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="rpt-progress-bar h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: '64%' }}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div><p className="text-xs text-slate-400">Đã GN</p><p className="text-sm font-semibold text-slate-700">320 tỷ</p></div>
                            <div><p className="text-xs text-slate-400">Còn lại</p><p className="text-sm font-semibold text-slate-700">180 tỷ</p></div>
                        </div>
                        <span className="flex items-center gap-1 text-amber-600 font-medium text-sm">Xem <i className="fas fa-chevron-right text-xs"></i></span>
                    </div>
                </div>

                {/* HR Card */}
                <div className="rpt-nav-card bg-white rounded-2xl shadow-sm cursor-pointer border-2 border-transparent hover:border-green-200 overflow-hidden" style={{ padding: '24px' }} onClick={() => showPage('hr')}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 10px 15px -3px rgba(16,185,129,0.3)' }}>
                            <i className="fas fa-users text-white text-xl"></i>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+5 mới</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">NHÂN SỰ</h4>
                    <p className="text-sm text-slate-500 mb-4">KPI: Tổng, Đảng viên %, Đoàn viên %</p>
                    <div className="h-12 mb-4 flex items-end gap-2">
                        {[70, 85, 60, 45, 100].map((h, i) => (
                            <div key={i} className={`flex-1 rounded-t`} style={{ height: `${h}%`, backgroundColor: `rgba(16,185,129,${0.3 + i * 0.15})` }}></div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div><p className="text-xs text-slate-400">Đảng viên</p><p className="text-sm font-semibold text-slate-700">35%</p></div>
                            <div><p className="text-xs text-slate-400">Đoàn viên</p><p className="text-sm font-semibold text-slate-700">42%</p></div>
                        </div>
                        <span className="flex items-center gap-1 text-green-600 font-medium text-sm">Xem <i className="fas fa-chevron-right text-xs"></i></span>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ReportHome
