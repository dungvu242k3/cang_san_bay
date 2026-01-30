-- Migration: Create employee_internal_trainings table
-- Description: Table for internal training records

CREATE TABLE IF NOT EXISTS employee_internal_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    class_code TEXT,
    from_date DATE,
    to_date DATE,
    decision_number TEXT,
    training_place TEXT,
    training_course TEXT,
    result TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_internal_trainings ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_internal_trainings"
ON employee_internal_trainings FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_internal_trainings_employee_code ON employee_internal_trainings(employee_code);
