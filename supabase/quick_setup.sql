-- ==========================================================
-- QUICK SETUP - Tạo các bảng cần thiết nhất
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- 1. TẠO BẢNG employee_profiles
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL,
    ho_va_ten TEXT,
    last_name TEXT,
    first_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    nationality TEXT DEFAULT 'Việt Nam',
    place_of_birth TEXT,
    ethnicity TEXT DEFAULT 'Kinh',
    religion TEXT DEFAULT 'Không',
    education_level TEXT,
    training_form TEXT,
    academic_level_code TEXT,
    marital_status_code INTEGER DEFAULT 1,
    card_number TEXT,
    permanent_address TEXT,
    temporary_address TEXT,
    hometown TEXT,
    phone TEXT,
    email_acv TEXT,
    email_personal TEXT,
    relative_phone TEXT,
    relative_relation TEXT DEFAULT 'Khác',
    decision_number TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    official_date DATE,
    department TEXT,
    team TEXT,
    group_name TEXT,
    current_position TEXT DEFAULT 'Nhân viên',
    status TEXT DEFAULT 'Thử việc',
    avatar_url TEXT,
    is_party_member BOOLEAN DEFAULT false,
    score_template_code TEXT DEFAULT 'NVTT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_employee_code ON public.employee_profiles(employee_code);
CREATE INDEX IF NOT EXISTS idx_employee_dept ON public.employee_profiles(department);

-- Thêm cột status nếu chưa có (cho trường hợp bảng đã được tạo từ migration khác)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN status TEXT DEFAULT 'Thử việc';
    END IF;
END $$;

-- Thêm cột rejection_reason vào bảng tasks nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Thêm cột academic_level_code vào bảng employee_profiles nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'academic_level_code'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN academic_level_code TEXT;
    END IF;
END $$;

-- Thêm các cột thông tin công việc còn thiếu
DO $$ 
BEGIN
    -- appointment_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'appointment_date'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN appointment_date DATE;
    END IF;

    -- job_position
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'job_position'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN job_position TEXT;
    END IF;

    -- labor_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'labor_type'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN labor_type TEXT;
    END IF;

    -- job_title
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'job_title'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN job_title TEXT;
    END IF;

    -- date_received_job_title
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'date_received_job_title'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN date_received_job_title DATE;
    END IF;

    -- concurrent_position
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'concurrent_position'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN concurrent_position TEXT;
    END IF;

    -- concurrent_job_title
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'concurrent_job_title'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN concurrent_job_title TEXT;
    END IF;

    -- concurrent_start_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'concurrent_start_date'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN concurrent_start_date DATE;
    END IF;

    -- concurrent_end_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'concurrent_end_date'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN concurrent_end_date DATE;
    END IF;

    -- leave_calculation_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'leave_calculation_type'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN leave_calculation_type TEXT DEFAULT 'Có cộng dồn';
    END IF;

    -- employee_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'employee_type'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN employee_type TEXT DEFAULT 'MB NVCT';
    END IF;
END $$;

-- 2. TẠO BẢNG user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level TEXT NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT,
    team_scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẠO BẢNG rbac_matrix
CREATE TABLE IF NOT EXISTS public.rbac_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_level TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_level, permission_key)
);

-- 4. ENABLE RLS
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_matrix ENABLE ROW LEVEL SECURITY;

-- 5. TẠO POLICIES (Cho phép đọc/ghi để test)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all" ON public.employee_profiles;
DROP POLICY IF EXISTS "Enable write access for all" ON public.employee_profiles;
DROP POLICY IF EXISTS "Enable read access for all" ON public.user_roles;
DROP POLICY IF EXISTS "Enable write access for all" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for all" ON public.rbac_matrix;
DROP POLICY IF EXISTS "Enable write access for all" ON public.rbac_matrix;

-- Create policies
CREATE POLICY "Enable read access for all" ON public.employee_profiles
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for all" ON public.employee_profiles
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all" ON public.user_roles
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for all" ON public.user_roles
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all" ON public.rbac_matrix
    FOR SELECT USING (true);

CREATE POLICY "Enable write access for all" ON public.rbac_matrix
    FOR ALL USING (true) WITH CHECK (true);

-- 6. TẠO ADMIN USER VÀ ROLE
-- Chỉ insert các cột bắt buộc, các cột khác sẽ dùng giá trị mặc định
INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, current_position, email_acv)
VALUES ('ADMIN', 'Quản trị', 'Hệ Thống', 'Văn phòng', 'Quản trị viên', 'admin@cangsanbay.vn')
ON CONFLICT (employee_code) DO UPDATE 
SET last_name = EXCLUDED.last_name,
    first_name = EXCLUDED.first_name,
    department = EXCLUDED.department,
    current_position = EXCLUDED.current_position,
    email_acv = EXCLUDED.email_acv;

INSERT INTO public.user_roles (employee_code, role_level)
VALUES ('ADMIN', 'SUPER_ADMIN')
ON CONFLICT (employee_code) DO UPDATE SET role_level = 'SUPER_ADMIN';

-- 7. SEED RBAC MATRIX
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true, 1),
    ('SUPER_ADMIN', 'tasks', true, true, true, 2),
    ('SUPER_ADMIN', 'calendar', true, true, true, 3),
    ('SUPER_ADMIN', 'grading', true, true, true, 4),
    ('SUPER_ADMIN', 'leaves', true, true, true, 5),
    ('SUPER_ADMIN', 'profiles', true, true, true, 6),
    ('SUPER_ADMIN', 'organization', true, true, true, 7),
    ('SUPER_ADMIN', 'settings', true, true, true, 8),
    ('STAFF', 'dashboard', true, false, false, 1),
    ('STAFF', 'tasks', true, false, false, 2),
    ('STAFF', 'calendar', true, false, false, 3),
    ('STAFF', 'profiles', true, false, false, 4)
ON CONFLICT (role_level, permission_key) DO UPDATE 
SET can_view = EXCLUDED.can_view, 
    can_edit = EXCLUDED.can_edit, 
    can_delete = EXCLUDED.can_delete;

-- 8. GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT '✅ Database setup completed!' as status;
