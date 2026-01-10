const db = require('../db');

// Tạo đơn hàng mới
async function createOrder({ 
  nguoi_dung_id, user_id, 
  ten_nguoi_nhan, 
  dien_thoai_nhan, 
  dia_chi_nhan, 
  shipping_address = null, 
  payment_method = null, 
  phuong_thuc_thanh_toan,
  ghi_chu = null,
  items = [], 
  chi_tiet_don_hang = [],
  currency = 'VND',
  tong_tien,
  giam_gia_edu = 0
}) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const userId = nguoi_dung_id || user_id;
    const orderItems = items.length > 0 ? items : chi_tiet_don_hang;
    const total = tong_tien || orderItems.reduce((s, it) => s + Number(it.unit_price || it.gia_tại_thời_điểm_mua || it.gia) * Number(it.quantity || it.so_luong), 0);
    const pmethod = phuong_thuc_thanh_toan || payment_method;
    const eduDiscount = giam_gia_edu || 0;
    const [resOrder] = await conn.query(
      'INSERT INTO orders (khach_hang_id, ten_nguoi_nhan, dien_thoai_nhan, dia_chi_nhan, tong_tien, giam_gia_edu, tien_te, phuong_thuc_thanh_toan, ghi_chu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, ten_nguoi_nhan, dien_thoai_nhan, dia_chi_nhan || shipping_address, total, eduDiscount, currency, pmethod, ghi_chu]
    );
    const orderId = resOrder.insertId;
    const itemValues = orderItems.map(it => [
      orderId, 
      it.san_pham_id || it.product_id, 
      it.so_luong || it.quantity, 
      it.gia_tại_thời_điểm_mua || it.unit_price || it.gia, 
      Number(it.gia_tại_thời_điểm_mua || it.unit_price || it.gia) * Number(it.so_luong || it.quantity)
    ]);
    if (itemValues.length) {
      // mysql2 expects bulk inserts with (?), passing array of arrays
      await conn.query('INSERT INTO order_items (don_hang_id, san_pham_id, so_luong, don_gia, thanh_tien) VALUES ?', [itemValues]);
      
      // Reduce product quantities for each ordered item
      for (const item of orderItems) {
        const productId = item.san_pham_id || item.product_id;
        const quantity = item.so_luong || item.quantity;
        
        // Get current product quantity
        const [product] = await conn.query(
          'SELECT so_luong FROM products WHERE id = ?',
          [productId]
        );
        
        if (product[0]) {
          const newQuantity = Math.max(0, product[0].so_luong - quantity);
          const newStatus = newQuantity === 0 ? 'sold' : 'available';
          
          // Update product quantity and status
          await conn.query(
            'UPDATE products SET so_luong = ?, trang_thai = ? WHERE id = ?',
            [newQuantity, newStatus, productId]
          );
        }
      }
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
// Lấy thông tin đơn hàng theo ID
async function getOrderById(id) {
  const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders[0]) return null;
  const [items] = await db.query(`
    SELECT 
      oi.id, oi.don_hang_id, oi.san_pham_id, oi.so_luong, oi.don_gia, oi.thanh_tien,
      p.tieu_de as ten, p.tieu_de, p.tinh_trang
    FROM order_items oi
    LEFT JOIN products p ON oi.san_pham_id = p.id
    WHERE oi.don_hang_id = ?
  `, [id]);
  return { ...orders[0], items };
}
// Lấy danh sách đơn hàng cho một người dùng
async function listOrdersForUser(userId, { limit = 50, offset = 0 } = {}) {
  const [rows] = await db.query('SELECT * FROM orders WHERE khach_hang_id = ? ORDER BY tao_luc DESC LIMIT ? OFFSET ?', [userId, Number(limit), Number(offset)]);
  
  // Lấy các mục cho mỗi đơn hàng
  const ordersWithItems = await Promise.all(
    rows.map(async (order) => {
      const [items] = await db.query(`
        SELECT 
          oi.id, oi.don_hang_id, oi.san_pham_id, oi.so_luong, oi.don_gia, oi.thanh_tien,
          p.tieu_de as ten, p.tieu_de, p.tinh_trang
        FROM order_items oi
        LEFT JOIN products p ON oi.san_pham_id = p.id
        WHERE oi.don_hang_id = ?
      `, [order.id]);
      return { ...order, items };
    })
  );
  
  return ordersWithItems;
}
// Lấy tất cả đơn hàng với tùy chọn lọc theo trạng thái
async function listAll({ limit = 100, offset = 0, status = null } = {}) {
  let query = 'SELECT * FROM orders';
  const params = [];
  
  if (status && status !== 'all') {
    query += ' WHERE trang_thai = ?';
    params.push(status);
  }
  
  query += ' ORDER BY tao_luc DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  
  const [rows] = await db.query(query, params);
  
  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    rows.map(async (order) => {
      const [items] = await db.query(`
        SELECT 
          oi.id, oi.don_hang_id, oi.san_pham_id, oi.so_luong, oi.don_gia, oi.thanh_tien,
          p.tieu_de as ten, p.tieu_de, p.tinh_trang
        FROM order_items oi
        LEFT JOIN products p ON oi.san_pham_id = p.id
        WHERE oi.don_hang_id = ?
      `, [order.id]);
      return { ...order, items };
    })
  );
  
  return ordersWithItems;
}
// Cập nhật trạng thái đơn hàng, nếu hủy thì hoàn lại số lượng sản phẩm
async function updateOrderStatus(id, trang_thai) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
        
    // Lấy trạng thái đơn hàng hiện tại
    const [currentOrder] = await conn.query('SELECT trang_thai FROM orders WHERE id = ?', [id]);
    const currentStatus = currentOrder[0]?.trang_thai;
    
    // Cập nhật trạng thái đơn hàng
    await conn.query('UPDATE orders SET trang_thai = ? WHERE id = ?', [trang_thai, id]);
    
    // Nếu đơn hàng bị hủy, hoàn lại số lượng sản phẩm
    if (trang_thai === 'canceled' && currentStatus !== 'canceled') {
      // Lấy tất cả các mục đơn hàng cho đơn hàng này
      const [orderItems] = await conn.query(
        'SELECT san_pham_id, so_luong FROM order_items WHERE don_hang_id = ?',
        [id]
      );
      
      // Hoàn lại số lượng cho mỗi sản phẩm
      for (const item of orderItems) {
        const [product] = await conn.query(
          'SELECT so_luong FROM products WHERE id = ?',
          [item.san_pham_id]
        );
        
        if (product[0]) {
          const newQuantity = product[0].so_luong + item.so_luong;
          const newStatus = 'available'; // Đặt lại thành "available" vì chúng ta đang khôi phục kho
          
          await conn.query(
            'UPDATE products SET so_luong = ?, trang_thai = ? WHERE id = ?',
            [newQuantity, newStatus, item.san_pham_id]
          );
        }
      }
    }
    
    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
