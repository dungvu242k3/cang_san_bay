-- Migration: Seed user_roles based on current_position
-- Description: Automatically assigns RBAC roles based on job titles

DO $$
BEGIN
    -- 1. BOARD_DIRECTOR (Giám đốc, Phó giám đốc)
    INSERT INTO public.user_roles (employee_code, role_level)
    SELECT employee_code, 'BOARD_DIRECTOR'
    FROM public.employee_profiles
    WHERE current_position IN ('Giám đốc', 'Phó giám đốc')
    ON CONFLICT (employee_code) 
    DO UPDATE SET role_level = 'BOARD_DIRECTOR';

    -- 2. DEPT_HEAD (Trưởng phòng, Phó trưởng phòng)
    -- Also sets dept_scope to their department
    INSERT INTO public.user_roles (employee_code, role_level, dept_scope)
    SELECT employee_code, 'DEPT_HEAD', department
    FROM public.employee_profiles
    WHERE current_position IN ('Trưởng phòng', 'Phó trưởng phòng')
    ON CONFLICT (employee_code) 
    DO UPDATE SET role_level = 'DEPT_HEAD', dept_scope = EXCLUDED.dept_scope;

    -- 3. TEAM_LEADER (Đội trưởng, Đội phó, Chủ đội, Tổ trưởng, Tổ phó, Chủ tổ)
    -- Also sets team_scope to their team
    INSERT INTO public.user_roles (employee_code, role_level, team_scope)
    SELECT employee_code, 'TEAM_LEADER', team
    FROM public.employee_profiles
    WHERE current_position IN ('Đội trưởng', 'Đội phó', 'Chủ đội', 'Tổ trưởng', 'Tổ phó', 'Chủ tổ')
    ON CONFLICT (employee_code) 
    DO UPDATE SET role_level = 'TEAM_LEADER', team_scope = EXCLUDED.team_scope;

    -- 4. STAFF (Everyone else who doesn't have a role yet)
    INSERT INTO public.user_roles (employee_code, role_level)
    SELECT employee_code, 'STAFF'
    FROM public.employee_profiles
    WHERE employee_code NOT IN (SELECT employee_code FROM public.user_roles)
    ON CONFLICT (employee_code) DO NOTHING;

END $$;
