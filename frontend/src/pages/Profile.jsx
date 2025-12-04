import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUser, updateUser, deleteUser } from '../api/users';
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

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    ten: '',
    email: '',
    dien_thoai: '',
    dia_chi: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data on mount
  useEffect(() => {
    if (userId) {
      (async () => {
        try {
          setLoading(true);
          const res = await getUser(userId);
          if (res && res.data) {
            setUserData(res.data);
            setForm({
              ten: res.data.ten || '',
              email: res.data.email || '',
              dien_thoai: res.data.dien_thoai || '',
              dia_chi: res.data.dia_chi || ''
            });
          }
        } catch (err) {
          setError('Không thể tải thông tin người dùng');
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [userId]);

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/';
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await updateUser(userId, form);
      if (res && res.data) {
        setUserData(res.data);
        setIsEditing(false);
        setSuccess('Cập nhật hồ sơ thành công!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

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

      const res = await updateUser(userId, {
        mat_khau_hien_tai: passwordForm.currentPassword,
        mat_khau_moi: passwordForm.newPassword
      });

      if (res && res.data) {
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('Đổi mật khẩu thành công!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.');
    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');

      await deleteUser(userId);
      setToken(null);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !userData) {
    return (
      <section className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <p>Đang tải...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Hồ sơ người dùng</h1>
          <button className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-card">
          {isEditing ? (
            <div className="profile-form">
              <h2>Chỉnh sửa hồ sơ</h2>
              <label>
                Tên<br />
                <input
                  type="text"
                  value={form.ten}
                  onChange={e => setForm({ ...form, ten: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                Email<br />
                <input
                  type="email"
                  value={form.email}
                  disabled
                />
              </label>
              <label>
                Số điện thoại<br />
                <input
                  type="tel"
                  value={form.dien_thoai}
                  onChange={e => setForm({ ...form, dien_thoai: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                Địa chỉ<br />
                <textarea
                  value={form.dia_chi}
                  onChange={e => setForm({ ...form, dia_chi: e.target.value })}
                  rows="4"
                  disabled={loading}
                />
              </label>
              <div className="profile-actions">
                <button className="btn-save" onClick={handleSaveProfile} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button className="btn-cancel" onClick={() => setIsEditing(false)} disabled={loading}>Hủy</button>
              </div>
            </div>
          ) : isChangingPassword ? (
            <div className="profile-form">
              <h2>Đổi mật khẩu</h2>
              <label>
                Mật khẩu hiện tại<br />
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                Mật khẩu mới<br />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  disabled={loading}
                />
              </label>
              <label>
                Xác nhận mật khẩu mới<br />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </label>
              <div className="profile-actions">
                <button className="btn-save" onClick={handleChangePassword} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
                <button className="btn-cancel" onClick={() => setIsChangingPassword(false)} disabled={loading}>Hủy</button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <h2>Thông tin cá nhân</h2>
              <div className="info-group">
                <div className="info-label">ID</div>
                <div className="info-value">{userData?.id || '-'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Tên</div>
                <div className="info-value">{userData?.ten || '-'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Email</div>
                <div className="info-value">{userData?.email || '-'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Số điện thoại</div>
                <div className="info-value">{userData?.dien_thoai || '-'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Địa chỉ</div>
                <div className="info-value">{userData?.dia_chi || '-'}</div>
              </div>
              <div className="profile-actions">
                <button className="btn-edit" onClick={() => setIsEditing(true)} disabled={loading}>Chỉnh sửa thông tin</button>
                <button className="btn-password" onClick={() => setIsChangingPassword(true)} disabled={loading}>Đổi mật khẩu</button>
                <button className="btn-delete" onClick={handleDeleteAccount} disabled={loading}>Xóa tài khoản</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
