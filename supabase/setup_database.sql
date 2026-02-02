-- ==========================================================
-- SETUP DATABASE - CẢNG HÀNG KHÔNG
-- Run this SQL in Supabase Dashboard > SQL Editor
-- ==========================================================

-- ==========================================================
-- 20260127_create_employee_profiles.sql
-- ==========================================================

-- Create table for Employee Profiles (Lý lịch cá nhân)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL, -- Mã nhân viên
    card_number TEXT, -- Số thẻ
    avatar_url TEXT, -- Avatar
    last_name TEXT NOT NULL, -- Họ
    first_name TEXT NOT NULL, -- Tên
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')), -- Giới tính
    date_of_birth DATE, -- Ngày sinh
    nationality TEXT, -- Quốc tịch
    place_of_birth TEXT, -- Nơi sinh
    ethnicity TEXT, -- Dân tộc
    religion TEXT, -- Tôn giáo
    education_level TEXT CHECK (education_level IN ('10/12', '11/12', '12/12', '8/10', '9/10', '10/10', 'Khác')), -- Trình độ văn hoá
    training_form TEXT CHECK (training_form IN ('Phổ Thông', 'Bổ túc', 'Khác')), -- Hình thức đào tạo
    marital_status_code INTEGER CHECK (marital_status_code IN (1, 2, 3, 4)), -- Tình trạng hôn nhân (1: Độc thân, 2: Kết hôn, 3: Ly hôn, 4: Khác)
    academic_level_code TEXT CHECK (academic_level_code IN ('DH', 'CD', 'TS', 'TC', '12', 'Khác')), -- Trình độ học vấn
    
    -- 1.2 Thông tin liên hệ (Contact Info)
    permanent_address TEXT, -- Địa chỉ thường trú
    temporary_address TEXT, -- Nơi đăng ký tạm trú
    hometown TEXT, -- Quê quán
    phone TEXT, -- Điện thoại
    email_acv TEXT, -- Email ACV
    email_personal TEXT, -- Email cá nhân
    relative_phone TEXT, -- Số điện thoại người thân
    relative_relation TEXT CHECK (relative_relation IN ('Vợ-chồng', 'Bố-Mẹ', 'Anh-em', 'Con-Cháu', 'Khác')), -- Quan hệ
    
    -- 1.3 Thông tin công việc (Work Info)
    decision_number TEXT, -- Số QĐ
    join_date DATE, -- Ngày vào làm
    official_date DATE, -- Ngày thành NVCT
    job_position TEXT, -- Vị trí công việc
    department TEXT, -- Phòng
    team TEXT, -- Đội
    group_name TEXT, -- Tổ
    employee_type TEXT CHECK (employee_type IN ('MB NVCT', 'NVGT', 'NVTV', 'NVTT', 'CBQL')), -- Loại nhân viên
    labor_type TEXT, -- Loại lao động
    job_title TEXT, -- Chức danh công việc
    date_received_job_title DATE, -- Ngày nhận chức danh
    current_position TEXT CHECK (current_position IN ('Giám đốc', 'Phó giám đốc', 'Trưởng phòng', 'Phó trưởng phòng', 'Đội trưởng', 'Đội phó', 'Chủ đội', 'Tổ trưởng', 'Tổ phó', 'Chủ tổ', 'Khác')), -- Chức vụ hiện tại
    appointment_date DATE, -- Ngày bổ nhiệm
    concurrent_position TEXT, -- Chức vụ kiêm nhiệm
    concurrent_job_title TEXT, -- Chức danh kiêm nhiệm
    concurrent_start_date DATE, -- Thời gian kiêm nhiệm từ ngày
    concurrent_end_date DATE, -- Thời gian kiêm nhiệm đến ngày
    leave_calculation_type TEXT CHECK (leave_calculation_type IN ('Có cộng dồn', 'Không cộng dồn')), -- Đối tượng tính phép
    
    -- 1.5 Hồ sơ Đảng (Party Records)
    is_party_member BOOLEAN DEFAULT false, -- Là Đảng viên (checkbox)
    party_card_number TEXT, -- Số thẻ Đảng viên
    party_join_date DATE, -- Ngày kết nạp
    party_official_date DATE, -- Ngày chính thức
    party_position TEXT, -- Chức vụ Đảng
    party_activity_location TEXT, -- Nơi sinh hoạt
    political_education_level TEXT, -- Trình độ chính trị
    party_notes TEXT, -- Ghi chú
    
    -- 1.6 Đoàn thanh niên (Youth Union)
    is_youth_union_member BOOLEAN DEFAULT false, -- Là Đoàn thanh niên (checkbox)
    youth_union_card_number TEXT, -- Thẻ Đoàn viên
    youth_union_join_date DATE, -- Ngày vào Đoàn
    youth_union_join_location TEXT, -- Nơi vào Đoàn
    youth_union_position TEXT, -- Chức vụ Đoàn
    youth_union_activity_location TEXT, -- Nơi sinh hoạt Đoàn
    youth_union_notes TEXT, -- Ghi chú
    
    -- 1.7 Công Đoàn (Trade Union)
    is_trade_union_member BOOLEAN DEFAULT false, -- Là Công đoàn (checkbox)
    trade_union_card_number TEXT, -- Thẻ Công Đoàn
    trade_union_join_date DATE, -- Ngày vào Công đoàn
    trade_union_position TEXT, -- Chức vụ Công đoàn
    trade_union_activity_location TEXT, -- Nơi sinh hoạt Công đoàn
    trade_union_notes TEXT, -- Ghi chú
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for better documentation in Supabase UI
COMMENT ON COLUMN public.employee_profiles.employee_code IS 'Mã nhân viên';
COMMENT ON COLUMN public.employee_profiles.card_number IS 'Số thẻ';
COMMENT ON COLUMN public.employee_profiles.education_level IS 'Trình độ văn hoá: 10/12, 12/12...';
COMMENT ON COLUMN public.employee_profiles.marital_status_code IS '1: Độc thân, 2: Đã kết hôn, 3: Đã ly hôn, 4: Khác';
COMMENT ON COLUMN public.employee_profiles.academic_level_code IS 'DH: Đại học, CD: Cao đẳng, TS: Thạc sĩ, TC: Trung cấp, 12: Lớp 12';
COMMENT ON COLUMN public.employee_profiles.permanent_address IS 'Địa chỉ thường trú';
COMMENT ON COLUMN public.employee_profiles.temporary_address IS 'Nơi đăng ký tạm trú';
COMMENT ON COLUMN public.employee_profiles.hometown IS 'Quê quán';
COMMENT ON COLUMN public.employee_profiles.phone IS 'Điện thoại';
COMMENT ON COLUMN public.employee_profiles.email_acv IS 'Email công ty ACV';
COMMENT ON COLUMN public.employee_profiles.email_personal IS 'Email cá nhân';
COMMENT ON COLUMN public.employee_profiles.relative_phone IS 'Số điện thoại người thân';
COMMENT ON COLUMN public.employee_profiles.relative_relation IS 'Quan hệ: Vợ-chồng, Bố-Mẹ, Anh-em, Con-Cháu, Khác';
COMMENT ON COLUMN public.employee_profiles.decision_number IS 'Số QĐ';
COMMENT ON COLUMN public.employee_profiles.join_date IS 'Ngày vào làm';
COMMENT ON COLUMN public.employee_profiles.official_date IS 'Ngày thành NVCT';
COMMENT ON COLUMN public.employee_profiles.job_title IS 'Chức danh công việc';
COMMENT ON COLUMN public.employee_profiles.date_received_job_title IS 'Ngày nhận chức danh';
COMMENT ON COLUMN public.employee_profiles.employee_type IS 'MB NVCT: Nhân viên chính thức, NVGT: Gián tiếp, NVTV: Thời vụ, NVTT: Trực tiếp, CBQL: Cán bộ quản lý';
COMMENT ON COLUMN public.employee_profiles.current_position IS 'Chức vụ hiện tại';
COMMENT ON COLUMN public.employee_profiles.appointment_date IS 'Ngày bổ nhiệm';
COMMENT ON COLUMN public.employee_profiles.concurrent_job_title IS 'Chức danh kiêm nhiệm';
COMMENT ON COLUMN public.employee_profiles.leave_calculation_type IS 'Đối tượng tính phép: Có cộng dồn hoặc Không cộng dồn';
COMMENT ON COLUMN public.employee_profiles.is_party_member IS 'Là Đảng viên hay không';
COMMENT ON COLUMN public.employee_profiles.party_card_number IS 'Số thẻ Đảng viên';
COMMENT ON COLUMN public.employee_profiles.party_join_date IS 'Ngày kết nạp Đảng';
COMMENT ON COLUMN public.employee_profiles.party_official_date IS 'Ngày chính thức là Đảng viên';
COMMENT ON COLUMN public.employee_profiles.party_position IS 'Chức vụ trong Đảng';
COMMENT ON COLUMN public.employee_profiles.party_activity_location IS 'Nơi sinh hoạt Đảng';
COMMENT ON COLUMN public.employee_profiles.political_education_level IS 'Trình độ chính trị';
COMMENT ON COLUMN public.employee_profiles.party_notes IS 'Ghi chú về hồ sơ Đảng';
COMMENT ON COLUMN public.employee_profiles.is_youth_union_member IS 'Là Đoàn viên thanh niên hay không';
COMMENT ON COLUMN public.employee_profiles.youth_union_card_number IS 'Thẻ Đoàn viên';
COMMENT ON COLUMN public.employee_profiles.youth_union_join_date IS 'Ngày vào Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_join_location IS 'Nơi vào Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_position IS 'Chức vụ trong Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_activity_location IS 'Nơi sinh hoạt Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_notes IS 'Ghi chú về Đoàn thanh niên';
COMMENT ON COLUMN public.employee_profiles.is_trade_union_member IS 'Là Công đoàn viên hay không';
COMMENT ON COLUMN public.employee_profiles.trade_union_card_number IS 'Thẻ Công Đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_join_date IS 'Ngày vào Công đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_position IS 'Chức vụ trong Công đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_activity_location IS 'Nơi sinh hoạt Công đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_notes IS 'Ghi chú về Công đoàn';

