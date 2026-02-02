-- Thêm cột password vào bảng employee_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'employee_profiles'
        AND column_name = 'password'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN password TEXT;
        COMMENT ON COLUMN public.employee_profiles.password IS 'Mật khẩu đăng nhập (hashed)';
        
        -- Tạo index cho tìm kiếm nhanh
        CREATE INDEX IF NOT EXISTS idx_employee_profiles_password ON public.employee_profiles(password) WHERE password IS NOT NULL;
    END IF;
END $$;

-- Cập nhật password mặc định cho Admin (nếu chưa có)
-- Lưu ý: Password này là plain text, sẽ được hash khi đăng nhập
-- Trong production nên hash trước khi lưu
UPDATE public.employee_profiles 
SET password = '123456' 
WHERE employee_code = 'ADMIN' AND (password IS NULL OR password = '');
