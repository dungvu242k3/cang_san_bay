-- Create table for Family Members / Dependents (Thân nhân)
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- Mã nhân viên (FK to employee_profiles)
    last_name TEXT NOT NULL, -- Họ
    first_name TEXT NOT NULL, -- Tên
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')), -- Giới tính
    date_of_birth DATE, -- Ngày sinh
    relationship TEXT CHECK (relationship IN (
        'Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột', 
        'Anh ruột', 'Em ruột', 'Chị ruột', 
        'Anh vợ', 'Chị vợ', 'Em vợ', 'Khác'
    )), -- Quan hệ
    is_dependent BOOLEAN DEFAULT false, -- Giảm trừ phụ thuộc (checkbox)
    dependent_from_month DATE, -- Từ tháng (chỉ hiển thị nếu is_dependent = true)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

-- Add comments for better documentation
COMMENT ON TABLE public.family_members IS 'Thông tin thân nhân của nhân viên';
COMMENT ON COLUMN public.family_members.employee_code IS 'Mã nhân viên';
COMMENT ON COLUMN public.family_members.last_name IS 'Họ';
COMMENT ON COLUMN public.family_members.first_name IS 'Tên';
COMMENT ON COLUMN public.family_members.gender IS 'Giới tính';
COMMENT ON COLUMN public.family_members.date_of_birth IS 'Ngày sinh';
COMMENT ON COLUMN public.family_members.relationship IS 'Quan hệ: Cha ruột, Mẹ ruột, Vợ, Chồng, Con ruột, Anh ruột, Em ruột, Chị ruột, Anh vợ, Chị vợ, Em vợ, Khác';
COMMENT ON COLUMN public.family_members.is_dependent IS 'Có phải người phụ thuộc giảm trừ thuế hay không';
COMMENT ON COLUMN public.family_members.dependent_from_month IS 'Từ tháng nào được tính là người phụ thuộc';

-- Create index for faster lookups
CREATE INDEX idx_family_members_employee_code ON public.family_members(employee_code);

-- Enable Row Level Security (RLS)
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all family members
CREATE POLICY "Enable read access for authenticated users" ON public.family_members
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert/update/delete
CREATE POLICY "Enable write access for authenticated users" ON public.family_members
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
