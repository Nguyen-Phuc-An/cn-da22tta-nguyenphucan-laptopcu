import { apiFetch, API_BASE, getAuthHeader } from '../services/apiClient';

export function listProducts(params = {}) {
	const qs = new URLSearchParams(params).toString();
	return apiFetch('/products' + (qs ? `?${qs}` : ''));
}

export function getProduct(id) {
	return apiFetch(`/products/${id}`);
}

export function createProduct(payload) {
	return apiFetch('/products', { method: 'POST', body: payload });
}

export function updateProduct(id, payload) {
	return apiFetch(`/products/${id}`, { method: 'PUT', body: payload });
}

export function deleteProduct(id) {
	return apiFetch(`/products/${id}`, { method: 'DELETE' });
}

export async function uploadProductImages(productId, files = []) {
	const form = new FormData();
	files.forEach(f => form.append('images', f));
	const headers = getAuthHeader();
	const res = await fetch(API_BASE + `/products/${productId}/images`, {
		method: 'POST',
		headers,
		body: form
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

// backward-compatible aliases
export { listProducts as getProducts };
