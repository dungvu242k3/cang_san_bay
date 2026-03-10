-- ==========================================================
-- FIX: TẠO BẢNG TEAM_DISCUSSIONS & CONSTRAINT fk_team_discussion_sender
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- 1. Tạo bảng team_discussions nếu chưa có
CREATE TABLE IF NOT EXISTS public.team_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team TEXT NOT NULL,
    sender_code TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Thêm/Sửa foreign key constraint với tên FK rõ ràng (để join được trong frontend)
DO $$
BEGIN
    -- Xóa các constraint cũ nếu có (tránh trùng lặp hoặc sai tên)
    ALTER TABLE public.team_discussions DROP CONSTRAINT IF EXISTS team_discussions_sender_code_fkey;
    ALTER TABLE public.team_discussions DROP CONSTRAINT IF EXISTS fk_team_discussion_sender;

    -- Thêm constraint mới với tên fk_team_discussion_sender
    ALTER TABLE public.team_discussions
    ADD CONSTRAINT fk_team_discussion_sender 
    FOREIGN KEY (sender_code) 
    REFERENCES public.employee_profiles(employee_code) 
    ON DELETE CASCADE;
END $$;

-- 3. Thêm comments (tùy chọn)
COMMENT ON TABLE public.team_discussions IS 'Thảo luận/chat trong cùng một team';
COMMENT ON COLUMN public.team_discussions.team IS 'Tên team (Đội)';
COMMENT ON COLUMN public.team_discussions.sender_code IS 'Mã nhân viên người gửi';
COMMENT ON COLUMN public.team_discussions.message IS 'Nội dung tin nhắn';

-- 4. Kích hoạt RLS
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;

-- 5. Tạo Policy "Allow All" cho đơn giản (Phù hợp với cấu trúc hiện tại của dự án này)
DROP POLICY IF EXISTS "Allow All" ON public.team_discussions;
CREATE POLICY "Allow All" ON public.team_discussions FOR ALL USING (true) WITH CHECK (true);

-- 6. Tạo index để tăng hiệu năng load tin nhắn
CREATE INDEX IF NOT EXISTS idx_team_discussions_team ON public.team_discussions(team);
CREATE INDEX IF NOT EXISTS idx_team_discussions_created_at ON public.team_discussions(created_at DESC);

-- 7. Cấp quyền
GRANT ALL ON public.team_discussions TO anon, authenticated, service_role;

SELECT '✅ Hoàn tất! Bảng team_discussions đã được đồng bộ với Frontend.' as status;
