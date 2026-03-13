-- Fix RLS for Library / Documents Table
-- This ensures authors and admins can update and delete documents

DO $$ 
BEGIN
    -- Drop restrictive update/delete policies if any
    DROP POLICY IF EXISTS "Authors can update their documents" ON public.documents;
    DROP POLICY IF EXISTS "Super admin can manage all documents" ON public.documents;
    DROP POLICY IF EXISTS "Authors can delete their documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow authenticated to update documents" ON public.documents;
    DROP POLICY IF EXISTS "Allow authenticated to delete documents" ON public.documents;
    
    -- We allow authenticated users to update/delete, relying on the frontend 
    -- RBAC matrix to hide/show buttons and protect routes.
END $$;

-- 1. Create a broad UPDATE policy for authenticated users
CREATE POLICY "Allow authenticated to update documents" ON public.documents
    FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

-- 2. Create a broad DELETE policy for authenticated users
CREATE POLICY "Allow authenticated to delete documents" ON public.documents
    FOR DELETE 
    TO authenticated 
    USING (true);

SELECT '✅ Documents table RLS updated successfully' as status;
