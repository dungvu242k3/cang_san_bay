    -- Fix Schema for Library / Documents Table
    -- This ensures the table has all columns required by the UI

    DO $$ 
    BEGIN
        -- 1. Ensure 'content' exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'content') THEN
            ALTER TABLE public.documents ADD COLUMN content TEXT;
        END IF;

        -- 2. Ensure 'attachments' JSONB exists (for multi-file support)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'attachments') THEN
            ALTER TABLE public.documents ADD COLUMN attachments JSONB DEFAULT '[]';
        END IF;

        -- 3. Ensure 'status' exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'status') THEN
            ALTER TABLE public.documents ADD COLUMN status TEXT DEFAULT 'Published';
        END IF;

        -- 4. Ensure 'document_type' exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'document_type') THEN
            ALTER TABLE public.documents ADD COLUMN document_type TEXT DEFAULT 'Thông báo';
        END IF;

        -- 5. Ensure 'author_code' exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'author_code') THEN
            ALTER TABLE public.documents ADD COLUMN author_code TEXT;
        END IF;

        -- 6. Ensure 'published_at' exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'published_at') THEN
            ALTER TABLE public.documents ADD COLUMN published_at TIMESTAMPTZ;
        END IF;

        -- 7. Ensure 'tags' exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'tags') THEN
            ALTER TABLE public.documents ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;

    END $$;

    -- Update existing records to have empty array if null
    UPDATE public.documents SET attachments = '[]' WHERE attachments IS NULL;
    UPDATE public.documents SET tags = '{}' WHERE tags IS NULL;

    SELECT '✅ Documents table schema updated successfully' as status;
