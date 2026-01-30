-- Migration: Create employee_certificates table
-- Description: Table for employee certificates

CREATE TABLE IF NOT EXISTS employee_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    certificate_name TEXT,
    level TEXT,
    training_place TEXT,
    from_date DATE,
    to_date DATE,
    certificate_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_certificates ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_certificates"
ON employee_certificates FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_certificates_employee_code ON employee_certificates(employee_code);
