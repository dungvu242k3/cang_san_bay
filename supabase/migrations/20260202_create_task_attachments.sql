-- Migration: Create task_attachments table
-- Description: Table to store file attachments for tasks

-- Tạo bảng nếu chưa tồn tại
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

-- Add comments
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

-- Grant permissions
GRANT ALL ON public.task_attachments TO authenticated;
