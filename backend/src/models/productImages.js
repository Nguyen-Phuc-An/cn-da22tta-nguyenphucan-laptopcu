const db = require('../db');

async function addImages(productId, images = []) {
  if (!images.length) return [];
  const vals = images.map(img => [productId, img]);
  // bulk insert
  const [res] = await db.query('INSERT INTO product_images (san_pham_id, duong_dan) VALUES ?', [vals]);
  return res.insertId;
}

async function getImagesByProduct(productId) {
  const [rows] = await db.query('SELECT id, san_pham_id AS product_id, duong_dan AS url, la_chinh AS is_main, tao_luc FROM product_images WHERE san_pham_id = ? ORDER BY tao_luc', [productId]);
  return rows;
}

async function getImageById(id) {
  const [rows] = await db.query('SELECT * FROM product_images WHERE id = ?', [id]);
  return rows[0] || null;
}

async function deleteImageById(id) {
  await db.query('DELETE FROM product_images WHERE id = ?', [id]);
  return true;
}

async function countImagesForProduct(productId) {
  const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM product_images WHERE san_pham_id = ?', [productId]);
  return rows[0] ? Number(rows[0].cnt) : 0;
}

module.exports = { addImages, getImagesByProduct, getImageById, deleteImageById, countImagesForProduct };

