import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('day');
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

  // Get chart data based on period
  const getChartData = () => {
    if (chartPeriod === 'day') {
      return {
        labels: stats.revenue7days?.map(r => new Date(r.date).toLocaleDateString('vi-VN')) || [],
        data: stats.revenue7days?.map(r => r.total || 0) || []
      };
    } else if (chartPeriod === 'month') {
      return {
        labels: stats.revenue12months?.map(r => {
          const [year, month] = r.month.split('-');
          return `Tháng ${month}/${year}`;
        }) || [],
        data: stats.revenue12months?.map(r => r.total || 0) || []
      };
    }
    return { labels: [], data: [] };
  };

  const chartData = getChartData();

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
            <div className="stat-label">Đơn hàng mới</div>
            <div className="stat-value">{stats.orders?.pendingOrders || 0}</div>
            <div className="stat-change">đơn chờ xử lý</div>
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
          <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#333' }}>Biểu đồ doanh thu</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setChartPeriod('day')}
              style={{
                padding: '8px 16px',
                border: chartPeriod === 'day' ? 'none' : '1px solid #d1d5db',
                borderRadius: '6px',
                background: chartPeriod === 'day' ? '#667eea' : 'white',
                color: chartPeriod === 'day' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              7 ngày
            </button>
            <button
              onClick={() => setChartPeriod('month')}
              style={{
                padding: '8px 16px',
                border: chartPeriod === 'month' ? 'none' : '1px solid #d1d5db',
                borderRadius: '6px',
                background: chartPeriod === 'month' ? '#667eea' : 'white',
                color: chartPeriod === 'month' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              12 tháng
            </button>
          </div>
        </div>

        {/* Line Chart SVG */}
        {chartData.data.length > 0 ? (
          <svg
            viewBox="0 0 1000 400"
            style={{
              width: '100%',
              height: 'auto',
              backgroundColor: '#fafafa',
              borderRadius: '8px'
            }}
          >
            {/* Grid lines and labels */}
            {(() => {
              const padding = 60;
              const chartWidth = 1000 - padding * 2;
              const chartHeight = 400 - padding * 2;
              const maxValue = Math.max(...chartData.data, 1);

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
                      {(value / 1000000).toFixed(0)}M
                    </text>
                  </g>
                );
              }

              // Calculate points for line chart
              const points = chartData.data.map((value, idx) => {
                const x = padding + (chartWidth * idx) / (chartData.data.length - 1 || 1);
                const y = padding + chartHeight - (chartHeight * value) / maxValue;
                return { x, y, value, idx };
              });

              // Create path for line
              let pathD = `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;
              for (let i = 1; i < points.length; i++) {
                pathD += ` L ${points[i].x} ${points[i].y}`;
              }

              // Create area under line (gradient effect)
              let areaD = `M ${points[0]?.x || 0} ${points[0]?.y || 0}`;
              for (let i = 1; i < points.length; i++) {
                areaD += ` L ${points[i].x} ${points[i].y}`;
              }
              areaD += ` L ${points[points.length - 1]?.x || 0} ${padding + chartHeight} L ${points[0]?.x || 0} ${padding + chartHeight} Z`;

              return (
                <g>
                  {lines}
                  {/* Area under line */}
                  <path
                    d={areaD}
                    fill="#667eea"
                    opacity="0.1"
                  />
                  {/* Line */}
                  <path
                    d={pathD}
                    stroke="#667eea"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Points */}
                  {points.map((point, idx) => (
                    <g key={`point-${idx}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="#667eea"
                      />
                      {/* X-axis labels */}
                      <text
                        x={point.x}
                        y={padding + chartHeight + 25}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                      >
                        {chartData.labels[idx]}
                      </text>
                    </g>
                  ))}
                  {/* Y-axis label */}
                  <text
                    x="20"
                    y="30"
                    fontSize="12"
                    fill="#999"
                  >
                    VND
                  </text>
                  {/* X-axis label */}
                  <text
                    x={1000 - 60}
                    y={padding + chartHeight + 50}
                    fontSize="12"
                    fill="#999"
                  >
                    {chartPeriod === 'day' ? 'Ngày' : 'Tháng'}
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
            color: '#999'
          }}>
            Chưa có dữ liệu
          </div>
        )}

        {/* Chart Legend */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '13px', color: '#666' }}>
          <strong>Giải thích:</strong> Biểu đồ hiển thị tổng doanh thu từ các đơn hàng đã hoàn thành ({chartPeriod === 'day' ? '7 ngày gần nhất' : '12 tháng gần nhất'})
        </div>
      </div>
    </div>
  );
}