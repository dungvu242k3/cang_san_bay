import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Library.css'

const DOC_TYPES = ['Tất cả', 'Thông báo', 'Văn bản', 'Hướng dẫn']

const DOC_TYPE_ICONS = {
    'Thông báo': 'fas fa-bullhorn',
    'Văn bản': 'fas fa-file-contract',
    'Hướng dẫn': 'fas fa-book-open',
}

const DOC_TYPE_COLORS = {
    'Thông báo': '#e74c3c',
    'Văn bản': '#3498db',
    'Hướng dẫn': '#27ae60',
}

const DEFAULT_FORM = {
    title: '',
    content: '',
    document_type: 'Thông báo',
    status: 'Published',
    category: '',
    tags: [],
    file: null,
}

function Library() {
    const { user, checkAction } = useAuth()
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [showFormModal, setShowFormModal] = useState(false)
    const [formData, setFormData] = useState(DEFAULT_FORM)
    const [editingDoc, setEditingDoc] = useState(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeFilter, setActiveFilter] = useState('Tất cả')
    const [searchQuery, setSearchQuery] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    const canEdit = checkAction('edit', { module: 'library' })
    const canDelete = checkAction('delete', { module: 'library' })

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        loadDocuments()
    }, [])

    const loadDocuments = async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDocuments(data || [])
        } catch (err) {
            console.error('❌ Error loading documents:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredDocuments = useMemo(() => {
        let result = documents
        // Non-editors only see Published documents
        if (!canEdit) {
            result = result.filter(d => d.status === 'Published')
        }
        if (activeFilter !== 'Tất cả') {
            result = result.filter(d => d.document_type === activeFilter)
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            result = result.filter(d =>
                (d.title || '').toLowerCase().includes(q) ||
                (d.content || '').toLowerCase().includes(q) ||
                (d.category || '').toLowerCase().includes(q)
            )
        }
        return result
    }, [documents, activeFilter, searchQuery, canEdit])

    const handleOpenCreate = () => {
        setEditingDoc(null)
        setFormData(DEFAULT_FORM)
        setShowFormModal(true)
    }

    const handleOpenEdit = (doc) => {
        setEditingDoc(doc)
        setFormData({
            title: doc.title || '',
            content: doc.content || '',
            document_type: doc.document_type || 'Thông báo',
            status: doc.status || 'Published',
            category: doc.category || '',
            tags: doc.tags || [],
            file: null,
        })
        setShowFormModal(true)
    }

    const handleCloseForm = () => {
        setShowFormModal(false)
        setEditingDoc(null)
        setFormData(DEFAULT_FORM)
    }

    const handleUploadFile = async (file) => {
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filePath = `library/${timestamp}_${safeName}`

        const { error } = await supabase.storage
            .from('documents')
            .upload(filePath, file)

        if (error) throw error

        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

        return { url: urlData.publicUrl, name: file.name, path: filePath }
    }

    const handleSave = async () => {
        if (!formData.title.trim()) {
            alert('Vui lòng nhập tiêu đề!')
            return
        }
        if (!formData.content.trim()) {
            alert('Vui lòng nhập nội dung!')
            return
        }

        try {
            setSaving(true)

            // Handle file upload → store in attachments jsonb
            let attachments = editingDoc?.attachments || null
            if (formData.file) {
                setUploading(true)
                const uploaded = await handleUploadFile(formData.file)
                // Append to existing attachments or create new array
                const existing = Array.isArray(attachments) ? attachments : []
                attachments = [...existing, { url: uploaded.url, name: uploaded.name, path: uploaded.path }]
                setUploading(false)
            }

            const payload = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                document_type: formData.document_type,
                status: formData.status,
                category: formData.category || null,
                tags: formData.tags.length > 0 ? formData.tags : null,
                attachments: attachments,
            }

            if (editingDoc) {
                const { error } = await supabase
                    .from('documents')
                    .update(payload)
                    .eq('id', editingDoc.id)
                if (error) throw error
            } else {
                payload.author_code = user?.employee_code || null
                payload.published_at = formData.status === 'Published' ? new Date().toISOString() : null
                const { error } = await supabase
                    .from('documents')
                    .insert([payload])
                if (error) throw error
            }

            handleCloseForm()
            await loadDocuments()
        } catch (err) {
            console.error('Error saving document:', err)
            alert('Lỗi khi lưu: ' + err.message)
        } finally {
            setSaving(false)
            setUploading(false)
        }
    }

    const handleDelete = async (doc) => {
        if (!window.confirm(`Xóa tài liệu "${doc.title}"?`)) return

        try {
            // Delete files from storage if any
            if (doc.attachments && Array.isArray(doc.attachments)) {
                const paths = doc.attachments.map(a => a.path).filter(Boolean)
                if (paths.length > 0) {
                    await supabase.storage.from('documents').remove(paths)
                }
            }

            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id)

            if (error) throw error
            if (selectedDoc?.id === doc.id) setShowModal(false)
            await loadDocuments()
        } catch (err) {
            console.error('Error deleting document:', err)
            alert('Lỗi khi xóa: ' + err.message)
        }
    }

    const handleToggleStatus = async (doc) => {
        const newStatus = doc.status === 'Published' ? 'Archived' : 'Published'
        try {
            const update = { status: newStatus }
            if (newStatus === 'Published' && !doc.published_at) {
                update.published_at = new Date().toISOString()
            }
            if (newStatus === 'Archived') {
                update.archived_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('documents')
                .update(update)
                .eq('id', doc.id)

            if (error) throw error
            await loadDocuments()
        } catch (err) {
            console.error('Error updating status:', err)
            alert('Lỗi: ' + err.message)
        }
    }

    const handleRemoveAttachment = (index) => {
        if (!editingDoc) return
        const updated = [...(editingDoc.attachments || [])]
        updated.splice(index, 1)
        setEditingDoc({ ...editingDoc, attachments: updated })
    }

    const getFileIcon = (fileName) => {
        if (!fileName) return 'fas fa-file'
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['pdf'].includes(ext)) return 'fas fa-file-pdf'
        if (['doc', 'docx'].includes(ext)) return 'fas fa-file-word'
        if (['xls', 'xlsx'].includes(ext)) return 'fas fa-file-excel'
        if (['ppt', 'pptx'].includes(ext)) return 'fas fa-file-powerpoint'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'fas fa-file-image'
        return 'fas fa-file'
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Draft': return { label: 'Nháp', color: '#94a3b8', bg: '#f1f5f9' }
            case 'Published': return { label: 'Đã xuất bản', color: '#16a34a', bg: '#f0fdf4' }
            case 'Archived': return { label: 'Lưu trữ', color: '#d97706', bg: '#fffbeb' }
            default: return { label: status, color: '#64748b', bg: '#f8fafc' }
        }
    }

    if (loading) {
        return (
            <div className="library-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang tải thư viện...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="library-page">
            {/* Header */}
            <div className="library-header">
                <div className="library-header-top">
                    <div>
                        <h1><i className="fas fa-book"></i> Thư viện</h1>
                        <p>Quản lý thông báo, văn bản và hướng dẫn</p>
                    </div>
                    {canEdit && (
                        <button className="btn-create" onClick={handleOpenCreate}>
                            <i className="fas fa-plus"></i> Tạo tài liệu
                        </button>
                    )}
                </div>

                {/* Search + Filter */}
                <div className="library-toolbar">
                    <div className="search-box">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài liệu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                    <div className="filter-tabs">
                        {DOC_TYPES.map(cat => (
                            <button
                                key={cat}
                                className={`filter-tab ${activeFilter === cat ? 'active' : ''}`}
                                onClick={() => setActiveFilter(cat)}
                                style={activeFilter === cat && cat !== 'Tất cả' ? { borderColor: DOC_TYPE_COLORS[cat], color: DOC_TYPE_COLORS[cat] } : {}}
                            >
                                {cat !== 'Tất cả' && <i className={DOC_TYPE_ICONS[cat]}></i>}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="library-stats">
                <span>{filteredDocuments.length} tài liệu</span>
                {activeFilter !== 'Tất cả' && <span className="active-filter-tag">{activeFilter}</span>}
            </div>

            {/* Documents Grid */}
            <div className="documents-grid">
                {filteredDocuments.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-folder-open"></i>
                        <p>{searchQuery ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào'}</p>
                    </div>
                ) : (
                    filteredDocuments.map(doc => {
                        const statusBadge = getStatusBadge(doc.status)
                        const hasAttachments = doc.attachments && Array.isArray(doc.attachments) && doc.attachments.length > 0
                        return (
                            <div key={doc.id} className={`document-card ${doc.status === 'Archived' ? 'archived' : ''}`}>
                                <div className="card-body" onClick={() => { setSelectedDoc(doc); setShowModal(true) }}>
                                    <div className="doc-icon-container" style={{ background: `linear-gradient(135deg, ${DOC_TYPE_COLORS[doc.document_type]}, ${DOC_TYPE_COLORS[doc.document_type]}dd)` || '#667eea' }}>
                                        <i className={DOC_TYPE_ICONS[doc.document_type] || 'fas fa-file-alt'}></i>
                                    </div>
                                    <div className="doc-info">
                                        <h3>{doc.title}</h3>
                                        <div className="doc-meta-row">
                                            <span className="doc-type" style={{ color: DOC_TYPE_COLORS[doc.document_type], background: `${DOC_TYPE_COLORS[doc.document_type]}22` }}>
                                                {doc.document_type}
                                            </span>
                                            {canEdit && (
                                                <span className="status-badge" style={{ color: statusBadge.color, background: statusBadge.bg }}>
                                                    {statusBadge.label}
                                                </span>
                                            )}
                                            <span className="doc-date">
                                                <i className="far fa-calendar-alt"></i>
                                                {new Date(doc.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        {hasAttachments && (
                                            <div className="doc-attachment">
                                                <i className="fas fa-paperclip"></i>
                                                <span>{doc.attachments.length} file đính kèm</span>
                                            </div>
                                        )}
                                        {doc.category && (
                                            <div className="doc-category-tag">
                                                <i className="fas fa-folder"></i>
                                                {doc.category}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {(canEdit || canDelete) && (
                                    <div className="card-actions">
                                        {canEdit && (
                                            <>
                                                <button
                                                    className={`action-btn status-toggle-btn ${doc.status === 'Archived' ? 'archived' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(doc) }}
                                                    title={doc.status === 'Published' ? 'Lưu trữ' : 'Xuất bản'}
                                                >
                                                    <i className={doc.status === 'Published' ? 'fas fa-archive' : 'fas fa-upload'}></i>
                                                </button>
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(doc) }}
                                                    title="Sửa"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            </>
                                        )}
                                        {canDelete && (
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(doc) }}
                                                title="Xóa"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* View Detail Modal */}
            {showModal && selectedDoc && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ borderLeft: `6px solid ${DOC_TYPE_COLORS[selectedDoc.document_type]}` }}>
                            <h2>{selectedDoc.title}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="doc-meta">
                                <span style={{ color: DOC_TYPE_COLORS[selectedDoc.document_type] || '#667eea' }}>
                                    <i className={DOC_TYPE_ICONS[selectedDoc.document_type] || 'fas fa-tag'}></i> {selectedDoc.document_type}
                                </span>
                                <span><i className="fas fa-calendar"></i> {new Date(selectedDoc.created_at).toLocaleDateString('vi-VN')}</span>
                                {selectedDoc.category && (
                                    <span><i className="fas fa-folder"></i> {selectedDoc.category}</span>
                                )}
                            </div>
                            {/* Attachments */}
                            {selectedDoc.attachments && Array.isArray(selectedDoc.attachments) && selectedDoc.attachments.length > 0 && (
                                <div className="doc-attachments-list">
                                    <h4><i className="fas fa-paperclip"></i> File đính kèm</h4>
                                    {selectedDoc.attachments.map((att, i) => (
                                        <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="download-btn">
                                            <i className={getFileIcon(att.name)}></i>
                                            <span>{att.name || 'Tải file'}</span>
                                            <i className="fas fa-download"></i>
                                        </a>
                                    ))}
                                </div>
                            )}
                            <div className="doc-content" dangerouslySetInnerHTML={{ __html: selectedDoc.content }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showFormModal && (
                <div className="modal-overlay" onClick={handleCloseForm}>
                    <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingDoc ? 'Sửa tài liệu' : 'Tạo tài liệu mới'}</h2>
                            <button className="close-btn" onClick={handleCloseForm}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tiêu đề <span className="required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Nhập tiêu đề tài liệu..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại tài liệu</label>
                                    <select
                                        value={formData.document_type}
                                        onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                                    >
                                        {DOC_TYPES.filter(c => c !== 'Tất cả').map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Draft">Nháp</option>
                                        <option value="Published">Xuất bản</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Danh mục (tùy chọn)</label>
                                <input
                                    type="text"
                                    placeholder="VD: Nội quy, Biểu mẫu, Quy trình..."
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nội dung <span className="required">*</span></label>
                                <textarea
                                    placeholder="Nhập nội dung tài liệu..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows={8}
                                />
                            </div>
                            <div className="form-group">
                                <label>File đính kèm</label>
                                <div className="file-upload-area">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        onChange={(e) => setFormData({ ...formData, file: e.target.files[0] || null })}
                                    />
                                    <label htmlFor="file-upload" className="file-upload-label">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <span>{formData.file ? formData.file.name : 'Chọn file hoặc kéo thả vào đây'}</span>
                                    </label>
                                </div>
                                {/* Existing attachments (edit mode) */}
                                {editingDoc?.attachments && Array.isArray(editingDoc.attachments) && editingDoc.attachments.length > 0 && (
                                    <div className="existing-attachments">
                                        <small>File hiện tại:</small>
                                        {editingDoc.attachments.map((att, i) => (
                                            <div key={i} className="current-file">
                                                <i className={getFileIcon(att.name)}></i>
                                                <span>{att.name}</span>
                                                <button className="remove-att-btn" onClick={() => handleRemoveAttachment(i)} title="Xóa file">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="form-actions">
                                <button className="btn-cancel" onClick={handleCloseForm} disabled={saving}>
                                    <i className="fas fa-times"></i> Hủy
                                </button>
                                <button className="btn-save" onClick={handleSave} disabled={saving}>
                                    {saving ? (
                                        <><i className="fas fa-spinner fa-spin"></i> {uploading ? 'Đang tải file...' : 'Đang lưu...'}</>
                                    ) : (
                                        <><i className="fas fa-save"></i> {editingDoc ? 'Cập nhật' : 'Tạo mới'}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Library
