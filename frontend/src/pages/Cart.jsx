import React, { useContext } from 'react';
import { CartContext } from '../context/Cart';
import { imageToSrc } from '../services/productImages';
import '../styles/Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <h1>🛒 Giỏ Hàng</h1>
        <div className="cart-empty">
          <p>Giỏ hàng của bạn trống rỗng</p>
          <a href="/" className="btn-continue-shopping">← Tiếp tục mua sắm</a>
        </div>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="cart-container">
      <h1>🛒 Giỏ Hàng ({items.length} sản phẩm)</h1>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item-card">
              <button 
                onClick={() => removeFromCart(item.id)}
                className="btn-remove-card"
                title="Xóa sản phẩm"
              >
                ✕
              </button>

              <div className="card-image">
                <img 
                  src={imageToSrc(item.images?.[0] || { url: '/uploads/products/default.jpg' })}
                  alt={item.ten_san_pham}
                />
              </div>

              <div className="card-body">
                <h3 className="product-name">{item.tieu_de}</h3>
                <p className="product-condition">Tình trạng: {item.tinh_trang}</p>

                <div className="card-price">
                  <span className="price-label">Giá:</span>
                  <span className="price">{(item.gia || 0).toLocaleString('vi-VN')}₫</span>
                </div>

                <div className="card-quantity">
                  <label>Số lượng:</label>
                  <div className="quantity-control">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="btn-qty"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        const maxQty = item.so_luong || 999;
                        updateQuantity(item.id, Math.max(1, Math.min(val, maxQty)));
                      }}
                      min="1"
                      max={item.so_luong || 999}
                      className="qty-input"
                    />
                    <button 
                      onClick={() => {
                        const maxQty = item.so_luong || 999;
                        if (item.quantity < maxQty) {
                          updateQuantity(item.id, item.quantity + 1);
                        }
                      }}
                      className="btn-qty"
                      disabled={item.quantity >= (item.so_luong || 999)}
                    >
                      +
                    </button>                                        
                  </div>
                    {item.so_luong && (
                      <p className="qty-limit">Tồn kho: {item.so_luong}</p>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <div className="summary-card">
            <h2>Tóm Tắt Đơn Hàng</h2>

            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span className="amount">{totalPrice.toLocaleString('vi-VN')}₫</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="amount">Miễn phí</span>
            </div>

            <div className="summary-row discount">
              <span>Giảm giá:</span>
              <span className="amount">0₫</span>
            </div>

            <div className="summary-row total">
              <span>Tổng thanh toán:</span>
              <span className="amount-total">{totalPrice.toLocaleString('vi-VN')}₫</span>
            </div>
            <p style={{margin: '0', fontSize: '14px', color: '#666'}}>Vị trí nhận đơn là địa chỉ giao hàng được lấy từ thông tin mà khách hàng đã cung cấp khi đăng ký tài khoản.</p>

            <button className="btn-checkout">Thanh Toán Ngay</button>

            <button 
              onClick={clearCart}
              className="btn-clear-cart"
            >
              Xóa Toàn Bộ
            </button>

            <a href="/" className="btn-continue-shopping">← Tiếp tục mua sắm</a>
          </div>
        </div>
      </div>
    </div>
  );
}
