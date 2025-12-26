import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/orders');
      const data = Array.isArray(res) ? res : res?.data || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError('Lỗi tải đơn hàng: ' + err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.trang_thai === orderStatus));
    }
  }, [orderStatus, orders]);

  const statuses = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'canceled', label: 'Đã hủy' }
  ];

  const getStatusLabel = (status) => {
    const s = statuses.find(st => st.id === status);
    return s ? s.label : status || '-';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'shipping': return '#007bff';
      case 'completed': return '#28a745';
      case 'canceled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Status progression flow: pending -> confirmed -> shipping -> completed
  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'shipping';
      case 'shipping':
        return 'completed';
      case 'completed':
        return 'completed'; // Cannot progress further
      case 'canceled':
        return 'canceled'; // Cannot change if cancelled
      default:
        return 'pending';
    }
  };

  const canProgressStatus = (currentStatus) => {
    return currentStatus !== 'completed' && currentStatus !== 'canceled';
  };

  const handleProgressStatus = async () => {
    const nextStatus = getNextStatus(selectedOrder.trang_thai);
    if (nextStatus !== selectedOrder.trang_thai) {
      await handleUpdateOrderStatus(nextStatus);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
      await handleUpdateOrderStatus('canceled');
    }
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    try {
      setLoading(true);
      await apiFetch(`/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        body: { trang_thai: newStatus }
      });
      
      // Update local state
      const updatedOrders = orders.map(o => 
        o.id === selectedOrder.id ? { ...o, trang_thai: newStatus } : o
      );
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, trang_thai: newStatus });
      
      setError('');
    } catch (err) {
      setError('Lỗi cập nhật trạng thái: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <button className="btn btn-primary" onClick={loadOrders} disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{marginBottom: '20px'}}>{error}</div>}

      <div className="tabs">
        {statuses.map(s => (
          <button
            key={s.id}
            className={`tab ${orderStatus === s.id ? 'active' : ''}`}
            onClick={() => setOrderStatus(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>P.T. thanh toán</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999' }}>Không có đơn nào</td></tr>
          ) : (
            filteredOrders.map(o => (
              <tr key={o.id} onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer' }}>
                <td>#{o.id}</td>
                <td>{o.ten_nguoi_nhan || '-'}</td>
                <td>{o.dien_thoai_nhan || '-'}</td>
                <td>{o.tao_luc ? new Date(o.tao_luc).toLocaleDateString('vi-VN') : '-'}</td>
                <td>{(o.tong_tien || 0).toLocaleString('vi-VN')}₫</td>
                <td>
                  <span style={{fontSize: '12px', color: '#666'}}>
                    {o.phuong_thuc_thanh_toan === 'cod' ? 'COD' : 'Chuyển khoản'}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: getStatusColor(o.trang_thai),
                    color: 'white',
                    display: 'inline-block'
                  }}>
                    {getStatusLabel(o.trang_thai)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            <div className="modal-body">
            
            <div className="customer-info-section">
              <div style={{marginBottom: '16px'}}>
                <h4 style={{margin: '0', fontSize: '16px', fontWeight: '700', color: '#111827'}}>Thông tin giao hàng</h4>
              </div>
              <div className="info-field">
                <span className="info-label">Tên nhận:</span>
                <span className="info-value">{selectedOrder.ten_nguoi_nhan || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">SĐT:</span>
                <span className="info-value">{selectedOrder.dien_thoai_nhan || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Ngày đặt:</span>
                <span className="info-value">{selectedOrder.tao_luc ? new Date(selectedOrder.tao_luc).toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">P.T. thanh toán:</span>
                <span className="info-value">{selectedOrder.phuong_thuc_thanh_toan === 'cod' ? 'COD (Thanh toán khi nhận)' : 'Chuyển khoản ngân hàng'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{selectedOrder.dia_chi_nhan || '-'}</span>
              </div>
              <div className="info-field" style={{borderBottom: 'none'}}>
                <span className="info-label">Ghi chú:</span>
                <span className="info-value">{selectedOrder.ghi_chu || '-'}</span>
              </div>
            </div>

            <div className="orders-section">
              <h4>Danh sách sản phẩm</h4>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th style={{textAlign: 'center'}}>Số lượng</th>
                      <th style={{textAlign: 'right'}}>Đơn giá</th>
                      <th style={{textAlign: 'right'}}>Tổng cộng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, i) => {
                      const quantity = item.so_luong || item.quantity || 0;
                      const unitPrice = item.don_gia || item.gia || item.gia_ban || item.price || item.don_gia || 0;
                      // Use thanh_tien from order_items if available, otherwise calculate
                      const itemTotal = item.thanh_tien || (quantity * unitPrice);
                      return (
                        <tr key={i}>
                          <td>{item.ten || item.tieu_de || item.ten_san_pham || item.product_name || '-'}</td>
                          <td style={{textAlign: 'center'}}>{quantity}</td>
                          <td style={{textAlign: 'right'}}>{Number(unitPrice).toLocaleString('vi-VN')}₫</td>
                          <td style={{textAlign: 'right', fontWeight: '600', color: '#d32f2f'}}>
                            {Number(itemTotal).toLocaleString('vi-VN')}₫
                          </td>
                        </tr>
                      );
                    })}
                    {(selectedOrder.giam_gia_edu || 0) > 0 && (
                      <tr style={{borderTop: '2px solid #e5e7eb', background: '#fffbeb'}}>
                        <td colSpan="3" style={{textAlign: 'right', paddingRight: '12px', fontWeight: '600', color: '#92400e'}}>Giảm giá EDU:</td>
                        <td style={{textAlign: 'right', color: '#10b981', fontSize: '14px', paddingRight: '12px', fontWeight: '600'}}>
                          -{Number(selectedOrder.giam_gia_edu || 0).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    )}
                    <tr style={{borderTop: '2px solid #667eea', fontWeight: '600', background: '#f9fafb'}}>
                      <td colSpan="3" style={{textAlign: 'right', paddingRight: '12px'}}>Tổng thanh toán:</td>
                      <td style={{textAlign: 'right', color: '#667eea', fontSize: '16px', paddingRight: '12px'}}>
                        {(selectedOrder.tong_tien || 0).toLocaleString('vi-VN')}₫
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">Không có sản phẩm</div>
              )}
            </div>

            <div className="orders-section">
              <h4>Cập nhật trạng thái</h4>
              <div style={{marginBottom: '15px'}}>
                <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '10px'}}>
                  Trạng thái hiện tại: <strong style={{color: getStatusColor(selectedOrder.trang_thai)}}>{getStatusLabel(selectedOrder.trang_thai)}</strong>
                </p>
              </div>
              <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                <button
                  onClick={handleProgressStatus}
                  disabled={loading || !canProgressStatus(selectedOrder.trang_thai)}
                  style={{
                    padding: '10px 20px',
                    background: canProgressStatus(selectedOrder.trang_thai) ? '#10b981' : '#d1d5db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: canProgressStatus(selectedOrder.trang_thai) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (canProgressStatus(selectedOrder.trang_thai) && !loading) {
                      e.target.style.background = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = canProgressStatus(selectedOrder.trang_thai) ? '#10b981' : '#d1d5db';
                  }}
                >
                  {selectedOrder.trang_thai === 'completed' ? '✓ Hoàn thành' : '→ ' + getStatusLabel(getNextStatus(selectedOrder.trang_thai))}
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={loading || selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed'}
                  style={{
                    padding: '10px 20px',
                    background: (selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed') ? '#d1d5db' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed') ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOrder.trang_thai !== 'canceled' && selectedOrder.trang_thai !== 'completed' && !loading) {
                      e.target.style.background = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = (selectedOrder.trang_thai === 'canceled' || selectedOrder.trang_thai === 'completed') ? '#d1d5db' : '#ef4444';
                  }}
                >
                  {selectedOrder.trang_thai === 'canceled' ? '✗ Đã hủy' : selectedOrder.trang_thai === 'completed' ? '✓ Hoàn thành (không hủy)' : '✕ Hủy đơn'}
                </button>
              </div>
            </div>

            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
