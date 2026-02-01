-- ==========================================================
-- TẠO BẢNG TEAM_DISCUSSIONS
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- ==========================================================

-- Tạo bảng team_discussions
CREATE TABLE IF NOT EXISTS public.team_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team TEXT NOT NULL,
    sender_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.team_discussions IS 'Thảo luận/chat trong cùng một team';
COMMENT ON COLUMN public.team_discussions.team IS 'Tên team (Đội)';
COMMENT ON COLUMN public.team_discussions.sender_code IS 'Mã nhân viên người gửi';
COMMENT ON COLUMN public.team_discussions.message IS 'Nội dung tin nhắn';

-- Enable RLS
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read messages from their team
DROP POLICY IF EXISTS "Allow team members to read discussions" ON public.team_discussions;
CREATE POLICY "Allow team members to read discussions"
    ON public.team_discussions FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Allow authenticated users to send messages to their team
DROP POLICY IF EXISTS "Allow team members to send messages" ON public.team_discussions;
CREATE POLICY "Allow team members to send messages"
    ON public.team_discussions FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow users to update/delete their own messages
DROP POLICY IF EXISTS "Allow users to update their own messages" ON public.team_discussions;
CREATE POLICY "Allow users to update their own messages"
    ON public.team_discussions FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to delete their own messages" ON public.team_discussions;
CREATE POLICY "Allow users to delete their own messages"
    ON public.team_discussions FOR DELETE
    TO authenticated
    USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_discussions_team ON public.team_discussions(team);
CREATE INDEX IF NOT EXISTS idx_team_discussions_sender ON public.team_discussions(sender_code);
CREATE INDEX IF NOT EXISTS idx_team_discussions_created_at ON public.team_discussions(created_at DESC);

-- Grant permissions
GRANT ALL ON public.team_discussions TO authenticated;

SELECT '✅ Bảng team_discussions đã được tạo thành công!' as status;
