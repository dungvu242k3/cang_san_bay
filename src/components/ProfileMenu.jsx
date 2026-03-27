import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import './ProfileMenu.css';

const menuSections = [
    {
        id: 'so-yeu-ly-lich',
        title: 'Sơ yếu lý lịch',
        items: [
            { id: 'ly-lich-ca-nhan', label: 'Lý lịch cá nhân' },
            { id: 'thong-tin-lien-he', label: 'Thông tin liên hệ' },
            { id: 'thong-tin-cong-viec', label: 'Thông tin công việc' },
            { id: 'than-nhan', label: 'Thân nhân' },
            { id: 'ho-so-dang', label: 'Hồ sơ Đảng' },
            { id: 'doan-thanh-nien', label: 'Đoàn thanh niên' },
            { id: 'cong-doan', label: 'Công đoàn' },
            { id: 'khac', label: 'Khác' }
        ]
    },
    {
        id: 'thong-tin-phap-ly',
        title: 'Thông tin pháp lý',
        items: [
            { id: 'phap-ly-chung', label: 'Số CCCD - Số BH' },
            { id: 'tai-khoan-ngan-hang', label: 'Tài khoản cá nhân' },
            { id: 'hop-dong-lao-dong', label: 'Hợp đồng lao động' },
            { id: 'ho-chieu', label: 'Hộ chiếu' }
        ]
    },
    {
        id: 'phuc-loi',
        title: 'Phúc lợi',
        items: [
            { id: 'luong-co-ban', label: 'Lương cơ bản' },
            { id: 'luong-vi-tri', label: 'Lương theo vị trí công việc' },
            { id: 'phu-cap', label: 'Phụ cấp' },
            { id: 'thu-nhap-khac', label: 'Thu nhập khác' }
        ]
    },
    {
        id: 'qua-trinh-lam-viec',
        title: 'Quá trình làm việc',
        items: [
            { id: 'nghi-phep', label: 'Nghỉ phép' },
            { id: 'bo-nhiem', label: 'Bổ nhiệm - Điều chuyển' },
            { id: 'nhat-ky-cong-tac', label: 'Nhật ký công tác' }
        ]
    },
    {
        id: 'kien-thuc',
        title: 'Kiến thức',
        items: [
            { id: 'chuyen-nganh', label: 'Chuyên ngành đào tạo' },
            { id: 'chung-chi', label: 'Chứng chỉ' },
            { id: 'dao-tao-noi-bo', label: 'Đào tạo nội bộ' }
        ]
    },
    {
        id: 'khen-thuong-ky-luat',
        title: 'Khen thưởng kỷ luật',
        items: [
            { id: 'khen-thuong', label: 'Khen thưởng' },
            { id: 'ky-luat', label: 'Kỷ luật' }
        ]
    },
    {
        id: 'suc-khoe-hoat-dong',
        title: 'Sức khoẻ - Hoạt động',
        items: [
            { id: 'the-bhyt', label: 'Thẻ bảo hiểm y tế' },
            { id: 'tai-nan-lao-dong', label: 'Tai nạn lao động' },
            { id: 'kham-suc-khoe', label: 'Khám sức khỏe' }
        ]
    }
];

// Map EmployeeDetail section IDs to ProfileMenu item IDs
const reverseMap = {
    'ly_lich': 'ly-lich-ca-nhan',
    'lien_he': 'thong-tin-lien-he',
    'cong_viec': 'thong-tin-cong-viec',
    'than_nhan': 'than-nhan',
    'ho_so_dang': 'ho-so-dang',
    'doan_thanh_nien': 'doan-thanh-nien',
    'cong_doan': 'cong-doan',
    'phap_ly_chung': 'phap-ly-chung',
    'tai_khoan': 'tai-khoan-ngan-hang',
    'hop_dong': 'hop-dong-lao-dong',
    'ho_chieu': 'ho-chieu',
    'khac': 'khac',
    'grading': 'grading',
    'luong_co_ban': 'luong-co-ban',
    'luong_vi_tri': 'luong-vi-tri',
    'phu_cap': 'phu-cap',
    'thu_nhap_khac': 'thu-nhap-khac',
    'nghi_phep': 'nghi-phep',
    'bo_nhiem': 'bo-nhiem',
    'nhat_ky_cong_tac': 'nhat-ky-cong-tac',
    'chuyen_nganh': 'chuyen-nganh',
    'chung_chi': 'chung-chi',
    'dao_tao_noi_bo': 'dao-tao-noi-bo',
    'khen_thuong': 'khen-thuong',
    'ky_luat': 'ky-luat',
    'the_bhyt': 'the-bhyt',
    'tai_nan_lao_dong': 'tai-nan-lao-dong',
    'kham_suc_khoe': 'kham-suc-khoe'
};

const SETTINGS_KEY = 'hidden_profile_sections';

