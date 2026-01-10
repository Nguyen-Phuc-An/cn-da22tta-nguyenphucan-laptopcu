import React, { useState, useContext } from 'react';
import { createContact } from '../services/contacts';
import { ToastContext } from '../context/ToastContext';
import '../styles/Contact.css';

export default function Contact() {
  const { addToast } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createContact({
        ten: formData.name,
        email: formData.email,
        dien_thoai: formData.phone,
        tieu_de: formData.subject,
        noi_dung: formData.message
      });

      setLoading(false);
      addToast('Cảm ơn bạn! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 'success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setLoading(false);
      console.error('Error submitting contact form:', error);
      addToast('Có lỗi xảy ra. Vui lòng thử lại.', 'error');
    }
  };

  return (
    <div className="contact-container">
      <h1>Liên hệ với chúng tôi</h1>
      
      <div className="contact-content">
        {/* Contact Info */}
        <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          
          <div className="contact-info-item">
            <h3>📍 Địa chỉ</h3>
            <p>
              330/13 Quốc lộ 53, Hòa Hảo, Hưng Mỹ, Vĩnh Long
            </p>
          </div>

          <div className="contact-info-item">
            <h3>📞 Điện thoại</h3>
            <p>
              <a href="tel:0123456789">
                (+84) 363 547 545
              </a>
            </p>
          </div>

          <div className="contact-info-item">
            <h3>📧 Email</h3>
            <p>
              <a href="mailto:info@anlaptopcu.com">
                anphuc1203@gmail.com
              </a>
            </p>
          </div>

          <div className="contact-info-item">
            <h3>🕐 Giờ hoạt động</h3>
            <p>
              Thứ Hai - Chủ Nhật: 7:00 AM - 7:00 PM
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form">
          <h2>Gửi tin nhắn</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Họ và tên *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                Tiêu đề *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                Nội dung *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
