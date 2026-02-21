# PLAN: Thư Viện — Quản lý Nội dung & Đăng tải

## Mô tả

Trang Thư viện (`/thu-vien`) hiện tại chỉ đọc từ bảng `documents` và hiển thị. **Chưa có** chức năng tạo mới, upload file, phân loại, tìm kiếm, ghim tài liệu. Plan này bổ sung đầy đủ các tính năng.

---

## User Review Required

> [!IMPORTANT]
> **Bảng `documents` trong Supabase** — cần xác nhận schema hiện tại hoặc tạo mới/alter table. Plan dự kiến schema bên dưới.

> [!WARNING]
> **Supabase Storage bucket** — cần tạo bucket `documents` trong Supabase Dashboard (Storage → New Bucket) để lưu file đính kèm. Hoặc mình tạo qua SQL migration.

---

## Proposed Changes

### 1. Database — `documents` table schema

Dự kiến cột (tạo mới hoặc alter nếu thiếu):

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid PK | Auto-gen |
| `title` | text NOT NULL | Tiêu đề tài liệu |
| `content` | text | Nội dung HTML/text |
| `content_type` | text | Phân loại: `Thông báo`, `Nội quy`, `Hướng dẫn`, `Biểu mẫu` |
| `file_url` | text NULL | URL file từ Supabase Storage |
| `file_name` | text NULL | Tên file gốc |
| `is_pinned` | boolean DEFAULT false | Ghim lên đầu |
| `created_by` | text | `employee_code` người tạo |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto |

---

### 2. RBAC Integration

#### [MODIFY] rbac.js

Thêm `LIBRARY: 'library'` vào `PERMISSIONS` object.

#### [MODIFY] Settings.jsx

Thêm `{ key: PERMISSIONS.LIBRARY, label: 'Thư viện' }` vào `MODULES` array → tự động xuất hiện trong ma trận quyền hạn.

---

### 3. Library Page — Full Rewrite

#### [MODIFY] Library.jsx

**Tính năng mới**:

| Feature | Chi tiết |
|---------|----------|
| **Tạo mới** | Modal form: Tiêu đề, Nội dung (textarea), Phân loại (dropdown), File đính kèm (optional) |
| **Upload file** | Supabase Storage bucket `documents` → lưu URL vào `file_url` |
| **Phân loại** | Filter tabs: `Tất cả`, `Thông báo`, `Nội quy`, `Hướng dẫn`, `Biểu mẫu` |
| **Tìm kiếm** | Search bar tìm theo title |
| **Ghim/Pin** | Toggle ghim → tài liệu ghim hiển thị đầu tiên |
| **Sửa/Xóa** | Edit + Delete cho người có quyền (qua `checkAction`) |
| **Xem chi tiết** | Modal view hiện nội dung + download file |

**Permission checks**:
- `checkAction('view', { module: 'library' })` → xem trang
- `checkAction('edit', { module: 'library' })` → tạo/sửa/ghim
- `checkAction('delete', { module: 'library' })` → xóa

#### [MODIFY] Library.css

Bổ sung styles cho: upload form modal, filter tabs, search bar, pin badge, action buttons.

---

## Verification Plan

### Manual
1. Cấu hình quyền `library` trong **Cài đặt → Ma trận quyền hạn**
2. Đăng nhập role có quyền edit → bấm **Tạo tài liệu** → nhập nội dung + upload file → Lưu
3. Verify tài liệu hiển thị trong grid
4. Test filter theo phân loại, tìm kiếm theo title
5. Test ghim/bỏ ghim → tài liệu ghim xuất hiện đầu
6. Đăng nhập role STAFF (chỉ view) → verify không thấy nút Tạo/Sửa/Xóa
