-- Add 'library' module to RBAC matrix
-- This ensures that checkAction('edit', { module: 'library' }) works correctly

INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('SUPER_ADMIN', 'library', true, true, true, 20),
    ('BOARD_DIRECTOR', 'library', true, false, false, 20),
    ('DEPT_HEAD', 'library', true, true, false, 20),
    ('TEAM_LEADER', 'library', true, false, false, 20),
    ('STAFF', 'library', true, false, false, 20)
ON CONFLICT (role_level, permission_key) DO UPDATE 
SET can_view = EXCLUDED.can_view, 
    can_edit = EXCLUDED.can_edit, 
    can_delete = EXCLUDED.can_delete;

SELECT '✅ Library permissions added to RBAC matrix' as status;
