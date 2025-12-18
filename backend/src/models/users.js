const db = require('../db');

async function createUser({ email, name, passwordHash, role = 'customer', phone = null, address = null }) {
  const [res] = await db.query('INSERT INTO users (email, ten, mat_khau, vai_tro, dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)', [email, name, passwordHash, role, phone, address]);
  return res.insertId;
}

async function getUserById(id) {
  const [rows] = await db.query('SELECT id, email, ten AS name, mat_khau AS mat_khau, vai_tro AS role, dien_thoai AS phone, dia_chi AS address, tao_luc AS created_at, cap_nhat_luc AS updated_at FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function listUsers() {
  const [rows] = await db.query('SELECT id, email, ten AS name, vai_tro AS role, dien_thoai AS phone, dia_chi AS address, tao_luc AS created_at, cap_nhat_luc AS updated_at FROM users ORDER BY id DESC');
  return Array.isArray(rows) ? rows : [];
}

async function getUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

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

async function deleteUser(id) {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
  return true;
}

module.exports = { createUser, getUserById, getUserByEmail, updateUser, deleteUser, listUsers };
