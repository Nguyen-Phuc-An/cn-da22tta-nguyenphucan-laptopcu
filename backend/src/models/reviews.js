const db = require('../db');

async function createOrUpdateReview({ product_id, user_id, rating, title = null, body = null }) {
  const [res] = await db.query(
    `INSERT INTO reviews (san_pham_id, khach_hang_id, diem, tieu_de, noi_dung)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE diem = VALUES(diem), tieu_de = VALUES(tieu_de), noi_dung = VALUES(noi_dung), cap_nhat_luc = CURRENT_TIMESTAMP`,
    [product_id, user_id, rating, title, body]
  );
  return res.insertId || true;
}

async function getReviewsByProduct(productId) {
  const [rows] = await db.query(
    `SELECT r.*, u.ten as user_name FROM reviews r LEFT JOIN users u ON r.khach_hang_id = u.id WHERE r.san_pham_id = ? ORDER BY tao_luc DESC`,
    [productId]
  );
  return rows;
}

async function deleteReview(product_id, user_id) {
  await db.query('DELETE FROM reviews WHERE san_pham_id = ? AND khach_hang_id = ?', [product_id, user_id]);
  return true;
}

module.exports = { createOrUpdateReview, getReviewsByProduct, deleteReview };
