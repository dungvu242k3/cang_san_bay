-- ==========================================================
-- MODULE: THƯ VIỆN (Library/Documents)
-- Version: 1.0.0
-- Description: Quản lý Thông báo/Văn bản/Hướng dẫn với ACK
-- ==========================================================

-- 1. BẢNG DOCUMENTS (Nội dung thư viện)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Thông tin cơ bản
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Nội dung HTML hoặc Markdown
    document_type TEXT NOT NULL CHECK (document_type IN ('Thông báo', 'Văn bản', 'Hướng dẫn')),
    
    -- Phát hành & Audience
    publish_scope TEXT NOT NULL DEFAULT 'COMPANY' CHECK (publish_scope IN ('COMPANY', 'ORG_UNIT', 'USER')),
    -- Nếu publish_scope = 'ORG_UNIT', lưu danh sách department/team trong target_org_units (JSON)
    -- Nếu publish_scope = 'USER', lưu danh sách employee_code trong target_users (JSON)
    target_org_units JSONB, -- [{type: 'department', value: 'Phòng A'}, {type: 'team', value: 'Đội B'}]
    target_users JSONB, -- ['EMPLOYEE_CODE1', 'EMPLOYEE_CODE2']
    
    -- Trạng thái
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    
    -- ACK (Xác nhận đã đọc)
    requires_ack BOOLEAN DEFAULT false,
    ack_deadline DATE, -- Hạn chót để ACK (optional)
    
    -- Metadata
    author_code TEXT REFERENCES public.employee_profiles(employee_code) ON DELETE SET NULL,
    published_at TIMESTAMPTZ, -- Thời điểm publish
    archived_at TIMESTAMPTZ, -- Thời điểm archive
    
    -- File đính kèm (optional)
    attachments JSONB, -- [{name: 'file.pdf', url: '...', size: 12345}]
    
    -- Tags & Categories
    tags TEXT[], -- Mảng các tags
    category TEXT, -- Danh mục
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_author ON public.documents(author_code);
CREATE INDEX IF NOT EXISTS idx_documents_published_at ON public.documents(published_at);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at);

-- 2. BẢNG DOCUMENT_ACKNOWLEDGMENTS (Xác nhận đã đọc)
CREATE TABLE IF NOT EXISTS public.document_acknowledgments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL REFERENCES public.employee_profiles(employee_code) ON DELETE CASCADE,
    
    -- ACK info
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT, -- IP khi ACK (optional)
    user_agent TEXT, -- Browser info (optional)
    
    -- Notes (optional)
    notes TEXT, -- Ghi chú của người đọc
    
    UNIQUE(document_id, employee_code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ack_document ON public.document_acknowledgments(document_id);
CREATE INDEX IF NOT EXISTS idx_ack_employee ON public.document_acknowledgments(employee_code);
CREATE INDEX IF NOT EXISTS idx_ack_acknowledged_at ON public.document_acknowledgments(acknowledged_at);

-- 3. ENABLE RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_acknowledgments ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES cho documents
-- Cho phép đọc nếu:
-- - Status = Published
-- - Và publish_scope phù hợp với user
DROP POLICY IF EXISTS "Users can view published documents" ON public.documents;
CREATE POLICY "Users can view published documents" ON public.documents
    FOR SELECT USING (
        status = 'Published' AND (
            -- Company-wide
            (publish_scope = 'COMPANY') OR
            -- Org unit scope - check if user's department/team matches
            (publish_scope = 'ORG_UNIT' AND target_org_units IS NOT NULL AND (
                EXISTS (
                    SELECT 1 FROM public.employee_profiles ep
                    CROSS JOIN LATERAL jsonb_array_elements(target_org_units) AS org_unit
                    WHERE ep.employee_code = (auth.jwt() ->> 'employee_code')
                    AND (
                        (org_unit->>'type' = 'department' AND ep.department = org_unit->>'value')
                        OR (org_unit->>'type' = 'team' AND ep.team = org_unit->>'value')
                    )
                )
            )) OR
            -- User scope - check if user is in target list
            (publish_scope = 'USER' AND target_users IS NOT NULL AND (
                (auth.jwt() ->> 'employee_code') = ANY(
                    SELECT jsonb_array_elements_text(target_users)
                )
            ))
        )
    );

-- Author có thể xem tất cả documents của mình
DROP POLICY IF EXISTS "Authors can view their own documents" ON public.documents;
CREATE POLICY "Authors can view their own documents" ON public.documents
    FOR SELECT USING (author_code = (auth.jwt() ->> 'employee_code'));

-- Super admin có thể xem tất cả
DROP POLICY IF EXISTS "Super admin can view all documents" ON public.documents;
CREATE POLICY "Super admin can view all documents" ON public.documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE employee_code = (auth.jwt() ->> 'employee_code')
            AND role_level = 'SUPER_ADMIN'
        )
    );

-- Cho phép tạo/sửa/xóa (theo quyền)
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
CREATE POLICY "Users can create documents" ON public.documents
    FOR INSERT WITH CHECK (true); -- Tất cả user đều có thể tạo

DROP POLICY IF EXISTS "Authors can update their documents" ON public.documents;
CREATE POLICY "Authors can update their documents" ON public.documents
    FOR UPDATE USING (author_code = (auth.jwt() ->> 'employee_code'));

DROP POLICY IF EXISTS "Super admin can manage all documents" ON public.documents;
CREATE POLICY "Super admin can manage all documents" ON public.documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE employee_code = (auth.jwt() ->> 'employee_code')
            AND role_level = 'SUPER_ADMIN'
        )
    );

-- 5. POLICIES cho document_acknowledgments
-- User có thể xem ACK của chính mình
DROP POLICY IF EXISTS "Users can view their own acks" ON public.document_acknowledgments;
CREATE POLICY "Users can view their own acks" ON public.document_acknowledgments
    FOR SELECT USING (employee_code = (auth.jwt() ->> 'employee_code'));

-- User có thể tạo ACK cho chính mình
DROP POLICY IF EXISTS "Users can create their own acks" ON public.document_acknowledgments;
CREATE POLICY "Users can create their own acks" ON public.document_acknowledgments
    FOR INSERT WITH CHECK (employee_code = (auth.jwt() ->> 'employee_code'));

-- Author và Super admin có thể xem tất cả ACK của document
DROP POLICY IF EXISTS "Authors and admins can view all acks" ON public.document_acknowledgments;
CREATE POLICY "Authors and admins can view all acks" ON public.document_acknowledgments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents d
            LEFT JOIN public.user_roles ur ON ur.employee_code = (auth.jwt() ->> 'employee_code')
            WHERE d.id = document_acknowledgments.document_id
            AND (
                d.author_code = (auth.jwt() ->> 'employee_code')
                OR ur.role_level = 'SUPER_ADMIN'
            )
        )
    );

-- 6. GRANT PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 7. COMMENTS
COMMENT ON TABLE public.documents IS 'Bảng lưu trữ các nội dung thư viện: Thông báo, Văn bản, Hướng dẫn';
COMMENT ON TABLE public.document_acknowledgments IS 'Bảng lưu trữ xác nhận đã đọc của người dùng';

-- 8. FUNCTION để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT '✅ Library module tables created successfully!' as status;
