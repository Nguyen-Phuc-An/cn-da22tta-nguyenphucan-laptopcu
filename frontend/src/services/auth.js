// Chuẩn bị dữ liệu đăng nhập
export function prepareLoginPayload(emailOrPayload, password) {
  return (typeof emailOrPayload === 'object' && emailOrPayload !== null)
    ? emailOrPayload
    : { email: emailOrPayload, password };
}
// Chuẩn bị dữ liệu đăng ký
export function prepareRegisterPayload(payload) {
  return payload;
}
// Chuẩn hóa dữ liệu người dùng
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