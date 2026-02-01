-- Migration: Recreate employee_leaves table with Foreign Key
-- Description: Drops existing table and recreates it with better constraints

DROP TABLE IF EXISTS employee_leaves;

CREATE TABLE employee_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL REFERENCES employee_profiles(employee_code),
    leave_type TEXT,
    reason TEXT,
    from_date DATE,
    to_date DATE,
    leave_days NUMERIC(5,1),
    total_deducted NUMERIC(5,1),
    remaining_leave NUMERIC(5,1),
    status TEXT DEFAULT 'Chờ duyệt',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_leaves ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (Simplified for demo)
CREATE POLICY "Allow public access to employee_leaves"
ON employee_leaves FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_leaves_employee_code ON employee_leaves(employee_code);

-- Optional: Create dummy profiles first to ensure FK constraints are met
INSERT INTO employee_profiles (employee_code, first_name, last_name, email_acv)
VALUES 
('NV001', 'An', 'Nguyễn Văn', 'an.nguyen@example.com'),
('NV002', 'Bình', 'Trần Thị', 'binh.tran@example.com'),
('NV003', 'Cường', 'Lê Hùng', 'cuong.le@example.com'),
('NV004', 'Dung', 'Phạm Thị', 'dung.pham@example.com'),
('NV005', 'Em', 'Hoàng Văn', 'em.hoang@example.com')
ON CONFLICT (employee_code) DO NOTHING;

-- Optional: Re-seed basic data to verify connection immediately
INSERT INTO employee_leaves (employee_code, leave_type, from_date, to_date, leave_days, reason, status, note)
VALUES 
('NV001', 'Nghỉ phép năm', '2024-02-10', '2024-02-12', 3.0, 'Về quê ăn tết', 'Đã duyệt', 'Đã bàn giao công việc'),
('NV002', 'Nghỉ ốm', '2024-01-15', '2024-01-15', 1.0, 'Sốt cao', 'Đã duyệt', 'Có giấy bác sĩ'),
('NV003', 'Nghỉ không lương', '2024-03-01', '2024-03-05', 5.0, 'Giải quyết việc gia đình', 'Chờ duyệt', NULL),
('NV004', 'Nghỉ phép năm', '2024-04-30', '2024-05-01', 2.0, 'Du lịch hè', 'Chờ duyệt', NULL),
('NV001', 'Nghỉ chế độ', '2023-12-01', '2023-12-03', 3.0, 'Cưới em gái', 'Đã duyệt', NULL),
('NV005', 'Nghỉ phép năm', '2024-02-15', '2024-02-16', 2.0, 'Nghỉ dưỡng sức', 'Từ chối', 'Thiếu nhân sự đợt cao điểm');
