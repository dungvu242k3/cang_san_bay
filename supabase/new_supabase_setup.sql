-- ==========================================================
-- 🚀 NEW SUPABASE SETUP - CẢNG HÀNG KHÔNG
-- ==========================================================
-- Chạy file này trong Supabase Dashboard > SQL Editor khi:
--   1. Tạo project Supabase mới
--   2. Chuyển sang Supabase project khác
--
-- ⚠️ LƯU Ý: File này tạo bảng mới, KHÔNG XOÁ dữ liệu cũ.
--            Nếu project đã có bảng, sẽ dùng IF NOT EXISTS.
--
-- 📋 HƯỚNG DẪN:
--   Bước 1: Copy toàn bộ file này
--   Bước 2: Vào Supabase Dashboard > SQL Editor > New Query
--   Bước 3: Paste và nhấn "Run"
--   Bước 4: Cập nhật file .env với URL và Key mới:
--           VITE_SUPABASE_URL=https://xxx.supabase.co
--           VITE_SUPABASE_ANON_KEY=xxx
--   Bước 5: Đăng nhập với ADMIN / 123456
-- ==========================================================


-- ==========================================
-- PHẦN 1: EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ==========================================
-- PHẦN 2: BẢNG CHÍNH - employee_profiles
-- ==========================================
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
    job_position TEXT,
    department TEXT,
    team TEXT,
    group_name TEXT,
    employee_type TEXT DEFAULT 'MB NVCT',
    labor_type TEXT,
    job_title TEXT,
    date_received_job_title DATE,
    current_position TEXT DEFAULT 'Nhân viên',
    appointment_date DATE,
    concurrent_position TEXT,
    concurrent_job_title TEXT,
    concurrent_start_date DATE,
    concurrent_end_date DATE,
    leave_calculation_type TEXT DEFAULT 'Có cộng dồn',
    status TEXT DEFAULT 'Đang làm việc',
    avatar_url TEXT,
    is_party_member BOOLEAN DEFAULT false,
    party_card_number TEXT,
    party_join_date DATE,
    party_official_date DATE,
    party_position TEXT,
    party_activity_location TEXT,
    political_education_level TEXT,
    party_notes TEXT,
    is_youth_union_member BOOLEAN DEFAULT false,
    youth_union_card_number TEXT,
    youth_union_join_date DATE,
    youth_union_join_location TEXT,
    youth_union_position TEXT,
    youth_union_activity_location TEXT,
    youth_union_notes TEXT,
    is_trade_union_member BOOLEAN DEFAULT false,
    trade_union_card_number TEXT,
    trade_union_join_date DATE,
    trade_union_position TEXT,
    trade_union_activity_location TEXT,
    trade_union_notes TEXT,
    identity_card_number TEXT,
    identity_card_issue_date DATE,
    identity_card_issue_place TEXT,
    tax_code TEXT,
    health_insurance_number TEXT,
    health_insurance_issue_date DATE,
    health_insurance_place TEXT,
    social_insurance_number TEXT,
    social_insurance_issue_date DATE,
    unemployment_insurance_number TEXT,
    unemployment_insurance_issue_date DATE,
    score_template_code TEXT DEFAULT 'NVTT',
    note TEXT,
    number_of_dependents INTEGER DEFAULT 0,
    bo_phan TEXT,
    to_doi TEXT,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employee_code ON public.employee_profiles(employee_code);
CREATE INDEX IF NOT EXISTS idx_employee_dept ON public.employee_profiles(department);


-- ==========================================
-- PHẦN 3: BẢNG PHÂN QUYỀN
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level TEXT NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT,
    team_scope TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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


