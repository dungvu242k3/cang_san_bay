-- Migration: Create department_leave_settings table
-- Description: Table to store annual leave days configuration for each department

CREATE TABLE IF NOT EXISTS public.department_leave_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department TEXT NOT NULL UNIQUE,
    annual_leave_days INTEGER NOT NULL DEFAULT 12,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.department_leave_settings IS 'Cài đặt số ngày nghỉ phép năm cho từng phòng ban';
COMMENT ON COLUMN public.department_leave_settings.department IS 'Tên phòng ban';
COMMENT ON COLUMN public.department_leave_settings.annual_leave_days IS 'Số ngày nghỉ phép năm (mặc định 12 ngày)';
COMMENT ON COLUMN public.department_leave_settings.description IS 'Mô tả thêm về cài đặt';

-- Enable RLS
ALTER TABLE public.department_leave_settings ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow all authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated users to read department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to read department leave settings"
    ON public.department_leave_settings FOR SELECT
    TO authenticated
    USING (true);

-- Create policy: Allow authenticated users to insert
DROP POLICY IF EXISTS "Allow authenticated users to insert department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to insert department leave settings"
    ON public.department_leave_settings FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy: Allow authenticated users to update
DROP POLICY IF EXISTS "Allow authenticated users to update department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to update department leave settings"
    ON public.department_leave_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policy: Allow authenticated users to delete
DROP POLICY IF EXISTS "Allow authenticated users to delete department leave settings" ON public.department_leave_settings;
CREATE POLICY "Allow authenticated users to delete department leave settings"
    ON public.department_leave_settings FOR DELETE
    TO authenticated
    USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_department_leave_settings_department ON public.department_leave_settings(department);

-- Grant permissions
GRANT ALL ON public.department_leave_settings TO authenticated;
