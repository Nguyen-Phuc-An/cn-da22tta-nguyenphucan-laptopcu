import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import Footer from '../components/Footer';
import '../styles/Reviews.css';

export default function Reviews() {
  const { user, token } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  // Tải danh sách sản phẩm chờ đánh giá
  useEffect(() => {
    console.log('[Reviews] useEffect - token:', token ? token.substring(0, 20) + '...' : null, 'user:', user);
    
    if (!token || !user) {
      console.log('[Reviews] No token or user, skipping');
      setLoading(false);
      return;
    }

    const loadPendingReviews = async () => {
      try {
        console.log('[Reviews] Fetching /reviews/pending');
        const data = await apiFetch('/reviews/pending');
        console.log('[Reviews] Full API Response:', JSON.stringify(data, null, 2));
        if (data && data.length > 0) {
          console.log('[Reviews] First product:', {
            id: data[0].id,
            tieu_de: data[0].tieu_de,
            hinhanh: data[0].hinhanh,
            hinhanh_type: typeof data[0].hinhanh,
            all_keys: Object.keys(data[0])
          });
        }
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[Reviews] Error loading pending reviews:', err);
        addToast('Lỗi tải danh sách sản phẩm: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadPendingReviews();
  }, [token, user, addToast]);
  // Bắt đầu đánh giá một sản phẩm
  const handleStartReview = (product) => {
    setReviewingProduct(product);
    setReviewForm({
      rating: product.rating || 5,
      title: product.review_title || '',
      content: product.review_content || ''
    });
  };
  // Gửi đánh giá
  const handleSubmitReview = async () => {
    if (!reviewForm.title.trim() || !reviewForm.content.trim()) {
      addToast('Vui lòng nhập tiêu đề và nội dung đánh giá', 'error');
      return;
    }

    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: {
          product_id: reviewingProduct.id,
          user_id: user.id,
          rating: parseInt(reviewForm.rating),
          title: reviewForm.title,
          body: reviewForm.content
        }
      });

      // Cập nhật danh sách
      setProducts(products.map(p => 
        p.id === reviewingProduct.id 
          ? { ...p, da_review: 1, rating: reviewForm.rating, review_title: reviewForm.title, review_content: reviewForm.content }
          : p
      ));

      setReviewingProduct(null);
      addToast('Cảm ơn bạn đã đánh giá sản phẩm!', 'success');
    } catch (err) {
      addToast('Lỗi lưu đánh giá: ' + err.message, 'error');
    }
  };
  // Nếu chưa đăng nhập
  if (!user || !token) {
    return (
      <>
        <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <p style={{ fontSize: '18px', color: '#999' }}>Vui lòng đăng nhập để đánh giá sản phẩm</p>
          <a href="/auth" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
            Đăng nhập
          </a>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '30px', color: '#111827' }}>
          Đánh giá sản phẩm đã mua
        </h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#999' }}>Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '20px' }}>
              Bạn chưa có sản phẩm nào để đánh giá
            </p>
            <a href="/" className="btn btn-primary">← Tiếp tục mua sắm</a>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {(() => {
              console.log('[Reviews] Total products:', products.length);
              if (products.length > 0) {
                console.log('[Reviews] First product:', {
                  id: products[0].id,
                  tieu_de: products[0].tieu_de,
                  hinhanh: products[0].hinhanh,
                  hinhanh_type: typeof products[0].hinhanh,
                  all_keys: Object.keys(products[0])
                });
              }
              return null;
            })()}
            {products
              .sort((a, b) => {
                // Unreviewed products first (da_review === 0), then reviewed (da_review === 1)
                if (a.da_review === b.da_review) return 0;
                return a.da_review - b.da_review;
              })
              .map(product => (
              <div key={product.id} style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                transition: 'all 0.2s'
              }}>
                {/* Product Image */}
                <div style={{ flexShrink: 0 }}>
                  {(() => {
                    let imageSrc = 'http://localhost:3000/public/uploads/products/default.jpg';
                    
                    if (product.hinhanh) {
                      // hinhanh từ database là relative path như "uploads/products/filename.png"
                      // Backend serve static files ở /public route
                      const fullPath = product.hinhanh.startsWith('/')
                        ? product.hinhanh
                        : '/' + product.hinhanh;
                      imageSrc = `http://localhost:3000/public${fullPath}`;
                      console.log('[Reviews] Product', product.id, '- hinhanh:', product.hinhanh, '- final src:', imageSrc);
                    } else {
                      console.log('[Reviews] Product', product.id, '- hinhanh is empty');
                    }
                    
                    return (
                      <img
                        src={imageSrc}
                        alt={product.tieu_de}
                        loading="lazy"
                        onError={(e) => {
                          console.log('[Reviews] Image onError:', e.target.src);
                          if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = '1';
                            e.target.src = 'http://localhost:3000/public/uploads/products/default.jpg';
                          }
                        }}
                        onLoad={(e) => {
                          console.log('[Reviews] Image loaded successfully:', e.target.src);
                        }}
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Product Info & Review Status */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    {product.tieu_de}
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#667eea' }}>
                    {product.gia.toLocaleString('vi-VN')}₫
                  </p>

                  {product.da_review ? (
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '6px',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                        <i className="bi bi-check-circle-fill" style={{marginRight: '8px', color: '#10b981'}}></i>Đã đánh giá ({product.rating}<i className="bi bi-star-fill" style={{marginLeft: '2px', color: '#ffc107'}}></i>)
                      </p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#047857' }}>
                        <strong>Tiêu đề:</strong> {product.review_title}
                      </p>
                      <p style={{ margin: '0', fontSize: '13px', color: '#047857' }}>
                        <strong>Nội dung:</strong> {product.review_content.substring(0, 100)}...
                      </p>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStartReview(product)}
                      style={{ marginTop: '12px' }}
                    >
                      Đánh giá sản phẩm
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingProduct && (
        <div className="modal-overlay" onClick={() => setReviewingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ minWidth: '500px' }}>
            <div className="modal-header">
              <h3>Đánh giá sản phẩm</h3>
              <button className="close-btn" onClick={() => setReviewingProduct(null)}><i className="bi bi-x-lg"></i></button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#111827' }}>
                  {reviewingProduct.tieu_de}
                </h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                  Giá: {reviewingProduct.gia.toLocaleString('vi-VN')}₫
                </p>
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Đánh giá sao *
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{
                          fontSize: '28px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: star <= reviewForm.rating ? 1 : 0.3,
                          transition: 'all 0.2s',
                          color: '#ffc107'
                        }}
                      >
                        <i className="bi bi-star-fill"></i>
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                    {reviewForm.rating} sao
                  </p>
                </div>

                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Tiêu đề đánh giá *
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="VD: Sản phẩm rất tốt"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Nội dung đánh giá *
                  </label>
                  <textarea
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                    placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setReviewingProduct(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSubmitReview}>
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
