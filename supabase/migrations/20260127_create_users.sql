-- Create table for Users (main employee table)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT, -- Họ và tên
    email TEXT UNIQUE,
    phone TEXT, -- Số điện thoại
    branch TEXT, -- Chi nhánh
    department TEXT, -- Phòng/Bộ phận
    position TEXT, -- Vị trí/Chức vụ
    employment_status TEXT DEFAULT 'Thử việc', -- Trạng thái: Thử việc, Đang làm việc, Đã nghỉ việc
    status TEXT DEFAULT 'Đang làm việc', -- Deprecated: use employment_status instead
    shift TEXT, -- Ca làm việc
    join_date DATE, -- Ngày vào làm
    official_date DATE, -- Ngày làm chính thức
    cccd TEXT, -- CCCD/CMND
    identity_issue_date DATE, -- Ngày cấp CCCD
    identity_issue_place TEXT, -- Nơi cấp CCCD
    address TEXT, -- Địa chỉ thường trú
    hometown TEXT, -- Quê quán
    dob DATE, -- Ngày sinh
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')), -- Giới tính
    marital_status TEXT, -- Tình trạng hôn nhân
    avatar_url TEXT, -- Avatar URL
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'user')), -- Vai trò
    employee_id TEXT UNIQUE, -- Mã nhân viên (legacy field)
    ma_nhan_vien TEXT UNIQUE, -- Mã nhân viên
    so_the TEXT, -- Số thẻ
    sdt TEXT, -- Số điện thoại (legacy)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.users IS 'Bảng nhân viên chính';
COMMENT ON COLUMN public.users.username IS 'Tên đăng nhập';
COMMENT ON COLUMN public.users.name IS 'Họ và tên đầy đủ';
COMMENT ON COLUMN public.users.email IS 'Email';
COMMENT ON COLUMN public.users.phone IS 'Số điện thoại';
COMMENT ON COLUMN public.users.branch IS 'Chi nhánh';
COMMENT ON COLUMN public.users.department IS 'Phòng/Bộ phận';
COMMENT ON COLUMN public.users.position IS 'Vị trí/Chức vụ';
COMMENT ON COLUMN public.users.employment_status IS 'Trạng thái làm việc: Thử việc, Đang làm việc, Đã nghỉ việc';
COMMENT ON COLUMN public.users.join_date IS 'Ngày vào làm';
COMMENT ON COLUMN public.users.official_date IS 'Ngày làm chính thức';
COMMENT ON COLUMN public.users.cccd IS 'Số CCCD/CMND';
COMMENT ON COLUMN public.users.identity_issue_date IS 'Ngày cấp CCCD';
COMMENT ON COLUMN public.users.identity_issue_place IS 'Nơi cấp CCCD';
COMMENT ON COLUMN public.users.address IS 'Địa chỉ thường trú';
COMMENT ON COLUMN public.users.hometown IS 'Quê quán';
COMMENT ON COLUMN public.users.dob IS 'Ngày sinh';
COMMENT ON COLUMN public.users.gender IS 'Giới tính';
COMMENT ON COLUMN public.users.marital_status IS 'Tình trạng hôn nhân';
COMMENT ON COLUMN public.users.role IS 'Vai trò: admin, staff, user';

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable write access for authenticated users" ON public.users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(employment_status);
CREATE INDEX IF NOT EXISTS idx_users_ma_nhan_vien ON public.users(ma_nhan_vien);
