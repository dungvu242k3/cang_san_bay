# Project Plan: Hướng Dẫn Sử Dụng Cơ Bản (User Guide)

## Overview
Xây dựng một tài liệu hướng dẫn sử dụng cơ bản dành cho người dùng thông thường của hệ thống BPM Cảng hàng không quốc tế Cát Bi. Tài liệu này sẽ tập trung vào các chức năng cốt lõi mà một nhân viên/người dùng tiêu chuẩn cần biết để thao tác trên hệ thống hằng ngày.

**Lưu ý quan trọng:** Không bao gồm các chức năng liên quan đến quản trị viên (Admin), cài đặt hệ thống, hay phân quyền.

## Project Type
**WEB** (Tài liệu hướng dẫn trực tuyến)

## Success Criteria
- [ ] Tài liệu rõ ràng, dễ hiểu, có định dạng tốt (Markdown/HTML).
- [ ] Bao phủ đầy đủ các thao tác: Đăng nhập, Đổi mật khẩu, và các chức năng chính người dùng được giao (như xem báo cáo cá nhân, bảng công việc - Kanban, form yêu cầu).
- [ ] Không chứa các thông tin nhạy cảm hoặc menu dành riêng cho Admin.

## Tech Stack
- Markdown (.md) cho phiên bản mã nguồn/tài liệu tĩnh.
- Tùy chọn: Tích hợp vào Frontend (React component) nếu cần hiển thị trực tiếp trên web bằng popup hoặc trang "Trợ giúp". (Trong phạm vi plan này, chúng ta tạo file markdown chuẩn).

## File Structure
- `docs/user-guide.md` (Tài liệu hướng dẫn chính thức - output cuối cùng)

## Task Breakdown

### 1. Phân tích chức năng người dùng cơ bản
- **Agent:** `frontend-specialist`
- **Skills:** `documentation-templates`
- **Priority:** P1
- **Input:** Source code hiện tại (các route không yêu cầu role 'admin').
- **Output:** Danh sách các chức năng cần viết hướng dẫn (Đăng nhập, TopNavBar profile, Đổi mật khẩu, KanbanBoard, chức năng báo cáo cơ bản).
- **Verify:** Đối chiếu với `App.jsx` và `Sidebar.jsx` để đảm bảo không lọt chức năng admin.

### 2. Soạn thảo Hướng dẫn Đăng nhập & Quản lý Tài khoản
- **Agent:** `frontend-specialist`
- **Skills:** `plan-writing`
- **Priority:** P1
- **Input:** Màn hình Login và Profile Menu.
- **Output:** Nội dung hướng dẫn chi tiết cách đăng nhập, đăng xuất, đổi mật khẩu.
- **Verify:** Đọc lại nội dung, đảm bảo các bước (1, 2, 3...) rõ ràng, dễ làm theo. Tốt nhất nên có placeholder cho hình ảnh minh họa.

### 3. Soạn thảo Hướng dẫn các chức năng nghiệp vụ (Non-admin)
- **Agent:** `frontend-specialist`
- **Skills:** `plan-writing`
- **Priority:** P1
- **Input:** KanbanBoard, Danh sách nhân viên (nếu có quyền xem), Các report cơ bản (phiên bản user).
- **Output:** Nội dung hướng dẫn cách xem công việc, chuyển trạng thái công việc, xem thông báo.
- **Verify:** Đảm bảo ngôn từ thân thiện, hướng tới đối tượng là "Nhân viên".

### 4. Tổng hợp & Định dạng tài liệu
- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`
- **Priority:** P2
- **Input:** Kết quả từ Task 2 và 3.
- **Output:** File `docs/user-guide.md` hoàn chỉnh với cấu trúc tiêu đề Markdown (H1, H2, H3), list, và callouts (`> [!NOTE]`).
- **Verify:** Hiển thị thử file Markdown, kiểm tra format, lỗi chính tả.

## Phase X: Verification
- [x] Kiểm tra lại toàn bộ nội dung xem có lọt từ khóa "Admin", "Cài đặt hệ thống" hay không.
- [x] Chạy kiểm tra chính tả (nếu có công cụ).
- [x] Đọc lướt (skimming) để đánh giá độ dễ hiểu đối với một người mới sử dụng máy tính cơ bản.
- [x] Cập nhật file PLAN-user-guide.md đánh dấu hoàn thành.
