# Flow Đăng Nhập - Nguồn Dữ Liệu

## Tổng quan

Hệ thống đăng nhập sử dụng **2 nguồn dữ liệu chính**:

1. **Supabase Auth** - Xác thực mật khẩu
2. **Database Tables** - Lấy thông tin nhân viên và quyền

## Flow Chi Tiết

### Bước 1: Người dùng nhập thông tin
- **Mã nhân viên**: Ví dụ `ADMIN`, `CBA0001`
- **Mật khẩu**: Ví dụ `123456`

**File**: `src/pages/Login.jsx`
```javascript
await login(employeeCode.trim().toUpperCase(), password)
```

### Bước 2: Xác thực với Supabase Auth
- **File**: `src/contexts/AuthContext.jsx` → hàm `login()`
- **Email format**: `{EMPLOYEE_CODE}@cangsanbay.local`
  - Ví dụ: `ADMIN` → `ADMIN@cangsanbay.local`
- **API**: `supabase.auth.signInWithPassword()`
- **Nguồn**: Supabase Auth (bảng `auth.users`)

```javascript
const email = `${employeeCode.toUpperCase()}@cangsanbay.local`
const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
})
```

**⚠️ Lưu ý**: Tài khoản phải được tạo trong **Supabase Auth** trước!

### Bước 3: Lấy thông tin nhân viên (sau khi login thành công)
- **Trigger**: `onAuthStateChange` event
- **File**: `src/contexts/AuthContext.jsx` → hàm `fetchUserRole()`

#### 3.1. Extract employee_code từ email
```javascript
const employeeCode = authUser?.email?.split('@')[0] 
// Ví dụ: "ADMIN@cangsanbay.local" → "ADMIN"
```

#### 3.2. Lấy Profile từ `employee_profiles`
```javascript
const { data: profile } = await supabase
    .from('employee_profiles')
    .select('*')
    .eq('employee_code', employeeCode)
    .single()
```
**Nguồn**: Bảng `public.employee_profiles` trong Supabase Database

#### 3.3. Lấy Role từ `user_roles`
```javascript
const { data: roleData } = await supabase
    .from('user_roles')
    .select('*')
    .eq('employee_code', employeeCode)
    .single()
```
**Nguồn**: Bảng `public.user_roles` trong Supabase Database

#### 3.4. Lấy Permissions từ `rbac_matrix`
```javascript
const userLevel = roleData?.role_level || 'STAFF'
const { data: permissionMatrix } = await supabase
    .from('rbac_matrix')
    .select('*')
    .eq('role_level', userLevel)
```
**Nguồn**: Bảng `public.rbac_matrix` trong Supabase Database

### Bước 4: Set User State
```javascript
setUser({
    id: profile.id,
    email: authUser?.email,
    employee_code: profile.employee_code,
    role_level: userLevel,
    dept_scope: roleData?.dept_scope,
    team_scope: roleData?.team_scope,
    permissions: permissionMatrix || [],
    profile: { ...profile },
    authUser: authUser
})
```

## Sơ Đồ Flow

```
User Input (ADMIN, 123456)
    ↓
Login.jsx → login(employeeCode, password)
    ↓
AuthContext.login()
    ↓
supabase.auth.signInWithPassword("ADMIN@cangsanbay.local", "123456")
    ↓
[SUPABASE AUTH] ✅ Xác thực mật khẩu
    ↓
onAuthStateChange triggered
    ↓
fetchUserRole(authUser)
    ↓
Extract: employeeCode = "ADMIN"
    ↓
[DATABASE] employee_profiles WHERE employee_code = 'ADMIN'
    ↓
[DATABASE] user_roles WHERE employee_code = 'ADMIN'
    ↓
[DATABASE] rbac_matrix WHERE role_level = 'SUPER_ADMIN'
    ↓
setUser({ ... })
    ↓
✅ Đăng nhập thành công
```

## Các Bảng Dữ Liệu Cần Thiết

### 1. Supabase Auth (`auth.users`)
- **Email**: `ADMIN@cangsanbay.local`
- **Password**: `123456` (hashed)
- **Tạo**: Qua Supabase Dashboard hoặc `supabase.auth.admin.createUser()`

### 2. `employee_profiles`
- **employee_code**: `ADMIN`
- **last_name**: `Quản trị`
- **first_name**: `Hệ Thống`
- **Tạo**: Qua SQL script (`quick_setup.sql`)

### 3. `user_roles`
- **employee_code**: `ADMIN`
- **role_level**: `SUPER_ADMIN`
- **Tạo**: Qua SQL script (`quick_setup.sql`)

### 4. `rbac_matrix`
- **role_level**: `SUPER_ADMIN`
- **permission_key**: `dashboard`, `tasks`, etc.
- **Tạo**: Qua SQL script (`quick_setup.sql`)

## Lỗi Thường Gặp

### "Mã nhân viên hoặc mật khẩu không đúng"
**Nguyên nhân**: Tài khoản chưa có trong Supabase Auth
**Giải pháp**: Tạo tài khoản trong Supabase Dashboard > Authentication > Users

### "Error fetching user role"
**Nguyên nhân**: 
- Không có profile trong `employee_profiles`
- Không có role trong `user_roles`
**Giải pháp**: Chạy `quick_setup.sql` để tạo dữ liệu mẫu

### User null sau khi login
**Nguyên nhân**: `profile` không tồn tại hoặc query lỗi
**Giải pháp**: Kiểm tra console log và đảm bảo có dữ liệu trong database

## Debug

Thêm logging vào `fetchUserRole()`:

```javascript
console.log('🔍 Fetching user data for:', employeeCode)
console.log('📧 Auth email:', authUser?.email)
console.log('👤 Profile:', profile)
console.log('🔐 Role:', roleData)
console.log('✅ Final user:', user)
```
