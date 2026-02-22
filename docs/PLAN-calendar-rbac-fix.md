# Plan: Fix Calendar RBAC Permissions

## Vấn đề

Các nút **Sửa** và **Xóa** trong modal chi tiết sự kiện không hiển thị cho DEPT_HEAD/TEAM_LEADER dù họ có `can_edit`/`can_delete` = `true` trong ma trận.

## Nguyên nhân gốc

`canPerformAction` trong `rbac.js` kiểm tra scope bằng `targetData.department` / `targetData.team`. Nhưng dữ liệu sự kiện từ bảng `events` **không có** các trường này — chỉ có `created_by` (mã nhân viên người tạo).

→ Kết quả: `targetData.department === user.dept_scope` luôn trả về `false` → nút Sửa/Xóa bị ẩn.

## Proposed Changes

### Core Logic

#### [MODIFY] [rbac.js](file:///c:/Users/dungv/cang_san_bay/src/utils/rbac.js)

Thêm logic hỗ trợ **ownership-based check** cho các module không có dept/team (như calendar):
- Nếu `targetData` có `created_by` nhưng **không có** `department`/`team` → kiểm tra xem người dùng có phải người tạo hay cùng dept/team với người tạo không.
- DEPT_HEAD/TEAM_LEADER có thể edit/delete sự kiện nếu:
  - Họ là người tạo sự kiện (`created_by === user.employee_code`), HOẶC
  - Họ có quyền matrix (`can_edit`/`can_delete`) — bỏ qua scope check cho module `calendar` vì events đã được lọc theo scope khi fetch.

> [!IMPORTANT]  
> Sự kiện lịch đã được **pre-filtered** khi fetch (line 644-651 trong Calendar.jsx). User chỉ thấy events trong phạm vi của mình. Vì vậy nếu user đã có quyền matrix, ta có thể cho phép edit/delete mà không cần thêm scope check.

### UI

#### [MODIFY] [Calendar.jsx](file:///c:/Users/dungv/cang_san_bay/src/pages/Calendar.jsx)

Không cần sửa logic render. Chỉ cần `checkAction` trả đúng kết quả thì nút sẽ tự hiện.

## Verification Plan

### Manual Verification
1. Login DEPT_HEAD → mở sự kiện → phải thấy nút Sửa & Xóa
2. Login TEAM_LEADER → mở sự kiện → phải thấy nút Sửa & Xóa
3. Login STAFF → mở sự kiện → chỉ thấy nút Sửa/Xóa cho sự kiện tự tạo
4. SUPER_ADMIN → luôn thấy tất cả nút
