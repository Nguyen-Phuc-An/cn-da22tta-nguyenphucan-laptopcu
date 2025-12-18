import { apiFetch, setToken } from '../services/apiClient';

export async function register(payload) {
	const data = await apiFetch('/auth/register', { method: 'POST', body: payload });
	if (data && data.token) setToken(data.token);
	return data;
}

export async function login({ email, password }) {
	const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
	if (data && data.token) setToken(data.token);
	return data;
}

export function logout() {
	setToken(null);
}
