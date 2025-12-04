// Product images helpers — pure data helpers, no HTTP calls here.

export function imageToSrc(img = {}) {
  // Prefer absolute/full URL if present, then normalized url; otherwise fallback to filename
  const url = img.full_url || img.fullUrl || img.url || img.duong_dan || null;
  if (url) {
    // if already absolute, return as-is
    if (/^https?:\/\//i.test(url)) return url;
    // ensure leading slash for relative paths so browser resolves from origin
    const rel = url.startsWith('/') ? url : ('/' + url.replace(/^\/+/, ''));
    // if an API base is configured, serve relative uploads from the API origin
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      if (apiBase) {
        const origin = apiBase.replace(/\/api\/?$/i, '') || apiBase;
        return origin.replace(/\/$/, '') + rel;
      }
    } catch (e) { void e; }
    return rel;
  }
  return `/uploads/products/${img.ten_file || img.filename || 'default.jpg'}`;
}

export function normalizeImage(img = {}) {
  return {
    id: img.id || img.ma || null,
    filename: img.ten_file || img.filename || null,
    url: img.url || img.fullUrl || null,
    createdAt: img.created_at || img.createdAt || null,
    ...img
  };
}

export function normalizeImages(list = []) {
  return (list || []).map(normalizeImage);
}