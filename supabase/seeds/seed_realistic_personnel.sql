-- ==========================================================
-- SCRIPT: KHÔI PHỤC TOÀN DIỆN & PHÂN CẤP ĐA DẠNG (V13)
-- Dọn dẹp sạch sẽ 7 bảng và nạp 50 nhân sự + Đầy đủ các Đội chuyên biệt
-- ==========================================================

-- 1. XOÁ TOÀN BỘ CẤU TRÚC VÀ DỮ LIỆU CŨ
DROP TABLE IF EXISTS public.task_assignments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.employee_leaves CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.rbac_matrix CASCADE;
DROP TABLE IF EXISTS public.employee_profiles CASCADE;

-- 2. TẠO BẢNG HỒ SƠ NHÂN VIÊN
CREATE TABLE public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    gender TEXT,
    date_of_birth DATE,
    department TEXT,
    team TEXT,
    group_name TEXT,
    current_position TEXT DEFAULT 'Nhân viên',
    email_acv TEXT,
    email_personal TEXT,
    phone TEXT,
    avatar_url TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    nationality TEXT DEFAULT 'Việt Nam',
    education_level TEXT,
    hometown TEXT,
    is_party_member BOOLEAN DEFAULT false,
    score_template_code TEXT DEFAULT 'NVTT'
);

-- 3. TẠO BẢNG PHÂN QUYỀN
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level TEXT NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, 
    team_scope TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TẠO MA TRẬN QUYỀN HẠN
