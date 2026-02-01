-- Thêm cột attachment_urls vào bảng labor_contracts để lưu nhiều file
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'labor_contracts' 
        AND column_name = 'attachment_urls'
    ) THEN
        ALTER TABLE public.labor_contracts ADD COLUMN attachment_urls JSONB DEFAULT '[]'::jsonb;
        COMMENT ON COLUMN public.labor_contracts.attachment_urls IS 'Danh sách file đính kèm hợp đồng (JSON array)';
    END IF;
END $$;
