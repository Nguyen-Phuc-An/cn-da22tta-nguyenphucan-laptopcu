import React from "react";
import { FaFacebookF, FaYoutube, FaTiktok, FaInstagram } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

export default function Footer() {
  const handlePolicyClick = (section) => {
    window.location.href = `/policy?section=${section}`;
  };

  return (
    <footer style={{ background: '#121f3aff', color: '#a0aec0', marginTop: '20px', padding: '20px' }}>
      <div style={{ width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '20px' }}>

        {/* Cột 1 – Giới thiệu */}

        <div style={{ textAlign: 'center', marginBottom: '12px', margin: "0 auto" }}>
          <img src="http://localhost:3000/public/uploads/products/Logo.png" alt="Logo" style={{ height: '200px', objectFit: 'contain', display: 'block'}} onError={(e) => e.target.style.display = 'none'} />
        </div>          

        <div>
          <p style={{ fontSize: '14px', marginBottom: '8px', textAlign: 'left' }}>
            Chuyên cung cấp laptop cũ chất lượng – bảo hành uy tín – giá sinh viên.
          </p>
          <p style={{ fontSize: '14px', textAlign: 'left' }}>
            Hệ thống laptop cũ kiểm định 30 bước, hỗ trợ học tập & làm việc.
          </p>
        </div>

        {/* Cột 2 – Chính sách */}
        <div>
          <h3 style={{ fontSize: '16px', padding: '0 40px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Chính sách</h3>
          <ul style={{ listStyle: 'none', padding: '0 40px', margin: 0 }}>
            <li style={{ fontSize: '14px', marginBottom: '8px', cursor: 'pointer', color: '#a0aec0', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'} onClick={() => handlePolicyClick('warranty')}>Chính sách bảo hành</li>
            <li style={{ fontSize: '14px', marginBottom: '8px', cursor: 'pointer', color: '#a0aec0', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'} onClick={() => handlePolicyClick('return')}>Chính sách đổi trả</li>
            <li style={{ fontSize: '14px', marginBottom: '8px', cursor: 'pointer', color: '#a0aec0', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'} onClick={() => handlePolicyClick('shipping')}>Chính sách giao hàng</li>
            <li style={{ fontSize: '14px', marginBottom: '8px', cursor: 'pointer', color: '#a0aec0', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'} onClick={() => handlePolicyClick('privacy')}>Chính sách bảo mật</li>
            <li style={{ fontSize: '14px', marginBottom: '8px', cursor: 'pointer', color: '#a0aec0', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'} onClick={() => handlePolicyClick('payment')}>Chính sách thanh toán</li>
          </ul>
        </div>

        {/* Cột 3 – Liên hệ */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Liên hệ</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ fontSize: '14px', marginBottom: '8px' }}><i className="bi bi-geo-alt-fill" style={{marginRight: '8px'}}></i>330/13 Quốc lộ 53 ấp Hòa Hảo, xã Hưng Mỹ, tỉnh Vĩnh Long</li>
            <li style={{ fontSize: '14px', marginBottom: '8px' }}><i className="bi bi-telephone-fill" style={{marginRight: '8px'}}></i>0363 547 545</li>
            <li style={{ fontSize: '14px', marginBottom: '8px' }}><i className="bi bi-envelope-fill" style={{marginRight: '8px'}}></i>anphuc1203@gamil.com</li>
            <li style={{ fontSize: '14px', marginBottom: '8px' }}><i className="bi bi-clock-fill" style={{marginRight: '8px'}}></i>Từ 7h - 21h</li>
          </ul>
        </div>

        {/* Cột 4 – Mạng xã hội */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Kết nối với chúng tôi</h3>
          <div style={{ display: 'flex', gap: '16px', fontSize: '20px' }}>
            <a style={{ color: '#a0aec0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' }} href="https://www.facebook.com/phucan.nguyen.58910049?mibextid=wwXIfr&rdid=hVL53f6uLv8w6zEY&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1C6tcXNuym%2F%3Fmibextid%3DwwXIfr" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}><FaFacebookF /></a>
            <a style={{ color: '#a0aec0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' }} href="https://zalo.me/0363547545" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}><SiZalo /></a>
            <a style={{ color: '#a0aec0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' }} href="https://www.youtube.com/@annpa3669?si=CtbfxECpzKfOtZyT" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}><FaYoutube /></a>
            <a style={{ color: '#a0aec0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' }} href="https://www.tiktok.com/@fluke.an?is_from_webapp=1&sender_device=pc" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}><FaTiktok /></a>
            <a style={{ color: '#a0aec0', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.3s' }} href="https://www.instagram.com/anphuc1203/?igsh=NWRscWhhbXVuOWR2&utm_source=qr" onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#a0aec0'}><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* HÀNG DƯỚI */}
      <div style={{ borderTop: '1px solid #4a5568', paddingTop: '20px', textAlign: 'center', fontSize: '14px', color: '#718096' }}>
        © {new Date().getFullYear()} Laptop Cũ — All rights reserved.
      </div>
    </footer>
  );
}
