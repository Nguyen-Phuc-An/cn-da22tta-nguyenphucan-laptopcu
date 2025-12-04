import { apiFetch, API_BASE, getAuthHeader } from '../services/apiClient';

export function listImages(productId) {
	return apiFetch(`/products/${productId}/images`);
}

export function deleteImage(productId, id) {
	return apiFetch(`/products/${productId}/images/${id}`, { method: 'DELETE' });
}

export async function uploadImages(productId, files = []) {
	const fd = new FormData();
	files.forEach(f => fd.append('images', f));
	const headers = getAuthHeader();
	const res = await fetch(API_BASE + `/products/${productId}/images`, { method: 'POST', headers, body: fd });
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}
