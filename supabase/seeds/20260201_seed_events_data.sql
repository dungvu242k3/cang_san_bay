-- Seed Data for Events Module
-- Description: Sample events and notifications for testing Calendar UI

-- Insert Events
INSERT INTO public.events (title, description, start_time, end_time, is_all_day, event_type, scope, location, created_by)
VALUES
    (
        'Họp giao ban tuần',
        'Đánh giá tiến độ dự án HRM',
        NOW() + INTERVAL '1 day 09:00:00',
        NOW() + INTERVAL '1 day 10:30:00',
        false,
        'MEETING',
        'UNIT',
        'Phòng họp A1',
        'NV0001'
    ),
    (
        'Training hệ thống mới',
        'Đào tạo sử dụng module Công việc',
        NOW() + INTERVAL '2 days 08:00:00',
        NOW() + INTERVAL '2 days 17:00:00',
        false,
        'EVENT',
        'COMPANY',
        'Hội trường lớn',
        'NV0002'
    ),
    (
        'Gửi báo cáo tài chính',
        'Hạn chót gửi báo cáo cho kế toán',
        NOW() + INTERVAL '3 days 16:00:00',
        NOW() + INTERVAL '3 days 17:00:00',
        false,
        'REMINDER',
        'PERSONAL',
        NULL,
        'NV0001'
    ),
    (
        'Nghỉ phép Team Building',
        'Toàn bộ phòng IT đi nghỉ mát',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '5 days',
        true,
        'EVENT',
        'UNIT',
        'Đà Nẵng',
        'NV0001'
    );

-- Insert Notifications
INSERT INTO public.notifications (recipient_code, title, content, is_read, notification_type, link_url)
VALUES
    ('NV0001', 'Nhắc nhở công việc', 'Bạn có công việc "Xây dựng module Lịch" sắp đến hạn.', false, 'WARNING', '/cong-viec'),
    ('NV0001', 'Thông báo hệ thống', 'Hệ thống đã cập nhật tính năng Lịch làm việc mới.', false, 'INFO', '/calendar'),
    ('NV0002', 'Lời mời họp', 'Bạn được mời tham gia cuộc họp "Họp giao ban tuần".', true, 'INFO', '/calendar');
