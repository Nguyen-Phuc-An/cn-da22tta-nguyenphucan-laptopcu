const db = require('../db');
// Tạo người dùng mới
async function createUser({ email, name, passwordHash, role = 'customer', phone = null, address = null }) {
  const [res] = await db.query('INSERT INTO users (email, ten, mat_khau, vai_tro, dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)', [email, name, passwordHash, role, phone, address]);
  return res.insertId;
}
// Lấy thông tin người dùng theo ID
async function getUserById(id) {
  const [rows] = await db.query('SELECT id, email, ten AS name, mat_khau, vai_tro AS role, dien_thoai AS phone, dia_chi AS address, tao_luc AS created_at, cap_nhat_luc AS updated_at, edu_verified, edu_email, edu_mssv, edu_cccd, edu_school FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}
// Lấy danh sách tất cả người dùng
async function listUsers() {
  const [rows] = await db.query('SELECT id, email, ten AS name, vai_tro AS role, dien_thoai AS phone, dia_chi AS address, tao_luc AS created_at, cap_nhat_luc AS updated_at FROM users ORDER BY id DESC');
  return Array.isArray(rows) ? rows : [];
}
// Lấy thông tin người dùng theo email
async function getUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}
// Cập nhật thông tin người dùng
async function updateUser(id, { name, passwordHash, role, phone, address }) {
  const sets = [];
  const vals = [];
  if (name !== undefined) { sets.push('ten = ?'); vals.push(name); }
  if (passwordHash !== undefined) { sets.push('mat_khau = ?'); vals.push(passwordHash); }
  if (role !== undefined) { sets.push('vai_tro = ?'); vals.push(role); }
  if (phone !== undefined) { sets.push('dien_thoai = ?'); vals.push(phone); }
  if (address !== undefined) { sets.push('dia_chi = ?'); vals.push(address); }
  if (!sets.length) return false;
  vals.push(id);
  await db.query('UPDATE users SET ' + sets.join(', ') + ' WHERE id = ?', vals);
  return true;
}
// Vô hiệu hóa người dùng
async function deactivateUser(id) {
  await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
  return true;
}

module.exports = { createUser, getUserById, getUserByEmail, updateUser, deactivateUser, listUsers };
