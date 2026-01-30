-- Seed data for Health & Activities sections
-- Assumes employee_profiles populated with NV0001..NV0050

TRUNCATE TABLE public.employee_health_insurance, public.employee_work_accidents, public.employee_health_checkups CASCADE;

DO $$
DECLARE
    v_emp_code TEXT;
    i INTEGER;
    v_kcb_places TEXT[] := ARRAY['BV Quận 7', 'BV Chợ Rẫy', 'BV 115', 'BV Nhi Đồng 1', 'Phòng khám Đa khoa Sân bay'];
    v_checkup_places TEXT[] := ARRAY['Phòng khám Đa khoa ACV', 'BV Quận 7', 'BV Chợ Rẫy', 'Medlatec', 'Vinmec'];
    v_checkup_results TEXT[] := ARRAY['Đủ sức khỏe', 'Đủ sức khỏe', 'Đủ sức khỏe', 'Cần theo dõi'];
BEGIN
    FOR i IN 1..50 LOOP
        v_emp_code := 'NV' || LPAD(i::TEXT, 4, '0');
        
        -- 1. HEALTH INSURANCE (7.1) - Everyone gets BHYT
        INSERT INTO public.employee_health_insurance (
            employee_code, from_date, to_date, medical_facility, note
        ) VALUES (
            v_emp_code,
            '2024-01-01',
            '2024-12-31',
            v_kcb_places[1 + (random() * 4)::INT],
            'Thẻ BHYT định kỳ đầu năm'
        );

        -- 2. WORK ACCIDENTS (7.2) - ~5% of employees
        IF random() > 0.95 THEN
            INSERT INTO public.employee_work_accidents (
                employee_code, accident_date, accident_location, leave_reason,
                accident_type, leave_days, employee_cost, property_damage,
                compensation_amount, note
            ) VALUES (
                v_emp_code,
                ('2024-' || LPAD((1 + (random() * 11)::INT)::TEXT, 2, '0') || '-' || LPAD((1 + (random() * 27)::INT)::TEXT, 2, '0'))::DATE,
                'Khu vực sân đỗ',
                'Chấn thương do tai nạn lao động',
                CASE WHEN random() > 0.8 THEN 'Nặng' ELSE 'Nhẹ' END,
                (3 + (random() * 27)::INT),
                (500000 + (random() * 9500000)::INT),
                (0 + (random() * 5000000)::INT),
                (1000000 + (random() * 9000000)::INT),
                'Đã hoàn tất thủ tục đền bù'
            );
        END IF;

        -- 3. HEALTH CHECKUPS (7.3) - Everyone gets annual checkup
        INSERT INTO public.employee_health_checkups (
            employee_code, checkup_date, expiry_date, checkup_location,
            cost, result, attachment_url, note
        ) VALUES (
            v_emp_code,
            '2024-01-15',
            '2025-01-15',
            v_checkup_places[1 + (random() * 4)::INT],
            (500000 + (random() * 500000)::INT),
            v_checkup_results[1 + (random() * 3)::INT],
            NULL,
            'Khám sức khỏe định kỳ đầu năm 2024'
        );

        -- Additional checkup for some employees
        IF random() > 0.7 THEN
            INSERT INTO public.employee_health_checkups (
                employee_code, checkup_date, expiry_date, checkup_location,
                cost, result, attachment_url, note
            ) VALUES (
                v_emp_code,
                '2024-07-15',
                '2025-07-15',
                v_checkup_places[1 + (random() * 4)::INT],
                (500000 + (random() * 500000)::INT),
                v_checkup_results[1 + (random() * 3)::INT],
                NULL,
                'Khám sức khỏe giữa năm 2024'
            );
        END IF;
        
    END LOOP;
END $$;
