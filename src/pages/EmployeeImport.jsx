import { useState, useRef } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'
import * as XLSX from 'xlsx'
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

    const requiredFields = ['employee_code', 'last_name', 'first_name', 'email_acv', 'department', 'status', 'score_template_code']

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
            const headers = jsonData[0].map(h => (h || '').toString().trim().toLowerCase())
            const dataRows = jsonData.slice(1)

            // Map headers to database columns
            const headerMap = {
                'mã nhân viên': 'employee_code',
                'mã nv': 'employee_code',
                'employee_code': 'employee_code',
                'họ': 'last_name',
                'last_name': 'last_name',
                'tên': 'first_name',
                'first_name': 'first_name',
                'email': 'email_acv',
                'email_acv': 'email_acv',
                'email doanh nghiệp': 'email_acv',
                'phòng ban': 'department',
                'department': 'department',
                'đội': 'team',
                'team': 'team',
                'trạng thái': 'status',
                'status': 'status',
                'mã template điểm': 'score_template_code',
                'score_template_code': 'score_template_code',
                'template': 'score_template_code'
            }

            const mappedHeaders = headers.map(h => headerMap[h] || h)
            const validatedData = []
            const validationErrors = []

            dataRows.forEach((row, index) => {
                const rowNum = index + 2 // +2 because index is 0-based and we skip header
                const rowData = {}
                const rowErrors = []

                // Map row data
                headers.forEach((header, colIndex) => {
                    const dbField = headerMap[header]
                    if (dbField) {
                        rowData[dbField] = row[colIndex] || ''
                    }
                })

                // Validate required fields
                requiredFields.forEach(field => {
                    if (!rowData[field] || rowData[field].toString().trim() === '') {
                        rowErrors.push({
                            row: rowNum,
                            column: headers.findIndex(h => headerMap[h] === field) + 1,
                            field: field,
                            message: `Thiếu trường bắt buộc: ${field}`
                        })
                    }
                })

                // Validate employee_code format (CBA + 4 digits)
                if (rowData.employee_code) {
                    const code = rowData.employee_code.toString().trim().toUpperCase()
                    // Format chuẩn: CBA + 4 chữ số (ví dụ: CBA0001, CBA0004)
                    if (!/^CBA\d{4}$/.test(code)) {
                        rowErrors.push({
                            row: rowNum,
                            column: headers.findIndex(h => headerMap[h] === 'employee_code') + 1,
                            field: 'employee_code',
                            message: 'Mã nhân viên phải có format: CBA + 4 chữ số (VD: CBA0001, CBA0004)'
                        })
                    }
                }

                // Validate email format
                if (rowData.email_acv && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rowData.email_acv)) {
                    rowErrors.push({
                        row: rowNum,
                        column: headers.findIndex(h => headerMap[h] === 'email_acv') + 1,
                        field: 'email_acv',
                        message: 'Email không đúng định dạng'
                    })
                }

                if (rowErrors.length > 0) {
                    validationErrors.push(...rowErrors)
                } else {
                    validatedData.push({
                        ...rowData,
                        _rowNum: rowNum
                    })
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

            for (const row of previewData) {
                try {
                    // Check if employee already exists
                    const { data: existing } = await supabase
                        .from('employee_profiles')
                        .select('employee_code')
                        .eq('employee_code', row.employee_code.toString().trim().toUpperCase())
                        .single()

                    if (existing) {
                        failCount++
                        failDetails.push({
                            row: row._rowNum,
                            employee_code: row.employee_code,
                            message: 'Mã nhân viên đã tồn tại'
                        })
                        continue
                    }

                    // Prepare data
                    const nameParts = (row.first_name || '').trim().split(' ')
                    const firstName = nameParts.pop() || ''
                    const lastName = (row.last_name || '').trim() + (nameParts.length > 0 ? ' ' + nameParts.join(' ') : '')

                    const employeeData = {
                        employee_code: row.employee_code.toString().trim().toUpperCase(),
                        first_name: firstName,
                        last_name: lastName || row.last_name || '',
                        email_acv: row.email_acv?.toString().trim() || null,
                        department: row.department?.toString().trim() || null,
                        team: row.team?.toString().trim() || null,
                        status: row.status?.toString().trim() || 'Đang làm việc',
                        score_template_code: row.score_template_code?.toString().trim() || 'NVTT'
                    }

                    // Hash default password
                    const hashPassword = async (password) => {
                        const encoder = new TextEncoder()
                        const data = encoder.encode(password)
                        const hash = await crypto.subtle.digest('SHA-256', data)
                        return Array.from(new Uint8Array(hash))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join('')
                    }
                    
                    const hashedPassword = await hashPassword('123456')
                    employeeData.password = hashedPassword

                    // Insert employee
                    const { error: insertError } = await supabase
                        .from('employee_profiles')
                        .insert([employeeData])

                    if (insertError) {
                        throw insertError
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
                    details: JSON.stringify(failDetails)
                }])
            } catch (auditError) {
                console.warn('Could not log audit:', auditError)
            }

            setImportResult({
                total: previewData.length,
                success: successCount,
                fail: failCount,
                details: failDetails
            })

            alert(`Import hoàn tất!\nThành công: ${successCount}\nThất bại: ${failCount}`)
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
                                        <th>Email</th>
                                        <th>Phòng ban</th>
                                        <th>Trạng thái</th>
                                        <th>Template</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.slice(0, 50).map((row, index) => (
                                        <tr key={index}>
                                            <td>{row._rowNum}</td>
                                            <td>{row.employee_code}</td>
                                            <td>{row.last_name} {row.first_name}</td>
                                            <td>{row.email_acv}</td>
                                            <td>{row.department}</td>
                                            <td>{row.status}</td>
                                            <td>{row.score_template_code}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {previewData.length > 50 && (
                                <p className="preview-note">
                                    Hiển thị 50 dòng đầu tiên. Tổng cộng {previewData.length} dòng hợp lệ.
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
