import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/Toast';
import { listWishlist, removeFromWishlist } from '../api/wishlists';
import { listImages as listProductImages } from '../api/productImages';
import { imageToSrc, normalizeImages } from '../services/productImages';
import '../styles/Wishlists.css';

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

export default function Wishlists() {
  const { token } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const userInfo = token ? decodeJwt(token) : null;
  const userId = userInfo?.id;

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await listWishlist(userId);
        const items = Array.isArray(data) ? data : (data && data.data ? data.data : []);
        
        // Fetch images for each product in wishlist
        const itemsWithImages = await Promise.all(
          items.map(async item => {
            try {
              const productId = item.san_pham_id || item.product_id;
              const imgs = await listProductImages(productId).catch(() => []);
              item.images = Array.isArray(imgs) ? normalizeImages(imgs) : [];
            } catch {
              item.images = [];
            }
            return item;
          })
        );
        
        setWishlistItems(itemsWithImages);
      } catch (err) {
        setError('Lỗi tải danh sách yêu thích');
        addToast('Lỗi tải danh sách yêu thích', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, addToast]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(userId, productId);
      setWishlistItems(prev => prev.filter(item => (item.san_pham_id || item.product_id) !== productId));
      addToast('Đã xóa khỏi danh sách yêu thích', 'success');
    } catch (err) {
      setError('Lỗi xóa sản phẩm khỏi yêu thích');
      addToast('Lỗi xóa sản phẩm khỏi yêu thích', 'error');
      console.error(err);
    }
  };

  if (!token) {
    return (
      <section className="wishlists-page">
        <div className="wishlists-container">
          <div className="wishlists-empty">
            <h2>Danh sách yêu thích</h2>
            <p>Bạn chưa đăng nhập. Vui lòng <a href="/">quay lại trang chủ</a> để đăng nhập.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wishlists-page">
      <div className="wishlists-container">
        <h1>Danh sách yêu thích</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="wishlists-empty">
            <p>Bạn chưa có sản phẩm yêu thích nào.</p>
            <a href="/" className="btn-back">Quay lại trang chủ</a>
          </div>
        ) : (
          <div className="wishlists-grid">
            {wishlistItems.map(item => {
              const product = item;
              const productId = product.san_pham_id || product.product_id || product.id;
              const src = imageToSrc(product.images?.[0]);

              return (
                <div key={productId} className="wishlist-card">
                  <div className="card-image">
                    <img
                      src={src}
                      alt={product.tieu_de || product.title}
                      loading="lazy"
                      onError={(e) => {
                        try {
                          const el = e && e.target;
                          if (!el) return;
                          if (!el.dataset.fallback) {
                            el.dataset.fallback = '1';
                            el.src = '/uploads/products/default.jpg';
                          }
                        } catch (err) { void err; }
                      }}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{product.tieu_de || product.title}</h3>
                    <p className="card-price">
                      {Number(product.gia || product.price || 0).toLocaleString('vi-VN')} {product.tien_te || product.currency || 'VND'}
                    </p>
                    <p className="card-specs">
                      {[product.ram, product.o_cung, product.cpu].filter(Boolean).join(' | ')}
                    </p>
                    <div className="card-actions">
                      <a href={`/product/${productId}`} className="btn btn-view">Xem chi tiết</a>
                      <button className="btn btn-remove" onClick={() => handleRemove(productId)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
