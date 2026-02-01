-- Thêm cột academic_level_code vào bảng employee_profiles nếu chưa có
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'academic_level_code'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN academic_level_code TEXT;
        COMMENT ON COLUMN public.employee_profiles.academic_level_code IS 'Mã trình độ học vấn (VD: DH, CD, THPT, ...)';
    END IF;
END $$;
