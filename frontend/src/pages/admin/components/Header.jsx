import React, { useState } from 'react';

export default function Header({ userInfo, searchQuery, setSearchQuery, setToken }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const displayName = (userInfo && (userInfo.ten || userInfo.name || userInfo.email)) || 'User';
  const initials = (displayName || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/';
  };

  return (
    <header className="admin-header">
      <div className="header-search">
        <input
          type="text"
          placeholder="Tìm sản phẩm, mã đơn, khách hàng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-btn">🔍</button>
      </div>

      <div className="header-actions">
        <button className="header-icon" title="Thông báo">
          🔔
          <span className="badge">3</span>
        </button>
        <button className="header-icon" title="Tin nhắn">
          💬
          <span className="badge">5</span>
        </button>

        <div className="user-menu-container">
          <button 
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="avatar">{initials}</span>
            <span className="username">{displayName}</span>
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <button onClick={() => alert('Hồ sơ cá nhân (sẽ triển khai)')}>
                👤 Hồ sơ cá nhân
              </button>
              <button onClick={() => alert('Đổi mật khẩu (sẽ triển khai)')}>
                🔑 Đổi mật khẩu
              </button>
              <hr />
              <button onClick={handleLogout}>
                🚪 Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
