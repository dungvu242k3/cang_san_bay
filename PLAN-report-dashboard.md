# Báo Cáo (Report Dashboard) - Implementation Plan

## Overview
Xây dựng module "Báo cáo" với một trang Tổng quan (Dashboard) làm màn hình chính (Landing page) giúp ban lãnh đạo nhìn nhanh các chỉ số quan trọng, và các trang chi tiết về Sản lượng, Tài chính, Nhân sự. Giai đoạn này tập trung vào xây dựng UI/UX đẹp, dễ dùng với dữ liệu giả (Mock data), chưa kết nối API thực tế.

## Project Type
**WEB** (React SPA)

## Success Criteria
1. Nút "Báo Cáo" xuất hiện trên Main Menu.
2. Trang "Tổng quan" hiển thị đẹp mắt với các thẻ thông số (Stat Cards) và biểu đồ tổng hợp, responsive trên cả điện thoại và máy tính.
3. Có thể bấm trực tiếp từ các khung thông tin ở "Tổng quan" để nhảy sang trang chi tiết (Sản lượng, Tài chính, Nhân sự).
4. Các trang chi tiết hiển thị dữ liệu giả dưới dạng bảng hoặc biểu đồ rõ ràng.
5. Giao diện mượt mà, màu sắc hài hòa, không sử dụng template mặc định nhàm chán.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (áp dụng các nguyên tắc UI/UX đẹp, shadow mượt, bo góc)
- **Biểu đồ:** Recharts hoặc Chart.js (tùy thuộc vào thư viện đã có trong dự án hoặc sẽ cài thêm Recharts vì dễ dùng cho React).
- **Icons:** Lucide-react (hoặc Heroicons tùy dự án)

## File Structure

Dự kiến thư mục sẽ được tạo:
```text
src/
└── pages/
    └── Reports/
        ├── ReportDashboard.jsx      (Tổng quan - Landing)
        ├── ProductionReport.jsx     (Sản lượng)
        ├── FinanceReport.jsx        (Tài chính)
        └── HRReport.jsx             (Nhân sự)
        └── mockData.js              (File chứa dữ liệu giả chung)
```

## Task Breakdown

### Task 1: Thiết lập cấu trúc thư mục & Routing
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **Description:** Tạo các file JSX trống cho 4 trang báo cáo. Cập nhật file routing (App.jsx) và thêm menu "Báo cáo" vào thành phần điều hướng chính (Sidebar/Header).
- **INPUT → OUTPUT:** Code App.jsx/Menu → Cấu trúc file mới & Menu item hiển thị.
- **VERIFY:** Click vào menu "Báo cáo" chuyển trang thành công ra `/reports` mà không bị lỗi.

### Task 2: Xây dựng dữ liệu giả (Mock Data)
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P1
- **Description:** Tạo file `mockData.js` chứa dữ liệu tĩnh (JSON/Array) đại diện cho các chỉ số quan trọng của 3 mảng: Sản lượng, Tài chính, Nhân sự.
- **INPUT → OUTPUT:** Logic cần hiển thị → File mockData export các hằng số.
- **VERIFY:** Dữ liệu có thể được import vào console.log() thành công tại các component.

### Task 3: Phát triển trang "Tổng quan" (ReportDashboard)
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **Description:** Xây dựng landing page báo cáo. Sử dụng CSS Grid/Flexbox để bố trí các thẻ tổng quát (Stat Cards) cho 3 mảng. Có các khối biểu đồ nhỏ trích dẫn dữ liệu từ mock. Mỗi khối phải có nút "Xem chi tiết" hoặc toàn bộ khối có thể click để chuyển route. Áp dụng hover effects để tăng tính tương tác.
- **INPUT → OUTPUT:** mockData → Layout grid các thẻ tóm tắt số liệu & biểu đồ thu nhỏ.
- **VERIFY:** Giao diện hiển thị đẹp, responsive trên Mobile, click vào thẻ tài chính sẽ chuyển sang URL `/reports/finance`.

### Task 4: Phát triển 3 trang chi tiết (Sản lượng, Tài chính, Nhân sự)
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P2
- **Dependencies:** Task 2, Task 1
- **Description:** Xây dựng giao diện cho `ProductionReport.jsx`, `FinanceReport.jsx`, `HRReport.jsx`. Dùng bảng (Table) hoặc biểu đồ chi tiết để hiển thị mock data phân rã. Thêm thanh công cụ (Toolbar) giả với các chức năng bộ lọc định hướng tương lai. Có nút "Quay lại Tổng quan".
- **INPUT → OUTPUT:** mockData → Layout chi tiết.
- **VERIFY:** Click từ Tổng quan vào hiển thị đúng dữ liệu tương ứng của mảng đó. Nút back hoạt động ổn định.

### Task 5: UX Polish & Review
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`, `performance-profiling`
- **Priority:** P3
- **Dependencies:** Task 3, Task 4
- **Description:** Kiểm tra và căn chỉnh lại spacing (paddings, margins), typography, color contrast. Đảm bảo UI thoáng, sang trọng.
- **INPUT → OUTPUT:** Thành phẩm các trang → Trang có UI hoàn chỉnh, mượt mà.
- **VERIFY:** Chạy UX Audit, tự đánh giá giao diện trên bản web & mobile.

## Phase XI: Real Data Integration
- [x] Xóa bỏ dữ liệu giả (mockData.js).
- [x] Tích hợp số lượng bộ phận nhân sự thực tế từ Supabase vào HRReport.jsx.
- [x] Cập nhật các biểu đồ khác hiển thị trạng thái "Chưa có dữ liệu" chờ API.
- [x] Xác minh build thành công.

## ✅ PHASE XI COMPLETE
- Lint/Build: ✅ Pass
- Data Integration: ✅ Partial (HR Component)
- Date: 10/03/2026
