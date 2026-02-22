-- Migration: Add approval tracking columns to employee_leaves
-- Description: Track who approved/rejected leave requests and when

DO $$
BEGIN
    -- approved_by: Mã nhân viên người duyệt
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'employee_leaves'
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE public.employee_leaves ADD COLUMN approved_by TEXT;
    END IF;

    -- approved_at: Thời gian duyệt
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'employee_leaves'
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE public.employee_leaves ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
END $$;

COMMENT ON COLUMN public.employee_leaves.approved_by IS 'Mã nhân viên người duyệt/từ chối đơn';
COMMENT ON COLUMN public.employee_leaves.approved_at IS 'Thời gian duyệt/từ chối đơn';

-- Index for faster lookup by approver
CREATE INDEX IF NOT EXISTS idx_employee_leaves_approved_by ON public.employee_leaves(approved_by);
