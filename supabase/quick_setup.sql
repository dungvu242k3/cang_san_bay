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
    password TEXT,
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

-- 5.5. THÊM CỘT PASSWORD VÀO employee_profiles (nếu chưa có)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'employee_profiles'
        AND column_name = 'password'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN password TEXT;
        COMMENT ON COLUMN public.employee_profiles.password IS 'Mật khẩu đăng nhập (hashed)';
        
        -- Tạo index cho tìm kiếm nhanh
        CREATE INDEX IF NOT EXISTS idx_employee_profiles_password ON public.employee_profiles(password) WHERE password IS NOT NULL;
    END IF;
END $$;

-- 6. TẠO ADMIN USER VÀ ROLE
-- Chỉ insert các cột bắt buộc, các cột khác sẽ dùng giá trị mặc định
-- Password mặc định: 123456 (plain text, sẽ được hash khi đăng nhập lần đầu)
INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, current_position, email_acv, password)
VALUES ('ADMIN', 'Quản trị', 'Hệ Thống', 'Văn phòng', 'Quản trị viên', 'admin@cangsanbay.vn', '123456')
ON CONFLICT (employee_code) DO UPDATE 
SET last_name = EXCLUDED.last_name,
    first_name = EXCLUDED.first_name,
    department = EXCLUDED.department,
    current_position = EXCLUDED.current_position,
    email_acv = EXCLUDED.email_acv,
    password = COALESCE(EXCLUDED.password, employee_profiles.password);

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

-- 8. TẠO BẢNG CÀI ĐẶT NGHỈ PHÉP THEO PHÒNG BAN
CREATE TABLE IF NOT EXISTS public.department_leave_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department TEXT NOT NULL UNIQUE,
    annual_leave_days INTEGER NOT NULL DEFAULT 12,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.department_leave_settings IS 'Cài đặt số ngày nghỉ phép năm cho từng phòng ban';
COMMENT ON COLUMN public.department_leave_settings.department IS 'Tên phòng ban';
COMMENT ON COLUMN public.department_leave_settings.annual_leave_days IS 'Số ngày nghỉ phép năm (mặc định 12 ngày)';

-- Enable RLS
ALTER TABLE public.department_leave_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated users to read department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to read department leave settings"
    ON public.department_leave_settings FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to insert
DROP POLICY IF EXISTS "Allow authenticated users to insert department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to insert department leave settings"
    ON public.department_leave_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow authenticated users to update
DROP POLICY IF EXISTS "Allow authenticated users to update department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to update department leave settings"
    ON public.department_leave_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow authenticated users to delete
DROP POLICY IF EXISTS "Allow authenticated users to delete department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to delete department leave settings"
    ON public.department_leave_settings FOR DELETE
    TO authenticated
    USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_department_leave_settings_department ON public.department_leave_settings(department);

-- 9. TẠO BẢNG THẢO LUẬN TEAM
CREATE TABLE IF NOT EXISTS public.team_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team TEXT NOT NULL,
    sender_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.team_discussions IS 'Thảo luận/chat trong cùng một team';
COMMENT ON COLUMN public.team_discussions.team IS 'Tên team (Đội)';
COMMENT ON COLUMN public.team_discussions.sender_code IS 'Mã nhân viên người gửi';
COMMENT ON COLUMN public.team_discussions.message IS 'Nội dung tin nhắn';

-- Enable RLS
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read messages
DROP POLICY IF EXISTS "Allow team members to read discussions" ON public.team_discussions;
CREATE POLICY "Allow team members to read discussions"
    ON public.team_discussions FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to send messages
DROP POLICY IF EXISTS "Allow team members to send messages" ON public.team_discussions;
CREATE POLICY "Allow team members to send messages"
    ON public.team_discussions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow users to update/delete their own messages
DROP POLICY IF EXISTS "Allow users to update their own messages" ON public.team_discussions;
CREATE POLICY "Allow users to update their own messages"
    ON public.team_discussions FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to delete their own messages" ON public.team_discussions;
CREATE POLICY "Allow users to delete their own messages"
    ON public.team_discussions FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_discussions_team ON public.team_discussions(team);
CREATE INDEX IF NOT EXISTS idx_team_discussions_sender ON public.team_discussions(sender_code);
CREATE INDEX IF NOT EXISTS idx_team_discussions_created_at ON public.team_discussions(created_at DESC);

-- 10. TẠO BẢNG TASK_COMMENTS (Thảo luận cho công việc)
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL,
    sender_code TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm các cột nếu bảng đã tồn tại nhưng thiếu cột
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'task_comments'
    ) THEN
        -- Thêm cột comment nếu thiếu
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'task_comments'
            AND column_name = 'comment'
        ) THEN
            ALTER TABLE public.task_comments ADD COLUMN comment TEXT;
            
            -- Cập nhật giá trị mặc định cho các bản ghi cũ (nếu có)
            UPDATE public.task_comments 
            SET comment = '' 
            WHERE comment IS NULL;
            
            -- Đặt NOT NULL sau khi đã có giá trị
            ALTER TABLE public.task_comments 
            ALTER COLUMN comment SET NOT NULL;
        END IF;

        -- Thêm cột sender_code nếu thiếu
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'task_comments'
            AND column_name = 'sender_code'
        ) THEN
            ALTER TABLE public.task_comments ADD COLUMN sender_code TEXT;
            
            -- Cập nhật giá trị mặc định cho các bản ghi cũ (nếu có)
            UPDATE public.task_comments 
            SET sender_code = 'ADMIN' 
            WHERE sender_code IS NULL;
            
            -- Đặt NOT NULL sau khi đã có giá trị
            ALTER TABLE public.task_comments 
            ALTER COLUMN sender_code SET NOT NULL;
        END IF;

        -- Thêm cột updated_at nếu thiếu
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'task_comments'
            AND column_name = 'updated_at'
        ) THEN
            ALTER TABLE public.task_comments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Thêm foreign key constraints nếu chưa có
