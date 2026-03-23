-- Migration to expand family_members and employee_profiles data
-- Description: Add missing columns for family members and number of children for employees

-- 1. Add columns to family_members if they don't exist
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS current_residence TEXT;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS identity_card_number TEXT;

COMMENT ON COLUMN public.family_members.occupation IS 'Nghề nghiệp của người thân';
COMMENT ON COLUMN public.family_members.current_residence IS 'Nơi ở hiện nay của người thân';
COMMENT ON COLUMN public.family_members.phone IS 'Số điện thoại của người thân';
COMMENT ON COLUMN public.family_members.identity_card_number IS 'Số CCCD/Định danh của người thân';

-- 2. Add column to employee_profiles if it doesn't exist
ALTER TABLE public.employee_profiles ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0;

COMMENT ON COLUMN public.employee_profiles.number_of_children IS 'Số lượng con đẻ của nhân viên';

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload schema';
