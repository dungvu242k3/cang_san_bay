-- Migration: Create employee_leaves table
-- Description: Table to store employee leave/vacation records

CREATE TABLE IF NOT EXISTS employee_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    leave_type TEXT,
    reason TEXT,
    from_date DATE,
    to_date DATE,
    leave_days NUMERIC(5,1),
    total_deducted NUMERIC(5,1),
    remaining_leave NUMERIC(5,1),
    status TEXT DEFAULT 'Chờ duyệt',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_leaves ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_leaves"
ON employee_leaves FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_leaves_employee_code ON employee_leaves(employee_code);
