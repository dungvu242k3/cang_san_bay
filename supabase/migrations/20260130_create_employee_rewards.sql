-- Migration: Create employee_rewards table
-- Description: Table for employee rewards/commendations

CREATE TABLE IF NOT EXISTS employee_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL,
    decision_number TEXT,
    reward_type TEXT,
    reward_content TEXT,
    signed_date DATE,
    amount NUMERIC(15,2),
    reward_date DATE,
    applied_year INTEGER,
    attachment_url TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE employee_rewards ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow public access to employee_rewards"
ON employee_rewards FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_rewards_employee_code ON employee_rewards(employee_code);
