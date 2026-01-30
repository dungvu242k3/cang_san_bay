-- Create table for Allowances (Phụ cấp)
CREATE TABLE IF NOT EXISTS public.employee_allowances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    decision_number TEXT, -- Số quyết định
    effective_date DATE, -- Ngày hiệu lực
    allowance_type TEXT, -- Loại phụ cấp
    allowance_level TEXT, -- Mức phụ cấp
    amount NUMERIC, -- Số tiền
    attachment_url TEXT, -- TT đính kèm
    is_active BOOLEAN DEFAULT FALSE, -- Đang hiệu lực
    note TEXT, -- Ghi chú
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.employee_allowances IS 'Thông tin phụ cấp của nhân viên';

-- Index
CREATE INDEX idx_employee_allowances_employee_code ON public.employee_allowances(employee_code);

-- RLS
ALTER TABLE public.employee_allowances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" ON public.employee_allowances
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable write access for all" ON public.employee_allowances
    FOR ALL TO public USING (true) WITH CHECK (true);
