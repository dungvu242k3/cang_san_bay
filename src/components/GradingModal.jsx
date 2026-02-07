import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import './GradingModal.css';

// Import criteria - sử dụng cùng structure với EmployeeDetail
// Note: Để đơn giản, chúng ta sẽ import từ EmployeeDetail hoặc tạo helper
// Ở đây tôi sẽ tạo một version đơn giản, có thể refactor sau để dùng chung
const CRITERIA_NVTT = [
    {
        section: 'A',
        items: [
            { id: '1', title: 'Chấp hành Nội quy lao động', maxScore: 20, isHeader: true },
            { id: '1.1', title: 'Nhóm hành vi Điều 23 - Nội quy lao động', range: '1 - 9', isHeader: false },
            { id: '1.2', title: 'Nhóm hành vi Điều 24 - Nội quy lao động', range: '10 - 15', isHeader: false },
            { id: '1.3', title: 'Nhóm hành vi Điều 25, Điều 26 - Nội quy lao động', range: '16 - 20', isHeader: false },
        ]
    },
    {
        section: 'B',
        items: [
            { id: '2', title: 'Hiệu quả công việc', maxScore: 45, isHeader: true },
            { id: '2.1', title: 'Khối lượng công việc', range: '1 - 10', isHeader: false },
            { id: '2.2', title: 'Thời gian thực hiện, tiến độ hoàn thành', range: '1 - 10', isHeader: false },
            { id: '2.3', title: 'Chất lượng công việc', maxScore: 15, isHeader: true },
            { id: '2.3.1', title: 'Tính chính xác so với mục tiêu, yêu cầu đề ra (hiệu quả)', range: '1 - 5', isHeader: false },
            { id: '2.3.2', title: 'Đúng phương pháp, quy trình, hướng dẫn (hiệu suất)', range: '1 - 5', isHeader: false },
            { id: '2.3.3', title: 'Mức độ khả thi, có thể áp dụng (thực tiễn)', range: '1 - 5', isHeader: false },
            { id: '2.4', title: 'Sắp xếp, quản lý công việc và ý thức tiết kiệm', maxScore: 10, isHeader: true },
            { id: '2.4.1', title: 'Tính khoa học, hợp lý trong quản lý công việc', range: '1 - 5', isHeader: false },
            { id: '2.4.2', title: 'Ý thức tiết kiệm (thời gian làm việc, nguồn lực, tài nguyên)', range: '1 - 5', isHeader: false },
            { id: '3', title: 'Tinh thần trách nhiệm, ý thức hợp tác, linh hoạt và thích ứng', maxScore: 15, isHeader: true },
            { id: '3.1', title: 'Tinh thần trách nhiệm', range: '1 - 5', isHeader: false },
            { id: '3.2', title: 'Ý thức hợp tác và giải quyết vấn đề', range: '1 - 5', isHeader: false },
            { id: '3.3', title: 'Khả năng chủ động thay đổi, thích ứng linh hoạt, kịp thời xử lý', range: '1 - 5', isHeader: false },
            { id: '4', title: 'Hiệu quả quản lý, điều hành, chỉ đạo', maxScore: 20, isHeader: true },
            { id: '4.1', title: 'Hiệu quả quản lý, chỉ đạo, điều hành công việc', range: '1 - 5', isHeader: false },
            { id: '4.2', title: 'Thực hiện chế độ họp, hội nghị, đào tạo - huấn luyện', range: '1 - 5', isHeader: false },
            { id: '4.3', title: 'Trách nhiệm thực hiện chế độ báo cáo, thông tin phản hồi với lãnh đạo', range: '1 - 5', isHeader: false },
            { id: '4.4', title: 'Hiệu quả hoạt động của cơ quan đơn vị', range: '1 - 5', isHeader: false },
        ]
    },
    {
        section: 'C',
        items: [
            { id: '5', title: 'Điểm cộng động viên, khuyến khích (04 tiêu chí)', range: '1 - 15', isHeader: false }
        ]
    }
];

