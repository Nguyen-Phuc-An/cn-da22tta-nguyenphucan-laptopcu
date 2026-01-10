import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/Cart';
import { apiFetch } from '../services/apiClient';
import { imageToSrc } from '../services/productImages';
import Footer from '../components/Footer';
import '../styles/Checkout.css';

function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Checkout() {
  const { token, user } = useContext(AuthContext);
  const { items: allItems, removeFromCart } = useContext(CartContext);
  const userInfo = token ? decodeJwt(token) : null;
  const userId = userInfo?.id;

  // Filter items based on selection from cart page
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    const selectedIds = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
    if (selectedIds.length > 0) {
      setItems(allItems.filter(item => selectedIds.includes(item.id)));
    } else {
      setItems(allItems);
    }
  }, [allItems]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'transfer', // transfer, cod
    notes: ''
  });

  // Tính toán giảm giá dựa trên edu_verified
  const EDU_DISCOUNT_PER_ITEM = 500000; // 500.000đ per item
  const isEduVerified = user?.edu_verified === 1;
  const eduDiscount = isEduVerified ? items.length * EDU_DISCOUNT_PER_ITEM : 0;

  // Tải thông tin người dùng để điền sẵn vào form
  useEffect(() => {
    if (!userId) return;
    
    (async () => {
      try {
        const res = await apiFetch(`/users/${userId}`);
        const user = Array.isArray(res) ? res[0] : res?.data || res;
        
        if (user) {
          setOrderForm(prev => ({
            ...prev,
            name: user.name || user.ten || '',
            phone: user.phone || user.dien_thoai || '',
            address: user.address || user.dia_chi || ''
          }));
        }
      } catch (err) {
        console.error('Load user error:', err);
      }
    })();
  }, [userId]);

  // Nếu không đăng nhập
  if (!token) {
    return (
      <>
        <div className="checkout-container">
          <div className="checkout-empty">
            <p>Bạn cần đăng nhập để tiếp tục thanh toán</p>
            <a href="/" className="btn btn-primary">← Quay lại trang chủ</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Nếu giỏ hàng trống
  if (items.length === 0) {
    return (
      <>
        <div className="checkout-container">
          <div className="checkout-empty">
            <p>Giỏ hàng của bạn trống rỗng</p>
            <a href="/" className="btn btn-primary">← Tiếp tục mua sắm</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  // Tính tổng đơn hàng
  const totalPrice = items.reduce((sum, item) => sum + (item.gia * item.quantity), 0);
  const shippingFee = 0;
  const finalTotal = Math.max(0, totalPrice - eduDiscount + shippingFee);
  // Xử lý gửi đơn hàng
  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      setError('');

      if (!orderForm.name.trim() || !orderForm.phone.trim() || !orderForm.address.trim()) {
        setError('Vui lòng điền đầy đủ thông tin giao hàng');
        setLoading(false);
        return;
      }

      // Create order
      const orderPayload = {
        nguoi_dung_id: userId,
        ten_nguoi_nhan: orderForm.name,
        dien_thoai_nhan: orderForm.phone,
        dia_chi_nhan: orderForm.address,
        phuong_thuc_thanh_toan: orderForm.paymentMethod,
        ghi_chu: orderForm.notes,
        trang_thai: 'pending',
        tong_tien: finalTotal,
        giam_gia_edu: eduDiscount, // Gửi thông tin giảm giá
        chi_tiet_don_hang: items.map(item => ({
          san_pham_id: item.id,
          so_luong: item.quantity,
          gia_tại_thời_điểm_mua: item.gia
        }))
      };

      const res = await apiFetch('/orders', {
        method: 'POST',
        body: orderPayload
      });

      console.log('Order response:', res); // Debug
      
      if (res) {
        const orderData = res.data || res;
        // Remove only purchased items from cart
        localStorage.removeItem('selectedCartItems');
        items.forEach(item => {
          removeFromCart(item.id);
        });
        // Navigate to OrderSuccess page
        window.location.href = `/order-success/${orderData.id}`;
      } else {
        throw new Error('Không nhận được response từ server');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo đơn hàng');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="checkout-container">
        <h1>Thanh Toán Đơn Hàng</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="checkout-content">
          {/* Left Column: Items + Form */}
          <div className="checkout-left">
            {/* Order Items Section */}
            <div className="checkout-items">
              <h2>Thông Tin Đơn Hàng</h2>
              <div className="items-list">
                {items.map(item => (
                  <div key={item.id} className="checkout-item-row">
                    <div className="item-image">
                      <img 
                        src={imageToSrc(item.images?.[0] || { url: '/uploads/products/default.jpg' })}
                        alt={item.tieu_de}
                      />
                    </div>
                    <div className="item-info">
                      <div className="item-name">{item.tieu_de}</div>
                      <div className="item-condition">Tình trạng: {item.tinh_trang}</div>
                      <div className="item-quantity">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="item-price">
                      <div className="unit-price">{(item.gia || 0).toLocaleString('vi-VN')}₫</div>
                      <div className="total-price">{(item.gia * item.quantity || 0).toLocaleString('vi-VN')}₫</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Tổng tiền hàng:</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
                </div>
                {isEduVerified && eduDiscount > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá Edu ({items.length} sản phẩm × 500.000₫):</span>
                    <span>-{eduDiscount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng thanh toán:</span>
                  <span>{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>

            {/* Delivery & Payment Form */}
            <div className="checkout-form">
              <h2>Thông Tin Giao Hàng</h2>
              
              <div className="form-group">
                <label>Tên người nhận *</label>
                <input
                  type="text"
                  value={orderForm.name}
                  onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                  placeholder="Nhập tên người nhận"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ giao hàng *</label>
                <textarea
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                  placeholder="Nhập địa chỉ giao hàng"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <h3 style={{marginTop: '25px', marginBottom: '15px'}}>Phương Thức Thanh Toán</h3>
              
              <div className="payment-methods">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="transfer"
                    checked={orderForm.paymentMethod === 'transfer'}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    disabled={loading}
                  />
                  <span className="radio-label">
                    <span className="radio-title">Chuyển khoản ngân hàng</span>
                    <span className="radio-desc">Chuyển tiền vào tài khoản ngân hàng của cửa hàng</span>
                  </span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={orderForm.paymentMethod === 'cod'}
                    onChange={(e) => setOrderForm({...orderForm, paymentMethod: e.target.value})}
                    disabled={loading}
                  />
                  <span className="radio-label">
                    <span className="radio-title">Thanh toán khi nhận hàng (COD)</span>
                    <span className="radio-desc">Thanh toán trực tiếp khi nhân viên giao hàng</span>
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label>Ghi chú đơn hàng (tùy chọn)</label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  placeholder="Nhập ghi chú cho đơn hàng (ví dụ: giao vào buổi sáng...)"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-primary btn-submit"
                  onClick={handleSubmitOrder}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt Hàng'}
                </button>
                <a href="/cart" className="btn btn-secondary">← Quay lại giỏ hàng</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
