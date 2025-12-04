import { apiFetch } from '../services/apiClient';

export function createOrder(payload) {
	return apiFetch('/orders', { method: 'POST', body: payload });
}

export function getOrder(id) {
	return apiFetch(`/orders/${id}`);
}

export function listOrdersForUser(userId, params = {}) {
	const qs = new URLSearchParams(params).toString();
	return apiFetch(`/users/${userId}/orders` + (qs ? `?${qs}` : ''));
}

export function updateOrderStatus(id, status) {
	return apiFetch(`/orders/${id}/status`, { method: 'PUT', body: { status } });
}

export function deleteOrder(id) {
	return apiFetch(`/orders/${id}`, { method: 'DELETE' });
}
