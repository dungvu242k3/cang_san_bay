-- Migration: Create employee_health_insurance table
-- Description: Table for employee health insurance cards

CREATE TABLE IF NOT EXISTS employee_health_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL UNIQUE,
    from_date DATE,
    to_date DATE,
    medical_facility TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_health_insurance ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_health_insurance"
ON employee_health_insurance FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_health_insurance_employee_code ON employee_health_insurance(employee_code);
