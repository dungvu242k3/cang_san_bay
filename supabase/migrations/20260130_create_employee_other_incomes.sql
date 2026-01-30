-- Create table for Other Income (Thu nhập khác)
CREATE TABLE IF NOT EXISTS public.employee_other_incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    date_incurred DATE, -- Ngày phát sinh
    income_type TEXT, -- Loại thu nhập
    amount NUMERIC, -- Số tiền
    tax_amount NUMERIC, -- Thuế thu nhập
    applied_month TEXT, -- Tính vào tháng (YYYY-MM)
    note TEXT, -- Ghi chú (optional, standard practice)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.employee_other_incomes IS 'Các khoản thu nhập khác của nhân viên';

-- Index
CREATE INDEX idx_employee_other_incomes_employee_code ON public.employee_other_incomes(employee_code);

-- RLS
ALTER TABLE public.employee_other_incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" ON public.employee_other_incomes
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable write access for all" ON public.employee_other_incomes
    FOR ALL TO public USING (true) WITH CHECK (true);
