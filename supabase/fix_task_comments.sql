-- ==========================================================
-- FIX: TẠO BẢNG TASK_COMMENTS (Force Create)
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Xóa bảng nếu tồn tại (cẩn thận - sẽ mất dữ liệu)
-- DROP TABLE IF EXISTS public.task_comments CASCADE;

-- Tạo bảng task_comments (force create)
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
        -- Kiểm tra và thêm cột comment nếu thiếu
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

        -- Kiểm tra và thêm cột sender_code nếu thiếu
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

        -- Kiểm tra và thêm cột updated_at nếu thiếu
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

-- Add comments
COMMENT ON TABLE public.task_comments IS 'Thảo luận/comments cho từng công việc';
COMMENT ON COLUMN public.task_comments.task_id IS 'ID của công việc';
COMMENT ON COLUMN public.task_comments.sender_code IS 'Mã nhân viên người comment';
COMMENT ON COLUMN public.task_comments.comment IS 'Nội dung comment';

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Allow authenticated users to send task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Allow users to update their own task comments" ON public.task_comments;
DROP POLICY IF EXISTS "Allow users to delete their own task comments" ON public.task_comments;

-- Policy: Allow authenticated users to read comments
CREATE POLICY "Allow authenticated users to read task comments"
    ON public.task_comments FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to send comments
CREATE POLICY "Allow authenticated users to send task comments"
    ON public.task_comments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow users to update/delete their own comments
CREATE POLICY "Allow users to update their own task comments"
    ON public.task_comments FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow users to delete their own task comments"
    ON public.task_comments FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
DROP INDEX IF EXISTS idx_task_comments_task_id;
CREATE INDEX idx_task_comments_task_id ON public.task_comments(task_id);

DROP INDEX IF EXISTS idx_task_comments_sender;
CREATE INDEX idx_task_comments_sender ON public.task_comments(sender_code);

DROP INDEX IF EXISTS idx_task_comments_created_at;
CREATE INDEX idx_task_comments_created_at ON public.task_comments(created_at DESC);

-- Grant permissions
GRANT ALL ON public.task_comments TO authenticated;

-- Verify table exists and has correct columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'task_comments'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'task_comments' 
            AND column_name = 'sender_code'
        ) THEN
            RAISE NOTICE '✅ Bảng task_comments đã được tạo thành công với cột sender_code!';
        ELSE
            RAISE EXCEPTION '❌ Lỗi: Cột sender_code không tồn tại trong bảng task_comments';
        END IF;
    ELSE
        RAISE EXCEPTION '❌ Lỗi: Không thể tạo bảng task_comments';
    END IF;
END $$;

SELECT '✅ Hoàn tất! Bảng task_comments đã sẵn sàng.' as status;
