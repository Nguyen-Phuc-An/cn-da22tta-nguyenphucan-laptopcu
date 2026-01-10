import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/Cart';
import { SearchContext } from '../context/SearchContextValue';
import { getMainUserImage } from '../api/usersImages';

// Giải mã JWT
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
// Header component
export default function Header({ onOpenAuth, onLogout }) {
  const { token } = useContext(AuthContext);
  const { getTotalQuantity } = useContext(CartContext);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userLabel, setUserLabel] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  // Phân tích token mỗi khi nó thay đổi
  useEffect(() => {
    let label = null;
    let admin = false;
    let staff = false;
    let userId = null;
    
    try {
      if (token) {
        const userInfo = decodeJwt(token);
        if (userInfo) {
          admin = !!(userInfo.role === 'admin' || userInfo.isAdmin || userInfo.is_admin || userInfo.admin === true || (userInfo.permissions && userInfo.permissions.includes && userInfo.permissions.includes('admin')));
          staff = !!(userInfo.role === 'staff' || userInfo.isStaff || userInfo.is_staff || (userInfo.permissions && userInfo.permissions.includes && userInfo.permissions.includes('staff')));
          label = (userInfo.ten || userInfo.name || userInfo.email || `#${userInfo.id}`).charAt(0).toUpperCase();
          userId = userInfo.id;
        }
      }
    } catch {
      label = null;
      userId = null;
    }
    
    setUserLabel(label);
    setIsAdmin(admin);
    setIsStaff(staff);

    // Tải avatar nếu người dùng đã đăng nhập
    if (userId) {
      (async () => {
        try {
          const image = await getMainUserImage(userId);
          if (image?.duong_dan) {
            setUserAvatar(`http://localhost:3000${image.duong_dan}`);
          } else {
            setUserAvatar(null);
          }
        } catch (err) {
          console.error('Failed to load user avatar:', err);
          setUserAvatar(null);
        }
      })();
    } else {
      setUserAvatar(null);
    }
  }, [token]);

  // Lấy giá trị tìm kiếm từ context
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const isOperator = isAdmin || isStaff;

  // Ẩn header toàn cục khi admin hoặc nhân viên đang xem bảng điều khiển admin
  try {
    const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
    if (isOperator && pathname && pathname.startsWith('/admin')) return null;
  } catch {
    // ignore
  }

  const handleSearch = (e) => {
    e.preventDefault();
    // Cập nhật context tìm kiếm (cũng lưu vào sessionStorage)
    setSearchQuery(searchValue.trim());
  };
  return (
    <header className="site-header">
      {/* thanh chạy thông báo */}
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
          {[ /* nhân bản các mục để tạo vòng lặp liền mạch */
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
        <a href="/" className="brand-with-logo" style={{ textDecoration: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="http://localhost:3000/public/uploads/products/Logo.png"
            alt="Laptop Cũ Logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 45 45%22%3E%3Ccircle cx=%2722.5%22 cy=%2722.5%27 r=%2722.5%27 fill=%27%23666%27/%3E%3C/svg%3E';
            }}
          />
          <span style={{ fontSize: '25px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            {isAdmin ? 'Admin Dashboard' : 'AN Laptop Cũ'}
          </span>
        </a>
        <nav className="header-menu">
          <a href="/" className={`menu-link ${typeof window !== 'undefined' && window.location.pathname === '/' ? 'active' : ''}`}>Trang chủ</a>
          <a href="/about" className={`menu-link ${typeof window !== 'undefined' && window.location.pathname === '/about' ? 'active' : ''}`}>Giới thiệu</a>
          <a href="/contact" className={`menu-link ${typeof window !== 'undefined' && window.location.pathname === '/contact' ? 'active' : ''}`}>Liên hệ</a>
        </nav>
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
            className={`cart-btn ${typeof window !== 'undefined' && window.location.pathname === '/cart' ? 'active' : ''}`}
            title="Giỏ hàng"
            onClick={() => window.location.href = '/cart'}
          >
            <span style={{marginRight:4, fontSize: '16px', whiteSpace: 'nowrap'}}>Giỏ hàng</span>
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
              <button className={`wishlists-btn ${typeof window !== 'undefined' && window.location.pathname === '/wishlists' ? 'active' : ''}`} title="Yêu thích" onClick={() => window.location.href = '/wishlists'}>
                <span style={{marginRight:4, fontSize: '16px', whiteSpace: 'nowrap'}}>Yêu thích</span>
                <svg width="20px" height="15px" viewBox="0 0 15 15" version="1.1" id="heart" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M13.91,6.75c-1.17,2.25-4.3,5.31-6.07,6.94c-0.1903,0.1718-0.4797,0.1718-0.67,0C5.39,12.06,2.26,9,1.09,6.75&#xA;&#x9;C-1.48,1.8,5-1.5,7.5,3.45C10-1.5,16.48,1.8,13.91,6.75z"stroke="currentColor" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>}
              {!isAdmin && 
              <button className="user-info" onClick={() => window.location.href = '/profile'} title="Hồ sơ">
                {userAvatar ? (
                  <img 
                    src={userAvatar} 
                    alt="Avatar"
                    style={{ width: '90%', height: '90%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  userLabel
                )}
              </button>}
              {(() => {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const isAdmin = payload && (payload.role === 'admin' || payload.isAdmin || payload.is_admin || payload.admin === true || (payload.permissions && payload.permissions.includes && payload.permissions.includes('admin')));
                  const isStaff = payload && (payload.role === 'staff' || payload.isStaff || payload.is_staff || (payload.permissions && payload.permissions.includes && payload.permissions.includes('staff')));
                  if (isAdmin || isStaff) return <a className="btn" href="/admin" style={{margin: '0', padding: '8px 10px'}}>Admin</a>;
                  return null;
                } catch {
                  return null;
                }
              })()}
              <button className="btn" onClick={() => {
                onLogout();
                window.location.href = '/';
              }} style={{width: '120px', whiteSpace: 'nowrap'}}>Đăng xuất</button>
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