import { useEffect, useState } from 'react'
import {
    Area,
    AreaChart,
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
    XAxis, YAxis
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Dashboard.css'

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe']

function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalLeaves: 0
    })
    const [loading, setLoading] = useState(true)
    const [personnelTrend, setPersonnelTrend] = useState([])
    const [departmentData, setDepartmentData] = useState([])
    const [taskStatusData, setTaskStatusData] = useState([])
    const [leaveTrend, setLeaveTrend] = useState([])
    const [monthlyStats, setMonthlyStats] = useState([])
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            // Load employees count
            const { count: empCount } = await supabase
                .from('employee_profiles')
                .select('*', { count: 'exact', head: true })

            // Load tasks
            const { data: tasks, count: taskCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact' })

            const completed = tasks?.filter(t => t.status === 'Hoàn thành').length || 0
            const pending = tasks?.filter(t => ['Mới giao', 'Đang thực hiện'].includes(t.status)).length || 0

            // Load leaves
            const { count: leaveCount } = await supabase
                .from('employee_leaves')
                .select('*', { count: 'exact', head: true })

            setStats({
                totalEmployees: empCount || 0,
                totalTasks: taskCount || 0,
                completedTasks: completed,
                pendingTasks: pending,
                totalLeaves: leaveCount || 0
            })

            // Generate sample trend data
            const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
            setPersonnelTrend(months.map((m, i) => ({
                month: m,
                employees: (empCount || 0) + Math.floor(Math.random() * 10) - 5
            })))

            // Department distribution
            const { data: deptData } = await supabase
                .from('employee_profiles')
                .select('department')

            const deptCounts = {}
            deptData?.forEach(emp => {
                const dept = emp.department || 'Khác'
                deptCounts[dept] = (deptCounts[dept] || 0) + 1
            })

            setDepartmentData(Object.entries(deptCounts).map(([name, value]) => ({
                name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                value
            })))

            // Task status
            const statusCounts = {}
            tasks?.forEach(task => {
                const status = task.status || 'Khác'
                statusCounts[status] = (statusCounts[status] || 0) + 1
            })

            setTaskStatusData(Object.entries(statusCounts).map(([name, value]) => ({
                name,
                value
            })))

            // Leave trend
            setLeaveTrend(months.map((m, i) => ({
                month: m,
                leaves: Math.floor(Math.random() * 20) + 5
            })))

            // Monthly stats
            setMonthlyStats(months.map((m, i) => ({
                month: m,
                tasks: Math.floor(Math.random() * 30) + 10,
                employees: Math.floor(Math.random() * 5) + 2
            })))

            setLoading(false)
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1><i className="fas fa-chart-line"></i> Dashboard</h1>
                <p>Tổng quan hệ thống quản lý nhân sự</p>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalEmployees}</h3>
                        <p>Tổng nhân viên</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                        <i className="fas fa-tasks"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalTasks}</h3>
                        <p>Tổng công việc</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.completedTasks}</h3>
                        <p>Hoàn thành</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.pendingTasks}</h3>
                        <p>Đang xử lý</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }}>
                        <i className="fas fa-umbrella-beach"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{stats.totalLeaves}</h3>
                        <p>Tổng nghỉ phép</p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {(isMobile ? [taskStatusData, personnelTrend, departmentData, leaveTrend, monthlyStats] :
                    [personnelTrend, departmentData, taskStatusData, leaveTrend, monthlyStats]).map((data, idx) => {

                        // Personnel Trend
                        if (data === personnelTrend) return (
                            <div key="personnel-trend" className="chart-card">
                                <h3>Xu hướng nhân sự</h3>
                                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                                    <AreaChart data={personnelTrend}>
                                        <defs>
                                            <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="employees" stroke="#667eea" fillOpacity={1} fill="url(#colorEmployees)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        );

                        // Department Distribution
                        if (data === departmentData) return (
                            <div key="dept-dist" className="chart-card">
                                <h3>Phân bố theo phòng ban</h3>
                                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                                    <PieChart>
                                        <Pie
                                            data={departmentData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={isMobile ? null : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={isMobile ? 70 : 80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {departmentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        {!isMobile && <Legend />}
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        );

                        // Task Status
                        if (data === taskStatusData) return (
                            <div key="task-status" className="chart-card">
                                <h3>Trạng thái công việc</h3>
                                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                                    <BarChart data={taskStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#667eea" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        );

                        // Leave Trend
                        if (data === leaveTrend) return (
                            <div key="leave-trend" className="chart-card">
                                <h3>Xu hướng nghỉ phép</h3>
                                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                                    <LineChart data={leaveTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="leaves" stroke="#f093fb" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        );

                        // Monthly Statistics
                        if (data === monthlyStats) return (
                            <div key="monthly-stats" className="chart-card full-width">
                                <h3>Thống kê theo tháng</h3>
                                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                                    <BarChart data={monthlyStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="tasks" fill="#667eea" />
                                        <Bar dataKey="employees" fill="#764ba2" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        );

                        return null;
                    })}
            </div>
        </div>
    )
}

export default Dashboard
