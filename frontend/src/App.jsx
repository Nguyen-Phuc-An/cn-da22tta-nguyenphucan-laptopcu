import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Wishlists from './pages/Wishlists';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/admin/Admin';
import AuthModal from './components/AuthModal';
import { setToken as apiSetToken } from './services/apiClient';
import { AuthContext } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { AuthModalContext } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const [token, setTokenState] = useState(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('cn_token') : null;
    } catch (err) {
      console.warn('localStorage.getItem error', err);
      return null;
    }
  });

  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null

  useEffect(() => {
    try {
      apiSetToken(token);
    } catch (err) {
      console.warn('apiSetToken error', err);
    }
  }, [token]);

  const handleSetToken = useCallback((t) => {
    try {
      if (t) {
        try {
          localStorage.setItem('cn_token', t);
        } catch (errLocal) {
          console.warn('localStorage.setItem error', errLocal);
        }
        try {
          apiSetToken(t);
        } catch (errApi) {
          console.warn('apiSetToken error', errApi);
        }
        setTokenState(t);
      } else {
        try {
          localStorage.removeItem('cn_token');
        } catch (errLocal) {
          console.warn('localStorage.removeItem error', errLocal);
        }
        try {
          apiSetToken(null);
        } catch (errApi) {
          console.warn('apiSetToken error', errApi);
        }
        setTokenState(null);
      }
    } catch (err) {
      console.warn('handleSetToken unexpected error', err);
    }
  }, []);

  const contextValue = useMemo(() => ({ token, setToken: handleSetToken }), [token, handleSetToken]);

  // derive roles once for use in rendering (admin/staff access to dashboard and header visibility)
  let isAdmin = false;
  let isStaff = false;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload && payload.role;
      isAdmin = !!(payload && (role === 'admin' || payload.isAdmin || payload.is_admin || payload.admin === true || (payload.permissions && payload.permissions.includes && payload.permissions.includes('admin'))));
      isStaff = !!(payload && (role === 'staff' || payload.is_staff || payload.isStaff || (payload.permissions && payload.permissions.includes && payload.permissions.includes('staff'))));
    }
  } catch {
    isAdmin = false; isStaff = false;
  }
  const isOperator = isAdmin || isStaff;

  // If someone opens /admin but is not admin/staff, redirect them to Home.
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const p = window.location.pathname || '';
        if (p.startsWith('/admin') && !isOperator) {
          // replace state to avoid adding back button entry
          window.history.replaceState({}, '', '/');
        }
      }
    } catch (e) { void e; }
  }, [isOperator]);

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthModalContext.Provider value={{ modalMode, setModalMode }}>
        <ToastProvider>
          <CartProvider>
            <SearchProvider>
              <div className="app">
                <Header onOpenAuth={setModalMode} onLogout={() => handleSetToken(null)} />
              <main className="container">
              {/* Simple pathname routing: /admin for admin dashboard, /product/:id for product detail, /profile for user profile, /wishlists for wishlist, /cart for cart (pretty URLs) */}
              {(() => {
                const p = typeof window !== 'undefined' ? window.location.pathname : '';
                if (p && p.startsWith('/admin')) {
                  return isOperator ? <Admin /> : <Home />;
                }
                if (p && p.startsWith('/product/')) {
                  return <ProductDetail />;
                }
                if (p && p.startsWith('/profile')) {
                  return <Profile />;
                }
                if (p && p.startsWith('/wishlists')) {
                  return <Wishlists />;
                }
                if (p && p.startsWith('/cart')) {
                  return <Cart />;
                }
                return <Home />;
              })()}
            </main>
            {/* hide footer on admin dashboard (for admins), product detail, profile page, wishlists page, and cart; show footer for customers even if path is /admin */}
            {(() => {
              const p = typeof window !== 'undefined' ? window.location.pathname : '';
              const hideFooter = (p && p.startsWith('/admin') && isOperator) || (p && p.startsWith('/product/')) || (p && p.startsWith('/profile')) || (p && p.startsWith('/wishlists')) || (p && p.startsWith('/cart'));
              return !hideFooter && <Footer />;
            })()}
          {modalMode && (
            <AuthModal
              mode={modalMode}
              onClose={() => setModalMode(null)}
              onAuthSuccess={(res) => {
                // res may be { token } or a token string
                const tokenValue = (typeof res === 'string') ? res : (res && res.token) ? res.token : null;
                if (tokenValue) {
                  handleSetToken(tokenValue);
                  // if admin, navigate to admin dashboard
                  try {
                    const payload = JSON.parse(atob(tokenValue.split('.')[1]));
                    const isAdmin = payload && (payload.role === 'admin' || payload.isAdmin || payload.is_admin || payload.admin === true || (payload.permissions && payload.permissions.includes && payload.permissions.includes('admin')));
                    if (isAdmin) window.location.href = window.location.origin + '/admin';
                  } catch {
                    // ignore
                  }
                }
                setModalMode(null);
              }}
            />
          )}
          {/* Chat button - hide on admin dashboard */}
          {(() => {
            const p = typeof window !== 'undefined' ? window.location.pathname : '';
            const isAdminPath = p && p.startsWith('/admin');
            return !isAdminPath && <ChatButton />;
          })()}
        </div>
        </SearchProvider>
      </CartProvider>
        </ToastProvider>
      </AuthModalContext.Provider>
    </AuthContext.Provider>
  );
}