import React, { useMemo } from 'react';

// Giải mã JWT để lấy thông tin người dùng
function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch { return null; }
}

export default function ProfileModal({ token, onClose }) {
  const userInfo = useMemo(() => decodeJwt(token), [token]);

  if (!userInfo) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Hồ sơ cá nhân</h2>
            <button className="close-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>
          </div>
          <div className="modal-body">
            <p>Không thể tải thông tin người dùng</p>
          </div>
          <div className="modal-footer">
            <button onClick={onClose} className="btn btn-secondary">Đóng</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Hồ sơ cá nhân</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label>Tên</label>
              <input
                type="text"
                value={userInfo.ten || userInfo.name || ''}
                disabled
                style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#f9fafb', color: '#666' }}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                value={userInfo.email || ''}
                disabled
                style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#f9fafb', color: '#666' }}
              />
            </div>

            <div>
              <label>Vai trò</label>
              <input
                type="text"
                value={userInfo.role === 'admin' || userInfo.isAdmin || userInfo.is_admin ? 'Quản trị viên' : 'Nhân viên'}
                disabled
                style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#f9fafb', color: '#666' }}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Đóng</button>
        </div>
      </div>
    </div>
  );
}
