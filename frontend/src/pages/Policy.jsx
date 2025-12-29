import React, { useEffect } from 'react';
import '../styles/Policy.css';

export default function Policy() {
  const policyType = window.location.pathname.split('/policy/')[1];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [policyType]);

  const renderContent = () => {
    switch (policyType) {
      case 'warranty':
        return (
          <div className="policy-content">
            <h1>Chính sách bảo hành</h1>
            <div className="policy-body">
              <section>
                <h2>1. Thời gian bảo hành</h2>
                <p>
                  Tất cả các sản phẩm laptop cũ của chúng tôi được bảo hành từ <strong>6 tháng đến 12 tháng</strong> tùy thuộc vào tình trạng sản phẩm khi nhập về.
                </p>
              </section>

              <section>
                <h2>2. Phạm vi bảo hành</h2>
                <p>Bảo hành bao gồm:</p>
                <ul>
                  <li>Lỗi kỹ thuật phần cứng (màn hình, ổ cứng, RAM, PIN, bàn phím, ...)</li>
                  <li>Hư hỏng do quá trình sử dụng bình thường</li>
                  <li>Lỗi do nhà sản xuất</li>
                  <li>Sửa chữa hoặc thay thế miễn phí</li>
                </ul>
              </section>

              <section>
                <h2>3. Không bao gồm trong bảo hành</h2>
                <ul>
                  <li>Hư hỏng do va đập, rơi, ngâm nước</li>
                  <li>Hư hỏng do lỗi người sử dụng</li>
                  <li>Cải thiện, nâng cấp phần cứng</li>
                  <li>Hết hạn bảo hành</li>
                  <li>Sản phẩm không thể xác định được nguồn gốc</li>
                </ul>
              </section>

              <section>
                <h2>4. Quy trình bảo hành</h2>
                <ol>
                  <li>Liên hệ shop để báo cáo sự cố</li>
                  <li>Mang sản phẩm đến shop hoặc gửi qua vận chuyển</li>
                  <li>Kiểm định và xác nhận loại lỗi</li>
                  <li>Sửa chữa/thay thế trong 3-7 ngày làm việc</li>
                  <li>Trả sản phẩm cho khách hàng</li>
                </ol>
              </section>

              <section>
                <h2>5. Điều kiện bảo hành</h2>
                <ul>
                  <li>Sản phẩm phải còn nguyên seals/holograms ban đầu (nếu có)</li>
                  <li>Có giấy bảo hành và hóa đơn mua hàng</li>
                  <li>Không sửa chữa tại nơi khác hoặc được sửa không đúng cách</li>
                  <li>Sản phẩm không bị dấu hiệu can thiệp hoặc mở ra</li>
                </ul>
              </section>

              <section>
                <h2>6. Liên hệ bảo hành</h2>
                <p>
                  <strong>Địa chỉ:</strong> 330/13 Quốc lộ 53 ấp Hòa Hảo, xã Hưng Mỹ, tỉnh Vĩnh Long<br />
                  <strong>Điện thoại:</strong> 0363 547 545<br />
                  <strong>Email:</strong> anphuc1203@gmail.com<br />
                  <strong>Giờ làm việc:</strong> 7h - 19h hàng ngày
                </p>
              </section>
            </div>
          </div>
        );

      case 'exchange':
        return (
          <div className="policy-content">
            <h1>Chính sách đổi trả</h1>
            <div className="policy-body">
              <section>
                <h2>1. Thời gian đổi trả</h2>
                <p>
                  Khách hàng có quyền đổi trả sản phẩm trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng nếu sản phẩm có lỗi hoặc không đúng với mô tả.
                </p>
              </section>

              <section>
                <h2>2. Điều kiện đổi trả</h2>
                <p>Sản phẩm phải:</p>
                <ul>
                  <li>Còn trong tình trạng ban đầu (chưa sử dụng hoặc sử dụng nhẹ)</li>
                  <li>Đầy đủ phụ kiện kèm theo</li>
                  <li>Có hóa đơn hoặc chứng chỉ mua hàng</li>
                  <li>Không bị lỗi do người sử dụng gây ra</li>
                </ul>
              </section>

              <section>
                <h2>3. Lý do đủ điều kiện đổi trả</h2>
                <ul>
                  <li>Sản phẩm bị lỗi kỹ thuật</li>
                  <li>Không đúng với mô tả trong danh sách sản phẩm</li>
                  <li>Bị hư hỏng do vận chuyển</li>
                  <li>Sản phẩm lỗi từ lúc rời xưởng</li>
                </ul>
              </section>

              <section>
                <h2>4. Quy trình đổi trả</h2>
                <ol>
                  <li>Liên hệ shop trong vòng 7 ngày</li>
                  <li>Chuẩn bị sản phẩm đầy đủ phụ kiện</li>
                  <li>Shop kiểm định sản phẩm</li>
                  <li>Nếu đủ điều kiện, được đổi sản phẩm khác hoặc hoàn tiền 100%</li>
                </ol>
              </section>

              <section>
                <h2>5. Chi phí vận chuyển</h2>
                <p>
                  <strong>Nếu lỗi do shop:</strong> Shop chi trả 100% phí vận chuyển<br />
                  <strong>Nếu lỗi do khách hàng:</strong> Khách hàng chi trả phí vận chuyển trở lại
                </p>
              </section>

              <section>
                <h2>6. Liên hệ đổi trả</h2>
                <p>
                  <strong>Địa chỉ:</strong> 330/13 Quốc lộ 53 ấp Hòa Hảo, xã Hưng Mỹ, tỉnh Vĩnh Long<br />
                  <strong>Điện thoại:</strong> 0363 547 545<br />
                  <strong>Email:</strong> anphuc1203@gmail.com<br />
                  <strong>Giờ làm việc:</strong> 7h - 19h hàng ngày
                </p>
              </section>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="policy-content">
            <h1>Chính sách giao hàng</h1>
            <div className="policy-body">
              <section>
                <h2>1. Khu vực giao hàng</h2>
                <p>
                  Chúng tôi giao hàng trên toàn quốc bao gồm:
                </p>
                <ul>
                  <li>Các tỉnh thành phía Bắc: 2-3 ngày</li>
                  <li>Các tỉnh thành phía Trung: 3-4 ngày</li>
                  <li>Các tỉnh thành phía Nam: 3-5 ngày</li>
                </ul>
              </section>

              <section>
                <h2>2. Phí giao hàng</h2>
                <ul>
                  <li>Nội thành Hà Nội/TP.HCM: 50,000 - 100,000 VND</li>
                  <li>Các tỉnh lân cận: 100,000 - 200,000 VND</li>
                  <li>Các tỉnh xa: 200,000 - 500,000 VND (tùy vào khoảng cách)</li>
                  <li><strong>Miễn phí</strong> cho đơn hàng trên 5 triệu VND</li>
                </ul>
              </section>

              <section>
                <h2>3. Thời gian giao hàng</h2>
                <p>
                  <strong>Thời gian chuẩn:</strong> 2-5 ngày làm việc từ ngày xác nhận đơn hàng<br />
                  <strong>Giao hàng nhanh:</strong> 1 ngày (chỉ áp dụng cho TP.HCM, Hà Nội và một số tỉnh lân cận)
                </p>
              </section>

              <section>
                <h2>4. Hình thức giao hàng</h2>
                <ul>
                  <li>Giao hàng qua đơn vị vận chuyển: GHN, Grab, Ahamove</li>
                  <li>Giao tận tay tại shop (miễn phí)</li>
                  <li>Giao hàng COD (thanh toán khi nhận hàng)</li>
                </ul>
              </section>

              <section>
                <h2>5. Bảo hiểm giao hàng</h2>
                <p>
                  Tất cả các sản phẩm được bảo hiểm trong quá trình vận chuyển. Nếu sản phẩm hư hỏng do vận chuyển, khách hàng được:
                </p>
                <ul>
                  <li>Đổi sản phẩm mới 100%</li>
                  <li>Hoặc hoàn tiền 100%</li>
                  <li>Không cần chi phí bảo hiểm thêm</li>
                </ul>
              </section>

              <section>
                <h2>6. Theo dõi đơn hàng</h2>
                <p>
                  Sau khi đặt hàng, bạn sẽ nhận được:
                </p>
                <ul>
                  <li>Email/SMS xác nhận đơn hàng</li>
                  <li>Mã vận đơn để theo dõi</li>
                  <li>Thông báo khi giao hàng</li>
                </ul>
              </section>

              <section>
                <h2>7. Liên hệ vận chuyển</h2>
                <p>
                  <strong>Địa chỉ:</strong> 330/13 Quốc lộ 53 ấp Hòa Hảo, xã Hưng Mỹ, tỉnh Vĩnh Long<br />
                  <strong>Điện thoại:</strong> 0363 547 545<br />
                  <strong>Email:</strong> anphuc1203@gmail.com<br />
                  <strong>Giờ làm việc:</strong> 7h - 19h hàng ngày
                </p>
              </section>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="policy-content">
            <h1>Chính sách bảo mật</h1>
            <div className="policy-body">
              <section>
                <h2>1. Thông tin chúng tôi thu thập</h2>
                <p>Chúng tôi thu thập các thông tin sau:</p>
                <ul>
                  <li>Tên, địa chỉ email, số điện thoại</li>
                  <li>Địa chỉ giao hàng</li>
                  <li>Thông tin thanh toán</li>
                  <li>Lịch sử mua hàng</li>
                  <li>Thông tin sử dụng website (cookies, log IP)</li>
                </ul>
              </section>

              <section>
                <h2>2. Mục đích sử dụng thông tin</h2>
                <ul>
                  <li>Xác nhận đơn hàng và giao hàng</li>
                  <li>Liên hệ khách hàng về đơn hàng</li>
                  <li>Gửi thông tin khuyến mãi (nếu đồng ý)</li>
                  <li>Cải thiện dịch vụ</li>
                  <li>Tuân thủ luật pháp</li>
                </ul>
              </section>

              <section>
                <h2>3. Bảo vệ dữ liệu</h2>
                <p>
                  Chúng tôi sử dụng các biện pháp bảo mật tiên tiến:
                </p>
                <ul>
                  <li>Mã hóa SSL/TLS cho tất cả giao dịch</li>
                  <li>Mật khẩu được mã hóa bằng bcrypt</li>
                  <li>Máy chủ được bảo vệ bằng tường lửa</li>
                  <li>Hạn chế quyền truy cập thông tin cá nhân</li>
                </ul>
              </section>

              <section>
                <h2>4. Chia sẻ thông tin</h2>
                <p>
                  Chúng tôi KHÔNG chia sẻ thông tin cá nhân cho bên thứ ba, ngoại trừ:
                </p>
                <ul>
                  <li>Đơn vị vận chuyển (để giao hàng)</li>
                  <li>Nhà cung cấp thanh toán</li>
                  <li>Khi có yêu cầu từ cơ quan chức năng</li>
                </ul>
              </section>

              <section>
                <h2>5. Cookie</h2>
                <p>
                  Website sử dụng cookie để:
                </p>
                <ul>
                  <li>Ghi nhớ thông tin đăng nhập</li>
                  <li>Theo dõi trải nghiệm người dùng</li>
                  <li>Cá nhân hóa nội dung</li>
                </ul>
              </section>

              <section>
                <h2>6. Quyền của khách hàng</h2>
                <p>Bạn có quyền:</p>
                <ul>
                  <li>Xem thông tin cá nhân của mình</li>
                  <li>Yêu cầu sửa thông tin sai</li>
                  <li>Yêu cầu xóa tài khoản</li>
                  <li>Từ chối nhận email marketing</li>
                </ul>
              </section>

              <section>
                <h2>7. Liên hệ bảo mật</h2>
                <p>
                  Nếu bạn có câu hỏi về bảo mật, vui lòng liên hệ:<br />
                  <strong>Email:</strong> anphuc1203@gmail.com<br />
                  <strong>Điện thoại:</strong> 0363 547 545
                </p>
              </section>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="policy-content">
            <h1>Chính sách thanh toán</h1>
            <div className="policy-body">
              <section>
                <h2>1. Hình thức thanh toán</h2>
                <p>Chúng tôi hỗ trợ các hình thức thanh toán sau:</p>
                <ul>
                  <li><strong>Thanh toán khi nhận hàng (COD):</strong> Thanh toán tại nhà khi nhận sản phẩm</li>
                  <li><strong>Chuyển khoản ngân hàng:</strong> Chuyển tiền vào tài khoản ngân hàng</li>
                </ul>
              </section>

              <section>
                <h2>2. Quy trình thanh toán</h2>
                <ol>
                  <li>Thêm sản phẩm vào giỏ hàng</li>
                  <li>Chọn địa chỉ giao hàng và hình thức thanh toán</li>
                  <li>Xác nhận đơn hàng</li>
                  <li>Thực hiện thanh toán (nếu không chọn COD)</li>
                  <li>Nhận xác nhận và mã vận đơn</li>
                </ol>
              </section>

              <section>
                <h2>3. Thông tin tài khoản ngân hàng</h2>
                <p>
                  <strong>Tên tài khoản:</strong> NGUYEN PHUC AN<br />
                  <strong>Số tài khoản:</strong> 084203008226<br />
                  <strong>Ngân hàng:</strong> Sacombank<br />
                  <strong>Chi nhánh:</strong> TRÀ VINH
                </p>
              </section>

              <section>
                <h2>4. Chi phí thanh toán</h2>
                <ul>
                  <li>COD: Miễn phí (hoặc phụ phí theo đơn vị vận chuyển, hiển thị khi đặt hàng)</li>
                  <li>Chuyển khoản: Miễn phí</li>
                  <li>Ví điện tử/Thẻ: Miễn phí (hoặc phụ phí tùy nhà cung cấp)</li>
                  <li>Trả góp: Lãi suất tùy theo sản phẩm và thời hạn</li>
                </ul>
              </section>

              <section>
                <h2>5. Bảo mật thanh toán</h2>
                <p>
                  Tất cả giao dịch thanh toán được bảo vệ bằng:
                </p>
                <ul>
                  <li>Mã hóa SSL/TLS 256-bit</li>
                  <li>PCI DSS compliance</li>
                  <li>3D Secure (nếu cần)</li>
                  <li>Token hoá thẻ</li>
                </ul>
              </section>

              <section>
                <h2>6. Hoàn tiền</h2>
                <p>
                  <strong>Thời hạn hoàn tiền:</strong> 5-7 ngày làm việc sau khi xác nhận<br />
                  <strong>Phương thức hoàn tiền:</strong> Hoàn về tài khoản/ví gốc<br />
                  <strong>Lý do hoàn tiền:</strong> Đổi trả, huỷ đơn hàng, sản phẩm bị lỗi
                </p>
              </section>

              <section>
                <h2>7. Liên hệ thanh toán</h2>
                <p>
                  <strong>Địa chỉ:</strong> 330/13 Quốc lộ 53 ấp Hòa Hảo, xã Hưng Mỹ, tỉnh Vĩnh Long<br />
                  <strong>Điện thoại:</strong> 0363 547 545<br />
                  <strong>Email:</strong> anphuc1203@gmail.com<br />
                  <strong>Giờ làm việc:</strong> 7h - 19h hàng ngày
                </p>
              </section>
            </div>
          </div>
        );

      default:
        return <Home />;
    }
  };

  return (
    <div style={{ minHeight: '70vh', padding: '40px 20px' }}>
      {renderContent()}
    </div>
  );
}
