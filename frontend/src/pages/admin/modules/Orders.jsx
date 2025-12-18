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

  const handleUpdateNotes = async (notes) => {
    try {
      setLoading(true);
      await apiFetch(`/orders/${selectedOrder.id}`, {
        method: 'PUT',
        body: { ghi_chu: notes }
      });
      
      const updatedOrders = orders.map(o => 
        o.id === selectedOrder.id ? { ...o, ghi_chu: notes } : o
      );
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, ghi_chu: notes });
      
      setError('');
    } catch (err) {
      setError('Lỗi cập nhật ghi chú: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <button className="btn" onClick={loadOrders} disabled={loading}>
          Tải lại
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
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center', color: '#999' }}>Không có đơn nào</td></tr>
          ) : (
            filteredOrders.map(o => (
              <tr key={o.id}>
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
                <td>
                  <button 
                    className="btn" 
                    onClick={() => setSelectedOrder(o)}
                    style={{ padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxHeight: '85vh', overflowY: 'auto'}}>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
            
            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h4>Thông tin giao hàng</h4>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div>
                  <p><strong>Tên nhận:</strong> {selectedOrder.ten_nguoi_nhan || '-'}</p>
                  <p><strong>SĐT:</strong> {selectedOrder.dien_thoai_nhan || '-'}</p>
                </div>
                <div>
                  <p><strong>Ngày đặt:</strong> {selectedOrder.tao_luc ? new Date(selectedOrder.tao_luc).toLocaleDateString('vi-VN') : '-'}</p>
                  <p><strong>P.T. thanh toán:</strong> {selectedOrder.phuong_thuc_thanh_toan === 'cod' ? 'COD (Thanh toán khi nhận)' : 'Chuyển khoản ngân hàng'}</p>
                </div>
              </div>
              <p><strong>Địa chỉ:</strong> {selectedOrder.dia_chi_nhan || '-'}</p>
            </div>

            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h4>Danh sách sản phẩm</h4>
              <table className="data-table" style={{ marginTop: '10px', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Tổng cộng</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.ten || item.tieu_de || item.product_name || '-'}</td>
                        <td style={{textAlign: 'center'}}>{item.so_luong || item.quantity || 0}</td>
                        <td style={{textAlign: 'right'}}>{(item.gia || item.price || 0).toLocaleString('vi-VN')}₫</td>
                        <td style={{textAlign: 'right', fontWeight: '600', color: '#d32f2f'}}>
                          {(((item.so_luong || item.quantity || 1) * (item.gia || item.price || 0))).toLocaleString('vi-VN')}₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{textAlign: 'center', color: '#999'}}>Không có sản phẩm</td></tr>
                  )}
                  <tr style={{borderTop: '2px solid #007bff', fontWeight: '600'}}>
                    <td colSpan="3" style={{textAlign: 'right'}}>Tổng thanh toán:</td>
                    <td style={{textAlign: 'right', color: '#d32f2f', fontSize: '16px'}}>
                      {(selectedOrder.tong_tien || 0).toLocaleString('vi-VN')}₫
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h4>Cập nhật trạng thái</h4>
              <select 
                value={selectedOrder.trang_thai || 'pending'}
                onChange={(e) => handleUpdateOrderStatus(e.target.value)}
                disabled={loading}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', width: '100%', maxWidth: '300px', cursor: 'pointer' }}
              >
                {statuses.filter(s => s.id !== 'all').map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>
                Trạng thái hiện tại: <strong style={{color: getStatusColor(selectedOrder.trang_thai)}}>{getStatusLabel(selectedOrder.trang_thai)}</strong>
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingBottom: '15px' }}>
              <h4>Ghi chú (nội bộ)</h4>
              <textarea 
                defaultValue={selectedOrder.ghi_chu || ''} 
                placeholder="Ghi chú cho đơn hàng này..."
                rows="3"
                onBlur={(e) => {
                  if (e.target.value !== (selectedOrder.ghi_chu || '')) {
                    handleUpdateNotes(e.target.value);
                  }
                }}
                disabled={loading}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
