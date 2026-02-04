-- Migration: Fix RLS policies for Calendar module (allow anon access)
-- Reason: Application uses custom auth (anon role), so we must allow public access to these tables.

-- 1. Duty Schedules
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.duty_schedules;
DROP POLICY IF EXISTS "Enable all for anon and authenticated" ON public.duty_schedules;

CREATE POLICY "Enable all for anon and authenticated" ON public.duty_schedules
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Events
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.events;
DROP POLICY IF EXISTS "Enable all for anon and authenticated" ON public.events;

CREATE POLICY "Enable all for anon and authenticated" ON public.events
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Notifications
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.notifications;
DROP POLICY IF EXISTS "Enable all for anon and authenticated" ON public.notifications;

CREATE POLICY "Enable all for anon and authenticated" ON public.notifications
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions (just in case)
GRANT ALL ON public.duty_schedules TO anon, authenticated;
GRANT ALL ON public.events TO anon, authenticated;
GRANT ALL ON public.notifications TO anon, authenticated;

SELECT 'Fixed RLS for duty_schedules, events, notifications' as result;
