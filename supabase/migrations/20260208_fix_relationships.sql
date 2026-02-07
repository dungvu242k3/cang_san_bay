-- FIX: Add Missing Foreign Key Relationships for PostgREST
-- Description: Explicitly adds FKs for task_comments(sender_code) and task_attachments(uploaded_by)
-- This is required for Supabase/PostgREST to detect relationships in .select('*, employee_profiles:sender_code(...)')

-- 1. Ensure task_comments.sender_code relationship
DO $$
BEGIN
    -- Check if constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_comments_sender_code_fkey'
        AND table_name = 'task_comments'
    ) THEN
        -- Verify column exists first
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'sender_code') THEN
            ALTER TABLE public.task_comments
            ADD CONSTRAINT task_comments_sender_code_fkey 
            FOREIGN KEY (sender_code) 
            REFERENCES public.employee_profiles(employee_code) 
            ON DELETE CASCADE;
            RAISE NOTICE '✅ Added FK task_comments.sender_code -> employee_profiles.employee_code';
        ELSE
            RAISE NOTICE '⚠️ Skipping task_comments FK: column sender_code missing';
        END IF;
    END IF;
END $$;

-- 2. Ensure task_attachments.uploaded_by relationship
DO $$
BEGIN
    -- Rename uploaded_by to match if needed? No, code uses uploaded_by, so we keep it.
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_attachments_uploaded_by_fkey'
        AND table_name = 'task_attachments'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'uploaded_by') THEN
            ALTER TABLE public.task_attachments
            ADD CONSTRAINT task_attachments_uploaded_by_fkey 
            FOREIGN KEY (uploaded_by) 
            REFERENCES public.employee_profiles(employee_code) 
            ON DELETE CASCADE;
            RAISE NOTICE '✅ Added FK task_attachments.uploaded_by -> employee_profiles.employee_code';
        ELSE
            RAISE NOTICE '⚠️ Skipping task_attachments FK: column uploaded_by missing';
        END IF;
    END IF;
END $$;

-- 3. Force Schema Cache Reload
-- This is critical for PostgREST to pick up the new relationships immediately
NOTIFY pgrst, 'reload schema';

SELECT '✅ Fix Complete: Relationships established.' as status;
