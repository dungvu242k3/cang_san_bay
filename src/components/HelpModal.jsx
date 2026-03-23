import React, { useState } from 'react';
import './HelpModal.css';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={e => e.stopPropagation()}>
        <div className="help-modal-header">
          <h3><i className="fas fa-question-circle"></i> Trợ giúp & Hướng dẫn</h3>
          <button className="help-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="help-modal-body markdown-body">

          <h1>Hướng Dẫn Sử Dụng Cơ Bản</h1>
          <p>Chào mừng bạn đến với Hệ thống BPM Cảng hàng không quốc tế Cát Bi. Tài liệu này hướng dẫn các thao tác cơ bản để sử dụng hệ thống phục vụ công việc hàng ngày.</p>

          <hr />

          <h2>1. Đăng Nhập & Quản Lý Tài Khoản</h2>

          <h3>Đăng nhập vào hệ thống</h3>
          <ol>
            <li>Mở trình duyệt web và truy cập vào đường dẫn của hệ thống.</li>
            <li>Tại màn hình <strong>Đăng nhập</strong>, nhập <strong>Mã nhân viên</strong> và <strong>Mật khẩu</strong> đã được cấp.</li>
            <li>Nhấn nút <strong>Đăng nhập</strong>.</li>
          </ol>

          <div className="login-note-box">
             <i className="fas fa-exclamation-triangle"></i>
             <div>
                <strong>Lần đầu đăng nhập:</strong>
                <p>Nếu là lần đầu đăng nhập, bạn sử dụng mật khẩu mặc định (do IT cấp). Hệ thống sẽ yêu cầu bạn <strong>đổi mật khẩu mới ngay lập tức</strong> trước khi vào màn hình chính.</p>
             </div>
          </div>

          <h3>Quên mật khẩu</h3>
          <p>Nếu quên mật khẩu, hãy liên hệ với <strong>bộ phận IT hoặc Admin</strong> để được cấp lại mật khẩu mặc định.</p>

          <h3>Đổi mật khẩu (Chủ động)</h3>
          <p>Bạn có thể chủ động đổi mật khẩu sau này bằng cách:</p>
          <ol>
            <li>Nhấp vào <strong>Avatar</strong> ở góc trên bên phải.</li>
            <li>Chọn <strong>Đổi mật khẩu</strong> và nhập các thông tin cần thiết.</li>
          </ol>

          <h3>Đăng xuất</h3>
          <ol>
            <li>Nhấp vào <strong>Avatar</strong> ở góc trên bên phải.</li>
            <li>Chọn <strong>Đăng xuất</strong>.</li>
          </ol>

          <hr />

          <h2>2. Giao Diện Chính</h2>

          <h3><i className="fas fa-chart-line"></i> Bảng Điều Khiển (Dashboard)</h3>
          <p>Hiển thị tổng quan các số liệu và trạng thái công việc cá nhân của bạn. Cung cấp cái nhìn nhanh về các nhiệm vụ cần ưu tiên xử lý.</p>

          <h3><i className="fas fa-briefcase"></i> Công Việc (Kanban Board)</h3>
          <p>Đây là nơi bạn theo dõi và quản lý các công việc:</p>
          <ul>
            <li><strong>Cột trạng thái:</strong> Công việc được chia thành các cột như <em>Chưa bắt đầu</em>, <em>Đang làm</em>, <em>Hoàn thành</em>.</li>
            <li><strong>Kéo thả:</strong> Kéo thả thẻ công việc từ cột này sang cột khác để cập nhật tiến độ.</li>
            <li><strong>Chi tiết:</strong> Nhấp vào một thẻ công việc để xem mô tả chi tiết, ngày hạn, và người liên quan.</li>
          </ul>

          <h3><i className="fas fa-calendar-alt"></i> Lịch (Calendar)</h3>
          <p>Hiển thị các sự kiện, lịch họp hoặc hạn chót công việc theo dạng lịch tháng/tuần.</p>

          <h3><i className="fas fa-chart-bar"></i> Chấm điểm</h3>
          <p>Xem và theo dõi kết quả chấm điểm đánh giá công việc của bạn.</p>

          <h3><i className="fas fa-umbrella-beach"></i> Nghỉ phép</h3>
          <p>Quản lý đơn xin nghỉ phép, xem số ngày phép còn lại và lịch sử nghỉ phép.</p>

          <h3><i className="fas fa-book"></i> Thư viện</h3>
          <p>Chứa các tài liệu dùng chung, quy trình, biểu mẫu do công ty ban hành.</p>

          <h3><i className="fas fa-file-alt"></i> Báo cáo</h3>
          <p>Xem các báo cáo tổng hợp liên quan đến công việc hoặc bộ phận của bạn.</p>

          <h3><i className="fas fa-comments"></i> Thảo luận</h3>
          <p>Không gian trao đổi, thảo luận nhóm về các vấn đề công việc.</p>

          <h3><i className="fas fa-user"></i> Hồ sơ</h3>
          <p>Xem thông tin nhân sự cá nhân, quá trình công tác.</p>

          <hr />

          <h2>3. Thao Tác Cơ Bản Với Bảng Dữ Liệu</h2>
          <ul>
            <li><strong>Tìm kiếm:</strong> Sử dụng ô tìm kiếm ở phía trên để tìm nội dung nhanh chóng.</li>
            <li><strong>Xem chi tiết:</strong> Nút icon "Con mắt" (View) ở bên phải mỗi dòng để xem đầy đủ thông tin.</li>
            <li><strong>Sắp xếp/Lọc:</strong> Bấm vào tiêu đề cột hoặc dùng nút Lọc để thay đổi cách hiển thị.</li>
          </ul>

          <hr />

          <div className="help-contact-box">
            <i className="fas fa-headset"></i>
            <div>
              <strong>Gặp lỗi hoặc cần trợ giúp?</strong>
              <p>Liên hệ: <strong>093 22 44 666 - Đào Đăng Đàn</strong></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;
