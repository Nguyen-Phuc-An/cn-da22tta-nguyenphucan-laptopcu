import React, { useContext } from 'react';
import { CartContext } from '../context/Cart';
import { AuthContext } from '../context/AuthContext';
import { imageToSrc } from '../services/productImages';
import Footer from '../components/Footer';
import '../styles/Cart.css';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [selectedItems, setSelectedItems] = React.useState(new Set());

  if (items.length === 0) {
    return (
      <>
        <div className="cart-container">
          <div className="cart-empty">
            <p>Giỏ hàng của bạn trống rỗng</p>
            <a href="/" className="btn-continue-shopping">← Tiếp tục mua sắm</a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // Calculate total for selected items only
  const selectedItemsTotal = items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.gia * item.quantity), 0);

  // Calculate edu discount
  const EDU_DISCOUNT_PER_ITEM = 500000; // 500.000đ per item
  const isEduVerified = user?.edu_verified === 1;
  const selectedItemsCount = selectedItems.size;
  const eduDiscount = isEduVerified ? selectedItemsCount * EDU_DISCOUNT_PER_ITEM : 0;
  const finalTotal = Math.max(0, selectedItemsTotal - eduDiscount);

  return (
    <>
      <div className="cart-container">
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
          {/* Select All Header */}
          <div className="cart-select-all" style={{
            padding: '12px 15px',            
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '20px'
          }}>
            <input 
              type="checkbox"
              checked={selectedItems.size === items.length && items.length > 0}
              onChange={toggleSelectAll}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}>
              Chọn tất cả ({selectedItems.size}/{items.length})
            </label>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item-card" style={{
              opacity: selectedItems.has(item.id) ? 1 : 0.8,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 10
              }}>
                <input 
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                />
              </div>

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
              <span>Sản phẩm được chọn:</span>
              <span className="amount">{selectedItems.size}/{items.length}</span>
            </div>

            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span className="amount">{selectedItemsTotal.toLocaleString('vi-VN')}₫</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="amount">Miễn phí</span>
            </div>

            {isEduVerified && eduDiscount > 0 && (
              <div className="summary-row discount">
                <span>💰 Giảm giá Edu ({selectedItemsCount} sản phẩm × 500.000₫):</span>
                <span className="amount">-{eduDiscount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Tổng thanh toán:</span>
              <span className="amount-total">{finalTotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <p style={{margin: '0', fontSize: '14px', color: '#666'}}>Vị trí nhận đơn là địa chỉ giao hàng được lấy từ thông tin mà khách hàng đã cung cấp khi đăng ký tài khoản.</p>

            <button 
              className="btn-checkout" 
              onClick={() => {
                if (selectedItems.size === 0) {
                  alert('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán');
                  return;
                }
                // Store selected items and redirect to checkout
                localStorage.setItem('selectedCartItems', JSON.stringify(Array.from(selectedItems)));
                window.location.href = '/checkout';
              }}
              disabled={selectedItems.size === 0}
              style={{
                opacity: selectedItems.size === 0 ? 0.5 : 1,
                cursor: selectedItems.size === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Thanh Toán Ngay ({selectedItems.size} sản phẩm)
            </button>

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
    <Footer />
    </>
  );
}
