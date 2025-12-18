import React, { useMemo } from 'react';

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
          <h2>Hồ sơ cá nhân</h2>
          <p>Không thể tải thông tin người dùng</p>
          <button onClick={onClose} className="btn-primary">Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Hồ sơ cá nhân</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
              Tên
            </label>
            <input
              type="text"
              value={userInfo.ten || userInfo.name || ''}
              disabled
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                color: '#666'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              value={userInfo.email || ''}
              disabled
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                color: '#666'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333' }}>
              Vai trò
            </label>
            <input
              type="text"
              value={userInfo.role === 'admin' || userInfo.isAdmin || userInfo.is_admin ? 'Quản trị viên' : 'Nhân viên'}
              disabled
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                color: '#666'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                color: '#666'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
