-- Seed data for Knowledge Sections (Training Specializations, Certificates, Internal Trainings)
-- Assumes employee_profiles populated with NV0001..NV0050

TRUNCATE TABLE public.employee_training_specializations, public.employee_certificates, public.employee_internal_trainings CASCADE;

DO $$
DECLARE
    v_emp_code TEXT;
    i INTEGER;
    v_specializations TEXT[] := ARRAY['Kỹ thuật hàng không', 'Quản trị kinh doanh', 'Công nghệ thông tin', 'Điện tử viễn thông', 'Cơ khí', 'Tài chính ngân hàng'];
    v_education_levels TEXT[] := ARRAY['Đại học', 'Thạc sĩ', 'Cao đẳng', 'Trung cấp'];
    v_training_types TEXT[] := ARRAY['Chính quy', 'Tại chức', 'Từ xa', 'Liên thông'];
    v_universities TEXT[] := ARRAY['ĐH Bách Khoa HCM', 'ĐH Giao thông Vận tải', 'ĐH Hàng không VN', 'ĐH Kinh tế TP.HCM', 'Học viện CNTT'];
    v_certificates TEXT[] := ARRAY['TOEIC', 'IELTS', 'MOS', 'CCNA', 'PMP', 'ISO 9001', 'Six Sigma', 'First Aid'];
    v_cert_levels TEXT[] := ARRAY['A', 'B', 'C', 'Cơ bản', 'Nâng cao', 'Chuyên sâu'];
    v_training_places TEXT[] := ARRAY['Trung tâm đào tạo ACV', 'Sân bay TSN', 'Sân bay Nội Bài', 'Singapore', 'Trụ sở chính'];
    v_training_courses TEXT[] := ARRAY['An toàn lao động', 'Phòng cháy chữa cháy', 'Nghiệp vụ sân bay', 'Vận hành thiết bị', 'Dịch vụ khách hàng', 'Quản lý'];
    v_results TEXT[] := ARRAY['Đạt', 'Giỏi', 'Khá', 'Trung bình'];
BEGIN
    FOR i IN 1..50 LOOP
        v_emp_code := 'NV' || LPAD(i::TEXT, 4, '0');
        
        -- 1. TRAINING SPECIALIZATIONS (1-2 records)
        -- Main degree
        INSERT INTO public.employee_training_specializations (
            employee_code, specialization, from_date, to_date, training_place,
            education_level, training_type, note
        ) VALUES (
            v_emp_code, 
            v_specializations[1 + (random() * 5)::INT],
            '2010-09-01',
            '2014-06-30',
            v_universities[1 + (random() * 4)::INT],
            v_education_levels[1 + (random() * 3)::INT],
            v_training_types[1 + (random() * 3)::INT],
            'Bằng chính'
        );

        -- Second degree for some employees
        IF random() > 0.6 THEN
            INSERT INTO public.employee_training_specializations (
                employee_code, specialization, from_date, to_date, training_place,
                education_level, training_type, note
            ) VALUES (
                v_emp_code, 
                v_specializations[1 + (random() * 5)::INT],
                '2016-09-01',
                '2018-12-30',
                v_universities[1 + (random() * 4)::INT],
                'Thạc sĩ',
                'Tại chức',
                'Bằng 2 / Thạc sĩ'
            );
        END IF;

        -- 2. CERTIFICATES (1-3 records)
        -- Certificate 1: Language
        INSERT INTO public.employee_certificates (
            employee_code, certificate_name, level, training_place, from_date, to_date,
            certificate_number, issue_date, expiry_date, note
        ) VALUES (
            v_emp_code, 
            CASE WHEN random() > 0.5 THEN 'TOEIC' ELSE 'IELTS' END,
            CASE WHEN random() > 0.5 THEN '700+' ELSE '6.0+' END,
            'IIG Vietnam',
            '2020-01-15',
            '2020-01-15',
            'CC-' || v_emp_code || '-ENG',
            '2020-01-20',
            '2025-01-20',
            'Chứng chỉ tiếng Anh'
        );

        -- Certificate 2: Professional (for some)
        IF random() > 0.4 THEN
            INSERT INTO public.employee_certificates (
                employee_code, certificate_name, level, training_place, from_date, to_date,
                certificate_number, issue_date, expiry_date, note
            ) VALUES (
                v_emp_code, 
                v_certificates[3 + (random() * 5)::INT],
                v_cert_levels[1 + (random() * 5)::INT],
                v_training_places[1 + (random() * 4)::INT],
                '2022-03-01',
                '2022-03-05',
                'CC-' || v_emp_code || '-PRO',
                '2022-03-10',
                NULL,
                'Chứng chỉ nghiệp vụ'
            );
        END IF;

        -- 3. INTERNAL TRAININGS (1-2 records)
        -- Training 1
        INSERT INTO public.employee_internal_trainings (
            employee_code, class_code, from_date, to_date, decision_number,
            training_place, training_course, result, note
        ) VALUES (
            v_emp_code,
            'LOP-2024-' || LPAD((i % 10 + 1)::TEXT, 2, '0'),
            '2024-01-15',
            '2024-01-17',
            'QD-DT-' || v_emp_code || '-01',
            v_training_places[1 + (random() * 4)::INT],
            v_training_courses[1 + (random() * 5)::INT],
            v_results[1 + (random() * 3)::INT],
            'Đào tạo định kỳ đầu năm'
        );

        -- Training 2 (for some)
        IF random() > 0.5 THEN
            INSERT INTO public.employee_internal_trainings (
                employee_code, class_code, from_date, to_date, decision_number,
                training_place, training_course, result, note
            ) VALUES (
                v_emp_code,
                'LOP-2024-' || LPAD((i % 5 + 6)::TEXT, 2, '0'),
                '2024-06-10',
                '2024-06-12',
                'QD-DT-' || v_emp_code || '-02',
                v_training_places[1 + (random() * 4)::INT],
                v_training_courses[1 + (random() * 5)::INT],
                v_results[1 + (random() * 3)::INT],
                'Đào tạo nâng cao'
            );
        END IF;
        
    END LOOP;
END $$;