-- Enable Row Level Security (RLS)
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all profiles (Adjust specific rules as needed)
CREATE POLICY "Enable read access for authenticated users" ON public.employee_profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert/update (Adjust specific rules as needed)
CREATE POLICY "Enable write access for authenticated users" ON public.employee_profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- ==========================================================
-- 20260201_create_rbac_matrix_roles.sql
-- ==========================================================

-- Migration: Matrix-Based RBAC Hierarchy (5 Levels)

-- 1. Create Role Enum
DO $$ BEGIN
    CREATE TYPE public.rbac_role_level AS ENUM (
        'SUPER_ADMIN',    -- L1
        'BOARD_DIRECTOR', -- L2
        'DEPT_HEAD',      -- L3
        'TEAM_LEADER',    -- L4
        'STAFF'           -- L5
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level public.rbac_role_level NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, -- The name of the department (for L3/L4)
    team_scope TEXT, -- The name of the team (for L4)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Initially, allow all authenticated users to read roles (for frontend checks)
CREATE POLICY "Public read for authenticated users" ON public.user_roles
    FOR SELECT TO authenticated USING (true);

-- Super admin can manage everything (if we have an initial super admin)
CREATE POLICY "Super admin manage all" ON public.user_roles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE employee_code = (auth.jwt() ->> 'employee_code') 
            AND role_level = 'SUPER_ADMIN'
        )
    );

