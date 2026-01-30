-- Migration: Create employee_work_journals table
-- Description: Table to store employee business trip/work assignment records

CREATE TABLE IF NOT EXISTS employee_work_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    decision_number TEXT,
    from_date DATE,
    to_date DATE,
    work_location TEXT,
    purpose TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_work_journals ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_work_journals"
ON employee_work_journals FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_work_journals_employee_code ON employee_work_journals(employee_code);