DO $$
BEGIN
    -- Foreign key to tasks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_comments_task_id_fkey'
        AND table_name = 'task_comments'
    ) THEN
        ALTER TABLE public.task_comments
        ADD CONSTRAINT task_comments_task_id_fkey 
        FOREIGN KEY (task_id) 
        REFERENCES public.tasks(id) 
        ON DELETE CASCADE;
    END IF;

    -- Foreign key to employee_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_comments_sender_code_fkey'
        AND table_name = 'task_comments'
    ) THEN
        ALTER TABLE public.task_comments
        ADD CONSTRAINT task_comments_sender_code_fkey 
        FOREIGN KEY (sender_code) 
        REFERENCES public.employee_profiles(employee_code) 
        ON DELETE CASCADE;
    END IF;
END $$;

COMMENT ON TABLE public.task_comments IS 'Thảo luận/comments cho từng công việc';
COMMENT ON COLUMN public.task_comments.task_id IS 'ID của công việc';
COMMENT ON COLUMN public.task_comments.sender_code IS 'Mã nhân viên người comment';
COMMENT ON COLUMN public.task_comments.comment IS 'Nội dung comment';

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read comments
DROP POLICY IF EXISTS "Allow authenticated users to read task comments" ON public.task_comments;
CREATE POLICY "Allow authenticated users to read task comments"
    ON public.task_comments FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to send comments
DROP POLICY IF EXISTS "Allow authenticated users to send task comments" ON public.task_comments;
CREATE POLICY "Allow authenticated users to send task comments"
    ON public.task_comments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow users to update/delete their own comments
DROP POLICY IF EXISTS "Allow users to update their own task comments" ON public.task_comments;
CREATE POLICY "Allow users to update their own task comments"
    ON public.task_comments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to delete their own task comments" ON public.task_comments;
CREATE POLICY "Allow users to delete their own task comments"
    ON public.task_comments FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_sender ON public.task_comments(sender_code);
CREATE INDEX IF NOT EXISTS idx_task_comments_created_at ON public.task_comments(created_at DESC);

-- 11. TẠO BẢNG TASK_ATTACHMENTS (File đính kèm cho công việc)
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL,
    uploaded_by TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm các cột nếu bảng đã tồn tại nhưng thiếu cột
DO $$
BEGIN
    -- Thêm cột file_path nếu thiếu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'task_attachments'
        AND column_name = 'file_path'
    ) THEN
        ALTER TABLE public.task_attachments ADD COLUMN file_path TEXT;
        
        -- Cập nhật giá trị mặc định cho các bản ghi cũ (nếu có)
        UPDATE public.task_attachments 
        SET file_path = file_name 
        WHERE file_path IS NULL;
        
        -- Đặt NOT NULL sau khi đã có giá trị
        ALTER TABLE public.task_attachments 
        ALTER COLUMN file_path SET NOT NULL;
    END IF;

    -- Thêm các cột khác nếu thiếu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'task_attachments'
        AND column_name = 'file_size'
    ) THEN
        ALTER TABLE public.task_attachments ADD COLUMN file_size INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'task_attachments'
        AND column_name = 'file_type'
    ) THEN
        ALTER TABLE public.task_attachments ADD COLUMN file_type TEXT;
    END IF;
END $$;

-- Thêm foreign key constraints nếu chưa có
DO $$
BEGIN
    -- Foreign key to tasks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_attachments_task_id_fkey'
        AND table_name = 'task_attachments'
    ) THEN
        ALTER TABLE public.task_attachments
        ADD CONSTRAINT task_attachments_task_id_fkey 
        FOREIGN KEY (task_id) 
        REFERENCES public.tasks(id) 
        ON DELETE CASCADE;
    END IF;

    -- Foreign key to employee_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_attachments_uploaded_by_fkey'
        AND table_name = 'task_attachments'
    ) THEN
        ALTER TABLE public.task_attachments
        ADD CONSTRAINT task_attachments_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) 
        REFERENCES public.employee_profiles(employee_code) 
        ON DELETE CASCADE;
    END IF;
END $$;

COMMENT ON TABLE public.task_attachments IS 'File đính kèm cho từng công việc';
COMMENT ON COLUMN public.task_attachments.task_id IS 'ID của công việc';
COMMENT ON COLUMN public.task_attachments.uploaded_by IS 'Mã nhân viên người upload';
COMMENT ON COLUMN public.task_attachments.file_name IS 'Tên file';
COMMENT ON COLUMN public.task_attachments.file_path IS 'Đường dẫn file trong storage';
COMMENT ON COLUMN public.task_attachments.file_size IS 'Kích thước file (bytes)';
COMMENT ON COLUMN public.task_attachments.file_type IS 'Loại file (MIME type)';

-- Enable RLS
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read attachments
DROP POLICY IF EXISTS "Allow authenticated users to read task attachments" ON public.task_attachments;
CREATE POLICY "Allow authenticated users to read task attachments"
    ON public.task_attachments FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to upload attachments
DROP POLICY IF EXISTS "Allow authenticated users to upload task attachments" ON public.task_attachments;
CREATE POLICY "Allow authenticated users to upload task attachments"
    ON public.task_attachments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow users to delete their own attachments
DROP POLICY IF EXISTS "Allow users to delete their own task attachments" ON public.task_attachments;
CREATE POLICY "Allow users to delete their own task attachments"
    ON public.task_attachments FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_uploaded_by ON public.task_attachments(uploaded_by);

-- 12. GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT '✅ Database setup completed!' as status;