-- 5. Seed an initial Super Admin (using the 'ADMIN' code if it exists)
INSERT INTO public.user_roles (employee_code, role_level)
SELECT 'ADMIN', 'SUPER_ADMIN'
FROM public.employee_profiles
WHERE employee_code = 'ADMIN'
ON CONFLICT (employee_code) DO UPDATE SET role_level = 'SUPER_ADMIN';

-- 6. Comments
COMMENT ON TABLE public.user_roles IS 'Stores the system access level and organizational scope for each employee.';


-- ==========================================================
-- 20260201_create_dynamic_rbac_matrix.sql
-- ==========================================================

-- Migration: Dynamic RBAC Matrix (Zero Hardcoding)

-- 1. Create Role Level Enum (If not exists)
DO $$ BEGIN
    CREATE TYPE public.rbac_role_level AS ENUM (
        'SUPER_ADMIN',    -- L1
        'BOARD_DIRECTOR', -- L2
        'DEPT_HEAD',      -- L3
        'TEAM_LEADER',    -- L4
        'STAFF'           -- L5
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create User Roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level public.rbac_role_level NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, 
    team_scope TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Dynamic Permission Matrix table
CREATE TABLE IF NOT EXISTS public.rbac_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_level public.rbac_role_level NOT NULL,
    permission_key TEXT NOT NULL, -- e.g., 'dashboard', 'grading'
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_level, permission_key)
);

-- 4. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_matrix ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Public read for roles/matrix to check permissions on front-end
CREATE POLICY "Public read for authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read matrix for authenticated" ON public.rbac_matrix FOR SELECT TO authenticated USING (true);

-- Super Admin management
CREATE POLICY "Super admin manage matrix" ON public.rbac_matrix FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE employee_code = (auth.jwt() ->> 'employee_code') AND role_level = 'SUPER_ADMIN'));