-- ==========================================
-- PHẦN 4: CÁC BẢNG NGHIỆP VỤ
-- ==========================================

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Trung bình',
    due_date DATE,
    status TEXT DEFAULT 'Mới',
    progress INTEGER DEFAULT 0,
    rejection_reason TEXT,
    created_by TEXT REFERENCES public.employee_profiles(employee_code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    assignee_code TEXT NOT NULL,
    assignee_type TEXT DEFAULT 'PERSON',
    role TEXT DEFAULT 'PRIMARY',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    sender_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    uploaded_by TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    is_all_day BOOLEAN DEFAULT true,
    location TEXT,
    event_type TEXT DEFAULT 'Họp',
    scope TEXT DEFAULT 'Personal',
    created_by TEXT REFERENCES public.employee_profiles(employee_code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Leaves
CREATE TABLE IF NOT EXISTS public.employee_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    leave_type TEXT DEFAULT 'Nghỉ phép năm',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    leave_days DECIMAL(4,1),
    reason TEXT,
    status TEXT DEFAULT 'Chờ duyệt',
    approved_by TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department Leave Settings
CREATE TABLE IF NOT EXISTS public.department_leave_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department TEXT NOT NULL UNIQUE,
    annual_leave_days INTEGER NOT NULL DEFAULT 12,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Discussions
CREATE TABLE IF NOT EXISTS public.team_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team TEXT NOT NULL,
    sender_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    relationship TEXT,
    date_of_birth DATE,
    occupation TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    review_period TEXT,
    score DECIMAL(5,2),
    grade TEXT,
    reviewer_code TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labor Contracts
CREATE TABLE IF NOT EXISTS public.labor_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    contract_number TEXT,
    contract_type TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Đang hiệu lực',
    note TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending Profile Changes
CREATE TABLE IF NOT EXISTS public.pending_profile_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    status TEXT DEFAULT 'pending',
    requested_by TEXT,
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duty Schedules
CREATE TABLE IF NOT EXISTS public.duty_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    shift_type TEXT,
    note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (Library)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications 
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    target_code TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Import Audit
CREATE TABLE IF NOT EXISTS public.import_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    import_type TEXT NOT NULL,
    file_name TEXT,
    records_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed',
    imported_by TEXT,
    errors JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    representative_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_code TEXT UNIQUE,
    order_type TEXT,
    customer_id UUID REFERENCES public.customers(id),
    warehouse_id TEXT,
    recipient_name TEXT,
    recipient_phone TEXT,
    department TEXT,
    status TEXT DEFAULT 'Mới',
    note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goods Receipts
CREATE TABLE IF NOT EXISTS public.goods_receipts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    receipt_code TEXT UNIQUE,
    warehouse_id TEXT,
    supplier TEXT,
    receipt_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Mới',
    note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- PHẦN 5: INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_team_discussions_team ON public.team_discussions(team);
CREATE INDEX IF NOT EXISTS idx_team_discussions_created_at ON public.team_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_department_leave_settings_dept ON public.department_leave_settings(department);


-- ==========================================
-- PHẦN 6: ROW LEVEL SECURITY (RLS)
-- ==========================================
-- ⚠️ QUAN TRỌNG: App dùng anon key (không dùng Supabase Auth)
-- nên phải cho phép cả role "anon" truy cập.
-- Dùng policy đơn giản "Allow All" cho tất cả bảng.

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN (
            'employee_profiles', 'user_roles', 'rbac_matrix',
            'tasks', 'task_assignments', 'task_comments', 'task_attachments',
            'events', 'employee_leaves', 'department_leave_settings',
            'team_discussions', 'family_members', 'performance_reviews',
            'labor_contracts', 'pending_profile_changes', 'duty_schedules',
            'documents', 'notifications', 'import_audit',
            'warehouses', 'customers', 'orders', 'goods_receipts'
        )
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- Drop existing policies
        EXECUTE format('DROP POLICY IF EXISTS "Allow All" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Enable write access for all" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.%I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.%I', tbl);
        
        -- Create simple "Allow All" policy (cho cả anon + authenticated)
        EXECUTE format('CREATE POLICY "Allow All" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;


-- ==========================================
-- PHẦN 7: HÀM XÁC THỰC (AUTH FUNCTIONS)
-- ==========================================

-- Hàm xác thực đăng nhập
CREATE OR REPLACE FUNCTION verify_user_password(p_employee_code TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stored_password TEXT;
BEGIN
    SELECT password INTO v_stored_password
    FROM public.employee_profiles
    WHERE employee_code = p_employee_code;

    IF v_stored_password IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Plain text (mật khẩu mặc định '123456')
    IF length(v_stored_password) < 60 THEN
        RETURN v_stored_password = p_password;
    END IF;

    -- Bcrypt hash
    RETURN crypt(p_password, v_stored_password) = v_stored_password;
END;
$$;

-- Hàm đổi mật khẩu (hash bcrypt)
CREATE OR REPLACE FUNCTION update_user_password(p_employee_code TEXT, p_new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.employee_profiles WHERE employee_code = p_employee_code) THEN
        RETURN FALSE;
    END IF;

    UPDATE public.employee_profiles
    SET password = crypt(p_new_password, gen_salt('bf'))
    WHERE employee_code = p_employee_code;

    RETURN TRUE;
END;
$$;


-- ==========================================
-- PHẦN 8: TẠO TÀI KHOẢN ADMIN
-- ==========================================
INSERT INTO public.employee_profiles (
    employee_code, last_name, first_name, 
    department, current_position, status,
    email_acv, password
)
VALUES (
    'ADMIN', 'Quản trị', 'Hệ Thống',
    'Ban Giám đốc', 'Giám đốc', 'Đang làm việc',
    'admin@cangsanbay.vn', '123456'
)
ON CONFLICT (employee_code) DO UPDATE SET
    password = COALESCE(NULLIF(employee_profiles.password, ''), '123456'),
    status = 'Đang làm việc';

INSERT INTO public.user_roles (employee_code, role_level)
VALUES ('ADMIN', 'SUPER_ADMIN')
ON CONFLICT (employee_code) DO UPDATE SET role_level = 'SUPER_ADMIN';


-- ==========================================
-- PHẦN 9: SEED MA TRẬN QUYỀN HẠN (RBAC)
-- ==========================================
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    -- SUPER_ADMIN (Toàn quyền)
    ('SUPER_ADMIN', 'dashboard', true, true, true, 1),
    ('SUPER_ADMIN', 'tasks', true, true, true, 2),
    ('SUPER_ADMIN', 'calendar', true, true, true, 3),
    ('SUPER_ADMIN', 'grading', true, true, true, 4),
    ('SUPER_ADMIN', 'leaves', true, true, true, 5),
    ('SUPER_ADMIN', 'profiles', true, true, true, 6),
    ('SUPER_ADMIN', 'organization', true, true, true, 7),
    ('SUPER_ADMIN', 'settings', true, true, true, 8),
    -- BOARD_DIRECTOR
    ('BOARD_DIRECTOR', 'dashboard', true, false, false, 1),
    ('BOARD_DIRECTOR', 'tasks', true, false, false, 2),
    ('BOARD_DIRECTOR', 'profiles', true, false, false, 3),
    ('BOARD_DIRECTOR', 'organization', true, false, false, 4),
    -- DEPT_HEAD
    ('DEPT_HEAD', 'tasks', true, true, false, 1),
    ('DEPT_HEAD', 'grading', true, true, false, 2),
    ('DEPT_HEAD', 'profiles', true, true, false, 3),
    ('DEPT_HEAD', 'leaves', true, true, false, 4),
    -- TEAM_LEADER
    ('TEAM_LEADER', 'tasks', true, true, false, 1),
    ('TEAM_LEADER', 'profiles', true, true, false, 2),
    -- STAFF
    ('STAFF', 'dashboard', true, false, false, 1),
    ('STAFF', 'tasks', true, false, false, 2),
    ('STAFF', 'calendar', true, false, false, 3),
    ('STAFF', 'profiles', true, false, false, 4)
ON CONFLICT (role_level, permission_key) DO UPDATE 
SET can_view = EXCLUDED.can_view, 
    can_edit = EXCLUDED.can_edit, 
    can_delete = EXCLUDED.can_delete;


-- ==========================================
-- PHẦN 10: STORAGE BUCKETS
-- ==========================================
-- Tạo bucket cho avatars (nếu chưa có)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Tạo bucket cho task attachments (nếu chưa có)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
    -- Avatars
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read avatars' AND tablename = 'objects') THEN
        CREATE POLICY "Allow public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow upload avatars' AND tablename = 'objects') THEN
        CREATE POLICY "Allow upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow update avatars' AND tablename = 'objects') THEN
        CREATE POLICY "Allow update avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete avatars' AND tablename = 'objects') THEN
        CREATE POLICY "Allow delete avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
    END IF;
    
    -- Task attachments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read task-attachments' AND tablename = 'objects') THEN
        CREATE POLICY "Allow public read task-attachments" ON storage.objects FOR SELECT USING (bucket_id = 'task-attachments');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow upload task-attachments' AND tablename = 'objects') THEN
        CREATE POLICY "Allow upload task-attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'task-attachments');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete task-attachments' AND tablename = 'objects') THEN
        CREATE POLICY "Allow delete task-attachments" ON storage.objects FOR DELETE USING (bucket_id = 'task-attachments');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Storage policies skipped (may already exist): %', SQLERRM;
END $$;


-- ==========================================
-- PHẦN 11: KIỂM TRA KẾT QUẢ
-- ==========================================
SELECT '✅ SETUP HOÀN TẤT!' as status;
SELECT 'Đăng nhập: ADMIN / 123456' as hint;
SELECT employee_code, first_name, last_name, current_position, status, 
       CASE WHEN password IS NOT NULL THEN '✅ Có' ELSE '❌ Không' END as has_password
FROM public.employee_profiles WHERE employee_code = 'ADMIN';
