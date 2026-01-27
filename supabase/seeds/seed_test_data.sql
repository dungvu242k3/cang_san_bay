-- Seed file for test data: 50 employees with full profile data
-- Chỉ insert vào 2 bảng: employee_profiles và family_members
-- Run order:
-- 1. 20260127_create_employee_profiles.sql 
-- 2. 20260127_create_family_members.sql
-- 3. This seed file

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
    v_dept TEXT;
    v_position TEXT;
    v_phone TEXT;
    i INTEGER;
    j INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        v_employee_code := 'NV' || LPAD(i::TEXT, 4, '0');
        v_gender := CASE WHEN random() > 0.5 THEN 'Nam' ELSE 'Nữ' END;
        v_dob := '1970-01-01'::DATE + (random() * 15000)::INTEGER;
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
            -- Party info
            is_party_member,
            party_card_number,
            party_join_date,
            party_official_date,
            party_position,
            party_activity_location,
            political_education_level,
            party_notes,
            -- Youth union info
            is_youth_union_member,
            youth_union_card_number,
            youth_union_join_date,
            youth_union_join_location,
            youth_union_position,
            youth_union_activity_location,
            youth_union_notes,
            -- Trade union info
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
            CASE WHEN random() > 0.1 THEN 'Kinh' ELSE 'Tày' END,
            CASE WHEN random() > 0.7 THEN 'Phật giáo' ELSE 'Không' END,
            CASE WHEN random() > 0.5 THEN '12/12' ELSE '10/12' END,
            CASE WHEN random() > 0.5 THEN 'Phổ Thông' ELSE 'Bổ túc' END,
            CASE WHEN random() > 0.4 THEN 2 ELSE 1 END,
            CASE WHEN random() > 0.3 THEN 'DH' ELSE 'CD' END,
            -- Contact
            i || ' Đường ABC, Phường XYZ, ' || v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER],
            CASE WHEN random() > 0.5 THEN i || ' Đường DEF, Quận 1, TP.HCM' ELSE NULL END,
            v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER],
            v_phone,
            LOWER(v_first_name) || i || '@acv.vn',
            LOWER(v_first_name) || i || '@gmail.com',
            '09' || LPAD((random() * 100000000)::INTEGER::TEXT, 8, '0'),
            CASE WHEN random() > 0.5 THEN 'Vợ-chồng' ELSE 'Bố-Mẹ' END,
            -- Work
            'QD-' || (2020 + (random() * 5)::INTEGER) || '/' || LPAD(i::TEXT, 3, '0'),
            v_join_date,
            v_join_date + (random() * 365)::INTEGER,
            v_position,
            v_dept,
            v_teams[1 + (random() * (array_length(v_teams, 1) - 1))::INTEGER],
            v_groups[1 + (random() * (array_length(v_groups, 1) - 1))::INTEGER],
            v_employee_types[1 + (random() * (array_length(v_employee_types, 1) - 1))::INTEGER],
            v_labor_types[1 + (random() * (array_length(v_labor_types, 1) - 1))::INTEGER],
            'Chức danh ' || i,
            v_position,
            v_join_date + (random() * 1000)::INTEGER,
            CASE WHEN random() > 0.5 THEN 'Có cộng dồn' ELSE 'Không cộng dồn' END,
            -- Party (30% are party members)
            random() > 0.7,
            CASE WHEN random() > 0.7 THEN 'DV' || LPAD(i::TEXT, 6, '0') ELSE NULL END,
            CASE WHEN random() > 0.7 THEN '2010-01-01'::DATE + (random() * 4000)::INTEGER ELSE NULL END,
            CASE WHEN random() > 0.7 THEN '2011-01-01'::DATE + (random() * 4000)::INTEGER ELSE NULL END,
            CASE WHEN random() > 0.7 THEN 'Đảng viên' ELSE NULL END,
            CASE WHEN random() > 0.7 THEN 'Chi bộ ' || v_dept ELSE NULL END,
            CASE WHEN random() > 0.7 THEN 'Trung cấp' ELSE NULL END,
            NULL,
            -- Youth (60% are youth members)
            random() > 0.4,
            CASE WHEN random() > 0.4 THEN 'TN' || LPAD(i::TEXT, 6, '0') ELSE NULL END,
            CASE WHEN random() > 0.4 THEN '2005-01-01'::DATE + (random() * 5000)::INTEGER ELSE NULL END,
            CASE WHEN random() > 0.4 THEN v_provinces[1 + (random() * (array_length(v_provinces, 1) - 1))::INTEGER] ELSE NULL END,
            CASE WHEN random() > 0.4 THEN 'Đoàn viên' ELSE NULL END,
            CASE WHEN random() > 0.4 THEN 'Chi đoàn ' || v_dept ELSE NULL END,
            NULL,
            -- Union (80% are union members)
            random() > 0.2,
            CASE WHEN random() > 0.2 THEN 'CD' || LPAD(i::TEXT, 6, '0') ELSE NULL END,
            CASE WHEN random() > 0.2 THEN v_join_date + (random() * 100)::INTEGER ELSE NULL END,
            CASE WHEN random() > 0.2 THEN 'Công đoàn viên' ELSE NULL END,
            CASE WHEN random() > 0.2 THEN 'Công đoàn ' || v_dept ELSE NULL END,
            NULL
        ) ON CONFLICT (employee_code) DO NOTHING;
        
        -- Insert family members (1-3 per employee)
        FOR j IN 1..(1 + (random() * 2)::INTEGER) LOOP
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
        
    END LOOP;
END $$;

-- Display summary
SELECT 'Đã tạo xong dữ liệu test!' AS message;
SELECT COUNT(*) AS total_profiles FROM public.employee_profiles;
SELECT COUNT(*) AS total_family_members FROM public.family_members;
