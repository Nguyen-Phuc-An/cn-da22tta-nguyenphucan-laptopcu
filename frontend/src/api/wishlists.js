import { apiFetch } from '../services/apiClient';

// Thêm sản phẩm vào danh sách yêu thích
export function addToWishlist(payload) {
	return apiFetch('/wishlists', { method: 'POST', body: payload });
}
// Lấy danh sách yêu thích của người dùng
export function listWishlist(userId) {
	return apiFetch(`/users/${userId}/wishlists`);
}
// Xóa sản phẩm khỏi danh sách yêu thích
export function removeFromWishlist(userId, productId) {
	return apiFetch(`/users/${userId}/wishlists/${productId}`, { method: 'DELETE' });
}
