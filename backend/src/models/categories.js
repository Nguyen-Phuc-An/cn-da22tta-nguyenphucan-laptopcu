const db = require('../db');

async function createCategory(payload = {}) {
  const name = payload.ten || payload.name || null;
  const parent_id = payload.danh_muc_cha_id ?? payload.parent_id ?? null;
  const [res] = await db.query('INSERT INTO categories (ten, danh_muc_cha_id) VALUES (?, ?)', [name, parent_id]);
  return res.insertId;
}

async function getCategoryById(id) {
  const [rows] = await db.query('SELECT id, ten, danh_muc_cha_id, tao_luc, cap_nhat_luc FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

async function listCategories() {
  const [rows] = await db.query('SELECT id, ten, danh_muc_cha_id, tao_luc, cap_nhat_luc FROM categories ORDER BY danh_muc_cha_id IS NOT NULL, ten');
  return rows;
}

async function updateCategory(id, payload = {}) {
  const sets = [];
  const vals = [];
  if (payload.ten !== undefined) { sets.push('ten = ?'); vals.push(payload.ten); }
  if (payload.danh_muc_cha_id !== undefined) { sets.push('danh_muc_cha_id = ?'); vals.push(payload.danh_muc_cha_id); }
  if (!sets.length) return false;
  vals.push(id);
  await db.query('UPDATE categories SET ' + sets.join(', ') + ' WHERE id = ?', vals);
  return true;
}

async function deleteCategory(id) {
  await db.query('DELETE FROM categories WHERE id = ?', [id]);
  return true;
}

module.exports = { createCategory, getCategoryById, listCategories, updateCategory, deleteCategory };