function ProfileMenu({ activeSection = 'ly_lich', onSectionChange, onExport, onImport, onDownloadTemplate }) {
    const { user } = useAuth();
    const [expandedSections, setExpandedSections] = useState(['so-yeu-ly-lich']);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [hiddenIds, setHiddenIds] = useState([]); // array of hidden section/item IDs
    const [savingVisibility, setSavingVisibility] = useState(false);

    const isAdmin = user?.role_level === 'SUPER_ADMIN';

    // Convert EmployeeDetail section ID to ProfileMenu item ID for highlighting
    const activeItemId = reverseMap[activeSection] || activeSection;

    // Load hidden sections from DB on mount
    useEffect(() => {
        loadHiddenSections();
    }, []);

    const loadHiddenSections = async () => {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', SETTINGS_KEY)
                .maybeSingle();

            if (!error && data?.value) {
                setHiddenIds(data.value);
            }
        } catch (err) {
            console.warn('Could not load profile section settings:', err);
        }
    };

    const saveHiddenSections = async (newHiddenIds) => {
        try {
            setSavingVisibility(true);
            const { error } = await supabase
                .from('app_settings')
                .upsert({
                    key: SETTINGS_KEY,
                    value: newHiddenIds,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.employee_code
                }, { onConflict: 'key' });

            if (error) throw error;
        } catch (err) {
            console.error('Error saving visibility settings:', err);
            alert('Lỗi lưu cài đặt: ' + err.message);
        } finally {
            setSavingVisibility(false);
        }
    };

    const toggleVisibility = (id) => {
        const newHidden = hiddenIds.includes(id)
            ? hiddenIds.filter(h => h !== id)
            : [...hiddenIds, id];
        setHiddenIds(newHidden);
        saveHiddenSections(newHidden);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleItemClick = (itemId) => {
        if (editMode) return; // Don't navigate in edit mode
        if (onSectionChange) {
            onSectionChange(itemId);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <div className={`profile-menu ${isMobileMenuOpen ? 'mobile-expanded' : ''}`}>
            {/* Mobile Toggle Header */}
            <div className="profile-menu-mobile-header" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <span><i className="fas fa-list-ul"></i> Mục lục hồ sơ</span>
                <i className={`fas fa-chevron-${isMobileMenuOpen ? 'up' : 'down'}`}></i>
            </div>
            {/* Header */}
            <div className="profile-menu-header">
                <span className="profile-menu-title">MỤC LỤC</span>
                <div className="profile-menu-actions">
                    {isAdmin && (
                        <button
                            className={`action-btn ${editMode ? 'edit-active' : ''}`}
                            onClick={() => setEditMode(!editMode)}
                            title={editMode ? 'Thoát chỉnh sửa' : 'Ẩn/hiện mục'}
                        >
                            <i className={`fas ${editMode ? 'fa-check' : 'fa-eye-slash'}`}></i>
                            {editMode ? ' Xong' : ''}
                        </button>
                    )}
                    <button className="action-btn export" onClick={onExport}>
                        <i className="fas fa-download"></i> Export
                    </button>
                    <button className="action-btn import" onClick={onImport}>
                        <i className="fas fa-upload"></i> Import
                    </button>
                    <button className="action-btn template" onClick={onDownloadTemplate} title="Tải file mẫu Excel">
                        <i className="fas fa-file-alt"></i> Mẫu
                    </button>
                </div>
            </div>

            {/* Edit mode banner */}
            {editMode && (
                <div className="edit-mode-banner">
                    <i className="fas fa-info-circle"></i> Nhấn <i className="fas fa-eye"></i> / <i className="fas fa-eye-slash"></i> để ẩn/hiện mục
                    {savingVisibility && <span className="saving-indicator"> <i className="fas fa-spinner fa-spin"></i></span>}
                </div>
            )}

            {/* Search */}
            <div className="profile-menu-search">
                <input
                    type="text"
                    placeholder="Tìm mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Menu Sections */}
            <nav className="profile-menu-nav">
                {menuSections.map(section => {
                    const isSectionHidden = hiddenIds.includes(section.id);

                    // In normal mode, skip hidden sections entirely
                    if (!editMode && isSectionHidden) return null;

                    const filteredItems = section.items.filter(item => {
                        const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase());
                        const isItemHidden = hiddenIds.includes(item.id);
                        // In edit mode, show all items. In normal mode, hide hidden items.
                        return matchesSearch && (editMode || !isItemHidden);
                    });

                    const isSectionVisible = section.title.toLowerCase().includes(searchTerm.toLowerCase()) || filteredItems.length > 0;

                    if (!isSectionVisible && !editMode) return null;

                    // Auto-expand if searching and matches found
                    const isExpanded = searchTerm ? true : expandedSections.includes(section.id);

                    return (
                        <div key={section.id} className={`menu-section ${isSectionHidden && editMode ? 'section-hidden-preview' : ''}`}>
                            <div className="section-header-row">
                                <div
                                    className="section-header"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} section-arrow`}></i>
                                    <span>{section.title}</span>
                                </div>
                                {editMode && (
                                    <button
                                        className={`visibility-toggle ${isSectionHidden ? 'is-hidden' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id); }}
                                        title={isSectionHidden ? 'Hiện nhóm này' : 'Ẩn nhóm này'}
                                    >
                                        <i className={`fas ${isSectionHidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="section-items">
                                    {(editMode ? section.items.filter(item =>
                                        item.label.toLowerCase().includes(searchTerm.toLowerCase())
                                    ) : filteredItems).map(item => {
                                        const isItemHidden = hiddenIds.includes(item.id);
                                        if (!editMode && isItemHidden) return null;

                                        return (
                                            <div
                                                key={item.id}
                                                className={`section-item ${activeItemId === item.id ? 'active' : ''} ${isItemHidden && editMode ? 'item-hidden-preview' : ''}`}
                                                onClick={() => handleItemClick(item.id)}
                                            >
                                                <span>{item.label}</span>
                                                {editMode && (
                                                    <button
                                                        className={`visibility-toggle item-toggle ${isItemHidden ? 'is-hidden' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleVisibility(item.id); }}
                                                        title={isItemHidden ? 'Hiện mục này' : 'Ẩn mục này'}
                                                    >
                                                        <i className={`fas ${isItemHidden ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}

export default ProfileMenu;
