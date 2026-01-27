-- Create table for Employee Profiles (Lý lịch cá nhân)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL, -- Mã nhân viên
    card_number TEXT, -- Số thẻ
    avatar_url TEXT, -- Avatar
    last_name TEXT NOT NULL, -- Họ
    first_name TEXT NOT NULL, -- Tên
    gender TEXT CHECK (gender IN ('Nam', 'Nữ', 'Khác')), -- Giới tính
    date_of_birth DATE, -- Ngày sinh
    nationality TEXT, -- Quốc tịch
    place_of_birth TEXT, -- Nơi sinh
    ethnicity TEXT, -- Dân tộc
    religion TEXT, -- Tôn giáo
    education_level TEXT CHECK (education_level IN ('10/12', '11/12', '12/12', '8/10', '9/10', '10/10', 'Khác')), -- Trình độ văn hoá
    training_form TEXT CHECK (training_form IN ('Phổ Thông', 'Bổ túc', 'Khác')), -- Hình thức đào tạo
    marital_status_code INTEGER CHECK (marital_status_code IN (1, 2, 3, 4)), -- Tình trạng hôn nhân (1: Độc thân, 2: Kết hôn, 3: Ly hôn, 4: Khác)
    academic_level_code TEXT CHECK (academic_level_code IN ('DH', 'CD', 'TS', 'TC', '12', 'Khác')), -- Trình độ học vấn
    
    -- 1.2 Thông tin liên hệ (Contact Info)
    permanent_address TEXT, -- Địa chỉ thường trú
    temporary_address TEXT, -- Nơi đăng ký tạm trú
    hometown TEXT, -- Quê quán
    phone TEXT, -- Điện thoại
    email_acv TEXT, -- Email ACV
    email_personal TEXT, -- Email cá nhân
    relative_phone TEXT, -- Số điện thoại người thân
    relative_relation TEXT CHECK (relative_relation IN ('Vợ-chồng', 'Bố-Mẹ', 'Anh-em', 'Con-Cháu', 'Khác')), -- Quan hệ
    
    -- 1.3 Thông tin công việc (Work Info)
    decision_number TEXT, -- Số QĐ
    join_date DATE, -- Ngày vào làm
    official_date DATE, -- Ngày thành NVCT
    job_position TEXT, -- Vị trí công việc
    department TEXT, -- Phòng
    team TEXT, -- Đội
    group_name TEXT, -- Tổ
    employee_type TEXT CHECK (employee_type IN ('MB NVCT', 'NVGT', 'NVTV', 'NVTT', 'CBQL')), -- Loại nhân viên
    labor_type TEXT, -- Loại lao động
    job_title TEXT, -- Chức danh công việc
    date_received_job_title DATE, -- Ngày nhận chức danh
    current_position TEXT CHECK (current_position IN ('Giám đốc', 'Phó giám đốc', 'Trưởng phòng', 'Phó trưởng phòng', 'Đội trưởng', 'Đội phó', 'Chủ đội', 'Tổ trưởng', 'Tổ phó', 'Chủ tổ', 'Khác')), -- Chức vụ hiện tại
    appointment_date DATE, -- Ngày bổ nhiệm
    concurrent_position TEXT, -- Chức vụ kiêm nhiệm
    concurrent_job_title TEXT, -- Chức danh kiêm nhiệm
    concurrent_start_date DATE, -- Thời gian kiêm nhiệm từ ngày
    concurrent_end_date DATE, -- Thời gian kiêm nhiệm đến ngày
    leave_calculation_type TEXT CHECK (leave_calculation_type IN ('Có cộng dồn', 'Không cộng dồn')), -- Đối tượng tính phép
    
    -- 1.5 Hồ sơ Đảng (Party Records)
    is_party_member BOOLEAN DEFAULT false, -- Là Đảng viên (checkbox)
    party_card_number TEXT, -- Số thẻ Đảng viên
    party_join_date DATE, -- Ngày kết nạp
    party_official_date DATE, -- Ngày chính thức
    party_position TEXT, -- Chức vụ Đảng
    party_activity_location TEXT, -- Nơi sinh hoạt
    political_education_level TEXT, -- Trình độ chính trị
    party_notes TEXT, -- Ghi chú
    
    -- 1.6 Đoàn thanh niên (Youth Union)
    is_youth_union_member BOOLEAN DEFAULT false, -- Là Đoàn thanh niên (checkbox)
    youth_union_card_number TEXT, -- Thẻ Đoàn viên
    youth_union_join_date DATE, -- Ngày vào Đoàn
    youth_union_join_location TEXT, -- Nơi vào Đoàn
    youth_union_position TEXT, -- Chức vụ Đoàn
    youth_union_activity_location TEXT, -- Nơi sinh hoạt Đoàn
    youth_union_notes TEXT, -- Ghi chú
    
    -- 1.7 Công Đoàn (Trade Union)
    is_trade_union_member BOOLEAN DEFAULT false, -- Là Công đoàn (checkbox)
    trade_union_card_number TEXT, -- Thẻ Công Đoàn
    trade_union_join_date DATE, -- Ngày vào Công đoàn
    trade_union_position TEXT, -- Chức vụ Công đoàn
    trade_union_activity_location TEXT, -- Nơi sinh hoạt Công đoàn
    trade_union_notes TEXT, -- Ghi chú
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for better documentation in Supabase UI
COMMENT ON COLUMN public.employee_profiles.employee_code IS 'Mã nhân viên';
COMMENT ON COLUMN public.employee_profiles.card_number IS 'Số thẻ';
COMMENT ON COLUMN public.employee_profiles.education_level IS 'Trình độ văn hoá: 10/12, 12/12...';
COMMENT ON COLUMN public.employee_profiles.marital_status_code IS '1: Độc thân, 2: Đã kết hôn, 3: Đã ly hôn, 4: Khác';
COMMENT ON COLUMN public.employee_profiles.academic_level_code IS 'DH: Đại học, CD: Cao đẳng, TS: Thạc sĩ, TC: Trung cấp, 12: Lớp 12';
COMMENT ON COLUMN public.employee_profiles.permanent_address IS 'Địa chỉ thường trú';
COMMENT ON COLUMN public.employee_profiles.temporary_address IS 'Nơi đăng ký tạm trú';
COMMENT ON COLUMN public.employee_profiles.hometown IS 'Quê quán';
COMMENT ON COLUMN public.employee_profiles.phone IS 'Điện thoại';
COMMENT ON COLUMN public.employee_profiles.email_acv IS 'Email công ty ACV';
COMMENT ON COLUMN public.employee_profiles.email_personal IS 'Email cá nhân';
COMMENT ON COLUMN public.employee_profiles.relative_phone IS 'Số điện thoại người thân';
COMMENT ON COLUMN public.employee_profiles.relative_relation IS 'Quan hệ: Vợ-chồng, Bố-Mẹ, Anh-em, Con-Cháu, Khác';
COMMENT ON COLUMN public.employee_profiles.decision_number IS 'Số QĐ';
COMMENT ON COLUMN public.employee_profiles.join_date IS 'Ngày vào làm';
COMMENT ON COLUMN public.employee_profiles.official_date IS 'Ngày thành NVCT';
COMMENT ON COLUMN public.employee_profiles.job_title IS 'Chức danh công việc';
COMMENT ON COLUMN public.employee_profiles.date_received_job_title IS 'Ngày nhận chức danh';
COMMENT ON COLUMN public.employee_profiles.employee_type IS 'MB NVCT: Nhân viên chính thức, NVGT: Gián tiếp, NVTV: Thời vụ, NVTT: Trực tiếp, CBQL: Cán bộ quản lý';
COMMENT ON COLUMN public.employee_profiles.current_position IS 'Chức vụ hiện tại';
COMMENT ON COLUMN public.employee_profiles.appointment_date IS 'Ngày bổ nhiệm';
COMMENT ON COLUMN public.employee_profiles.concurrent_job_title IS 'Chức danh kiêm nhiệm';
COMMENT ON COLUMN public.employee_profiles.leave_calculation_type IS 'Đối tượng tính phép: Có cộng dồn hoặc Không cộng dồn';
COMMENT ON COLUMN public.employee_profiles.is_party_member IS 'Là Đảng viên hay không';
COMMENT ON COLUMN public.employee_profiles.party_card_number IS 'Số thẻ Đảng viên';
COMMENT ON COLUMN public.employee_profiles.party_join_date IS 'Ngày kết nạp Đảng';
COMMENT ON COLUMN public.employee_profiles.party_official_date IS 'Ngày chính thức là Đảng viên';
COMMENT ON COLUMN public.employee_profiles.party_position IS 'Chức vụ trong Đảng';
COMMENT ON COLUMN public.employee_profiles.party_activity_location IS 'Nơi sinh hoạt Đảng';
COMMENT ON COLUMN public.employee_profiles.political_education_level IS 'Trình độ chính trị';
COMMENT ON COLUMN public.employee_profiles.party_notes IS 'Ghi chú về hồ sơ Đảng';
COMMENT ON COLUMN public.employee_profiles.is_youth_union_member IS 'Là Đoàn viên thanh niên hay không';
COMMENT ON COLUMN public.employee_profiles.youth_union_card_number IS 'Thẻ Đoàn viên';
COMMENT ON COLUMN public.employee_profiles.youth_union_join_date IS 'Ngày vào Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_join_location IS 'Nơi vào Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_position IS 'Chức vụ trong Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_activity_location IS 'Nơi sinh hoạt Đoàn';
COMMENT ON COLUMN public.employee_profiles.youth_union_notes IS 'Ghi chú về Đoàn thanh niên';
COMMENT ON COLUMN public.employee_profiles.is_trade_union_member IS 'Là Công đoàn viên hay không';
COMMENT ON COLUMN public.employee_profiles.trade_union_card_number IS 'Thẻ Công Đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_join_date IS 'Ngày vào Công đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_position IS 'Chức vụ trong Công đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_activity_location IS 'Nơi sinh hoạt Công đoàn';
COMMENT ON COLUMN public.employee_profiles.trade_union_notes IS 'Ghi chú về Công đoàn';

-- Enable Row Level Security (RLS)
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view all profiles (Adjust specific rules as needed)
CREATE POLICY "Enable read access for authenticated users" ON public.employee_profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert/update (Adjust specific rules as needed)
CREATE POLICY "Enable write access for authenticated users" ON public.employee_profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
