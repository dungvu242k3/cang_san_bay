-- Seed data for Work Process Sections (Leaves, Appointments, Work Journals)
-- Assumes employee_profiles populated with NV0001..NV0050

TRUNCATE TABLE public.employee_leaves, public.employee_appointments, public.employee_work_journals CASCADE;

DO $$
DECLARE
    v_emp_code TEXT;
    i INTEGER;
    v_leave_types TEXT[] := ARRAY['Phép năm', 'Việc riêng', 'Ốm đau', 'Không lương'];
    v_leave_reasons TEXT[] := ARRAY['Nghỉ mát', 'Việc gia đình', 'Khám bệnh', 'Cưới con', 'Du lịch'];
    v_departments TEXT[] := ARRAY['Phòng Kỹ thuật', 'Phòng Hành chính', 'Phòng An ninh', 'Phòng Dịch vụ mặt đất', 'Phòng Vận hành'];
    v_positions TEXT[] := ARRAY['Nhân viên', 'Trưởng nhóm', 'Phó phòng', 'Trưởng phòng', 'Chuyên viên'];
    v_job_titles TEXT[] := ARRAY['Kỹ sư', 'Cán bộ', 'Chuyên viên', 'Nhân viên nghiệp vụ'];
    v_workplaces TEXT[] := ARRAY['Sân bay Tân Sơn Nhất', 'Sân bay Nội Bài', 'Sân bay Đà Nẵng', 'Trụ sở chính'];
    v_work_locations TEXT[] := ARRAY['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Singapore', 'Bangkok', 'Seoul'];
    v_purposes TEXT[] := ARRAY['Đào tạo', 'Họp công tác', 'Kiểm tra thiết bị', 'Hội nghị quốc tế', 'Học tập kinh nghiệm'];
    v_rand INTEGER;
BEGIN
    FOR i IN 1..50 LOOP
        v_emp_code := 'NV' || LPAD(i::TEXT, 4, '0');
        
        -- 1. LEAVES (2-3 records per employee)
        -- Leave 1: Old leave (already approved)
        INSERT INTO public.employee_leaves (
            employee_code, leave_type, reason, from_date, to_date, 
            leave_days, total_deducted, remaining_leave, status, note
        ) VALUES (
            v_emp_code, 
            v_leave_types[1 + (random() * 3)::INT],
            v_leave_reasons[1 + (random() * 4)::INT],
            '2024-02-10',
            '2024-02-12',
            3, 3, 9, 'Đã duyệt', 'Nghỉ Tết'
        );

        -- Leave 2: Recent leave (approved)
        INSERT INTO public.employee_leaves (
            employee_code, leave_type, reason, from_date, to_date, 
            leave_days, total_deducted, remaining_leave, status, note
        ) VALUES (
            v_emp_code, 
            v_leave_types[1 + (random() * 3)::INT],
            v_leave_reasons[1 + (random() * 4)::INT],
            '2024-07-15',
            '2024-07-17',
            3, 3, 6, 'Đã duyệt', ''
        );

        -- Leave 3: Pending leave for some employees
        IF random() > 0.5 THEN
            INSERT INTO public.employee_leaves (
                employee_code, leave_type, reason, from_date, to_date, 
                leave_days, total_deducted, remaining_leave, status, note
            ) VALUES (
                v_emp_code, 
                'Phép năm',
                'Du lịch cuối năm',
                '2024-12-23',
                '2024-12-27',
                5, 5, 1, 'Chờ duyệt', 'Xin nghỉ Noel + Tết dương lịch'
            );
        END IF;

        -- 2. APPOINTMENTS (2 records: initial + promotion/transfer)
        -- Initial appointment
        INSERT INTO public.employee_appointments (
            employee_code, decision_number, applied_date, job_title, position,
            department, workplace, note
        ) VALUES (
            v_emp_code,
            'QD-BN-' || v_emp_code || '-01',
            '2020-01-15',
            v_job_titles[1 + (random() * 3)::INT],
            'Nhân viên',
            v_departments[1 + (random() * 4)::INT],
            v_workplaces[1 + (random() * 3)::INT],
            'Bổ nhiệm lần đầu'
        );

        -- Promotion/Transfer (for some employees)
        IF i <= 30 THEN
            v_rand := 1 + (random() * 4)::INT;
            INSERT INTO public.employee_appointments (
                employee_code, decision_number, applied_date, job_title, position,
                department, workplace, note
            ) VALUES (
                v_emp_code,
                'QD-BN-' || v_emp_code || '-02',
                '2023-07-01',
                v_job_titles[v_rand],
                v_positions[1 + (random() * 2)::INT], -- Trưởng nhóm or higher
                v_departments[1 + (random() * 4)::INT],
                v_workplaces[1 + (random() * 3)::INT],
                CASE WHEN random() > 0.5 THEN 'Bổ nhiệm chức vụ mới' ELSE 'Điều chuyển công tác' END
            );
        END IF;

        -- 3. WORK JOURNALS (1-2 business trips per employee)
        -- First trip
        INSERT INTO public.employee_work_journals (
            employee_code, decision_number, from_date, to_date, 
            work_location, purpose, note
        ) VALUES (
            v_emp_code,
            'CT-' || v_emp_code || '-2024-01',
            '2024-03-10',
            '2024-03-12',
            v_work_locations[1 + (random() * 5)::INT],
            v_purposes[1 + (random() * 4)::INT],
            'Công tác đầu năm'
        );

        -- Second trip for some employees
        IF random() > 0.4 THEN
            INSERT INTO public.employee_work_journals (
                employee_code, decision_number, from_date, to_date, 
                work_location, purpose, note
            ) VALUES (
                v_emp_code,
                'CT-' || v_emp_code || '-2024-02',
                '2024-09-05',
                '2024-09-08',
                v_work_locations[1 + (random() * 5)::INT],
                v_purposes[1 + (random() * 4)::INT],
                ''
            );
        END IF;
        
    END LOOP;
END $$;
