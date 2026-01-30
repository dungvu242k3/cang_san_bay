-- Create table for Basic Salary History (Lương cơ bản)
CREATE TABLE IF NOT EXISTS public.employee_salaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    decision_number TEXT, -- Số QĐ lương CB
    effective_date DATE, -- Ngày hiệu lực
    salary_scale TEXT, -- Ngạch lương
    salary_level TEXT, -- Bậc lương
    salary_coefficient NUMERIC, -- Hệ số lương
    minimum_wage NUMERIC, -- Lương tối thiểu
    basic_salary NUMERIC, -- Lương cơ bản (= Lương tối thiểu * Hệ số)
    social_insurance_salary NUMERIC, -- Lương đóng BHXH
    salary_unit_price NUMERIC, -- Đơn giá lương
    contract_salary NUMERIC, -- Mức lương khoán
    date_received_level DATE, -- Ngày nhận bậc lương
    is_active BOOLEAN DEFAULT FALSE, -- Đang hiệu lực
    note TEXT, -- Ghi chú
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.employee_salaries IS 'Lịch sử lương cơ bản của nhân viên';

-- Index
CREATE INDEX idx_employee_salaries_employee_code ON public.employee_salaries(employee_code);

-- RLS
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all" ON public.employee_salaries;
CREATE POLICY "Enable read access for all" ON public.employee_salaries
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable write access for all" ON public.employee_salaries;
CREATE POLICY "Enable write access for all" ON public.employee_salaries
    FOR ALL TO public USING (true) WITH CHECK (true);
