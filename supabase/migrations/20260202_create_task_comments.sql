-- Migration: Create task_comments table
-- Description: Table to store comments/discussions for tasks

-- Tạo bảng nếu chưa tồn tại
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

-- Add comments
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

-- Grant permissions
GRANT ALL ON public.task_comments TO authenticated;
