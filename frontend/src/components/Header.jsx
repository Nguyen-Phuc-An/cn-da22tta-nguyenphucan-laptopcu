import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/Cart';
import { SearchContext } from '../context/SearchContextValue';

export default function Header({ onOpenAuth, onLogout }) {
  const { token } = useContext(AuthContext);
  const { getTotalQuantity } = useContext(CartContext);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [searchValue, setSearchValue] = useState(searchQuery);

  // Update local state when context changes
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  // parse token once to determine admin and user label
  let userPayload = null;
  let isAdmin = false;
  let isStaff = false;
  try {
    if (token) userPayload = JSON.parse(atob(token.split('.')[1]));
    if (userPayload) {
      isAdmin = !!(userPayload.role === 'admin' || userPayload.isAdmin || userPayload.is_admin || userPayload.admin === true || (userPayload.permissions && userPayload.permissions.includes && userPayload.permissions.includes('admin')));
      isStaff = !!(userPayload.role === 'staff' || userPayload.isStaff || userPayload.is_staff || (userPayload.permissions && userPayload.permissions.includes && userPayload.permissions.includes('staff')));
    }
  } catch {
    userPayload = null; isAdmin = false; isStaff = false;
  }
  const isOperator = isAdmin || isStaff;

  // Hide the global header when an admin or staff is viewing the admin dashboard
  try {
    const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
    if (isOperator && pathname && pathname.startsWith('/admin')) return null;
  } catch {
    // ignore
  }

  const userLabel = userPayload ? (userPayload.ten || userPayload.name || userPayload.email || `#${userPayload.id}`).charAt(0).toUpperCase() : null;

  const handleSearch = (e) => {
    e.preventDefault();
    // Update search context (which also saves to sessionStorage)
    setSearchQuery(searchValue.trim());
  };
  return (
    <header className="site-header">
      {/* scrolling ticker above header-inner */}
      <div className="header-ticker" aria-hidden>
        <div className="ticker-track">
          {[
            'Giá mềm - Hiệu năng còn mới',
            'Tiết kiệm thông minh - Trãi nghiêm thoải mái',
            'Bền - Mượt - Đáng giá',
            'Sản phẩm chính hãng - Xuất VAT đầy đủ',
            'Giao nhanh - Miễn phí cho đơn trên 500k'
          ].map((txt, i) => (
            <span key={i} className="ticker-item">{txt}</span>
          ))}
          {[ /* duplicate items for seamless loop */
            'Giá mềm - Hiệu năng còn mới',
            'Tiết kiệm thông minh - Trãi nghiêm thoải mái',
            'Bền - Mượt - Đáng giá',
            'Sản phẩm chính hãng - Xuất VAT đầy đủ',
            'Giao nhanh - Miễn phí cho đơn trên 500k'
          ].map((txt, i) => (
            <span key={`d-${i}`} className="ticker-item">{txt}</span>
          ))}
        </div>
      </div>

      <div className="container header-inner">
        <a href="/" className="brand-with-logo" style={{ textDecoration: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="http://localhost:3000/public/uploads/products/Logo.png"
            alt="Laptop Cũ Logo"
            style={{ width: '45px', height: '45px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 45 45%22%3E%3Ccircle cx=%2722.5%22 cy=%2722.5%27 r=%2722.5%27 fill=%27%23666%27/%3E%3C/svg%3E';
            }}
          />
          <span style={{ fontSize: '20px', fontWeight: '600' }}>
            {isAdmin ? 'Admin Dashboard' : 'AN Laptop Cũ'}
          </span>
        </a>
        <nav className="nav">
          <form className="header-search" role="search" onSubmit={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
            <input 
              type="search" 
              placeholder="Bạn muốn mua gì hôm nay?" 
              aria-label="Tìm kiếm sản phẩm"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>
          <button 
            className="cart-btn" 
            title="Giỏ hàng"
            onClick={() => window.location.href = '/cart'}
          >
            <span style={{marginRight:4}}>Giỏ hàng</span>
            {getTotalQuantity() > 0 && <span className="cart-badge">{getTotalQuantity()}</span>}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="20" r="2" fill="currentColor" />
              <circle cx="18" cy="20" r="2" fill="currentColor" />
            </svg>
          </button>

          {token ? (
            <>
              {!isAdmin && 
              <button className="wishlists-btn" title="Yêu thích" onClick={() => window.location.href = '/wishlists'}>
                <span style={{marginRight:4}}>Yêu thích</span>
                <svg width="20px" height="20px" viewBox="0 0 15 15" version="1.1" id="heart" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M13.91,6.75c-1.17,2.25-4.3,5.31-6.07,6.94c-0.1903,0.1718-0.4797,0.1718-0.67,0C5.39,12.06,2.26,9,1.09,6.75&#xA;&#x9;C-1.48,1.8,5-1.5,7.5,3.45C10-1.5,16.48,1.8,13.91,6.75z"stroke="currentColor" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>}
              {!isAdmin && userLabel && 
              <button className="user-info" onClick={() => window.location.href = '/profile'}>
                {userLabel}
              </button>}
              {(() => {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const isAdmin = payload && (payload.role === 'admin' || payload.isAdmin || payload.is_admin || payload.admin === true || (payload.permissions && payload.permissions.includes && payload.permissions.includes('admin')));
                  const isStaff = payload && (payload.role === 'staff' || payload.isStaff || payload.is_staff || (payload.permissions && payload.permissions.includes && payload.permissions.includes('staff')));
                  if (isAdmin || isStaff) return <a className="btn" href="/admin">Admin</a>;
                  return null;
                } catch {
                  return null;
                }
              })()}
              <button className="btn" onClick={onLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => onOpenAuth('login')}>Đăng nhập</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}