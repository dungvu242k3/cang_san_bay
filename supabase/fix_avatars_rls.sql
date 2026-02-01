-- ==========================================================
-- FIX: SỬA RLS POLICIES CHO BUCKET AVATARS
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Xóa tất cả policies cũ cho avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;

-- Policy 1: Cho phép tất cả người dùng (kể cả anon) đọc ảnh avatar
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Cho phép authenticated users upload avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy 3: Cho phép anon users upload avatar (nếu cần cho trường hợp đặc biệt)
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

SELECT '✅ RLS policies cho bucket avatars đã được cập nhật!' as status;
