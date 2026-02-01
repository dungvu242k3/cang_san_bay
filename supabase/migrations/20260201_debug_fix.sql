-- 1. Fix Permissions (Allow everyone to read/write for now to debug)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for everyone" ON public.tasks;
CREATE POLICY "Allow all for everyone" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for everyone" ON public.task_assignments;
CREATE POLICY "Allow all for everyone" ON public.task_assignments FOR ALL USING (true) WITH CHECK (true);

-- 2. Clean old test data (Optional, be careful)
-- DELETE FROM public.tasks WHERE title LIKE 'Test%';

-- 3. Insert guaranteed data (Simple SQL)
INSERT INTO public.tasks (id, title, description, status, priority, due_date, progress)
VALUES 
    (gen_random_uuid(), 'Công việc Test 1', 'Mô tả công việc test', 'Mới', 'Trung bình', NOW() + INTERVAL '1 day', 0),
    (gen_random_uuid(), 'Công việc Test 2', 'Đang làm...', 'Đang thực hiện', 'Cao', NOW() + INTERVAL '3 days', 50);

-- 4. Check data
SELECT count(*) as total_tasks FROM public.tasks;
