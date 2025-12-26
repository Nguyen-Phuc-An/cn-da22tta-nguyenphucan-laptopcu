import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/OrderSuccess.css';

export default function OrderSuccess() {
  const orderId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null;
  const { user, token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !token) {
      return;
    }

    (async () => {
      try {
        const res = await apiFetch(`/orders/${orderId}`);
        const orderData = Array.isArray(res) ? res[0] : res?.data || res;
        
        // Kiểm tra xem người dùng hiện tại có phải là chủ của đơn hàng không
        if (!user) {
          setError('Vui lòng đăng nhập để xem đơn hàng');
        } else if (orderData.khach_hang_id !== user.id) {
          setError('Bạn không có quyền xem đơn hàng này');
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Load order error:', err);
        setError('Không tìm thấy đơn hàng');
      }
    })();
  }, [orderId, token, user]);

  const handleCopyTransferContent = () => {
    if (!order) return;
    const transferContent = `Thanh toan mua laptop - Don hang ${order.id}`;
    navigator.clipboard.writeText(transferContent).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (!order) {
    return (
      <>
        <div className="order-success-container">
          <div className="order-error">
            <p>{error || 'Đang tải đơn hàng...'}</p>
            <a href="/" className="btn btn-primary">← Quay lại trang chủ</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="order-success-container">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Đặt Hàng Thành Công!</h1>
          
          <div className="success-content">
          {/* Left Column: Order Info + Message */}
          <div className="success-left">
            <div className="order-info">
              <div className="info-item">
                <span className="label">Mã đơn hàng:</span>
                <span className="value">#{order.id}</span>
              </div>
              <div className="info-item">
                <span className="label">Tên người nhận:</span>
                <span className="value">{order.ten_nguoi_nhan || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Số điện thoại:</span>
                <span className="value">{order.dien_thoai_nhan || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Địa chỉ giao hàng:</span>
                <span className="value">{order.dia_chi_nhan || '-'}</span>
              </div>
              <div className="info-item">
                <span className="label">Phương thức thanh toán:</span>
                <span className="value">
                  {order.phuong_thuc_thanh_toan === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Trạng thái đơn hàng:</span>
                <span className="value status-pending">Đang chờ xử lý</span>
              </div>
              <div className="info-item total">
                <span className="label">Tổng thanh toán:</span>
                <span className="value amount">{(order.tong_tien || 0).toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            <div className="success-message">
              <p>Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng.</p>
              <p>Vui lòng kiểm tra email hoặc tin nhắn SMS để cập nhật trạng thái đơn hàng của bạn.</p>
            </div>
          </div>

          {/* Right Column: Payment Instructions */}
          <div className="success-right">
            {order.phuong_thuc_thanh_toan === 'transfer' && (
              <div className="payment-instructions">
                <h3>📋 Hướng dẫn chuyển khoản</h3>
                <div className="bank-info">
                  <p><strong>Ngân hàng:</strong> Sacombank (SCB)</p>
                  <p><strong>Tên tài khoản:</strong> Nguyễn Phúc An</p>
                  <p><strong>Số tài khoản:</strong> 070119938250</p>
                  <p><strong>Nội dung chuyển khoản:</strong></p>
                  <div className="transfer-content-box">
                    <span className="transfer-content">Thanh toan mua laptop - Don hang {order.id}</span>
                    <button className="btn-copy" onClick={handleCopyTransferContent}>
                      {copySuccess ? '✓ Đã copy' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <div className="payment-steps">
                  <h4>Các bước chuyển khoản:</h4>
                  <ol>
                    <li>Mở ứng dụng ngân hàng hoặc trang web của bạn</li>
                    <li>Chọn "Chuyển tiền" hoặc "Thanh toán"</li>
                    <li>Nhập thông tin tài khoản nhận như trên</li>
                    <li>Nhập nội dung: <strong>Thanh toan mua laptop - Don hang {order.id}</strong></li>
                    <li>Xác nhận và hoàn tất giao dịch</li>
                  </ol>
                </div>
                <div className="important-note">
                  <p><strong>⚠️ Lưu ý:</strong> Vui lòng sử dụng <strong>nội dung chuyển khoản chính xác</strong> để chúng tôi có thể nhận biết đơn hàng của bạn. Sau khi chúng tôi nhận được tiền, đơn hàng sẽ được xác nhận ngay.</p>
                </div>
              </div>
            )}
            {order.phuong_thuc_thanh_toan === 'cod' && (
              <div className="payment-instructions">
                <h3>🚚 Thông tin giao hàng</h3>
                <div className="bank-info">
                  <p><strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)</p>
                  <p>Bạn sẽ thanh toán cho nhân viên giao hàng khi nhận sản phẩm.</p>
                </div>
              </div>
            )}
          </div>
        </div>

          <div className="action-buttons">
            <a href="/" className="btn btn-primary">← Tiếp tục mua sắm</a>
            <a href="/profile" className="btn btn-secondary">Xem đơn hàng của tôi</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
