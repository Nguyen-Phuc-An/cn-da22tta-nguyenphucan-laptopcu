import { apiFetch } from '../services/apiClient';

export function listCategories() {
	return apiFetch('/categories');
}

export function getCategory(id) {
	return apiFetch(`/categories/${id}`);
}

export function createCategory(payload) {
	return apiFetch('/categories', { method: 'POST', body: payload });
}

export function updateCategory(id, payload) {
	return apiFetch(`/categories/${id}`, { method: 'PUT', body: payload });
}

export function deleteCategory(id) {
	return apiFetch(`/categories/${id}`, { method: 'DELETE' });
}
