const db = require('../db');

// Orders model - single clean implementation
async function createOrder({ user_id, shipping_address = null, payment_method = null, items = [], currency = 'VND' }) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const total = items.reduce((s, it) => s + Number(it.unit_price) * Number(it.quantity), 0);
    const [resOrder] = await conn.query(
      'INSERT INTO orders (khach_hang_id, tong_tien, tien_te, dia_chi_giao_hang, phuong_thuc_thanh_toan) VALUES (?, ?, ?, ?, ?)',
      [user_id, total, currency, shipping_address, payment_method]
    );
    const orderId = resOrder.insertId;
    const itemValues = items.map(it => [orderId, it.product_id, it.quantity, it.unit_price, Number(it.unit_price) * Number(it.quantity)]);
    if (itemValues.length) {
      // mysql2 expects bulk inserts with (?), passing array of arrays
      await conn.query('INSERT INTO order_items (don_hang_id, san_pham_id, so_luong, don_gia, thanh_tien) VALUES ?', [itemValues]);
    }
    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getOrderById(id) {
  const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders[0]) return null;
  const [items] = await db.query('SELECT * FROM order_items WHERE don_hang_id = ?', [id]);
  return { ...orders[0], items };
}

async function listOrdersForUser(userId, { limit = 50, offset = 0 } = {}) {
  const [rows] = await db.query('SELECT * FROM orders WHERE khach_hang_id = ? ORDER BY tao_luc DESC LIMIT ? OFFSET ?', [userId, Number(limit), Number(offset)]);
  return rows;
}

async function updateOrderStatus(id, status) {
  await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  return true;
}

async function deleteOrder(id) {
  await db.query('DELETE FROM orders WHERE id = ?', [id]);
  return true;
}

module.exports = { createOrder, getOrderById, listOrdersForUser, updateOrderStatus, deleteOrder };
