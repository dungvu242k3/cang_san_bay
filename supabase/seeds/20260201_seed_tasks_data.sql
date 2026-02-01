-- Seed Data for Tasks Module
DO $$
DECLARE
    v_task_id UUID;
    v_me TEXT;
    v_other TEXT;
    v_dept_tech TEXT := 'Phòng Kỹ Thuật';
    v_dept_sec TEXT := 'An Ninh Soi Chiếu';
BEGIN
    -- 1. Attempt to identify "Me" (the current user context if likely, or just the first user)
    -- Ideally we want a user that is likely to be logged in. I'll pick one random or use a hardcoded 'EMP001' if empty.
    SELECT employee_code INTO v_me FROM public.employee_profiles ORDER BY created_at ASC LIMIT 1;
    IF v_me IS NULL THEN v_me := 'ADMIN'; END IF;

    -- 2. Identify "Other" colleague
    SELECT employee_code INTO v_other FROM public.employee_profiles WHERE employee_code != v_me LIMIT 1;
    IF v_other IS NULL THEN v_other := 'GUEST'; END IF;

    -- =============================================
    -- CASE 1: [Đã Nhận] Task assigned TO me (Primary)
    -- =============================================
    INSERT INTO public.tasks (title, description, status, priority, due_date, created_by, progress)
    VALUES (
        'Duyệt kế hoạch trực Tết Nguyên Đán', 
        'Xem xét bảng phân công ca trực và đề xuất điều chỉnh nếu cần thiết.',
        'Đang thực hiện', 
        'Cao', 
        NOW() + INTERVAL '5 days', 
        v_other, -- Created by someone else
        30
    ) RETURNING id INTO v_task_id;

    INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
    VALUES (v_task_id, v_me, 'PERSON', 'PRIMARY'); -- Assigned to Me

    -- =============================================
    -- CASE 2: [Đã Nhận] Task assigned TO me (Collab)
    -- =============================================
    INSERT INTO public.tasks (title, description, status, priority, due_date, created_by, progress)
    VALUES (
        'Tổ chức giải bóng đá giao hữu', 
        'Phối hợp chuẩn bị sân bãi và nước uống.',
        'Mới', 
        'Trung bình', 
        NOW() + INTERVAL '10 days', 
        v_other, 
        0
    ) RETURNING id INTO v_task_id;

    INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
    VALUES (v_task_id, 'Phòng Công Đoàn', 'DEPARTMENT', 'PRIMARY');

    INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
    VALUES (v_task_id, v_me, 'PERSON', 'COLLAB'); -- Me as collab

    -- =============================================
    -- CASE 3: [Đã Giao] Task Created BY me, Assigned to Other
    -- =============================================
    INSERT INTO public.tasks (title, description, status, priority, due_date, created_by, progress)
    VALUES (
        'Kiểm tra định kỳ hệ thống Camera', 
        'Rà soát toàn bộ cam khu vực sảnh T2.',
        'Mới', 
        'Cao', 
        NOW() + INTERVAL '2 days', 
        v_me, -- I created this
        0
    ) RETURNING id INTO v_task_id;

    INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
    VALUES (v_task_id, v_other, 'PERSON', 'PRIMARY'); -- Assigned to Other

    -- =============================================
    -- CASE 4: [Chưa Giao/Draft] Task Created BY me, No Assignee
    -- =============================================
    INSERT INTO public.tasks (title, description, status, priority, due_date, created_by, progress)
    VALUES (
        'Họp báo cáo tháng (DRAFT)', 
        'Nội dung chuẩn bị cho cuộc họp sắp tới. Cần bổ sung thêm số liệu.',
        'Mới', 
        'Thấp', 
        NULL, 
        v_me, -- I created this
        0
    ); 
    -- No insert into task_assignments

    -- =============================================
    -- CASE 5: [Chung] Department Task
    -- =============================================
    INSERT INTO public.tasks (title, description, status, priority, due_date, created_by, progress)
    VALUES (
        'Bảo trì máy soi chiếu số 5', 
        'Máy có hiện tượng nóng bất thường, cần kiểm tra ngay.',
        'Mới', 
        'Khẩn cấp', 
        NOW() + INTERVAL '1 day', 
        v_other, 
        10
    ) RETURNING id INTO v_task_id;

    INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
    VALUES (v_task_id, v_dept_sec, 'DEPARTMENT', 'PRIMARY');

    -- =============================================
    -- CASE 6: Completed Task
    -- =============================================
    INSERT INTO public.tasks (title, description, status, priority, due_date, created_by, progress, completion_date)
    VALUES (
        'Gửi báo cáo sự cố ngày 30/01', 
        'Đã gửi email cho ban giám đốc.',
        'Hoàn thành', 
        'Trung bình', 
        NOW() - INTERVAL '1 day', 
        v_me, 
        100,
        NOW()
    ) RETURNING id INTO v_task_id;

    INSERT INTO public.task_assignments (task_id, assignee_code, assignee_type, role)
    VALUES (v_task_id, v_me, 'PERSON', 'PRIMARY');

END $$;
