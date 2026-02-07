-- FIX: Enable anon role for RLS (Custom Auth without Supabase Auth)
-- ===============================================================
-- ISSUE: The application uses CUSTOM AUTH (localStorage + password in DB)
-- instead of Supabase Auth. This means the Supabase client has NO JWT,
-- and all requests come in as 'anon' role, NOT 'authenticated'.
-- ===============================================================

-- ==========================================================
-- 1. TASK COMMENTS
-- ==========================================================

-- Drop ALL existing policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'task_comments' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_comments', pol.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for BOTH anon and authenticated
CREATE POLICY "Enable all for anon"
ON public.task_comments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all for authenticated"
ON public.task_comments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.task_comments TO anon;
GRANT ALL ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;

-- ==========================================================
-- 2. TASK ATTACHMENTS
-- ==========================================================

-- A. FIX SCHEMA: Frontend uses file_path, file_size, file_type but old schema has file_url
DO $$
BEGIN
    -- Add file_path if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'file_path') THEN
        ALTER TABLE public.task_attachments ADD COLUMN file_path TEXT;
    END IF;
    
    -- Add file_size if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'file_size') THEN
        ALTER TABLE public.task_attachments ADD COLUMN file_size BIGINT;
    END IF;
    
    -- Add file_type if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'file_type') THEN
        ALTER TABLE public.task_attachments ADD COLUMN file_type TEXT;
    END IF;
    
    -- Make file_url nullable (old schema had it as NOT NULL)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'file_url') THEN
        ALTER TABLE public.task_attachments ALTER COLUMN file_url DROP NOT NULL;
    END IF;
END $$;

-- Drop ALL existing policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'task_attachments' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_attachments', pol.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for BOTH anon and authenticated
CREATE POLICY "Enable all for anon"
ON public.task_attachments
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all for authenticated"
ON public.task_attachments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.task_attachments TO anon;
GRANT ALL ON public.task_attachments TO authenticated;
GRANT ALL ON public.task_attachments TO service_role;

-- ==========================================================
-- 3. ENSURE FOREIGN KEYS EXIST
-- ==========================================================

-- task_comments.sender_code -> employee_profiles.employee_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'task_comments' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%sender_code%'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'sender_code') THEN
            ALTER TABLE public.task_comments
            ADD CONSTRAINT task_comments_sender_code_fk
            FOREIGN KEY (sender_code) 
            REFERENCES public.employee_profiles(employee_code) 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- task_attachments.uploaded_by -> employee_profiles.employee_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'task_attachments' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%uploaded_by%'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'uploaded_by') THEN
            ALTER TABLE public.task_attachments
            ADD CONSTRAINT task_attachments_uploaded_by_fk
            FOREIGN KEY (uploaded_by) 
            REFERENCES public.employee_profiles(employee_code) 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ==========================================================
-- 4. TEAM DISCUSSIONS (for /thao-luan page)
-- ==========================================================

-- Drop ALL existing policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'team_discussions' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_discussions', pol.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.team_discussions ENABLE ROW LEVEL SECURITY;

-- Create policies for BOTH anon and authenticated
CREATE POLICY "Enable all for anon"
ON public.team_discussions
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all for authenticated"
ON public.team_discussions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.team_discussions TO anon;
GRANT ALL ON public.team_discussions TO authenticated;
GRANT ALL ON public.team_discussions TO service_role;

-- Ensure FK exists for sender_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'team_discussions' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%sender_code%'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_discussions' AND column_name = 'sender_code') THEN
            ALTER TABLE public.team_discussions
            ADD CONSTRAINT team_discussions_sender_code_fk
            FOREIGN KEY (sender_code) 
            REFERENCES public.employee_profiles(employee_code) 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ==========================================================
-- 5. SCHEMA CACHE RELOAD
-- ==========================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ COMPLETED: Anon role enabled for task_comments, task_attachments, and team_discussions' as status;
