-- ==========================================================
-- FIX: SỬA RLS POLICIES CHO TẤT CẢ BUCKETS STORAGE
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- ==========================================================
-- 1. AVATARS BUCKET
-- ==========================================================
-- Xóa tất cả policies cũ cho avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;

-- Policy 1: Cho phép tất cả người dùng đọc ảnh avatar
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Cho phép authenticated users upload avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy 3: Cho phép anon users upload avatar (nếu cần)
CREATE POLICY "Allow anon users to upload avatars"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'avatars');

-- Policy 4: Cho phép authenticated users cập nhật avatar
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Policy 5: Cho phép authenticated users xóa avatar
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Policy 6: Cho phép anon users cập nhật và xóa (nếu cần)
CREATE POLICY "Allow anon users to update avatars"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow anon users to delete avatars"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'avatars');

-- ==========================================================
-- 2. TASK-ATTACHMENTS BUCKET
-- ==========================================================
-- Xóa tất cả policies cũ cho task-attachments bucket
DROP POLICY IF EXISTS "Task attachments are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to update task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to delete task attachments" ON storage.objects;

-- Policy 1: Cho phép tất cả người dùng đọc file đính kèm
CREATE POLICY "Task attachments are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-attachments');

-- Policy 2: Cho phép authenticated users upload file
CREATE POLICY "Authenticated users can upload task attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-attachments');

-- Policy 3: Cho phép anon users upload file (nếu cần)
CREATE POLICY "Allow anon users to upload task attachments"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'task-attachments');

-- Policy 4: Cho phép authenticated users cập nhật file
CREATE POLICY "Users can update their own task attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task-attachments')
WITH CHECK (bucket_id = 'task-attachments');

-- Policy 5: Cho phép authenticated users xóa file
CREATE POLICY "Users can delete their own task attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task-attachments');

-- Policy 6: Cho phép anon users cập nhật và xóa (nếu cần)
CREATE POLICY "Allow anon users to update task attachments"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'task-attachments')
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Allow anon users to delete task attachments"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'task-attachments');

-- ==========================================================
-- 3. DOCUMENTS BUCKET (Library module)
-- ==========================================================
-- Xóa tất cả policies cũ cho documents bucket
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to update documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to delete documents" ON storage.objects;

-- Policy 1: Cho phép tất cả người dùng đọc documents
CREATE POLICY "Documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy 2: Cho phép authenticated users upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy 3: Cho phép anon users upload documents (nếu cần)
CREATE POLICY "Allow anon users to upload documents"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documents');

-- Policy 4: Cho phép authenticated users cập nhật documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy 5: Cho phép authenticated users xóa documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Policy 6: Cho phép anon users cập nhật và xóa (nếu cần)
CREATE POLICY "Allow anon users to update documents"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow anon users to delete documents"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'documents');

-- ==========================================================
-- 4. LABOR-CONTRACTS BUCKET (nếu có)
-- ==========================================================
-- Xóa tất cả policies cũ cho labor-contracts bucket
DROP POLICY IF EXISTS "Labor contracts are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload labor contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload labor contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own labor contracts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own labor contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to update labor contracts" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to delete labor contracts" ON storage.objects;

-- Policy 1: Cho phép tất cả người dùng đọc labor contracts
CREATE POLICY "Labor contracts are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'labor-contracts');

-- Policy 2: Cho phép authenticated users upload labor contracts
CREATE POLICY "Authenticated users can upload labor contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'labor-contracts');

-- Policy 3: Cho phép anon users upload labor contracts (nếu cần)
CREATE POLICY "Allow anon users to upload labor contracts"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'labor-contracts');

-- Policy 4: Cho phép authenticated users cập nhật labor contracts
CREATE POLICY "Users can update their own labor contracts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'labor-contracts')
WITH CHECK (bucket_id = 'labor-contracts');

-- Policy 5: Cho phép authenticated users xóa labor contracts
CREATE POLICY "Users can delete their own labor contracts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'labor-contracts');

-- Policy 6: Cho phép anon users cập nhật và xóa (nếu cần)
CREATE POLICY "Allow anon users to update labor contracts"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'labor-contracts')
WITH CHECK (bucket_id = 'labor-contracts');

CREATE POLICY "Allow anon users to delete labor contracts"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'labor-contracts');

SELECT '✅ RLS policies cho tất cả buckets storage đã được cập nhật!' as status;
