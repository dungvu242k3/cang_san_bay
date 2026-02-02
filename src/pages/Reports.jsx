import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Reports.css'

function Reports() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        headcount: 0,
        tasks: 0,
        leaves: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadReports()
    }, [])

    const loadReports = async () => {
        try {
            setLoading(true)

            const { count: empCount } = await supabase
                .from('employee_profiles')
                .select('*', { count: 'exact', head: true })

            const { count: taskCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })

            const { count: leaveCount } = await supabase
                .from('employee_leaves')
                .select('*', { count: 'exact', head: true })

            setStats({
                headcount: empCount || 0,
                tasks: taskCount || 0,
                leaves: leaveCount || 0
            })

            setLoading(false)
        } catch (err) {
            console.error('Error loading reports:', err)
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="reports-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải báo cáo...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1><i className="fas fa-file-alt"></i> Báo cáo</h1>
                <p>Thống kê và báo cáo hệ thống</p>
            </div>

            <div className="reports-grid">
                <div className="report-card">
                    <div className="report-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="report-info">
                        <h3>{stats.headcount}</h3>
                        <p>Tổng nhân sự</p>
                    </div>
                </div>

                <div className="report-card">
                    <div className="report-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <i className="fas fa-tasks"></i>
                    </div>
                    <div className="report-info">
                        <h3>{stats.tasks}</h3>
                        <p>Tổng công việc</p>
                    </div>
                </div>

                <div className="report-card">
                    <div className="report-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <i className="fas fa-umbrella-beach"></i>
                    </div>
                    <div className="report-info">
                        <h3>{stats.leaves}</h3>
                        <p>Tổng nghỉ phép</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports
