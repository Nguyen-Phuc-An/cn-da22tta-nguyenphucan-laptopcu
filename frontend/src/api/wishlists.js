import { apiFetch } from '../services/apiClient';

export function addToWishlist(payload) {
	return apiFetch('/wishlists', { method: 'POST', body: payload });
}

export function listWishlist(userId) {
	return apiFetch(`/users/${userId}/wishlists`);
}

export function removeFromWishlist(userId, productId) {
	return apiFetch(`/users/${userId}/wishlists/${productId}`, { method: 'DELETE' });
}
