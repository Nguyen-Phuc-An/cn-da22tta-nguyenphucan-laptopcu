import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue_today: 0,
    revenue_week: 0,
    revenue_month: 0,
    new_orders: 0,
    products_selling: 0,
    out_of_stock: 0,
    new_customers: 0,
    unread_messages: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetch('/admin/stats');
        setStats(data || {});
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Doanh thu hôm nay</div>
          <div className="stat-value">{(stats.revenue_today || 0).toLocaleString('vi-VN')}</div>
          <div className="stat-change">VND</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Doanh thu tuần</div>
          <div className="stat-value">{(stats.revenue_week || 0).toLocaleString('vi-VN')}</div>
          <div className="stat-change">VND</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Doanh thu tháng</div>
          <div className="stat-value">{(stats.revenue_month || 0).toLocaleString('vi-VN')}</div>
          <div className="stat-change">VND</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Đơn hàng mới</div>
          <div className="stat-value">{stats.new_orders || 0}</div>
          <div className="stat-change">đơn</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Sản phẩm đang bán</div>
          <div className="stat-value">{stats.products_selling || 0}</div>
          <div className="stat-change">{stats.out_of_stock || 0} hết hàng</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Khách mới trong tuần</div>
          <div className="stat-value">{stats.new_customers || 0}</div>
          <div className="stat-change">tài khoản</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tin nhắn chưa đọc</div>
          <div className="stat-value">{stats.unread_messages || 0}</div>
          <div className="stat-change">tin nhắn</div>
        </div>
      </div>

      <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
        📈 Biểu đồ doanh thu (sẽ triển khai)
      </div>
    </div>
  );
}