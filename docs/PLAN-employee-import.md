# Kế hoạch Review & Cải thiện Import Excel Hồ sơ

Tài liệu này phác thảo các bước để kiểm tra, đánh giá và đề xuất cải tiến cho tính năng Import nhân viên từ file Excel.

## 1. Phân tích hiện trạng (Analysis)
- **Công cụ sử dụng**: Thư viện `xlsx` để đọc file.
- **Dữ liệu hỗ trợ**: 
    - Thông tin cơ bản (`employee_profiles`)
    - Lương (`employee_salaries`)
    - Ngân hàng (`employee_bank_accounts`)
    - Hợp đồng (`labor_contracts`)
    - Bằng cấp (`employee_certificates`)
- **Cơ chế xử lý**: 
    - Mapping Header thông minh (hỗ trợ nhiều tên cột khác nhau).
    - Xử lý ngày tháng định dạng Excel và Chuỗi.
    - Cắt tách Họ và Tên tự động.
    - Chế độ Kiểm tra (Dry-run) trước khi nạp dữ liệu thật.

## 2. Câu hỏi xác định yêu cầu (Socratic Gate)
Để có thể hỗ trợ tốt nhất, tôi cần làm rõ một số điểm sau:
1. Bạn đang gặp lỗi cụ thể nào khi import (ví dụ: lỗi định dạng ngày tháng, lỗi không nhận diện được cột...)?
2. Bạn có muốn bổ sung thêm các trường mới nào vào file Excel mẫu không (ví dụ: thông tin người thân, quá trình đào tạo...)?
3. Quy trình import hiện tại có điểm nào gây khó khăn cho người dùng (ví dụ: giao diện preview khó nhìn, thông báo lỗi không rõ ràng...)?

## 3. Các hạng mục dự kiến cải thiện (Proposed Improvements)
- [ ] Tối ưu hóa logic mapping header để linh hoạt hơn.
- [ ] Cải thiện hiển thị lỗi (Validation Errors) trực quan hơn.
- [ ] Bổ sung tính năng tải file Excel mẫu (Template) ngay trên giao diện.
- [ ] Hỗ trợ cập nhật thông tin cho nhân viên đã tồn tại thay vì chỉ bỏ qua (onConflict: update).

## 4. Kế hoạch triển khai (Phases)
- **Phase 1**: Thu thập yêu cầu và file Excel mẫu (nếu có).
- **Phase 2**: Sửa lỗi logic hiện có (nếu có).
- **Phase 3**: Triển khai các tính năng mới/cải tiến UI.
- **Phase 4**: Kiểm thử với dữ liệu thật.
