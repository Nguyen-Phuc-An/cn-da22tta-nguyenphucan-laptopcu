import React from 'react';
import '../styles/About.css';

export default function About() {
  return (
    <div className="about-container">    
      <div className="about-section about-intro">
        <h2>Giới thiệu</h2>
        <p style={{width: '650px'}}>
          AN Laptop Cũ là nơi tin cậy để mua bán các thiết bị laptop chất lượng cao với giá cạnh tranh. 
          Chúng tôi cam kết cung cấp các sản phẩm chính hãng, đã được kiểm định kỹ lưỡng và có bảo hành đầy đủ.
        </p>
      </div>

      <div className="about-section about-vision">
        <h2>Tầm nhìn & Sứ mệnh</h2>
        <p>
          <strong>Tầm nhìn:</strong> Trở thành nền tảng mua bán laptop cũ uy tín hàng đầu tại Việt Nam.
        </p>
        <p>
          <strong>Sứ mệnh:</strong> Giúp khách hàng tiếp cận công nghệ chất lượng với giá phải chăng, 
          đồng thời tạo cơ hội cho những người muốn bán lại thiết bị cũ của mình.
        </p>
      </div>

      <div className="about-section about-why">
        <h2>Tại sao chọn chúng tôi?</h2>
        <ul>
          <li>Sản phẩm đa dạng với chất lượng được kiểm định</li>
          <li>Giá cạnh tranh so với thị trường</li>
          <li>Bảo hành và hỗ trợ sau bán hàng tuyệt vời</li>
          <li>Giao hàng nhanh chóng và an toàn</li>
          <li>Đội ngũ nhân viên chuyên nghiệp và thân thiện</li>
        </ul>
      </div>
    </div>
  );
}
