import React, { useState, useMemo, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from './modules/Dashboard';
import Products from './modules/Products';
import Orders from './modules/Orders';
import Customers from './modules/Customers';
import Banners from './modules/Banners';
import Chat from './modules/Chat';
import Staff from './modules/Staff';
import './Admin.css';

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

export default function Admin() {
  const { token, setToken } = useContext(AuthContext);
  const userInfo = useMemo(() => decodeJwt(token), [token]);
  const isAdmin = !!(userInfo && (userInfo.role === 'admin' || userInfo.isAdmin));
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) window.location.href = '/';
  }, [token]);

  const displayName = userInfo?.ten || userInfo?.name || userInfo?.email || 'User';
  const userInitial = (displayName || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/';
  };

  return (
    <div className="admin-container">
      {/* HEADER - FIXED TOP */}
      <header className="admin-header">
        <div className="header-search">
          <input
            type="text"
            placeholder="Tìm sản phẩm, mã đơn, khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        <div className="header-actions">
          <button className="icon-btn" title="Thông báo">
            🔔
            <span className="badge">2</span>
          </button>
          <button className="icon-btn" title="Tin nhắn">
            💬
            <span className="badge">3</span>
          </button>

          <div className="user-menu-wrapper">
            <button
              className="user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar">{userInitial}</span>
              <span className="user-name">{displayName}</span>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <button onClick={() => alert('Hồ sơ cá nhân (sẽ triển khai)')}>
                  👤 Hồ sơ cá nhân
                </button>
                <button onClick={() => alert('Đổi mật khẩu (sẽ triển khai)')}>
                  🔐 Đổi mật khẩu
                </button>
                <hr />
                <button onClick={handleLogout} className="logout-btn">
                  🚪 Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LAYOUT: SIDEBAR + CONTENT */}
      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            <h2>Admin Panel</h2>
          </div>
          <nav className="sidebar-menu">
            <button
              className={`menu-item ${activeModule === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveModule('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`menu-item ${activeModule === 'products' ? 'active' : ''}`}
              onClick={() => setActiveModule('products')}
            >
              📦 Quản lý sản phẩm
            </button>
            <button
              className={`menu-item ${activeModule === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveModule('orders')}
            >
              🛒 Quản lý đơn hàng
            </button>
            <button
              className={`menu-item ${activeModule === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveModule('customers')}
            >
              👥 Quản lý khách hàng
            </button>
            <button
              className={`menu-item ${activeModule === 'banners' ? 'active' : ''}`}
              onClick={() => setActiveModule('banners')}
            >
              🎨 Quản lý Banner
            </button>
            <button
              className={`menu-item ${activeModule === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveModule('chat')}
            >
              💬 Chat
            </button>
            {isAdmin && (
              <button
                className={`menu-item ${activeModule === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveModule('staff')}
              >
                👔 Nhân viên
              </button>
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-main">
          {/* CONTENT AREA */}
          <div className="admin-content">
            {activeModule === 'dashboard' && <Dashboard />}
            {activeModule === 'products' && <Products />}
            {activeModule === 'orders' && <Orders />}
            {activeModule === 'customers' && <Customers />}
            {activeModule === 'banners' && <Banners />}
            {activeModule === 'chat' && <Chat />}
            {activeModule === 'staff' && isAdmin && <Staff />}
          </div>
        </main>
      </div>
    </div>
  );
}
