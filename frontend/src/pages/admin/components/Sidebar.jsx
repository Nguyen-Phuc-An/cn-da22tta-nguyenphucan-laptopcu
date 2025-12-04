import React from 'react';

export default function Sidebar({ activeModule, setActiveModule, isAdmin }) {
  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Quản lý sản phẩm', icon: '📦' },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: '🛒' },
    { id: 'customers', label: 'Quản lý khách hàng', icon: '👥' },
    { id: 'banners', label: 'Quản lý Banner', icon: '🖼️' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    ...(isAdmin ? [{ id: 'staff', label: 'Nhân viên', icon: '👔' }] : []),
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <h1>Admin</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {modules.map(module => (
            <li key={module.id}>
              <button
                className={`nav-item ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(module.id)}
              >
                <span className="icon">{module.icon}</span>
                <span className="label">{module.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
