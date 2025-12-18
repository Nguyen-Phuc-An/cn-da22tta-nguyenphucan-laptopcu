import React from 'react';

export default function About() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#333' }}>Về chúng tôi</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#1414a7' }}>Giới thiệu</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
          AN Laptop Cũ là nơi tin cậy để mua bán các thiết bị laptop chất lượng cao với giá cạnh tranh. 
          Chúng tôi cam kết cung cấp các sản phẩm chính hãng, đã được kiểm định kỹ lưỡng và có bảo hành đầy đủ.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#1414a7' }}>Tầm nhìn & Sứ mệnh</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
          <strong>Tầm nhìn:</strong> Trở thành nền tảng mua bán laptop cũ uy tín hàng đầu tại Việt Nam.
        </p>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
          <strong>Sứ mệnh:</strong> Giúp khách hàng tiếp cận công nghệ chất lượng với giá phải chăng, 
          đồng thời tạo cơ hội cho những người muốn bán lại thiết bị cũ của mình.
        </p>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#1414a7' }}>Tại sao chọn chúng tôi?</h2>
        <ul style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
          <li>✓ Sản phẩm đa dạng với chất lượng được kiểm định</li>
          <li>✓ Giá cạnh tranh so với thị trường</li>
          <li>✓ Bảo hành và hỗ trợ sau bán hàng tuyệt vời</li>
          <li>✓ Giao hàng nhanh chóng và an toàn</li>
          <li>✓ Đội ngũ nhân viên chuyên nghiệp và thân thiện</li>
        </ul>
      </section>
    </div>
  );
}
