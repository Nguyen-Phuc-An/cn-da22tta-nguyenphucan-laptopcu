const db = require('../db');
// Thêm hình ảnh cho sản phẩm
async function addImages(productId, images = []) {
  if (!images.length) return [];
  const vals = images.map(img => [productId, img]);
  // Sử dụng INSERT với nhiều giá trị
  const [res] = await db.query('INSERT INTO product_images (san_pham_id, duong_dan) VALUES ?', [vals]);
  return res.insertId;
}
// Lấy tất cả hình ảnh của một sản phẩm
async function getImagesByProduct(productId) {
  const [rows] = await db.query('SELECT id, san_pham_id AS product_id, duong_dan AS url, la_chinh AS is_main, tao_luc FROM product_images WHERE san_pham_id = ? ORDER BY tao_luc', [productId]);
  return rows;
}
// Lấy thông tin một hình ảnh theo ID
async function getImageById(id) {
  const [rows] = await db.query('SELECT * FROM product_images WHERE id = ?', [id]);
  return rows[0] || null;
}
// Xóa hình ảnh theo ID
async function deleteImageById(id) {
  await db.query('DELETE FROM product_images WHERE id = ?', [id]);
  return true;
}
// Đếm số hình ảnh của một sản phẩm
async function countImagesForProduct(productId) {
  const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM product_images WHERE san_pham_id = ?', [productId]);
  return rows[0] ? Number(rows[0].cnt) : 0;
}

module.exports = { addImages, getImagesByProduct, getImageById, deleteImageById, countImagesForProduct };

