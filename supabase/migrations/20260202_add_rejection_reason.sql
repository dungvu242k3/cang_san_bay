-- Migration: Add rejection_reason column to tasks table
-- This column stores the reason why a task was rejected

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tasks' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN rejection_reason TEXT;
        COMMENT ON COLUMN public.tasks.rejection_reason IS 'Lý do từ chối/trả lại task';
    END IF;
END $$;