const getCriteria = (templateCode) => {
    switch (templateCode) {
        case 'NVGT': return CRITERIA_NVTT; // Có thể customize sau
        case 'CBQL': return CRITERIA_NVTT; // Có thể customize sau
        default: return CRITERIA_NVTT;
    }
};

function GradingModal({ employee, isOpen, onClose, onSave }) {
    const { user: authUser } = useAuth();
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [gradingReviewId, setGradingReviewId] = useState(null);
    const [selfAssessment, setSelfAssessment] = useState({});
    const [supervisorAssessment, setSupervisorAssessment] = useState({});
    const [selfComment, setSelfComment] = useState('');
    const [supervisorComment, setSupervisorComment] = useState('');
    const [isGradingLocked, setIsGradingLocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen && employee) {
            loadGradingData();
        }
    }, [isOpen, employee, month]);

    const loadGradingData = async () => {
        if (!employee || !employee.employeeId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('performance_reviews')
                .select('*')
                .eq('employee_code', employee.employeeId)
                .eq('month', month)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setGradingReviewId(data.id);
                setSelfAssessment(data.self_assessment || {});
                setSupervisorAssessment(data.supervisor_assessment || {});
                setSelfComment(data.self_comment || '');
                setSupervisorComment(data.supervisor_comment || '');
                setIsGradingLocked(true);
            } else {
                setGradingReviewId(null);
                setSelfAssessment({});
                setSupervisorAssessment({});
                setSelfComment('');
                setSupervisorComment('');
                setIsGradingLocked(false);
            }
        } catch (err) {
            console.error("Error loading grading:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data) => {
        const criteria = getCriteria(employee?.score_template_code || 'NVTT');

        // Section A: Điểm trừ (20 - tổng điểm trừ)
        let scoreA = 20;
        const sectionA = criteria.find(c => c.section === 'A');
        if (sectionA) {
            sectionA.items.forEach(item => {
                if (!item.isHeader) {
                    scoreA -= Number(data[item.id] || 0);
                }
            });
        }
        scoreA = Math.max(0, scoreA);

        // Section B: Điểm đạt (tổng điểm cộng)
        let scoreB = 0;
        const sectionB = criteria.find(c => c.section === 'B');
        if (sectionB) {
            sectionB.items.forEach(item => {
                if (!item.isHeader) {
                    scoreB += Number(data[item.id] || 0);
                }
            });
        }
        scoreB = Math.min(80, scoreB);

        // Section C: Điểm cộng
        let scoreC = 0;
        const sectionC = criteria.find(c => c.section === 'C');
        if (sectionC) {
            sectionC.items.forEach(item => {
                scoreC += Number(data[item.id] || 0);
            });
        }
        scoreC = Math.min(15, scoreC);

        return { scoreA, scoreB, scoreC, total: scoreA + scoreB + scoreC };
    };

    const getGrade = (total) => {
        if (total >= 101) return 'A1';
        if (total >= 91) return 'A';
        if (total >= 76) return 'B';
        if (total >= 66) return 'C';
        return 'D';
    };

    // Helper function to extract max value from range string (e.g., "1 - 10" => 10)
    const getMaxFromRange = (range) => {
        if (!range) return null;
        const parts = range.split('-').map(s => parseInt(s.trim()));
        if (parts.length === 2 && !isNaN(parts[1])) {
            return parts[1];
        }
        return null;
    };

    // Validated input handler for self assessment
    const handleSelfInput = (itemId, value, item) => {
        const numValue = Number(value);
        const maxValue = item.range ? getMaxFromRange(item.range) : item.maxScore;

        if (value === '' || value === null) {
            setSelfAssessment({ ...selfAssessment, [itemId]: '' });
            return;
        }

        if (numValue < 0) {
            alert(`Điểm không được nhỏ hơn 0!`);
            return;
        }

        if (maxValue && numValue > maxValue) {
            alert(`Điểm tối đa cho tiêu chí "${item.title}" là ${maxValue}!`);
            return;
        }

        setSelfAssessment({ ...selfAssessment, [itemId]: value });
    };

    // Validated input handler for supervisor assessment  
    const handleSupervisorInput = (itemId, value, item) => {
        const numValue = Number(value);
        const maxValue = item.range ? getMaxFromRange(item.range) : item.maxScore;

        if (value === '' || value === null) {
            setSupervisorAssessment({ ...supervisorAssessment, [itemId]: '' });
            return;
        }

        if (numValue < 0) {
            alert(`Điểm không được nhỏ hơn 0!`);
            return;
        }

        if (maxValue && numValue > maxValue) {
            alert(`Điểm tối đa cho tiêu chí "${item.title}" là ${maxValue}!`);
            return;
        }

        setSupervisorAssessment({ ...supervisorAssessment, [itemId]: value });
    };

    const handleGradingSave = async () => {
        if (!employee || !employee.employeeId) {
            alert('Không tìm thấy thông tin nhân viên!');
            return;
        }

        if (!month) {
            alert('Vui lòng chọn tháng đánh giá!');
            return;
        }

        // Validate all scores before saving
        const criteria = getCriteria(employee.score_template_code || 'NVTT');
        const errors = [];

        console.log('=== VALIDATION START ===');
        console.log('Criteria:', criteria);
        console.log('Self Assessment:', selfAssessment);

        for (const section of criteria) {
            for (const item of section.items) {
                if (item.isHeader) continue;

                const maxValue = item.range ? getMaxFromRange(item.range) : item.maxScore;
                console.log(`Checking item ${item.id}: range="${item.range}", maxValue=${maxValue}`);

                // Check self assessment
                const selfValue = Number(selfAssessment[item.id] || 0);
                console.log(`  Self value for ${item.id}: ${selfValue}`);

                if (selfValue < 0) {
                    errors.push(`Tự ĐG - "${item.title}": Điểm không được âm`);
                } else if (maxValue && selfValue > maxValue) {
                    console.log(`  ERROR: ${selfValue} > ${maxValue}`);
                    errors.push(`Tự ĐG - "${item.title}": Điểm ${selfValue} vượt quá max ${maxValue}`);
                }

                // Check supervisor assessment
                const supervisorValue = Number(supervisorAssessment[item.id] || 0);
                if (supervisorValue < 0) {
                    errors.push(`QL ĐG - "${item.title}": Điểm không được âm`);
                } else if (maxValue && supervisorValue > maxValue) {
                    errors.push(`QL ĐG - "${item.title}": Điểm ${supervisorValue} vượt quá max ${maxValue}`);
                }
            }
        }

        console.log('=== VALIDATION END ===');
        console.log('Errors found:', errors);

        if (errors.length > 0) {
            alert('Lỗi validation điểm:\n\n' + errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác` : ''));
            return;
        }

        const selfTotals = calculateTotals(selfAssessment);
        const supervisorTotals = calculateTotals(supervisorAssessment);

        const payload = {
            employee_code: employee.employeeId,
            month,
            self_assessment: selfAssessment,
            supervisor_assessment: supervisorAssessment,
            self_comment: selfComment,
            supervisor_comment: supervisorComment,
            self_total_score: selfTotals.total,
            self_grade: getGrade(selfTotals.total),
            supervisor_total_score: supervisorTotals.total,
            supervisor_grade: getGrade(supervisorTotals.total)
        };

        try {
            let result;
            if (gradingReviewId) {
                result = await supabase
                    .from('performance_reviews')
                    .update(payload)
                    .eq('id', gradingReviewId);
            } else {
                result = await supabase
                    .from('performance_reviews')
                    .insert([payload]);

                if (result.error && result.error.code === '23505') {
                    const { data: existing } = await supabase
                        .from('performance_reviews')
                        .select('id')
                        .eq('employee_code', employee.employeeId)
                        .eq('month', month)
                        .maybeSingle();

                    if (existing) {
                        setGradingReviewId(existing.id);
                        result = await supabase
                            .from('performance_reviews')
                            .update(payload)
                            .eq('id', existing.id);
                    }
                }
            }

            if (result.error) {
                console.error('Supabase error:', result.error);
                alert('Lỗi khi lưu: ' + (result.error.message || result.error.details || 'Không thể lưu dữ liệu'));
                return;
            }

            alert('Đã lưu đánh giá thành công!');
            setIsGradingLocked(true);
            if (onSave) onSave();
            await loadGradingData();
        } catch (e) {
            console.error('Error saving grading:', e);
            alert('Lỗi khi lưu: ' + (e.message || 'Đã xảy ra lỗi không xác định'));
        }
    };

    if (!isOpen || !employee) return null;

    const criteria = getCriteria(employee.score_template_code || 'NVTT');
    const selfTotals = calculateTotals(selfAssessment);
    const supervisorTotals = calculateTotals(supervisorAssessment);
    const selfGrade = getGrade(selfTotals.total);
    const supervisorGrade = getGrade(supervisorTotals.total);

    const isSelf = authUser?.employee_code === employee.employeeId;
    const isAdmin = authUser?.role_level === 'SUPER_ADMIN';
    const disableSelf = isGradingLocked || (!isSelf && !isAdmin);
    const disableSupervisor = isGradingLocked || (isSelf && !isAdmin);

    return (
        <div className="grading-modal-overlay" onClick={onClose}>
            <div className="grading-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="grading-modal-header">
                    <div className="grading-modal-title">
                        <h3>
                            <i className="fas fa-star-half-alt"></i> Chấm điểm
                        </h3>
                        <div className="grading-modal-employee-info">
                            <span className="employee-name">{employee.ho_va_ten}</span>
                            <span className="employee-code">{employee.employeeId}</span>
                        </div>
                    </div>
                    <button className="grading-modal-close" onClick={onClose} aria-label="Đóng">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="grading-modal-body">
                    {loading ? (
                        <div className="grading-modal-loading">
                            <i className="fas fa-spinner fa-spin"></i> Đang tải...
                        </div>
                    ) : (
                        <>
                            <div className="grading-modal-controls">
                                <div className="grading-month-selector">
                                    <label>Tháng đánh giá:</label>
                                    <input
                                        type="month"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="form-control"
                                    />
                                </div>
                                <div className="grading-template-badge">
                                    <span className="badge badge-info">
                                        {employee.score_template_code || 'NVTT'}
                                    </span>
                                </div>
                            </div>

                            {isMobile ? (
                                <div className="grading-mobile-list">
                                    {getCriteria(employee.gradeTemplateCode).map(section => (
                                        <div key={section.section} className="grading-mobile-section">
                                            <div className={`grading-mobile-section-header section-${section.section === 'A' ? 'negative' : section.section === 'B' ? 'positive' : 'bonus'}`}>
                                                <span>Phần {section.section}: {
                                                    section.section === 'A' ? 'Điểm trừ' :
                                                        section.section === 'B' ? 'Điểm đạt' : 'Điểm cộng'
                                                }</span>
                                                <div className="section-scores-group">
                                                    <span className="section-score self">Tự: {section.section === 'A' ? selfTotals.scoreA : section.section === 'B' ? selfTotals.scoreB : selfTotals.scoreC}</span>
                                                    <span className="section-score supervisor">QL: {section.section === 'A' ? supervisorTotals.scoreA : section.section === 'B' ? supervisorTotals.scoreB : supervisorTotals.scoreC}</span>
                                                </div>
                                            </div>
                                            {section.items.map(item => (
                                                <div key={item.id} className={`grading-mobile-card ${item.isHeader ? 'is-header' : ''}`}>
                                                    <div className="card-header-row">
                                                        <span className="card-title">{item.id} {item.title}</span>
                                                        <span className="card-max">{item.isHeader ? `Max: ${item.maxScore}` : `Khoảng: ${item.range}`}</span>
                                                    </div>

                                                    {!item.isHeader && (
                                                        <div className="card-inputs">
                                                            <div className="input-group">
                                                                <label>Tôi ĐG</label>
                                                                <input
                                                                    type="number"
                                                                    className="grading-input"
                                                                    value={selfAssessment[item.id] || ''}
                                                                    onChange={(e) => handleSelfInput(item.id, e.target.value, item)}
                                                                    disabled={disableSelf}
                                                                    min="0"
                                                                />
                                                            </div>
                                                            <div className="input-group">
                                                                <label>QL ĐG</label>
                                                                <input
                                                                    type="number"
                                                                    className="grading-input"
                                                                    value={supervisorAssessment[item.id] || ''}
                                                                    onChange={(e) => handleSupervisorInput(item.id, e.target.value, item)}
                                                                    disabled={disableSupervisor}
                                                                    min="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="grading-table-wrapper">
                                        <table className="grading-table">
                                            <thead>
                                                <tr>
                                                    <th>Tiêu chí đánh giá</th>
                                                    <th className="text-center">Max</th>
                                                    <th className="text-center col-self">Tự ĐG</th>
                                                    <th className="text-center col-supervisor">QL ĐG</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Section A */}
                                                <tr className="grading-section-header section-negative">
                                                    <td>A. KHUNG ĐIỂM TRỪ [20 - Điểm trừ]</td>
                                                    <td className="text-center">20</td>
                                                    <td className="text-center text-danger font-weight-bold col-self">{selfTotals.scoreA}</td>
                                                    <td className="text-center text-danger font-weight-bold col-supervisor">{supervisorTotals.scoreA}</td>
                                                </tr>
                                                {getCriteria(employee.gradeTemplateCode).find(c => c.section === 'A')?.items.map(item => (
                                                    <tr key={item.id} className={item.isHeader ? 'grading-group-header' : 'grading-item-row'}>
                                                        <td className={item.isHeader ? 'pl-2' : 'pl-4'}>
                                                            {item.id} {item.title}
                                                        </td>
                                                        <td className="text-center">{item.isHeader ? item.maxScore : item.range}</td>
                                                        <td className="text-center col-self">
                                                            {!item.isHeader && (
                                                                <input
                                                                    type="number"
                                                                    className="grading-input"
                                                                    value={selfAssessment[item.id] || ''}
                                                                    onChange={(e) => handleSelfInput(item.id, e.target.value, item)}
                                                                    disabled={disableSelf}
                                                                    min="0"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="text-center col-supervisor">
                                                            {!item.isHeader && (
                                                                <input
                                                                    type="number"
                                                                    className="grading-input"
                                                                    value={supervisorAssessment[item.id] || ''}
                                                                    onChange={(e) => handleSupervisorInput(item.id, e.target.value, item)}
                                                                    disabled={disableSupervisor}
                                                                    min="0"
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Section B */}
                                                <tr className="grading-section-header section-positive">
                                                    <td>B. KHUNG ĐIỂM ĐẠT</td>
                                                    <td className="text-center">80</td>
                                                    <td className="text-center text-success font-weight-bold col-self">{selfTotals.scoreB}</td>
                                                    <td className="text-center text-success font-weight-bold col-supervisor">{supervisorTotals.scoreB}</td>
                                                </tr>
                                                {getCriteria(employee.gradeTemplateCode).find(c => c.section === 'B')?.items.map(item => (
                                                    <tr key={item.id} className={item.isHeader ? 'grading-group-header' : 'grading-item-row'}>
                                                        <td className={item.isHeader ? 'pl-2' : 'pl-4'}>
                                                            {item.id.length > 5 ? `${item.id.split('.').slice(1).join('.')} ${item.title}` : `${item.id} ${item.title}`}
                                                        </td>
                                                        <td className="text-center">{item.isHeader ? item.maxScore : item.range}</td>
                                                        <td className="text-center col-self">
                                                            {!item.isHeader && (
                                                                <input
                                                                    type="number"
                                                                    className="grading-input"
                                                                    value={selfAssessment[item.id] || ''}
                                                                    onChange={(e) => handleSelfInput(item.id, e.target.value, item)}
                                                                    disabled={disableSelf}
                                                                    min="0"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="text-center col-supervisor">
                                                            {!item.isHeader && (
                                                                <input
                                                                    type="number"
                                                                    className="grading-input"
                                                                    value={supervisorAssessment[item.id] || ''}
                                                                    onChange={(e) => handleSupervisorInput(item.id, e.target.value, item)}
                                                                    disabled={disableSupervisor}
                                                                    min="0"
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}

                                                {/* Section C */}
                                                <tr className="grading-section-header section-bonus">
                                                    <td>C. KHUNG ĐIỂM CỘNG</td>
                                                    <td className="text-center">15</td>
                                                    <td className="text-center text-primary font-weight-bold col-self">{selfTotals.scoreC}</td>
                                                    <td className="text-center text-primary font-weight-bold col-supervisor">{supervisorTotals.scoreC}</td>
                                                </tr>
                                                {getCriteria(employee.gradeTemplateCode).find(c => c.section === 'C')?.items.map(item => (
                                                    <tr key={item.id} className="grading-item-row">
                                                        <td className="pl-2">
                                                            {item.id} {item.title}
                                                        </td>
                                                        <td className="text-center">{item.range}</td>
                                                        <td className="text-center col-self">
                                                            <input
                                                                type="number"
                                                                className="grading-input"
                                                                value={selfAssessment[item.id] || ''}
                                                                onChange={(e) => handleSelfInput(item.id, e.target.value, item)}
                                                                disabled={disableSelf}
                                                                min="0"
                                                            />
                                                        </td>
                                                        <td className="text-center col-supervisor">
                                                            <input
                                                                type="number"
                                                                className="grading-input"
                                                                value={supervisorAssessment[item.id] || ''}
                                                                onChange={(e) => handleSupervisorInput(item.id, e.target.value, item)}
                                                                disabled={disableSupervisor}
                                                                min="0"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Summary */}
                            {isMobile ? (
                                <div className="grading-mobile-summary-card">
                                    <h3>Kết quả đánh giá</h3>
                                    <div className="summary-result-grid">
                                        <div className="result-item self">
                                            <span className="label">Bạn tự chấm</span>
                                            <span className="score">{selfTotals.total}</span>
                                            <span className={`grade-badge grade-${selfGrade.toLowerCase()}`}>{selfGrade}</span>
                                        </div>
                                        <div className="result-item supervisor">
                                            <span className="label">Quản lý chấm</span>
                                            <span className="score">{supervisorTotals.total}</span>
                                            <span className={`grade-badge grade-${supervisorGrade.toLowerCase()}`}>{supervisorGrade}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grading-summary">
                                    <table className="grading-summary-table">
                                        <thead>
                                            <tr>
                                                <th>Tiêu chí tổng hợp</th>
                                                <th className="text-center">Tự ĐG</th>
                                                <th className="text-center">Quản lý ĐG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Tổng điểm</td>
                                                <td className="text-center font-weight-bold text-primary">{selfTotals.total}</td>
                                                <td className="text-center font-weight-bold text-primary">{supervisorTotals.total}</td>
                                            </tr>
                                            <tr>
                                                <td>Xếp loại</td>
                                                <td className="text-center">
                                                    <span className={`badge badge-${['A', 'A1'].includes(selfGrade) ? 'success' : selfGrade === 'B' ? 'primary' : 'warning'}`}>
                                                        {selfGrade}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge badge-${['A', 'A1'].includes(supervisorGrade) ? 'success' : supervisorGrade === 'B' ? 'primary' : 'warning'}`}>
                                                        {supervisorGrade}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Comments */}
                            <div className="grading-comments">
                                <div className="grading-comment-group">
                                    <label>Giải trình / Ý kiến nhân viên:</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={selfComment}
                                        onChange={e => setSelfComment(e.target.value)}
                                        disabled={disableSelf}
                                        placeholder="Nhập ý kiến của bạn..."
                                    />
                                </div>
                                <div className="grading-comment-group">
                                    <label>Ý kiến quản lý:</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={supervisorComment}
                                        onChange={e => setSupervisorComment(e.target.value)}
                                        disabled={disableSupervisor}
                                        placeholder="Nhập ý kiến quản lý..."
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="grading-modal-footer">
                    {isGradingLocked ? (
                        <button className="btn-premium-outline" onClick={() => setIsGradingLocked(false)}>
                            <i className="fas fa-pencil-alt"></i> Sửa
                        </button>
                    ) : (
                        <>
                            <button className="btn-premium-outline" onClick={onClose}>
                                <i className="fas fa-times"></i> Hủy
                            </button>
                            <button className="btn-premium" onClick={handleGradingSave}>
                                <i className="fas fa-check"></i> Lưu
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GradingModal;
