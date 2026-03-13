-- ==========================================================
-- TẠO BUCKET DOCUMENTS TRONG SUPABASE STORAGE
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Tạo bucket 'documents' nếu chưa tồn tại
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
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
        'image/webp',
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
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to update documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to delete documents" ON storage.objects;

-- Policy 1: Cho phép tất cả người dùng đọc documents (public bucket)
CREATE POLICY "Documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy 2: Cho phép người dùng đã xác thực upload file
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy 3: Cho phép anon users upload file (nếu cần cho test/dev)
CREATE POLICY "Allow anon users to upload documents"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documents');

-- Policy 4: Cho phép người dùng đã xác thực cập nhật file
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy 5: Cho phép người dùng đã xác thực xóa file
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Policy 6: Cho phép anon users cập nhật và xóa (để đồng bộ với avatars/tasks)
CREATE POLICY "Allow anon users to update documents"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow anon users to delete documents"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'documents');

-- Kiểm tra bucket đã được tạo
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
        RAISE NOTICE '✅ Bucket "documents" đã được tạo thành công!';
    ELSE
        RAISE EXCEPTION '❌ Lỗi: Không thể tạo bucket "documents"';
    END IF;
END $$;

SELECT '✅ Hoàn tất! Bucket documents đã sẵn sàng sử dụng.' as status;
