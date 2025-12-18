import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';
import { imageToSrc } from '../../../services/productImages';

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

  const getImageUrl = (banner) => {
    // Banner ảnh được lưu trực tiếp trong duong_dan
    if (typeof banner.duong_dan === 'string' && banner.duong_dan) {
      return imageToSrc({ url: banner.duong_dan });
    }
    return null;
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBannerImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

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

  const handleSaveBanner = async () => {
    if (!bannerForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề banner');
      return;
    }
    try {
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
        const res = await apiFetch('/banners', {
          method: 'POST',
          body: payload
        });
        // res contains { id }, need to fetch full banner data
        const newBanner = await apiFetch(`/banners/${res.id}`);
        setBanners([...banners, newBanner]);
        alert('Thêm banner thành công');
      }
      setShowBannerModal(false);
    } catch (err) {
      alert('Lỗi lưu banner: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa banner này? Ảnh liên quan cũng sẽ bị xóa.')) return;
    try {
      // Get banner to find the image file
      const banner = banners.find(b => b.id === id);
      if (banner && banner.duong_dan) {
        // Try to delete the image file
        try {
          // Extract filename from path like "/public/uploads/products/filename.jpg"
          const fileName = banner.duong_dan.split('/').pop();
          if (fileName) {
            await apiFetch(`/uploads/delete`, {
              method: 'POST',
              body: { fileName, type: 'banners' }
            }).catch(() => null); // Ignore if endpoint doesn't exist
          }
        } catch (err) {
          console.error('Error deleting banner image file:', err);
        }
      }
      
      // Delete the banner record
      await apiFetch(`/banners/${id}`, { method: 'DELETE' });
      setBanners(banners.filter(b => b.id !== id));
      alert('Xóa banner thành công');
    } catch (err) {
      alert('Lỗi xóa banner: ' + err.message);
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
              const imgUrl = getImageUrl(b);
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

      {/* BANNER MODAL */}
      {showBannerModal && (
        <div className="modal-overlay" onClick={() => setShowBannerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{minWidth: '500px'}}>
            <button className="close-btn" onClick={() => setShowBannerModal(false)}>✕</button>
            <h3>{editingBanner ? 'Sửa banner' : 'Thêm banner mới'}</h3>
            
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Tiêu đề *</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Liên kết URL</label>
                <input
                  type="text"
                  value={bannerForm.link}
                  onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Vị trí hiển thị</label>
                <input
                  type="number"
                  value={bannerForm.position}
                  onChange={(e) => setBannerForm({...bannerForm, position: e.target.value})}
                  placeholder="0"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Trạng thái</label>
                <select
                  value={bannerForm.status}
                  onChange={(e) => setBannerForm({...bannerForm, status: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="active">Kích hoạt</option>
                  <option value="inactive">Tắt</option>
                </select>
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Hình ảnh banner</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerImageChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                {bannerImagePreview && (
                  <img src={bannerImagePreview} alt="preview" style={{ marginTop: '10px', maxHeight: '150px', borderRadius: '4px' }} />
                )}
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSaveBanner}>
                {editingBanner ? 'Cập nhật' : 'Thêm'}
              </button>
              <button className="btn" onClick={() => setShowBannerModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
