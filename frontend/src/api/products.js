import { apiFetch, API_BASE, getAuthHeader } from '../services/apiClient';
// Lấy danh sách sản phẩm với tham số lọc
export function listProducts(params = {}) {
	const qs = new URLSearchParams(params).toString();
	return apiFetch('/products' + (qs ? `?${qs}` : ''));
}
// Lấy thông tin sản phẩm theo ID
export function getProduct(id) {
	return apiFetch(`/products/${id}`);
}
// Tạo sản phẩm mới
export function createProduct(payload) {
	return apiFetch('/products', { method: 'POST', body: payload });
}
// Cập nhật sản phẩm
export function updateProduct(id, payload) {
	return apiFetch(`/products/${id}`, { method: 'PUT', body: payload });
}
// Xóa sản phẩm
export function deleteProduct(id) {
	return apiFetch(`/products/${id}`, { method: 'DELETE' });
}
// Tải lên hình ảnh cho sản phẩm
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
// Xuất hàm lấy danh sách sản phẩm với tên khác
export { listProducts as getProducts };
