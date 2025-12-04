import { apiFetch } from '../services/apiClient';

export function createUser(payload) {
	return apiFetch('/users', { method: 'POST', body: payload });
}

export function getUser(id) {
	return apiFetch(`/users/${id}`);
}

export function updateUser(id, payload) {
	return apiFetch(`/users/${id}`, { method: 'PUT', body: payload });
}

export function deleteUser(id) {
	return apiFetch(`/users/${id}`, { method: 'DELETE' });
}
