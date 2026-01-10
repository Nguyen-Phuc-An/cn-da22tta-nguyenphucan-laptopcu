import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../../../services/apiClient';
import { ToastContext } from '../../../context/Toast';

export default function Staff() {
  const { addToast } = useContext(ToastContext);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
    address: ''
  });

  // Load staff list
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const res = await apiFetch('/users');
        const data = Array.isArray(res) ? res : res?.data || [];
        const staffOnly = data.filter(u => u.role === 'staff');
        setStaff(staffOnly);
      } catch (err) {
        console.error('Error loading staff:', err);
        addToast('Lỗi tải danh sách nhân viên', 'error');
      }
    };
    loadStaff();
  }, [addToast]);
  // Reset form data
  const resetForm = () => {
    setFormData({ email: '', name: '', password: '', phone: '', address: '' });
    setEditingStaff(null);
  };
  // Mở modal thêm nhân viên
  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };
  // Mở modal chỉnh sửa nhân viên
  const openEditModal = (s) => {
    setEditingStaff(s);
    setFormData({
      email: s.email || '',
      name: s.name || '',
      password: '',
      phone: s.phone || '',
      address: s.address || ''
    });
    setShowModal(true);
  };
  // Xử lý thay đổi input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Lưu nhân viên (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    if (!formData.email.trim() || !formData.name.trim()) {
      addToast('Vui lòng nhập Email và Tên', 'error');
      return;
    }

    if (editingStaff) {
      // Update existing staff
      try {
        const updateData = {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        await apiFetch(`/users/${editingStaff.id}`, {
          method: 'PUT',
          body: updateData
        });

        setStaff(staff.map(s => 
          s.id === editingStaff.id 
            ? { ...s, ...formData }
            : s
        ));
        addToast('Cập nhật nhân viên thành công', 'success');
        setShowModal(false);
        resetForm();
      } catch (err) {
        console.error('Error updating staff:', err);
        addToast('Lỗi cập nhật nhân viên: ' + err.message, 'error');
      }
    } else {
      // Create new staff
      if (!formData.password.trim()) {
        addToast('Vui lòng nhập mật khẩu cho nhân viên mới', 'error');
        return;
      }

      try {
        const res = await apiFetch('/users', {
          method: 'POST',
          body: {
            email: formData.email,
            name: formData.name,
            password: formData.password,
            phone: formData.phone,
            address: formData.address,
            role: 'staff'
          }
        });

        if (res?.id) {
          const newStaff = {
            id: res.id,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            role: 'staff'
          };
          setStaff([...staff, newStaff]);
          addToast('Thêm nhân viên thành công', 'success');
          setShowModal(false);
          resetForm();
        }
      } catch (err) {
        console.error('Error creating staff:', err);
        addToast('Lỗi thêm nhân viên: ' + err.message, 'error');
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <button className="btn btn-primary" onClick={openAddModal}>
          Thêm nhân viên
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
                  <button className="btn" onClick={() => openEditModal(s)}>Sửa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="nhân viên@example.com"
                  disabled={!!editingStaff}
                />
              </div>

              <div className="form-group">
                <label>Tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên nhân viên"
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu {editingStaff ? '(để trống nếu không đổi)' : '*'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={editingStaff ? 'Để trống nếu không thay đổi' : 'Nhập mật khẩu'}
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingStaff ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
