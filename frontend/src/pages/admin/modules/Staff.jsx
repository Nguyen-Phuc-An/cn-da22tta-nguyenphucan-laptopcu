import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Staff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await apiFetch('/users?role=staff');
        const data = Array.isArray(res) ? res : res?.data || [];
        setStaff(data);
      } catch (err) {
        console.error('Error loading staff:', err);
      }
    };
    loadStaff();
  }, []);

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Quản lý Nhân viên</h2>
        <button className="btn btn-primary" onClick={() => alert('Thêm nhân viên mới (sẽ triển khai)')}>
          ➕ Thêm
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {staff.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>Không có nhân viên nào</td></tr>
          ) : (
            staff.map(s => (
              <tr key={s.id}>
                <td>{s.email || '-'}</td>
                <td>{s.name || '-'}</td>
                <td>{s.phone || '-'}</td>
                <td>{s.address || '-'}</td>
                <td>
                  <button style={{ padding: '5px 10px', cursor: 'pointer' }} onClick={() => alert('Sửa (sẽ triển khai)')}>Sửa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
