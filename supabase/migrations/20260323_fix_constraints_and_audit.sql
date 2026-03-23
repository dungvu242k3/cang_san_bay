-- Migration to fix family_members constraints and import_audit permissions
-- Description: Update relationship check constraint and add RLS policies for import_audit

-- 1. Update family_members_relationship_check constraint
ALTER TABLE public.family_members DROP CONSTRAINT IF EXISTS family_members_relationship_check;
ALTER TABLE public.family_members ADD CONSTRAINT family_members_relationship_check 
CHECK (relationship IN ('Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột', 'Anh ruột', 'Em ruột', 'Chị ruột', 'Anh vợ', 'Chị vợ', 'Em vợ', 'Bố vợ/chồng', 'Mẹ vợ/chồng', 'Khác'));

-- 2. Add RLS policies for import_audit to fix 401 Unauthorized
-- Enable RLS if not enabled
ALTER TABLE public.import_audit ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert audit logs
DROP POLICY IF EXISTS "Allow authenticated insert to import_audit" ON public.import_audit;
CREATE POLICY "Allow authenticated insert to import_audit" ON public.import_audit
FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users to view their own audit logs (or all if admin - simplified for now)
DROP POLICY IF EXISTS "Allow authenticated select from import_audit" ON public.import_audit;
CREATE POLICY "Allow authenticated select from import_audit" ON public.import_audit
FOR SELECT TO authenticated USING (true);

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload schema';
