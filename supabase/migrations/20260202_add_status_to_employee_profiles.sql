-- Add status column to employee_profiles for tracking employment status
ALTER TABLE public.employee_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Đang làm việc';

COMMENT ON COLUMN public.employee_profiles.status IS 'Trạng thái làm việc: Đang làm việc, Nghỉ phép, Nghỉ việc, etc.';
