import { apiFetch } from '../services/apiClient';

export function createOrUpdateReview(payload) {
	return apiFetch('/reviews', { method: 'POST', body: payload });
}

export function listReviewsByProduct(productId, params = {}) {
	const qs = new URLSearchParams(params).toString();
	return apiFetch(`/products/${productId}/reviews` + (qs ? `?${qs}` : ''));
}

export function deleteReview(productId, userId) {
	return apiFetch(`/products/${productId}/reviews/${userId}`, { method: 'DELETE' });
}

