# Plan: Fix Calendar RBAC (View, Edit, Delete, Create)

## Overview
Người dùng phản ánh: Mặc dù trên bảng phân quyền (Matrix) chỉ tích nút "Xem" (View) cho module Lịch biểu (Calendar), nhưng nhân sự vẫn có thể tự do **tạo sự kiện mới**.
Bên cạnh đó, các quyền **Sửa** (Edit) và **Xóa** (Delete) hiện tại cũng đang hoạt động sai lệch do sự kiện không lưu phòng ban/tổ, dẫn đến quản lý không thể sửa/xóa sự kiện của nhân viên.

## Project Type
WEB (React/Vite with Supabase backend)

## Root Causes
1. **Lỗi quyền Create (Tạo mới):** Trong `rbac.js`, dòng 96 (`if (action === 'create' && !hasDeptTeam && !hasOwner) return true`) đã tự động cho phép MỌI USER tạo sự kiện mới nếu hành động đó không gắn liền với một phòng ban hay người chủ cụ thể. Điều này qua mặt hoàn toàn cấu hình Matrix (vốn quy định `create` tương đương với `edit`).
2. **Lỗi quyền Edit/Delete (Dữ liệu sự kiện thiếu metadata):** Khi tạo sự kiện mới, bảng `events` không lưu `department` hay `team` của người tạo. Hàm `canPerformAction` trong `rbac.js` hiểu lầm rằng sự kiện này không thuộc phòng/ban nào, dẫn đến việc chỉ cho phép chính chủ (hoặc quản lý cấp CAO HƠN như BOARD) sửa/xóa. Trưởng phòng / Tổ trưởng bị mất quyền quản lý sự kiện của cấp dưới.

## Task Breakdown

### Task 1: Sửa lỗ hổng cấp quyền "Create" trong `rbac.js`
- **agent**: `frontend-specialist`
- **skills**: `clean-code`
- **priority**: P0
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: File `src/utils/rbac.js`.
  - OUTPUT: Xóa hoặc sửa đổi dòng `if (action === 'create' && !hasDeptTeam && !hasOwner) return true`. Để một user có thể tạo sự kiện (`create`), họ BẮT BUỘC phải có quyền `can_edit` trong bảng `permissions` của module đó.

### Task 2: Bổ sung metadata Tổ chức vào Calendar Events khi fetch
- **agent**: `frontend-specialist`
- **skills**: `clean-code`
- **priority**: P0
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: File `src/pages/Calendar.jsx`.
  - OUTPUT: Trong hàm `fetchAllEvents`, sau khi lấy danh sách `calendarEvents`, map thêm `_department` và `_team` vào data của resource trước khi giao diện gọi `checkAction`. Điều này giúp `rbac.js` nhận diện đúng sự kiện thuộc phòng ban nào để cho phép Trưởng phòng / Tổ trưởng vào quản lý.

### Task 3: Cập nhật hàm xử lý rbac cho module Calendar (Edit/Delete)
- **agent**: `frontend-specialist`
- **skills**: `clean-code`
- **priority**: P0
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: File `src/utils/rbac.js`.
  - OUTPUT: Cập nhật logic trong `canPerformAction`. Khi xét quyền `edit/delete` cho module `calendar`, nếu sự kiện có `_department` hoặc `_team`, phải cho phép TEAM_LEADER và DEPT_HEAD có thể quản lý.

## Phase X: Verification
- [ ] Dùng tài khoản STAFF (chỉ có quyền View). Nút tạo sự kiện (+ Bấm vào ngày rỗng) không hoạt động, không hiện modal.
- [ ] Dùng tài khoản STAFF (có quyền Edit/Create). Có thể tạo sự kiện.
- [ ] Dùng tài khoản TEAM_LEADER. Có quyền sửa/xóa sự kiện do STAFF trong cùng tổ tạo.
- [ ] Dùng tài khoản DEPT_HEAD. Có quyền sửa/xóa sự kiện do mọi người trong cùng phòng ban tạo.
