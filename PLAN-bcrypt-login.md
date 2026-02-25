# Plan: Bcrypt Login Integration & First-time Password Reset

## Overview
Dự án hiện đang sử dụng `crypto.subtle.digest('SHA-256')` ở phía frontend để mã hóa mật khẩu trước khi so sánh với Supabase. Việc này không bảo mật. Thêm vào đó, tất cả người dùng hiện đang có mật khẩu chung là `123456` ở dạng plain text trong cơ sở dữ liệu.
Yêu cầu là:
1. Chuyển đổi mã hóa mật khẩu sang `bcrypt` tại Supabase (backend).
2. Khi người dùng đăng nhập lần đầu tiên với mật khẩu mặc định `123456`, hệ thống bắt buộc họ trang đổi mật khẩu mới.
3. Mật khẩu mới sẽ được băm bằng `bcrypt` trước khi lưu vào cơ sở dữ liệu.

## Project Type
WEB (React/Vite) & BACKEND (Supabase/PostgreSQL)

## Architecture Decision
Sử dụng **PostgreSQL `pgcrypto` Extension** trên Supabase. Nó cho phép mã hóa và kiểm tra mã băm bcrypt trực tiếp dùng RPC functions, vừa an toàn (không bị rò rỉ hash về client) vừa cực kỳ nhanh chóng so với việc cài đặt bcryptjs trên client-side.

## Task Breakdown

### Task 1: Thiết lập Database Schema & RPC Functions (Backend Supabase)
- **agent**: `backend-specialist`
- **skills**: `database-design`
- **priority**: P0
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: Lệnh SQL kích hoạt `pgcrypto`.
  - OUTPUT: Cấu trúc cơ sở dữ liệu đã kích hoạt phần băm. Tạo một hàm đăng nhập RPC (ví dụ: `verify_user_password`) và hàm thay đổi mật khẩu RPC (`update_user_password`).
  - VERIFY: Hàm RPC hoạt động trực tiếp khi test qua SQL Query của Supabase.

### Task 2: Refactor `AuthContext.jsx` Frontend Logic
- **agent**: `frontend-specialist`
- **skills**: `clean-code`
- **priority**: P1
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: `AuthContext.jsx` hiện tại.
  - OUTPUT: Lược bỏ tất cả logic tự băm SHA-256. Gửi password trực tiếp lên RPC function từ bước 1. Lưu thêm cờ (flag) vào state nếu nhận ra login bằng `123456`.
  - VERIFY: Đăng nhập được thành công thông qua RPC function.

### Task 3: Phát triển Giao diện Bắt Buộc Đổi Mật Khẩu
- **agent**: `frontend-specialist`
- **skills**: `clean-code`, `frontend-design`
- **priority**: P1
- **INPUT \u2192 OUTPUT \u2192 VERIFY**: 
  - INPUT: Yêu cầu bắt buộc chuyển trang khi đăng nhập bằng `123456`.
  - OUTPUT: Component `ForceChangePasswordModal` hoặc trang điều hướng `MustChangePassword.jsx`. Gọi hàm RPC đổi mật khẩu (Task 1).
    - **UI Feature**: Bao gồm hướng dẫn trực quan (text mô tả rõ ràng) bắt buộc tạo mật khẩu chứa CẢ chữ và số (`Regex: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/`).
    - **UI Feedback**: Hiển thị thông báo lỗi màu đỏ rõ ràng nếu người dùng nhập sai định dạng hoặc quá ngắn.
  - VERIFY: Vượt qua được màn hình chặn này chỉ khi mật khẩu nhập đúng định dạng (chữ và số) và không phải "123456". Cập nhật trực tiếp lên database dạng mã băm Bcrypt.

## Phase X: Verification
- [ ] Test trường hợp 1: Tạo nhân viên mới mật khẩu "123456". Đăng nhập -> Màn hình bắt đổi mật khẩu hiển thị. Đổi mật khẩu thành công.
- [ ] Test trường hợp 2: Bấm F5 trên trang bị khoá đổi mật khẩu -> không cho phép bypass (vẫn ép đổi tiếp hoặc tự đăng xuất nếu back).
- [ ] Test trường hợp 3: Database Supabase phải lưu mật khẩu mới dưới dạng Hash Bcrypt (Bắt đầu bằng `$2a$` hoặc `$2b$`), không còn "123456".