// Cập nhật thông tin đơn hàng
async function updateOrder(id, updates = {}) {
  const fields = [];
  const values = [];
  
  if (updates.trang_thai !== undefined) {
    fields.push('trang_thai = ?');
    values.push(updates.trang_thai);
  }
  if (updates.ghi_chu !== undefined) {
    fields.push('ghi_chu = ?');
    values.push(updates.ghi_chu);
  }
  if (updates.ten_nguoi_nhan !== undefined) {
    fields.push('ten_nguoi_nhan = ?');
    values.push(updates.ten_nguoi_nhan);
  }
  if (updates.dien_thoai_nhan !== undefined) {
    fields.push('dien_thoai_nhan = ?');
    values.push(updates.dien_thoai_nhan);
  }
  if (updates.dia_chi_nhan !== undefined) {
    fields.push('dia_chi_nhan = ?');
    values.push(updates.dia_chi_nhan);
  }
  
  if (fields.length === 0) return false;
  
  values.push(id);
  const query = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
  await db.query(query, values);
  return true;
}
// Xóa đơn hàng
async function deleteOrder(id) {
  await db.query('DELETE FROM orders WHERE id = ?', [id]);
  return true;
}

module.exports = { createOrder, getOrderById, listOrdersForUser, listAll, updateOrderStatus, updateOrder, deleteOrder };
