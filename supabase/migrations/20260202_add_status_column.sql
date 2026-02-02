-- Migration: Add status column to employee_profiles
-- This column tracks the current working status of employees

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN status TEXT DEFAULT 'Đang làm việc';
        COMMENT ON COLUMN public.employee_profiles.status IS 'Trạng thái làm việc (VD: Đang làm việc, Nghỉ việc, Thử việc, ...)';
    END IF;
END $$;

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_employee_profiles_status ON public.employee_profiles(status);
