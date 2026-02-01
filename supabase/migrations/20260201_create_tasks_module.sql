-- Create Tasks Module Tables

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Mới' CHECK (status IN ('Mới', 'Đang thực hiện', 'Hoàn thành', 'Tạm dừng', 'Hủy')),
    priority TEXT DEFAULT 'Trung bình' CHECK (priority IN ('Thấp', 'Trung bình', 'Cao', 'Khẩn cấp')),
    due_date TIMESTAMPTZ,
    start_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by TEXT, -- Stores employee_code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Task Assignments (Who is doing the task)
-- Supports assigning to Person or Department, Primary or Collab
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    assignee_code TEXT NOT NULL, -- employee_code or department name
    assignee_type TEXT DEFAULT 'PERSON' CHECK (assignee_type IN ('PERSON', 'DEPARTMENT')),
    role TEXT DEFAULT 'COLLAB' CHECK (role IN ('PRIMARY', 'COLLAB')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(task_id, assignee_code, role) -- Prevent duplicate assignment of same role
);

-- 3. Task Comments (Discussion)
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL, -- Who commented
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Task Attachments
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by TEXT, -- employee_code
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE public.tasks IS 'Quản lý công việc/nhiệm vụ';
COMMENT ON COLUMN public.tasks.created_by IS 'Mã nhân viên người tạo';
COMMENT ON TABLE public.task_assignments IS 'Phân công công việc (Xử lý chính/Phối hợp)';
COMMENT ON COLUMN public.task_assignments.assignee_code IS 'Mã nhân viên hoặc Tên phòng ban';

-- RLS (Open for now as requested "bypass auth" mainly, but good practice to enable)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Allow all access for authenticated (and anon for dev if needed, but we use authenticated client usually)
CREATE POLICY "Enable all for authenticated" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.task_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.task_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.task_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
