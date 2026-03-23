-- Cập nhật CHECK constraint cho cột relationship trong bảng family_members
-- Thêm: 'Bố vợ/chồng', 'Mẹ vợ/chồng'

-- Bước 1: Xóa constraint cũ
ALTER TABLE public.family_members DROP CONSTRAINT IF EXISTS family_members_relationship_check;

-- Bước 2: Cập nhật dữ liệu cũ không hợp lệ sang giá trị đúng
UPDATE public.family_members SET relationship = 'Cha ruột' WHERE relationship IN ('Bố đẻ', 'Bố ruột', 'Ba ruột');
UPDATE public.family_members SET relationship = 'Mẹ ruột' WHERE relationship IN ('Mẹ đẻ');
UPDATE public.family_members SET relationship = 'Con ruột' WHERE relationship IN ('Con');
UPDATE public.family_members SET relationship = 'Bố vợ/chồng' WHERE relationship IN ('Bố vợ/chồng', 'Bố chồng', 'Bố vợ');
UPDATE public.family_members SET relationship = 'Mẹ vợ/chồng' WHERE relationship IN ('Mẹ vợ/chồng', 'Mẹ chồng', 'Mẹ vợ');
UPDATE public.family_members SET relationship = 'Khác' WHERE relationship NOT IN (
  'Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột',
  'Anh ruột', 'Em ruột', 'Chị ruột',
  'Anh vợ', 'Chị vợ', 'Em vợ',
  'Bố vợ/chồng', 'Mẹ vợ/chồng',
  'Khác'
);

-- Bước 3: Thêm constraint mới
ALTER TABLE public.family_members ADD CONSTRAINT family_members_relationship_check
  CHECK (relationship IN (
    'Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột',
    'Anh ruột', 'Em ruột', 'Chị ruột',
    'Anh vợ', 'Chị vợ', 'Em vợ',
    'Bố vợ/chồng', 'Mẹ vợ/chồng',
    'Khác'
  ));

COMMENT ON COLUMN public.family_members.relationship IS 'Quan hệ: Cha ruột, Mẹ ruột, Vợ, Chồng, Con ruột, Anh ruột, Em ruột, Chị ruột, Anh vợ, Chị vợ, Em vợ, Bố vợ/chồng, Mẹ vợ/chồng, Khác';
