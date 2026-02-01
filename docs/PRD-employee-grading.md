# PRD: Hệ thống Chấm Điểm KPI theo Loại Nhân Viên

> **Version**: 1.0  
> **Date**: 2026-01-31  
> **Author**: AI Assistant  
> **Status**: Draft

---

## 1. Tổng quan (Overview)

### 1.1 Mục đích
Xây dựng hệ thống chấm điểm KPI linh hoạt, cho phép áp dụng **3 mẫu chấm điểm khác nhau** dựa trên loại nhân viên:

| Mẫu | Đối tượng | Đặc điểm |
|-----|-----------|----------|
| **NVTT** | Nhân viên trực tiếp | Tập trung vào hiệu quả công việc thực tế, tuân thủ quy trình |
| **NVGT** | Nhân viên gián tiếp | Đánh giá chất lượng hỗ trợ, phối hợp liên phòng ban |
| **CBQL** | Cán bộ quản lý | Thêm tiêu chí lãnh đạo, quản lý đội nhóm, ra quyết định |

### 1.2 Phạm vi
- Module: **Chấm điểm KPI** trong hệ thống quản lý nhân sự
- Đối tượng sử dụng: Nhân viên (tự đánh giá), Quản lý (đánh giá nhân viên)

### 1.3 Vấn đề cần giải quyết
- Hiện tại chỉ có **1 mẫu chấm điểm chung** cho tất cả nhân viên
- Tiêu chí đánh giá không phù hợp với từng loại công việc
- Cần phân biệt rõ giữa **loại nhân viên (HR)** và **mẫu chấm điểm**

---

## 2. Kiến trúc dữ liệu (Data Model)

### 2.1 Tách 2 trường riêng biệt

```
┌─────────────────────────────────────────────────────────────────┐
│                    employee_profiles table                       │
├─────────────────────────────────────────────────────────────────┤
│ employment_type_code   │ Loại nhân viên (phục vụ HR)           │
│                        │ Values: NVCT, NVTV, NVGT, NVTT, CBQL  │
├────────────────────────┼────────────────────────────────────────┤
│ score_template_code    │ Mẫu chấm điểm KPI                     │
│                        │ Values: NVTT, NVGT, CBQL               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Mapping Logic (Auto-suggest)

| employment_type_code | Label | → score_template_code (default) |
|---------------------|-------|--------------------------------|
| `MB NVCT` | Nhân viên chính thức | `NVTT` |
| `NVTV` | Nhân viên thời vụ | `NVTT` |
| `NVTT` | Nhân viên trực tiếp | `NVTT` |
| `NVGT` | Nhân viên gián tiếp | `NVGT` |
| `CBQL` | Cán bộ quản lý | `CBQL` |

> **Lưu ý**: Người dùng có thể override `score_template_code` nếu cần.

---

## 3. Tính năng chi tiết (Features)

### 3.1 Dropdown "Loại nhân viên" (Employment Type)

**Vị trí**: Phần "Thông tin công việc" trong hồ sơ nhân viên

```
┌──────────────────────────────────────┐
│ Loại nhân viên (HR)              ▼  │
├──────────────────────────────────────┤
│ ○ Nhân viên chính thức (NVCT)       │
│ ○ Nhân viên gián tiếp (NVGT)        │
│ ○ Nhân viên thời vụ (NVTV)          │
│ ○ Nhân viên trực tiếp (NVTT)        │
│ ○ Cán bộ quản lý (CBQL)             │
└──────────────────────────────────────┘
```

**Hành vi**:
- Khi thay đổi loại nhân viên → tự động suggest mẫu chấm điểm tương ứng
- Giá trị lưu vào DB: `employee_type` (giữ nguyên tên cột cũ để backward compatible)

### 3.2 Dropdown "Mẫu chấm điểm" (Score Template)

**Vị trí**: Ngay dưới dropdown "Loại nhân viên"

```
┌──────────────────────────────────────┐
│ Mẫu chấm điểm                    ▼  │
├──────────────────────────────────────┤
│ ○ Trực tiếp (NVTT)                  │
│ ○ Gián tiếp (NVGT)                  │
│ ○ Quản lý (CBQL)                    │
└──────────────────────────────────────┘
```

**Hành vi**:
- Auto-filled khi chọn loại nhân viên
- Có thể thay đổi thủ công (override)
- Giá trị này quyết định mẫu tiêu chí hiển thị trong "Chấm điểm"

### 3.3 Bảng Chấm Điểm theo Mẫu

**Vị trí**: Tab "Chấm điểm" trong chi tiết nhân viên

**Logic hiển thị**:
```
IF score_template_code = 'NVTT' → Hiển thị CRITERIA_NVTT
IF score_template_code = 'NVGT' → Hiển thị CRITERIA_NVGT
IF score_template_code = 'CBQL' → Hiển thị CRITERIA_CBQL
```

**UI Indicator**:
```
┌──────────────────────────────────────────────────────────┐
│ Chấm điểm - Tháng 01/2026                               │
│ [Mẫu: Trực tiếp (NVTT)]  ← Badge hiển thị mẫu đang dùng │
├──────────────────────────────────────────────────────────┤
│ NV001 - Nguyễn Văn A                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Cấu trúc 3 Mẫu Chấm Điểm

