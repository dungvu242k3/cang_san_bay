import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './Library.css'

function Library() {
    const { user } = useAuth()
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

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
            setLoading(false)
        } catch (err) {
            console.error('Error loading documents:', err)
            setLoading(false)
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
            <div className="library-header">
                <h1><i className="fas fa-book"></i> Thư viện</h1>
                <p>Quản lý thông báo, văn bản và hướng dẫn</p>
            </div>

            <div className="documents-grid">
                {documents.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-folder-open"></i>
                        <p>Chưa có tài liệu nào</p>
                    </div>
                ) : (
                    documents.map(doc => (
                        <div key={doc.id} className="document-card" onClick={() => {
                            setSelectedDoc(doc)
                            setShowModal(true)
                        }}>
                            <div className="doc-icon">
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <div className="doc-info">
                                <h3>{doc.title}</h3>
                                <p className="doc-type">{doc.content_type}</p>
                                <p className="doc-date">{new Date(doc.created_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && selectedDoc && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedDoc.title}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="doc-meta">
                                <span><i className="fas fa-tag"></i> {selectedDoc.content_type}</span>
                                <span><i className="fas fa-calendar"></i> {new Date(selectedDoc.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="doc-content" dangerouslySetInnerHTML={{ __html: selectedDoc.content }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Library
