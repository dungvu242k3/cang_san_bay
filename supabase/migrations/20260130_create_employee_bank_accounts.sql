-- Create table for Bank Accounts (Tài khoản cá nhân)
CREATE TABLE IF NOT EXISTS public.employee_bank_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- FK
    bank_name TEXT, -- Ngân hàng
    account_name TEXT, -- Tên tài khoản
    account_number TEXT, -- Số tài khoản
    note TEXT, -- Ghi chú
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

COMMENT ON TABLE public.employee_bank_accounts IS 'Tài khoản ngân hàng của nhân viên';
COMMENT ON COLUMN public.employee_bank_accounts.employee_code IS 'Mã nhân viên';
COMMENT ON COLUMN public.employee_bank_accounts.bank_name IS 'Ngân hàng';
COMMENT ON COLUMN public.employee_bank_accounts.account_name IS 'Tên tài khoản';
COMMENT ON COLUMN public.employee_bank_accounts.account_number IS 'Số tài khoản';
COMMENT ON COLUMN public.employee_bank_accounts.note IS 'Ghi chú';

-- Index
CREATE INDEX idx_employee_bank_accounts_employee_code ON public.employee_bank_accounts(employee_code);

-- RLS
ALTER TABLE public.employee_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.employee_bank_accounts
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON public.employee_bank_accounts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
