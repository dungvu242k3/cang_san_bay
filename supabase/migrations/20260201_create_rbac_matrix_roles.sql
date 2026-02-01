-- Migration: Matrix-Based RBAC Hierarchy (5 Levels)

-- 1. Create Role Enum
DO $$ BEGIN
    CREATE TYPE public.rbac_role_level AS ENUM (
        'SUPER_ADMIN',    -- L1
        'BOARD_DIRECTOR', -- L2
        'DEPT_HEAD',      -- L3
        'TEAM_LEADER',    -- L4
        'STAFF'           -- L5
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level public.rbac_role_level NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, -- The name of the department (for L3/L4)
    team_scope TEXT, -- The name of the team (for L4)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Initially, allow all authenticated users to read roles (for frontend checks)
CREATE POLICY "Public read for authenticated users" ON public.user_roles
    FOR SELECT TO authenticated USING (true);

-- Super admin can manage everything (if we have an initial super admin)
CREATE POLICY "Super admin manage all" ON public.user_roles
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE employee_code = (auth.jwt() ->> 'employee_code') 
            AND role_level = 'SUPER_ADMIN'
        )
    );

-- 5. Seed an initial Super Admin (using the 'ADMIN' code if it exists)
INSERT INTO public.user_roles (employee_code, role_level)
SELECT 'ADMIN', 'SUPER_ADMIN'
FROM public.employee_profiles
WHERE employee_code = 'ADMIN'
ON CONFLICT (employee_code) DO UPDATE SET role_level = 'SUPER_ADMIN';

-- 6. Comments
COMMENT ON TABLE public.user_roles IS 'Stores the system access level and organizational scope for each employee.';
