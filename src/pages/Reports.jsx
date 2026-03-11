import { useState } from 'react'
import './Reports.css'

// Sub-page imports
import ReportFinance from './reports/ReportFinance'
import ReportHome from './reports/ReportHome'
import ReportHR from './reports/ReportHR'
import ReportProduction from './reports/ReportProduction'

function Reports() {
    const [activePage, setActivePage] = useState('home')

    const showPage = (pageId) => setActivePage(pageId)

    return (
        <div className="min-h-full w-full bg-slate-100 font-sans text-slate-800 overflow-auto">
            {/* Header */}
            <header className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50" style={{ marginLeft: '-16px', marginRight: '-16px', padding: '0 32px' }}>
                <div style={{ width: '100%' }}>
                    <div className="grid grid-cols-3 items-center" style={{ height: '56px', width: '100%' }}>
                        {/* Left: Logo + Title */}
                        <div className="flex items-center gap-2.5" style={{ marginLeft: '20px' }}>
                            <svg className="w-6 h-6 opacity-90 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h1 className="text-lg font-bold tracking-wide whitespace-nowrap">Báo Cáo</h1>
                        </div>

                        {/* Center: Tabs */}
                        <nav className="hidden md:flex items-center justify-center gap-5">
                            {['home', 'production', 'finance', 'hr'].map(page => (
                                <button
                                    key={page}
                                    onClick={() => showPage(page)}
                                    className={`px-5 py-2 rounded-full text-base font-semibold transition-all duration-200 whitespace-nowrap ${activePage === page
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-white/85 hover:bg-white/15 hover:text-white'
                                        }`}
                                >
                                    {{ home: 'Tổng quan', production: 'Sản lượng', finance: 'Tài chính', hr: 'Nhân sự' }[page]}
                                </button>
                            ))}
                        </nav>

                        {/* Right: Filters + Download */}
                        <div className="hidden md:flex items-center justify-end gap-2.5" style={{ marginRight: '20px' }}>
                            <select className="rpt-header-select shrink-0">
                                <option value="2026">Năm: 2026</option>
                                <option value="2025">Năm: 2025</option>
                                <option value="2024">Năm: 2024</option>
                            </select>
                            <select className="rpt-header-select shrink-0">
                                <option value="ytd">YTD</option>
                                <option value="q1">Quý 1</option>
                                <option value="q2">Quý 2</option>
                                <option value="q3">Quý 3</option>
                                <option value="q4">Quý 4</option>
                            </select>
                            <button className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                                </svg>
                                <span className="whitespace-nowrap">Tải báo cáo</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden border-t border-white/10 px-4 py-2 flex gap-2 overflow-x-auto rpt-hide-scrollbar">
                    {['home', 'production', 'finance', 'hr'].map(page => (
                        <button
                            key={page}
                            onClick={() => showPage(page)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${activePage === page
                                ? 'bg-white text-blue-700 shadow-sm'
                                : 'text-white/85 hover:bg-white/15'
                                }`}
                        >
                            {{ home: 'Tổng quan', production: 'Sản lượng', finance: 'Tài chính', hr: 'Nhân sự' }[page]}
                        </button>
                    ))}
                </div>
            </header>

            {/* Pages */}
            {activePage === 'home' && <ReportHome showPage={showPage} />}
            {activePage === 'production' && <ReportProduction showPage={showPage} />}
            {activePage === 'finance' && <ReportFinance showPage={showPage} />}
            {activePage === 'hr' && <ReportHR showPage={showPage} />}
        </div>
    )
}

export default Reports
