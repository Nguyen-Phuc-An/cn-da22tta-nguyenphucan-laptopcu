import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [revenueChartType, setRevenueChartType] = useState('week'); // 'week' hoặc 'month'

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/admin/stats?period=${period}`);
        console.log('Stats data:', data);
        setStats(data);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [period]);

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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setPeriod('week')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: period === 'week' ? '2px solid #667eea' : '1px solid #ddd',
                backgroundColor: period === 'week' ? '#667eea' : '#fff',
                color: period === 'week' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: period === 'week' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              Tuần
            </button>
            <button
              onClick={() => setPeriod('month')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: period === 'month' ? '2px solid #667eea' : '1px solid #ddd',
                backgroundColor: period === 'month' ? '#667eea' : '#fff',
                color: period === 'month' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: period === 'month' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              Tháng
            </button>
            <button
              onClick={() => setPeriod('year')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: period === 'year' ? '2px solid #667eea' : '1px solid #ddd',
                backgroundColor: period === 'year' ? '#667eea' : '#fff',
                color: period === 'year' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: period === 'year' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              Năm
            </button>
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

      {/* Revenue Trend Chart */}
      <div className="admin-panel">
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#111827' }}>Xu hướng doanh thu</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#6b7280' }}>Theo dõi sự thay đổi doanh thu qua thời gian</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setRevenueChartType('week')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: revenueChartType === 'week' ? '2px solid #667eea' : '1px solid #ddd',
                backgroundColor: revenueChartType === 'week' ? '#667eea' : '#fff',
                color: revenueChartType === 'week' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: revenueChartType === 'week' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              7 Ngày
            </button>
            <button
              onClick={() => setRevenueChartType('month')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: revenueChartType === 'month' ? '2px solid #667eea' : '1px solid #ddd',
                backgroundColor: revenueChartType === 'month' ? '#667eea' : '#fff',
                color: revenueChartType === 'month' ? '#fff' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: revenueChartType === 'month' ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              12 Tháng
            </button>
          </div>
        </div>

        {/* Line Chart */}
        {stats && (revenueChartType === 'week' ? stats.revenue7days : stats.revenue12months) && (revenueChartType === 'week' ? stats.revenue7days : stats.revenue12months).length > 0 ? (
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
              const data = revenueChartType === 'week' ? stats.revenue7days : stats.revenue12months;
              const maxRevenue = Math.max(...data.map(d => d.total), 1);
              const dataPoints = data.length;

              // Render grid lines and labels
              const lines = [];
              const gridCount = 5;
              for (let i = 0; i <= gridCount; i++) {
                const y = padding + (chartHeight * i) / gridCount;
                const value = maxRevenue - (maxRevenue * i) / gridCount;
                lines.push(
                  <g key={`grid-${i}`}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={1000 - padding}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray={i === 0 ? '0' : '4'}
                    />
                    <text
                      x={padding - 10}
                      y={y + 5}
                      textAnchor="end"
                      fontSize="12"
                      fill="#999"
                    >
                      {(value / 1000000).toFixed(1)}M
                    </text>
                  </g>
                );
              }

              // Calculate points on the line
              const points = data.map((item, idx) => {
                const x = padding + (chartWidth / (dataPoints - 1 || 1)) * idx;
                const y = padding + chartHeight - (chartHeight * item.total) / maxRevenue;
                return { x, y, ...item };
              });

              // Build SVG path for the line
              let pathD = `M ${points[0].x} ${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                pathD += ` L ${points[i].x} ${points[i].y}`;
              }

              // Build area under the line
              let areaD = `M ${points[0].x} ${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                areaD += ` L ${points[i].x} ${points[i].y}`;
              }
              areaD += ` L ${points[points.length - 1].x} ${padding + chartHeight}`;
              areaD += ` L ${points[0].x} ${padding + chartHeight} Z`;

              // Format currency for display
              const formatCurrency = (value) => {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'K';
                }
                return value.toString();
              };

              // Render data points with tooltips
              const circles = points.map((point, idx) => (
                <g key={`point-${idx}`}>
                  {/* Area gradient background */}
                  {idx === 0 && (
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#667eea" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                  )}
                  {/* Revenue value above point */}
                  <text
                    x={point.x}
                    y={point.y - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#667eea"
                    fontWeight="600"
                  >
                    {formatCurrency(point.total)}
                  </text>
                  {/* Point circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="#667eea"
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                  />
                  {/* X-axis label */}
                  <text
                    x={point.x}
                    y={padding + chartHeight + 25}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#666"
                  >
                    {revenueChartType === 'week' ? point.date.split('-')[2] : point.month.split('-')[1]}
                  </text>
                  {/* Tooltip on hover - using title element */}
                  <title>
                    {revenueChartType === 'week' ? `Ngày ${point.date}` : `Tháng ${point.month}`}: {point.total.toLocaleString('vi-VN')} VND ({point.orders} đơn)
                  </title>
                </g>
              ));

              return (
                <g>
                  {/* Area under line */}
                  <path
                    d={areaD}
                    fill="url(#areaGradient)"
                  />
                  {/* Grid lines */}
                  {lines}
                  {/* Main line */}
                  <path
                    d={pathD}
                    stroke="#667eea"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {circles}
                  {/* Y-axis label */}
                  <text
                    x="20"
                    y="30"
                    fontSize="12"
                    fill="#999"
                    fontWeight="600"
                  >
                    Doanh thu (VND)
                  </text>
                  {/* X-axis label */}
                  <text
                    x={1000 - 80}
                    y={padding + chartHeight + 50}
                    fontSize="12"
                    fill="#999"
                    fontWeight="600"
                  >
                    {revenueChartType === 'week' ? 'Ngày' : 'Tháng'}
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
            <p style={{ fontSize: '14px', margin: '0' }}>Chưa có dữ liệu doanh thu</p>
            <p style={{ fontSize: '12px', margin: '0', color: '#bbb' }}>
              Dữ liệu sẽ hiển thị khi có đơn hàng hoàn thành
            </p>
          </div>
        )}

        {/* Chart Legend */}
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '13px', color: '#666', borderLeft: '4px solid #667eea' }}>
          <strong style={{ color: '#111827' }}>Giải thích:</strong> Biểu đồ đường thể hiện xu hướng doanh thu qua thời gian. Mỗi điểm trên đường biểu thị doanh thu của một ngày (7 ngày gần nhất) hoặc một tháng (12 tháng gần nhất). Hover chuột vào các điểm để xem chi tiết.
        </div>
      </div>
    </div>
  );
}