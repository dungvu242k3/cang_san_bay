-- Migration: Create employee_health_checkups table
-- Description: Table for employee health checkups

CREATE TABLE IF NOT EXISTS employee_health_checkups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    checkup_date DATE,
    expiry_date DATE,
    checkup_location TEXT,
    cost NUMERIC(15,2),
    result TEXT,
    attachment_url TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_health_checkups ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_health_checkups"
ON employee_health_checkups FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_health_checkups_employee_code ON employee_health_checkups(employee_code);
