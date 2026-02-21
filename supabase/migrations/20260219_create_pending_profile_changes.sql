-- Create pending_profile_changes table for approval workflow
-- Staff edits profile → saved here → HR approves → applied to main profile

CREATE TABLE IF NOT EXISTS pending_profile_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL,
    employee_name TEXT,
    change_data JSONB NOT NULL DEFAULT '{}',
    change_summary TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_pending_profile_status ON pending_profile_changes(status);
CREATE INDEX IF NOT EXISTS idx_pending_profile_employee ON pending_profile_changes(employee_code);

-- RLS: Allow all authenticated operations (simplified for development)
ALTER TABLE pending_profile_changes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (matching existing pattern)
CREATE POLICY "Allow all operations on pending_profile_changes"
ON pending_profile_changes
FOR ALL
USING (true)
WITH CHECK (true);
