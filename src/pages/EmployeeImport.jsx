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

    // Helper: Parse family member info from structured text block
    const parseFamilyInfo = (textValue) => {
        if (!textValue || typeof textValue !== 'string') return null
        const text = textValue.trim()
        if (!text || text === 'Không' || text === 'Không có' || text.length < 5) return null

        const result = { 
            first_name: '', 
            last_name: '', 
            date_of_birth: null, 
            is_dependent: false, 
            occupation: '', 
            current_residence: '', 
            phone: '', 
            identity_card_number: '', 
            note: '' 
        }
        const notes = []

        const nameMatch = text.match(/Họ\s*(?:và|&)*\s*tên[:\s]+([^\n\r–\-]+)/i)
        if (nameMatch) {
            const fullName = nameMatch[1].trim()
            const parts = fullName.split(' ')
            result.first_name = parts.pop() || ''
            result.last_name = parts.join(' ') || ''
        }
 
        const dobMatch = text.match(/(?:Ngày[\/.\s]*tháng[\/.\s]*năm\s*sinh|Ngày\s*sinh)[:\s]+(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/i)
        if (dobMatch) {
            result.date_of_birth = processExcelDate(dobMatch[1].trim())
        }
 
        const jobMatch = text.match(/Nghề\s*nghiệp[^:]*[:\s]+([^\n\r]+)/i)
        if (jobMatch) result.occupation = jobMatch[1].trim().replace(/^–\s*|–\s*$/, '')
 
        const addressMatch = text.match(/Nơi\s*ở[:\s]+([^\n\r]+)/i)
        if (addressMatch) result.current_residence = addressMatch[1].trim()
 
        const phoneMatch = text.match(/(?:Số điện thoại|SĐT|Điện thoại)[:\s]+([\d\s.]{9,15})/i)
        if (phoneMatch) result.phone = phoneMatch[1].trim().replace(/[\s.]/g, '')
 
        const cccdMatch = text.match(/(?:CCCD|Số CCCD|CMND|Số CMND|Định danh|Số định danh)[:\s]+(\d{9,12})/i)
        if (cccdMatch) result.identity_card_number = cccdMatch[1].trim()
 
        const nptMatch = text.match(/(?:NPT|Người phụ thuộc)[^?]*\?\s*(Có|Không)/i) || text.match(/(?:NPT|Người phụ thuộc)[:\s]+(Có|Không)/i)
        if (nptMatch) result.is_dependent = nptMatch[1].trim().toLowerCase() === 'có'

        // Keep rest in note if any extra info? For now, we manually handle these 4 main fields.
        return (result.first_name || result.last_name) ? result : null
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
                'dấu thời gian': '_timestamp',
                'mã nhân viên': 'employee_code',
                'mã nv': 'employee_code',
                'mail acv ( nếu có)': 'email_acv',
                'mail acv': 'email_acv',
                'email acv': 'email_acv',
                'địa chỉ email': 'email_personal',
                'họ, chữ đệm ( viết hoa, in đậm)': 'last_name',
                'họ, chữ đệm (viết hoa, in đậm)': 'last_name',
                'họ, chữ đệm': 'last_name',
                'tên ( viết hoa, in đậm)': 'first_name',
                'tên (viết hoa, in đậm)': 'first_name',
                'tên': 'first_name',
                'họ và tên': 'full_name',
                'tên gọi khác (nếu có)': '_other_name',
                'tên gọi khác': '_other_name',
                'ngày/tháng/năm sinh': 'date_of_birth',
                'ngày sinh': 'date_of_birth',
                'nơi sinh': 'place_of_birth',
                'giới tính': 'gender',
                'quốc tịch': 'nationality',
                'dân tộc': 'ethnicity',
                'số định danh cá nhân': 'identity_card_number',
                'số cccd': 'identity_card_number',
                'ngày cấp cccd': 'identity_card_issue_date',
                'nơi cấp cccd': 'identity_card_issue_place',
                'quê quán': 'hometown',
                'nơi đăng ký thường trú': 'permanent_address',
                'số điện thoại': 'phone',
                'sđt': 'phone',
                'địa chỉ liên hệ': 'temporary_address',
                'nơi ở hiện nay': 'current_address',
                'địa chỉ hiện nay': 'current_address',
                'nơi đăng ký tạm trú ( nếu có )': '_temporary_address_reg',
                'nơi đăng ký tạm trú ( nếu có)': '_temporary_address_reg',
                'nơi đăng ký tạm trú': '_temporary_address_reg',
                'trình độ học vấn': '_academic_level',
                'trình độ văn hóa': 'education_level',
                'trình độ văn hoá': 'education_level',
                'học vấn/văn hóa': '_academic_level',
                'phòng ban': 'department',
                'phòng/ban': 'department',
                'đơn vị công tác': 'department',
                'đội': 'team',
                'tổ/đội': 'team',
                'bộ phận': 'team',
                'chức danh đầy đủ': 'job_title',
                'chức danh': 'job_title',
                'chức vụ/chức danh chính quyền': 'current_position',
                'chức vụ': 'current_position',
                'vị trí': 'job_position',
                'vị trí công việc': 'job_position',
                'ngày vào làm việc tại tct': 'join_date',
                'ngày vào làm': 'join_date',
                'ngày qđ tiếp nhận vào acv': 'join_date',
                'ngày chính thức': 'official_date',

                // Insurance & Party
                'mã số bhxh': 'social_insurance_number',
                'số sổ bhxh': 'social_insurance_number',
                'số bhxh': 'social_insurance_number',
                'mã số thẻ bhyt': 'health_insurance_number',
                'chức vụ đảng': 'party_position',
                'số thẻ đảng': 'party_card_number',
                'ngày kết nạp đảng': 'party_join_date',
                'ngày kết nạp': 'party_join_date',
                'ngày chính thức đảng': 'party_official_date',
                'ngày chuyển đảng chính thức': 'party_official_date',
                'lý luận chính trị': 'political_education_level',
                'trình độ lý luận chính trị': 'political_education_level',
                'chức vụ đoàn': 'youth_union_position',
                'chức vụ đoàn thanh niên': 'youth_union_position',
                'chức vụ đoàn thể': 'youth_union_position',

                // Salary (Basic) & Contracts
                'ngạch lương cdcb': 'salary_scale',
                'bậc lương cdcb': 'salary_level',
                'hệ số cdcb': 'salary_coefficient',
                'mức lương': 'basic_salary',
                'tổng lương đóng bhxh': 'social_insurance_salary',
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
                'chi nhánh ngân hàng': 'bank_name',
                'mở tại': 'bank_name',
                'ngân hàng': 'bank_name',

                // Misc
                'số người phụ thuộc': 'number_of_dependents',
                'npt': 'number_of_dependents',
                'trình độ chuyên môn': 'education_qualification',
                'bằng cấp chuyên môn ( nếu có )': 'certificates',
                'bằng cấp chuyên môn': 'certificates',
                'bằng cấp chứng chỉ': 'certificates',
                'ngoại ngữ': 'foreign_language',
                'trình độ tiếng anh': 'foreign_language',
                'tiếng anh': 'foreign_language',
                'trình độ ngoại ngữ': 'foreign_language',
                'tin học': 'computer_skill',
                'trình độ tin học': 'computer_skill',
                'trạng thái': 'status',
                'mã template điểm': 'score_template_code',
                'ghi chú': 'note',

                // Marital status & Family
                'tình trạng hôn nhân': '_marital_status',
                'số con đẻ': '_number_of_children',
                'thông tin bố đẻ': '_family_father',
                'thông tin mẹ đẻ': '_family_mother',
                'thông tin chồng/vợ': '_family_spouse',
                'thông tin bố chồng/vợ': '_family_father_in_law',
                'thông tin mẹ chồng/vợ': '_family_mother_in_law',
                'thông tin con số 1': '_family_child_1',
                'thông tin con số 2': '_family_child_2',
                'thông tin con số 3': '_family_child_3',
                'thông tin con số 4': '_family_child_4',
                'thông tin con số 5': '_family_child_5',
                'thông tin con số 6': '_family_child_6'
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
                        // Handle Date conversions
                        if (['date_of_birth', 'join_date', 'official_date', 'identity_card_issue_date',
                            'party_join_date', 'party_official_date', 'contract_signed_date',
                            'contract_expiration_date', 'toxic_date_start', 'social_insurance_start_date',
                            'social_insurance_end_date', 'next_salary_raise_date', 'seniority_review_date',
                            'hqcv_effective_date'].includes(dbField)) {
                            val = processExcelDate(val)
                        }
                        
                        // Prevent empty column from overwriting existing data for the same dbField
                        if (val !== undefined && val !== null && val.toString().trim() !== '') {
                            rowData[dbField] = val
                        } else if (rowData[dbField] === undefined) {
                            rowData[dbField] = ''
                        }
                    }
                })

                // Logic: Address processing (Direct mapping as requested)
                rowData._current_residence = rowData.current_address || ''

                // Smart Email Detection & Correction
                let email1 = (rowData.email_personal || '').toString().toLowerCase().trim()
                let email2 = (rowData.email_acv || '').toString().toLowerCase().trim()

                // Case 1: email_acv contains a personal domain (gmail, yahoo, etc.) and email_personal is empty
                if (email2 && (email2.endsWith('@gmail.com') || email2.endsWith('@yahoo.com') || email2.endsWith('@outlook.com') || email2.endsWith('@hotmail.com'))) {
                    if (!email1) {
                        rowData.email_personal = rowData.email_acv
                        rowData.email_acv = ''
                    } else if (email1.endsWith('@acv.vn')) {
                        // Swap if they are reversed
                        const tmp = rowData.email_acv
                        rowData.email_acv = rowData.email_personal
                        rowData.email_personal = tmp
                    }
                }
                // Case 2: email_personal contains @acv.vn and email_acv is empty
                else if (email1 && email1.endsWith('@acv.vn') && !email2) {
                    rowData.email_acv = rowData.email_personal
                    rowData.email_personal = ''
                }

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
                        const fieldName = {
                            employee_code: 'Mã NV',
                            department: 'Phòng ban/Đơn vị',
                            last_name: 'Họ',
                            first_name: 'Tên'
                        }[field] || field

                        rowErrors.push({
                            row: rowNum,
                            field: field,
                            message: `Thiếu ${fieldName}${(field === 'last_name' || field === 'first_name') ? ' (hoặc lấy từ họ tên)' : ''}`
                        })
                    }
                })

                // Validate Employee Code - Không kiểm tra gì, chấp nhận mọi format

                // Store everything in previewData to show the table
                validatedData.push({ ...rowData, _rowNum: rowNum, _hasError: rowErrors.length > 0 })
                
                if (rowErrors.length > 0) {
                    validationErrors.push(...rowErrors)
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
                    const maritalMap = { 'độc thân': 1, 'đã kết hôn': 2, 'ly hôn': 3, 'ly thân': 4, 'góa': 5 }
                    const maritalCode = maritalMap[(row._marital_status || '').toString().trim().toLowerCase()] || null

                    const nameParts = (row.first_name || '').trim().split(' ')
                    const firstName = nameParts.pop() || ''
                    const lastName = (row.last_name || '').trim() + (nameParts.length > 0 ? ' ' + nameParts.join(' ') : '')

                    // Education Level Mapping (Academic Level Code)
                    // DB CHECK constraint: ('DH', 'CD', 'TS', 'TC', '12', 'Khác')
                    const academicMap = {
                        'đại học': 'DH',
                        'thạc sĩ': 'TS',
                        'thạc sỹ': 'TS',
                        'tiến sĩ': 'Khác',
                        'tiến sỹ': 'Khác',
                        'cao đẳng': 'CD',
                        'trung cấp': 'TC',
                        'sơ cấp': 'Khác',
                        'phổ thông': '12',
                        '12/12': '12',
                        '12': '12'
                    }
                    const academicValue = (row._academic_level || row.academic_level_code || '').toString().trim().toLowerCase()
                    const academicCode = academicMap[academicValue] || null

                    // Education Level (Cultural - e.g. 12/12)
                    // DB CHECK constraint: ('10/12', '11/12', '12/12', '8/10', '9/10', '10/10', 'Khác')
                    const validEducationLevels = ['10/12', '11/12', '12/12', '8/10', '9/10', '10/10', 'Khác']
                    const rawCultural = row.education_level?.toString().trim() || null
                    const culturalLevel = rawCultural && validEducationLevels.includes(rawCultural) ? rawCultural : null

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
                        temporary_address: row.current_address || row._temporary_address_reg || row.temporary_address || null,

                        // ID & Insurance
                        identity_card_number: row.identity_card_number || null,
                        identity_card_issue_date: row.identity_card_issue_date || null,
                        identity_card_issue_place: row.identity_card_issue_place || null,
                        social_insurance_number: row.social_insurance_number || null,
                        health_insurance_number: row.health_insurance_number || null,

                        // Job & Political
                        current_position: row.current_position || row.job_title || null,
                        job_title: row.job_title || null,
                        join_date: row.join_date || null,
                        official_date: row.official_date || null, // Job official date

                        // Political
                        political_education_level: row.political_education_level || null,
                        is_party_member: row.is_party_member || false,
                        party_position: row.party_position || null,
                        party_card_number: row.party_card_number || null,
                        party_join_date: row.party_join_date || null,
                        nationality: row.nationality || 'Việt Nam',
                        marital_status_code: maritalCode,
                        academic_level_code: academicCode,
                        education_level: culturalLevel,
                        youth_union_position: row.youth_union_position || null,
                        trade_union_position: row.trade_union_position || null,
                        number_of_children: parseInt(row._number_of_children) || 0,
                        note: row.note || null
                    }

                    // Append extended info to note if columns don't exist in DB yet
                    const extendedInfo = [
                        row.education_qualification ? `Chuyên môn: ${row.education_qualification}` : null,
                        row.foreign_language ? `Ngoại ngữ: ${row.foreign_language}` : null,
                        row.computer_skill ? `Tin học: ${row.computer_skill}` : null,
                        row.allowance_salary ? `Phụ cấp lương: ${row.allowance_salary}` : null,
                        row.allowance_pccc_atvsld ? `PC PCCC+ATVSLĐ: ${row.allowance_pccc_atvsld}` : null,
                        row.next_salary_raise_date ? `Nâng bậc lương tiếp: ${row.next_salary_raise_date}` : null,
                        row.toxic_level ? `Độc hại: ${row.toxic_level}` : null,
                        row.additional_income ? `Các khoản NS: ${row.additional_income}` : null
                    ].filter(Boolean).join('. ');

                    if (extendedInfo) {
                        employeeData.note = (employeeData.note ? employeeData.note + '. ' : '') + extendedInfo
                    }

                    // Upsert employee (Update if exists)
                    const { error: upsertError } = await supabase
                        .from('employee_profiles')
                        .upsert([employeeData], { onConflict: 'employee_code' })

                    if (upsertError) {
                        throw upsertError
                    }

                    // For sub-tables, we often want to refresh the data based on Excel
                    // Delete existing records for these specific sub-tables before re-inserting
                    const subTableDeletes = [
                        'family_members',
                        'employee_bank_accounts',
                        'labor_contracts',
                        'employee_certificates'
                    ]

                    for (const table of subTableDeletes) {
                        await supabase.from(table).delete().eq('employee_code', employeeData.employee_code)
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
                    if (row._specialization) {
                        certsToInsert.push({
                            employee_code: employeeData.employee_code,
                            certificate_name: 'Chuyên ngành',
                            level: row._specialization,
                            note: 'Import từ Excel'
                        })
                    }

                    if (certsToInsert.length > 0) {
                        await supabase.from('employee_certificates').insert(certsToInsert)
                    }

                    // Insert Family Members from parsed text blocks
                    // DB CHECK: ('Cha ruột', 'Mẹ ruột', 'Vợ', 'Chồng', 'Con ruột', 'Anh ruột', 'Em ruột', 'Chị ruột', 'Anh vợ', 'Chị vợ', 'Em vợ', 'Khác')
                    const spouseRelationship = (row.gender || '').toString().trim().toLowerCase() === 'nam' ? 'Vợ' : (row.gender || '').toString().trim().toLowerCase() === 'nữ' ? 'Chồng' : 'Khác'
                    const familyConfig = [
                        { field: '_family_father', relationship: 'Cha ruột' },
                        { field: '_family_mother', relationship: 'Mẹ ruột' },
                        { field: '_family_spouse', relationship: spouseRelationship },
                        { field: '_family_father_in_law', relationship: 'Bố vợ/chồng' },
                        { field: '_family_mother_in_law', relationship: 'Mẹ vợ/chồng' },
                        { field: '_family_child_1', relationship: 'Con ruột' },
                        { field: '_family_child_2', relationship: 'Con ruột' },
                        { field: '_family_child_3', relationship: 'Con ruột' },
                        { field: '_family_child_4', relationship: 'Con ruột' },
                        { field: '_family_child_5', relationship: 'Con ruột' },
                        { field: '_family_child_6', relationship: 'Con ruột' },
                    ]

                    const familyToInsert = []
                    for (const { field, relationship } of familyConfig) {
                        const textValue = row[field]
                        if (!textValue) continue
                        const parsed = parseFamilyInfo(textValue.toString())
                        if (parsed) {
                            familyToInsert.push({
                                employee_code: employeeData.employee_code,
                                relationship,
                                first_name: parsed.first_name,
                                last_name: parsed.last_name,
                                date_of_birth: parsed.date_of_birth,
                                gender: parsed.gender || null,
                                is_dependent: parsed.is_dependent || false,
                                occupation: parsed.occupation,
                                current_residence: parsed.current_residence,
                                phone: parsed.phone,
                                identity_card_number: parsed.identity_card_number
                            })
                        }
                    }

                    if (familyToInsert.length > 0) {
                        const { error: familyError } = await supabase.from('family_members').insert(familyToInsert)
                        if (familyError) {
                            console.warn('Family insert error:', familyError, 'Data:', JSON.stringify(familyToInsert))
                            warningDetails.push({
                                row: row._rowNum,
                                employee_code: row.employee_code,
                                message: `Lỗi Family: ${familyError.message}`
                            })
                        }
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
            const { error: auditError } = await supabase.from('import_audit').insert([{
                import_type: 'EMPLOYEES',
                imported_by: user?.employee_code || 'SYSTEM',
                total_records: previewData.length,
                success_count: successCount,
                fail_count: failCount,
                details: JSON.stringify([...failDetails, ...warningDetails])
            }])
            if (auditError) {
                console.warn('Could not log audit:', auditError.message)
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
                                        <th style={{ minWidth: '50px' }}>Dòng</th>
                                        <th style={{ minWidth: '100px' }}>Mã NV</th>
                                        <th style={{ minWidth: '180px' }}>Họ tên</th>
                                        <th style={{ minWidth: '150px' }}>Chức danh</th>
                                        <th style={{ minWidth: '150px' }}>Chức vụ</th>
                                        <th style={{ minWidth: '120px' }}>CCCD</th>
                                        <th style={{ minWidth: '100px' }}>Ngày cấp</th>
                                        <th style={{ minWidth: '150px' }}>Nơi cấp</th>
                                        <th style={{ minWidth: '160px' }}>Email ACV</th>
                                        <th style={{ minWidth: '160px' }}>Email Cá nhân</th>
                                        <th style={{ minWidth: '120px' }}>SĐT</th>
                                        <th style={{ minWidth: '60px' }}>GT</th>
                                        <th style={{ minWidth: '100px' }}>Dân tộc</th>
                                        <th style={{ minWidth: '100px' }}>Tôn giáo</th>
                                        <th style={{ minWidth: '100px' }}>Ngày sinh</th>
                                        <th style={{ minWidth: '150px' }}>Nơi sinh</th>
                                        <th style={{ minWidth: '150px' }}>Quê quán</th>
                                        <th style={{ minWidth: '300px' }}>Thường trú</th>
                                        <th style={{ minWidth: '300px' }}>Tạm trú (Excel)</th>
                                        <th style={{ minWidth: '300px' }}>Nơi ở hiện nay</th>
                                        <th style={{ minWidth: '100px' }}>Văn hóa</th>
                                        <th style={{ minWidth: '100px' }}>Học vấn</th>
                                        <th style={{ minWidth: '150px' }}>Đơn vị</th>
                                        <th style={{ minWidth: '150px' }}>Bộ phận</th>
                                        <th style={{ minWidth: '120px' }}>Ngày vào ACV</th>
                                        <th style={{ minWidth: '120px' }}>Ngày chính thức</th>
                                        <th style={{ minWidth: '120px' }}>Ngạch lương</th>
                                        <th style={{ minWidth: '100px' }}>Bậc lương</th>
                                        <th style={{ minWidth: '100px' }}>Hệ số</th>
                                        <th style={{ minWidth: '120px' }}>Lương CB</th>
                                        <th style={{ minWidth: '120px' }}>Lương BHXH</th>
                                        <th style={{ minWidth: '120px' }}>Số HĐLĐ</th>
                                        <th style={{ minWidth: '150px' }}>Loại HĐ</th>
                                        <th style={{ minWidth: '120px' }}>Ngày ký HĐ</th>
                                        <th style={{ minWidth: '120px' }}>Hết hạn HĐ</th>
                                        <th style={{ minWidth: '150px' }}>Ngân hàng</th>
                                        <th style={{ minWidth: '150px' }}>Số tài khoản</th>
                                        <th style={{ minWidth: '120px' }}>Số BHXH</th>
                                        <th style={{ minWidth: '120px' }}>Số BHYT</th>
                                        <th style={{ minWidth: '200px' }}>Bằng cấp</th>
                                        <th style={{ minWidth: '150px' }}>Ngoại ngữ</th>
                                        <th style={{ minWidth: '150px' }}>Tin học</th>
                                        <th style={{ minWidth: '100px' }}>Đảng viên</th>
                                        <th style={{ minWidth: '150px' }}>Chức vụ Đảng</th>
                                        <th style={{ minWidth: '150px' }}>Ngày vào Đảng</th>
                                        <th style={{ minWidth: '150px' }}>Ngày chính thức Đảng</th>
                                        <th style={{ minWidth: '150px' }}>LL chính trị</th>
                                        <th style={{ minWidth: '150px' }}>Chức vụ Đoàn</th>
                                        <th style={{ minWidth: '100px' }}>Số NPT</th>
                                    <th style={{ minWidth: '120px' }}>Kết hôn</th>
                                    <th style={{ minWidth: '220px' }}>Thông tin Bố</th>
                                    <th style={{ minWidth: '220px' }}>Thông tin Mẹ</th>
                                    <th style={{ minWidth: '220px' }}>Vợ/Chồng</th>
                                    <th style={{ minWidth: '220px' }}>Bố chồng/vợ</th>
                                    <th style={{ minWidth: '220px' }}>Mẹ chồng/vợ</th>
                                    <th style={{ minWidth: '220px' }}>Con 1</th>
                                    <th style={{ minWidth: '220px' }}>Con 2</th>
                                    <th style={{ minWidth: '220px' }}>Con 3</th>
                                    <th style={{ minWidth: '220px' }}>Con 4</th>
                                    <th style={{ minWidth: '220px' }}>Con 5</th>
                                    <th style={{ minWidth: '220px' }}>Con 6</th>
                                    <th style={{ minWidth: '100px' }}>Số con</th>
                                        <th style={{ minWidth: '200px' }}>Ghi chú</th>
                                        <th style={{ minWidth: '100px' }}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((row, index) => {
                                        const fatherInfo = parseFamilyInfo(row._family_father?.toString())
                                        const motherInfo = parseFamilyInfo(row._family_mother?.toString())
                                        const spouseInfo = parseFamilyInfo(row._family_spouse?.toString())
                                        const fatherInLawInfo = parseFamilyInfo(row._family_father_in_law?.toString())
                                        const motherInLawInfo = parseFamilyInfo(row._family_mother_in_law?.toString())
                                        const child1Info = parseFamilyInfo(row._family_child_1?.toString())
                                        const child2Info = parseFamilyInfo(row._family_child_2?.toString())
                                        const child3Info = parseFamilyInfo(row._family_child_3?.toString())
                                        const child4Info = parseFamilyInfo(row._family_child_4?.toString())
                                        const child5Info = parseFamilyInfo(row._family_child_5?.toString())
                                        const child6Info = parseFamilyInfo(row._family_child_6?.toString())
                                        const isPartyMember = row.party_join_date || row.party_position || row.party_card_number

                                        // Render family cell helper
                                        const renderFamilyCell = (parsed, rawText) => {
                                            if (!parsed) return <td className="text-gray-400 text-center">-</td>
                                            return (
                                                <td title={rawText || ''} style={{ minWidth: '220px', padding: '8px' }}>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="font-bold text-slate-800 leading-tight">
                                                            {parsed.last_name} {parsed.first_name}
                                                            {parsed.date_of_birth && <span className="text-slate-500 font-normal ml-1">({parsed.date_of_birth.split('-')[0]})</span>}
                                                        </div>
                                                        {parsed.is_dependent && (
                                                            <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 w-fit mt-0.5">
                                                                <i className="fas fa-child mr-1"></i> NPT
                                                            </div>
                                                        )}
                                                        {parsed.note && (
                                                            <div className="text-gray-500 text-[10px] italic leading-snug wrap-break-word max-w-[200px]">
                                                                {parsed.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            )
                                        }

                                        return (
                                            <tr key={index} className={row._hasError ? 'row-error' : ''}>
                                                <td style={{ backgroundColor: row._hasError ? '#fff5f5' : 'inherit' }}>{row._rowNum}</td>
                                                <td className="font-bold">{row.employee_code}</td>
                                                <td className="font-bold">{row.last_name} {row.first_name}</td>
                                                <td>{row.job_title || ''}</td>
                                                <td>{row.current_position || row.job_title || ''}</td>
                                                <td>{row.identity_card_number || ''}</td>
                                                <td>{row.identity_card_issue_date || ''}</td>
                                                <td>{row.identity_card_issue_place || ''}</td>
                                                <td className="text-blue-600 font-medium">{row.email_acv || ''}</td>
                                                <td>{row.email_personal || ''}</td>
                                                <td>{row.phone || ''}</td>
                                                <td>{row.gender || ''}</td>
                                                <td>{row.ethnicity || ''}</td>
                                                <td>{row.religion || ''}</td>
                                                <td>{row.date_of_birth || ''}</td>
                                                <td>{row.place_of_birth || ''}</td>
                                                <td>{row.hometown || ''}</td>
                                                <td title={row.permanent_address} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row.permanent_address || ''}
                                                </td>
                                                <td title={row._temporary_address_reg} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row._temporary_address_reg || ''}
                                                </td>
                                                <td title={row._current_residence} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {row._current_residence || ''}
                                                </td>
                                                <td>{row.education_level || ''}</td>
                                                <td className="font-medium text-purple-700">{row._academic_level || row.academic_level_code || ''}</td>
                                                <td>{row.department || ''}</td>
                                                <td>{row.team || ''}</td>
                                                <td>{row.join_date || ''}</td>
                                                <td>{row.official_date || ''}</td>
                                                <td>{row.salary_scale || ''}</td>
                                                <td>{row.salary_level || ''}</td>
                                                <td>{row.salary_coefficient || ''}</td>
                                                <td>{row.basic_salary ? Number(row.basic_salary).toLocaleString() : ''}</td>
                                                <td>{row.social_insurance_salary ? Number(row.social_insurance_salary).toLocaleString() : ''}</td>
                                                <td>{row.contract_number || ''}</td>
                                                <td>{row.contract_type || ''}</td>
                                                <td>{row.contract_signed_date || ''}</td>
                                                <td>{row.contract_expiration_date || ''}</td>
                                                <td>{row.bank_name || ''}</td>
                                                <td>{row.bank_account_number || ''}</td>
                                                <td>{row.social_insurance_number || ''}</td>
                                                <td>{row.health_insurance_number || ''}</td>
                                                <td title={`${row.education_qualification || ''} ${row.certificates || ''}`}>
                                                    {row.education_qualification || ''} {row.certificates ? ` | ${row.certificates}` : ''}
                                                </td>
                                                <td className="text-orange-600 italic">{row.foreign_language || ''}</td>
                                                <td className="text-blue-600 italic">{row.computer_skill || ''}</td>
                                                <td>{isPartyMember ? 'Đảng viên' : 'Không'}</td>
                                                <td>{row.party_position || ''}</td>
                                                <td>{row.party_join_date || ''}</td>
                                                <td>{row.party_official_date || ''}</td>
                                                <td className="text-purple-600 font-medium">{row.political_education_level || ''}</td>
                                                <td>{row.youth_union_position || ''}</td>
                                                <td className="text-center">{row.number_of_dependents || ''}</td>
                                                <td>{row._marital_status || ''}</td>
                                                {renderFamilyCell(fatherInfo, row._family_father)}
                                                {renderFamilyCell(motherInfo, row._family_mother)}
                                                {renderFamilyCell(spouseInfo, row._family_spouse)}
                                                {renderFamilyCell(fatherInLawInfo, row._family_father_in_law)}
                                                {renderFamilyCell(motherInLawInfo, row._family_mother_in_law)}
                                                {renderFamilyCell(child1Info, row._family_child_1)}
                                                {renderFamilyCell(child2Info, row._family_child_2)}
                                                {renderFamilyCell(child3Info, row._family_child_3)}
                                                {renderFamilyCell(child4Info, row._family_child_4)}
                                                {renderFamilyCell(child5Info, row._family_child_5)}
                                                {renderFamilyCell(child6Info, row._family_child_6)}
                                                <td>{row._number_of_children || ''}</td>
                                                <td>{row.note || ''}</td>
                                                <td>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${row.status === 'Đang làm việc' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {row.status || ''}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <p className="preview-note">
                                Tổng cộng {previewData.length} dòng hợp lệ sẵn sàng import.
                            </p>
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
