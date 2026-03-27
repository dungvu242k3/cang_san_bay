-- Create app_settings table for storing application-wide configurations
-- Used by Admin to toggle profile section visibility, etc.

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- Allow public read, admin write
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read app_settings"
    ON public.app_settings FOR SELECT
    USING (true);

-- Anyone can insert/update (app-level permission check handles admin restriction)
CREATE POLICY "Anyone can modify app_settings"
    ON public.app_settings FOR ALL
    USING (true)
    WITH CHECK (true);

SELECT '✅ app_settings table created' as status;
