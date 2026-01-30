-- Add Legal Info columns to employee_profiles

ALTER TABLE public.employee_profiles
ADD COLUMN IF NOT EXISTS identity_card_number TEXT,
ADD COLUMN IF NOT EXISTS identity_card_issue_date DATE,
ADD COLUMN IF NOT EXISTS identity_card_issue_place TEXT,
ADD COLUMN IF NOT EXISTS tax_code TEXT,
ADD COLUMN IF NOT EXISTS health_insurance_number TEXT,
ADD COLUMN IF NOT EXISTS health_insurance_issue_date DATE,
ADD COLUMN IF NOT EXISTS health_insurance_place TEXT,
ADD COLUMN IF NOT EXISTS social_insurance_number TEXT,
ADD COLUMN IF NOT EXISTS social_insurance_issue_date DATE,
ADD COLUMN IF NOT EXISTS unemployment_insurance_number TEXT,
ADD COLUMN IF NOT EXISTS unemployment_insurance_issue_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN public.employee_profiles.identity_card_number IS 'Số Thẻ CCCD / CMND';
COMMENT ON COLUMN public.employee_profiles.identity_card_issue_date IS 'Ngày cấp CCCD';
COMMENT ON COLUMN public.employee_profiles.identity_card_issue_place IS 'Nơi cấp CCCD';
COMMENT ON COLUMN public.employee_profiles.tax_code IS 'Mã số thuế';
COMMENT ON COLUMN public.employee_profiles.health_insurance_number IS 'Số Bảo hiểm y tế';
COMMENT ON COLUMN public.employee_profiles.health_insurance_issue_date IS 'Ngày cấp BHYT';
COMMENT ON COLUMN public.employee_profiles.health_insurance_place IS 'Nơi KCB ban đầu';
COMMENT ON COLUMN public.employee_profiles.social_insurance_number IS 'Số Bảo hiểm xã hội';
COMMENT ON COLUMN public.employee_profiles.social_insurance_issue_date IS 'Ngày cấp BHXH';
COMMENT ON COLUMN public.employee_profiles.unemployment_insurance_number IS 'Số Bảo hiểm thất nghiệp';
COMMENT ON COLUMN public.employee_profiles.unemployment_insurance_issue_date IS 'Ngày cấp BHTN';
