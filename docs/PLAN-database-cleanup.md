# KẾ HOẠCH: Dọn dẹp và Tối ưu hóa Cơ sở dữ liệu

> **Mục tiêu**: Loại bỏ các file migration thừa và các bảng cơ sở dữ liệu không sử dụng để làm sạch cấu trúc dự án.

## 1. Kết quả Phân tích

### 1.1. Thống kê Migration
- **Tổng số file**: 47 file migration trong thư mục `supabase/migrations`.
- **Trạng thái**: Nhiều file là "cập nhật tăng dần" (ví dụ: `add_column_to_X`), điều này là bình thường trong quá trình phát triển nhưng gây lộn xộn khi cần trạng thái sạch.

### 1.2. Các phần thừa được xác định
| File / Tính năng | Trạng thái | Lý do |
|------------------|------------|-------|
| `20260130_create_employee_leaves.sql` | **Dư thừa** | Đã được thay thế bởi `20260201_recreate_employee_leaves.sql` |
| `20260201_create_events_module.sql` | **Không dùng** | Không tìm thấy việc sử dụng trong `Calendar.jsx` hoặc các file frontend khác. |
| `20260202_create_import_audit.sql` | **Không dùng** | Không tìm thấy việc sử dụng trong `EmployeeImport.jsx`. |
| `20260130_fix_rls.sql` | **Lỗi thời** | Có thể đã được thay thế bởi các định nghĩa bảng mới hơn hoặc các sửa lỗi RLS khác. |

### 1.3. Lộn xộn do cập nhật nhỏ
Nhiều migration gần đây chỉ thêm 1-2 cột:
- `20260202_add_rejection_reason.sql` (Thêm lý do từ chối)
- `20260202_add_status_column.sql` (Thêm cột trạng thái)
- `20260202_add_password_to_employee_profiles.sql` (Thêm mật khẩu)
Những file này có thể được gộp vào các script tạo bảng chính nếu chúng ta thực hiện reset toàn bộ, nhưng hiện tại, chúng ta có thể giữ lại hoặc gộp chúng nếu muốn có một "khởi đầu sạch".

---

## 2. Các thay đổi đề xuất

### 2.1. Xóa các Migration dư thừa
- [ ] Xóa `20260130_create_employee_leaves.sql` (Giữ lại `20260201_recreate_...`)
- [ ] Xóa `20260201_create_events_module.sql` (Tính năng chưa được triển khai)
- [ ] Xóa `20260202_create_import_audit.sql` (Tính năng chưa được triển khai)

### 2.2. Dọn dẹp Cơ sở dữ liệu (SQL)
- [ ] Xóa bảng `events` (nếu tồn tại)
- [ ] Xóa bảng `import_audit` (nếu tồn tại)

### 2.3. Kiểm tra xác minh
- [ ] Chạy `npm run dev` để đảm bảo không có import nào bị lỗi.
- [ ] Kiểm tra các trang `Nhân viên` (Employees) và `Nghỉ phép` (Leaves) để đảm bảo chức năng cốt lõi vẫn hoạt động.

---

## 3. Rủi ro & Biện pháp giảm thiểu
- **Rủi ro**: Xóa `events` có thể làm hỏng một phụ thuộc ẩn.
- **Biện pháp**: Tôi đã tìm kiếm từ khóa "events" trong `src` và không thấy sử dụng trong giao diện (UI). Việc sử dụng ở Backend là không có khả năng vì Supabase kết nối trực tiếp với frontend là chủ yếu.

---

## 4. Các bước tiếp theo
1. **Phê duyệt** kế hoạch này.
2. **Thực thi** việc xóa các file.
3. **Chạy** các lệnh xóa bảng (tùy chọn, hoặc cứ để chúng là các bảng "chết").
