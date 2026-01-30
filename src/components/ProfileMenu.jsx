import { useState } from 'react';
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
        items: []
    },
    {
        id: 'qua-trinh-lam-viec',
        title: 'Quá trình làm việc',
        items: []
    },
    {
        id: 'kien-thuc',
        title: 'Kiến thức',
        items: []
    },
    {
        id: 'khen-thuong-ky-luat',
        title: 'Khen thưởng kỷ luật',
        items: []
    },
    {
        id: 'suc-khoe-hoat-dong',
        title: 'Sức khoẻ - Hoạt động',
        items: []
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
    'grading': 'grading'
};

function ProfileMenu({ activeSection = 'ly_lich', onSectionChange }) {
    const [expandedSections, setExpandedSections] = useState(['so-yeu-ly-lich']);
    const [searchTerm, setSearchTerm] = useState('');

    // Convert EmployeeDetail section ID to ProfileMenu item ID for highlighting
    const activeItemId = reverseMap[activeSection] || activeSection;

    const toggleSection = (sectionId) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleItemClick = (itemId) => {
        if (onSectionChange) {
            onSectionChange(itemId);
        }
    };

    return (
        <div className="profile-menu">
            {/* Header */}
            <div className="profile-menu-header">
                <span className="profile-menu-title">MỤC LỤC</span>
                <div className="profile-menu-actions">
                    <button className="action-btn export">
                        <i className="fas fa-download"></i> Export
                    </button>
                    <button className="action-btn import">
                        <i className="fas fa-upload"></i> Import
                    </button>
                </div>
            </div>

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
                    const filteredItems = section.items.filter(item =>
                        item.label.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    const isSectionVisible = section.title.toLowerCase().includes(searchTerm.toLowerCase()) || filteredItems.length > 0;

                    if (!isSectionVisible) return null;

                    // Auto-expand if searching and matches found
                    const isExpanded = searchTerm ? true : expandedSections.includes(section.id);

                    return (
                        <div key={section.id} className="menu-section">
                            <div
                                className="section-header"
                                onClick={() => toggleSection(section.id)}
                            >
                                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} section-arrow`}></i>
                                <span>{section.title}</span>
                            </div>

                            {isExpanded && filteredItems.length > 0 && (
                                <div className="section-items">
                                    {filteredItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`section-item ${activeItemId === item.id ? 'active' : ''}`}
                                            onClick={() => handleItemClick(item.id)}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
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
