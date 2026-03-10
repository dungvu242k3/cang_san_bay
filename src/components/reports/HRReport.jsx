import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { supabase } from '../../services/supabase';
import LoadingSpinner from '../LoadingSpinner';

const initialDeptData = [
    { name: 'Văn phòng', value: 0 },
    { name: 'Tài chính kế hoạch', value: 0 },
    { name: 'Phục vụ mặt đất', value: 0 },
    { name: 'Kỹ thuật hạ tầng', value: 0 },
    { name: 'Điều hành sân bay', value: 0 },
];

const ageData = [
    { name: 'Dưới 30', value: 120 },
    { name: '30 - 40', value: 160 },
    { name: '41 - 50', value: 50 },
    { name: 'Trên 50', value: 20 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

// Mock table data
const certData = [
    { id: 1, name: 'Nguyễn Văn A', dept: 'Phục vụ mặt đất', cert: 'Phòng cháy chữa cháy', expires: '2026-03-20', status: 'red' },
    { id: 2, name: 'Trần Thị B', dept: 'Điều hành sân bay', cert: 'An ninh hàng không', expires: '2026-04-10', status: 'yellow' },
    { id: 3, name: 'Lê Văn C', dept: 'Kỹ thuật hạ tầng', cert: 'Vận hành xe kéo', expires: '2026-04-15', status: 'yellow' },
    { id: 4, name: 'Phạm Thị D', dept: 'Văn phòng', cert: 'Sơ cấp cứu', expires: '2026-08-01', status: 'green' },
];

const salaryData = [
    { id: 1, name: 'Hoàng Văn E', dept: 'Kỹ thuật hạ tầng', level: 'Bậc 3', date: '2026-03-15', status: 'yellow' },
    { id: 2, name: 'Vũ Thị F', dept: 'Tài chính kế hoạch', level: 'Bậc 5', date: '2026-04-01', status: 'yellow' },
    { id: 3, name: 'Đặng Văn G', dept: 'Phục vụ mặt đất', level: 'Bậc 2', date: '2026-05-10', status: 'green' },
];

const retirementData = [
    { id: 1, name: 'Bùi Văn H', dept: 'Kỹ thuật hạ tầng', yob: 1966, expected: '2026-06-30', status: 'red' },
    { id: 2, name: 'Ngô Thị I', dept: 'Văn phòng', yob: 1971, expected: '2026-12-31', status: 'yellow' },
];

const leaveData = [
    { id: 1, name: 'Lý Văn K', dept: 'Điều hành sân bay', type: 'Nghỉ phép', date: '10/03/2026 - 15/03/2026' },
    { id: 2, name: 'Đỗ Thị L', dept: 'Tài chính kế hoạch', type: 'Thai sản', date: '01/01/2026 - 30/06/2026' },
    { id: 3, name: 'Phan Văn M', dept: 'Phục vụ mặt đất', type: 'Nghỉ ốm', date: '11/03/2026 - 13/03/2026' },
];

function HRReport() {
    const [deptData, setDeptData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalHR, setTotalHR] = useState(0);

    useEffect(() => {
        fetchHRData();
    }, []);

    const fetchHRData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('employee_profiles')
                .select('department');

            if (error) throw error;

            if (data) {
                const departmentCounts = data.reduce((acc, profile) => {
                    const dept = profile.department || 'Chưa phân bổ';
                    acc[dept] = (acc[dept] || 0) + 1;
                    return acc;
                }, {});

                const formattedData = Object.entries(departmentCounts).map(([name, value], index) => ({
                    name,
                    value,
                    color: COLORS[index % COLORS.length]
                }));

                formattedData.sort((a, b) => b.value - a.value);

                setDeptData(formattedData.length > 0 ? formattedData : initialDeptData);
                setTotalHR(data.length);
            }
        } catch (error) {
            console.error('Error fetching HR data:', error);
            setDeptData(initialDeptData);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="hr-report space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header: DASHBOARD NHÂN SỰ */}
            <div className="bg-linear-to-r from-purple-800 to-indigo-900 p-6 md:p-8 rounded-3xl shadow-lg border border-purple-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 w-full">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 flex items-center">
                        <i className="fas fa-users-cog mr-4 text-purple-300"></i>
                        DASHBOARD NHÂN SỰ - CẢNG HKQT CÁT BI
                    </h2>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-purple-200 text-sm font-medium">
                        <span className="flex items-center gap-2"><i className="far fa-calendar-alt"></i> Kỳ báo cáo: Tháng 3/2026</span>
                        <span className="flex items-center gap-2"><i className="far fa-clock"></i> Cập nhật: 11/03/2026</span>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-auto shrink-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl flex items-center">
                        <span className="pl-3 pr-2 text-white/80 font-medium text-sm"><i className="fas fa-filter mr-1"></i> Bộ lọc:</span>
                        <select className="bg-white/90 border-transparent text-sm rounded-lg px-4 py-2 text-slate-800 font-semibold outline-none cursor-pointer hover:bg-white shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-colors">
                            <option>Tất cả phòng ban</option>
                            <option>Văn phòng</option>
                            <option>Tài chính kế hoạch</option>
                            <option>Phục vụ mặt đất</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Hàng 1: 4 Thẻ KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-purple-200 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <i className="fas fa-users text-xl"></i>
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Tổng nhân sự</p>
                    <span className="text-3xl font-black text-slate-800">{totalHR > 0 ? totalHR : 350} <span className="text-lg font-bold text-slate-500 lowercase">người</span></span>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-amber-200 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-400"></div>
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <i className="fas fa-umbrella-beach text-xl"></i>
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Đang nghỉ phép</p>
                    <span className="text-3xl font-black text-slate-800">12 <span className="text-lg font-bold text-slate-500 lowercase">người</span></span>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-pink-200 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-pink-400"></div>
                    <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <i className="fas fa-baby text-xl"></i>
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Đang nghỉ thai sản</p>
                    <span className="text-3xl font-black text-slate-800">5 <span className="text-lg font-bold text-slate-500 lowercase">người</span></span>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-slate-300 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-400"></div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <i className="fas fa-user-clock text-xl"></i>
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Sắp về hưu</p>
                    <span className="text-3xl font-black text-slate-800">2 <span className="text-lg font-bold text-slate-500 lowercase">người</span></span>
                </div>
            </div>

            {/* Hàng 2: 2 Biểu đồ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Nhân sự theo phòng ban */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-lg mb-6 uppercase tracking-wide border-b border-slate-100 pb-3">Nhân sự theo phòng ban</h3>
                    <div className="flex-1 min-h-[300px] w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={140} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`${value} người`, 'Số lượng']}
                                />
                                <Bar dataKey="value" name="Nhân sự" radius={[0, 6, 6, 0]} maxBarSize={30}>
                                    {deptData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Cơ cấu theo độ tuổi */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 md:p-8 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-lg mb-6 uppercase tracking-wide border-b border-slate-100 pb-3">Cơ cấu theo độ tuổi</h3>
                    <div className="flex flex-1 flex-col md:flex-row items-center">
                        <div className="w-full md:w-1/2 space-y-4 pr-6">
                            {ageData.map((item, index) => (
                                <div key={item.name} className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                                        <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                                    </div>
                                    <span className="text-base font-bold text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="h-[250px] w-full md:w-1/2 flex-1 relative mt-4 md:mt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={ageData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="90%"
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {ageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-slate-800">{totalHR > 0 ? totalHR : 350}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tổng</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hàng 3: 2 Bảng theo dõi Chứng chỉ & Lương */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Sắp gia hạn chứng chỉ */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden flex flex-col">
                    <div className="p-5 md:p-6 border-b border-slate-100/60 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
                            <i className="fas fa-id-card text-blue-500"></i> NHÂN SỰ SẮP GIA HẠN CHỨNG CHỈ
                        </h3>
                        <span className="bg-white shadow-sm font-bold text-slate-700 px-3 py-1 rounded-full text-xs border border-slate-200">
                            Tổng số: <span className="text-blue-600 ml-1">{certData.length} người</span>
                        </span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-12">STT</th>
                                    <th className="px-4 py-3 font-semibold">Họ tên</th>
                                    <th className="px-4 py-3 font-semibold">Phòng ban</th>
                                    <th className="px-4 py-3 font-semibold">Chứng chỉ</th>
                                    <th className="px-4 py-3 font-semibold">Hạn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {certData.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.name}</td>
                                        <td className="px-4 py-3">{row.dept}</td>
                                        <td className="px-4 py-3 font-medium">{row.cert}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${row.status === 'red' ? 'bg-red-50 text-red-600 border-red-200' :
                                                row.status === 'yellow' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                }`}>
                                                {row.expires}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Sắp nâng bậc lương */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden flex flex-col">
                    <div className="p-5 md:p-6 border-b border-slate-100/60 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
                            <i className="fas fa-level-up-alt text-emerald-500"></i> NHÂN SỰ SẮP NÂNG BẬC LƯƠNG
                        </h3>
                        <span className="bg-white shadow-sm font-bold text-slate-700 px-3 py-1 rounded-full text-xs border border-slate-200">
                            Tổng số: <span className="text-emerald-600 ml-1">{salaryData.length} người</span>
                        </span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-12">STT</th>
                                    <th className="px-4 py-3 font-semibold">Họ tên</th>
                                    <th className="px-4 py-3 font-semibold">Phòng ban</th>
                                    <th className="px-4 py-3 font-semibold">Bậc hiện tại</th>
                                    <th className="px-4 py-3 font-semibold">Ngày</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {salaryData.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.name}</td>
                                        <td className="px-4 py-3">{row.dept}</td>
                                        <td className="px-4 py-3 font-bold text-emerald-600">{row.level}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${row.status === 'red' ? 'bg-red-50 text-red-600 border-red-200' :
                                                row.status === 'yellow' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                }`}>
                                                {row.date}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Hàng 4: 2 Bảng Nghỉ hưu & Danh sách nghỉ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Sắp về hưu */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden flex flex-col">
                    <div className="p-5 md:p-6 border-b border-slate-100/60 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
                            <i className="fas fa-user-clock text-slate-500"></i> NHÂN SỰ SẮP VỀ HƯU
                        </h3>
                        <span className="bg-white shadow-sm font-bold text-slate-700 px-3 py-1 rounded-full text-xs border border-slate-200">
                            Tổng số: <span className="text-slate-600 ml-1">{retirementData.length} người</span>
                        </span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-12">STT</th>
                                    <th className="px-4 py-3 font-semibold">Họ tên</th>
                                    <th className="px-4 py-3 font-semibold">Phòng ban</th>
                                    <th className="px-4 py-3 font-semibold">Năm sinh</th>
                                    <th className="px-4 py-3 font-semibold">Dự kiến</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {retirementData.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.name}</td>
                                        <td className="px-4 py-3">{row.dept}</td>
                                        <td className="px-4 py-3 font-medium">{row.yob}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${row.status === 'red' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                {row.expected}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Danh sách nghỉ hiện tại */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 overflow-hidden flex flex-col">
                    <div className="p-5 flex flex-col border-b border-slate-100/60 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
                                <i className="fas fa-bed text-pink-500"></i> DANH SÁCH NGHỈ HIỆN TẠI
                            </h3>
                        </div>
                        <div className="flex gap-4">
                            <span className="bg-white shadow-sm font-bold text-slate-700 px-3 py-1 rounded-full text-xs border border-slate-200">
                                Nghỉ phép: <span className="text-amber-500 ml-1">12 người</span>
                            </span>
                            <span className="bg-white shadow-sm font-bold text-slate-700 px-3 py-1 rounded-full text-xs border border-slate-200">
                                Nghỉ thai sản: <span className="text-pink-500 ml-1">5 người</span>
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-center w-12">STT</th>
                                    <th className="px-4 py-3 font-semibold">Họ tên</th>
                                    <th className="px-4 py-3 font-semibold">Phòng ban</th>
                                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 font-semibold text-right">Từ ngày - Đến ngày</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaveData.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.name}</td>
                                        <td className="px-4 py-3">{row.dept}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${row.type === 'Thai sản' ? 'bg-pink-50 text-pink-600 border-pink-200' :
                                                row.type === 'Nghỉ phép' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                <i className={`fas ${row.type === 'Thai sản' ? 'fa-baby' : row.type === 'Nghỉ phép' ? 'fa-umbrella-beach' : 'fa-procedures'} text-[10px]`}></i>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-500">{row.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 opacity-80 pb-4">
                <span className="text-sm font-medium text-slate-600"><i className="fas fa-circle text-red-500 text-xs mr-2 border border-red-200 rounded-full"></i> Quá hạn / Sắp đến hạn rất gần</span>
                <span className="text-sm font-medium text-slate-600"><i className="fas fa-circle text-amber-500 text-xs mr-2 border border-amber-200 rounded-full"></i> Đến hạn trong 30 ngày / Sắp về hưu (12 tháng)</span>
                <span className="text-sm font-medium text-slate-600"><i className="fas fa-circle text-emerald-500 text-xs mr-2 border border-emerald-200 rounded-full"></i> Bình thường / Trong kế hoạch</span>
            </div>
        </div>
    )
}

export default HRReport
