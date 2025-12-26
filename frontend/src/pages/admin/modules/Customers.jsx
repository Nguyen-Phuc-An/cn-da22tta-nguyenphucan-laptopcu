import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await apiFetch('/users');
        const data = Array.isArray(res) ? res : res?.data || [];
        setCustomers(data.filter(u => !u.role || u.role === 'customer'));
      } catch (err) {
        console.error('Error loading customers:', err);
      }
    };
    loadCustomers();
  }, []);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders([]);
    try {
      const res = await apiFetch(`/users/${customer.id}/orders`);
      console.log('Orders response:', res);
      let orders = [];
      if (Array.isArray(res)) {
        orders = res;
      } else if (res?.data && Array.isArray(res.data)) {
        orders = res.data;
      } else if (res && typeof res === 'object' && !Array.isArray(res)) {
        // Single order response
        orders = res?.message ? [] : [res];
      }
      setCustomerOrders(orders);
    } catch (err) {
      console.error('Error loading customer orders:', err);
      setCustomerOrders([]);
    }
  };

  return (
    <div className="admin-panel">
      <table className="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Địa chỉ</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>Không có khách hàng nào</td></tr>
          ) : (
            customers.map(c => (
              <tr key={c.id} onClick={() => handleSelectCustomer(c)} style={{ cursor: 'pointer' }}>
                <td>{c.email || '-'}</td>
                <td>{c.name || '-'}</td>
                <td>{c.phone || '-'}</td>
                <td>{c.address || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thông tin khách hàng</h3>
              <button className="close-btn" onClick={() => setSelectedCustomer(null)}>✕</button>
            </div>
            
            <div className="modal-body">
            
            <div className="customer-info-section">
              <div className="info-field">
                <span className="info-label">Email:</span>
                <span className="info-value">{selectedCustomer.email || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Tên:</span>
                <span className="info-value">{selectedCustomer.name || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">SĐT:</span>
                <span className="info-value">{selectedCustomer.phone || '-'}</span>
              </div>
              <div className="info-field">
                <span className="info-label">Địa chỉ:</span>
                <span className="info-value">{selectedCustomer.address || '-'}</span>
              </div>
            </div>

            <div className="orders-section">
              <h4>Lịch sử đơn hàng</h4>
              {customerOrders.length === 0 ? (
                <div className="empty-state">Chưa có đơn hàng</div>
              ) : (
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map(o => {
                      let statusClass = 'status-pending';
                      let statusText = 'Chờ xác nhận';
                      
                      // Map Vietnamese status names
                      if (o.trang_thai === 'completed') {
                        statusClass = 'status-completed';
                        statusText = 'Hoàn thành';
                      } else if (o.trang_thai === 'shipping') {
                        statusClass = 'status-shipping';
                        statusText = 'Đang giao';
                      } else if (o.trang_thai === 'canceled') {
                        statusClass = 'status-cancelled';
                        statusText = 'Hủy';
                      } else if (o.trang_thai === 'confirmed') {
                        statusClass = 'status-confirmed';
                        statusText = 'Đã xác nhận';
                      } else if (o.trang_thai === 'pending') {
                        statusClass = 'status-pending';
                        statusText = 'Chờ xác nhận';
                      }
                      
                      return (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>{o.tao_luc ? new Date(o.tao_luc).toLocaleDateString('vi-VN') : '-'}</td>
                          <td>{(o.tong_tien || 0).toLocaleString('vi-VN')} {o.tien_te || 'VND'}</td>
                          <td>
                            <span className={`order-status-badge ${statusClass}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setSelectedCustomer(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
