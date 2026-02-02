-- Sửa RLS policy cho bảng family_members để cho phép cả anon và authenticated users
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.family_members;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.family_members;
DROP POLICY IF EXISTS "Enable read access for all" ON public.family_members;
DROP POLICY IF EXISTS "Enable write access for all" ON public.family_members;

-- Create new policies that allow both anon and authenticated (không chỉ định TO, sẽ áp dụng cho tất cả)
CREATE POLICY "Enable read access for all" ON public.family_members
    FOR SELECT
    USING (true);

CREATE POLICY "Enable write access for all" ON public.family_members
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.family_members TO anon, authenticated;
