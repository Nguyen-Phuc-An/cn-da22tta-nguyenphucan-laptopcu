import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    link: '',
    position: '',
    status: 'active'
  });
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);
  // Load banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await apiFetch('/banners');
        const data = Array.isArray(res) ? res : res?.data || [];
        setBanners(data);
      } catch (err) {
        console.error('Error loading banners:', err);
      }
    };
    loadBanners();
  }, []);
  // Lấy URL hình ảnh banner
  const getBannerImageUrl = (banner) => {
    if (!banner || !banner.duong_dan) return null;
    
    let imagePath = banner.duong_dan;
    
    // Nếu đã là URL tuyệt đối, trả về nguyên
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Đối với đường dẫn tương đối, thêm tiền tố API base
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const baseUrl = apiBase.replace('/api', '');
    
    // Làm sạch đường dẫn - loại bỏ các dấu gạch chéo đầu và thêm một dấu /
    const cleanPath = imagePath.replace(/^\/+/, '/');
    
    return baseUrl + cleanPath;
  };
  // Xử lý thay đổi hình ảnh banner
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  // Mở modal thêm/sửa banner
  const handleOpenBannerModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.tieu_de || '',
        link: banner.link || '',
        position: banner.vi_tri || '',
        status: banner.trang_thai || 'active'
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        title: '',
        link: '',
        position: '',
        status: 'active'
      });
    }
    setBannerImagePreview(null);
    setShowBannerModal(true);
  };
  // Lưu banner (thêm hoặc cập nhật)
  const handleSaveBanner = async () => {
    if (!bannerForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề banner');
      return;
    }
    try {
      // Cập nhật chỉ với văn bản hoặc không thay đổi hình ảnh
      const payload = {
        tieu_de: bannerForm.title,
        link: bannerForm.link,
        vi_tri: parseInt(bannerForm.position) || 0,
        trang_thai: bannerForm.status
      };

      if (editingBanner) {
        await apiFetch(`/banners/${editingBanner.id}`, {
          method: 'PUT',
          body: payload
        });
        setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...payload } : b));
        alert('Cập nhật banner thành công');
      } else {
        // Kiểm tra nếu có tệp hình ảnh mới để tải lên
        const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
        if (bannerImagePreview && fileInput && fileInput.files.length > 0) {
          // Đối với banner mới có hình ảnh: sử dụng FormData
          const formData = new FormData();
          formData.append('tieu_de', bannerForm.title);
          formData.append('link', bannerForm.link);
          formData.append('vi_tri', parseInt(bannerForm.position) || 0);
          formData.append('trang_thai', bannerForm.status);
          formData.append('hinh_anh', fileInput.files[0]);

          // Tạo banner với hình ảnh
          const res = await apiFetch('/banners', {
            method: 'POST',
            body: formData,
            isFormData: true
          });
          setBanners([...banners, res]);
          alert('Thêm banner thành công');
        } else {
          // Banner chỉ có văn bản, không có hình ảnh
          const res = await apiFetch('/banners', {
            method: 'POST',
            body: payload
          });
          setBanners([...banners, res]);
          alert('Thêm banner thành công');
        }
      }
      setShowBannerModal(false);
    } catch (err) {
      alert('Lỗi lưu banner: ' + err.message);
    }
  };
  // Xử lý xóa banner
  const handleDeleteBanner = (id) => {
    setDeleteConfirmData({
      type: 'banner',
      id,
      name: banners.find(b => b.id === id)?.tieu_de || 'banner'
    });
    setShowDeleteConfirm(true);
  };
  // Xác nhận xóa banner
  const handleConfirmDelete = async () => {
    if (!deleteConfirmData) return;

    try {
      const banner = banners.find(b => b.id === deleteConfirmData.id);
      if (banner && banner.duong_dan) {
        try {
          const fileName = banner.duong_dan.split('/').pop();
          if (fileName) {
            await apiFetch(`/uploads/delete`, {
              method: 'POST',
              body: { fileName, type: 'banners' }
            }).catch(() => null);
          }
        } catch (err) {
          console.error('Error deleting banner image file:', err);
        }
      }
      
      await apiFetch(`/banners/${deleteConfirmData.id}`, { method: 'DELETE' });
      setBanners(banners.filter(b => b.id !== deleteConfirmData.id));
      alert('Xóa banner thành công');
    } catch (err) {
      alert('Lỗi xóa banner: ' + err.message);
    } finally {
      setShowDeleteConfirm(false);
      setDeleteConfirmData(null);
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <button className="btn btn-primary" onClick={() => handleOpenBannerModal()}>
          Thêm banner
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th  style={{ overflow: 'hidden', width: '200px' }}>Ảnh</th>
            <th>Liên kết</th>
            <th>Vị trí</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {banners.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>Không có banner nào</td></tr>
          ) : (
            banners.map(b => {
              const imgUrl = getBannerImageUrl(b);
              return (
                <tr key={b.id}>
                  <td>{b.tieu_de || '-'}</td>
                  <td style={{ overflow: 'hidden', width: '200px' }}>
                    {imgUrl ? (
                      <img src={imgUrl} alt="banner" style={{ height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <span style={{fontSize: '24px'}}>🖼️</span>
                    )}
                  </td>
                  <td>{b.link || '-'}</td>
                  <td>{b.vi_tri || 0}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: b.trang_thai === 'active' ? '#dcfce7' : '#fee2e2',
                      color: b.trang_thai === 'active' ? '#166534' : '#991b1b'
                    }}>
                      {b.trang_thai === 'active' ? 'Kích hoạt' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => handleOpenBannerModal(b)} style={{marginRight: '5px'}}>Sửa</button>
                    <button className="btn-danger" onClick={() => handleDeleteBanner(b.id)}>Xóa</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && deleteConfirmData && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{minWidth: '400px'}}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                margin: '0 auto 20px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                ⚠️
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#111827' }}>
                Xóa banner?
              </h3>
              
              <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
                Bạn chắc chắn muốn xóa <strong>"{deleteConfirmData.name}"</strong>? Ảnh liên quan cũng sẽ bị xóa.
              </p>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  className="btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ minWidth: '120px' }}
                >
                  Hủy
                </button>
                <button
                  className="btn-danger"
                  onClick={handleConfirmDelete}
                  style={{ minWidth: '120px' }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANNER MODAL */}
      {showBannerModal && (
        <div className="modal-overlay" onClick={() => setShowBannerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{minWidth: '500px'}}>
            <div className="modal-header">
              <h3>{editingBanner ? 'Sửa banner' : 'Thêm banner mới'}</h3>
              <button className="close-btn" onClick={() => setShowBannerModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
                <div>
                  <label style={{fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px'}}>Tiêu đề *</label>
                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px'}}>Liên kết URL</label>
                  <input
                    type="text"
                    value={bannerForm.link}
                    onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                    placeholder="https://example.com"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px'}}>Vị trí hiển thị</label>
                  <input
                    type="number"
                    value={bannerForm.position}
                    onChange={(e) => setBannerForm({...bannerForm, position: e.target.value})}
                    placeholder="0"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                <div>
                  <label style={{fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px'}}>Trạng thái</label>
                  <select
                    value={bannerForm.status}
                    onChange={(e) => setBannerForm({...bannerForm, status: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s', cursor: 'pointer' }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  >
                    <option value="active">Kích hoạt</option>
                    <option value="inactive">Tắt</option>
                  </select>
                </div>

                <div>
                  <label style={{fontWeight: '600', display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px'}}>Hình ảnh banner</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer' }}
                  />
                  {bannerImagePreview && (
                    <img src={bannerImagePreview} alt="preview" style={{ marginTop: '12px', maxHeight: '180px', borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowBannerModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveBanner}>
                {editingBanner ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
