-- Create table for Passports (Hộ chiếu)
CREATE TABLE IF NOT EXISTS public.employee_passports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    passport_number TEXT, -- Số hộ chiếu
    passport_type TEXT, -- Loại hộ chiếu
    issue_date DATE, -- Ngày cấp
    issue_place TEXT, -- Nơi cấp
    expiration_date DATE, -- Ngày hết hạn
    note TEXT, -- Ghi chú
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.employee_passports IS 'Hộ chiếu của nhân viên';
COMMENT ON COLUMN public.employee_passports.passport_number IS 'Số hộ chiếu';
COMMENT ON COLUMN public.employee_passports.passport_type IS 'Loại hộ chiếu';
COMMENT ON COLUMN public.employee_passports.issue_date IS 'Ngày cấp';
COMMENT ON COLUMN public.employee_passports.issue_place IS 'Nơi cấp';
COMMENT ON COLUMN public.employee_passports.expiration_date IS 'Ngày hết hạn';

-- Index
CREATE INDEX idx_employee_passports_employee_code ON public.employee_passports(employee_code);

-- RLS
ALTER TABLE public.employee_passports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.employee_passports
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON public.employee_passports
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
