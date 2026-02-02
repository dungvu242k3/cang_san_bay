-- Thêm cột profile_images vào bảng employee_profiles để lưu nhiều ảnh lý lịch
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_profiles' 
        AND column_name = 'profile_images'
    ) THEN
        ALTER TABLE public.employee_profiles ADD COLUMN profile_images JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN public.employee_profiles.profile_images IS 'Danh sách ảnh lý lịch cá nhân (JSON array)';
    END IF;
END $$;
