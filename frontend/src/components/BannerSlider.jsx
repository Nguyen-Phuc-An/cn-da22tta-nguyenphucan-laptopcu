import React, { useState, useEffect } from 'react';
import { getActiveBanners } from '../services/banners';
import { imageToSrc } from '../services/productImages';
import './BannerSlider.css';

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data || []);
      } catch (err) {
        console.error('Error loading banners:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!banners || banners.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4000); // Slide change every 4 seconds

    return () => clearInterval(timer);
  }, [banners]);

  if (loading) return <div className="banner-slider"><div className="banner-loading">Đang tải banner...</div></div>;
  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  return (
    <div className="banner-slider">
        <div className="banner-left">
            <div className="banner-main">
                <a href={current.link || '#'} title={current.tieu_de} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img
                    src={imageToSrc(current)}
                    alt={current.tieu_de}
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                </a>
            </div>
            {banners.length > 1 && (
                <div className="banner-controls">
                <button
                    className="banner-prev"
                    onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
                >
                    ❮
                </button>
                <button
                    className="banner-next"
                    onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
                >
                    ❯
                </button>
                </div>
            )}

            {banners.length > 1 && (
                <div className="banner-dots">
                {banners.map((_, idx) => (
                    <button
                    key={idx}
                    className={`dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Slide ${idx + 1}`}
                    />
                ))}
                </div>
            )}
        </div>
        <div className="banner-right">
            <div className="banner-main">
                <a href={current.link || '#'} title={current.tieu_de} style={{ display: 'block', width: '100%', height: '100%' }}>
                <img
                    src={imageToSrc(current)}
                    alt={current.tieu_de}
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                </a>
            </div>
            {banners.length > 1 && (
                <div className="banner-controls">
                <button
                    className="banner-prev"
                    onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
                >
                    ❮
                </button>
                <button
                    className="banner-next"
                    onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
                >
                    ❯
                </button>
                </div>
            )}

            {banners.length > 1 && (
                <div className="banner-dots">
                {banners.map((_, idx) => (
                    <button
                    key={idx}
                    className={`dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Slide ${idx + 1}`}
                    />
                ))}
                </div>
            )}
        </div>  
    </div>
  );
}
