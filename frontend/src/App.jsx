import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatButton from './components/ChatButton';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Wishlists from './pages/Wishlists';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import EduVerification from './pages/EduVerification';
import Reviews from './pages/Reviews';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/admin/Admin';
import AuthModal from './components/AuthModal';
import { setToken as apiSetToken, apiFetch } from './services/apiClient';
import { AuthContext } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { AuthModalContext } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext.jsx';
import { ToastProvider, ToastContext } from './context/ToastContext';
import { usePendingReviewsNotification } from './hooks/usePendingReviewsNotification';

export default function App() {
  const [token, setTokenState] = useState(() => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem('cn_token') : null;
    } catch (err) {
      console.warn('localStorage.getItem error', err);
      return null;
    }
  });

  const [user, setUserState] = useState(null);

  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null

  useEffect(() => {
    try {
      apiSetToken(token);
    } catch (err) {
      console.warn('apiSetToken error', err);
    }
  }, [token]);

  // Fetch user data when token changes
  useEffect(() => {
    if (!token) {
      setUserState(null);
      return;
    }

    (async () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload?.id;
        if (!userId) return;

        const userData = await apiFetch(`/users/${userId}`);
        const user = Array.isArray(userData) ? userData[0] : userData?.data || userData;
        if (user) {
          setUserState(user);
        }
      } catch (err) {
        console.warn('Failed to fetch user data:', err);
      }
    })();
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

  const contextValue = useMemo(() => ({ token, setToken: handleSetToken, user, setUser: setUserState }), [token, handleSetToken, user]);

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

  // AppContent component - wraps everything that needs ToastContext
  function AppContent() {
    usePendingReviewsNotification(user, token);

    return (
      <div className="app">
      <Header onOpenAuth={setModalMode} onLogout={() => {
        // Clear pending reviews notification flag when logging out
        if (user?.id) {
          localStorage.removeItem(`pending_reviews_notified_${user.id}`);
        }
        handleSetToken(null);
      }} />
        <main className="container">
          {/* Simple pathname routing: /admin for admin dashboard, /product/:id for product detail, /profile for user profile, /wishlists for wishlist, /cart for cart, /checkout for checkout, /order-success/:id for order success (pretty URLs) */}
          {(() => {
            const p = typeof window !== 'undefined' ? window.location.pathname : '';
            if (p && p.startsWith('/admin')) {
              return isOperator ? <Admin /> : <Home />;
            }
            if (p && p.startsWith('/product/')) {
              return <ProductDetail />;
            }
            if (p && p.startsWith('/order-success/')) {
              return <OrderSuccess />;
            }
            if (p && p.startsWith('/checkout')) {
              return <Checkout />;
            }
            if (p && p.startsWith('/about')) {
              return <About />;
            }
            if (p && p.startsWith('/contact')) {
              return <Contact />;
            }
            if (p && p.startsWith('/edu-verification')) {
              return <EduVerification />;
            }
            if (p && p.startsWith('/profile')) {
              return <Profile />;
            }
            if (p && p.startsWith('/wishlists')) {
              return <Wishlists />;
            }
            if (p && p.startsWith('/reviews')) {
              return <Reviews />;
            }
            if (p && p.startsWith('/cart')) {
              return <Cart />;
            }
            return <Home />;
          })()}
        </main>
        {/* hide footer on admin dashboard (for admins), product detail, profile page, wishlists page, cart, checkout, and order success; show footer for customers even if path is /admin */}
        {(() => {
          const p = typeof window !== 'undefined' ? window.location.pathname : '';
          const hideFooter = (p && p.startsWith('/admin') && isOperator) || (p && p.startsWith('/product/')) || (p && p.startsWith('/profile')) || (p && p.startsWith('/wishlists')) || (p && p.startsWith('/cart')) || (p && p.startsWith('/checkout')) || (p && p.startsWith('/order-success/')) || (p && p.startsWith('/edu-verification'));
          return !hideFooter && <Footer />;
        })()}
        {modalMode && (
          <AuthModal
            mode={modalMode}
            onClose={() => setModalMode(null)}
            onAuthSuccess={(res) => {
              // res may be { token, user } or a token string
              const tokenValue = (typeof res === 'string') ? res : (res && res.token) ? res.token : null;
              const userData = (res && typeof res === 'object' && res.user) ? res.user : null;
              if (tokenValue) {
                handleSetToken(tokenValue);
                if (userData) {
                  setUserState(userData);
                }
                // if admin or staff, navigate to admin dashboard
                try {
                  const payload = JSON.parse(atob(tokenValue.split('.')[1]));
                  const isAdmin = payload && (payload.role === 'admin' || payload.isAdmin || payload.is_admin || payload.admin === true || (payload.permissions && payload.permissions.includes && payload.permissions.includes('admin')));
                  const isStaff = payload && (payload.role === 'staff' || payload.isStaff || payload.is_staff || (payload.permissions && payload.permissions.includes && payload.permissions.includes('staff')));
                  if (isAdmin || isStaff) window.location.href = window.location.origin + '/admin';
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
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthModalContext.Provider value={{ modalMode, setModalMode }}>
        <ToastProvider>
          <CartProvider>
            <SearchProvider>
              <AppContent />
            </SearchProvider>
          </CartProvider>
        </ToastProvider>
      </AuthModalContext.Provider>
    </AuthContext.Provider>
  );
}