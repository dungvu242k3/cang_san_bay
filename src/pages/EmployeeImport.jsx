import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import './EmployeeImport.css'

function EmployeeImport() {
    const { user } = useAuth()
    const [file, setFile] = useState(null)
    const [sheets, setSheets] = useState([])
    const [selectedSheet, setSelectedSheet] = useState('')
    const [previewData, setPreviewData] = useState([])
    const [errors, setErrors] = useState([])
    const [isDryRun, setIsDryRun] = useState(true)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState(null)
    const fileInputRef = useRef(null)

    // Chỉ yêu cầu: Mã NV + Tên (hoặc Họ tên đầy đủ). Email không bắt buộc.
    const requiredFields = ['employee_code', 'department']

    // Helper: Convert Excel date (serial or string) to YYYY-MM-DD
    const processExcelDate = (value) => {
        if (!value) return null
        // If it's a JS Date object
        if (value instanceof Date) {
            return value.toISOString().split('T')[0]
        }
        // If it's a number (Excel serial date)
        if (typeof value === 'number') {
            // Excel starts from 1900-01-01 (approx 25569 days before 1970-01-01)
            // Adjust for leap year bug in Excel 1900 if needed, usually this formula works for modern files
            const date = new Date(Math.round((value - 25569) * 86400 * 1000))
            return !isNaN(date) ? date.toISOString().split('T')[0] : null
        }
        // If it's a string
        if (typeof value === 'string') {
            const trimmed = value.trim()
            if (!trimmed) return null
            // Check DD/MM/YYYY
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
                const [d, m, y] = trimmed.split('/')
                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
            }
            // Check YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
        }
        return null
    }

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return

        if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
            alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)')
            return
        }

        setFile(selectedFile)
        setSheets([])
        setSelectedSheet('')
        setPreviewData([])
        setErrors([])
        setImportResult(null)

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const workbook = XLSX.read(event.target.result, { type: 'binary' })
                const sheetNames = workbook.SheetNames
                setSheets(sheetNames)
                if (sheetNames.length > 0) {
                    setSelectedSheet(sheetNames[0])
                    parseSheet(workbook.Sheets[sheetNames[0]], sheetNames[0])
                }
            } catch (err) {
                console.error('Error reading file:', err)
                alert('Lỗi đọc file Excel: ' + err.message)
            }
        }
        reader.readAsBinaryString(selectedFile)
    }

    const handleSheetChange = (e) => {
        const sheetName = e.target.value
        setSelectedSheet(sheetName)
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const workbook = XLSX.read(event.target.result, { type: 'binary' })
                parseSheet(workbook.Sheets[sheetName], sheetName)
            }
            reader.readAsBinaryString(file)
        }
    }

    const parseSheet = (worksheet, sheetName) => {
        try {
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
            if (jsonData.length < 2) {
                setErrors([{ row: 0, message: 'File không có dữ liệu hoặc thiếu header' }])
                setPreviewData([])
                return
            }

            // First row is header
            // Normalize headers: lowercase, remove extra spaces
            const headers = jsonData[0].map(h => (h || '').toString().trim().toLowerCase().replace(/\s+/g, ' '))
            const dataRows = jsonData.slice(1)

            // Extended Header Map for Real Data
            const headerMap = {
                // Identity
                'mã nhân viên': 'employee_code',
                'mã nv': 'employee_code',
                'employee_code': 'employee_code',
                'họ tên': 'full_name',
                'họ và tên': 'full_name',
                'họ': 'last_name',
                'tên': 'first_name',
                'ngày tháng năm sinh': 'date_of_birth',
                'ngày sinh': 'date_of_birth',
                'giới tính': 'gender',
                'dân tộc': 'ethnicity',
                'tôn giáo': 'religion',
                'số cccd': 'identity_card_number',
                'cmnd/cccd': 'identity_card_number',
                'ngày cấp cccd': 'identity_card_issue_date',
                'ngày cấp': 'identity_card_issue_date',
                'nơi cấp cccd': 'identity_card_issue_place',
                'nơi cấp': 'identity_card_issue_place',
                'nơi sinh': 'place_of_birth',
                'quê quán': 'hometown',

                // Contact
                'email acv': 'email_acv',
                'email doanh nghiệp': 'email_acv',
                'email': 'email_personal', // If "Email ACV" exists, "Email" is personal
                'số điện thoại': 'phone',
                'sđt': 'phone',
                'hộ khẩu': 'permanent_address',
                'hộ khẩu thường trú': 'permanent_address',
                'địa chỉ': 'temporary_address',
                'địa chỉ liên hệ': 'temporary_address',

                // Job & System
                'phòng ban': 'department',
                'phòng/ban': 'department',
                'đội': 'team',
                'tổ/đội': 'team',
                'chức danh đầy đủ': 'job_title',
                'chức danh': 'job_title',
                'chức vụ/chức danh chính quyền': 'current_position',
                'vị trí': 'job_position',
                'vị trí công việc': 'job_position',
                'ngày vào làm việc tại tct': 'join_date',
                'ngày vào làm': 'join_date',
                'ngày chính thức': 'official_date',

                // Insurance & Party
                'mã số bhxh': 'social_insurance_number',
                'mã số thẻ bhyt': 'health_insurance_number',
                'chức vụ đảng': 'party_position',
                'số thẻ đảng': 'party_card_number',
                'ngày kết nạp': 'party_join_date',
                'ngày chính thức đảng': 'party_official_date', // Ngày chính thức trong Đảng
                'lý luận chính trị': 'political_education_level',

                // Salary (Basic) & Contracts
                'ngạch lương cdcb': 'salary_scale',
                'bậc lương cdcb': 'salary_level',
                'hệ số cdcb': 'salary_coefficient',
                'mức lương': 'basic_salary',
                'tổng lương đóng bhxh': 'social_insurance_salary',
                // Contracts
                'số hđlđ': 'contract_number',
                'số hợp đồng': 'contract_number',
                'loại hđlđ': 'contract_type',
                'loại hợp đồng': 'contract_type',
                'thời gian ký': 'contract_signed_date',
                'ngày ký': 'contract_signed_date',
                'thời hạn đến': 'contract_expiration_date',
                'ngày hết hạn': 'contract_expiration_date',

                // Bank Accounts
                'số tk ngân hàng': 'bank_account_number',
                'số tài khoản': 'bank_account_number',
                'stk': 'bank_account_number',
                'mở tại': 'bank_name',
                'ngân hàng': 'bank_name',

                // Advanced Job & Allowances (Mapped to 'note' or specific tables later if available)
                'phụ cấp lương': 'allowance_salary',
                'phụ cấp pccc + atvslđ': 'allowance_pccc_atvsld',
                'thời gian tính nâng bậc lương kế tiếp': 'next_salary_raise_date',
                'thời gian xét thâm niên vượt khung': 'seniority_review_date',
                'ngạch lương hqcv': 'hqcv_scale',
                'hệ số hqcv': 'hqcv_coefficient',
                'mức lương hqcv': 'hqcv_salary',
                'thời gian áp dụng hqcv': 'hqcv_effective_date',
                'số người phụ thuộc': 'number_of_dependents',
                'phụ cấp atvsv (% lương ttv)': 'allowance_atvsv_percent',
                'phụ cấp pccc\n(% lương ttv)': 'allowance_pccc_percent',
                'pc chức vụ': 'allowance_position',
                'thâm niên vk (% lương cdcb)': 'allowance_seniority_vk_percent',
                'phụ cấp lương cấp tổ/ca ((% lương cdcb)': 'allowance_team_percent',
                'các khoản bổ sung': 'additional_income',
                'ngày bắt đầu độc hại': 'toxic_date_start',
                'điều kiện lao động': 'labor_condition',
                'mức hưởng độc hại': 'toxic_level',
                'số tiền/công độc hại': 'toxic_amount_per_shift',
                'thời điểm đơn vị bắt đầu đóng bhxh': 'social_insurance_start_date',
                'thời điểm đơn vị kết thúc đóng bhxh': 'social_insurance_end_date',

                // Education & Skills (Map to Note)
                'trình độ chuyên môn': 'education_qualification',
                'bằng cấp chứng chỉ': 'certificates',
                'ngoại ngữ': 'foreign_language',
                'tin học': 'computer_skill',

                // Config & Misc
                'trạng thái': 'status',
                'mã template điểm': 'score_template_code',
                'ghi chú': 'note'
            }

            const validatedData = []
            const validationErrors = []

            dataRows.forEach((row, index) => {
                const rowNum = index + 2
                const rowData = {}
                const rowErrors = []

                // Skip completely empty rows
                const hasAnyData = row.some(cell => cell && cell.toString().trim() !== '')
                if (!hasAnyData) return

                // Map row data FIRST to check for employee_code
                headers.forEach((header, colIndex) => {
                    const dbField = headerMap[header]
                    if (dbField) {
                        let val = row[colIndex]
                        rowData[dbField] = val !== undefined ? val : ''
                    }
                })

                // Skip rows without employee_code (header rows, sub-headers, etc.)
                if (!rowData.employee_code || rowData.employee_code.toString().trim() === '') {
                    return // Bỏ qua dòng không có Mã NV
                }

                // Skip rows where employee_code is just a small number (like 1, 2, 3... - header STT)
                const codeVal = rowData.employee_code.toString().trim()
                if (/^\d{1,2}$/.test(codeVal) && parseInt(codeVal) < 100) {
                    return // Bỏ qua dòng có Mã NV là số nhỏ (header STT)
                }

                // Re-map with proper date handling
                rowData._mapped = true

                // Map row data
                headers.forEach((header, colIndex) => {
                    const dbField = headerMap[header]
                    if (dbField) {
                        let val = row[colIndex]
                        // Handle Date conversions - Add contract dates & toxic dates
                        if (['date_of_birth', 'join_date', 'official_date', 'identity_card_issue_date',
                            'party_join_date', 'party_official_date', 'contract_signed_date',
                            'contract_expiration_date', 'toxic_date_start', 'social_insurance_start_date',
                            'social_insurance_end_date', 'next_salary_raise_date', 'seniority_review_date',
                            'hqcv_effective_date'].includes(dbField)) {
                            val = processExcelDate(val)
                        }
                        rowData[dbField] = val !== undefined ? val : ''
                    }
                })

                // Logic: Name Splitting
                if (rowData.full_name && (!rowData.last_name || !rowData.first_name)) {
                    const parts = rowData.full_name.toString().trim().split(' ')
                    rowData.first_name = parts.pop()
                    rowData.last_name = parts.join(' ')
                }

                // Defaults
                if (!rowData.status) rowData.status = 'Đang làm việc'
                if (!rowData.score_template_code) rowData.score_template_code = 'NVTT'
                if (rowData.party_position || rowData.party_card_number) rowData.is_party_member = true

                // Validate required
                requiredFields.forEach(field => {
                    let hasValue = false
                    if (field === 'last_name' || field === 'first_name') {
                        // Accept if full_name parsed correctly
                        hasValue = rowData.first_name || rowData.last_name
                    } else {
                        hasValue = rowData[field] && rowData[field].toString().trim() !== ''
                    }

                    if (!hasValue) {
                        rowErrors.push({
                            row: rowNum,
                            field: field,
                            message: `Thiếu ${field} (hoặc lấy từ họ tên)`
                        })
                    }
                })

                // Validate Employee Code - Không kiểm tra gì, chấp nhận mọi format

                if (rowErrors.length > 0) {
                    // Treat warnings carefully. For now, push all errors.
                    validationErrors.push(...rowErrors)
                } else {
                    validatedData.push({ ...rowData, _rowNum: rowNum })
                }
            })

            setPreviewData(validatedData)
            setErrors(validationErrors)
        } catch (err) {
            console.error('Error parsing sheet:', err)
            setErrors([{ row: 0, message: 'Lỗi đọc dữ liệu: ' + err.message }])
            setPreviewData([])
        }
    }

    const handleDryRun = () => {
        setIsDryRun(true)
        // Validation already done in parseSheet
    }

    const handleImport = async () => {
        if (errors.length > 0) {
            alert('Vui lòng sửa các lỗi trước khi import!')
            return
        }

        if (previewData.length === 0) {
            alert('Không có dữ liệu hợp lệ để import!')
            return
        }

        if (!window.confirm(`Bạn có chắc chắn muốn import ${previewData.length} nhân viên?`)) {
            return
        }

        try {
            setImporting(true)
            let successCount = 0
            let failCount = 0
            const failDetails = []
            const warningDetails = [] // For sub-table errors

            for (const row of previewData) {
                try {
                    // Prepare data
                    const nameParts = (row.first_name || '').trim().split(' ')
                    const firstName = nameParts.pop() || ''
                    const lastName = (row.last_name || '').trim() + (nameParts.length > 0 ? ' ' + nameParts.join(' ') : '')

                    // Keep original current_position exact value
                    const normalizedPosition = row.current_position?.toString().trim() || null

                    const employeeData = {
                        employee_code: row.employee_code.toString().trim().toUpperCase(),
                        first_name: firstName,
                        last_name: lastName || row.last_name || '',
                        status: row.status?.toString().trim() || 'Đang làm việc',
                        department: row.department?.toString().trim() || null,
                        team: row.team?.toString().trim() || null,
                        score_template_code: row.score_template_code?.toString().trim() || 'NVTT',

                        // Contact & Personal
                        email_acv: row.email_acv?.toString().trim() || null,
                        email_personal: row.email_personal || null,
                        phone: row.phone || null,
                        gender: row.gender || null,
                        date_of_birth: row.date_of_birth || null,
                        ethnicity: row.ethnicity || 'Kinh',
                        religion: row.religion || 'Không',
                        place_of_birth: row.place_of_birth || null,
                        hometown: row.hometown || null,
                        permanent_address: row.permanent_address || null,
                        temporary_address: row.temporary_address || null,

                        // ID & Insurance
                        identity_card_number: row.identity_card_number || null,
                        identity_card_issue_date: row.identity_card_issue_date || null,
                        identity_card_issue_place: row.identity_card_issue_place || null,
                        social_insurance_number: row.social_insurance_number || null,
                        health_insurance_number: row.health_insurance_number || null,

                        // Job & Political
                        job_title: row.job_title || null,
                        current_position: normalizedPosition,
                        job_position: row.job_position || null,
                        join_date: row.join_date || null,
                        official_date: row.official_date || null, // Job official date

                        // Political
                        political_education_level: row.political_education_level || null,
                        is_party_member: row.is_party_member || false,
                        party_position: row.party_position || null,
                        party_card_number: row.party_card_number || null,
                        party_join_date: row.party_join_date || null,
                        party_official_date: row.party_official_date || null,
                        note: row.note || null
                    }

                    // Append extended info to note if columns don't exist in DB yet
                    const extendedInfo = [
                        row.allowance_salary ? `Phụ cấp lương: ${row.allowance_salary}` : null,
                        row.allowance_pccc_atvsld ? `PC PCCC+ATVSLĐ: ${row.allowance_pccc_atvsld}` : null,
                        row.next_salary_raise_date ? `Nâng bậc lương tiếp: ${row.next_salary_raise_date}` : null,
                        row.toxic_level ? `Độc hại: ${row.toxic_level}` : null,
                        row.additional_income ? `Các khoản NS: ${row.additional_income}` : null
                    ].filter(Boolean).join('. ');

                    if (extendedInfo) {
                        employeeData.note = (employeeData.note ? employeeData.note + '. ' : '') + extendedInfo
                    }

                    // Insert employee (ignore if already exists)
                    const { error: insertError } = await supabase
                        .from('employee_profiles')
                        .insert([employeeData], { onConflict: 'ignore' })

                    if (insertError) {
                        // If duplicate key error, skip to related tables
                        if (insertError.code === '23505') {
                            console.log(`Employee ${employeeData.employee_code} already exists, skipping...`)
                        } else {
                            throw insertError
                        }
                    }

                    // Insert Salary (If data exists) - ignore errors
                    if (row.salary_scale || row.salary_coefficient || row.basic_salary || row.number_of_dependents) {
                        try {
                            const salaryPayload = {
                                employee_code: employeeData.employee_code,
                                salary_scale: row.salary_scale || null,
                                salary_level: row.salary_level || null,
                                salary_coefficient: row.salary_coefficient?.toString().replace(',', '.') || null,
                                basic_salary: row.basic_salary?.toString().replace(/\D/g, '') || 0,
                                social_insurance_salary: row.social_insurance_salary?.toString().replace(/\D/g, '') || 0,
                                number_of_dependents: parseInt(row.number_of_dependents) || 0,
                                effective_date: row.join_date || row.official_date || new Date().toISOString().split('T')[0],
                                is_active: true,
                                note: 'Import từ Excel'
                            }
                            await supabase.from('employee_salaries').insert([salaryPayload])
                        } catch (e) {
                            warningDetails.push({
                                row: row._rowNum,
                                employee_code: row.employee_code,
                                message: `Lỗi Salary: ${e.message}`
                            })
                        }
                    }

                    // Insert Bank Account (If data exists)
                    if (row.bank_account_number) {
                        try {
                            const bankPayload = {
                                employee_code: employeeData.employee_code,
                                bank_name: row.bank_name || null,
                                account_number: row.bank_account_number?.toString().trim(),
                                account_name: row.full_name || (employeeData.last_name + ' ' + employeeData.first_name).toUpperCase(),
                                note: 'Import từ Excel'
                            }
                            await supabase.from('employee_bank_accounts').insert([bankPayload])
                        } catch (e) {
                            warningDetails.push({
                                row: row._rowNum,
                                employee_code: row.employee_code,
                                message: `Lỗi Bank: ${e.message}`
                            })
                        }
                    }

                    // Insert Labor Contract (If data exists)
                    if (row.contract_number) {
                        try {
                            const contractPayload = {
                                employee_code: employeeData.employee_code,
                                contract_number: row.contract_number?.toString().trim(),
                                contract_type: row.contract_type || null, // Remove default 'Khai báo Import'
                                signed_date: row.contract_signed_date || employeeData.join_date || null,
                                effective_date: row.contract_signed_date || employeeData.join_date || null,
                                expiration_date: row.contract_expiration_date || null,
                                note: 'Import từ Excel'
                            }
                            await supabase.from('labor_contracts').insert([contractPayload])
                        } catch (e) {
                            warningDetails.push({
                                row: row._rowNum,
                                employee_code: row.employee_code,
                                message: `Lỗi Contract: ${e.message}`
                            })
                        }
                    }

                    // Insert Certificates / Knowledge (Skills)
                    const certsToInsert = []

                    if (row.education_qualification) {
                        certsToInsert.push({
                            employee_code: employeeData.employee_code,
                            certificate_name: 'Trình độ chuyên môn',
                            level: row.education_qualification,
                            note: 'Import từ Excel'
                        })
                    }
                    if (row.certificates) {
                        certsToInsert.push({
                            employee_code: employeeData.employee_code,
                            certificate_name: 'Bằng cấp/Chứng chỉ',
                            level: row.certificates,
                            note: 'Import từ Excel'
                        })
                    }
                    if (row.foreign_language) {
                        certsToInsert.push({
                            employee_code: employeeData.employee_code,
                            certificate_name: 'Ngoại ngữ',
                            level: row.foreign_language,
                            note: 'Import từ Excel'
                        })
                    }
                    if (row.computer_skill) {
                        certsToInsert.push({
                            employee_code: employeeData.employee_code,
                            certificate_name: 'Tin học',
                            level: row.computer_skill,
                            note: 'Import từ Excel'
                        })
                    }

                    if (certsToInsert.length > 0) {
                        await supabase.from('employee_certificates').insert(certsToInsert)
                    }

                    successCount++
                } catch (err) {
                    failCount++
                    failDetails.push({
                        row: row._rowNum,
                        employee_code: row.employee_code,
                        message: err.message || 'Lỗi không xác định'
                    })
                }
            }

            // Log import audit
            try {
                await supabase.from('import_audit').insert([{
                    import_type: 'EMPLOYEES',
                    imported_by: user?.employee_code || 'SYSTEM',
                    total_records: previewData.length,
                    success_count: successCount,
                    fail_count: failCount,
                    details: JSON.stringify([...failDetails, ...warningDetails])
                }])
            } catch (auditError) {
                console.warn('Could not log audit:', auditError)
            }

            setImportResult({
                total: previewData.length,
                success: successCount,
                fail: failCount,
                details: [...failDetails, ...warningDetails] // Include warnings in display
            })

            const warnMsg = warningDetails.length > 0 ? `\n(Có ${warningDetails.length} cảnh báo lỗi dữ liệu phụ)` : ''
            alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${failCount}${warnMsg}`)
        } catch (err) {
            console.error('Import error:', err)
            alert('Lỗi import: ' + err.message)
        } finally {
            setImporting(false)
        }
    }

    return (
        <div className="employee-import-page">
            <div className="page-header">
                <h1><i className="fas fa-file-import"></i> Import nhân viên</h1>
                <p>Import dữ liệu nhân viên từ file Excel</p>
            </div>

            <div className="import-container">
                {/* File Selection */}
                <div className="import-section">
                    <h3>1. Chọn file Excel</h3>
                    <div className="file-selector">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn-select-file"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <i className="fas fa-folder-open"></i> Chọn file Excel
                        </button>
                        {file && (
                            <div className="file-info">
                                <i className="fas fa-file-excel"></i>
                                <span>{file.name}</span>
                                <button
                                    className="btn-remove-file"
                                    onClick={() => {
                                        setFile(null)
                                        setSheets([])
                                        setSelectedSheet('')
                                        setPreviewData([])
                                        setErrors([])
                                        setImportResult(null)
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {sheets.length > 0 && (
                        <div className="sheet-selector">
                            <label>Chọn sheet:</label>
                            <select value={selectedSheet} onChange={handleSheetChange}>
                                {sheets.map(sheet => (
                                    <option key={sheet} value={sheet}>{sheet}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Validation Results */}
                {errors.length > 0 && (
                    <div className="import-section">
                        <h3>
                            <i className="fas fa-exclamation-triangle"></i> Lỗi validation ({errors.length})
                        </h3>
                        <div className="errors-container">
                            <table className="errors-table">
                                <thead>
                                    <tr>
                                        <th>Dòng</th>
                                        <th>Cột</th>
                                        <th>Trường</th>
                                        <th>Lỗi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {errors.map((error, index) => (
                                        <tr key={index}>
                                            <td>{error.row}</td>
                                            <td>{error.column ? `Cột ${error.column}` : '-'}</td>
                                            <td>{error.field || '-'}</td>
                                            <td className="error-message">{error.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Preview Data */}
                {previewData.length > 0 && (
                    <div className="import-section">
                        <h3>
                            <i className="fas fa-eye"></i> Xem trước dữ liệu ({previewData.length} bản ghi hợp lệ)
                        </h3>
                        <div className="preview-container">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>Dòng</th>
                                        <th>Mã NV</th>
                                        <th>Họ tên</th>
                                        <th>Chức vụ hiện tại</th>
                                        <th>Email</th>
                                        <th>Phòng ban</th>
                                        <th>Trạng thái</th>
                                        <th>Template</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 500).map((row, index) => (
                                        <tr key={index}>
                                            <td>{row._rowNum}</td>
                                            <td>{row.employee_code}</td>
                                            <td>{row.last_name} {row.first_name}</td>
                                            <td>{row.current_position || ''}</td>
                                            <td>{row.email_acv}</td>
                                            <td>{row.department}</td>
                                            <td>{row.status}</td>
                                            <td>{row.score_template_code}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 500 && (
                                <p className="preview-note">
                                    Hiển thị 500 dòng đầu tiên. Tổng cộng {previewData.length} dòng hợp lệ.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Import Result */}
                {importResult && (
                    <div className="import-section">
                        <h3>
                            <i className="fas fa-check-circle"></i> Kết quả import
                        </h3>
                        <div className="result-summary">
                            <div className="result-item success">
                                <i className="fas fa-check"></i>
                                <span>Thành công: {importResult.success}</span>
                            </div>
                            <div className="result-item fail">
                                <i className="fas fa-times"></i>
                                <span>Thất bại: {importResult.fail}</span>
                            </div>
                            <div className="result-item total">
                                <i className="fas fa-list"></i>
                                <span>Tổng: {importResult.total}</span>
                            </div>
                        </div>
                        {importResult.details.length > 0 && (
                            <div className="fail-details">
                                <h4>Chi tiết lỗi:</h4>
                                <table className="errors-table">
                                    <thead>
                                        <tr>
                                            <th>Dòng</th>
                                            <th>Mã NV</th>
                                            <th>Lý do</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResult.details.map((detail, index) => (
                                            <tr key={index}>
                                                <td>{detail.row}</td>
                                                <td>{detail.employee_code}</td>
                                                <td className="error-message">{detail.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="import-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={handleDryRun}
                        disabled={!file || previewData.length === 0}
                    >
                        <i className="fas fa-search"></i> Kiểm tra lại (Dry-run)
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleImport}
                        disabled={!file || errors.length > 0 || previewData.length === 0 || importing}
                    >
                        {importing ? (
                            <>
                                <div className="spinner-small"></div>
                                <span>Đang import...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload"></i> Import dữ liệu
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmployeeImport
