-- Seed data for Rewards & Discipline sections
-- Assumes employee_profiles populated with NV0001..NV0050

TRUNCATE TABLE public.employee_rewards, public.employee_disciplines CASCADE;

DO $$
DECLARE
    v_emp_code TEXT;
    i INTEGER;
    v_reward_types TEXT[] := ARRAY['Bằng khen', 'Giấy khen', 'Thưởng tiền', 'Thăng chức'];
    v_reward_contents TEXT[] := ARRAY['Hoàn thành xuất sắc nhiệm vụ', 'Sáng kiến cải tiến', 'Thành tích thi đua', 'Nhân viên của năm', 'Doanh số vượt chỉ tiêu'];
    v_discipline_types TEXT[] := ARRAY['Khiển trách', 'Cảnh cáo'];
BEGIN
    FOR i IN 1..50 LOOP
        v_emp_code := 'NV' || LPAD(i::TEXT, 4, '0');
        
        -- 1. REWARDS (6.1) - Give rewards to ~60% of employees
        IF random() > 0.4 THEN
            -- Reward 1
            INSERT INTO public.employee_rewards (
                employee_code, decision_number, reward_type, reward_content,
                signed_date, amount, reward_date, applied_year, attachment_url, note
            ) VALUES (
                v_emp_code,
                'QD-KT-' || (2023 + (random() * 2)::INT) || '-' || LPAD((i * 3)::TEXT, 3, '0'),
                v_reward_types[1 + (random() * 3)::INT],
                v_reward_contents[1 + (random() * 4)::INT],
                ('2024-' || LPAD((1 + (random() * 11)::INT)::TEXT, 2, '0') || '-15')::DATE,
                (500000 + (random() * 4500000)::INT),
                ('2024-' || LPAD((1 + (random() * 11)::INT)::TEXT, 2, '0') || '-20')::DATE,
                2024,
                NULL,
                'Khen thưởng định kỳ'
            );

            -- Reward 2 for some
            IF random() > 0.6 THEN
                INSERT INTO public.employee_rewards (
                    employee_code, decision_number, reward_type, reward_content,
                    signed_date, amount, reward_date, applied_year, attachment_url, note
                ) VALUES (
                    v_emp_code,
                    'QD-KT-2025-' || LPAD((i * 2)::TEXT, 3, '0'),
                    v_reward_types[1 + (random() * 3)::INT],
                    v_reward_contents[1 + (random() * 4)::INT],
                    '2025-01-10',
                    (1000000 + (random() * 3000000)::INT),
                    '2025-01-15',
                    2025,
                    NULL,
                    'Khen thưởng đầu năm'
                );
            END IF;
        END IF;

        -- 2. DISCIPLINES (6.2) - Give discipline to ~10% of employees
        IF random() > 0.9 THEN
            INSERT INTO public.employee_disciplines (
                employee_code, decision_number, signed_date, discipline_type,
                from_date, to_date, note
            ) VALUES (
                v_emp_code,
                'QD-KL-2024-' || LPAD(i::TEXT, 3, '0'),
                ('2024-' || LPAD((1 + (random() * 11)::INT)::TEXT, 2, '0') || '-10')::DATE,
                v_discipline_types[1 + (random() * 1)::INT],
                ('2024-' || LPAD((1 + (random() * 11)::INT)::TEXT, 2, '0') || '-15')::DATE,
                ('2024-' || LPAD((6 + (random() * 5)::INT)::TEXT, 2, '0') || '-15')::DATE,
                'Vi phạm nội quy lao động'
            );
        END IF;
        
    END LOOP;
END $$;
