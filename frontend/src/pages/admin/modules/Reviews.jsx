import React, { useState, useEffect, useContext } from 'react';
import { BsStarFill, BsStar } from 'react-icons/bs';
import { apiFetch } from '../../../services/apiClient';
import { AuthContext } from '../../../context/AuthContext';
import '../styles/Reviews.css';

export default function Reviews() {
  const { token } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterRating, setFilterRating] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Load reviews
  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/admin/reviews');
      setReviews(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách đánh giá');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete review - chỉ admin
  const handleDeleteReview = async (productId, userId) => {
    if (!isAdmin) {
      alert('Chỉ admin mới có thể xóa đánh giá');
      return;
    }
    if (!window.confirm('Bạn chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await apiFetch(`/admin/reviews/${productId}/${userId}`, {
        method: 'DELETE'
      });
      setReviews(prev => 
        prev.filter(r => !(r.san_pham_id === productId && r.khach_hang_id === userId))
      );
      alert('Xóa đánh giá thành công');
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa đánh giá');
      console.error('Error deleting review:', err);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchRating = filterRating === 'all' || review.diem === parseInt(filterRating);
    const matchSearch = !searchTerm || 
      (review.user_name && review.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.product_name && review.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.noi_dung && review.noi_dung.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchRating && matchSearch;
  });

  // Kiểm tra quyền admin từ token
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const admin = payload?.role === 'admin' || payload?.is_admin || payload?.isAdmin;
      setIsAdmin(admin);
    } catch {
      setIsAdmin(false);
    }
  }, [token]);
  // Tải đánh giá khi component mount
  useEffect(() => {
    loadReviews();
  }, []);
  // Hàm hiển thị sao đánh giá
  const getRatingStars = (rating) => {
    return Array.from({length: 5}, (_, i) => (
      i < rating 
        ? <BsStarFill key={i} style={{color: '#ffc107', marginRight: '2px'}} />
        : <BsStar key={i} style={{color: '#ddd', marginRight: '2px'}} />
    ));
  };
  // Định dạng ngày tháng
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>📋 Quản lý Đánh giá</h2>
        <button onClick={loadReviews} className="btn-refresh" disabled={loading}>
          🔄 Làm mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="reviews-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, nội dung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={filterRating} 
          onChange={(e) => setFilterRating(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả sao</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
          <option value="4">⭐⭐⭐⭐☆ 4 sao</option>
          <option value="3">⭐⭐⭐☆☆ 3 sao</option>
          <option value="2">⭐⭐☆☆☆ 2 sao</option>
          <option value="1">⭐☆☆☆☆ 1 sao</option>
        </select>
      </div>

      {/* Reviews Count */}
      <div className="reviews-stats">
        <span>Tổng đánh giá: <strong>{reviews.length}</strong></span>
        <span>Kết quả tìm kiếm: <strong>{filteredReviews.length}</strong></span>
      </div>

      {/* Loading State */}
      {loading && <div className="loading">Đang tải...</div>}

      {/* No Reviews */}
      {!loading && filteredReviews.length === 0 && (
        <div className="no-reviews">
          <p>😔 Không có đánh giá nào</p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && filteredReviews.length > 0 && (
        <div className="reviews-list">
          {filteredReviews.map((review) => (
            <div key={`${review.san_pham_id}-${review.khach_hang_id}`} className="review-card">
              <div className="review-header">
                <div className="review-info">
                  <h4 className="product-name">{review.product_name || 'Sản phẩm (ID: ' + review.san_pham_id + ')'}</h4>
                  <p className="user-info">👤 {review.user_name || 'Khách hàng (ID: ' + review.khach_hang_id + ')'}</p>
                </div>
                <div className="review-rating">
                  <span className="stars">{getRatingStars(review.diem)}</span>
                  <span className="rating-number">{review.diem}/5</span>
                </div>
              </div>

              {review.tieu_de && (
                <div className="review-title">{review.tieu_de}</div>
              )}

              {review.noi_dung && (
                <div className="review-content">{review.noi_dung}</div>
              )}

              <div className="review-footer">
                <span className="review-date">
                  📅 {formatDate(review.tao_luc)}
                </span>
                {isAdmin && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteReview(review.san_pham_id, review.khach_hang_id)}
                  >
                    🗑️ Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
