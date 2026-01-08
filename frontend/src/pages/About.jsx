import React from 'react';
import '../styles/About.css';

export default function About() {
  return (
    <div className="about-container">    
      <div className="about-section about-intro">
        <h2>Giới thiệu</h2>
        <p style={{width: '650px'}}>
          AN Laptop Cũ là nền tảng mua bán laptop đã qua sử dụng đáng tin cậy, chuyên cung cấp các thiết bị chất lượng cao với mức giá cạnh tranh. 
          Chúng tôi cam kết mang đến cho khách hàng những sản phẩm chính hãng, được kiểm tra và đánh giá kỹ lưỡng trước khi đến tay người dùng, đi kèm chính sách bảo hành rõ ràng nhằm đảm bảo sự an tâm trong suốt quá trình sử dụng.
        </p>
      </div>

      <div className="about-section about-vision">
        <h2>Tầm nhìn & Sứ mệnh</h2>
        <p>
          <strong>Tầm nhìn:</strong> AN Laptop Cũ hướng tới mục tiêu trở thành nền tảng mua bán laptop cũ uy tín hàng đầu tại Việt Nam, được khách hàng tin tưởng lựa chọn khi có nhu cầu mua hoặc bán thiết bị công nghệ đã qua sử dụng.
        </p>
        <p>
          <strong>Sứ mệnh:</strong> Chúng tôi mong muốn giúp khách hàng dễ dàng tiếp cận các sản phẩm công nghệ chất lượng với chi phí hợp lý, góp phần mang lại giá trị thiết thực và trải nghiệm mua sắm hiệu quả cho người dùng.
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
