import React, { useState, useEffect, useContext } from 'react';
import { apiFetch } from '../../../services/apiClient';
import { imageToSrc, normalizeImages } from '../../../services/productImages';
import { listImages as listProductImages, deleteImage, uploadImages } from '../../../api/productImages';
import { ToastContext } from '../../../context/Toast';

export default function Products() {
  const { addToast } = useContext(ToastContext);
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
    kich_thuoc_man_hinh: '',
    card_do_hoa: '',
    mau_sac: '',
    do_phan_giai: '',
    gia: '',
    tien_te: 'VND',
    so_luong: '',
    tinh_trang: 'like_new',
    trang_thai: 'available',
    mo_ta: ''
  });
  const [productImages, setProductImages] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);

  // Tải sản phẩm khi component mount
  useEffect(() => {
    // Load products
    const loadProducts = async () => {
      try {
        const res = await apiFetch('/products');
        const data = Array.isArray(res) ? res : res?.data || [];
        
        // Tải hình ảnh cho mỗi sản phẩm
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

  // Áp dụng bộ lọc
  useEffect(() => {
    let result = products;
    if (filters.title) result = result.filter(p => (p.tieu_de || p.title || '').toLowerCase().includes(filters.title.toLowerCase()));
    if (filters.category) result = result.filter(p => p.danh_muc_id === parseInt(filters.category));
    if (filters.condition) result = result.filter(p => p.tinh_trang === filters.condition);
    if (filters.status) result = result.filter(p => p.trang_thai === filters.status);
    setFilteredProducts(result);
  }, [filters, products]);

  // Category local functions 
  const handleAddCategory = async () => {
    if (!categoryForm.name.trim()) {
      addToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }
    try {
      const res = await apiFetch('/categories', {
        method: 'POST',
        body: { ten: categoryForm.name }
      });
      const newCategory = { id: res.id, ten: categoryForm.name };
      setCategories([...categories, newCategory]);
      setCategoryForm({ name: '' });
      addToast('Thêm danh mục thành công', 'success');
    } catch (err) {
      addToast('Lỗi thêm danh mục: ' + err.message, 'error');
    }
  };
  // Cập nhật danh mục
  const handleUpdateCategory = async () => {
    if (!categoryForm.name.trim()) {
      addToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }
    try {
      await apiFetch(`/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: { ten: categoryForm.name }
      });
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ten: categoryForm.name } : c));
      setCategoryForm({ name: '' });
      setEditingCategory(null);
      addToast('Cập nhật danh mục thành công', 'success');
    } catch (err) {
      addToast('Lỗi cập nhật danh mục: ' + err.message, 'error');
    }
  };
  // Xóa danh mục
  const handleDeleteCategory = async (id) => {
    setDeleteConfirmData({
      type: 'category',
      id,
      name: categories.find(c => c.id === id)?.ten || 'danh mục'
    });
    setShowDeleteConfirm(true);
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
        kich_thuoc_man_hinh: product.kich_thuoc_man_hinh || '',
        card_do_hoa: product.card_do_hoa || '',
        mau_sac: product.mau_sac || '',
        do_phan_giai: product.do_phan_giai || '',
        gia: product.gia || '',
        tien_te: product.tien_te || 'VND',
        so_luong: product.so_luong || '',
        tinh_trang: product.tinh_trang || 'like_new',
        trang_thai: product.trang_thai || 'available',
        mo_ta: product.mo_ta || ''
      });
      // Load existing images with full_url from server
      const existingImages = product.images ? product.images.map(img => {
        const url = img.full_url || (typeof img === 'string' ? img : imageToSrc(img || {}));
        return { type: 'existing', url, id: img.id || img.ma };
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
        kich_thuoc_man_hinh: '',
        card_do_hoa: '',
        mau_sac: '',
        do_phan_giai: '',
        gia: '',
        tien_te: 'VND',
        so_luong: '',
        tinh_trang: 'like_new',
        trang_thai: 'available',
        mo_ta: ''
      });
      setProductImages([]);
    }
    setShowProductModal(true);
  };
  // Xử lý thay đổi ảnh sản phẩm
  const handleProductImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductImages(prev => [...prev, { type: 'new', url: event.target.result, file }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Đặt lại input
    e.target.value = '';
  };
  // Xóa ảnh sản phẩm
  const handleRemoveProductImage = async (index) => {
    const img = productImages[index];
    
    // Nếu là ảnh cũ (có id từ database), xóa từ server
    if (img.id) {
      try {
        const response = await apiFetch(`/products/${editingProduct.id}/images/${img.id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          addToast('Xóa ảnh thất bại', 'error');
          return;
        }
        addToast('Xóa ảnh thành công', 'success');
      } catch (error) {
        console.error('Error deleting image:', error);
        addToast('Lỗi khi xóa ảnh', 'error');
        return;
      }
    }
    
    // Xóa khỏi local state
    setProductImages(productImages.filter((_, i) => i !== index));
  };
  // Lưu sản phẩm (thêm hoặc cập nhật)
  const handleSaveProduct = async () => {
    if (!productForm.title.trim() || !productForm.category_id) {
      addToast('Vui lòng nhập đủ thông tin bắt buộc', 'error');
      return;
    }
    try {
      const payload = {
        tieu_de: productForm.title,
        danh_muc_id: parseInt(productForm.category_id),
        cpu: productForm.cpu,
        ram: productForm.ram,
        o_cung: productForm.o_cung,
        kich_thuoc_man_hinh: productForm.kich_thuoc_man_hinh,
        card_do_hoa: productForm.card_do_hoa,
        mau_sac: productForm.mau_sac,
        do_phan_giai: productForm.do_phan_giai,
        gia: parseInt(productForm.gia) || 0,
        tien_te: productForm.tien_te,
        so_luong: parseInt(productForm.so_luong) || 0,
        tinh_trang: productForm.tinh_trang,
        trang_thai: productForm.trang_thai,
        mo_ta: productForm.mo_ta
      };

      let productId = editingProduct?.id;
      
      // Save/update product info
      if (editingProduct) {
        await apiFetch(`/products/${editingProduct.id}`, {
          method: 'PUT',
          body: payload
        });
        addToast('Cập nhật sản phẩm thành công', 'success');
      } else {
        const res = await apiFetch('/products', {
          method: 'POST',
          body: payload
        });
        productId = res.id;
        addToast('Thêm sản phẩm thành công', 'success');
      }

      // Upload new images if any
      const newImages = productImages.filter(img => img.type === 'new' && img.file);
      
      if (newImages.length > 0 && productId) {
        try {
          const filesToUpload = newImages.map(img => img.file);
          await uploadImages(productId, filesToUpload);
          addToast('Ảnh đã được tải lên thành công', 'success');
        } catch (err) {
          console.error('Error uploading images:', err);
          addToast('Lỗi tải ảnh: ' + err.message, 'error');
        }
      }
      
      // Reload product with updated images
      try {
        const updatedProduct = await apiFetch(`/products/${productId}`);
        const imgs = await listProductImages(productId).catch(() => []);
        
        // Map images correctly
        updatedProduct.images = Array.isArray(imgs) ? imgs.map(img => ({
          id: img.id || img.ma,
          url: img.full_url || img.url || img.duong_dan || '',
          duong_dan: img.duong_dan || img.url || ''
        })) : [];
        
        if (editingProduct) {
          setProducts(products.map(p => p.id === productId ? updatedProduct : p));
        } else {
          setProducts([...products, updatedProduct]);
        }
        setFilteredProducts(products => 
          editingProduct 
            ? products.map(p => p.id === productId ? updatedProduct : p)
            : [...products, updatedProduct]
        );
      } catch (err) {
        console.error('Error reloading product:', err);
      }

      setShowProductModal(false);
      setProductImages([]);
    } catch (err) {
      addToast('Lỗi lưu sản phẩm: ' + err.message, 'error');
      console.error('handleSaveProduct error:', err);
    }
  };
  // Lấy URL hình ảnh sản phẩm
  const getImageUrl = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0];
      
      // Nếu là object với full_url, dùng trực tiếp
      if (typeof first === 'object' && first?.full_url) {
        return first.full_url;
      }
      
      // Ngược lại, sử dụng dịch vụ imageToSrc
      const imgData = typeof first === 'string' ? { url: first } : (first || {});
      return imageToSrc(imgData);
    }
    return null;
  };
  // Xử lý xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!deleteConfirmData) return;

    try {
      if (deleteConfirmData.type === 'category') {
        await apiFetch(`/categories/${deleteConfirmData.id}`, { method: 'DELETE' });
        setCategories(categories.filter(c => c.id !== deleteConfirmData.id));
        addToast('Xóa danh mục thành công', 'success');
      } else if (deleteConfirmData.type === 'product') {
        const product = products.find(p => p.id === deleteConfirmData.id);
        
        // Xóa tất cả hình ảnh liên quan đến sản phẩm
        if (product && product.images && product.images.length > 0) {
          for (const img of product.images) {
            try {
              const imgId = img.id || img.ma;
              if (imgId) {
                await deleteImage(deleteConfirmData.id, imgId).catch(err => {
                  console.warn('Image delete via API failed, continuing...', err);
                });
              }
            } catch (err) {
              console.error('Error deleting image:', err);
            }
          }
        }
        
        // Xóa sản phẩm (backend sẽ tự động xóa các hình ảnh liên quan)
        await apiFetch(`/products/${deleteConfirmData.id}`, { method: 'DELETE' });
        setProducts(products.filter(p => p.id !== deleteConfirmData.id));
        addToast('Xóa sản phẩm và các hình ảnh thành công', 'success');
      }
    } catch (err) {
      addToast(`Lỗi xóa ${deleteConfirmData.type === 'category' ? 'danh mục' : 'sản phẩm'}: ${err.message}`, 'error');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteConfirmData(null);
    }
  };
  // Xử lý xóa sản phẩm
  const handleDeleteProduct = async (id) => {
    setDeleteConfirmData({
      type: 'product',
      id,
      name: products.find(p => p.id === id)?.tieu_de || products.find(p => p.id === id)?.title || 'sản phẩm'
    });
    setShowDeleteConfirm(true);
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div className="panel-actions">
          <button className="btn" onClick={() => setShowCategoryModal(true)} style={{width: '200px'}}>📁 Danh mục</button>
          <button className="btn btn-primary" onClick={() => handleOpenProductModal()} style={{width: '200px'}}>+ Thêm sản phẩm</button>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
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
            <option key={c.id} value={c.id}>{c.ten}</option>
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
            <th style={{minWidth: '100px'}}>Trạng thái</th>
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
            <div className="modal-header">
              <h3>Quản lý danh mục</h3>
              <button className="close-btn" onClick={() => setShowCategoryModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            
            <div className="modal-body" style={{ padding: '0' }}>
              <div style={{ padding: '15px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: '0', background: 'white', zIndex: 10, display: 'flex', gap: '10px' }}>
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

              <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                <table className="data-table" style={{ fontSize: '14px', margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 5 }}>
                    <tr>
                      <th>Tên danh mục</th>
                      <th style={{textAlign: 'center'}}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan="2" style={{ textAlign: 'center', color: '#999' }}>Không có danh mục nào</td></tr>
                    ) : (
                      categories.map(c => (
                        <tr key={c.id}>
                          <td>{c.ten}</td>
                          <td>
                            <button 
                              className="btn" 
                              onClick={() => {
                                setEditingCategory(c);
                                setCategoryForm({ name: c.ten });
                              }}
                              style={{width: '100%'}}
                            >
                              Sửa
                            </button>
                            <button 
                              className="btn-danger" 
                              onClick={() => handleDeleteCategory(c.id)}
                              style={{width: '100%'}}
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
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowCategoryModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{minWidth: '600px'}}>
            <div className="modal-header">
              <h3>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button className="close-btn" onClick={() => setShowProductModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>
            
            <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                    <option key={c.id} value={c.id}>{c.ten}</option>
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
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Kích thước màn hình</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 15.6 inch"
                  value={productForm.kich_thuoc_man_hinh}
                  onChange={(e) => setProductForm({...productForm, kich_thuoc_man_hinh: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Card đồ họa</label>
                <input
                  type="text"
                  placeholder="Ví dụ: NVIDIA GeForce RTX 3060"
                  value={productForm.card_do_hoa}
                  onChange={(e) => setProductForm({...productForm, card_do_hoa: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Màu sắc</label>
                <select
                  value={productForm.mau_sac}
                  onChange={(e) => setProductForm({...productForm, mau_sac: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="">-- Chọn màu --</option>
                  <option value="den">Đen</option>
                  <option value="bac">Bạc</option>
                  <option value="xam">Xám</option>
                  <option value="trang">Trắng</option>
                  <option value="do">Đỏ</option>
                  <option value="xanh">Xanh</option>
                </select>
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Độ phân giải</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1920x1080"
                  value={productForm.do_phan_giai}
                  onChange={(e) => setProductForm({...productForm, do_phan_giai: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Giá</label>
                <input
                  type="number"
                  value={productForm.gia}
                  onChange={(e) => setProductForm({...productForm, gia: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{fontWeight: '600', display: 'block', marginBottom: '5px'}}>Tiền tệ</label>
                <select
                  value={productForm.tien_te}
                  onChange={(e) => setProductForm({...productForm, tien_te: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                >
                  <option value="VND">VND (Đồng)</option>
                  <option value="USD">USD (Đô la)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
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
                multiple
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
                        <i className="bi bi-x-lg" style={{color: 'white'}}></i>
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

            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowProductModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveProduct}>
                {editingProduct ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                Xóa {deleteConfirmData.type === 'category' ? 'danh mục' : 'sản phẩm'}?
              </h3>
              
              <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
                Bạn chắc chắn muốn xóa <strong>"{deleteConfirmData.name}"</strong>?
                {deleteConfirmData.type === 'product' && ' Ảnh liên quan cũng sẽ bị xóa.'}
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
    </div>
  );
}

