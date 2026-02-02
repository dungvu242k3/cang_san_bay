-- Add note column to employee_profiles for storing miscellaneous import data
ALTER TABLE public.employee_profiles 
ADD COLUMN IF NOT EXISTS note TEXT;

COMMENT ON COLUMN public.employee_profiles.note IS 'Ghi chú chung (Lưu các thông tin import chưa có cột riêng như chứng chỉ, kỹ năng, phụ cấp...)';
