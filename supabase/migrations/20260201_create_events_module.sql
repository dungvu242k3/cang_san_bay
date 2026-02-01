-- Migration: Create Events and Notifications Module
-- Description: Tables for Calendar Events and System Notifications

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    location TEXT,
    event_type TEXT DEFAULT 'EVENT' CHECK (event_type IN ('EVENT', 'MEETING', 'REMINDER')),
    scope TEXT DEFAULT 'PERSONAL' CHECK (scope IN ('PERSONAL', 'UNIT', 'OFFICE', 'COMPANY')),
    
    created_by TEXT NOT NULL, -- employee_code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_code TEXT NOT NULL, -- employee_code
    title TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    notification_type TEXT DEFAULT 'INFO', -- INFO, WARNING, SUCCESS, ERROR
    link_url TEXT, -- Optional link to navigate to
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.events IS 'Lịch làm việc và sự kiện';
COMMENT ON COLUMN public.events.scope IS 'Phạm vi sự kiện: Cá nhân, Đơn vị, Văn phòng, Toàn công ty';
COMMENT ON TABLE public.notifications IS 'Thông báo hệ thống';

-- RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies (Permissive for now to speed up dev, refine later)
CREATE POLICY "Enable all for authenticated" ON public.events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_code);
