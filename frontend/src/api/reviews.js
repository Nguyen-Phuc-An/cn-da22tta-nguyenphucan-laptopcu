import { apiFetch } from '../services/apiClient';
// Tạo hoặc cập nhật đánh giá sản phẩm
export function createOrUpdateReview(payload) {
	return apiFetch('/reviews', { method: 'POST', body: payload });
}
// Lấy danh sách đánh giá của sản phẩm với tham số lọc
export function listReviewsByProduct(productId, params = {}) {
	const qs = new URLSearchParams(params).toString();
	return apiFetch(`/products/${productId}/reviews` + (qs ? `?${qs}` : ''));
}
// Xóa đánh giá của người dùng cho sản phẩm
export function deleteReview(productId, userId) {
	return apiFetch(`/products/${productId}/reviews/${userId}`, { method: 'DELETE' });
}

