-- Fix RLS for Library / Documents Table (and Acknowledgments)
-- This ensures everyone (including 'anon' users) can read, update, insert, and delete.
-- Reason: The application uses a custom AuthContext without Supabase JWTs, so requests run as 'anon' role.

DO $$ 
BEGIN
    ---------- DOCUMENTS TABLE ----------
    ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

    -- Drop existing restrictive policies
    DROP POLICY IF EXISTS "Users can view published documents" ON public.documents;
    DROP POLICY IF EXISTS "Authors can view their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Super admin can view all documents" ON public.documents;
    DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
    DROP POLICY IF EXISTS "Authors can update their documents" ON public.documents;
    DROP POLICY IF EXISTS "Super admin can manage all documents" ON public.documents;
    DROP POLICY IF EXISTS "Authors can delete their documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow authenticated to update documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow authenticated to delete documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow All" ON public.documents;

    ---------- ACKNOWLEDGMENTS TABLE ----------
    ALTER TABLE public.document_acknowledgments ENABLE ROW LEVEL SECURITY;

    -- Drop existing restrictive policies
    DROP POLICY IF EXISTS "Users can view their own acks" ON public.document_acknowledgments;
    DROP POLICY IF EXISTS "Users can create their own acks" ON public.document_acknowledgments;
    DROP POLICY IF EXISTS "Authors and admins can view all acks" ON public.document_acknowledgments;
    DROP POLICY IF EXISTS "Allow All" ON public.document_acknowledgments;
END $$;

---------- NEW UNIVERSAL POLICIES ----------
-- 1. Create a universal "Allow All" policy for documents (anon + authenticated)
CREATE POLICY "Allow All" ON public.documents 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Create a universal "Allow All" policy for document_acknowledgments (anon + authenticated)
CREATE POLICY "Allow All" ON public.document_acknowledgments 
FOR ALL 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Grant explicit permissions to roles
GRANT ALL ON TABLE public.documents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.document_acknowledgments TO anon, authenticated, service_role;

SELECT '✅ Documents and Acknowledgments tables RLS updated successfully' as status;
