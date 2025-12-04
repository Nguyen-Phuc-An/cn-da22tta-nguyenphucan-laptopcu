const db = require('../db');

async function addToWishlist(user_id, product_id) {
  await db.query('INSERT IGNORE INTO wishlists (khach_hang_id, san_pham_id) VALUES (?, ?)', [user_id, product_id]);
  return true;
}

async function removeFromWishlist(user_id, product_id) {
  await db.query('DELETE FROM wishlists WHERE khach_hang_id = ? AND san_pham_id = ?', [user_id, product_id]);
  return true;
}

async function listWishlist(user_id) {
  const [rows] = await db.query(
    `SELECT w.*, p.tieu_de AS title, p.gia AS price FROM wishlists w JOIN products p ON w.san_pham_id = p.id WHERE w.khach_hang_id = ? ORDER BY w.tao_luc DESC`,
    [user_id]
  );
  return rows;
}

module.exports = { addToWishlist, removeFromWishlist, listWishlist };