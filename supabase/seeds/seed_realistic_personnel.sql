-- ==========================================================
-- SCRIPT: KHÔI PHỤC TOÀN DIỆN & PHÂN CẤP ĐA DẠNG (V14)
-- Dọn dẹp sạch sẽ 7 bảng và nạp 50 nhân sự + Đầy đủ các Đội chuyên biệt
-- Khôi phục đầy đủ các cột cho employee_profiles từ bản migration đúng nhất.
-- ==========================================================

-- 1. XOÁ TOÀN BỘ CẤU TRÚC VÀ DỮ LIỆU CŨ
DROP TABLE IF EXISTS public.task_assignments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.employee_leaves CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.rbac_matrix CASCADE;
DROP TABLE IF EXISTS public.employee_profiles CASCADE;

-- 2. TẠO BẢNG HỒ SƠ NHÂN VIÊN (BẢN ĐẦY ĐỦ NHẤT)
CREATE TABLE public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL, -- Mã nhân viên
    card_number TEXT, -- Số thẻ
    avatar_url TEXT, -- Avatar
    last_name TEXT NOT NULL, -- Họ
    first_name TEXT NOT NULL, -- Tên
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')), -- Giới tính
    date_of_birth DATE, -- Ngày sinh
    nationality TEXT DEFAULT 'Việt Nam', -- Quốc tịch
    place_of_birth TEXT, -- Nơi sinh
    ethnicity TEXT DEFAULT 'Kinh', -- Dân tộc
    religion TEXT DEFAULT 'Không', -- Tôn giáo
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
    join_date DATE DEFAULT CURRENT_DATE, -- Ngày vào làm
    official_date DATE, -- Ngày thành NVCT
    job_position TEXT, -- Vị trí công việc
    department TEXT, -- Phòng
    team TEXT, -- Đội
    group_name TEXT, -- Tổ
    employee_type TEXT CHECK (employee_type IN ('MB NVCT', 'NVGT', 'NVTV', 'NVTT', 'CBQL')) DEFAULT 'MB NVCT', -- Loại nhân viên
    labor_type TEXT, -- Loại lao động
    job_title TEXT, -- Chức danh công việc
    date_received_job_title DATE, -- Ngày nhận chức danh
    current_position TEXT CHECK (current_position IN ('Giám đốc', 'Phó giám đốc', 'Trưởng phòng', 'Phó trưởng phòng', 'Đội trưởng', 'Đội phó', 'Chủ đội', 'Tổ trưởng', 'Tổ phó', 'Chủ tổ', 'Quản trị viên', 'Nhân viên', 'Khác')) DEFAULT 'Nhân viên', -- Chức vụ hiện tại
    appointment_date DATE, -- Ngày bổ nhiệm
    concurrent_position TEXT, -- Chức vụ kiêm nhiệm
    concurrent_job_title TEXT, -- Chức danh kiêm nhiệm
    concurrent_start_date DATE, -- Thời gian kiêm nhiệm từ ngày
    concurrent_end_date DATE, -- Thời gian kiêm nhiệm đến ngày
    leave_calculation_type TEXT CHECK (leave_calculation_type IN ('Có cộng dồn', 'Không cộng dồn')) DEFAULT 'Có cộng dồn', -- Đối tượng tính phép
    
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

    -- Legal info
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
    
    -- Other
    score_template_code TEXT DEFAULT 'NVTT',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
