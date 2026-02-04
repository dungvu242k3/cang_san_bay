import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './DutySchedule.css'

export default function DutySchedule() {
    const { user } = useAuth()
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedWeek, setSelectedWeek] = useState(new Date())
    const [editingSchedule, setEditingSchedule] = useState(null)
    const [employees, setEmployees] = useState([])

    // Form state
    const [formData, setFormData] = useState({
        duty_date: '',
        director_on_duty: '',
        port_duty_officer: '',
        office_duty: '',
        finance_planning_duty: '',
        operations_duty: '',
        technical_duty: '',
        atc_duty: ''
    })

    useEffect(() => {
        loadEmployees()
        loadSchedules()
    }, [selectedWeek])

    const loadEmployees = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('employee_code, ho_va_ten, first_name, last_name')
                .order('ho_va_ten')
            
            if (error) throw error
            
            setEmployees(data || [])
        } catch (error) {
            console.error('Error loading employees:', error)
        }
    }

    const loadSchedules = async () => {
        setLoading(true)
        try {
            // Get start and end of week
            const startOfWeek = new Date(selectedWeek)
            startOfWeek.setDate(selectedWeek.getDate() - selectedWeek.getDay() + 1) // Monday
            startOfWeek.setHours(0, 0, 0, 0)
            
            const endOfWeek = new Date(startOfWeek)
            endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
            endOfWeek.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('duty_schedules')
                .select('*')
                .gte('duty_date', startOfWeek.toISOString().split('T')[0])
                .lte('duty_date', endOfWeek.toISOString().split('T')[0])
                .order('duty_date')
            
            if (error) throw error

            // Generate week days if not exists
            const weekDays = []
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek)
                date.setDate(startOfWeek.getDate() + i)
                const dateStr = date.toISOString().split('T')[0]
                const existing = data?.find(s => s.duty_date === dateStr)
                
                weekDays.push({
                    date: dateStr,
                    dayOfWeek: getDayOfWeek(date.getDay()),
                    schedule: existing || null
                })
            }

            setSchedules(weekDays)
        } catch (error) {
            console.error('Error loading schedules:', error)
        } finally {
            setLoading(false)
        }
    }

    const getDayOfWeek = (dayIndex) => {
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
        return days[dayIndex]
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${day}/${month}`
    }

    const handleEdit = (schedule) => {
        if (schedule) {
            setFormData({
                duty_date: schedule.duty_date,
                director_on_duty: schedule.director_on_duty || '',
                port_duty_officer: schedule.port_duty_officer || '',
                office_duty: schedule.office_duty || '',
                finance_planning_duty: schedule.finance_planning_duty || '',
                operations_duty: schedule.operations_duty || '',
                technical_duty: schedule.technical_duty || '',
                atc_duty: schedule.atc_duty || ''
            })
            setEditingSchedule(schedule.id)
        } else {
            // New schedule
            setFormData({
                duty_date: '',
                director_on_duty: '',
                port_duty_officer: '',
                office_duty: '',
                finance_planning_duty: '',
                operations_duty: '',
                technical_duty: '',
                atc_duty: ''
            })
            setEditingSchedule('new')
        }
    }

    const handleSave = async () => {
        try {
            const date = new Date(formData.duty_date)
            const dayOfWeek = getDayOfWeek(date.getDay())

            const scheduleData = {
                duty_date: formData.duty_date,
                day_of_week: dayOfWeek,
                director_on_duty: formData.director_on_duty || null,
                port_duty_officer: formData.port_duty_officer || null,
                office_duty: formData.office_duty || null,
                finance_planning_duty: formData.finance_planning_duty || null,
                operations_duty: formData.operations_duty || null,
                technical_duty: formData.technical_duty || null,
                atc_duty: formData.atc_duty || null,
                created_by: user?.employee_code || user?.email
            }

            if (editingSchedule && editingSchedule !== 'new') {
                // Update
                const { error } = await supabase
                    .from('duty_schedules')
                    .update(scheduleData)
                    .eq('id', editingSchedule)
                
                if (error) throw error
            } else {
                // Insert
                const { error } = await supabase
                    .from('duty_schedules')
                    .insert(scheduleData)
                
                if (error) throw error
            }

            setEditingSchedule(null)
            loadSchedules()
        } catch (error) {
            console.error('Error saving schedule:', error)
            alert('Lỗi khi lưu lịch trực: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa lịch trực này?')) return

        try {
            const { error } = await supabase
                .from('duty_schedules')
                .delete()
                .eq('id', id)
            
            if (error) throw error
            
            loadSchedules()
        } catch (error) {
            console.error('Error deleting schedule:', error)
            alert('Lỗi khi xóa lịch trực: ' + error.message)
        }
    }

    const getEmployeeName = (code) => {
        if (!code) return '-'
        const emp = employees.find(e => e.employee_code === code)
        if (emp) {
            return emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()
        }
        return code // Return code if not found
    }

    const handleWeekChange = (direction) => {
        const newDate = new Date(selectedWeek)
        newDate.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7))
        setSelectedWeek(newDate)
    }

    if (loading) {
        return <div className="duty-schedule-container"><div className="loading">Đang tải...</div></div>
    }

    return (
        <div className="duty-schedule-container fade-in">
            <div className="duty-schedule-header">
                <h2><i className="fas fa-calendar-check"></i> Lịch trực</h2>
                <div className="header-controls">
                    <button className="btn btn-outline-secondary" onClick={() => handleWeekChange('prev')}>
                        <i className="fas fa-chevron-left"></i> Tuần trước
                    </button>
                    <input
                        type="week"
                        value={getWeekInputValue(selectedWeek)}
                        onChange={(e) => {
                            const [year, week] = e.target.value.split('-W')
                            const date = new Date(year, 0, 1 + (week - 1) * 7)
                            setSelectedWeek(date)
                        }}
                        className="week-input"
                    />
                    <button className="btn btn-outline-secondary" onClick={() => handleWeekChange('next')}>
                        Tuần sau <i className="fas fa-chevron-right"></i>
                    </button>
                    <button className="btn btn-primary" onClick={() => handleEdit(null)}>
                        <i className="fas fa-plus"></i> Thêm lịch trực
                    </button>
                </div>
            </div>

            <div className="duty-schedule-table-wrapper">
                <table className="duty-schedule-table">
                    <thead>
                        <tr>
                            <th>THỨ/NGÀY</th>
                            <th>TRỰC GIÁM ĐÓC</th>
                            <th>TRỰC BAN CẢNG (đ.c)</th>
                            <th colSpan="5">TRỰC PHÒNG</th>
                        </tr>
                        <tr className="sub-header">
                            <th></th>
                            <th></th>
                            <th></th>
                            <th>VĂN PHÒNG</th>
                            <th>PHÒNG TC-KH</th>
                            <th>PHÒNG PVMD</th>
                            <th>P. KTHT</th>
                            <th>PHÒNG ĐHSB</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((day, index) => (
                            <tr key={day.date}>
                                <td className="day-cell">
                                    <strong>{day.dayOfWeek}</strong>
                                    <br />
                                    <span className="date-text">({formatDate(day.date)})</span>
                                    <div className="day-actions">
                                        <button 
                                            className="btn-icon" 
                                            onClick={() => handleEdit(day.schedule)}
                                            title="Sửa"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        {day.schedule && (
                                            <button 
                                                className="btn-icon text-danger" 
                                                onClick={() => handleDelete(day.schedule.id)}
                                                title="Xóa"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td>{getEmployeeName(day.schedule?.director_on_duty)}</td>
                                <td>{getEmployeeName(day.schedule?.port_duty_officer)}</td>
                                <td>{getEmployeeName(day.schedule?.office_duty)}</td>
                                <td>{getEmployeeName(day.schedule?.finance_planning_duty)}</td>
                                <td>{getEmployeeName(day.schedule?.operations_duty)}</td>
                                <td>{getEmployeeName(day.schedule?.technical_duty)}</td>
                                <td>{getEmployeeName(day.schedule?.atc_duty)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingSchedule && (
                <div className="modal-overlay" onClick={() => setEditingSchedule(null)}>
                    <div className="modal-content duty-schedule-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h4>
                                <i className="fas fa-calendar-check"></i> {editingSchedule === 'new' ? 'Thêm' : 'Sửa'} lịch trực
                            </h4>
                            <button onClick={() => setEditingSchedule(null)} className="btn-close">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Ngày trực <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.duty_date}
                                    onChange={(e) => setFormData({ ...formData, duty_date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Trực Giám đốc</label>
                                <select
                                    className="form-control"
                                    value={formData.director_on_duty}
                                    onChange={(e) => setFormData({ ...formData, director_on_duty: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Trực Ban Cảng (đ.c)</label>
                                <select
                                    className="form-control"
                                    value={formData.port_duty_officer}
                                    onChange={(e) => setFormData({ ...formData, port_duty_officer: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>VĂN PHÒNG</label>
                                <select
                                    className="form-control"
                                    value={formData.office_duty}
                                    onChange={(e) => setFormData({ ...formData, office_duty: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>PHÒNG TC-KH</label>
                                <select
                                    className="form-control"
                                    value={formData.finance_planning_duty}
                                    onChange={(e) => setFormData({ ...formData, finance_planning_duty: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>PHÒNG PVMD</label>
                                <select
                                    className="form-control"
                                    value={formData.operations_duty}
                                    onChange={(e) => setFormData({ ...formData, operations_duty: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>P. KTHT</label>
                                <select
                                    className="form-control"
                                    value={formData.technical_duty}
                                    onChange={(e) => setFormData({ ...formData, technical_duty: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>PHÒNG ĐHSB</label>
                                <select
                                    className="form-control"
                                    value={formData.atc_duty}
                                    onChange={(e) => setFormData({ ...formData, atc_duty: e.target.value })}
                                >
                                    <option value="">-- Chọn --</option>
                                    {employees.map(emp => (
                                        <option key={emp.employee_code} value={emp.employee_code}>
                                            {emp.ho_va_ten || `${emp.last_name || ''} ${emp.first_name || ''}`.trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditingSchedule(null)}>
                                Hủy
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                <i className="fas fa-save"></i> Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function getWeekInputValue(date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
    const week1 = new Date(d.getFullYear(), 0, 4)
    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}
