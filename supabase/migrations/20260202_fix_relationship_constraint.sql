-- Migration to relax and update relationship check constraint for family_members
ALTER TABLE public.family_members DROP CONSTRAINT IF EXISTS family_members_relationship_check;

ALTER TABLE public.family_members ADD CONSTRAINT family_members_relationship_check 
CHECK (relationship IN (
    'Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột', 
    'Anh ruột', 'Em ruột', 'Chị ruột', 
    'Anh vợ', 'Chị vợ', 'Em vợ', 
    'Cha', 'Mẹ', 'Con', 'Anh', 'Chị', 'Em', 'Khác'
));

COMMENT ON COLUMN public.family_members.relationship IS 'Quan hệ (đã mở rộng thêm các giá trị ngắn)';
