-- Add number_of_dependents column to employee_salaries table
ALTER TABLE public.employee_salaries 
ADD COLUMN IF NOT EXISTS number_of_dependents INTEGER DEFAULT 0;

COMMENT ON COLUMN public.employee_salaries.number_of_dependents IS 'Số người phụ thuộc (để tính thuế)';
