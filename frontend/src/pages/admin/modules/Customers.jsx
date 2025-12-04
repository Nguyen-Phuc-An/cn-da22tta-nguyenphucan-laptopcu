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
    try {
      const res = await apiFetch(`/orders?user_id=${customer.id}`);
      const orders = Array.isArray(res) ? res : res?.data || [];
      setCustomerOrders(orders);
    } catch (err) {
      console.error('Error loading customer orders:', err);
      setCustomerOrders([]);
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Quản lý khách hàng</h2>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Địa chỉ</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>Không có khách hàng nào</td></tr>
          ) : (
            customers.map(c => (
              <tr key={c.id}>
                <td>{c.email || '-'}</td>
                <td>{c.name || '-'}</td>
                <td>{c.phone || '-'}</td>
                <td>{c.address || '-'}</td>
                <td>
                  <button 
                    className="btn-sm" 
                    onClick={() => handleSelectCustomer(c)}
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

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCustomer(null)}>✕</button>
            <h3>Thông tin khách hàng</h3>
            
            <div style={{ marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <p><strong>Email:</strong> {selectedCustomer.email || '-'}</p>
              <p><strong>Tên:</strong> {selectedCustomer.name || '-'}</p>
              <p><strong>SĐT:</strong> {selectedCustomer.phone || '-'}</p>
              <p><strong>Địa chỉ:</strong> {selectedCustomer.address || '-'}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4>Lịch sử đơn hàng</h4>
              <table className="data-table" style={{ marginTop: '10px', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>Chưa có đơn hàng</td></tr>
                  ) : (
                    customerOrders.map(o => (
                      <tr key={o.id}>
                        <td>{o.code || o.id}</td>
                        <td>{o.created_at ? new Date(o.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                        <td>{(o.total || 0).toLocaleString()} VND</td>
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: o.status === 'completed' ? '#dcfce7' : o.status === 'pending' ? '#fef3c7' : '#fee2e2',
                            color: o.status === 'completed' ? '#166534' : o.status === 'pending' ? '#92400e' : '#991b1b'
                          }}>
                            {o.status === 'completed' ? 'Hoàn thành' : o.status === 'pending' ? 'Chờ xác nhận' : o.status === 'shipping' ? 'Đang giao' : 'Hủy'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setSelectedCustomer(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
