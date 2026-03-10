import { useEffect, useState } from 'react'
import FinanceReport from '../components/reports/FinanceReport'
import HRReport from '../components/reports/HRReport'
import ProductionReport from '../components/reports/ProductionReport'
import ReportOverview from '../components/reports/ReportOverview'
import { useAuth } from '../contexts/AuthContext'

function Reports() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: 'fas fa-chart-pie' },
        { id: 'production', label: 'Sản lượng', icon: 'fas fa-box-open' },
        { id: 'finance', label: 'Tài chính', icon: 'fas fa-wallet' },
        { id: 'hr', label: 'Nhân sự', icon: 'fas fa-users' }
    ]

    const handleNavigate = (tabId) => {
        setActiveTab(tabId)
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'production':
                return <ProductionReport />
            case 'finance':
                return <FinanceReport />
            case 'hr':
                return <HRReport />
            case 'overview':
            default:
                return <ReportOverview onNavigate={handleNavigate} />
        }
    }

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        Báo cáo & Thống kê
                    </h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Theo dõi và phân tích số liệu hoạt động kinh doanh</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 mb-8 overflow-hidden inline-flex w-full md:w-auto">
                <div className="flex overflow-x-auto hide-scrollbar scroll-smooth w-full md:w-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center gap-2 px-6 py-4 text-[15px] font-semibold whitespace-nowrap transition-all duration-200 relative flex-1 md:flex-none
                                ${activeTab === tab.id
                                    ? 'text-indigo-700 bg-indigo-50/40'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }
                            `}
                        >
                            <i className={`${tab.icon} ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}></i>
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="transform transition-all duration-300">
                {renderContent()}
            </div>
        </div>
    )
}

export default Reports
