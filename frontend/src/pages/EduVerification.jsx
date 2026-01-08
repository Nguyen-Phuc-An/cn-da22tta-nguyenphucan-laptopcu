import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/Toast';
import { apiFetch } from '../services/apiClient';
import Footer from '../components/Footer';
import '../styles/EduVerification.css';

export default function EduVerification() {
  const { token, user, setUser } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);

  console.log('[EduVerification] user context:', user);

  const [formData, setFormData] = useState({
    eduEmail: '',
    eduMssv: '',
    eduCccd: '',
    eduSchool: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const isVerified = user?.edu_verified === 1 && !!user?.edu_email;
  const isPending = user?.edu_verified === 0 && !!user?.edu_email;

  if (!token) { 
    return (
      <>
        <div className="edu-container">
          <div className="edu-card">
            <h2>Xác thực Edu</h2>
            <p className="edu-info">Vui lòng đăng nhập để xác thực tài khoản sinh viên</p>
            <a href="/login" className="edu-btn-login">Đăng nhập</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isVerified) {
    return (
      <>
        <div className="edu-container">
          <div className="edu-card edu-verified">
            <div className="edu-check-icon">✓</div>
            <h2>Tài khoản đã xác thực</h2>
            <p className="edu-verified-message">
              Chúc mừng! Tài khoản của bạn đã được xác thực là học sinh/sinh viên.
            </p>
            <div className="edu-benefits">
              <h3>Ưu đãi của bạn:</h3>
              <ul>
                <li>💰 Giảm 500.000đ cho tất cả laptop</li>
                <li>🚚 Miễn phí vận chuyển toàn quốc</li>
                <li>🛡️ Bảo hành 24 tháng</li>
              </ul>
            </div>
            <a href="/" className="edu-btn-back">Về trang chủ</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <div className="edu-container">
          <div className="edu-card edu-pending">
            <div className="edu-pending-icon"></div>
            <h2>Đang chờ xác thực</h2>
            <p className="edu-pending-message">
              Cảm ơn bạn đã gửi thông tin xác thực!
            </p>
            <div className="edu-pending-info">
              <h4>Trạng thái xác thực:</h4>
              <p>Chúng tôi sẽ kiểm chứng thông tin của bạn trong vòng <strong>24-48 giờ</strong>.</p>
              <p>Bạn sẽ nhận được email thông báo kết quả xác thực.</p>
              <ul>
                <li>Thông tin đã được gửi đến hệ thống</li>
                <li>Đang đợi xác minh từ nhà trường</li>
                <li>Kiểm tra email để nhận kết quả</li>
              </ul>
            </div>
            <a href="/" className="edu-btn-back">Về trang chủ</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.eduEmail || !formData.eduMssv || !formData.eduCccd || !formData.eduSchool) {
      addToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    if (!formData.eduEmail.includes('@')) {
      addToast('Email không hợp lệ', 'error');
      return;
    }

    if (formData.eduMssv.length < 8) {
      addToast('MSSV phải ít nhất 8 ký tự', 'error');
      return;
    }

    if (formData.eduCccd.length < 9) {
      addToast('CMND/CCCD phải ít nhất 9 ký tự', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch('/auth/edu-verification', {
        method: 'POST',
        body: {
          edu_email: formData.eduEmail,
          edu_mssv: formData.eduMssv,
          edu_cccd: formData.eduCccd,
          edu_school: formData.eduSchool
        }
      });

      if (response.success) {
        addToast('Xác thực đã được gửi! Vui lòng đợi xác nhận từ nhà trường (24-48 giờ)', 'success');
        
        // Update user context với dữ liệu edu mới từ response
        if (setUser && response.user) {
          setUser(response.user);
        }
      } else {
        addToast(response.message || 'Xác thực thất bại', 'error');
      }
    } catch (error) {
      console.error('Lỗi xác thực Edu:', error);
      addToast('Lỗi xác thực: ' + (error.message || 'Vui lòng thử lại'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="edu-container">
        <div className="edu-card">
        <div className="edu-header">
          <h2>Xác thực Tài khoản Sinh viên</h2>
          <p className="edu-subtitle">Nhận giảm giá 500.000đ cho tất cả laptop</p>
        </div>

        {/* Info Box - Left */}
        <div className="edu-info-box">
          <h4>Thông tin quan trọng:</h4>
          <ul>
            <li>Chúng tôi sẽ kiểm chứng thông tin của bạn với nhà trường trong 24-48 giờ</li>
            <li>Email sinh viên phải là email chính thức của trường học</li>
            <li>MSSV phải khớp với hồ sơ của trường</li>
            <li>Sau khi xác thực, bạn sẽ được giảm 500.000đ cho tất cả đơn hàng</li>
            <li>Giảm giá chỉ áp dụng cho học sinh/sinh viên còn đang học</li>
          </ul>
        </div>

        {/* Form - Right */}
        <form onSubmit={handleSubmit} className="edu-form">
          <div className="edu-form-group">
            <label htmlFor="eduSchool">Trường/Đại học:</label>
            <input
              type="text"
              id="eduSchool"
              name="eduSchool"
              value={formData.eduSchool}
              onChange={handleChange}
              placeholder="VD: Đại học Trà Vinh"
              required
            />
          </div>

          <div className="edu-form-group">
            <label htmlFor="eduEmail">Email sinh viên (@st.tvu.edu.vn):</label>
            <input
              type="email"
              id="eduEmail"
              name="eduEmail"
              value={formData.eduEmail}
              onChange={handleChange}
              placeholder="VD: 110122214@st.tvu.edu.vn"
              required
            />
            <small>Nhập email chính thức của trường học của bạn</small>
          </div>

          <div className="edu-form-group">
            <label htmlFor="eduMssv">Mã số sinh viên (MSSV):</label>
            <input
              type="text"
              id="eduMssv"
              name="eduMssv"
              value={formData.eduMssv}
              onChange={handleChange}
              placeholder="VD: 110122214"
              required
            />
            <small>Nhập mã số sinh viên từ thẻ học sinh</small>
          </div>

          <div className="edu-form-group">
            <label htmlFor="eduCccd">CMND/CCCD/Hộ chiếu:</label>
            <input
              type="text"
              id="eduCccd"
              name="eduCccd"
              value={formData.eduCccd}
              onChange={handleChange}
              placeholder="VD: 123456789012"
              required
            />
            <small>Nhập số CCCD của bạn</small>
          </div>

          <button 
            type="submit" 
            className="edu-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Gửi xác thực'}
          </button>
        </form>

        <div className="edu-help">
          <p>Có vấn đề? <a href="/contact">Liên hệ hỗ trợ</a></p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
