import React, { useState, useEffect } from 'react';
import { getActiveBanners } from '../services/banners';
import './BannerSlider.css';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load active banners on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveBanners();
        console.log('[BannerSlider] Active banners:', data);
        setBanners(data || []);
      } catch (err) {
        console.error('[BannerSlider] Error loading banners:', err);
      }
    })();
  }, []);

  // Tự động chuyển banner sau mỗi 5 giây
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners]);
  // Nếu không có banner nào, chỉ hiển thị banner-bottom
  if (!banners || banners.length === 0) {
    console.log('[BannerSlider] No active banners from backend, showing fallback');
    return (
      <div className="banner-slider">
        <div className="banner-bottom">
            <div className="banner-main">
                <div 
                    onClick={() => window.location.href = '/edu-verification'}
                    style={{ display: 'block', width: 'auto', height: '100%' }}
                    title="Xác thực học sinh để nhận giảm giá"
                >
                <img
                    src="/images/banner-laptop-edu.png"
                    style={{ cursor: 'pointer', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    alt="Banner Edu Verification"
                    loading="lazy"
                    onError={(e) => {
                    try {
                        const el = e && e.target;
                        if (!el) return;
                        if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = '/images/default.jpg';
                        }
                    } catch (err) { void err; }
                    }}
                />
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Lấy URL hình ảnh banner
  const getBannerImageUrl = (banner) => {
    if (!banner || !banner.duong_dan) return '/uploads/products/default.jpg';
    
    let imagePath = banner.duong_dan;
    
    // Nếu đã là URL tuyệt đối, trả về nguyên
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Với đường dẫn tương đối, thêm tiền tố API base
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const baseUrl = apiBase.replace('/api', '');
    
    // Dọn dẹp đường dẫn - loại bỏ dấu gạch chéo đầu và thêm một dấu
    const cleanPath = imagePath.replace(/^\/+/, '/');
    
    return baseUrl + cleanPath;
  };

  // Lấy banner theo chỉ số (lặp qua tất cả các banner)
  const getBannerByIndex = (offset) => {
    if (!banners || banners.length === 0) return null;
    const index = (currentIndex + offset) % banners.length;
    return banners[index];
  };

  // Lấy banner trái và phải
  const bannerLeft = getBannerByIndex(0);
  const bannerRight = getBannerByIndex(1);

  return (
    <div className="banner-slider">
        {/* Banner trái với cả mũi tên và chấm */}
        <div className="banner-left">
            {banners && banners.length > 0 && (
              <>
                <button
                  className="banner-arrow banner-arrow-left"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                  title="Ảnh trước"
                  aria-label="Previous banner"
                >
                  ❮
                </button>
                <button
                  className="banner-arrow banner-arrow-right"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                  title="Ảnh tiếp theo"
                  aria-label="Next banner"
                >
                  ❯
                </button>
              </>
            )}
            <div className="banner-main">
                <a href={bannerLeft.link || '#'} title={bannerLeft.tieu_de} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img
                    src={getBannerImageUrl(bannerLeft)}
                    alt={bannerLeft.tieu_de}
                    loading="lazy"
                    onError={(e) => {
                    try {
                        const el = e && e.target;
                        if (!el) return;
                        if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = '/uploads/products/default.jpg';
                        }
                    } catch (err) { void err; }
                    }}
                />
                </a>
            </div>
            {/* Chấm cho Banner Trái */}
            {banners && banners.length > 0 && (
              <div className="banner-dots banner-dots-left">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    title={`Xem ảnh ${index + 1}`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
        </div>
        {bannerRight && (
        <div className="banner-right">
            {banners && banners.length > 0 && (
              <>
                <button
                  className="banner-arrow banner-arrow-left"
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                  title="Ảnh trước"
                  aria-label="Previous banner"
                >
                  ❮
                </button>
                <button
                  className="banner-arrow banner-arrow-right"
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                  title="Ảnh tiếp theo"
                  aria-label="Next banner"
                >
                  ❯
                </button>
              </>
            )}
            <div className="banner-main">
                <a href={bannerRight.link || '#'} title={bannerRight.tieu_de} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img
                    src={getBannerImageUrl(bannerRight)}
                    alt={bannerRight.tieu_de}
                    loading="lazy"
                    onError={(e) => {
                    try {
                        const el = e && e.target;
                        if (!el) return;
                        if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = '/uploads/products/default.jpg';
                        }
                    } catch (err) { void err; }
                    }}
                />
                </a>
            </div>
            {/* Chấm cho Banner Phải */}
            {banners && banners.length > 0 && (
              <div className="banner-dots banner-dots-right">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    title={`Xem ảnh ${index + 1}`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
        </div>
        )}
        <div className="banner-bottom">
            <div className="banner-main">
                <div 
                    onClick={() => window.location.href = '/edu-verification'}
                    style={{ display: 'block', width: 'auto', height: '100%' }}
                    title="Xác thực học sinh để nhận giảm giá"
                >
                <img
                    src="/images/banner-laptop-edu.png"
                    style={{ cursor: 'pointer', width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    alt="Banner Edu Verification"
                    loading="lazy"
                    onError={(e) => {
                    try {
                        const el = e && e.target;
                        if (!el) return;
                        if (!el.dataset.fallback) {
                        el.dataset.fallback = '1';
                        el.src = '/images/default.jpg';
                        }
                    } catch (err) { void err; }
                    }}
                />
                </div>
            </div>
        </div>
    </div>
  );
}
