-- ==========================================================
-- TẠO BUCKET AVATARS TRONG SUPABASE STORAGE
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Tạo bucket 'avatars' nếu chưa tồn tại
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Xóa các policies cũ nếu có
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;

-- Policy: Cho phép tất cả người dùng đọc ảnh avatar (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: Cho phép người dùng đã xác thực upload avatar (cho phép tất cả authenticated users)
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy: Cho phép anon users upload (nếu cần, có thể bỏ nếu không cần)
CREATE POLICY "Allow anon users to upload avatars"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'avatars');

-- Policy: Cho phép người dùng đã xác thực cập nhật avatar
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Policy: Cho phép người dùng đã xác thực xóa avatar
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- Kiểm tra bucket đã được tạo
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        RAISE NOTICE '✅ Bucket "avatars" đã được tạo thành công!';
    ELSE
        RAISE EXCEPTION '❌ Lỗi: Không thể tạo bucket "avatars"';
    END IF;
END $$;

SELECT '✅ Hoàn tất! Bucket avatars đã sẵn sàng sử dụng.' as status;
