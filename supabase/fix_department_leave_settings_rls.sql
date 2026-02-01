-- ==========================================================
-- FIX: SỬA RLS POLICIES CHO BẢNG DEPARTMENT_LEAVE_SETTINGS
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Xóa tất cả policies cũ
DROP POLICY IF EXISTS "Allow authenticated users to read department leave settings" ON public.department_leave_settings;
DROP POLICY IF EXISTS "Allow admin/board director to manage department leave settings" ON public.department_leave_settings;
DROP POLICY IF EXISTS "Allow all authenticated users to manage department leave settings" ON public.department_leave_settings;
DROP POLICY IF EXISTS "Allow anon users to read department leave settings" ON public.department_leave_settings;
DROP POLICY IF EXISTS "Allow anon users to manage department leave settings" ON public.department_leave_settings;

-- Policy 1: Cho phép tất cả authenticated users đọc
CREATE POLICY "Allow authenticated users to read department leave settings"
    ON public.department_leave_settings FOR SELECT
    TO authenticated
    USING (true);

-- Policy 2: Cho phép tất cả authenticated users thêm mới
CREATE POLICY "Allow authenticated users to insert department leave settings"
    ON public.department_leave_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 3: Cho phép tất cả authenticated users cập nhật
CREATE POLICY "Allow authenticated users to update department leave settings"
    ON public.department_leave_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Cho phép tất cả authenticated users xóa
CREATE POLICY "Allow authenticated users to delete department leave settings"
    ON public.department_leave_settings FOR DELETE
    TO authenticated
    USING (true);

-- Policy 5: Cho phép anon users đọc (nếu cần)
CREATE POLICY "Allow anon users to read department leave settings"
    ON public.department_leave_settings FOR SELECT
    TO anon
    USING (true);

-- Policy 6: Cho phép anon users thêm mới (nếu cần)
CREATE POLICY "Allow anon users to insert department leave settings"
    ON public.department_leave_settings FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy 7: Cho phép anon users cập nhật (nếu cần)
CREATE POLICY "Allow anon users to update department leave settings"
    ON public.department_leave_settings FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Policy 8: Cho phép anon users xóa (nếu cần)
CREATE POLICY "Allow anon users to delete department leave settings"
    ON public.department_leave_settings FOR DELETE
    TO anon
    USING (true);

-- Đảm bảo GRANT permissions
GRANT ALL ON public.department_leave_settings TO authenticated;
GRANT ALL ON public.department_leave_settings TO anon;

SELECT '✅ RLS policies cho bảng department_leave_settings đã được cập nhật!' as status;
