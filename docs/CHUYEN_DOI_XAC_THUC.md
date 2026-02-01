# Chuyển Đổi Xác Thực - Từ Supabase Auth sang Database

## Tổng Quan

Hệ thống đã được chuyển từ xác thực bằng **Supabase Auth** sang xác thực trực tiếp từ bảng **`employee_profiles`** trong database.

## Thay Đổi Chính

### 1. Database Schema

**Migration**: `supabase/migrations/20260202_add_password_to_employee_profiles.sql`

- Thêm cột `password` (TEXT) vào bảng `employee_profiles`
- Password được hash bằng SHA-256 trước khi lưu
- Hỗ trợ cả plain text (để migration) và hashed password

### 2. Authentication Flow

#### Trước (Supabase Auth):
```
Login → supabase.auth.signInWithPassword() 
     → Supabase Auth (auth.users table)
     → fetchUserRole()
```

#### Sau (Database):
```
Login → Query employee_profiles WHERE employee_code = 'ADMIN'
     → Verify password (hash comparison)
     → fetchUserRole()
```

### 3. Password Hashing

- **Algorithm**: SHA-256 (Web Crypto API)
- **Location**: Client-side (trong AuthContext, Profile, Employees, etc.)
- **Format**: 64-character hexadecimal string

```javascript
const hashPassword = async (password) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}
```

### 4. Session Management

- **Trước**: Supabase Auth session (JWT tokens)
- **Sau**: localStorage (`currentEmployeeCode`)
- **Logout**: Xóa `currentEmployeeCode` từ localStorage

## Các File Đã Cập Nhật

### 1. `src/contexts/AuthContext.jsx`
- ✅ Xóa dependency vào Supabase Auth
- ✅ `login()`: Xác thực từ `employee_profiles`
- ✅ `fetchUserRole()`: Không cần `authUser` parameter
- ✅ `logout()`: Chỉ xóa localStorage
- ✅ Session check từ localStorage thay vì Supabase session

### 2. `src/pages/Profile.jsx`
- ✅ `handlePasswordChange()`: Update password trong database
- ✅ Hash password trước khi lưu

### 3. `src/pages/Employees.jsx`
- ✅ `handleSaveEmployee()`: Tự động hash và lưu password khi tạo mới
- ✅ `confirmResetPassword()`: Reset password trong database

### 4. `src/pages/EmployeeImport.jsx`
- ✅ Hash password trước khi insert

### 5. `src/pages/UserManagement.jsx`
- ✅ `handleCreateAccount()`: Lưu password vào database
- ✅ `handleSavePassword()`: Update password trong database
- ✅ `handleDeleteAccount()`: Xóa password (set null) thay vì xóa auth user
- ✅ Check `hasAccount` dựa trên `password` field

### 6. `supabase/quick_setup.sql`
- ✅ Thêm password mặc định cho Admin

## Migration Steps

### Bước 1: Chạy Migration
```sql
-- Chạy trong Supabase SQL Editor
\i supabase/migrations/20260202_add_password_to_employee_profiles.sql
```

### Bước 2: Set Password cho Admin
```sql
UPDATE employee_profiles 
SET password = '123456' 
WHERE employee_code = 'ADMIN';
```

### Bước 3: Set Password cho các nhân viên khác
- Qua trang Import: Tự động hash và lưu
- Qua trang Quản lý NV: Tạo tài khoản sẽ hash và lưu
- Qua SQL: Có thể set plain text, sẽ được hash khi đăng nhập

## Lưu Ý Bảo Mật

⚠️ **Quan trọng**:
1. **Password Hashing**: Hiện tại hash ở client-side (SHA-256). Trong production nên:
   - Hash ở server-side (PostgreSQL function hoặc Edge Function)
   - Sử dụng bcrypt hoặc argon2 thay vì SHA-256
   - Thêm salt cho mỗi password

2. **Password Storage**: 
   - Không lưu plain text trong database
   - Luôn hash trước khi lưu
   - Migration hiện tại cho phép plain text để tương thích

3. **Session Security**:
   - localStorage có thể bị XSS attack
   - Cân nhắc dùng httpOnly cookies trong production
   - Hoặc implement JWT tokens riêng

## Testing

1. **Đăng nhập với Admin**:
   - Mã: `ADMIN`
   - Password: `123456`
   - Nguồn: `employee_profiles.password`

2. **Đổi mật khẩu**:
   - Vào `/tai-khoan` → Tab "Đổi mật khẩu"
   - Password mới sẽ được hash và lưu vào database

3. **Reset password**:
   - Vào `/quan-ly-nv` → Reset password
   - Password sẽ được hash và cập nhật

## Troubleshooting

### Lỗi: "Mã nhân viên hoặc mật khẩu không đúng"
- Kiểm tra password có trong `employee_profiles.password` không
- Kiểm tra password có được hash đúng không
- Console log sẽ hiển thị chi tiết

### Lỗi: "Could not find the 'password' column"
- Chạy migration `20260202_add_password_to_employee_profiles.sql`
- Hoặc thêm cột thủ công:
  ```sql
  ALTER TABLE employee_profiles ADD COLUMN password TEXT;
  ```

### Password không khớp sau khi hash
- Kiểm tra hàm `verifyPassword()` có đúng logic không
- Plain text password sẽ so sánh trực tiếp
- Hashed password sẽ hash input rồi so sánh
