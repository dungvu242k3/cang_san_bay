-- Create table for Job Position Salary History (Lương theo vị trí công việc)
CREATE TABLE IF NOT EXISTS public.employee_job_salaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    decision_number TEXT, -- Số quyết định
    effective_date DATE, -- Ngày hiệu lực
    salary_scale TEXT, -- Ngạch lương
    minimum_wage NUMERIC, -- Mức tối thiểu
    salary_level NUMERIC, -- Bậc lương (Numeric for calculation)
    salary_coefficient NUMERIC, -- Hệ số lương
    position_salary NUMERIC, -- Lương theo tính chất công việc (= Min * Level * Coeff)
    signed_date DATE, -- Ngày ký
    attachment_url TEXT, -- TT đính kèm
    note TEXT, -- Ghi chú
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.employee_job_salaries IS 'Lịch sử lương theo vị trí công việc';

-- Index
CREATE INDEX idx_employee_job_salaries_employee_code ON public.employee_job_salaries(employee_code);

-- RLS
ALTER TABLE public.employee_job_salaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all" ON public.employee_job_salaries;
CREATE POLICY "Enable read access for all" ON public.employee_job_salaries
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable write access for all" ON public.employee_job_salaries;
CREATE POLICY "Enable write access for all" ON public.employee_job_salaries
    FOR ALL TO public USING (true) WITH CHECK (true);
