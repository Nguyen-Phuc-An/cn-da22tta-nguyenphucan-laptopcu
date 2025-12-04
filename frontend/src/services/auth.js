// Auth services: only helpers and payload normalization.

export function prepareLoginPayload(emailOrPayload, password) {
  return (typeof emailOrPayload === 'object' && emailOrPayload !== null)
    ? emailOrPayload
    : { email: emailOrPayload, password };
}

export function prepareRegisterPayload(payload) {
  return payload;
}

export function normalizeUser(user = {}) {
  return {
    id: user.id || user.ma || null,
    name: user.ten || user.name || user.fullName || null,
    email: user.email || null,
    phone: user.phone || user.sdt || null,
    address: user.address || user.dia_chi || null,
    ...user
  };
}