import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await apiFetch('/orders');
        const data = Array.isArray(res) ? res : res?.data || [];
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error('Error loading orders:', err);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (orderStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === orderStatus || o.trang_thai === orderStatus));
    }
  }, [orderStatus, orders]);

  const statuses = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'canceled', label: 'Đã hủy' }
  ];

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Quản lý đơn hàng</h2>
      </div>

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
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái TT</th>
            <th>Nhân viên</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center', color: '#999' }}>Không có đơn nào</td></tr>
          ) : (
            filteredOrders.map(o => (
              <tr key={o.id}>
                <td>{o.code || o.id}</td>
                <td>{o.customer_name || '-'}</td>
                <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                <td>{(o.total || 0).toLocaleString()} VND</td>
                <td>{o.payment_method || '-'}</td>
                <td>{o.payment_status || '-'}</td>
                <td>{o.staff_name || '-'}</td>
                <td>
                  <button 
                    className="btn-sm" 
                    onClick={() => setSelectedOrder(o)}
                    style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            <h3>Chi tiết đơn hàng {selectedOrder.code || selectedOrder.id}</h3>
            
            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h4>Thông tin người nhận</h4>
              <p><strong>Tên:</strong> {selectedOrder.customer_name || '-'}</p>
              <p><strong>Email:</strong> {selectedOrder.email || '-'}</p>
              <p><strong>SĐT:</strong> {selectedOrder.phone || '-'}</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.address || '-'}</p>
            </div>

            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h4>Danh sách sản phẩm</h4>
              <table className="data-table" style={{ marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, i) => (
                    <tr key={i}>
                      <td>{item.product_name || '-'}</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price || 0).toLocaleString()} VND</td>
                      <td>{((item.quantity || 1) * (item.price || 0)).toLocaleString()} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <h4>Trạng thái</h4>
              <select 
                defaultValue={selectedOrder.status || 'pending'} 
                onChange={() => alert('Cập nhật trạng thái (sẽ triển khai)')}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', width: '100%', maxWidth: '300px' }}
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="canceled">Hủy</option>
              </select>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Ghi chú</h4>
              <textarea 
                defaultValue={selectedOrder.notes || ''} 
                placeholder="Ghi chú của nhân viên"
                rows="3"
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => alert('Xuất PDF (sẽ triển khai)')}>
                📄 Xuất hóa đơn PDF
              </button>
              <button className="btn" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
