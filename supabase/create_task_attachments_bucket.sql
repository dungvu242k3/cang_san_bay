-- ==========================================================
-- TẠO BUCKET TASK_ATTACHMENTS TRONG SUPABASE STORAGE
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Tạo bucket 'task-attachments' nếu chưa tồn tại
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'task-attachments',
    'task-attachments',
    true,
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ]
)
ON CONFLICT (id) DO UPDATE
SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Xóa các policies cũ nếu có
DROP POLICY IF EXISTS "Task attachments are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to update task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to delete task attachments" ON storage.objects;

-- Policy: Cho phép tất cả người dùng đọc file đính kèm (public bucket)
CREATE POLICY "Task attachments are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-attachments');

-- Policy: Cho phép người dùng đã xác thực upload file
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

-- Policy: Cho phép anon users upload file (nếu cần)
CREATE POLICY "Allow anon users to upload task attachments"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'task-attachments');

-- Policy: Cho phép người dùng đã xác thực cập nhật file
CREATE POLICY "Users can update their own task attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-attachments')
WITH CHECK (bucket_id = 'task-attachments');

-- Policy: Cho phép người dùng đã xác thực xóa file
CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-attachments');

-- Policy: Cho phép anon users cập nhật và xóa (nếu cần)
CREATE POLICY "Allow anon users to update task attachments"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'task-attachments')
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Allow anon users to delete task attachments"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'task-attachments');

-- Kiểm tra bucket đã được tạo
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'task-attachments') THEN
        RAISE NOTICE '✅ Bucket "task-attachments" đã được tạo thành công!';
    ELSE
        RAISE EXCEPTION '❌ Lỗi: Không thể tạo bucket "task-attachments"';
    END IF;
END $$;

SELECT '✅ Hoàn tất! Bucket task-attachments đã sẵn sàng sử dụng.' as status;
