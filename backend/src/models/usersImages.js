const db = require('../db');

async function uploadUserImage({ nguoi_dung_id, duong_dan, la_chinh = true }) {
  // If marking as main, unmark others
  if (la_chinh) {
    await db.query('UPDATE users_images SET la_chinh = 0 WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  }
  
  const [res] = await db.query(
    'INSERT INTO users_images (nguoi_dung_id, duong_dan, la_chinh) VALUES (?, ?, ?)',
    [nguoi_dung_id, duong_dan, la_chinh ? 1 : 0]
  );
  return res.insertId;
}

async function getUserImages(nguoi_dung_id) {
  const [rows] = await db.query(
    'SELECT id, nguoi_dung_id, duong_dan, la_chinh, tao_luc FROM users_images WHERE nguoi_dung_id = ? ORDER BY la_chinh DESC, tao_luc DESC',
    [nguoi_dung_id]
  );
  return Array.isArray(rows) ? rows : [];
}

async function getMainUserImage(nguoi_dung_id) {
  const [rows] = await db.query(
    'SELECT id, duong_dan FROM users_images WHERE nguoi_dung_id = ? AND la_chinh = 1 LIMIT 1',
    [nguoi_dung_id]
  );
  return rows[0] || null;
}

async function setMainImage(id, nguoi_dung_id) {
  // Unmark all images for this user
  await db.query('UPDATE users_images SET la_chinh = 0 WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  // Mark this one as main
  const [res] = await db.query('UPDATE users_images SET la_chinh = 1 WHERE id = ? AND nguoi_dung_id = ?', [id, nguoi_dung_id]);
  return res.affectedRows > 0;
}

async function deleteUserImage(id, nguoi_dung_id) {
  const [res] = await db.query('DELETE FROM users_images WHERE id = ? AND nguoi_dung_id = ?', [id, nguoi_dung_id]);
  return res.affectedRows > 0;
}

async function resetMainImages(nguoi_dung_id) {
  const [res] = await db.query('UPDATE users_images SET la_chinh = 0 WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  return res.affectedRows > 0;
}

async function deleteAllUserImages(nguoi_dung_id) {
  const [res] = await db.query('DELETE FROM users_images WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  return res.affectedRows > 0;
}

module.exports = {
  uploadUserImage,
  getUserImages,
  getMainUserImage,
  setMainImage,
  deleteUserImage,
  resetMainImages,
  deleteAllUserImages
};
