import { API_BASE, getToken } from '../services/apiClient';

export async function listActiveBanners() {
  const res = await fetch(`${API_BASE}/banners/active`);
  if (!res.ok) throw new Error(`Failed to fetch banners: ${res.status}`);
  return res.json();
}

export async function listBanners() {
  const res = await fetch(`${API_BASE}/banners`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch banners: ${res.status}`);
  return res.json();
}

export async function createBanner(payload) {
  // If payload has a file, use FormData instead of JSON
  if (payload.file) {
    const formData = new FormData();
    formData.append('tieu_de', payload.tieu_de);
    formData.append('link', payload.link || '');
    formData.append('vi_tri', payload.vi_tri || 0);
    formData.append('trang_thai', payload.trang_thai || 'active');
    formData.append('hinh_anh', payload.file);

    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    });
    if (!res.ok) throw new Error(`Failed to create banner: ${res.status}`);
    return res.json();
  }

  // Otherwise use JSON (if duong_dan is provided directly)
  const res = await fetch(`${API_BASE}/banners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create banner: ${res.status}`);
  return res.json();
}

export async function updateBanner(id, payload) {
  // If payload has a file, use FormData
  if (payload.file) {
    const formData = new FormData();
    formData.append('tieu_de', payload.tieu_de);
    formData.append('link', payload.link || '');
    formData.append('vi_tri', payload.vi_tri || 0);
    formData.append('trang_thai', payload.trang_thai || 'active');
    formData.append('hinh_anh', payload.file);

    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    });
    if (!res.ok) throw new Error(`Failed to update banner: ${res.status}`);
    return res.json();
  }

  // Otherwise use JSON
  const res = await fetch(`${API_BASE}/banners/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to update banner: ${res.status}`);
  return res.json();
}

export async function deleteBanner(id) {
  const res = await fetch(`${API_BASE}/banners/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error(`Failed to delete banner: ${res.status}`);
  return res.json();
}
