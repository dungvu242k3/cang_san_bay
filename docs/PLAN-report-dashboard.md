# Project Plan: Report Dashboard

## Overview
Xây dựng phân hệ Báo Cáo (Report Dashboard) cho ứng dụng theo mô trúc phân cấp.
Báo cáo sẽ bao gồm 4 phần chính: Tổng quan, Sản lượng, Tài chính, và Nhân sự. Trang "Tổng quan" sẽ đóng vai trò là Landing Page hiển thị các chỉ số (KPIs) quan trọng để ban lãnh đạo nhìn nhanh. Từ đó, người dùng có thể bấm vào từng hạng mục để xem thông tin chi tiết.

## Project Type
WEB

## Success Criteria
- [ ] Có một sub-navigation (Tabs) để dễ dàng chuyển qua lại giữa Tổng quan và các báo cáo chi tiết trực tiếp.
- [ ] Trang "Tổng quan" có giao diện Dashboards với các Widget summary cho Sản lượng, Tài chính, Nhân sự. Mỗi Widget có nút "Xem chi tiết" dẫn link tới các phần tương ứng.
- [ ] Các trang báo cáo chi tiết hiển thị đúng cấu trúc (List/Grid/Table tùy view) với mock-data.
- [ ] Giao diện Responsive hoàn thiện, thân thiện trên màn hình điện thoại cho cán bộ cấp quản lý truy cập từ xa.

## Tech Stack
- Frontend: React (JSX), CSS/TailwindCSS (kế thừa từ setup hiện tại).
- Biểu đồ thống kê: Sẽ chọn framework nội bộ hiện có hoặc bổ sung (cần xác nhận của user).

## File Structure
```text
src/
└── components/ (hoặc pages/ tùy cấu trúc codebase hiện tại)
    └── reports/
        ├── ReportLayout.jsx      # Chứa SubTabs/Header của mục Báo Cáo
        ├── ReportOverview.jsx    # Tổng quan (Report Home)
        ├── ProductionReport.jsx  # Chi tiết Sản lượng
        ├── FinanceReport.jsx     # Chi tiết Tài chính
        └── HRReport.jsx         # Chi tiết Nhân sự
```

## Task Breakdown

### Task 1: Khởi tạo Cấu trúc Navigation cho Báo cáo
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `clean-code`
- **Priority**: P1
- **Dependencies**: None
- **INPUT**: Định nghĩa cấu trúc file thư mục mới cho tính năng Report.
- **OUTPUT**: `ReportLayout.jsx` tích hợp Tabs Header cho (Tổng quan, Sản lượng, Tài chính, Nhân sự). Thêm Routing trong Main router (`/reports`, `/reports/production`, ... ) hoặc render động qua `activeTab`.
- **VERIFY**: Bấm "Báo cáo" trên menu chính hiển thị ra giao diện có các tab con. Tabs đổi nội dung được (bằng rỗng hoặc Mock component).

### Task 2: Hiện thực Trang Landing Nhìn Nhanh (Tổng Quan)
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Priority**: P1
- **Dependencies**: Task 1
- **INPUT**: `ReportOverview.jsx`
- **OUTPUT**: Giao diện gồm 3 Cards lớn đại diện cho: Sản lượng, Tài chính, Nhân sự. Hiển thị thông số tổng quát nhất (tăng/giảm) và nút `onClick` điều hướng đến chức năng chi tiết trong Tab.
- **VERIFY**: Responsive mobile hoàn chỉnh, hiển thị đẹp, các nút bấm hoạt động tốt dẫn đến thay đổi tab.

### Task 3: Hiện thực Trang Chi tiết "Sản lượng"
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`, `clean-code`
- **Priority**: P2
- **Dependencies**: Task 1
- **INPUT**: `ProductionReport.jsx`
- **OUTPUT**: Danh sách hạng mục sản lượng (View theo ngày/tuần), sử dụng mock data để test UI.
- **VERIFY**: Không bị vỡ Layout trên thiết bị Mobile.

### Task 4: Hiện thực Trang Chi tiết "Tài chính"
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Priority**: P2
- **Dependencies**: Task 1
- **INPUT**: `FinanceReport.jsx`
- **OUTPUT**: Trình bày biểu đồ thu chi cơ bản hoặc bảng thống kê tài chính, tính toán dòng tiền mock data.
- **VERIFY**: Hiển thị bảng rành mạch, có format tiền tệ hợp lý. 

### Task 5: Hiện thực Trang Chi tiết "Nhân sự"
- **Agent**: `frontend-specialist`
- **Skills**: `frontend-design`
- **Priority**: P2
- **Dependencies**: Task 1
- **INPUT**: `HRReport.jsx`
- **OUTPUT**: Trình bày tổng quan kíp trực, công, OT, vi phạm (nếu có) thông qua mock data.
- **VERIFY**: Đảm bảo layout trên PC dạng bảng, Mobile dạng thẻ card.

## Phase X: Verification (Checklist)
- [x] Giao diện (UX/UI): Không dùng màu purple/violet. Components rõ ràng.
- [x] Bảo mật: Routing này có yêu cầu phân quyền "chỉ sếp xem" hay không? (Socratic gate).
- [x] Mobile-First Audit: Form, Button, Touch Targets phải to và rõ.
- [x] Code Lint & Compile `npm run build` hoặc start thành công tự động không có exception.

---
## ✅ PHASE X COMPLETE
_Đã hoàn thiện tất cả các nhiệm vụ Phase 1_
