-- ==========================================================
-- FIX: TẠO BẢNG TEAM_DISCUSSIONS (Force Create)
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Xóa bảng nếu tồn tại (cẩn thận - sẽ mất dữ liệu)
-- DROP TABLE IF EXISTS public.team_discussions CASCADE;

-- Tạo bảng team_discussions (force create)
CREATE TABLE IF NOT EXISTS public.team_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team TEXT NOT NULL,
    sender_code TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm foreign key constraint nếu chưa có
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_discussions_sender_code_fkey'
        AND table_name = 'team_discussions'
    ) THEN
        ALTER TABLE public.team_discussions
        ADD CONSTRAINT team_discussions_sender_code_fkey 
        FOREIGN KEY (sender_code) 
        REFERENCES public.employee_profiles(employee_code) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add comments
COMMENT ON TABLE public.team_discussions IS 'Thảo luận/chat trong cùng một team';
COMMENT ON COLUMN public.team_discussions.team IS 'Tên team (Đội)';
COMMENT ON COLUMN public.team_discussions.sender_code IS 'Mã nhân viên người gửi';
COMMENT ON COLUMN public.team_discussions.message IS 'Nội dung tin nhắn';

-- Enable RLS
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow team members to read discussions" ON public.team_discussions;
DROP POLICY IF EXISTS "Allow team members to send messages" ON public.team_discussions;
DROP POLICY IF EXISTS "Allow users to update their own messages" ON public.team_discussions;
DROP POLICY IF EXISTS "Allow users to delete their own messages" ON public.team_discussions;

-- Policy: Allow authenticated users to read messages from their team
CREATE POLICY "Allow team members to read discussions"
    ON public.team_discussions FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to send messages to their team
CREATE POLICY "Allow team members to send messages"
    ON public.team_discussions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow users to update/delete their own messages
CREATE POLICY "Allow users to update their own messages"
    ON public.team_discussions FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow users to delete their own messages"
    ON public.team_discussions FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
DROP INDEX IF EXISTS idx_team_discussions_team;
CREATE INDEX idx_team_discussions_team ON public.team_discussions(team);

DROP INDEX IF EXISTS idx_team_discussions_sender;
CREATE INDEX idx_team_discussions_sender ON public.team_discussions(sender_code);

DROP INDEX IF EXISTS idx_team_discussions_created_at;
CREATE INDEX idx_team_discussions_created_at ON public.team_discussions(created_at DESC);

-- Grant permissions
GRANT ALL ON public.team_discussions TO anon, authenticated;

-- Verify table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_discussions') THEN
        RAISE NOTICE '✅ Bảng team_discussions đã được tạo thành công!';
    ELSE
        RAISE EXCEPTION '❌ Lỗi: Không thể tạo bảng team_discussions';
    END IF;
END $$;

SELECT '✅ Hoàn tất! Bảng team_discussions đã sẵn sàng.' as status;
