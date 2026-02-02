-- Migration to add note column to family_members for better tracking
ALTER TABLE public.family_members ADD COLUMN IF NOT EXISTS note TEXT;

COMMENT ON COLUMN public.family_members.note IS 'Ghi chú thêm về người thân';
