-- Migration: Create employee_work_accidents table
-- Description: Table for employee work accidents

CREATE TABLE IF NOT EXISTS employee_work_accidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    accident_date DATE,
    accident_location TEXT,
    leave_reason TEXT,
    accident_type TEXT,
    leave_days INTEGER,
    employee_cost NUMERIC(15,2),
    property_damage NUMERIC(15,2),
    compensation_amount NUMERIC(15,2),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_work_accidents ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_work_accidents"
ON employee_work_accidents FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_work_accidents_employee_code ON employee_work_accidents(employee_code);
