-- Migration: Add score_template_code column to employee_profiles
-- Purpose: Separate employee type (HR) from grading template selection

-- Step 1: Add score_template_code column
ALTER TABLE public.employee_profiles
ADD COLUMN IF NOT EXISTS score_template_code TEXT 
CHECK (score_template_code IN ('NVTT', 'NVGT', 'CBQL'));

-- Step 2: Set default values based on existing employee_type
UPDATE public.employee_profiles 
SET score_template_code = 
  CASE 
    WHEN employee_type IN ('MB NVCT', 'NVTV', 'NVTT') THEN 'NVTT'
    WHEN employee_type = 'NVGT' THEN 'NVGT'
    WHEN employee_type = 'CBQL' THEN 'CBQL'
    ELSE 'NVTT'
  END
WHERE score_template_code IS NULL;

-- Step 3: Add column comment
COMMENT ON COLUMN public.employee_profiles.score_template_code 
IS 'Mẫu chấm điểm KPI: NVTT (Trực tiếp), NVGT (Gián tiếp), CBQL (Quản lý)';
