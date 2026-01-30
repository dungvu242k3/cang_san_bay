-- Migration: Create employee_appointments table
-- Description: Table to store employee appointments and transfers

CREATE TABLE IF NOT EXISTS employee_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    decision_number TEXT,
    applied_date DATE,
    job_title TEXT,
    position TEXT,
    department TEXT,
    workplace TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_appointments ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_appointments"
ON employee_appointments FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_appointments_employee_code ON employee_appointments(employee_code);