### 4.1 Mẫu NVTT (Nhân viên trực tiếp)

| Section | Tiêu chí | Điểm tối đa |
|---------|----------|-------------|
| **A** | Khung điểm trừ (Chấp hành nội quy) | 20 |
| **B** | Khung điểm đạt (Hiệu quả công việc) | 80 |
| B.2 | Hiệu quả công việc | 45 |
| B.3 | Tinh thần trách nhiệm, hợp tác | 15 |
| B.4 | ~~Hiệu quả quản lý~~ (Không áp dụng) | 0 |
| **C** | Khung điểm cộng | 15 |

### 4.2 Mẫu NVGT (Nhân viên gián tiếp)

| Section | Tiêu chí | Điểm tối đa |
|---------|----------|-------------|
| **A** | Khung điểm trừ | 20 |
| **B** | Khung điểm đạt | 80 |
| B.2 | Hiệu quả công việc | 35 |
| B.3 | Tinh thần trách nhiệm, hợp tác | 15 |
| B.4 | Chất lượng hỗ trợ, phối hợp | 10 |
| B.5 | ~~Quản lý đội nhóm~~ (Không áp dụng) | 0 |
| **C** | Khung điểm cộng | 15 |

### 4.3 Mẫu CBQL (Cán bộ quản lý)

| Section | Tiêu chí | Điểm tối đa |
|---------|----------|-------------|
| **A** | Khung điểm trừ | 20 |
| **B** | Khung điểm đạt | 80 |
| B.2 | Hiệu quả công việc cá nhân | 25 |
| B.3 | Tinh thần trách nhiệm | 10 |
| B.4 | **Hiệu quả quản lý, điều hành** | 20 |
| B.5 | **Năng lực lãnh đạo đội nhóm** | 5 |
| **C** | Khung điểm cộng | 15 |

> ⚠️ **Lưu ý**: Các tiêu chí chi tiết cần được xác nhận bởi phòng Nhân sự

---

## 5. Xếp loại (Grading Scale)

| Tổng điểm | Xếp loại | Màu badge |
|-----------|----------|-----------|
| ≥ 95 | A+ | 🟢 Success |
| 85 - 94 | A | 🟢 Success |
| 75 - 84 | B | 🔵 Primary |
| 65 - 74 | C | 🟡 Warning |
| < 65 | D | 🔴 Danger |

---

## 6. Database Schema

### 6.1 Bảng `employee_profiles` (Cập nhật)

```sql
-- Giữ nguyên cột employee_type (backward compatible)
employee_type TEXT CHECK (employee_type IN ('MB NVCT', 'NVGT', 'NVTV', 'NVTT', 'CBQL'))

-- Thêm cột mới
score_template_code TEXT CHECK (score_template_code IN ('NVTT', 'NVGT', 'CBQL'))
```

### 6.2 Bảng `performance_reviews` (Không đổi)

```sql
-- Lưu assessment dạng JSONB - tương thích với mọi template
self_assessment JSONB DEFAULT '{}'::jsonb
supervisor_assessment JSONB DEFAULT '{}'::jsonb
```

---

## 7. UI/UX Specifications

### 7.1 Luồng người dùng

```
1. Vào hồ sơ nhân viên
   ↓
2. Chọn "Loại nhân viên" → Auto-suggest "Mẫu chấm điểm"
   ↓
3. (Optional) Override mẫu chấm điểm nếu cần
   ↓
4. Lưu hồ sơ
   ↓
5. Vào tab "Chấm điểm"
   ↓
6. Hệ thống hiển thị bảng tiêu chí theo mẫu đã chọn
```

### 7.2 Responsive Behavior

- **Desktop**: Dropdown inline với form
- **Mobile**: Full-width dropdown stacked

### 7.3 Error Handling

| Case | Behavior |
|------|----------|
| `score_template_code` = NULL | Default to 'NVTT' |
| Template không tồn tại | Show warning + fallback to NVTT |

---

## 8. Acceptance Criteria

### 8.1 Functional

- [ ] Tất cả 5 loại nhân viên hiển thị trong dropdown
- [ ] Auto-suggest mẫu chấm điểm khi chọn loại NV
- [ ] 3 mẫu chấm điểm có tiêu chí khác nhau
- [ ] Điểm số tính đúng theo formula của từng mẫu
- [ ] Xếp loại hiển thị chính xác

### 8.2 Non-Functional

- [ ] Load time < 500ms cho bảng chấm điểm
- [ ] Data save thành công với mọi template
- [ ] Backward compatible với data cũ

---

## 9. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-31 | Initial draft |

---

## 10. Open Questions

1. **[PENDING]** Tiêu chí chi tiết cho từng mẫu (NVTT/NVGT/CBQL) cần xác nhận từ phòng NS?
2. **[PENDING]** Có cần UI để admin tự customize tiêu chí không?
3. **[DECIDED]** Dùng 2 trường tách biệt: `employee_type` + `score_template_code`
