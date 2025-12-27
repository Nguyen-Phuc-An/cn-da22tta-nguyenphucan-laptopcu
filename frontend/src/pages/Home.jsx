import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import { getProducts } from '../api/products';
import { listCategories } from '../api/categories';
import { addToWishlist, listWishlist, removeFromWishlist } from '../api/wishlists';
import { AuthContext } from '../context/AuthContext';
import { AuthModalContext } from '../context/AuthModalContext';
import { SearchContext } from '../context/SearchContextValue';
import { ToastContext } from '../context/Toast';
import '../styles/Home.css';
import PriceRangeSlider from '../components/PriceRangeSlider';
import BannerSlider from '../components/BannerSlider';
import { imageToSrc, normalizeImages } from '../services/productImages';
import { listImages as listProductImages } from '../api/productImages';

function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(payload).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Home() {
  const { token } = useContext(AuthContext);
  const { setModalMode } = useContext(AuthModalContext);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const { addToast } = useContext(ToastContext);
  const userInfo = token ? decodeJwt(token) : null;
  const userId = userInfo?.id;

  const [products, setProducts] = useState(null);
  const [err, setErr] = useState('');
  const [favourites, setFavourites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [displayCount, setDisplayCount] = useState(10); // 5 rows × 5 products per row

  // filter UI state
  const [activeCriterion, setActiveCriterion] = useState(null); // which criterion panel is open
  const [filters, setFilters] = useState({ tinh_trang: [], o_cung: [], ram: [], cpu: [], kich_thuoc_man_hinh: [] });
  const [priceSort, setPriceSort] = useState(null); // 'asc' | 'desc' | null
  const [priceRange, setPriceRange] = useState({ from: '', to: '' });
  const criteriaRef = useRef(null);

  function clearCriterion(crit) {
    setFilters(f => ({ ...f, [crit]: [] }));
    setActiveCriterion(null);
  }

  function clearAllFilters() {
    setFilters({ tinh_trang: [], o_cung: [], ram: [], cpu: [], kich_thuoc_man_hinh: [] });
    setPriceRange({ from: '', to: '' });
    setPriceSort(null);
    setActiveCriterion(null);
    setSearchQuery('');
  }

  function clearSearch() {
    setSearchQuery('');
  }

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(10);
  }, [selectedCategory, filters, priceSort, priceRange, searchQuery]);

  // Load search query from sessionStorage on mount
  useEffect(() => {
    const query = sessionStorage.getItem('searchQuery');
    if (query) {
      setSearchQuery(query);
      sessionStorage.removeItem('searchQuery');
    }
    // Load current search from sessionStorage if it exists
    const currentSearch = sessionStorage.getItem('currentSearchQuery');
    if (currentSearch && !query) {
      setSearchQuery(currentSearch);
    }
  }, [setSearchQuery]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await getProducts();
        const prods = Array.isArray(rows) ? rows : (rows && rows.data ? rows.data : []);
        // fetch images for each product (public endpoint)
        const withImages = await Promise.all(prods.map(async p => {
          try {
            const imgs = await listProductImages(p.id).catch(() => []);
            p.images = Array.isArray(imgs) ? normalizeImages(imgs) : [];
          } catch { p.images = []; }
          return p;
        }));
        if (mounted) setProducts(withImages || []);
      } catch (e) {
        if (mounted) setErr(e.message || 'Lỗi tải sản phẩm');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load user's wishlist if logged in
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const wishlistData = await listWishlist(userId);
        const items = Array.isArray(wishlistData) ? wishlistData : (wishlistData && wishlistData.data ? wishlistData.data : []);
        const productIds = items.map(item => item.san_pham_id || item.product_id || item.id).filter(Boolean);
        setFavourites(productIds);
      } catch (e) {
        console.error('Lỗi tải wishlist:', e);
      }
    })();
  }, [userId]);

  // close open criterion panel when clicking outside the criteria area
  useEffect(() => {
    function onDocClick(e) {
      try {
        if (!criteriaRef.current) return;
        if (activeCriterion && !criteriaRef.current.contains(e.target)) {
          setActiveCriterion(null);
        }
      } catch (err) { void err; }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => { document.removeEventListener('mousedown', onDocClick); };
  }, [activeCriterion]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await listCategories();
        const rows = (res && (res.data || res.categories || res)) || [];
        if (!mounted) return;
        setCategories(Array.isArray(rows) ? rows : []);
      } catch (e) { void e; }
    })();
    return () => { mounted = false; };
  }, []);

  // fixed criterion options (per product attributes)
  const FIXED_OPTIONS = {
    tinh_trang: ['like_new','good','fair','poor'],
    o_cung: ['128GB','256GB','512GB','1TB'],
    ram: ['4GB','8GB','12GB','16GB','24GB','32GB'],
    cpu: ['Intel Core i3','Intel Core i5','Intel Core i7','Intel Core Ultra 7','AMD Ryzen 3','AMD Ryzen 5','AMD Ryzen 7','AMD Ryzen 9','Intel Core U5'],
    kich_thuoc_man_hinh: ['Khoảng 13"','Khoảng 14"','Khoảng 15"']
  };

  // apply filters and sorting
  const visibleProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    let out = products.slice();
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      out = out.filter(p => {
        const title = (p.tieu_de || p.title || '').toLowerCase();
        const specs = [p.ram, p.o_cung, p.cpu, p.kich_thuoc_man_hinh]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return title.includes(query) || specs.includes(query);
      });
    }
    
    if (selectedCategory) {
      out = out.filter(p => String(p.danh_muc_id) === String(selectedCategory));
    }
    Object.keys(filters).forEach(k => {
      const v = filters[k];
      if (Array.isArray(v) && v.length > 0) {
        // for common attributes (o_cung, ram, cpu, kich_thuoc_man_hinh) match by substring
        const substringKeys = ['o_cung','ram','cpu','kich_thuoc_man_hinh'];
        out = out.filter(p => {
          const val = (p[k] || p[k.replace(/_/g, '')] || '') || '';
          const valStr = String(val).toLowerCase();
          return v.some(sel => {
            const selStr = String(sel || '').toLowerCase();
            if (substringKeys.includes(k)) {
              return valStr.includes(selStr);
            }
            return String(sel) === String(val);
          });
        });
      }
    });
    // apply price range filter if present
    const from = Number(priceRange.from || 0) || 0;
    const to = Number(priceRange.to || 0) || 0;
    if ((priceRange.from !== '' && !Number.isNaN(Number(priceRange.from))) || (priceRange.to !== '' && !Number.isNaN(Number(priceRange.to)))) {
      out = out.filter(p => {
        const val = Number(p.gia || p.price || 0) || 0;
        if (priceRange.from !== '' && priceRange.to !== '') return val >= from && val <= to;
        if (priceRange.from !== '') return val >= from;
        if (priceRange.to !== '') return val <= to;
        return true;
      });
    }
    if (priceSort) {
      out.sort((a,b) => {
        const va = Number(a.gia || a.price || a.price_vnd || 0);
        const vb = Number(b.gia || b.price || b.price_vnd || 0);
        return priceSort === 'asc' ? va - vb : vb - va;
      });
    }
    return out;
  }, [products, selectedCategory, filters, priceSort, priceRange, searchQuery]);

  if (err) return <p className="error">{err}</p>;
  if (products === null || !products.length) return null;

  return (
    <section>
      <BannerSlider />
      <div className="top-area">
        <div className="left-col">
          {/* Categories filter (horizontal) */}
          <div className="categories-row">
            <button className={`chip ${!selectedCategory ? 'active' : ''}`} onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}>Tất cả</button>
            {categories.map(c => (
              <button key={c.id} className={`chip ${String(selectedCategory) === String(c.id) ? 'active' : ''}`} onClick={() => setSelectedCategory(String(c.id))}>{c.ten}</button>
            ))}
          </div>
        </div>
        <div className="right-col">
          <div className="filters-stack">
            <div>              
              <div className="criteria-row" ref={criteriaRef}>
                <h2 className="page-title">Chọn theo tiêu chí</h2>
                {['tinh_trang','o_cung','ram','cpu','kich_thuoc_man_hinh'].map(crit => (
                  <div key={crit} className="criterion">
                    <button
                      className={`criterion-btn ${activeCriterion === crit ? 'open' : ''} ${(Array.isArray(filters[crit]) && filters[crit].length > 0) ? 'selected' : ''}`}
                      onClick={() => setActiveCriterion(prev => prev === crit ? null : crit)}
                    >
                      {{
                        tinh_trang: 'Tình trạng máy', o_cung: 'Ổ cứng', ram: 'Dung lượng RAM', cpu: 'CPU', kich_thuoc_man_hinh: 'Kích thước màn hình'
                      }[crit]}
                      <span className="arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" width="18" height="18">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </button>
                    {activeCriterion === crit && (
                      <div className="criterion-panel">
                        <button className={`opt ${(!filters[crit] || filters[crit].length===0)? 'active':''}`} onClick={() => { setFilters(f => ({ ...f, [crit]: [] })); setActiveCriterion(null); }}>Bỏ chọn</button>
                        { (FIXED_OPTIONS[crit] || []).map(opt => (
                          <button
                            key={opt}
                            className={`opt ${(Array.isArray(filters[crit]) && filters[crit].some(s => String(s)===String(opt)))? 'active':''}`}
                            onClick={() => setFilters(f => {
                              const cur = Array.isArray(f[crit]) ? [...f[crit]] : [];
                              const idx = cur.findIndex(x => String(x) === String(opt));
                              if (idx >= 0) cur.splice(idx, 1); else cur.push(String(opt));
                              return { ...f, [crit]: cur };
                            })}
                          >{opt}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="criterion">
                  <button
                    className={`criterion-btn ${activeCriterion === 'price' ? 'open' : ''} ${(priceRange.from || priceRange.to) ? 'selected' : ''}`}
                    onClick={() => setActiveCriterion(prev => prev === 'price' ? null : 'price')}
                  >
                    Xem theo giá <span className="arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6" width="18" height="18">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                  {activeCriterion === 'price' && (
                    <div className="criterion-panel price-panel">
                      <div style={{display:'flex', flexDirection:'column', gap:8, alignItems: 'center'}}>
                        <PriceRangeSlider
                          value={[
                            priceRange.from !== '' && !Number.isNaN(Number(priceRange.from)) ? Number(priceRange.from) : 0,
                            priceRange.to !== '' && !Number.isNaN(Number(priceRange.to)) ? Number(priceRange.to) : 60000000,
                          ]}
                          onChange={([min, max]) => setPriceRange({ from: String(min), to: String(max) })}
                        />
                        <div style={{marginTop:8, display:'flex', gap:8}}>
                          <button className="opt" onClick={() => { setPriceRange({ from:'', to:'' }); setPriceSort(null); setActiveCriterion(null); }}>Bỏ chọn</button>
                          <button className={`opt ${(!filters['price'] || filters['price'].length===0)? 'active':''}`} onClick={() => { setActiveCriterion(null); }}>Áp dụng</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {((priceRange.from || priceRange.to) || Object.values(filters).some(a => Array.isArray(a) && a.length > 0)) && (
                <div className="active-filters">
                  <div className="af-header">
                    <strong>Đang lọc theo</strong>
                  </div>
                  <div className="af-body">
                    {/* Search query display - only show in af-body if there are other filters */}
                    {searchQuery.trim() && ((priceRange.from || priceRange.to) || Object.values(filters).some(a => Array.isArray(a) && a.length > 0)) && (
                      <div className="filter-group">
                        <div className="filter-btn">
                          <span className="f-label">Tìm kiếm</span>
                          <span className="filter-chip">{searchQuery} <button className="chip-x" onClick={() => clearSearch()}>×</button></span>
                        </div>
                      </div>
                    )}
                    
                    {/* Category is handled separately; do not show it here when selectedCategory is active */}
                    {Object.keys(filters).map(crit => {
                      const vals = filters[crit] || [];
                      if (!Array.isArray(vals) || vals.length === 0) return null;
                      const label = { tinh_trang: 'Tình trạng', o_cung: 'Ổ cứng', ram: 'RAM', cpu: 'CPU', kich_thuoc_man_hinh: 'Màn hình' }[crit] || crit;
                      return (
                        <div className="filter-group" key={crit}>
                          <button className="filter-btn" onClick={() => setActiveCriterion(crit)}>
                            <span className="f-label">{label}</span>
                            <span className="f-values">{vals.join(', ')}</span>
                            <span className="f-actions">
                              <span className="chip-x" onClick={(e) => { e.stopPropagation(); clearCriterion(crit); }}>×</span>
                            </span>
                          </button>
                        </div>
                      );
                    })}

                    {(priceRange.from || priceRange.to) && (
                      <div className="filter-group">                        
                        <div className="filter-btn">
                          <span className="f-label">Giá</span>
                          <span className="filter-chip">{priceRange.from ? Number(priceRange.from).toLocaleString('vi-VN') : '0'} — {priceRange.to ? Number(priceRange.to).toLocaleString('vi-VN') : '∞'} <button className="chip-x" onClick={() => setPriceRange({ from: '', to: '' })}>×</button></span>
                        </div>
                      </div>
                    )}
                    <button className="clear-all" onClick={clearAllFilters}>Xóa tất cả</button>
                  </div>
                </div>
              )}

              <div className="sort-row">
                <div className="sort-buttons">
                  <button className={`chips ${priceSort === null ? 'active' : ''}`} onClick={() => setPriceSort(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star-icon lucide-star">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
                    </svg>
                    Phổ biến
                  </button>
                  <button className={`chips ${priceSort === 'asc' ? 'active' : ''}`} onClick={() => setPriceSort('asc')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-az-icon lucide-arrow-up-a-z">
                      <path d="m3 8 4-4 4 4" />
                      <path d="M7 4v16" />
                      <path d="M20 8h-5" />
                      <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
                      <path d="M15 14h5l-5 6h5" />
                    </svg>
                    Giá thấp - cao
                  </button>
                  <button className={`chips ${priceSort === 'desc' ? 'active' : ''}`} onClick={() => setPriceSort('desc')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-az-icon lucide-arrow-down-a-z">
                      <path d="m3 16 4 4 4-4"/>
                      <path d="M7 20V4"/>
                      <path d="M20 8h-5"/>
                      <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10"/>
                      <path d="M15 14h5l-5 6h5"/>
                    </svg>
                    Giá cao - thấp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {visibleProducts.length === 0 ? (
        <div className="empty">Không tìm thấy sản phẩm bạn tìm.</div>
      ) : (
        <>
          <div id="products" className="products-grid">
          {visibleProducts.slice(0, displayCount).map(p => (
            <div className="product-card" key={p.id} onClick={() => window.location.href = `/product/${p.id}`} style={{ cursor: 'pointer' }}>
              {(() => {
                // prefer first image from p.images (normalized by admin fetch), fall back to common fields
                let src = '/uploads/products/default.jpg';
                try {
                  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
                    const first = p.images[0];
                    src = imageToSrc(typeof first === 'string' ? { url: first } : (first || {}));
                  } else if (typeof p.url === 'string' && p.url) src = imageToSrc({ url: p.url });
                  else if (typeof p.full_url === 'string' && p.full_url) src = p.full_url;
                  else if (typeof p.duong_dan === 'string' && p.duong_dan) src = p.duong_dan;
                  else if (typeof p.image === 'string' && p.image) src = `/uploads/products/${p.image}`;
                } catch (err) { void err; }
                // log computed src for debugging (first render)
                try { console.debug('product image src', p.id, src); } catch (e) { void e; }
                return (
                  <img
                    src={src}
                    alt={p.tieu_de || p.title}
                    loading="lazy"
                    onError={(e) => {
                      try {
                        const el = e && e.target;
                        if (!el) return;
                        // avoid infinite loop: only replace if not already default
                        if (!el.dataset.fallback) {
                          el.dataset.fallback = '1';
                          el.src = '/uploads/products/default.jpg';
                        }
                      } catch (err) { void err; }
                    }}
                    style={{ objectFit: 'contain' }}
                  />
                );
              })()}
              <h4 className="product-card-title">{p.tieu_de || p.title}</h4>
              <p className="product-card-price">{Number(p.gia || p.price || 0).toLocaleString('vi-VN')} {p.tien_te || p.currency || 'VND'}</p>

              <div className="product-card-badges">
                <span className="product-badge product-badge-purple">Học sinh/ sinh viên giảm thêm 500.000đ</span>
                <span className="product-badge product-badge-gray">Tặng Sim/Esim VNSKY, có ngay 5GB data 5G/ngày</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <div className={`product-status ${p.trang_thai === 'sold' ? 'sold-out' : 'in-stock'}`}>
                  {p.trang_thai === 'sold' ? 'Đã bán' : 'Còn hàng'}
                </div>
                <button
                  className={`fav-btn ${favourites.includes(p.id) ? 'fav-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!userId) {
                      setModalMode('login');
                      return;
                    }
                    const isCurrentlyFav = favourites.includes(p.id);
                    if (isCurrentlyFav) {
                      removeFromWishlist(userId, p.id)
                        .then(() => {
                          setFavourites(prev => prev.filter(x => x !== p.id));
                          addToast('Đã xóa khỏi danh sách yêu thích', 'success');
                        })
                        .catch(err => {
                          console.error('Lỗi xóa khỏi yêu thích:', err);
                          addToast('Lỗi xóa khỏi yêu thích', 'error');
                        });
                    } else {
                      addToWishlist({ user_id: userId, product_id: p.id })
                        .then(() => {
                          setFavourites(prev => [...prev, p.id]);
                          addToast('Đã thêm vào danh sách yêu thích', 'success');
                        })
                        .catch(err => {
                          console.error('Lỗi thêm vào yêu thích:', err);
                          addToast('Lỗi thêm vào yêu thích', 'error');
                        });
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M20.8 6.6c-.6-2.1-2.6-3.6-4.7-3.6-1.5 0-2.9.7-3.8 1.8-.9-1.1-2.3-1.8-3.8-1.8-2.1 0-4.1 1.5-4.7 3.6-.6 2.1.1 4.3 1.8 6.1L12 21l6.9-8.3c1.7-1.8 2.4-4 1.9-6.1z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                  </svg>
                  <span style={{marginLeft:8}}>Yêu thích</span>
                </button>
              </div>
            </div>
          ))}
          </div>
          
          {displayCount < visibleProducts.length && (
            <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
              <button
                onClick={() => setDisplayCount(prev => prev + 10)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Xem thêm + {Math.min(10, visibleProducts.length - displayCount)} sản phẩm
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}