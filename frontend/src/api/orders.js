import { apiFetch } from '../services/apiClient';
// Tạo đơn hàng mới
export function createOrder(payload) {
	return apiFetch('/orders', { method: 'POST', body: payload });
}
// Lấy danh sách đơn hàng với tham số lọc
export function getOrder(id) {
	return apiFetch(`/orders/${id}`);
}
// Lấy danh sách đơn hàng với tham số lọc
export function listOrdersForUser(userId, params = {}) {
	const qs = new URLSearchParams(params).toString();
	return apiFetch(`/users/${userId}/orders` + (qs ? `?${qs}` : ''));
}
// Lấy danh sách đơn hàng (admin)
export function updateOrderStatus(id, status) {
	return apiFetch(`/orders/${id}/status`, { method: 'PUT', body: { status } });
}
// Xóa đơn hàng (admin)
export function deleteOrder(id) {
	return apiFetch(`/orders/${id}`, { method: 'DELETE' });
}
