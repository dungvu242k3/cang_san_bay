-- ==========================================
-- BCRYPT LOGIN INTEGRATION SCRIPT
-- ==========================================

-- 1. Kích hoạt extension pgcrypto (Yêu cầu quyền Superuser trên Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 2. Hàm Xác thực Đăng nhập (verify_user_password)
-- ==========================================
-- So sánh mật khẩu đầu vào (plain text) với mật khẩu đã lưu trong database
-- Xử lý tương thích:
--   - Nếu mật khẩu trong DB đang là "123456" (plain text cũ), nó sẽ so sánh trực tiếp
--   - Nếu mật khẩu đã được băm (bắt đầu bằng $2a$ hoặc $2b$), nó sẽ dùng hàm crypt để xác thực
CREATE OR REPLACE FUNCTION verify_user_password(p_employee_code TEXT, p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stored_password TEXT;
BEGIN
    -- Lấy mật khẩu đã lưu từ employee_profiles
    SELECT password INTO v_stored_password
    FROM public.employee_profiles
    WHERE employee_code = p_employee_code;

    -- Nếu không tìm thấy user
    IF v_stored_password IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Trường hợp 1: Mật khẩu chưa băm (Đang là plain text "123456")
    IF length(v_stored_password) < 60 THEN
        RETURN v_stored_password = p_password;
    END IF;

    -- Trường hợp 2: Mật khẩu đã được băm bằng bcrypt
    -- Postgres pgcrypto so sánh bằng cách: crypt(plain_text, stored_hash) == stored_hash
    RETURN crypt(p_password, v_stored_password) = v_stored_password;
END;
$$;

-- ==========================================
-- 3. Hàm Thay đổi Mật khẩu (update_user_password)
-- ==========================================
-- Băm mật khẩu mới bằng bcrypt trước khi lưu
CREATE OR REPLACE FUNCTION update_user_password(p_employee_code TEXT, p_new_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Kiểm tra nhân viên tồn tại không
    IF NOT EXISTS (SELECT 1 FROM public.employee_profiles WHERE employee_code = p_employee_code) THEN
        RETURN FALSE;
    END IF;

    -- Cập nhật mật khẩu bằng pgcrypto băm bcrypt (bf = blowfish)
    UPDATE public.employee_profiles
    SET password = crypt(p_new_password, gen_salt('bf'))
    WHERE employee_code = p_employee_code;

    RETURN TRUE;
END;
$$;
