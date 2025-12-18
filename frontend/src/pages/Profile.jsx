import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/apiClient';
import { uploadUserImages, getUserImages } from '../api/usersImages';
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
        
        if (user) {
          setUserData(user);
          
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
        const res = await apiFetch(`/orders?user_id=${userId}`);
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
      setError(err.message || 'Lỗi khi xóa tài khoản');
      console.error('Delete account error:', err);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Not logged in
  if (!token) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <div className="profile-empty">
            <p>Bạn chưa đăng nhập. Vui lòng <a href="/">quay lại trang chủ</a> để đăng nhập.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-container">
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tab Navigation */}
        <div className="profile-tabs" style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '0'
        }}>
          <button
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '900',
              color: activeTab === 'info' ? '#007bff' : '#666',
              borderBottom: activeTab === 'info' ? '3px solid #007bff' : 'none',
              marginBottom: '-2px',
              transition: 'all 0.3s ease',
              flex: '1',
              fontfamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
            }}
          >
            Thông tin cá nhân
          </button>
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '900',
              color: activeTab === 'orders' ? '#007bff' : '#666',
              borderBottom: activeTab === 'orders' ? '3px solid #007bff' : 'none',
              marginBottom: '-2px',
              transition: 'all 0.3s ease',
              flex: '1',
              fontfamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
            }}
          >
            Lịch sử đơn hàng
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
            <>
              {/* Avatar Section */}
              <div className="profile-avatar-section" style={{ textAlign: 'center', marginBottom: '30px' }}>
                {avatarPreview ? (
                  <img 
                    src={`http://localhost:3000${avatarPreview}`}
                    alt="Avatar"
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '60px',
                    fontWeight: 'bold',
                    color: '#999',
                    margin: '0 auto'
                  }}>
                    {userData?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="profile-info">
                <h2>Thông tin cá nhân</h2>

                <div className="info-group">
                  <div className="info-label">ID</div>
                  <div className="info-value">{userData?.id || '-'}</div>
                </div>

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

                <div className="profile-actions">
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
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <div className="profile-form">
              <h2>Chỉnh sửa hồ sơ</h2>

              {/* Avatar Edit */}
              <div className="avatar-edit-section" style={{ textAlign: 'center', marginBottom: '25px' }}>
                {avatarPreview ? (
                  <img 
                    src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:3000${avatarPreview}`}
                    alt="Avatar Preview"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px',
                    color: '#999'
                  }}>
                    Chọn ảnh
                  </div>
                )}
                <label style={{ display: 'block', marginTop: '10px' }}>
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
              <h2>Lịch sử đơn hàng</h2>
              
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <p>Đang tải...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <p>Bạn chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '20px'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '20px' }}>Mã đơn</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '20px' }}>Ngày đặt</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '20px' }}>Tổng tiền</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '20px' }}>Phương thức</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '20px' }}>Trạng thái</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '20px' }}>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px', fontSize: '20px' }}>#{order.id}</td>
                          <td style={{ padding: '12px', fontSize: '20px' }}>
                            {order.tao_luc ? new Date(order.tao_luc).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#d32f2f', fontSize: '20px' }}>
                            {(order.tong_tien || 0).toLocaleString('vi-VN')}₫
                          </td>
                          <td style={{ padding: '12px', fontSize: '20px' }}>
                            {order.phuong_thuc_thanh_toan === 'cod' ? 'COD' : 'Chuyển khoản'}
                          </td>
                          <td style={{ padding: '12px', fontSize: '20px' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '20px',
                              fontWeight: '500'                              
                            }}>
                              {getStatusLabel(order.trang_thai)}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedOrder(order)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                fontWeight: '500'
                              }}
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            maxHeight: '85vh',
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
    </section>
  );
}
