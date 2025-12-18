import React, { useState, useContext } from 'react';
import { createContact } from '../services/contacts';
import { ToastContext } from '../context/ToastContext';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
    <div style={{ padding: '0 40px', maxWidth: '1200px', margin: '0 auto', marginTop: '-10px'}}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#333', textAlign: 'center' }}>Liên hệ với chúng tôi</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        {/* Contact Info */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1414a7' }}>Thông tin liên hệ</h2>
          
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ marginBottom: '8px', color: '#333' }}>📍 Địa chỉ</h3>
            <p style={{ color: '#555', fontSize: '1.1rem' }}>
              123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam
            </p>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ marginBottom: '8px', color: '#333' }}>📞 Điện thoại</h3>
            <p style={{ color: '#555', fontSize: '1.1rem' }}>
              <a href="tel:0123456789" style={{ color: '#1414a7', textDecoration: 'none' }}>
                (+84) 123 456 789
              </a>
            </p>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ marginBottom: '8px', color: '#333' }}>📧 Email</h3>
            <p style={{ color: '#555', fontSize: '1.1rem' }}>
              <a href="mailto:info@anlaptopcu.com" style={{ color: '#1414a7', textDecoration: 'none' }}>
                info@anlaptopcu.com
              </a>
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: '8px', color: '#333' }}>🕐 Giờ hoạt động</h3>
            <p style={{ color: '#555', fontSize: '1.1rem' }}>
              Thứ Hai - Chủ Nhật: 9:00 AM - 9:00 PM
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1414a7' }}>Gửi tin nhắn</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Họ và tên *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Tiêu đề *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
                Nội dung *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={loading}
                rows="5"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: loading ? '#ccc' : '#1414a7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1.1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = '#0d0d7f';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#1414a7';
              }}
            >
              {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
