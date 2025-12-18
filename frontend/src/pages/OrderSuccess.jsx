import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiClient';
import '../styles/OrderSuccess.css';

export default function OrderSuccess() {
  const orderId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : null;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    (async () => {
      try {
        const res = await apiFetch(`/orders/${orderId}`);
        setOrder(Array.isArray(res) ? res[0] : res?.data || res);
      } catch (err) {
        console.error('Load order error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (!order) {
    return (
      <div className="order-success-container">
        <div className="order-error">
          <p>Không tìm thấy đơn hàng</p>
          <a href="/" className="btn btn-primary">← Quay lại trang chủ</a>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Đặt Hàng Thành Công!</h1>
        
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

        <div className="action-buttons">
          <a href="/" className="btn btn-primary">← Tiếp tục mua sắm</a>
          <a href="/profile" className="btn btn-secondary">Xem đơn hàng của tôi</a>
        </div>
      </div>
    </div>
  );
}
