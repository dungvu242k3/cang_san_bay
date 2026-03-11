import { useState, useEffect, useMemo } from 'react'
import {
    Bar, BarChart, CartesianGrid, Cell,
    Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { supabase } from '../../services/supabase'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e']

const BADGE_CLASSES = {
    red: 'px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700',
    yellow: 'px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700',
    green: 'px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700',
    blue: 'px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
    pink: 'px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700',
    amber: 'px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700',
}

function ReportHR({ showPage }) {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [loading, setLoading] = useState(true)

    // Raw Data States
    const [profiles, setProfiles] = useState([])
    const [certificates, setCertificates] = useState([])
    const [salaries, setSalaries] = useState([])
    const [leaves, setLeaves] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [profRes, certRes, salRes, leaveRes] = await Promise.all([
                    supabase.from('employee_profiles').select('*').neq('status', 'Nghỉ việc'),
                    supabase.from('employee_certificates').select('*'),
                    supabase.from('employee_salaries').select('*').eq('is_active', true),
                    supabase.from('employee_leaves').select('*')
                ])

                if (profRes.data) setProfiles(profRes.data)
                if (certRes.data) setCertificates(certRes.data)
                if (salRes.data) setSalaries(salRes.data)
                if (leaveRes.data) setLeaves(leaveRes.data)
            } catch (err) {
                console.error("Error fetching HR data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const deptData = useMemo(() => {
        if (!profiles.length) return [{ name: 'Chưa có data', value: 1, fill: '#cbd5e1' }]
        const counts = {}
        profiles.forEach(p => {
            const d = p.department || 'Phòng ban khác'
            counts[d] = (counts[d] || 0) + 1
        })
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // highest first
            .map(([name, value], idx) => ({
                name, value, fill: COLORS[idx % COLORS.length]
            }))
    }, [profiles])

    const ageData = useMemo(() => {
        if (!profiles.length) return [{ name: 'Chưa có data', value: 1, fill: '#cbd5e1' }]
        let u30 = 0, u40 = 0, u50 = 0, o50 = 0
        const currentYear = new Date().getFullYear()
        profiles.forEach(p => {
            if (!p.date_of_birth) return
            let birthYear = 0
            const yearMatch = p.date_of_birth.match(/\d{4}/)
            if (yearMatch) birthYear = parseInt(yearMatch[0])
            else return // unparseable

            const age = currentYear - birthYear
            if (age < 30) u30++
            else if (age <= 40) u40++
            else if (age <= 50) u50++
            else o50++
        })
        return [
            { name: 'Dưới 30', value: u30, fill: '#10b981' },
            { name: '30-40', value: u40, fill: '#3b82f6' },
            { name: '41-50', value: u50, fill: '#f59e0b' },
            { name: 'Trên 50', value: o50, fill: '#ef4444' },
        ].filter(i => i.value > 0)
    }, [profiles])

    const certRows = useMemo(() => {
        const today = new Date()
        const next90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
        let filtered = certificates.filter(c => {
            if (!c.expiry_date) return false
            // Check parsing DD/MM/YYYY vs YYYY-MM-DD
            let exp = new Date(c.expiry_date)
            if (isNaN(exp.getTime()) && c.expiry_date.includes('/')) {
                const [d, m, y] = c.expiry_date.split('/')
                exp = new Date(`${y}-${m}-${d}`)
            }
            if (isNaN(exp.getTime())) return false
            c._parsedExpiry = exp
            return exp <= next90 // expired or expiring in 90 days
        })

        return filtered.map((c, idx) => {
            const emp = profiles.find(p => p.employee_code === c.employee_code) || {}
            const daysLeft = Math.floor((c._parsedExpiry - today) / (1000 * 60 * 60 * 24))
            const status = c._parsedExpiry < today ? 'Quá hạn' : (daysLeft < 30 ? 'Sắp hạn' : `${daysLeft} ngày`)
            const color = c._parsedExpiry < today ? 'red' : (daysLeft < 30 ? 'amber' : 'yellow')

            return {
                stt: idx + 1,
                name: `${emp.last_name || ''} ${emp.first_name || ''}`.trim() || c.employee_code || 'N/A',
                dept: emp.department || 'N/A',
                cert: c.certificate_name || 'N/A',
                date: c.expiry_date,
                status,
                color,
                employeeDetails: emp
            }
        }).sort((a,b) => a.color === 'red' ? -1 : 1) // expired first
    }, [certificates, profiles])

    const salaryRows = useMemo(() => {
        const today = new Date()
        let filtered = salaries.filter(s => {
            if (!s.date_received_level) return false
            let received = new Date(s.date_received_level)
            if (isNaN(received.getTime()) && s.date_received_level.includes('/')) {
                const [d, m, y] = s.date_received_level.split('/')
                received = new Date(`${y}-${m}-${d}`)
            }
            if (isNaN(received.getTime())) return false
            const years = (today - received) / (1000 * 60 * 60 * 24 * 365)
            s._parsedReceived = received
            return years >= 2.8 && years <= 4 // roughly due for a 3-year raise, or slightly overdue
        })
        
        return filtered.map((s, idx) => {
            const emp = profiles.find(p => p.employee_code === s.employee_code) || {}
            const nextRaise = new Date(s._parsedReceived.getTime())
            nextRaise.setFullYear(nextRaise.getFullYear() + 3)
            
            const daysOverdue = (today - nextRaise) / (1000 * 60 * 60 * 24)
            const status = daysOverdue > 0 ? 'Quá hạn' : (daysOverdue > -30 ? 'Chuẩn bị' : 'Chờ duyệt')
            
            return {
                stt: idx + 1,
                name: `${emp.last_name || ''} ${emp.first_name || ''}`.trim() || s.employee_code || 'N/A',
                dept: emp.department || 'N/A',
                grade: s.salary_level || 'N/A',
                date: nextRaise.toLocaleDateString('vi-VN'),
                status,
                color: status === 'Quá hạn' ? 'red' : (status === 'Chuẩn bị' ? 'amber' : 'green'),
                employeeDetails: emp
            }
        }).sort((a,b) => a.color === 'red' ? -1 : 1)
    }, [salaries, profiles])

    const retireRows = useMemo(() => {
        const today = new Date()
        let rows = []
        profiles.forEach(p => {
            if (!p.date_of_birth) return
            let birthDate = new Date(p.date_of_birth)
            if (isNaN(birthDate.getTime()) && p.date_of_birth.includes('/')) {
                const [d, m, y] = p.date_of_birth.split('/')
                birthDate = new Date(`${y}-${m}-${d}`)
            }
            if (isNaN(birthDate.getTime())) return
            
            const isFemale = p.gender && p.gender.toLowerCase() === 'nữ'
            const retirementAge = isFemale ? 60 : 62 
            const retireDate = new Date(birthDate.getTime())
            retireDate.setFullYear(retireDate.getFullYear() + retirementAge)
            
            const monthsLeft = (retireDate - today) / (1000 * 60 * 60 * 24 * 30.4)
            if (monthsLeft >= -6 && monthsLeft <= 12) { // also show recently retired for tracking?
                rows.push({ emp: p, retireDate, monthsLeft, birthYear: birthDate.getFullYear() })
            }
        })
        return rows.map((r, idx) => ({
            stt: idx + 1,
            name: `${r.emp.last_name || ''} ${r.emp.first_name || ''}`.trim() || r.emp.employee_code,
            dept: r.emp.department || 'N/A',
            dob: r.birthYear,
            date: r.retireDate.toLocaleDateString('vi-VN'),
            remain: r.monthsLeft <= 0 ? 'Đã đến hạn' : `${Math.ceil(r.monthsLeft)} tháng`,
            color: r.monthsLeft <= 3 ? 'red' : 'yellow',
            employeeDetails: r.emp
        })).sort((a,b) => parseInt(a.remain) - parseInt(b.remain)) // very crude sort
    }, [profiles])

    const leaveRows = useMemo(() => {
        const today = new Date()
        let filtered = leaves.filter(l => {
            if (!l.from_date || !l.to_date) return false
            let from = new Date(l.from_date), to = new Date(l.to_date)
            if (isNaN(from.getTime()) && l.from_date.includes('/')) from = new Date(l.from_date.split('/').reverse().join('-'))
            if (isNaN(to.getTime()) && l.to_date.includes('/')) to = new Date(l.to_date.split('/').reverse().join('-'))
            
            if (isNaN(from.getTime()) || isNaN(to.getTime())) return false
            l._parsedFrom = from; l._parsedTo = to;
            
            return from <= today && to >= today
        })
        
        return filtered.map((l, idx) => {
            const emp = profiles.find(p => p.employee_code === l.employee_code) || {}
            const isThaiSan = l.leave_type?.toLowerCase().includes('thai sản')
            return {
                stt: idx + 1,
                name: `${emp.last_name || ''} ${emp.first_name || ''}`.trim() || l.employee_code || 'N/A',
                dept: emp.department || 'N/A',
                type: l.leave_type || 'Nghỉ phép',
                typeColor: isThaiSan ? 'pink' : 'blue',
                from: l._parsedFrom.toLocaleDateString('vi-VN'),
                to: l._parsedTo.toLocaleDateString('vi-VN'),
                employeeDetails: emp
            }
        })
    }, [leaves, profiles])

    const openDrawer = (emp) => {
        setSelectedEmployee(emp)
        setDrawerOpen(true)
    }

    // KPI Values
    const totalEmployees = profiles.length || 0
    const totalLeavesCount = leaveRows.length || 0
    const leavePercentage = totalEmployees > 0 ? ((totalLeavesCount / totalEmployees) * 100).toFixed(1) : 0
    const maternityLeavesCount = leaveRows.filter(r => r.typeColor === 'pink').length || 0
    const maternityPercentage = totalEmployees > 0 ? ((maternityLeavesCount / totalEmployees) * 100).toFixed(1) : 0
    const retiringSoonCount = retireRows.filter(r => r.remain !== 'Đã đến hạn').length || 0

    return (
        <main className="w-full relative" style={{ padding: '20px 24px 24px 24px', minHeight: '100vh' }}>
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            )}
            
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-users text-green-600"></i> NHÂN SỰ
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Cảng HKQT Cát Bi</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm" style={{ padding: '20px', marginBottom: '24px' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Kỳ báo cáo</label>
                        <input type="month" defaultValue="2026-02" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">Phòng ban</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20">
                            <option>Tất cả phòng ban</option><option>Văn phòng</option><option>Tài chính kế hoạch</option>
                            <option>Phục vụ mặt đất</option><option>Kỹ thuật hạ tầng</option><option>Điều hành sân bay</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Lọc</button>
                        <button className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Xuất Excel</button>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-green-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Tổng nhân sự</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{totalEmployees}</p>
                    <p className="text-xs text-green-500 mt-1">người</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-blue-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Đang nghỉ phép</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{totalLeavesCount}</p>
                    <p className="text-xs text-blue-500 mt-1">{leavePercentage}% tổng số</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-pink-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Đang nghỉ thai sản</p>
                    <p className="text-3xl font-bold text-pink-600 mt-2">{maternityLeavesCount}</p>
                    <p className="text-xs text-pink-500 mt-1">{maternityPercentage}% tổng số</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-amber-500" style={{ padding: '20px' }}>
                    <p className="text-xs text-slate-500 font-medium">Sắp về hưu</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">{retiringSoonCount}</p>
                    <p className="text-xs text-amber-500 mt-1">12 tháng tới</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Nhân sự theo phòng ban</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={deptData} barCategoryGap="25%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Số người">
                                {deptData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl shadow-sm" style={{ padding: '24px' }}>
                    <h3 className="font-semibold text-slate-800 mb-4">Cơ cấu theo độ tuổi</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={ageData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {ageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: '24px' }}>
                {/* Certificate Expiry */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Sắp gia hạn chứng chỉ</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Trong 90 ngày</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Chứng chỉ</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Hạn</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {certRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.cert}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                                        <td className="px-4 py-3 text-center"><span className={BADGE_CLASSES[r.color]}>{r.status}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openDrawer(r)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                                <i className="fas fa-eye text-[10px]"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Salary Increase */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Sắp nâng bậc lương</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Trong quý này</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Bậc hiện tại</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ngày nâng</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {salaryRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.grade}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                                        <td className="px-4 py-3 text-center"><span className={BADGE_CLASSES[r.color]}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tables Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retirement */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Sắp về hưu</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Trong 12 tháng</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Năm sinh</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Dự kiến hưu</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Còn lại</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {retireRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dob}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                                        <td className="px-4 py-3 text-center"><span className={BADGE_CLASSES[r.color]}>{r.remain}</span></td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openDrawer(r)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                                <i className="fas fa-eye text-[10px]"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Current Leave */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div style={{ padding: '24px 24px 16px 24px' }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Danh sách nghỉ hiện tại</h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">NPhép: {totalLeavesCount - maternityLeavesCount}</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">TSản: {maternityLeavesCount}</span>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">STT</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Họ tên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Phòng ban</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Loại nghỉ</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Từ ngày</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Đến ngày</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {leaveRows.map(r => (
                                    <tr key={r.stt} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{r.stt}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.dept}</td>
                                        <td className="px-4 py-3"><span className={BADGE_CLASSES[r.typeColor]}>{r.type}</span></td>
                                        <td className="px-4 py-3 text-slate-600">{r.from}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.to}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button onClick={() => openDrawer(r)} className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors" style={{ padding: '6px 14px' }}>
                                                <i className="fas fa-eye text-[10px]"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Employee Details Drawer */}
            {drawerOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setDrawerOpen(false)}></div>}
            <div className={`rpt-drawer fixed right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto ${drawerOpen ? 'open' : ''}`} style={{ top: '150px', height: 'calc(100vh - 150px)' }}>
                {/* Header */}
                <div className="bg-linear-to-r from-teal-600 to-green-600 text-white" style={{ padding: '20px 24px' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-md">
                                {selectedEmployee?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold max-w-[220px] truncate" title={selectedEmployee?.name}>{selectedEmployee?.name}</h3>
                                <p className="text-green-100 text-sm mt-0.5">{selectedEmployee?.dept}</p>
                            </div>
                        </div>
                        <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                            <i className="fas fa-times text-white text-sm"></i>
                        </button>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    <div className="space-y-6">
                        {/* Status Highlights */}
                        {selectedEmployee?.status && (
                            <div className="bg-amber-50 rounded-xl border border-amber-100" style={{ padding: '16px' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-slate-800">Trạng thái đáng chú ý</p>
                                    <span className={BADGE_CLASSES[selectedEmployee.color] || BADGE_CLASSES.amber}>{selectedEmployee.status}</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    {selectedEmployee.cert ? `Chứng chỉ ${selectedEmployee.cert} sắp hết hạn vào ngày ${selectedEmployee.date}.` : 
                                     selectedEmployee.grade ? `Dự kiến nâng lên ${selectedEmployee.grade} vào ngày ${selectedEmployee.date}.` : ''}
                                </p>
                            </div>
                        )}
                        {selectedEmployee?.remain && (
                            <div className="bg-red-50 rounded-xl border border-red-100" style={{ padding: '16px' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-slate-800">Sắp nghỉ hưu</p>
                                    <span className={BADGE_CLASSES[selectedEmployee.color] || BADGE_CLASSES.red}>{selectedEmployee.remain}</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Dự kiến nghỉ hưu vào ngày {selectedEmployee.date}.
                                </p>
                            </div>
                        )}
                        {selectedEmployee?.type && (
                            <div className="bg-blue-50 rounded-xl border border-blue-100" style={{ padding: '16px' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-slate-800">Đang trong kỳ nghỉ</p>
                                    <span className={BADGE_CLASSES[selectedEmployee.typeColor] || BADGE_CLASSES.blue}>{selectedEmployee.type}</span>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Thời gian: <span className="font-medium text-slate-800">{selectedEmployee.from}</span> đến <span className="font-medium text-slate-800">{selectedEmployee.to}</span>.
                                </p>
                            </div>
                        )}

                        {/* Employee Information */}
                        <div className="border-t border-slate-200 pt-5 mt-5">
                            <h4 className="text-sm font-semibold text-slate-700 mb-4">Thông tin nhân sự</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Mã NV</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedEmployee?.employeeDetails?.employee_code || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Chức vụ / Chức danh</p>
                                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedEmployee?.employeeDetails?.job_title || selectedEmployee?.employeeDetails?.job_position || 'Chuyên viên'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Số điện thoại</p>
                                        <p className="text-sm font-semibold text-blue-600 mt-0.5">{selectedEmployee?.employeeDetails?.phone || 'Chưa cập nhật'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Email</p>
                                        <p className="text-sm font-semibold text-blue-600 mt-0.5 truncate max-w-[150px]" title={selectedEmployee?.employeeDetails?.email_acv || selectedEmployee?.employeeDetails?.email_personal}>{selectedEmployee?.employeeDetails?.email_acv || selectedEmployee?.employeeDetails?.email_personal || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3" style={{ marginTop: '32px' }}>
                        <button className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors" style={{ padding: '12px' }}>
                            <i className="fas fa-id-card text-xs"></i>
                            Mở hồ sơ
                        </button>
                        <button className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors" style={{ padding: '12px' }}>
                            <i className="fas fa-comment-dots text-xs"></i>
                            Nhắn tin
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ReportHR
