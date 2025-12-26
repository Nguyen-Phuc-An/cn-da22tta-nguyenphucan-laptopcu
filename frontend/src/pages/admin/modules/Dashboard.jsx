import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/admin/stats');
        console.log('Stats data:', data);
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel">
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-panel">
        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          Không thể tải dữ liệu
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats Cards */}
      <div className="admin-panel">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Doanh thu hôm nay</div>
            <div className="stat-value">{(stats.orders?.revenueToday || 0).toLocaleString('vi-VN')}</div>
            <div className="stat-change">VND</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Doanh thu tháng</div>
            <div className="stat-value">{(stats.orders?.revenueMonth || 0).toLocaleString('vi-VN')}</div>
            <div className="stat-change">VND</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Đơn hàng đã bán trong ngày</div>
            <div className="stat-value">{stats.orders?.successfulOrdersToday || 0}</div>
            <div className="stat-change">đơn hàng</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Sản phẩm đang bán</div>
            <div className="stat-value">{stats.products?.sellingCount || 0}</div>
            <div className="stat-change">{stats.products?.outOfStock || 0} hết hàng</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Khách mới trong tuần</div>
            <div className="stat-value">{stats.users?.newUsersWeek || 0}</div>
            <div className="stat-change">tài khoản</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="admin-panel">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>Tỷ lệ lượt mua theo hãng</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>Hiển thị phân bố lượt mua của các hãng laptop</p>
          </div>
        </div>

        {/* Bar Chart */}
        {stats?.brandStats && stats.brandStats.length > 0 ? (
          <svg
            viewBox="0 0 1000 400"
            style={{
              width: '100%',
              height: 'auto',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}
          >
            {(() => {
              const padding = 60;
              const chartWidth = 1000 - padding * 2;
              const chartHeight = 400 - padding * 2;
              const total = stats.brandStats.reduce((sum, item) => sum + item.count, 0);
              const maxValue = Math.max(...stats.brandStats.map(b => b.count), 1);

              // Render grid lines
              const lines = [];
              for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight * i) / 5;
                const value = maxValue - (maxValue * i) / 5;
                lines.push(
                  <g key={`grid-${i}`}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={1000 - padding}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 10}
                      y={y + 5}
                      textAnchor="end"
                      fontSize="12"
                      fill="#999"
                    >
                      {value}
                    </text>
                  </g>
                );
              }

              // Calculate bar positions
              const barWidth = chartWidth / (stats.brandStats.length * 1.5);
              const spacing = (chartWidth - barWidth * stats.brandStats.length) / (stats.brandStats.length - 1 || 1);
              const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#330867'];
              
              const bars = stats.brandStats.map((brand, idx) => {
                const x = padding + (barWidth + spacing) * idx;
                const barHeight = (chartHeight * brand.count) / maxValue;
                const y = padding + chartHeight - barHeight;
                const percentage = ((brand.count / total) * 100).toFixed(1);
                
                return (
                  <g key={`bar-${idx}`}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={colors[idx % colors.length]}
                      rx="4"
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={(e) => {
                        e.target.style.filter = 'brightness(0.9)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.filter = 'brightness(1)';
                      }}
                    />
                    {/* X-axis labels */}
                    <text
                      x={x + barWidth / 2}
                      y={padding + chartHeight + 25}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#666"
                    >
                      {brand.brand}
                    </text>
                    {/* Value on top of bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#667eea"
                      fontWeight="600"
                    >
                      {percentage}%
                    </text>
                  </g>
                );
              });

              return (
                <g>
                  {lines}
                  {bars}
                  {/* Y-axis label */}
                  <text
                    x="20"
                    y="30"
                    fontSize="12"
                    fill="#999"
                    fontWeight="600"
                  >
                    Lượt mua
                  </text>
                  {/* X-axis label */}
                  <text
                    x={1000 - 80}
                    y={padding + chartHeight + 50}
                    fontSize="12"
                    fill="#999"
                    fontWeight="600"
                  >
                    Hãng
                  </text>
                </g>
              );
            })()}
          </svg>
        ) : (
          <div style={{
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            color: '#999',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <p style={{ fontSize: '14px', margin: '0' }}>Chưa có dữ liệu lượt mua</p>
            <p style={{ fontSize: '12px', margin: '0', color: '#bbb' }}>
              Dữ liệu sẽ hiển thị khi có lượt mua sản phẩm
            </p>
          </div>
        )}

        {/* Chart Legend */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '13px', color: '#666', borderLeft: '4px solid #667eea' }}>
          <strong style={{ color: '#111827' }}>Giải thích:</strong> Biểu đồ cột thể hiện số lượt mua và tỷ lệ phần trăm của từng hãng laptop so với tổng số lượt mua trên hệ thống. Trục X là tên hãng, trục Y là số lượt mua.
        </div>
      </div>
    </div>
  );
}