-- 6. Seed Default Matrix (Initial Setup)
-- SUPER_ADMIN (Full Access)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true),
    ('SUPER_ADMIN', 'tasks', true, true, true),
    ('SUPER_ADMIN', 'calendar', true, true, true),
    ('SUPER_ADMIN', 'grading', true, true, true),
    ('SUPER_ADMIN', 'leaves', true, true, true),
    ('SUPER_ADMIN', 'profiles', true, true, true),
    ('SUPER_ADMIN', 'organization', true, true, true),
    ('SUPER_ADMIN', 'settings', true, true, true)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true, can_edit = true, can_delete = true;

-- BOARD_DIRECTOR (Global View)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('BOARD_DIRECTOR', 'dashboard', true, false, false),
    ('BOARD_DIRECTOR', 'tasks', true, false, false),
    ('BOARD_DIRECTOR', 'profiles', true, false, false),
    ('BOARD_DIRECTOR', 'grading', true, false, false),
    ('BOARD_DIRECTOR', 'settings', true, false, false)
ON CONFLICT (role_level, permission_key) DO NOTHING;

-- DEPT_HEAD (Dept Scope)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('DEPT_HEAD', 'profiles', true, true, false),
    ('DEPT_HEAD', 'grading', true, true, false),
    ('DEPT_HEAD', 'leaves', true, true, false)
ON CONFLICT (role_level, permission_key) DO NOTHING;

-- 7. Seed Initial Admin
INSERT INTO public.user_roles (employee_code, role_level)
SELECT 'ADMIN', 'SUPER_ADMIN'
FROM public.employee_profiles
WHERE employee_code = 'ADMIN'
ON CONFLICT (employee_code) DO UPDATE SET role_level = 'SUPER_ADMIN';

-- Comments
COMMENT ON TABLE public.rbac_matrix IS 'The master permission matrix configured by administrators.';


-- ==========================================================
-- INITIAL CONFIG
-- ==========================================================

-- ==========================================================
-- PRODUCTION INITIAL CONFIG - CẢNG HÀNG KHÔNG
-- Version: 1.0.0
-- Description: Cấu hình mặc định cho hệ thống (RBAC & Admin)
-- ==========================================================

-- 1. THIẾT LẬP MA TRẬN QUYỀN HẠN (Mặc định)
-- Cấp cao nhất: SUPER_ADMIN (Toàn quyền)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true, 1),
    ('SUPER_ADMIN', 'tasks', true, true, true, 2),
    ('SUPER_ADMIN', 'calendar', true, true, true, 3),
    ('SUPER_ADMIN', 'grading', true, true, true, 4),
    ('SUPER_ADMIN', 'leaves', true, true, true, 5),
    ('SUPER_ADMIN', 'profiles', true, true, true, 6),
    ('SUPER_ADMIN', 'organization', true, true, true, 7),
    ('SUPER_ADMIN', 'settings', true, true, true, 8)
ON CONFLICT (role_level, permission_key) DO UPDATE 
SET can_view = EXCLUDED.can_view, can_edit = EXCLUDED.can_edit, can_delete = EXCLUDED.can_delete;

-- Vai trò Lãnh đạo: BOARD_DIRECTOR
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('BOARD_DIRECTOR', 'dashboard', true, false, false, 1),
    ('BOARD_DIRECTOR', 'tasks', true, false, false, 2),
    ('BOARD_DIRECTOR', 'profiles', true, false, false, 3),
    ('BOARD_DIRECTOR', 'organization', true, false, false, 4)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true;

-- Vai trò Quản lý: DEPT_HEAD
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('DEPT_HEAD', 'tasks', true, true, false, 1),
    ('DEPT_HEAD', 'grading', true, true, false, 2),
    ('DEPT_HEAD', 'profiles', true, true, false, 3)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true, can_edit = true;

-- Vai trò Nhân viên: STAFF
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('STAFF', 'tasks', true, false, false, 1),
    ('STAFF', 'calendar', true, false, false, 2),
    ('STAFF', 'profiles', true, false, false, 3)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true;

-- 2. TẠO TÀI KHOẢN QUẢN TRỊ VIÊN ĐẦU TIÊN (ADMIN)
-- Lưu ý: Thực tế nên thay đổi email và mã nhân viên này
INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, current_position, email_acv, avatar_url)
VALUES ('ADMIN', 'Quản trị', 'Hệ Thống', 'Văn phòng', 'Quản trị viên', 'admin@cangsanbay.vn', 'https://i.pravatar.cc/150?u=admin')
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO public.user_roles (employee_code, role_level)
VALUES ('ADMIN', 'SUPER_ADMIN')
ON CONFLICT (employee_code) DO NOTHING;

-- 3. THÔNG BÁO HOÀN TẤT
SELECT 'CẤU HÌNH PRODUCTION ĐÃ SẴN SÀNG!' as status;


