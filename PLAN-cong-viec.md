# Kế hoạch bổ sung bộ lọc theo Phòng ban cho module Công việc (Tasks)

## Mục tiêu
Bổ sung thêm tính năng lọc theo Phòng ban (Department filter) cho module Công việc (`Tasks.jsx`), đáp ứng nhu cầu xem danh sách theo phòng ban thay vì chỉ lọc theo từng nhân viên riêng lẻ.

## Phân tích hiện trạng
- File hiện tại `src/pages/Tasks.jsx`.
- Đã có state lọc theo Nhân sự (`filterEmployee`), Trạng thái (`filterStatus`), Thời gian (`fromDate`, `toDate`), và Từ khóa tìm kiếm (`searchTerm`).
- Có sẵn hàm `getVisibleDepartments()` có thể sử dụng làm nguồn dữ liệu cho dropdown bộ lọc Phòng ban.
- Hàm tính toán kết quả `getFilteredTasks()` đã có nhưng chưa bao gồm logic lọc theo phòng ban (so khớp với danh sách user trong phòng đó).

## Các bước triển khai (4-Phase)

### Phase 1: Bổ sung State (Phân tích)
- Bổ sung state `filterDepartment` vào đầu component với giá trị mặc định là chuỗi rỗng `''`.
- Sửa state `filterEmployee` thành có liên kết logic với `filterDepartment` (chọn Phòng ban thì chỉ hiển thị nhân viên phòng ban đó trong list lọc).

### Phase 2: Cập nhật Cấu trúc Code
- Chỉnh sửa logic của component `Tasks` để khi `filterDepartment` thay đổi, danh sách `Employees` trong Select sẽ thay đổi theo, hoặc giữ nguyên và độc lập lọc.

### Phase 3: Sửa đổi Giao diện (UI) Thanh lọc
- `<div className="task-filter-group">` hiện tại cần bổ sung thêm 1 thanh dropdown `<select>` ngay cạnh thanh tìm kiếm Nhân viên.
- Các options trong `<select>` lấy qua hàm `getVisibleDepartments()`.
- Bổ sung tuỳ chỉnh CSS `isMobile` để hiển thị trên thiết bị di động không bị tràn dòng.

### Phase 4: Cập nhật hàm lọc Data (`getFilteredTasks`)
- Logic mở rộng: Nếu `filterDepartment` có giá trị, hệ thống sẽ lọc những tasks mà được assign cho chính `DEPARTMENT` đó, hoặc được phân cho `PERSON` (nhân viên) nhưng nhân viên này thuộc `DEPARTMENT` đó (`employee.dept === filterDepartment`).

## Xác nhận kiểm thử
1. Đảm bảo thanh select hiển thị đủ phòng ban khi đăng nhập admin, và hiển thị đúng 1 phòng ban (của chính họ) khi đăng nhập tài khoản Trưởng phòng (`DEPT_HEAD`).
2. Xác nhận danh sách task đổ về chính xác khi chọn 1 phòng ban.
3. Chắc chắn responsive trên điện thoại di động ở phần Filter Group xử lý đẹp mắt.
