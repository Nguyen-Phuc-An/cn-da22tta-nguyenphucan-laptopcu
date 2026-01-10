import React, { useState, useMemo, useContext, useEffect } from 'react';
import { BsBoxSeam, BsChatDots, BsPerson, BsLock } from 'react-icons/bs';
import { AuthContext } from '../../context/AuthContext';
import Dashboard from './modules/Dashboard';
import Products from './modules/Products';
import Orders from './modules/Orders';
import Customers from './modules/Customers';
import Banners from './modules/Banners';
import Chat from './modules/Chat';
import Staff from './modules/Staff';
import Contacts from './modules/Contacts';
import EduVerifications from './modules/EduVerifications';
import Reviews from './modules/Reviews';
import ProfileModal from './modals/ProfileModal';
import ChangePasswordModal from './modals/ChangePasswordModal';
import { apiFetch } from '../../services/apiClient';
import './Admin.css';
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
// Main Admin Component
export default function Admin() {
  const { token, setToken } = useContext(AuthContext);// Lấy thông tin người dùng từ token
  const userInfo = useMemo(() => decodeJwt(token), [token]);// Kiểm tra quyền admin
  // Nếu không phải admin, redirect về trang chủ
  const isAdmin = !!(userInfo && (userInfo.role === 'admin' || userInfo.isAdmin || userInfo.is_admin || userInfo.admin === true || (userInfo.permissions && userInfo.permissions.includes && userInfo.permissions.includes('admin'))));
  
  const [activeModule, setActiveModule] = useState('dashboard'); // Mặc định là dashboard
  const [showUserMenu, setShowUserMenu] = useState(false); // Hiển thị menu người dùng
  const [showProfileModal, setShowProfileModal] = useState(false); // Hiển thị modal hồ sơ
  const [showPasswordModal, setShowPasswordModal] = useState(false); // Hiển thị modal đổi mật khẩu
  const [pendingOrders, setPendingOrders] = useState(0); // Số đơn hàng mới
  const [unreadMessages, setUnreadMessages] = useState(0); // Số tin nhắn chưa đọc

  // Kiểm tra token hợp lệ
  useEffect(() => {
    if (!token) window.location.href = '/';
  }, [token]);

  // Tải số liệu thống kê
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await apiFetch('/admin/stats');
        if (stats) {
          setPendingOrders(stats.orders?.newOrders || 0);
          setUnreadMessages(stats.messages?.unreadMessages || 0);
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const displayName = userInfo?.ten || userInfo?.name || userInfo?.email || 'User';
  const userInitial = (displayName || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/';
  };

  return (
    <div className="admin-container">
      {/* LAYOUT: SIDEBAR + MAIN */}
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
              Dashboard
            </button>
            <button
              className={`menu-item ${activeModule === 'products' ? 'active' : ''}`}
              onClick={() => setActiveModule('products')}
            >
              Quản lý sản phẩm
            </button>
            <button
              className={`menu-item ${activeModule === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveModule('orders')}
            >
              Quản lý đơn hàng
            </button>
            <button
              className={`menu-item ${activeModule === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveModule('customers')}
            >
              Quản lý khách hàng
            </button>
            <button
              className={`menu-item ${activeModule === 'banners' ? 'active' : ''}`}
              onClick={() => setActiveModule('banners')}
            >
              Quản lý Banner
            </button>
            <button
              className={`menu-item ${activeModule === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveModule('chat')}
            >
              Chat
            </button>
            <button
              className={`menu-item ${activeModule === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveModule('contacts')}
            >
              Liên hệ
            </button>
            <button
              className={`menu-item ${activeModule === 'edu-verifications' ? 'active' : ''}`}
              onClick={() => setActiveModule('edu-verifications')}
            >
              Xác thực Edu
            </button>
            <button
              className={`menu-item ${activeModule === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveModule('reviews')}
            >
              Đánh giá
            </button>
            {isAdmin && (
              <button
                className={`menu-item ${activeModule === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveModule('staff')}
              >
                Nhân viên
              </button>
            )}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-main">
          {/* HEADER */}
          <header className="admin-header">
            <div className="header-actions">
              <button 
                className="icon-btn" 
                title="Đơn hàng mới"
                onClick={() => setActiveModule('orders')}
              >
                <BsBoxSeam />
                {pendingOrders > 0 && <span className="status-dot"></span>}
              </button>
              <button 
                className="icon-btn" 
                title="Tin nhắn mới"
                onClick={() => setActiveModule('chat')}
              >
                <BsChatDots />
                {unreadMessages > 0 && <span className="status-dot"></span>}
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
                    <button onClick={() => { setShowProfileModal(true); setShowUserMenu(false); }}>
                      <BsPerson /> Hồ sơ cá nhân
                    </button>
                    <button onClick={() => { setShowPasswordModal(true); setShowUserMenu(false); }}>
                      <BsLock /> Đổi mật khẩu
                    </button>
                    <hr />
                    <button onClick={handleLogout} className="logout-btn">
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* CONTENT AREA */}
          <div className="admin-content">
            {activeModule === 'dashboard' && <Dashboard />}
            {activeModule === 'products' && <Products />}
            {activeModule === 'orders' && <Orders />}
            {activeModule === 'customers' && <Customers />}
            {activeModule === 'banners' && <Banners />}
            {activeModule === 'chat' && <Chat />}
            {activeModule === 'contacts' && <Contacts />}
            {activeModule === 'edu-verifications' && <EduVerifications />}
            {activeModule === 'reviews' && <Reviews />}
            {activeModule === 'staff' && isAdmin && <Staff />}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showProfileModal && <ProfileModal token={token} onClose={() => setShowProfileModal(false)} />}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
