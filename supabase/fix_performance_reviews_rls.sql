-- Fix RLS for performance_reviews table
-- Allow both 'anon' and 'authenticated' roles to perform all actions

-- 1. Ensure RLS is enabled
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.performance_reviews;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON public.performance_reviews;
DROP POLICY IF EXISTS "Allow All" ON public.performance_reviews;

-- 3. Create a universal "Allow All" policy for public access (anon + authenticated)
CREATE POLICY "Allow All" ON public.performance_reviews 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Grant explicit permissions to roles
GRANT ALL ON TABLE public.performance_reviews TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 5. Verify the table has the correct columns (to prevent other errors)
-- Note: This is an idempotent query, it won't change anything if columns exist.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_reviews' AND column_name='self_assessment') THEN
        ALTER TABLE public.performance_reviews ADD COLUMN self_assessment JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_reviews' AND column_name='supervisor_assessment') THEN
        ALTER TABLE public.performance_reviews ADD COLUMN supervisor_assessment JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_reviews' AND column_name='self_comment') THEN
        ALTER TABLE public.performance_reviews ADD COLUMN self_comment TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_reviews' AND column_name='supervisor_comment') THEN
        ALTER TABLE public.performance_reviews ADD COLUMN supervisor_comment TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_reviews' AND column_name='status') THEN
        ALTER TABLE public.performance_reviews ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
END $$;
