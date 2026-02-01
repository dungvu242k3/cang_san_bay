-- ==========================================================
-- MASTER PRODUCTION SCHEMA - CẢNG HÀNG KHÔNG
-- Version: 1.0.0
-- Description: Cấu trúc Database chuẩn sản xuất, đầy đủ ràng buộc
-- ==========================================================

-- 0. DỌN DẸP (Cẩn trọng khi chạy lệnh này trên Production thật)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- 1. BẢNG HỒ SƠ NHÂN VIÊN (Dữ liệu cốt lõi)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL, -- Mã định danh duy nhất (CBAxxxx)
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
    department TEXT, -- Phòng
    team TEXT, -- Đội
    group_name TEXT,
    current_position TEXT DEFAULT 'Nhân viên',
    status TEXT DEFAULT 'Thử việc',
    avatar_url TEXT,
    is_party_member BOOLEAN DEFAULT false,
    score_template_code TEXT DEFAULT 'NVTT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_employee_code ON public.employee_profiles(employee_code);
CREATE INDEX IF NOT EXISTS idx_employee_dept ON public.employee_profiles(department);

-- 2. BẢNG PHÂN QUYỀN (RBAC)
CREATE TABLE IF NOT EXISTS public.rbac_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_level TEXT NOT NULL, -- SUPER_ADMIN, BOARD_DIRECTOR, DEPT_HEAD, TEAM_LEADER, STAFF
    permission_key TEXT NOT NULL, -- dashboard, tasks, grading, settings, etc.
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_level, permission_key)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level TEXT NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, -- Giới hạn quyền trong phòng
    team_scope TEXT, -- Giới hạn quyền trong đội
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUẢN LÝ CÔNG VIỆC
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Trung bình', -- Thấp, Trung bình, Cao, Khẩn cấp
    due_date DATE,
    status TEXT DEFAULT 'Mới', -- Mới, Đang thực hiện, Hoàn thành, Tạm dừng, Hủy
    progress INTEGER DEFAULT 0,
    created_by TEXT REFERENCES public.employee_profiles(employee_code) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    assignee_code TEXT NOT NULL, -- Mã NV hoặc Tên Phòng tùy theo assignee_type
    assignee_type TEXT NOT NULL DEFAULT 'PERSON', -- PERSON, DEPARTMENT
    role TEXT NOT NULL DEFAULT 'PRIMARY', -- PRIMARY (Xử lý chính), COLLAB (Phối hợp)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUẢN LÝ NGHỈ PHÉP
CREATE TABLE IF NOT EXISTS public.employee_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    leave_type TEXT NOT NULL DEFAULT 'Nghỉ phép năm',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    leave_days DECIMAL(4,1) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Chờ duyệt', -- Chờ duyệt, Đã duyệt, Từ chối
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LỊCH CÔNG TÁC & SỰ KIỆN
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    is_all_day BOOLEAN DEFAULT true,
    location TEXT,
    event_type TEXT DEFAULT 'Họp', -- Họp, Sự kiện, Sinh nhật, v.v.
    scope TEXT DEFAULT 'Personal', -- Personal, Unit, Office, Company
    created_by TEXT REFERENCES public.employee_profiles(employee_code) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ĐÁNH GIÁ KPI & PERFORMANCE
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Định dạng YYYY-MM
    self_assessment JSONB, -- Lưu trữ mảng các tiêu chí chấm điểm
    supervisor_assessment JSONB,
    self_comment TEXT,
    supervisor_comment TEXT,
    self_total_score INTEGER,
    self_grade TEXT,
    supervisor_total_score INTEGER,
    supervisor_grade TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_code, month)
);

-- 7. THÔNG BÁO HỆ THỐNG
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'Task', -- Task, Leave, Event, System
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ROW LEVEL SECURITY (RLS)
-- Lưu ý: Thực tế Production cần các Policy chi tiết hơn dựa trên role_level
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- v.v... Cho phép mọi người Read để test logic liên kết trước:
CREATE POLICY "Public Access" ON public.employee_profiles FOR SELECT USING (true);
CREATE POLICY "Public Access" ON public.tasks FOR SELECT USING (true);
-- v.v...

-- Cấp quyền cho các role mặc định của Supabase
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