CREATE TABLE public.rbac_matrix (
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

-- 5. TẠO BẢNG CÔNG VIỆC
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Trung bình',
    due_date DATE,
    status TEXT DEFAULT 'Mới',
    progress INTEGER DEFAULT 0,
    created_by TEXT REFERENCES public.employee_profiles(employee_code),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    assignee_code TEXT NOT NULL,
    assignee_type TEXT DEFAULT 'PERSON',
    role TEXT DEFAULT 'PRIMARY',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TẠO BẢNG LỊCH & NGHỈ PHÉP
CREATE TABLE public.events (
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

CREATE TABLE public.employee_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    leave_type TEXT DEFAULT 'Nghỉ phép năm',
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    leave_days DECIMAL(4,1),
    reason TEXT,
    status TEXT DEFAULT 'Chờ duyệt',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẬT RLS & POLICY
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All" ON public.employee_profiles FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.user_roles FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.rbac_matrix FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.task_assignments FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow All" ON public.employee_leaves FOR ALL USING (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 8. NẠP MA TRẬN QUYỀN HẠN
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true), ('SUPER_ADMIN', 'tasks', true, true, true),
    ('SUPER_ADMIN', 'calendar', true, true, true), ('SUPER_ADMIN', 'grading', true, true, true),
    ('SUPER_ADMIN', 'leaves', true, true, true), ('SUPER_ADMIN', 'profiles', true, true, true),
    ('SUPER_ADMIN', 'organization', true, true, true), ('SUPER_ADMIN', 'settings', true, true, true),
    ('BOARD_DIRECTOR', 'dashboard', true, false, false), ('BOARD_DIRECTOR', 'organization', true, false, false),
    ('BOARD_DIRECTOR', 'profiles', true, false, false), 
    ('DEPT_HEAD', 'profiles', true, true, false), ('DEPT_HEAD', 'grading', true, true, false),
    ('DEPT_HEAD', 'tasks', true, true, false),
    ('TEAM_LEADER', 'profiles', true, true, false), ('TEAM_LEADER', 'tasks', true, true, false),
    ('STAFF', 'profiles', true, false, false), ('STAFF', 'tasks', true, false, false);

-- 9. NẠP 50 NHÂN SỰ CHUYÊN BIỆT
-- Admin
INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, current_position, email_acv, email_personal, phone, avatar_url)
VALUES ('ADMIN', 'Admin', 'Hệ Thống', 'Văn phòng', 'Quản trị viên', 'admin@cangsanbay.vn', 'admin@cangsanbay.vn', '0901234567', 'https://i.pravatar.cc/150?u=admin');
INSERT INTO public.user_roles (employee_code, role_level) VALUES ('ADMIN', 'SUPER_ADMIN');

DO $$
DECLARE 
    i INTEGER;
    dept TEXT; team TEXT; pos TEXT; r_level TEXT; e_code TEXT; t_id UUID;
    first_names TEXT[] := ARRAY['Anh', 'Bình', 'Cường', 'Dũng', 'An', 'Bảo', 'Chi', 'Dương', 'Hà', 'Hùng', 'Hương', 'Hạnh', 'Khánh', 'Linh', 'Minh', 'Nam', 'Nga', 'Phong', 'Quân', 'Sơn', 'Thảo', 'Tuấn', 'Vân', 'Yến'];
    last_names TEXT[] := ARRAY['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
BEGIN
    FOR i IN 1..50 LOOP
        e_code := 'CBA' || LPAD(i::text, 4, '0');
        r_level := 'STAFF';
        
        -- Logic phân bổ chi tiết
        IF i <= 3 THEN 
            dept := 'Ban Giám đốc'; team := 'Hội đồng'; r_level := 'BOARD_DIRECTOR';
            pos := CASE WHEN i = 1 THEN 'Giám đốc' ELSE 'Phó giám đốc' END;
        
        ELSIF i <= 15 THEN 
            dept := 'Phòng Kỹ thuật';
            team := CASE WHEN i % 2 = 0 THEN 'Đội Kỹ thuật HT' ELSE 'Đội Viễn thông' END;
            IF i = 4 THEN pos := 'Trưởng phòng'; r_level := 'DEPT_HEAD';
            ELSIF i = 5 THEN pos := 'Phó trưởng phòng'; r_level := 'DEPT_HEAD';
            ELSIF i = 6 THEN pos := 'Đội trưởng'; r_level := 'TEAM_LEADER';
            ELSE pos := 'Nhân viên'; END IF;
            
        ELSIF i <= 25 THEN 
            dept := 'Phòng Khai thác';
            team := CASE WHEN i % 2 = 0 THEN 'Đội Khai thác mặt đất' ELSE 'Đội Phục vụ' END;
            IF i = 16 THEN pos := 'Trưởng phòng'; r_level := 'DEPT_HEAD';
            ELSIF i = 17 THEN pos := 'Đội trưởng'; r_level := 'TEAM_LEADER';
            ELSE pos := 'Nhân viên'; END IF;

        ELSIF i <= 35 THEN 
            dept := 'Đội An ninh'; team := 'An ninh soi chiếu';
            IF i = 26 THEN pos := 'Đội trưởng'; r_level := 'TEAM_LEADER';
            ELSIF i = 27 THEN pos := 'Đội phó'; r_level := 'TEAM_LEADER';
            ELSE pos := 'Nhân viên'; END IF;

        ELSIF i <= 45 THEN 
            dept := 'Đội Dịch vụ'; team := 'Phục vụ hành khách';
            IF i = 36 THEN pos := 'Đội trưởng'; r_level := 'TEAM_LEADER';
            ELSIF i = 37 THEN pos := 'Đội phó'; r_level := 'TEAM_LEADER';
            ELSE pos := 'Nhân viên'; END IF;

        ELSE 
            dept := 'Văn phòng'; team := 'Hành chính';
            pos := 'Nhân viên';
        END IF;

        INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, team, current_position, email_acv, email_personal, phone, avatar_url)
        VALUES (e_code, last_names[1 + floor(random() * 15)], first_names[1 + floor(random() * 23)], dept, team, pos, 'cba' || i || '@cangsanbay.vn', 'cba' || i || '@cangsanbay.vn', '098' || LPAD(i::text, 7, '0'), 'https://i.pravatar.cc/150?u=' || i);

        INSERT INTO public.user_roles (employee_code, role_level, dept_scope, team_scope)
        VALUES (e_code, r_level, CASE WHEN r_level IN ('DEPT_HEAD', 'TEAM_LEADER') THEN dept ELSE NULL END, CASE WHEN r_level = 'TEAM_LEADER' THEN team ELSE NULL END);

        IF i % 5 = 0 THEN
            INSERT INTO public.tasks (title, description, priority, due_date, status, progress, created_by)
            VALUES ('Nhiệm vụ mẫu ' || i, 'Chi tiết công việc được giao...', 'Trung bình', CURRENT_DATE + 5, 'Mới', 0, 'ADMIN')
            RETURNING id INTO t_id;
            INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
            VALUES (t_id, e_code, 'PERSON', 'PRIMARY');
        END IF;
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
SELECT 'PHIÊN BẢN V13: Đã khôi phục các Đội chuyên biệt (An ninh, Dịch vụ, Kỹ thuật)!' as status;
