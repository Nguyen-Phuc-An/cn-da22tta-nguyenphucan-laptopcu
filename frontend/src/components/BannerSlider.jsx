import React, { useState, useEffect } from 'react';
import { getActiveBanners } from '../services/banners';
import './BannerSlider.css';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);

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

  if (!banners || banners.length === 0) {
    console.log('[BannerSlider] No active banners from backend, showing fallback');
    // Fallback: show only banner-bottom when no banners from backend
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

  // Get banner image URL
  const getBannerImageUrl = (banner) => {
    if (!banner) return '/uploads/products/default.jpg';
    
    // Banner image is stored in duong_dan field
    let imagePath = banner.duong_dan || banner.url || '';
    if (!imagePath) return '/uploads/products/default.jpg';
    
    // If it's a relative path, prepend API base
    if (!imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      // Remove /api from base if present
      const baseUrl = apiBase.replace('/api', '');
      imagePath = `${baseUrl}/${imagePath}`;
    }
    return imagePath;
  };

  // Get first and second banner from backend
  const bannerLeft = banners[0];
  const bannerRight = banners.length > 1 ? banners[1] : null;

  return (
    <div className="banner-slider">
        <div className="banner-left">
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
        </div>
        {bannerRight && (
        <div className="banner-right">
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
