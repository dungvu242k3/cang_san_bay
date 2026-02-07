-- FIX Task Comments/Attachments - COMPREHENSIVE SCRIPT
-- Description: Fixes RLS, Foreign Keys, Columns, and Table Structure in one go.

-- ==========================================================
-- 1. TASK COMMENTS FIXES
-- ==========================================================

-- A. Ensure Table Structure matches Frontend
DO $$
BEGIN
    -- Rename 'content' to 'comment' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'content') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'comment') THEN
        ALTER TABLE public.task_comments RENAME COLUMN content TO comment;
    END IF;

    -- Rename 'employee_code' to 'sender_code' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'employee_code') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'sender_code') THEN
        ALTER TABLE public.task_comments RENAME COLUMN employee_code TO sender_code;
    END IF;

    -- Add 'sender_code' if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'sender_code') THEN
        ALTER TABLE public.task_comments ADD COLUMN sender_code TEXT;
    END IF;

    -- Add 'comment' if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'comment') THEN
        ALTER TABLE public.task_comments ADD COLUMN comment TEXT;
    END IF;
    
    -- Ensure task_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'task_id') THEN
        ALTER TABLE public.task_comments ADD COLUMN task_id UUID NOT NULL;
    END IF;
END $$;

-- B. Reset RLS Policies (Drop ALL existing to avoid conflicts)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'task_comments' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_comments', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- C. Create PERMISSIVE Policies for Authenticated Users
CREATE POLICY "Enable all for authenticated users"
ON public.task_comments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- D. Fix Foreign Keys (Explicitly for PostgREST cache)
DO $$
BEGIN
    -- Drop existing FK if strictly needed/incorrect (optional, but safer to add if missing)
    -- Add sender_code FK
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'task_comments_sender_code_fkey_v2'
        AND table_name = 'task_comments'
    ) THEN
        -- Only add if not already covered by another FK (checking names is tricky, so we use a unique name v2)
        -- Actually, let's just ensure we have A working constraint.
        IF NOT EXISTS (
             SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name = 'task_comments' 
             AND constraint_type = 'FOREIGN KEY'
             AND constraint_name LIKE '%sender_code%'
        ) THEN
            ALTER TABLE public.task_comments
            ADD CONSTRAINT task_comments_sender_code_fkey_v2
            FOREIGN KEY (sender_code) 
            REFERENCES public.employee_profiles(employee_code) 
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Grant Permissions
GRANT ALL ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;


-- ==========================================================
-- 2. TASK ATTACHMENTS FIXES
-- ==========================================================

-- A. Reset RLS Policies
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'task_attachments' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.task_attachments', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- B. Create PERMISSIVE Policies
CREATE POLICY "Enable all for authenticated users"
ON public.task_attachments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- C. Fix Foreign Keys
DO $$
BEGIN
    -- Add uploaded_by FK if missing
    IF NOT EXISTS (
             SELECT 1 FROM information_schema.table_constraints 
             WHERE table_name = 'task_attachments' 
             AND constraint_type = 'FOREIGN KEY'
             AND constraint_name LIKE '%uploaded_by%'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_attachments' AND column_name = 'uploaded_by') THEN
             ALTER TABLE public.task_attachments
             ADD CONSTRAINT task_attachments_uploaded_by_fkey_v2
             FOREIGN KEY (uploaded_by) 
             REFERENCES public.employee_profiles(employee_code) 
             ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Grant Permissions
GRANT ALL ON public.task_attachments TO authenticated;
GRANT ALL ON public.task_attachments TO service_role;

-- ==========================================================
-- 3. SCHEMA CACHE RELOAD
-- ==========================================================
NOTIFY pgrst, 'reload schema';

SELECT '✅ COMPLETED: Task Comments and Attachments RLS/FKs Fixed' as status;
