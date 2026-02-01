-- Migration: Dynamic RBAC Matrix (Zero Hardcoding)

-- 1. Create Role Level Enum (If not exists)
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

-- 2. Create User Roles table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    role_level public.rbac_role_level NOT NULL DEFAULT 'STAFF',
    dept_scope TEXT, 
    team_scope TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Dynamic Permission Matrix table
CREATE TABLE IF NOT EXISTS public.rbac_matrix (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_level public.rbac_role_level NOT NULL,
    permission_key TEXT NOT NULL, -- e.g., 'dashboard', 'grading'
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_level, permission_key)
);

-- 4. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_matrix ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Public read for roles/matrix to check permissions on front-end
CREATE POLICY "Public read for authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public read matrix for authenticated" ON public.rbac_matrix FOR SELECT TO authenticated USING (true);

-- Super Admin management
CREATE POLICY "Super admin manage matrix" ON public.rbac_matrix FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE employee_code = (auth.jwt() ->> 'employee_code') AND role_level = 'SUPER_ADMIN'));

-- 6. Seed Default Matrix (Initial Setup)
-- SUPER_ADMIN (Full Access)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true),
    ('SUPER_ADMIN', 'tasks', true, true, true),
    ('SUPER_ADMIN', 'calendar', true, true, true),
    ('SUPER_ADMIN', 'grading', true, true, true),
    ('SUPER_ADMIN', 'leaves', true, true, true),
    ('SUPER_ADMIN', 'profiles', true, true, true),
    ('SUPER_ADMIN', 'organization', true, true, true),
    ('SUPER_ADMIN', 'settings', true, true, true)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true, can_edit = true, can_delete = true;

-- BOARD_DIRECTOR (Global View)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('BOARD_DIRECTOR', 'dashboard', true, false, false),
    ('BOARD_DIRECTOR', 'tasks', true, false, false),
    ('BOARD_DIRECTOR', 'profiles', true, false, false),
    ('BOARD_DIRECTOR', 'grading', true, false, false),
    ('BOARD_DIRECTOR', 'settings', true, false, false)
ON CONFLICT (role_level, permission_key) DO NOTHING;

-- DEPT_HEAD (Dept Scope)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete)
VALUES 
    ('DEPT_HEAD', 'profiles', true, true, false),
    ('DEPT_HEAD', 'grading', true, true, false),
    ('DEPT_HEAD', 'leaves', true, true, false)
ON CONFLICT (role_level, permission_key) DO NOTHING;

-- 7. Seed Initial Admin
INSERT INTO public.user_roles (employee_code, role_level)
SELECT 'ADMIN', 'SUPER_ADMIN'
FROM public.employee_profiles
WHERE employee_code = 'ADMIN'
ON CONFLICT (employee_code) DO UPDATE SET role_level = 'SUPER_ADMIN';

-- Comments
COMMENT ON TABLE public.rbac_matrix IS 'The master permission matrix configured by administrators.';
