-- Create import_audit table for tracking imports
CREATE TABLE IF NOT EXISTS public.import_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    import_type TEXT NOT NULL, -- 'EMPLOYEES', 'TASKS', etc.
    imported_by TEXT NOT NULL, -- employee_code of person who imported
    total_records INTEGER NOT NULL,
    success_count INTEGER NOT NULL DEFAULT 0,
    fail_count INTEGER NOT NULL DEFAULT 0,
    details JSONB, -- Store error details
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.import_audit IS 'Audit log for data imports';
COMMENT ON COLUMN public.import_audit.import_type IS 'Type of import (EMPLOYEES, TASKS, etc.)';
COMMENT ON COLUMN public.import_audit.imported_by IS 'Employee code of person who performed import';
COMMENT ON COLUMN public.import_audit.details IS 'JSON array of error details';

-- Enable RLS
ALTER TABLE public.import_audit ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Enable read access for authenticated users" ON public.import_audit
    FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert access for authenticated users" ON public.import_audit
    FOR INSERT TO authenticated WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_import_audit_type ON public.import_audit(import_type);
CREATE INDEX idx_import_audit_imported_by ON public.import_audit(imported_by);
CREATE INDEX idx_import_audit_created_at ON public.import_audit(created_at DESC);
