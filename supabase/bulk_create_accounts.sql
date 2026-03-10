-- ==========================================================
-- SCRIPT: TẠO TÀI KHOẢN HÀNG LOẠT CHO NHÂN VIÊN CHƯA CÓ
-- ==========================================================

-- Lưu ý quan trọng: 
-- Trong mã React (UserManagement.jsx), mật khẩu được băm bằng SHA-256 thuần túy:
-- Hash của '123456' bằng SHA-256 là: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
--
-- Tuy nhiên, nếu hệ thống đăng nhập của bạn (verify_user_password) 
-- đang dùng BCRYPT (crypt) qua pgcrypto như trong `new_supabase_setup.sql`, 
-- thì bạn ĐỪNG gán hash thuần túy trên UI nữa.
--
-- Ở đây, để an toàn và nhất quán, script này sẽ tạo mật khẩu 
-- mặc định là chuỗi '123456' (dưới dạng plain text) cho NHỮNG NGƯỜI CHƯA CÓ.
-- (Bởi vì hàm verify_user_password của chúng ta ĐÃ CÓ logic xử lý độ dài < 60 ký tự 
-- như một mật khẩu mặc định chưa đổi để ép người dùng đổi khi đăng nhập).

DO $$
DECLARE
    v_count INT;
BEGIN
    -- Đếm số lượng tài khoản sắp được tạo
    SELECT count(*) INTO v_count
    FROM public.employee_profiles
    WHERE password IS NULL;

    -- Update mật khẩu mặc định
    UPDATE public.employee_profiles
    SET password = '123456'
    WHERE password IS NULL;

    -- Hiển thị thông báo
    RAISE NOTICE '✅ Đã tạo tài khoản (cấp password mặc định 123456) cho % nhân viên.', v_count;
END $$;

-- Xem lại kết quả
SELECT 
    employee_code as "Mã NV", 
    last_name || ' ' || first_name as "Họ Tên",
    department as "Phòng Ban",
    current_position as "Chức Vụ",
    CASE WHEN password IS NOT NULL THEN '✅ Đã cấp' ELSE '❌ Lỗi' END as "Trạng Thái Tài Khoản"
FROM public.employee_profiles
ORDER BY department, employee_code;
