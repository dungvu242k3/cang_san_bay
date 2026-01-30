-- Migration: Create employee_training_specializations table
-- Description: Table for training specializations/majors

CREATE TABLE IF NOT EXISTS employee_training_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    specialization TEXT,
    from_date DATE,
    to_date DATE,
    training_place TEXT,
    education_level TEXT,
    training_type TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_training_specializations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_training_specializations"
ON employee_training_specializations FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_training_specializations_employee_code ON employee_training_specializations(employee_code);
