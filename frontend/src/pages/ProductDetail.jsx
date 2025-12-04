import React, { useEffect, useState, useContext } from 'react';
import { FaShoppingCart } from "react-icons/fa";
import { getProducts } from '../api/products';
import { listImages as listProductImages } from '../api/productImages';
import { addToWishlist, removeFromWishlist, listWishlist } from '../api/wishlists';
import { imageToSrc, normalizeImages } from '../services/productImages';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/Cart';
import { ToastContext } from '../context/Toast';
import Footer from '../components/Footer';
import '../styles/ProductDetail.css';

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

export default function ProductDetail() {
  const { token } = useContext(AuthContext);
  const { addToCart, items: cartItems } = useContext(CartContext);
  const { addToast } = useContext(ToastContext);
  const userInfo = token ? decodeJwt(token) : null;
  const userId = userInfo?.id;

  const [product, setProduct] = useState(null);
  const [err, setErr] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(1);

  // Get product ID from URL
  const productId = typeof window !== 'undefined' ? window.location.pathname.split('/product/')[1] : null;

  useEffect(() => {
    if (!productId) return;
    
    let mounted = true;
    (async () => {
      try {
        const rows = await getProducts();
        const prods = Array.isArray(rows) ? rows : (rows && rows.data ? rows.data : []);
        const prod = prods.find(p => String(p.id) === String(productId));
        
        if (!prod) {
          setErr('Sản phẩm không tìm thấy');
          return;
        }

        // Fetch images
        try {
          const imgs = await listProductImages(prod.id).catch(() => []);
          prod.images = Array.isArray(imgs) ? normalizeImages(imgs) : [];
        } catch {
          prod.images = [];
        }

        if (mounted) setProduct(prod);
      } catch (e) {
        if (mounted) setErr(e.message || 'Lỗi tải sản phẩm');
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  // Load wishlist to check if product is favorite
  useEffect(() => {
    if (!userId || !product) return;
    
    (async () => {
      try {
        const wishlistData = await listWishlist(userId);
        const items = Array.isArray(wishlistData) ? wishlistData : (wishlistData && wishlistData.data ? wishlistData.data : []);
        const isFav = items.some(item => {
          const prodId = item.san_pham_id || item.product_id || item.id;
          return String(prodId) === String(product.id);
        });
        setIsFavorite(isFav);
      } catch (e) {
        console.error('Lỗi tải wishlist:', e);
      }
    })();
  }, [userId, product]);

  const handleAddToWishlist = () => {
    if (!userId) {
      addToast('Vui lòng đăng nhập để thêm vào yêu thích', 'info');
      return;
    }

    if (isFavorite) {
      removeFromWishlist(userId, product.id)
        .then(() => {
          setIsFavorite(false);
          addToast('Đã xóa khỏi danh sách yêu thích', 'success');
        })
        .catch(err => {
          console.error('Lỗi xóa khỏi yêu thích:', err);
          addToast('Lỗi xóa khỏi yêu thích', 'error');
        });
    } else {
      addToWishlist({ user_id: userId, product_id: product.id })
        .then(() => {
          setIsFavorite(true);
          addToast('Đã thêm vào danh sách yêu thích', 'success');
        })
        .catch(err => {
          console.error('Lỗi thêm vào yêu thích:', err);
          addToast('Lỗi thêm vào yêu thích', 'error');
        });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Check if product already exists in cart
    const productExists = cartItems.some(item => item.id === product.id);
    if (productExists) {
      addToast('Sản phẩm đã có trong giỏ hàng', 'error');
      return;
    }
    
    addToCart(product, cartQuantity);
    addToast(`✅ Đã thêm ${cartQuantity} sản phẩm vào giỏ hàng`, 'success');
    setCartQuantity(1);
  };

  if (err) return <p className="error">{err}</p>;
  if (!product) return <p>Đang tải...</p>;

  const currentImage = product.images && product.images[selectedImageIndex] 
    ? imageToSrc(typeof product.images[selectedImageIndex] === 'string' 
      ? { url: product.images[selectedImageIndex] } 
      : (product.images[selectedImageIndex] || {}))
    : '/uploads/products/default.jpg';

  return (
    <>
      <section className="product-detail">
        <div className="pd-container">
        {/* Image Gallery */}
        <div className="pd-image-section">
        <h1 className="pd-title">{product.tieu_de || product.title}</h1>
        {product.mo_ta && (
            <div className="pd-description">
              <p>{product.mo_ta}</p>
            </div>
          )}
          <div className="pd-main-image">
            <img 
              src={currentImage} 
              alt={product.tieu_de || product.title}
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = '1';
                  e.target.src = '/uploads/products/default.jpg';
                }
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, idx) => {
                const thumbSrc = imageToSrc(typeof img === 'string' ? { url: img } : (img || {}));
                return (
                  <button
                    key={idx}
                    className={`thumbnail ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={thumbSrc} alt={`${idx + 1}`} />
                  </button>
                );
              })}
            </div>
          )}

          <div className="camketsanpham" style={{ marginTop: '20px', padding: '15px', border: '1px solid #00003350', borderRadius: '8px' }}>
            <h3 className="camket-title">
              CAM KẾT SẢN PHẨM
            </h3>
            <p>🚚Miễn phí vận chuyển toàn quốc - Giao hàng hoả tốc 2H nội thành</p>
            <p>🛡️ Bảo hành chính hãng 24 tháng</p>
            <p>⭐ Bao xài đổi trả trong vòng 30 ngày đầu tiên</p>
            <p>🧾 Giá đã bao gồm VAT, xuất hoá đơn ngay sau khi bán hàng</p>
          </div>

          <div className="product-description-section" style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#000033', marginTop: 0 }}>Tổng quan sản phẩm</h3>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Laptop được thiết kế phục vụ tốt cho nhiều nhu cầu học tập, văn phòng và giải trí nhẹ. Máy có hiệu năng ổn định, độ bền cao và được kiểm tra kỹ trước khi đến tay khách hàng.</p>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Hiệu năng</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Máy sử dụng vi xử lý thế hệ mới, cho tốc độ phản hồi nhanh, thao tác mượt mà. Kết hợp cùng bộ nhớ RAM dư dả và ổ cứng tốc độ cao, laptop dễ dàng đáp ứng các tác vụ:</p>
            <ul style={{ fontSize: '14px', color: '#555', marginLeft: '20px', marginTop: '8px' }}>
              <li>Học tập online</li>
              <li>Làm việc văn phòng</li>
              <li>Xử lý file tài liệu, Excel, PowerPoint</li>
              <li>Lướt web, xem phim, giải trí</li>
            </ul>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Thiết kế</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Thiết kế gọn nhẹ, hiện đại, phù hợp cho sinh viên và nhân viên văn phòng. Chất liệu cứng cáp giúp máy có độ bền cao trong quá trình sử dụng.</p>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Màn hình</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Trang bị màn hình độ phân giải cao, hiển thị sắc nét, màu sắc hài hòa. Góc nhìn rộng, hỗ trợ tốt khi làm việc và giải trí lâu dài.</p>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Bàn phím – Touchpad</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Bàn phím gõ êm, độ nảy tốt, thuận tiện khi soạn thảo văn bản trong thời gian dài. Touchpad nhạy và hỗ trợ đầy đủ các thao tác đa điểm.</p>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Âm thanh – Tản nhiệt</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Hệ thống loa cho chất lượng âm rõ ràng, đáp ứng tốt nhu cầu học và giải trí cơ bản. Máy được tối ưu tản nhiệt, giúp giữ hiệu năng ổn định khi sử dụng liên tục.</p>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Pin và kết nối</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Thời lượng pin phù hợp cho một ngày làm việc nhẹ nhàng. Máy hỗ trợ đầy đủ cổng kết nối phổ biến như USB, HDMI, tai nghe…, dễ dàng tương thích với nhiều thiết bị.</p>

            <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000033', marginTop: '15px', marginBottom: '8px' }}>Chất lượng sản phẩm</h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>Laptop được kiểm tra kỹ 30 bước trước khi xuất bán, đảm bảo hoạt động ổn định. Máy sạch đẹp, không lỗi ẩn, dùng bền và tiết kiệm chi phí.</p>
          </div>          
        </div>        

        {/* Product Info */}
        <div className="pd-info-section">
          <div className="pd-price">
            <h3>Giá chỉ từ:</h3>
            <span className="price-value">{Number(product.gia || product.price || 0).toLocaleString('vi-VN')}</span>
            <span className="price-unit">{product.tien_te || product.currency || 'VND'}</span>
          </div>
          <div className="pd-color">
            <h3>Màu sắc sản phẩm:</h3>
            {product.mau_sac ? (
              <span className="color-value">
                {
                  {
                    'den': 'Đen',
                    'bac': 'Bạc',
                    'xam': 'Xám',
                    'trang': 'Trắng',
                    'do': 'Đỏ',
                    'xanh': 'Xanh'
                  }[product.mau_sac] || product.mau_sac
                }
              </span>
            ) : (
              <span className="color-value">Chưa có thông tin</span>
            )}
          </div>

          <div className="pd-price-sinhvien">
            <h4>Xác thực Edu để nhận giá dành cho Học sinh/ Sinh viên:</h4>
            <span className="price-sinhvien-value">
              {Number((product.gia || product.price || 0) - 500000).toLocaleString('vi-VN')}
            </span>
            <span className="price-sinhvien-unit">  {product.tien_te || product.currency || 'VND'}</span>

            <p>
              <span className="price-sinhvien-bitru">Giá gốc: {Number(product.gia || product.price || 0).toLocaleString('vi-VN')}đ</span>
              <span className="price-tru"> - 500.000đ</span>
            </p>
            
            <div className="edu-verification-box">
              <a href="/edu-verification" className="edu-verification-link">Xác thực ngay</a>
            </div>
          </div>

          <div className="pd-actions">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <button 
                onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                disabled={cartQuantity <= 1}
              >
                −
              </button>
              <input 
                type="number" 
                value={cartQuantity} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  const maxQty = product.so_luong || 999;
                  setCartQuantity(Math.max(1, Math.min(val, maxQty)));
                }}
                min="1"
                max={product.so_luong || 999}
              />
              <button 
                onClick={() => {
                  const maxQty = product.so_luong || 999;
                  if (cartQuantity < maxQty) {
                    setCartQuantity(cartQuantity + 1);
                  }
                }}
                disabled={cartQuantity >= (product.so_luong || 999)}
              >
                +
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <FaShoppingCart size={30} />
              </button>

              <button 
                className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleAddToWishlist}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.8 6.6c-.6-2.1-2.6-3.6-4.7-3.6-1.5 0-2.9.7-3.8 1.8-.9-1.1-2.3-1.8-3.8-1.8-2.1 0-4.1 1.5-4.7 3.6-.6 2.1.1 4.3 1.8 6.1L12 21l6.9-8.3c1.7-1.8 2.4-4 1.9-6.1z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                </svg>
              </button>

              <button className="muangay-btn" onClick={handleAddToCart}>
                Mua ngay
              </button>
            </div>            
          </div>

          <div className="uudai" style={{ padding: '0', border: '1px solid #00003350', borderRadius: '8px', background: '#ffe9e9ff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', height: '50px', background: '#ff8989ff', borderRadius: '8px 8px 0 0' }}>
              <h3 className="uudai-title">
                ƯU ĐÃI KHI MUA SẢN PHẨM
              </h3>
            </div>
            <div style={{ marginLeft: '20px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="30" height="30" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#ff7eb3" />
                  <text x="16" y="21" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#fff">1</text>
                </svg>
                Miễn phí cài đặt phần mềm trọn đời              
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="30" height="30" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#ff7eb3" />
                  <text x="16" y="21" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#fff">2</text>
                </svg>
                Tặng balo laptop chống sốc trị giá 150.000đ                
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="30" height="30" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#ff7eb3" />
                  <text x="16" y="21" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#fff">3</text>
                </svg>
                Tặng Sim/Esim VNSKY, có ngay 5GB data 5G/ngày              
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="30" height="30" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#ff7eb3" />
                  <text x="16" y="21" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#fff">4</text>
                </svg>
                Giảm ngay 500.000đ cho Học sinh/ Sinh viên khi xác thực Edu                
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="30" height="30" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#ff7eb3" />
                  <text x="16" y="21" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#fff">5</text>
                </svg>
                Nhận giá tốt nhất cho khách hàng B2B khi mua số lượng lớn                
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="30" height="30" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="16" fill="#ff7eb3" />
                  <text x="16" y="21" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#fff">6</text>
                </svg>
                Miễn phí vệ sinh – tra keo tản nhiệt 12 tháng               
              </p>
            </div>           
          </div>

          <div className="pd-specs">
            <h3>Thông số kỹ thuật</h3>
            <ul>
              {product.tieu_de && <li><strong>Tên:</strong> {product.tieu_de || product.title}</li>}
              {product.ram && <li><strong>RAM:</strong> {product.ram}</li>}
              {product.o_cung && <li><strong>Ổ cứng:</strong> {product.o_cung}</li>}
              {product.cpu && <li><strong>CPU:</strong> {product.cpu}</li>}
              {product.kich_thuoc_man_hinh && <li><strong>Kích thước màn hình:</strong> {product.kich_thuoc_man_hinh}</li>}
              {product.card_do_hoa && <li><strong>Card đồ họa:</strong> {product.card_do_hoa}</li>}
              {product.do_phan_giai && <li><strong>Độ phân giải:</strong> {product.do_phan_giai}</li>}
              {product.tinh_trang && <li><strong>Tình trạng:</strong> {product.tinh_trang}</li>}
              {product.so_luong && <li><strong>Số lượng kho:</strong> {product.so_luong}</li>}
              </ul>
          </div>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
}
