-- Create table for Labor Contracts (Hợp đồng lao động)
CREATE TABLE IF NOT EXISTS public.labor_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    contract_number TEXT, -- Số hợp đồng
    signed_date DATE, -- Ngày ký
    effective_date DATE, -- Ngày hiệu lực
    expiration_date DATE, -- Ngày hết hạn
    contract_type TEXT, -- Loại hợp đồng
    duration TEXT, -- Thời hạn hợp đồng
    note TEXT, -- Ghi chú
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.labor_contracts IS 'Hợp đồng lao động';
COMMENT ON COLUMN public.labor_contracts.contract_number IS 'Số hợp đồng';
COMMENT ON COLUMN public.labor_contracts.signed_date IS 'Ngày ký';
COMMENT ON COLUMN public.labor_contracts.effective_date IS 'Ngày hiệu lực';
COMMENT ON COLUMN public.labor_contracts.expiration_date IS 'Ngày hết hạn';
COMMENT ON COLUMN public.labor_contracts.contract_type IS 'Loại hợp đồng';
COMMENT ON COLUMN public.labor_contracts.duration IS 'Thời hạn hợp đồng';

-- Index
CREATE INDEX idx_labor_contracts_employee_code ON public.labor_contracts(employee_code);

-- RLS
ALTER TABLE public.labor_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.labor_contracts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON public.labor_contracts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
