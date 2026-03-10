// File chứa dữ liệu giả cho Dashboard Báo cáo

export const mockProductionData = [
    { name: 'T1', value: 400 },
    { name: 'T2', value: 300 },
    { name: 'T3', value: 550 },
    { name: 'T4', value: 450 },
    { name: 'T5', value: 700 },
    { name: 'T6', value: 650 },
    { name: 'T7', value: 800 },
    { name: 'T8', value: 750 },
    { name: 'T9', value: 900 },
    { name: 'T10', value: 850 },
    { name: 'T11', value: 1100 },
    { name: 'T12', value: 1250 },
];

export const mockFinanceData = [
    { name: 'T1', revenue: 4000, expense: 2400 },
    { name: 'T2', revenue: 3000, expense: 1398 },
    { name: 'T3', revenue: 2000, expense: 2800 },
    { name: 'T4', revenue: 2780, expense: 1908 },
    { name: 'T5', revenue: 1890, expense: 1400 },
    { name: 'T6', revenue: 2390, expense: 1800 },
    { name: 'T7', revenue: 3490, expense: 2100 },
    { name: 'T8', revenue: 4200, expense: 2500 },
    { name: 'T9', revenue: 3800, expense: 2300 },
    { name: 'T10', revenue: 4500, expense: 2600 },
    { name: 'T11', revenue: 5100, expense: 2800 },
    { name: 'T12', revenue: 6000, expense: 3200 },
];

export const mockHRData = [
    { name: 'Khối Kỹ thuật', value: 60, color: '#3b82f6' }, // blue-500
    { name: 'Khối Khai thác', value: 45, color: '#10b981' }, // emerald-500
    { name: 'Khối Văn phòng', value: 25, color: '#8b5cf6' }, // purple-500
    { name: 'Khởi Khác', value: 12, color: '#f59e0b' }, // amber-500
];

export const mockOverviewStats = {
    production: {
        total: "12,500",
        unit: "Mã hàng",
        growth: "+15%",
        isPositive: true,
        label: "Tổng sản lượng YTD"
    },
    finance: {
        total: "42.5",
        unit: "Tỷ VNĐ",
        growth: "+12.5%",
        isPositive: true,
        label: "Doanh thu YTD"
    },
    hr: {
        total: "142",
        unit: "Nhân sự",
        growth: "+2.1%",
        isPositive: true,
        label: "Tổng số nhân sự"
    }
};
