import { apiFetch } from '../services/apiClient';
// Tạo người dùng mới
export function createUser(payload) {
	return apiFetch('/users', { method: 'POST', body: payload });
}
// Lấy thông tin người dùng theo ID
export function getUser(id) {
	return apiFetch(`/users/${id}`);
}
// Cập nhật thông tin người dùng
export function updateUser(id, payload) {
	return apiFetch(`/users/${id}`, { method: 'PUT', body: payload });
}
// Xóa người dùng
export function deleteUser(id) {
	return apiFetch(`/users/${id}`, { method: 'DELETE' });
}
