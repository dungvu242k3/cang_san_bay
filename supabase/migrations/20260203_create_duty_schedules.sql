-- Migration: Create Duty Schedules Module
-- Description: Tables for Lịch trực (Duty Schedule)
-- Date: 2026-02-03

-- 1. Duty Schedules Table
CREATE TABLE IF NOT EXISTS public.duty_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    duty_date DATE NOT NULL, -- Ngày trực
    day_of_week TEXT, -- Thứ trong tuần (Thứ 2, Thứ 3, ...)
    
    -- Trực Giám đốc
    director_on_duty TEXT, -- employee_code hoặc tên
    
    -- Trực Ban Cảng
    port_duty_officer TEXT, -- employee_code hoặc tên
    
    -- Trực Phòng
    office_duty TEXT, -- Văn phòng - employee_code hoặc tên
    finance_planning_duty TEXT, -- PHÒNG TC-KH - employee_code hoặc tên
    operations_duty TEXT, -- PHÒNG PVMD - employee_code hoặc tên
    technical_duty TEXT, -- P. KTHT - employee_code hoặc tên
    atc_duty TEXT, -- PHÒNG ĐHSB - employee_code hoặc tên
    
    -- Metadata
    created_by TEXT NOT NULL, -- employee_code
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one schedule per date
    UNIQUE(duty_date)
);

-- Comments
COMMENT ON TABLE public.duty_schedules IS 'Lịch trực - Phân công trực theo ngày';
COMMENT ON COLUMN public.duty_schedules.duty_date IS 'Ngày trực';
COMMENT ON COLUMN public.duty_schedules.director_on_duty IS 'Trực Giám đốc';
COMMENT ON COLUMN public.duty_schedules.port_duty_officer IS 'Trực Ban Cảng (đ.c)';
COMMENT ON COLUMN public.duty_schedules.office_duty IS 'Trực Phòng - VĂN PHÒNG';
COMMENT ON COLUMN public.duty_schedules.finance_planning_duty IS 'Trực Phòng - PHÒNG TC-KH';
COMMENT ON COLUMN public.duty_schedules.operations_duty IS 'Trực Phòng - PHÒNG PVMD';
COMMENT ON COLUMN public.duty_schedules.technical_duty IS 'Trực Phòng - P. KTHT';
COMMENT ON COLUMN public.duty_schedules.atc_duty IS 'Trực Phòng - PHÒNG ĐHSB';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_duty_schedules_date ON public.duty_schedules(duty_date);
CREATE INDEX IF NOT EXISTS idx_duty_schedules_created_by ON public.duty_schedules(created_by);

-- RLS
ALTER TABLE public.duty_schedules ENABLE ROW LEVEL SECURITY;

-- Policies (Permissive for now, refine later)
CREATE POLICY "Enable all for authenticated" ON public.duty_schedules 
    FOR ALL TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_duty_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER duty_schedules_updated_at
    BEFORE UPDATE ON public.duty_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_duty_schedules_updated_at();
