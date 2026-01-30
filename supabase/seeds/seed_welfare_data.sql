-- Seed data for Welfare Sections (Salaries, Job Salaries, Allowances, Other Incomes)
-- Assumes employee_profiles populated with NV0001..NV0050

TRUNCATE TABLE public.employee_salaries, public.employee_job_salaries, public.employee_allowances, public.employee_other_incomes CASCADE;

DO $$
DECLARE
    v_emp_code TEXT;
    i INTEGER;
    v_coef NUMERIC;
    v_min_wage NUMERIC := 1800000; -- Mức lương cơ sở
    v_basic NUMERIC;
    v_qds TEXT[] := ARRAY['123/QD-LUONG', '456/QD-LUONG', '789/QD-LUONG', '001/QD-NS', '002/QD-NS'];
    v_scales TEXT[] := ARRAY['A1', 'A2', 'B1', 'B2', 'C1'];
    v_allowance_types TEXT[] := ARRAY['Ăn trưa', 'Xăng xe', 'Điện thoại', 'Trách nhiệm', 'Độc hại'];
    v_income_types TEXT[] := ARRAY['Thưởng Tết', 'Thưởng dự án', 'Làm thêm giờ', 'Hỗ trợ khác'];
BEGIN
    FOR i IN 1..50 LOOP
        v_emp_code := 'NV' || LPAD(i::TEXT, 4, '0');
        
        -- 1. BASIC SALARY (2 records: 1 old, 1 active)
        -- Old record
        v_coef := (2.0 + random())::NUMERIC(4,2);
        INSERT INTO public.employee_salaries (
            employee_code, decision_number, effective_date, salary_scale, salary_level,
            salary_coefficient, minimum_wage, basic_salary, social_insurance_salary,
            salary_unit_price, contract_salary, date_received_level, is_active, note
        ) VALUES (
            v_emp_code, 
            v_qds[1 + (random() * 4)::INT] || '-OLD',
            '2022-01-01',
            v_scales[1 + (random() * 4)::INT],
            '1',
            v_coef,
            v_min_wage,
            v_min_wage * v_coef,
            v_min_wage * v_coef, -- BHXH usually same as basic
            5000000, 7000000, '2022-01-01',
            FALSE, 'Lương cũ'
        );

        -- Active record
        v_coef := v_coef + 0.33; -- Salary increase
        INSERT INTO public.employee_salaries (
            employee_code, decision_number, effective_date, salary_scale, salary_level,
            salary_coefficient, minimum_wage, basic_salary, social_insurance_salary,
            salary_unit_price, contract_salary, date_received_level, is_active, note
        ) VALUES (
            v_emp_code, 
            v_qds[1 + (random() * 4)::INT],
            '2024-01-01',
            v_scales[1 + (random() * 4)::INT],
            '2',
            v_coef,
            v_min_wage,
            v_min_wage * v_coef,
            v_min_wage * v_coef,
            5500000, 8000000, '2024-01-01',
            TRUE, 'Lương hiện tại'
        );

        -- 2. JOB SALARY (1 record)
        INSERT INTO public.employee_job_salaries (
            employee_code, decision_number, effective_date, salary_scale, minimum_wage,
            salary_level, salary_coefficient, position_salary, signed_date, note
        ) VALUES (
            v_emp_code,
            'JD-' || v_emp_code,
            '2024-01-01',
            'S-POS',
            v_min_wage,
            1, -- Level 1
            1.5, -- Coeff
            v_min_wage * 1 * 1.5,
            '2023-12-15',
            'Lương theo vị trí hiện tại'
        );

        -- 3. ALLOWANCES (2 records)
        INSERT INTO public.employee_allowances (
            employee_code, decision_number, effective_date, allowance_type, allowance_level,
            amount, is_active, note
        ) VALUES (
            v_emp_code, 'QD-PC-01', '2024-01-01', 
            v_allowance_types[1 + (random() * 2)::INT], -- Random lunch/gas
            'Mức 1', 
            (500000 + (random() * 1000000))::INT, 
            TRUE, ''
        );

        INSERT INTO public.employee_allowances (
            employee_code, decision_number, effective_date, allowance_type, allowance_level,
            amount, is_active, note
        ) VALUES (
            v_emp_code, 'QD-PC-02', '2024-01-01', 
            'Trách nhiệm',
            'Mức A', 
            (1000000 + (random() * 2000000))::INT, 
            TRUE, ''
        );

        -- 4. OTHER INCOME (1-2 records)
        INSERT INTO public.employee_other_incomes (
            employee_code, date_incurred, income_type, amount, tax_amount, applied_month, note
        ) VALUES (
            v_emp_code, '2024-02-15', 'Thưởng Tết', 
            (5000000 + (random() * 10000000))::INT, 
            0, '2024-02', 'Thưởng Tết Nguyên Đán'
        );
        
    END LOOP;
END $$;
