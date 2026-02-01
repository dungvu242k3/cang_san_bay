# Kế hoạch Triển khai Hệ thống Đăng nhập & Xác thực

## Mục tiêu
Triển khai hệ thống đăng nhập sử dụng **Mã nhân viên** với các tính năng:
1. Đăng nhập mặc định bằng `Mã nhân viên` và mật khẩu `123456`.
2. Bắt buộc đổi mật khẩu trong lần đăng nhập đầu tiên.
3. Quên mật khẩu: Gửi OTP xác thực qua email (tích hợp Microsoft 365).

---

## ⚠️ Cần User Xác nhận (Quan trọng)

> [!IMPORTANT]
> **Phương pháp xác thực (Authentication Method)**
> Tôi đề xuất **phương án Hybrid**:
> - Sử dụng hệ thống **Supabase Auth** chuẩn để bảo mật (JWT, RLS).
> - Backend sẽ tự động map `Mã nhân viên` thành email hệ thống: `[MaNV]@system.local`.
> - **Lợi ích**: Tận dụng được RLS có sẵn, bảo mật cao hơn tự viết bảng user riêng.
> - **User chỉ cần nhập**: Mã NV + Mật khẩu. Hệ thống tự xử lý đoạn email ẩn bên dưới.

> [!NOTE]
> **Gửi Email OTP**
> Trong giai đoạn phát triển này, nếu chưa có **API Key/Credentials** của Microsoft 365, tôi sẽ tạo một **Mock Service** (Giả lập gửi mail - in ra console hoặc hiện thông báo UI) để dev flow trước.

---

## Thay đổi đề xuất

### 1. Cơ sở dữ liệu (Database)
#### [NEW] `supabase/migrations/20260201_create_auth_setup.sql`
- **Thay đổi bảng `employee_profiles`**:
    - Thêm cột `email` (TEXT, UNIQUE) để phục vụ việc gửi OTP/Liên hệ chính.
- **Tự động hóa User**:
    - Trigger `on_employee_created`: Khi thêm nhân viên mới -> Tự động `INSERT` vào `auth.users`.
    - Quy tắc map: `email = [employee_code]@cangsanbay.local`, `password = 123456`.
- **Bảng `public.user_security_settings`**:
    - `user_id` (UUID, FK auth.users - Primary Key)
    - `force_change_password` (BOOLEAN, Default: TRUE)
    - `otp_code` (TEXT, Nullable)
    - `otp_expiry` (TIMESTAMPTZ, Nullable)
    - `created_at`, `updated_at`

### 2. Backend (Edge Functions / RPC)
- **RPC `verify_otp_and_reset_password`**: Xác thực OTP và cho phép đặt lại pass.
- **Edge Function `send-otp`**: Kết nối MS Graph API để gửi mail (hoặc Mock).

### 3. Frontend (React)
#### [NEW] `src/pages/Login.jsx`
- Form đăng nhập: Input Mã nhân viên + Password.
- Xử lý lỗi đăng nhập, loading state.

#### [NEW] `src/components/FirstLoginModal.jsx`
- Popup bắt buộc đối mật khẩu nếu `force_change_password == true`.

#### [NEW] `src/pages/ForgotPassword.jsx`
- Bước 1: Nhập Mã nhân viên -> Hệ thống tìm email và gửi OTP.
- Bước 2: Nhập OTP -> Nhập mật khẩu mới.

#### [MODIFY] `src/contexts/AuthContext.jsx`
- Cập nhật hàm `login`: Logic map Mã NV -> Email.
- Thêm check `force_change_password` sau khi login thành công.

---

## Kế hoạch kiểm thử (Verification Plan)

### Automated Tests
- Script test tạo user mới và thử đăng nhập default.

### Manual Verification
1. Dùng user mới tạo: Đăng nhập với pass `123456` -> Kiểm tra xem có hiện popup đổi mật khẩu không.
2. Đổi mật khẩu -> Logout -> Login lại bằng pass mới.
3. Click "Quên mật khẩu" -> Nhập mã NV -> Kiểm tra xem OTP có được "gửi" (mock) không -> Reset pass thành công.
