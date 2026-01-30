-- Migration: Create employee_disciplines table
-- Description: Table for employee disciplinary actions

CREATE TABLE IF NOT EXISTS employee_disciplines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    decision_number TEXT,
    signed_date DATE,
    discipline_type TEXT,
    from_date DATE,
    to_date DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_disciplines ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_disciplines"
ON employee_disciplines FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_disciplines_employee_code ON employee_disciplines(employee_code);
