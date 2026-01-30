-- Fix RLS policies to ensure access for testing
-- Applies to: employee_bank_accounts, labor_contracts, employee_passports

-- 1. Employee Bank Accounts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_bank_accounts;
CREATE POLICY "Enable read access for all" ON public.employee_bank_accounts
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.employee_bank_accounts;
CREATE POLICY "Enable write access for all" ON public.employee_bank_accounts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 2. Labor Contracts
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.labor_contracts;
CREATE POLICY "Enable read access for all" ON public.labor_contracts
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.labor_contracts;
CREATE POLICY "Enable write access for all" ON public.labor_contracts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Employee Passports
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.employee_passports;
CREATE POLICY "Enable read access for all" ON public.employee_passports
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.employee_passports;
CREATE POLICY "Enable write access for all" ON public.employee_passports
    FOR ALL
    USING (true)
    WITH CHECK (true);

SELECT 'Đã cập nhật RLS policies: Cho phép truy cập (SELECT/INSERT/UPDATE) cho mọi người dùng (kể cả chưa login)' as result;
