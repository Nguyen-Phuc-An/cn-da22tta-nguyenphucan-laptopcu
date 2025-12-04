import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../services/apiClient';
import { imageToSrc, normalizeImages } from '../../../services/productImages';
import { listImages as listProductImages, deleteImage } from '../../../api/productImages';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    condition: '',
    status: ''
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [productForm, setProductForm] = useState({
    title: '',
    category_id: '',
    cpu: '',
    ram: '',
    o_cung: '',
    gia: '',
    so_luong: '',
    tinh_trang: 'like_new',
    trang_thai: 'available',
    mo_ta: ''
  });
  const [productImages, setProductImages] = useState([]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiFetch('/products');
        const data = Array.isArray(res) ? res : res?.data || [];
        
        // Fetch images for each product
        const withImages = await Promise.all(data.map(async p => {
          try {
            const imgs = await listProductImages(p.id).catch(() => []);
            p.images = Array.isArray(imgs) ? normalizeImages(imgs) : [];
          } catch {
            p.images = [];
          }
          return p;
        }));
        
        setProducts(withImages);
        setFilteredProducts(withImages);
      } catch (err) {
        console.error('Error loading products:', err);
      }
    };
    loadProducts();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await apiFetch('/categories');
        const data = Array.isArray(res) ? res : res?.data || [];
        setCategories(data);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = products;
    if (filters.title) result = result.filter(p => (p.tieu_de || p.title || '').toLowerCase().includes(filters.title.toLowerCase()));
    if (filters.category) result = result.filter(p => p.danh_muc_id === parseInt(filters.category));
    if (filters.condition) result = result.filter(p => p.tinh_trang === filters.condition);
    if (filters.status) result = result.filter(p => p.trang_thai === filters.status);
    setFilteredProducts(result);
  }, [filters, products]);

  // Category functions
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      const res = await apiFetch('/categories', {
        method: 'POST',
        body: { name: categoryForm.name }
      });
      setCategories([...categories, res]);
      setCategoryForm({ name: '' });
      alert('Thêm danh mục thành công');
    } catch (err) {
      alert('Lỗi thêm danh mục: ' + err.message);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      await apiFetch(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: { name: categoryForm.name }
      });
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, name: categoryForm.name } : c));
      setCategoryForm({ name: '' });
      setEditingCategory(null);
      alert('Cập nhật danh mục thành công');
    } catch (err) {
      alert('Lỗi cập nhật danh mục: ' + err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      setCategories(categories.filter(c => c.id !== id));
      alert('Xóa danh mục thành công');
    } catch (err) {
      alert('Lỗi xóa danh mục: ' + err.message);
    }
  };

  // Product functions
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        title: product.tieu_de || product.title || '',
        category_id: product.danh_muc_id || '',
        cpu: product.cpu || '',
        ram: product.ram || '',
        o_cung: product.o_cung || '',
        gia: product.gia || '',
        so_luong: product.so_luong || '',
        tinh_trang: product.tinh_trang || 'like_new',
        trang_thai: product.trang_thai || 'available',
        mo_ta: product.mo_ta || ''
      });
      // Load existing images
      const existingImages = product.images ? product.images.map(img => {
        const url = typeof img === 'string' ? img : imageToSrc(img || {});
        return { type: 'existing', url, id: img.id };
      }) : [];
      setProductImages(existingImages);
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '',
        category_id: '',
        cpu: '',
        ram: '',
        o_cung: '',
        gia: '',
        so_luong: '',
        tinh_trang: 'like_new',
        trang_thai: 'available',
        mo_ta: ''
      });
      setProductImages([]);
    }
    setShowProductModal(true);
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImages([...productImages, { type: 'new', url: event.target.result, file }]);
      };
      reader.readAsDataURL(file);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveProductImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!productForm.title.trim() || !productForm.category_id) {
      alert('Vui lòng nhập đủ thông tin bắt buộc');
      return;
    }
    try {
      const payload = {
        tieu_de: productForm.title,
        danh_muc_id: parseInt(productForm.category_id),
        cpu: productForm.cpu,
        ram: productForm.ram,
        o_cung: productForm.o_cung,
        gia: parseInt(productForm.gia) || 0,
        so_luong: parseInt(productForm.so_luong) || 0,
        tinh_trang: productForm.tinh_trang,
        trang_thai: productForm.trang_thai,
        mo_ta: productForm.mo_ta
      };

      if (editingProduct) {
        await apiFetch(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: payload
        });
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
        alert('Cập nhật sản phẩm thành công');
      } else {
        const res = await apiFetch('/products', {
          method: 'POST',
          body: payload
        });
        setProducts([...products, res]);
        alert('Thêm sản phẩm thành công');
      }
      setShowProductModal(false);
    } catch (err) {
      alert('Lỗi lưu sản phẩm: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này? Ảnh liên quan cũng sẽ bị xóa.')) return;
    try {
      // Delete all images of this product first
      const product = products.find(p => p.id === id);
      if (product && product.images && product.images.length > 0) {
        for (const img of product.images) {
          try {
            if (img.id) {
              await deleteImage(id, img.id);
            }
          } catch (err) {
            console.error('Error deleting image:', err);
          }
        }
      }
      
      // Then delete the product
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter(p => p.id !== id));
      alert('Xóa sản phẩm thành công');
    } catch (err) {
      alert('Lỗi xóa sản phẩm: ' + err.message);
    }
  };

  const getImageUrl = (product) => {
    // Use imageToSrc from productImages service (same as Home.jsx)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0];
      return imageToSrc(typeof first === 'string' ? { url: first } : (first || {}));
    } else if (typeof product.url === 'string' && product.url) {
      return imageToSrc({ url: product.url });
    }
    return null;
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Quản lý sản phẩm</h2>
        <div className="panel-actions">
          <button className="btn" onClick={() => setShowCategoryModal(true)}>📁 Danh mục</button>
          <button className="btn btn-primary" onClick={() => handleOpenProductModal()}>+ Thêm sản phẩm</button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tiêu đề"
          className="filter-input"
          value={filters.title}
          onChange={(e) => setFilters({...filters, title: e.target.value})}
        />
        <select
          className="filter-select"
          value={filters.category}
          onChange={(e) => setFilters({...filters, category: e.target.value})}
        >
          <option value="">Danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.ten || c.name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.condition}
          onChange={(e) => setFilters({...filters, condition: e.target.value})}
        >
          <option value="">Tình trạng</option>
          <option value="like_new">Như mới</option>
          <option value="good">Tốt</option>
          <option value="fair">Bình thường</option>
          <option value="poor">Kém</option>
        </select>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">Trạng thái</option>
          <option value="available">Còn hàng</option>
          <option value="sold">Đã bán</option>
          <option value="hidden">Ẩn</option>
        </select>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tiêu đề</th>
            <th>CPU</th>
            <th>RAM</th>
            <th>Ổ cứng</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr><td colSpan="9" style={{ textAlign: 'center', color: '#999' }}>Không có sản phẩm nào</td></tr>
          ) : (
            filteredProducts.map(p => (
              <tr key={p.id}>
                <td>
                  {(() => {
                    const imgUrl = getImageUrl(p);
                    return imgUrl ? (
                      <img src={imgUrl} alt="" style={{width: 40, height: 40, objectFit: 'cover', borderRadius: 4}} />
                    ) : (
                      <span style={{fontSize: '24px'}}>📷</span>
                    );
                  })()}
                </td>
                <td>{p.tieu_de || p.title || '-'}</td>
                <td>{p.cpu || '-'}</td>
                <td>{p.ram || '-'}</td>
                <td>{p.o_cung || '-'}</td>
                <td>{(p.gia || 0).toLocaleString('vi-VN')}</td>
                <td>{p.so_luong || 0}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: p.trang_thai === 'available' ? '#d1fae5' : '#fee2e2',
                    color: p.trang_thai === 'available' ? '#065f46' : '#7f1d1d'
                  }}>
                    {p.trang_thai === 'available' ? 'Còn hàng' : p.trang_thai}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="btn" onClick={() => handleOpenProductModal(p)} style={{marginRight: '5px'}}>Sửa</button>
                  <button className="btn-danger" onClick={() => handleDeleteProduct(p.id)}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{minWidth: '500px'}}>
            <button className="close-btn" onClick={() => setShowCategoryModal(false)}>✕</button>
            <h3>Quản lý danh mục</h3>
            
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Tên danh mục"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  style={{ minWidth: '100px' }}
                >
                  {editingCategory ? 'Cập nhật' : 'Thêm'}
                </button>
                {editingCategory && (
                  <button 
                    className="btn"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ name: '' });
                    }}
                  >
                    Hủy
                  </button>
                )}
              </div>

              <table className="data-table" style={{ fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th>Tên danh mục</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan="2" style={{ textAlign: 'center', color: '#999' }}>Không có danh mục nào</td></tr>
                  ) : (
                    categories.map(c => (
                      <tr key={c.id}>
                        <td>{c.ten || c.name}</td>
                        <td>
                          <button 
                            className="btn" 
                            onClick={() => {
                              setEditingCategory(c);
                              setCategoryForm({ name: c.ten || c.name });
                            }}
                            style={{marginRight: '5px'}}
                          >
                            Sửa
                          </button>
                          <button 
                            className="btn-danger" 
                            onClick={() => handleDeleteCategory(c.id)}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowCategoryModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{minWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
            <button className="close-btn" onClick={() => setShowProductModal(false)}>✕</button>
            <h3>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
            
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Tiêu đề *</label>
                <input
                  type="text"
                  value={productForm.title}
                  onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
              
              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Danh mục *</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.ten || c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>CPU</label>
                <input
                  type="text"
                  value={productForm.cpu}
                  onChange={(e) => setProductForm({...productForm, cpu: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>RAM</label>
                <input
                  type="text"
                  value={productForm.ram}
                  onChange={(e) => setProductForm({...productForm, ram: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Ổ cứng</label>
                <input
                  type="text"
                  value={productForm.o_cung}
                  onChange={(e) => setProductForm({...productForm, o_cung: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Giá (VND)</label>
                <input
                  type="number"
                  value={productForm.gia}
                  onChange={(e) => setProductForm({...productForm, gia: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Số lượng</label>
                <input
                  type="number"
                  value={productForm.so_luong}
                  onChange={(e) => setProductForm({...productForm, so_luong: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Tình trạng</label>
                <select
                  value={productForm.tinh_trang}
                  onChange={(e) => setProductForm({...productForm, tinh_trang: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="like_new">Như mới</option>
                  <option value="good">Tốt</option>
                  <option value="fair">Bình thường</option>
                  <option value="poor">Kém</option>
                </select>
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Trạng thái</label>
                <select
                  value={productForm.trang_thai}
                  onChange={(e) => setProductForm({...productForm, trang_thai: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="available">Còn hàng</option>
                  <option value="sold">Đã bán</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Mô tả</label>
              <textarea
                value={productForm.mo_ta}
                onChange={(e) => setProductForm({...productForm, mo_ta: e.target.value})}
                rows="4"
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ marginTop: '15px' }}>
              <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Hình ảnh sản phẩm</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
              
              {productImages.length > 0 && (
                <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                  {productImages.map((img, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #d1d5db' }}>
                      <img src={img.url} alt={`preview-${index}`} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                      <button
                        onClick={() => handleRemoveProductImage(index)}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        ✕
                      </button>
                      {img.type === 'existing' && (
                        <span style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '2px',
                          background: '#10b981',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 4px',
                          borderRadius: '2px'
                        }}>
                          Hiện có
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSaveProduct}>
                {editingProduct ? 'Cập nhật' : 'Thêm'}
              </button>
              <button className="btn" onClick={() => setShowProductModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

