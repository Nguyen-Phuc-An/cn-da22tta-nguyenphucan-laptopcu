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

// Lấy danh sách sản phẩm từ đơn hàng đã hoàn thành mà chưa review
async function getPendingReviewsForUser(userId) {
  console.log('[reviews.getPendingReviewsForUser] Getting reviews for user:', userId);
  
  // First, check what orders exist for this user
  const [userOrders] = await db.query(
    'SELECT id, trang_thai FROM orders WHERE khach_hang_id = ? ORDER BY id DESC LIMIT 5',
    [userId]
  );
  console.log('[reviews.getPendingReviewsForUser] User orders:', userOrders);
  
  const sql = `SELECT 
      p.id,
      p.tieu_de,
      p.gia,
      COALESCE(
        (SELECT duong_dan FROM product_images WHERE san_pham_id = p.id AND la_chinh = 1 LIMIT 1),
        (SELECT duong_dan FROM product_images WHERE san_pham_id = p.id LIMIT 1),
        ''
      ) as hinhanh,
      CASE WHEN MAX(r.id) IS NOT NULL THEN 1 ELSE 0 END as da_review,
      MAX(r.diem) as rating,
      MAX(r.tieu_de) as review_title,
      MAX(r.noi_dung) as review_content,
      MAX(o.cap_nhat_luc) as cap_nhat_luc
    FROM order_items oi
    JOIN products p ON oi.san_pham_id = p.id
    JOIN orders o ON oi.don_hang_id = o.id
    LEFT JOIN reviews r ON p.id = r.san_pham_id AND r.khach_hang_id = ?
    WHERE o.khach_hang_id = ? AND o.trang_thai = 'completed'
    GROUP BY p.id
    ORDER BY cap_nhat_luc DESC`;
  
  console.log('[reviews.getPendingReviewsForUser] SQL:', sql);
  const [rows] = await db.query(sql, [userId, userId]);
  console.log('[reviews.getPendingReviewsForUser] Found', rows.length, 'rows with completed status');
  
  // If no completed orders, also try other possible statuses for debugging
  if (rows.length === 0) {
    const [allOrders] = await db.query(
      `SELECT DISTINCT p.id, p.tieu_de, o.trang_thai
       FROM order_items oi
       JOIN products p ON oi.san_pham_id = p.id
       JOIN orders o ON oi.don_hang_id = o.id
       WHERE o.khach_hang_id = ?
       LIMIT 5`,
      [userId]
    );
    console.log('[reviews.getPendingReviewsForUser] All user products with their order statuses:', allOrders);
  }
  
  return rows;
}

module.exports = { createOrUpdateReview, getReviewsByProduct, deleteReview, getPendingReviewsForUser };
