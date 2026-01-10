const db = require('../db');
// Tải lên hình ảnh người dùng mới
async function uploadUserImage({ nguoi_dung_id, duong_dan, la_chinh = true }) {
  // Nếu đánh dấu là chính, bỏ đánh dấu các hình khác
  if (la_chinh) {
    await db.query('UPDATE users_images SET la_chinh = 0 WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  }
  
  const [res] = await db.query(
    'INSERT INTO users_images (nguoi_dung_id, duong_dan, la_chinh) VALUES (?, ?, ?)',
    [nguoi_dung_id, duong_dan, la_chinh ? 1 : 0]
  );
  return res.insertId;
}
// Lấy tất cả hình ảnh của người dùng
async function getUserImages(nguoi_dung_id) {
  const [rows] = await db.query(
    'SELECT id, nguoi_dung_id, duong_dan, la_chinh, tao_luc FROM users_images WHERE nguoi_dung_id = ? ORDER BY la_chinh DESC, tao_luc DESC',
    [nguoi_dung_id]
  );
  return Array.isArray(rows) ? rows : [];
}
// Lấy hình ảnh chính của người dùng
async function getMainUserImage(nguoi_dung_id) {
  const [rows] = await db.query(
    'SELECT id, duong_dan FROM users_images WHERE nguoi_dung_id = ? AND la_chinh = 1 LIMIT 1',
    [nguoi_dung_id]
  );
  return rows[0] || null;
}
// Đặt một hình ảnh là chính
async function setMainImage(id, nguoi_dung_id) {
  // Bỏ đánh dấu tất cả hình ảnh chính của người dùng này
  await db.query('UPDATE users_images SET la_chinh = 0 WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  // Đánh dấu hình ảnh này là chính
  const [res] = await db.query('UPDATE users_images SET la_chinh = 1 WHERE id = ? AND nguoi_dung_id = ?', [id, nguoi_dung_id]);
  return res.affectedRows > 0;
}
// Xóa hình ảnh người dùng theo ID
async function deleteUserImage(id, nguoi_dung_id) {
  const [res] = await db.query('DELETE FROM users_images WHERE id = ? AND nguoi_dung_id = ?', [id, nguoi_dung_id]);
  return res.affectedRows > 0;
}
// Đặt lại tất cả hình ảnh của người dùng thành không chính
async function resetMainImages(nguoi_dung_id) {
  const [res] = await db.query('UPDATE users_images SET la_chinh = 0 WHERE nguoi_dung_id = ?', [nguoi_dung_id]);
  return res.affectedRows > 0;
}
// Xóa tất cả hình ảnh của người dùng
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
