import { apiFetch } from '../services/apiClient';
// Lấy danh sách danh mục
export function listCategories() {
	return apiFetch('/categories');
}
// Lấy thông tin danh mục theo ID
export function getCategory(id) {
	return apiFetch(`/categories/${id}`);
}
// Tạo danh mục mới
export function createCategory(payload) {
	return apiFetch('/categories', { method: 'POST', body: payload });
}
// Cập nhật danh mục
export function updateCategory(id, payload) {
	return apiFetch(`/categories/${id}`, { method: 'PUT', body: payload });
}
// Xóa danh mục
export function deleteCategory(id) {
	return apiFetch(`/categories/${id}`, { method: 'DELETE' });
}
