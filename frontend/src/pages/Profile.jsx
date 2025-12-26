import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/apiClient';
import { uploadUserImages, getUserImages } from '../api/usersImages';
import Footer from '../components/Footer';
import '../styles/Profile.css';

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



export default function Profile() {
  const { token, setToken } = useContext(AuthContext);
  const userInfo = token ? decodeJwt(token) : null;
  const userId = userInfo?.id;

  // States
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const ordersLoadedRef = React.useRef(false);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, title: '', content: '' });
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const reviewsLoadedRef = React.useRef(false);

  // Form states
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (!userId) return;
    
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiFetch(`/users/${userId}`);
        
        const user = Array.isArray(res) ? res[0] : res?.data || res;
        
        console.log('[Profile] API response user:', user);
        
        if (user) {
          setUserData(user);
          console.log('[Profile] edu_verified:', user.edu_verified, 'edu_email:', user.edu_email);
          
          // Map API response to form
          setForm({
            name: user.name || user.ten || '',
            email: user.email || '',
            phone: user.phone || user.dien_thoai || '',
            address: user.address || user.dia_chi || ''
          });
          
          // Load user images
          try {
            const images = await getUserImages(userId);
            setUserImages(images || []);
            const mainImage = images?.find(img => img.la_chinh === 1);
            if (mainImage) {
              setAvatarPreview(mainImage.duong_dan);
            }
          } catch (imgErr) {
            console.error('Failed to load user images:', imgErr);
          }
        }
      } catch (err) {
        setError('Không thể tải thông tin người dùng');
        console.error('Load user error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);



  // Load orders when tab changes to orders
  useEffect(() => {
    const loadUserOrders = async () => {
      try {
        setOrdersLoading(true);
        setError('');
        const res = await apiFetch(`/users/${userId}/orders`);
        const orders = Array.isArray(res) ? res : res?.data || [];
        setUserOrders(orders);
        ordersLoadedRef.current = true;
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Không thể tải lịch sử đơn hàng');
      } finally {
        setOrdersLoading(false);
      }
    };

    if (activeTab === 'orders' && userId && !ordersLoadedRef.current) {
      loadUserOrders();
    }
  }, [activeTab, userId]);

  // Load reviewed products when tab changes to reviews
  useEffect(() => {
    const loadReviewedProducts = async () => {
      try {
        setReviewsLoading(true);
        setError('');
        const res = await apiFetch(`/reviews/pending`);
        const allProducts = Array.isArray(res) ? res : res?.data || [];
        // Filter to show only reviewed products (da_review === 1)
        const reviewed = allProducts.filter(p => p.da_review === 1);
        const pending = allProducts.filter(p => p.da_review === 0);
        setReviewedProducts(reviewed);
        setPendingReviewCount(pending.length);
        reviewsLoadedRef.current = true;
      } catch (err) {
        console.error('Failed to load reviewed products:', err);
        setError('Không thể tải danh sách đánh giá');
      } finally {
        setReviewsLoading(false);
      }
    };

    if (activeTab === 'reviews' && userId && !reviewsLoadedRef.current) {
      loadReviewedProducts();
    }
  }, [activeTab, userId]);

  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      completed: 'Đã nhận hàng',
      canceled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const colorMap = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      shipping: '#673ab7',
      completed: '#4caf50',
      canceled: '#f44336'
    };
    return colorMap[status] || '#666';
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Upload avatar if selected
      if (avatarFile) {
        await uploadUserImages(userId, [avatarFile]);
        // Reload images
        const images = await getUserImages(userId);
        setUserImages(images || []);
        const mainImage = images?.find(img => img.la_chinh === 1);
        if (mainImage) {
          setAvatarPreview(mainImage.duong_dan);
        }
      }

      // Update user info
      await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: {
          name: form.name,
          phone: form.phone,
          address: form.address
        }
      });

      // Fetch updated user data
      const updatedUser = await apiFetch(`/users/${userId}`);
      if (updatedUser) {
        setUserData(updatedUser);
        setForm({
          name: updatedUser.name || updatedUser.ten || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || updatedUser.dien_thoai || '',
          address: updatedUser.address || updatedUser.dia_chi || ''
        });
        setAvatarFile(null);
        setIsEditing(false);
        setSuccess('Cập nhật hồ sơ thành công!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật hồ sơ');
      console.error('Save profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setError('Vui lòng điền đầy đủ thông tin mật khẩu');
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('Mật khẩu mới không khớp');
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }

      await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        body: {
          password: passwordForm.newPassword
        }
      });

      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi đổi mật khẩu');
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');
      await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      setToken(null);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Lỗi khi khóa tài khoản');
      console.error('Deactivate account error:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle save edited review
  const handleSaveReview = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!editForm.title || !editForm.content) {
        setError('Vui lòng điền tiêu đề và nội dung đánh giá');
        setLoading(false);
        return;
      }

      await apiFetch(`/reviews`, {
        method: 'POST',
        body: {
          product_id: editingReview.id,
          user_id: userId,
          rating: editForm.rating,
          title: editForm.title,
          body: editForm.content
        }
      });

      setSuccess('Cập nhật đánh giá thành công!');
      setEditingReview(null);
      setEditForm({ rating: 0, title: '', content: '' });
      
      // Reload reviewed products
      reviewsLoadedRef.current = false;
      const res = await apiFetch(`/reviews/pending`);
      const allProducts = Array.isArray(res) ? res : res?.data || [];
      const reviewed = allProducts.filter(p => p.da_review === 1);
      setReviewedProducts(reviewed);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật đánh giá');
      console.error('Save review error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Not logged in
  if (!token) {
    return (
      <>
        <section className="profile-page">
          <div className="profile-container">
            <div className="profile-empty">
              <p>Bạn chưa đăng nhập. Vui lòng <a href="/">quay lại trang chủ</a> để đăng nhập.</p>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="profile-page">
      <div className="profile-container">

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Lịch sử đơn hàng
          </button>
          <button
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Đánh giá sản phẩm
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-card">
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <>
          {/* VIEW MODE */}
          {!isEditing && !isChangingPassword && (
            <div className="profile-view-layout">
              {/* Avatar Section */}
              <div className="profile-avatar-column">
                {avatarPreview ? (
                  <img 
                    src={`http://localhost:3000${avatarPreview}`}
                    alt="Avatar"
                    className="profile-avatar-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {userData?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* User Info Column */}
              <div className="profile-info-column">
                <h2>Thông tin cá nhân</h2>

                <div className="info-group">
                  <div className="info-label">Tên</div>
                  <div className="info-value">{userData?.name || userData?.ten || '-'}</div>
                </div>

                <div className="info-group">
                  <div className="info-label">Email</div>
                  <div className="info-value">{userData?.email || '-'}</div>
                </div>

                <div className="info-group">
                  <div className="info-label">Số điện thoại</div>
                  <div className="info-value">{userData?.phone || userData?.dien_thoai || '-'}</div>
                </div>

                <div className="info-group">
                  <div className="info-label">Địa chỉ</div>
                  <div className="info-value">{userData?.address || userData?.dia_chi || '-'}</div>
                </div>
              </div>

              {/* EDU VERIFICATION SECTION */}
              <div className="profile-edu-column">
                <h3 className="edu-section-title">🎓 Thông tin Xác thực Edu</h3>
                
                {userData?.edu_verified === 1 ? (
                  // Đã xác thực
                  <div className="edu-info-content">
                    <div className="edu-status">
                      <span className="status-badge approved">✅ Đã xác thực</span>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Email Edu:</div>
                      <div className="info-value">{userData?.edu_email || '-'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">MSSV:</div>
                      <div className="info-value">{userData?.edu_mssv || '-'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">CCCD:</div>
                      <div className="info-value">{userData?.edu_cccd || '-'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Trường/Đại học:</div>
                      <div className="info-value">{userData?.edu_school || '-'}</div>
                    </div>
                  </div>
                ) : userData?.edu_verified === 0 && !!userData?.edu_email ? (
                  // Đang chờ xác thực
                  <div className="edu-info-content">
                    <div className="edu-status">
                      <span className="status-badge pending">⏳ Đang chờ xác thực</span>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Email Edu:</div>
                      <div className="info-value">{userData?.edu_email || '-'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">MSSV:</div>
                      <div className="info-value">{userData?.edu_mssv || '-'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">CCCD:</div>
                      <div className="info-value">{userData?.edu_cccd || '-'}</div>
                    </div>

                    <div className="info-group">
                      <div className="info-label">Trường/Đại học:</div>
                      <div className="info-value">{userData?.edu_school || '-'}</div>
                    </div>
                  </div>
                ) : (
                  // Chưa xác thực
                  <div className="edu-not-verified">
                    <p>Bạn chưa xác thực Edu</p>
                    <a href="/edu-verification" className="btn-edu-verify">
                      Xác thực Edu để nhận giảm giá
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Actions */}
          {!isEditing && !isChangingPassword && (
            <div className="profile-actions-section">
              <button 
                className="btn-edit" 
                onClick={() => setIsEditing(true)} 
                disabled={loading}
              >
                Chỉnh sửa thông tin
              </button>
              <button 
                className="btn-password" 
                onClick={() => setIsChangingPassword(true)} 
                disabled={loading}
              >
                Đổi mật khẩu
              </button>
              <button 
                className="btn-delete" 
                onClick={() => setShowDeleteConfirm(true)} 
                disabled={loading}
              >
                Khóa tài khoản
              </button>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <div className="profile-form">
              <h2>Chỉnh sửa hồ sơ</h2>

              {/* Avatar Edit */}
              <div className="avatar-edit-section">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:3000${avatarPreview}`}
                    alt="Avatar Preview"
                    className="avatar-edit-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="avatar-edit-placeholder">
                    Chọn ảnh
                  </div>
                )}
                <label className="avatar-file-label">
                  Ảnh Avatar<br />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={loading}
                  />
                </label>
              </div>

              {/* Form Fields */}
              <label>
                Tên<br />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  disabled={loading}
                  placeholder="Nhập tên của bạn"
                />
              </label>

              <label>
                Email<br />
                <input
                  type="email"
                  value={form.email}
                  disabled
                  placeholder="Email (không thể thay đổi)"
                />
              </label>

              <label>
                Số điện thoại<br />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  disabled={loading}
                  placeholder="Nhập số điện thoại"
                />
              </label>

              <label>
                Địa chỉ<br />
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  rows="4"
                  disabled={loading}
                  placeholder="Nhập địa chỉ của bạn"
                />
              </label>

              <div className="profile-actions">
                <button 
                  className="btn-save" 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                    const mainImage = userImages.find(img => img.la_chinh === 1);
                    setAvatarPreview(mainImage?.duong_dan || null);
                  }} 
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* PASSWORD CHANGE MODE */}
          {isChangingPassword && (
            <div className="profile-form">
              <h2>Đổi mật khẩu</h2>

              <label>
                Mật khẩu hiện tại<br />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  disabled={loading}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </label>

              <label>
                Mật khẩu mới<br />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  disabled={loading}
                  placeholder="Nhập mật khẩu mới"
                />
              </label>

              <label>
                Xác nhận mật khẩu mới<br />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  disabled={loading}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </label>

              <div className="profile-actions">
                <button 
                  className="btn-save" 
                  onClick={handleChangePassword} 
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }} 
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
            </>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="profile-orders">              
              {ordersLoading ? (
                <div className="orders-loading">
                  <p>Đang tải...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="orders-empty">
                  <p>Bạn chưa có đơn hàng nào</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Phương thức</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td>#{order.id}</td>
                        <td>{order.tao_luc ? new Date(order.tao_luc).toLocaleDateString('vi-VN') : '-'}</td>
                        <td style={{ fontWeight: '600', color: '#d32f2f' }}>
                          {(order.tong_tien || 0).toLocaleString('vi-VN')}₫
                        </td>
                        <td>{order.phuong_thuc_thanh_toan === 'cod' ? 'COD' : 'Chuyển khoản'}</td>
                        <td>{getStatusLabel(order.trang_thai)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          color: '#000033',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                color: '#333'
              }}>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Delivery Info */}
            <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>📦 Thông tin giao hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Người nhận</p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#333' }}>
                    {selectedOrder.ten_nguoi_nhan || '-'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Điện thoại</p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#333' }}>
                    {selectedOrder.dien_thoai_nhan || '-'}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Địa chỉ giao hàng</p>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#333' }}>
                  {selectedOrder.dia_chi_nhan || '-'}
                </p>
              </div>
            </div>

            {/* Order Info */}
            <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>📋 Thông tin đơn hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Ngày đặt</p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#333' }}>
                    {selectedOrder.tao_luc ? new Date(selectedOrder.tao_luc).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Phương thức thanh toán</p>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '500', color: '#333' }}>
                    {selectedOrder.phuong_thuc_thanh_toan === 'cod' ? '💵 Thanh toán khi nhận' : '🏦 Chuyển khoản ngân hàng'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>📍 Trạng thái đơn hàng</h3>
              <div style={{
                display: 'inline-block',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                backgroundColor: getStatusColor(selectedOrder.trang_thai)
              }}>
                {getStatusLabel(selectedOrder.trang_thai)}
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>🛍️ Sản phẩm</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Sản phẩm</th>
                      <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600' }}>SL</th>
                      <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>Giá</th>
                      <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600' }}>Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px' }}>{item.ten || '-'}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>{item.so_luong || 0}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            {(item.don_gia || 0).toLocaleString('vi-VN')}₫
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#d32f2f' }}>
                            {(item.thanh_tien || 0).toLocaleString('vi-VN')}₫
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                          Không có sản phẩm
                        </td>
                      </tr>
                    )}
                    {selectedOrder.giam_gia_edu && selectedOrder.giam_gia_edu > 0 && (
                      <tr style={{ backgroundColor: 'rgba(76, 175, 80, 0.05)', fontWeight: '600', fontSize: '14px' }}>
                        <td colSpan="3" style={{ padding: '12px', textAlign: 'right', color: '#2e7d32' }}>
                          💰 Giảm giá Edu:
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#2e7d32' }}>
                          -{(selectedOrder.giam_gia_edu || 0).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    )}
                    <tr style={{ backgroundColor: '#f0f9ff', fontWeight: '600', fontSize: '15px' }}>
                      <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>Tổng thanh toán:</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#d32f2f' }}>
                        {(selectedOrder.tong_tien || 0).toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.ghi_chu && (
              <div style={{ marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>📝 Ghi chú</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.5' }}>
                  {selectedOrder.ghi_chu}
                </p>
              </div>
            )}

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '400px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '15px',
              color: '#d32f2f',
              fontSize: '20px'
            }}>
              ⚠️ Xóa tài khoản
            </h2>
            <p style={{
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '25px'
            }}>
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này <strong>không thể hoàn tác</strong>. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
            </p>
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#d32f2f',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Đang xử lý...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="profile-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: '5px' }}>Đánh giá sản phẩm</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Quản lý và sửa đánh giá sản phẩm đã mua
              </p>
            </div>
            {pendingReviewCount > 0 && (
              <a 
                href="/reviews" 
                style={{ 
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                Đánh giá ({pendingReviewCount}) →
              </a>
            )}
          </div>
          
          {reviewsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Đang tải...</p>
            </div>
          ) : reviewedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p>Bạn chưa đánh giá sản phẩm nào</p>
              {pendingReviewCount > 0 && (
                <a 
                  href="/reviews" 
                  style={{ 
                    display: 'inline-block',
                    marginTop: '15px',
                    padding: '10px 20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  Đánh giá sản phẩm ({pendingReviewCount}) →
                </a>
              )}
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Xếp hạng</th>
                  <th>Tiêu đề</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reviewedProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.tieu_de || '-'}
                    </td>
                    <td>{'⭐'.repeat(product.rating || 0)}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.review_title || '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingReview(product);
                          setEditForm({
                            rating: product.rating || 0,
                            title: product.review_title || '',
                            content: product.review_content || ''
                          });
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#667eea',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* EDIT REVIEW MODAL */}
      {editingReview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setEditingReview(null)}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '15px'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                color: '#333'
              }}>Sửa đánh giá: {editingReview.tieu_de}</h2>
              <button 
                onClick={() => setEditingReview(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Xếp hạng
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setEditForm({ ...editForm, rating: star })}
                    style={{
                      fontSize: '32px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: star <= editForm.rating ? 1 : 0.3,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Tiêu đề
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                disabled={loading}
                placeholder="Tiêu đề đánh giá"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Content */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Nội dung
              </label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                disabled={loading}
                placeholder="Chia sẻ ý kiến của bạn về sản phẩm này"
                rows="6"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setEditingReview(null)}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveReview}
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#667eea',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </section>
    <Footer />
    </>
  );
}
