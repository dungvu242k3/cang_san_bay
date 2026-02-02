-- Migration to restore missing columns after seed reset (V13)
-- This adds back columns that the application expects but were omitted in the simplified seed script.

ALTER TABLE public.employee_profiles
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT DEFAULT 'Kinh',
ADD COLUMN IF NOT EXISTS religion TEXT DEFAULT 'Không',
ADD COLUMN IF NOT EXISTS academic_level_code TEXT,
ADD COLUMN IF NOT EXISTS marital_status_code INTEGER,
ADD COLUMN IF NOT EXISTS training_form TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS temporary_address TEXT,
ADD COLUMN IF NOT EXISTS official_date DATE,
ADD COLUMN IF NOT EXISTS labor_type TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS date_received_job_title DATE,
ADD COLUMN IF NOT EXISTS appointment_date DATE,
ADD COLUMN IF NOT EXISTS concurrent_position TEXT,
ADD COLUMN IF NOT EXISTS concurrent_job_title TEXT,
ADD COLUMN IF NOT EXISTS concurrent_start_date DATE,
ADD COLUMN IF NOT EXISTS concurrent_end_date DATE,
ADD COLUMN IF NOT EXISTS leave_calculation_type TEXT DEFAULT 'Có cộng dồn',
ADD COLUMN IF NOT EXISTS party_card_number TEXT,
ADD COLUMN IF NOT EXISTS party_join_date DATE,
ADD COLUMN IF NOT EXISTS party_official_date DATE,
ADD COLUMN IF NOT EXISTS party_position TEXT,
ADD COLUMN IF NOT EXISTS party_activity_location TEXT,
ADD COLUMN IF NOT EXISTS political_education_level TEXT,
ADD COLUMN IF NOT EXISTS party_notes TEXT,
ADD COLUMN IF NOT EXISTS youth_union_card_number TEXT,
ADD COLUMN IF NOT EXISTS youth_union_join_date DATE,
ADD COLUMN IF NOT EXISTS youth_union_join_location TEXT,
ADD COLUMN IF NOT EXISTS youth_union_position TEXT,
ADD COLUMN IF NOT EXISTS youth_union_activity_location TEXT,
ADD COLUMN IF NOT EXISTS youth_union_notes TEXT,
ADD COLUMN IF NOT EXISTS trade_union_card_number TEXT,
ADD COLUMN IF NOT EXISTS trade_union_join_date DATE,
ADD COLUMN IF NOT EXISTS trade_union_position TEXT,
ADD COLUMN IF NOT EXISTS trade_union_activity_location TEXT,
ADD COLUMN IF NOT EXISTS trade_union_notes TEXT,
-- Legal info
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

-- Add score_template_code if missing (already in seed, but just in case)
ALTER TABLE public.employee_profiles ADD COLUMN IF NOT EXISTS score_template_code TEXT DEFAULT 'NVTT';

-- Success message
COMMENT ON TABLE public.employee_profiles IS 'Hồ sơ nhân viên (Đã khôi phục đầy đủ các cột sau reset V13)';
