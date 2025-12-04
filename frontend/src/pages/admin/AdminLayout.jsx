import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './modules/Dashboard';
import Products from './modules/Products';
import Orders from './modules/Orders';
import Customers from './modules/Customers';
import Banners from './modules/Banners';
import Chat from './modules/Chat';
import Staff from './modules/Staff';
import './admin.css';

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

export default function AdminLayout() {
  const { token, setToken } = useContext(AuthContext);
  const userInfo = useMemo(() => decodeJwt(token), [token]);
  const isAdmin = !!(userInfo && (userInfo.role === 'admin' || userInfo.isAdmin));
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  if (!token) {
    window.location.href = '/';
    return null;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'orders': return <Orders />;
      case 'customers': return <Customers />;
      case 'banners': return <Banners />;
      case 'chat': return <Chat />;
      case 'staff': return isAdmin ? <Staff /> : null;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} isAdmin={isAdmin} />
      <div className="admin-main">
        <Header 
          userInfo={userInfo} 
          isAdmin={isAdmin}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setToken={setToken}
        />
        <div className="admin-content">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}
