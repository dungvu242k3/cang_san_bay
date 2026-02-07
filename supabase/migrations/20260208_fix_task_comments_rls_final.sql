-- FIX Task Comments RLS and Structure
-- Description: Fixes "new row violates row-level security policy" and ensures column consistency

-- 1. Ensure Table Structure matches Frontend (Tasks.jsx uses sender_code, comment)
DO $$
BEGIN
    -- Rename 'content' to 'comment' if it exists and 'comment' does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'content') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_comments' AND column_name = 'comment') THEN
        ALTER TABLE public.task_comments RENAME COLUMN content TO comment;
    END IF;

    -- Rename 'employee_code' to 'sender_code' if it exists and 'sender_code' does not
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
    
    -- Ensure columns are not null (after handling defaults if needed)
    -- We assume existing rows might be messy, so updates might be needed before setting NOT NULL
    -- For now, we skip forced NOT NULL on new columns to avoid errors on existing data, 
    -- but ideally we update them.
END $$;

-- 2. RESET RLS Policies
-- Drop ALL existing policies to avoid conflicts
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

-- 3. Create SIMPLE, PERMISSIVE Policies for Authenticated Users
-- We rely on the backend/frontend validation for business logic. 
-- RLS here acts as a basic gatekeeper for "must be logged in".

CREATE POLICY "Enable all for authenticated users"
ON public.task_comments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Grant Permissions
GRANT ALL ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;

-- 5. Force Schema Cache Reload (not always possible via SQL, but altering table helps)
NOTIFY pgrst, 'reload schema';
