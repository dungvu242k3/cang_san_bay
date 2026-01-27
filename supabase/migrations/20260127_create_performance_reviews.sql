-- Create table for Performance Reviews (Đánh giá KPI)
CREATE TABLE IF NOT EXISTS public.performance_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code TEXT NOT NULL, -- Mã nhân viên (Link to employee_profiles.employee_code)
    month TEXT NOT NULL, -- Kỳ đánh giá (Format: YYYY-MM)
    
    -- Assessment Data (JSONB for flexible criteria structure)
    self_assessment JSONB DEFAULT '{}'::jsonb, -- Tự đánh giá
    supervisor_assessment JSONB DEFAULT '{}'::jsonb, -- Quản lý đánh giá
    
    -- Comments
    self_comment TEXT, -- Nhân viên giải trình
    supervisor_comment TEXT, -- Quản lý nhận xét
    
    -- Scores & Grades
    self_total_score NUMERIC DEFAULT 0, -- Tổng điểm tự đánh giá
    self_grade TEXT, -- Xếp loại tự đánh giá (A, B, C...)
    supervisor_total_score NUMERIC DEFAULT 0, -- Tổng điểm quản lý đánh giá
    supervisor_grade TEXT, -- Xếp loại quản lý (A, B, C...)
    
    -- Meta
    status TEXT DEFAUlT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one review per employee per month
    UNIQUE(employee_code, month),
    FOREIGN KEY (employee_code) REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE
);

-- Comments
COMMENT ON TABLE public.performance_reviews IS 'Bảng lưu trữ kết quả đánh giá KPI hàng tháng';
COMMENT ON COLUMN public.performance_reviews.employee_code IS 'Mã nhân viên được đánh giá';
COMMENT ON COLUMN public.performance_reviews.month IS 'Tháng đánh giá, định dạng YYYY-MM';
COMMENT ON COLUMN public.performance_reviews.self_assessment IS 'Dữ liệu chấm điểm chi tiết của nhân viên (JSON)';

-- RLS
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.performance_reviews
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON public.performance_reviews
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
