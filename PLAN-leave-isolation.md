# Plan: Isolate Leave Visibility

## Overview
Hiện tại, trang quản lý Nghỉ phép (Leaves.jsx) đang hiển thị tất cả các đơn xin nghỉ phép của mọi nhân viên cho tất cả mọi người (kể cả nhân viên bình thường).
Yêu cầu: Nhân viên bình thường (có chức vụ `STAFF` hoặc không có quyền quản lý) khi vào phần nghỉ phép **chỉ được xem lịch sử và các đơn xin nghỉ phép của chính mình**, không được xem của người khác.

## Project Type
WEB (React/Vite with Supabase backend)

## Architecture Decision
Sử dụng **Role-Based Filtering ở Frontend (React)** kết hợp với hàm `fetchLeaves` hiện có.

## Task Breakdown

### Task 1: Cập nhật hàm `fetchLeaves` trong `src/pages/Leaves.jsx`
- **agent**: `frontend-specialist`
- **skills**: `clean-code`
- **priority**: P0
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: File `src/pages/Leaves.jsx`.
  - OUTPUT: Cập nhật biến `query` trong `fetchLeaves` sao cho nếu `user.role_level === 'STAFF'` thì thêm `.eq('employee_code', user.employee_code)`. Nếu là tổ trưởng (TEAM_LEADER) hoặc trưởng phòng (DEPT_HEAD) thì có thể cần filter theo tổ/phòng hoặc vẫn giữ nguyên tùy thuộc yêu cầu thực tế hiện tại (tạm thời thêm logic cho STAFF trước).
  - VERIFY: Đăng nhập bằng tài khoản giả lập của STAFF, mở trang danh sách nghỉ phép và chỉ thấy đơn của cá nhân tạo ra.

## Phase X: Verification
- [ ] Test trường hợp 1: Chọn một tài khoản Role STAFF. Đăng nhập. Trang nghỉ phép chỉ hiện danh sách do chính họ tạo.
- [ ] Test trường hợp 2: Giao diện tạo đơn nghỉ của STAFF vẫn chỉ cho phép chọn tên của chính mình.
- [ ] Test trường hợp 3: Chọn tài khoản Role ADMIN hoặc TEAM_LEADER. Trang nghỉ phép phải hiện danh sách mà họ có quyền quản lý.
