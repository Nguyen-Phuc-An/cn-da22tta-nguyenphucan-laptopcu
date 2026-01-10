import React, { useState } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function ChangePasswordModal({ onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải ít nhất 6 ký tự' });
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: {
          oldPassword,
          newPassword
        }
      });

      console.log('[ChangePasswordModal] Response:', res);

      if (res?.success || res?.message) {
        setMessage({ type: 'success', text: res?.message || 'Đổi mật khẩu thành công' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage({ type: 'error', text: res?.error || 'Đổi mật khẩu thất bại' });
      }
    } catch (err) {
      console.error('[ChangePasswordModal] Error:', err);
      setMessage({ type: 'error', text: err.message || 'Đổi mật khẩu thất bại' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Đổi mật khẩu</h2>
          <button className="close-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>
        </div>

        <div className="modal-body">
          {message && (
            <div style={{
              padding: '12px',
              marginBottom: '15px',
              borderRadius: '6px',
              backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
              color: message.type === 'error' ? '#991b1b' : '#166534'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label>Mật khẩu cũ</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button 
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Hủy
          </button>
          <button 
            type="button"
            onClick={handleChangePassword}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </div>
      </div>
    </div>
  );
}
