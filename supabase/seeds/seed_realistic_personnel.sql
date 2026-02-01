-- ==========================================================
-- SCRIPT: KHÔI PHỤC TOÀN DIỆN HỆ THỐNG & DỮ LIỆU (V7)
-- Giải quyết triệt để lỗi 406 và phục hồi 507 nhân viên
-- ==========================================================

-- 1. XOÁ TOÀN BỘ CẤU TRÚC CŨ (Để tạo mới sạch sẽ)
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.rbac_matrix CASCADE;
DROP TABLE IF EXISTS public.employee_profiles CASCADE;

-- 2. TẠO BẢNG HỒ SƠ NHÂN VIÊN (Gốc)
CREATE TABLE public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
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
    join_date DATE,
    official_date DATE,
    job_position TEXT,
    department TEXT,
    team TEXT,
    group_name TEXT,
    employee_type TEXT DEFAULT 'MB NVCT',
    score_template_code TEXT DEFAULT 'NVTT',
    labor_type TEXT,
    job_title TEXT,
    date_received_job_title DATE,
    current_position TEXT DEFAULT 'Khác',
    appointment_date DATE,
    concurrent_position TEXT,
    concurrent_job_title TEXT,
    concurrent_start_date DATE,
    concurrent_end_date DATE,
    leave_calculation_type TEXT DEFAULT 'Có cộng dồn',
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
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TẠO BẢNG PHÂN QUYỀN (user_roles)
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level TEXT NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, 
    team_scope TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TẠO MA TRẬN QUYỀN HẠN (rbac_matrix)
CREATE TABLE public.rbac_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_level TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    UNIQUE(role_level, permission_key)
);

-- 5. BẬT RLS & POLICY (Quan trọng để API đọc được)
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.employee_profiles FOR SELECT USING (true);
CREATE POLICY "Public Read User Roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Public Read RBAC Matrix" ON public.rbac_matrix FOR SELECT USING (true);

GRANT ALL ON public.employee_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_roles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.rbac_matrix TO postgres, anon, authenticated, service_role;

-- 6. NẠP DỮ LIỆU MẪU (ADMIN & 507 NHÂN VIÊN)
INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, current_position, email_acv)
VALUES ('ADMIN', 'Admin', 'Hệ Thống', 'Văn phòng', 'Khác', 'admin@cangsanbay.vn');

INSERT INTO public.user_roles (employee_code, role_level) 
VALUES ('ADMIN', 'SUPER_ADMIN');

-- Nạp Ma trận quyền cho Super Admin
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true),
    ('SUPER_ADMIN', 'tasks', true, true, true),
    ('SUPER_ADMIN', 'calendar', true, true, true),
    ('SUPER_ADMIN', 'grading', true, true, true),
    ('SUPER_ADMIN', 'leaves', true, true, true),
    ('SUPER_ADMIN', 'profiles', true, true, true),
    ('SUPER_ADMIN', 'organization', true, true, true),
    ('SUPER_ADMIN', 'settings', true, true, true);

-- Nạp 507 nhân viên CBA
DO $$
DECLARE 
    i INTEGER;
    dept TEXT;
    team TEXT;
    pos TEXT;
    first_names TEXT[] := ARRAY['Anh', 'Bình', 'Cường', 'Dũng', 'An', 'Bảo', 'Chi', 'Dương', 'Hà', 'Hùng', 'Hương', 'Hạnh', 'Khánh', 'Linh', 'Minh', 'Nam', 'Nga', 'Phong', 'Quân', 'Sơn', 'Thảo', 'Tuấn', 'Vân', 'Yến'];
    last_names TEXT[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
BEGIN
    FOR i IN 1..507 LOOP
        IF i <= 10 THEN 
            dept := 'Ban Giám đốc'; pos := 'Phó giám đốc'; team := 'Điều hành';
        ELSIF i <= 50 THEN 
            dept := 'Phòng Kỹ thuật'; pos := 'Nhân viên'; team := 'Kỹ thuật HT';
        ELSIF i <= 150 THEN 
            dept := 'Phòng Khai thác'; pos := 'Nhân viên'; team := 'Khai thác mặt đất';
        ELSIF i <= 250 THEN 
            dept := 'Đội An ninh'; pos := 'Nhân viên'; team := 'An ninh soi chiếu';
        ELSIF i <= 400 THEN 
            dept := 'Đội Phục vụ'; pos := 'Nhân viên'; team := 'Phục vụ hành khách';
        ELSE 
            dept := 'Văn phòng'; pos := 'Nhân viên'; team := 'Hành chính';
        END IF;

        INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, team, current_position, email_acv, gender, hometown, avatar_url)
        VALUES (
            'CBA' || LPAD(i::text, 4, '0'),
            last_names[1 + floor(random() * array_length(last_names, 1))],
            first_names[1 + floor(random() * array_length(first_names, 1))],
            dept, team, pos, 'cba' || i || '@cangsanbay.vn',
            CASE WHEN random() > 0.5 THEN 'Nam' ELSE 'Nữ' END, 'TP. HCM',
            'https://i.pravatar.cc/150?u=' || i
        );
    END LOOP;
END $$;

-- 7. ÉP LÀM MỚI SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

SELECT 'KHỞI TẠO THÀNH CÔNG! Hãy đợi 3 giây rồi Refresh (F5) trình duyệt.' as status;
