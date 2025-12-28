import React, { useState, useEffect } from 'react';
import { getActiveBanners } from '../services/banners';
import './BannerSlider.css';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Auto-slide banner every 5 seconds
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners]);

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
    if (!banner || !banner.duong_dan) return '/uploads/products/default.jpg';
    
    let imagePath = banner.duong_dan;
    
    // If it's already absolute URL, return as-is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // For relative paths, prepend API base
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    const baseUrl = apiBase.replace('/api', '');
    
    // Clean up path - remove leading slashes and add one
    const cleanPath = imagePath.replace(/^\/+/, '/');
    
    return baseUrl + cleanPath;
  };

  // Get banner by index (cycling through all banners)
  const getBannerByIndex = (offset) => {
    if (!banners || banners.length === 0) return null;
    const index = (currentIndex + offset) % banners.length;
    return banners[index];
  };

  const bannerLeft = getBannerByIndex(0);
  const bannerRight = getBannerByIndex(1);

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
