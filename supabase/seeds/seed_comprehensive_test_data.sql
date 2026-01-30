-- Comprehensive Seed file for all HR modules
-- COVERS: 
-- 1. employee_profiles (Contact, Work, Legal, Party, Union, Youth)
-- 2. family_members
-- 3. labor_contracts
-- 4. employee_bank_accounts
-- 5. employee_passports
-- WARNING: This script TRUNCATES existing data in these tables.

TRUNCATE TABLE public.employee_profiles, public.family_members, public.labor_contracts, public.employee_bank_accounts, public.employee_passports CASCADE;

DO $$
DECLARE
    v_employee_code TEXT;
    v_gender TEXT;
    v_dob DATE;
    v_join_date DATE;
    v_last_name TEXT;
    v_first_name TEXT;
    v_departments TEXT[] := ARRAY['Phòng Nhân sự', 'Phòng Kế toán', 'Phòng IT', 'Phòng Điều hành', 'Phòng An ninh', 'Phòng Kỹ thuật', 'Phòng Dịch vụ'];
    v_teams TEXT[] := ARRAY['Đội A', 'Đội B', 'Đội C', 'Đội D'];
    v_groups TEXT[] := ARRAY['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4', 'Tổ 5'];
    v_employee_types TEXT[] := ARRAY['MB NVCT', 'NVGT', 'NVTV', 'NVTT', 'CBQL'];
    v_labor_types TEXT[] := ARRAY['Văn phòng', 'Lao động nặng', 'Lao động cực nặng', 'Khác'];
    v_positions TEXT[] := ARRAY['Giám đốc', 'Phó giám đốc', 'Trưởng phòng', 'Phó trưởng phòng', 'Đội trưởng', 'Đội phó', 'Tổ trưởng', 'Khác'];
    v_relationships TEXT[] := ARRAY['Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột', 'Anh ruột', 'Em ruột', 'Chị ruột'];
    v_first_names TEXT[] := ARRAY['Nam', 'Hùng', 'Dũng', 'Tuấn', 'Minh', 'Phong', 'Long', 'Hải', 'Quang', 'Đức', 'Hương', 'Lan', 'Mai', 'Hoa', 'Linh', 'Thảo', 'Ngọc', 'Hạnh', 'Thu', 'Trang'];
    v_last_names TEXT[] := ARRAY['Nguyễn Văn', 'Trần Văn', 'Lê Văn', 'Phạm Văn', 'Hoàng Văn', 'Vũ Văn', 'Đặng Văn', 'Bùi Văn', 'Nguyễn Thị', 'Trần Thị', 'Lê Thị', 'Phạm Thị'];
    v_provinces TEXT[] := ARRAY['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nghệ An', 'Thanh Hóa', 'Bắc Ninh', 'Thái Bình', 'Nam Định'];
    v_banks TEXT[] := ARRAY['Vietcombank', 'Techcombank', 'MB Bank', 'ACB', 'BIDV', 'Agribank', 'VPBank'];
    v_contract_types TEXT[] := ARRAY['Không xác định thời hạn', '1 năm', '3 năm', 'Thử việc'];
    
    -- Variables for random values
    v_dept TEXT;
    v_position TEXT;
    v_phone TEXT;
    i INTEGER;
    j INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        v_employee_code := 'NV' || LPAD(i::TEXT, 4, '0');
        v_gender := CASE WHEN random() > 0.5 THEN 'Nam' ELSE 'Nữ' END;
        v_dob := '1980-01-01'::DATE + (random() * 10000)::INTEGER;
        v_join_date := '2015-01-01'::DATE + (random() * 3000)::INTEGER;
        v_last_name := v_last_names[1 + (random() * (array_length(v_last_names, 1) - 1))::INTEGER];
        v_first_name := v_first_names[1 + (random() * (array_length(v_first_names, 1) - 1))::INTEGER];
        v_dept := v_departments[1 + (random() * (array_length(v_departments, 1) - 1))::INTEGER];
        v_position := v_positions[1 + (random() * (array_length(v_positions, 1) - 1))::INTEGER];
        v_phone := '09' || LPAD((random() * 100000000)::INTEGER::TEXT, 8, '0');
        
        -- Insert into employee_profiles
        INSERT INTO public.employee_profiles (
            employee_code,
            card_number,
            last_name,
            first_name,
            gender,
            date_of_birth,
            nationality,
            place_of_birth,
            ethnicity,
            religion,
            education_level,
            training_form,
            marital_status_code,
            academic_level_code,
            -- Contact info
            permanent_address,
            temporary_address,
            hometown,
            phone,
            email_acv,
            email_personal,
            relative_phone,
            relative_relation,
            -- Work info
            decision_number,
            join_date,
            official_date,
            job_position,
            department,
            team,
            group_name,
            employee_type,
            labor_type,
            job_title,
            current_position,
            appointment_date,
            leave_calculation_type,
            -- Legal Info (NEW)
            identity_card_number,
            identity_card_issue_date,
            identity_card_issue_place,
            tax_code,
            health_insurance_number,
            health_insurance_issue_date,
            health_insurance_place,
            social_insurance_number,
            social_insurance_issue_date,
            unemployment_insurance_number,
            unemployment_insurance_issue_date,
             -- Party info (100%)
            is_party_member,
            party_card_number,
            party_join_date,
            party_official_date,
            party_position,
            party_activity_location,
            political_education_level,
            party_notes,
            -- Youth union info (100%)
            is_youth_union_member,
            youth_union_card_number,
            youth_union_join_date,
            youth_union_join_location,
            youth_union_position,
            youth_union_activity_location,
            youth_union_notes,
            -- Trade union info (100%)
            is_trade_union_member,
            trade_union_card_number,
            trade_union_join_date,
            trade_union_position,
            trade_union_activity_location,
            trade_union_notes
        ) VALUES (
            v_employee_code,
            'TH' || LPAD(i::TEXT, 6, '0'),
            v_last_name,
            v_first_name,
            v_gender,
            v_dob,
            'Việt Nam',
            v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER],
            'Kinh',
            'Không',
            '12/12',
            'Phổ Thông',
            1,
            'DH',
            -- Contact
            i || ' Đường Test, Quận Test, TP.HCM',
            NULL,
            v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER],
            v_phone,
            LOWER(v_first_name) || i || '@test.com',
            LOWER(v_first_name) || i || '@gmail.com',
            '0900000000',
            CASE WHEN random() > 0.5 THEN 'Vợ-chồng' ELSE 'Bố-Mẹ' END,
            -- Work
            'QD-' || i,
            v_join_date,
            v_join_date,
            v_position,
            v_dept,
            v_teams[1 + (random() * (array_length(v_teams, 1) - 1))::INTEGER],
            v_groups[1 + (random() * (array_length(v_groups, 1) - 1))::INTEGER],
            v_employee_types[1 + (random() * (array_length(v_employee_types, 1) - 1))::INTEGER],
            'Văn phòng',
            'Nhân viên',
            v_position,
            v_join_date,
            'Có cộng dồn',
             -- Legal Info
            '0' || (10000000000 + i)::TEXT, -- CCCD
            '2020-01-01'::DATE,
            'Cục CS QLHC về TTXH',
            '8' || LPAD(i::TEXT, 9, '0'), -- TAX
            'DN' || LPAD(i::TEXT, 13, '0'), -- BH Y Te
            '2021-01-01'::DATE,
            'Bệnh viện ' || v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER],
            '79' || LPAD(i::TEXT, 8, '0'), -- BHXH
            '2015-01-01'::DATE,
            '79' || LPAD(i::TEXT, 8, '0'), -- BHTN same as BHXH usually
            '2015-01-01'::DATE,
             -- Party (100%)
            TRUE,
            'DV' || LPAD(i::TEXT, 6, '0'),
            '2010-01-01'::DATE + (random() * 4000)::INTEGER,
            '2011-01-01'::DATE + (random() * 4000)::INTEGER,
            'Đảng viên',
            'Chi bộ ' || v_dept,
            'Trung cấp',
            NULL,
            -- Youth (100%)
            TRUE,
            'TN' || LPAD(i::TEXT, 6, '0'),
            '2005-01-01'::DATE + (random() * 5000)::INTEGER,
             v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER],
            'Đoàn viên',
            'Chi đoàn ' || v_dept,
            NULL,
            -- Union (100%)
            TRUE,
            'CD' || LPAD(i::TEXT, 6, '0'),
             v_join_date + (random() * 100)::INTEGER,
            'Công đoàn viên',
            'Công đoàn ' || v_dept,
            NULL
        );
        
        -- Insert family members (3 per employee for verification)
        FOR j IN 1..3 LOOP
            INSERT INTO public.family_members (
                employee_code,
                last_name,
                first_name,
                gender,
                date_of_birth,
                relationship,
                is_dependent,
                dependent_from_month
            ) VALUES (
                v_employee_code,
                v_last_names[1 + (random() * (array_length(v_last_names, 1) - 1))::INTEGER],
                v_first_names[1 + (random() * (array_length(v_first_names, 1) - 1))::INTEGER],
                CASE WHEN random() > 0.5 THEN 'Nam' ELSE 'Nữ' END,
                '1950-01-01'::DATE + (random() * 25000)::INTEGER,
                v_relationships[1 + (random() * (array_length(v_relationships, 1) - 1))::INTEGER],
                random() > 0.5,
                CASE WHEN random() > 0.5 THEN '2023-01-01'::DATE + (random() * 365)::INTEGER ELSE NULL END
            );
        END LOOP;

        -- Bank Accounts (2 per employee)
        FOR j IN 1..2 LOOP
            INSERT INTO public.employee_bank_accounts (
                employee_code,
                bank_name,
                account_name,
                account_number,
                note
            ) VALUES (
                v_employee_code,
                v_banks[1 + (random() * (array_length(v_banks, 1) - 1))::INTEGER],
                UPPER(v_last_name || ' ' || v_first_name),
                (1000000000 + random() * 8999999999)::BIGINT::TEXT,
                'Tài khoản lương'
            );
        END LOOP;

        -- Labor Contracts (2 per employee)
        FOR j IN 1..2 LOOP
             INSERT INTO public.labor_contracts (
                employee_code,
                contract_number,
                contract_type,
                signed_date,
                effective_date,
                expiration_date,
                duration
             ) VALUES (
                v_employee_code,
                'HDLD-' || v_employee_code || '-' || j,
                v_contract_types[1 + (random() * (array_length(v_contract_types, 1) - 1))::INTEGER],
                v_join_date + (j * 365)::INTEGER,
                v_join_date + (j * 365)::INTEGER,
                v_join_date + ((j + 1) * 365)::INTEGER,
                '12 tháng'
            );
        END LOOP;

        -- Passports (100%)
        INSERT INTO public.employee_passports (
            employee_code,
            passport_number,
            passport_type,
            issue_date,
            issue_place,
            expiration_date
        ) VALUES (
             v_employee_code,
             'B' || (1000000 + i)::TEXT,
             'P',
             '2022-01-01'::DATE,
             'Cục Quản lý xuất nhập cảnh',
             '2032-01-01'::DATE
        );

    END LOOP;
END $$;

SELECT 'Dữ liệu test tổng thể (100%) đã được tạo thành công!' as message;
SELECT COUNT(*) as profiles FROM employee_profiles;
SELECT COUNT(*) as family_members FROM family_members;
SELECT COUNT(*) as banks FROM employee_bank_accounts;
SELECT COUNT(*) as contracts FROM labor_contracts;
SELECT COUNT(*) as passports FROM employee_passports;
