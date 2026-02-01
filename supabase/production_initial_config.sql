-- ==========================================================
-- PRODUCTION INITIAL CONFIG - CẢNG HÀNG KHÔNG
-- Version: 1.0.0
-- Description: Cấu hình mặc định cho hệ thống (RBAC & Admin)
-- ==========================================================

-- 1. THIẾT LẬP MA TRẬN QUYỀN HẠN (Mặc định)
-- Cấp cao nhất: SUPER_ADMIN (Toàn quyền)
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('SUPER_ADMIN', 'dashboard', true, true, true, 1),
    ('SUPER_ADMIN', 'tasks', true, true, true, 2),
    ('SUPER_ADMIN', 'calendar', true, true, true, 3),
    ('SUPER_ADMIN', 'grading', true, true, true, 4),
    ('SUPER_ADMIN', 'leaves', true, true, true, 5),
    ('SUPER_ADMIN', 'profiles', true, true, true, 6),
    ('SUPER_ADMIN', 'organization', true, true, true, 7),
    ('SUPER_ADMIN', 'settings', true, true, true, 8)
ON CONFLICT (role_level, permission_key) DO UPDATE 
SET can_view = EXCLUDED.can_view, can_edit = EXCLUDED.can_edit, can_delete = EXCLUDED.can_delete;

-- Vai trò Lãnh đạo: BOARD_DIRECTOR
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('BOARD_DIRECTOR', 'dashboard', true, false, false, 1),
    ('BOARD_DIRECTOR', 'tasks', true, false, false, 2),
    ('BOARD_DIRECTOR', 'profiles', true, false, false, 3),
    ('BOARD_DIRECTOR', 'organization', true, false, false, 4)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true;

-- Vai trò Quản lý: DEPT_HEAD
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('DEPT_HEAD', 'tasks', true, true, false, 1),
    ('DEPT_HEAD', 'grading', true, true, false, 2),
    ('DEPT_HEAD', 'profiles', true, true, false, 3)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true, can_edit = true;

-- Vai trò Nhân viên: STAFF
INSERT INTO public.rbac_matrix (role_level, permission_key, can_view, can_edit, can_delete, sort_order)
VALUES 
    ('STAFF', 'tasks', true, false, false, 1),
    ('STAFF', 'calendar', true, false, false, 2),
    ('STAFF', 'profiles', true, false, false, 3)
ON CONFLICT (role_level, permission_key) DO UPDATE SET can_view = true;

-- 2. TẠO TÀI KHOẢN QUẢN TRỊ VIÊN ĐẦU TIÊN (ADMIN)
-- Lưu ý: Thực tế nên thay đổi email và mã nhân viên này
INSERT INTO public.employee_profiles (employee_code, last_name, first_name, department, current_position, email_acv, avatar_url)
VALUES ('ADMIN', 'Quản trị', 'Hệ Thống', 'Văn phòng', 'Quản trị viên', 'admin@cangsanbay.vn', 'https://i.pravatar.cc/150?u=admin')
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO public.user_roles (employee_code, role_level)
VALUES ('ADMIN', 'SUPER_ADMIN')
ON CONFLICT (employee_code) DO NOTHING;

-- 3. THÔNG BÁO HOÀN TẤT
SELECT 'CẤU HÌNH PRODUCTION ĐÃ SẴN SÀNG!' as status;
