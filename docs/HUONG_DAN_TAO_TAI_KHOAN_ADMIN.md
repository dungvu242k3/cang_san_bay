# Hướng dẫn Tạo Tài khoản Admin

## Vấn đề
Khi gặp lỗi **"Mã nhân viên hoặc mật khẩu không đúng"**, thường là do tài khoản Admin chưa được tạo trong **Supabase Auth**.

## Giải pháp

### Cách 1: Tạo qua Supabase Dashboard (Khuyến nghị)

1. Đăng nhập vào **Supabase Dashboard**
2. Vào **Authentication** > **Users**
3. Click **"Add user"** hoặc **"Create new user"**
4. Điền thông tin:
   - **Email**: `ADMIN@cangsanbay.local`
   - **Password**: `123456`
   - **Auto Confirm User**: ✅ (bật)
5. Click **"Create user"**

### Cách 2: Tạo qua Script (Nếu có Service Role Key)

1. Thêm biến môi trường `SUPABASE_SERVICE_ROLE_KEY` vào file `.env`
2. Chạy script:
```bash
node scripts/create_admin_account.js
```

### Cách 3: Tạo qua Trang Quản lý NV (Nếu đã đăng nhập với tài khoản khác)

1. Đăng nhập với tài khoản có quyền SUPER_ADMIN hoặc BOARD_DIRECTOR
2. Vào trang **Quản lý NV** (`/quan-ly-nv`)
3. Tìm nhân viên có mã `ADMIN`
4. Click nút **"Tạo tài khoản"** (nếu chưa có tài khoản)

## Thông tin đăng nhập Admin

- **Mã nhân viên**: `ADMIN`
- **Email hệ thống**: `ADMIN@cangsanbay.local`
- **Mật khẩu mặc định**: `123456`
- **Vai trò**: `SUPER_ADMIN`

## Kiểm tra tài khoản đã tồn tại

Để kiểm tra xem tài khoản Admin đã được tạo chưa:

1. Vào **Supabase Dashboard** > **Authentication** > **Users**
2. Tìm email: `ADMIN@cangsanbay.local`
3. Nếu có → Tài khoản đã tồn tại
4. Nếu không có → Cần tạo mới

## Lưu ý bảo mật

⚠️ **Quan trọng**: Sau khi đăng nhập thành công, nên:
1. Đổi mật khẩu ngay lập tức
2. Vào trang **Tài khoản cá nhân** (`/tai-khoan`) để đổi mật khẩu
3. Sử dụng mật khẩu mạnh (ít nhất 8 ký tự, có chữ hoa, chữ thường, số)

## Troubleshooting

### Lỗi: "Invalid login credentials"
- Kiểm tra email: Phải là `ADMIN@cangsanbay.local` (chữ hoa)
- Kiểm tra mật khẩu: Phải là `123456`
- Kiểm tra tài khoản đã được tạo trong Supabase Auth chưa

### Lỗi: "User already exists"
- Tài khoản đã tồn tại, có thể reset mật khẩu về `123456` qua Supabase Dashboard

### Lỗi: "Email not confirmed"
- Vào Supabase Dashboard > Authentication > Users
- Tìm user `ADMIN@cangsanbay.local`
- Click vào user và confirm email thủ công
