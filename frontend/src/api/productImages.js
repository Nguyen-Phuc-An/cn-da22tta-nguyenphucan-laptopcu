import { apiFetch, API_BASE } from '../services/apiClient';
// Lấy danh sách hình ảnh của sản phẩm
export function listImages(productId) {
	return apiFetch(`/products/${productId}/images`);
}
// Xóa hình ảnh sản phẩm
export function deleteImage(productId, id) {
	return apiFetch(`/products/${productId}/images/${id}`, { method: 'DELETE' });
}
// Tải lên hình ảnh cho sản phẩm
export async function uploadImages(productId, files = []) {
	const fd = new FormData();
	files.forEach(f => fd.append('images', f));
	return apiFetch(`/products/${productId}/images`, {
		method: 'POST',
		body: fd
	});
}
