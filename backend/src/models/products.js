const db = require('../db');

async function createProduct(payload = {}) {
  // Accept either Vietnamese keys (preferred) or common English keys for compatibility
  const danh_muc_id = payload.danh_muc_id ?? payload.category_id ?? null;
  const tieu_de = payload.tieu_de ?? payload.title ?? null;
  const mo_ta = payload.mo_ta ?? payload.description ?? null;
  const tinh_trang = payload.tinh_trang ?? payload.condition ?? 'good';
  const gia = payload.gia ?? payload.price ?? 0;
  const tien_te = payload.tien_te ?? payload.currency ?? 'VND';
  const so_luong = payload.so_luong ?? payload.stock ?? 1;
  const ram = payload.ram ?? null;
  const o_cung = payload.o_cung ?? payload.disk ?? null;
  const cpu = payload.cpu ?? null;
  const kich_thuoc_man_hinh = payload.kich_thuoc_man_hinh ?? payload.screen_size ?? null;
  const card_do_hoa = payload.card_do_hoa ?? payload.gpu ?? null;
  const do_phan_giai = payload.do_phan_giai ?? payload.resolution ?? null;
  const mau_sac = payload.mau_sac ?? null;
  const trang_thai = payload.trang_thai ?? 'available';

  const [res] = await db.query(
    `INSERT INTO products (danh_muc_id, tieu_de, mo_ta, ram, o_cung, cpu, kich_thuoc_man_hinh, card_do_hoa, do_phan_giai, mau_sac, tinh_trang, gia, tien_te, so_luong, trang_thai)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [danh_muc_id, tieu_de, mo_ta, ram, o_cung, cpu, kich_thuoc_man_hinh, card_do_hoa, do_phan_giai, mau_sac, tinh_trang, gia, tien_te, so_luong, trang_thai]
  );
  return res.insertId;
}

async function getProductById(id) {
  const [rows] = await db.query(
    `SELECT id, danh_muc_id, tieu_de, mo_ta, ram, o_cung, cpu, kich_thuoc_man_hinh, card_do_hoa, do_phan_giai, tinh_trang, gia, tien_te, so_luong, trang_thai, mau_sac, dang_tai_luc, cap_nhat_luc
     FROM products WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listProducts({ limit = 50, offset = 0 } = {}) {
  const [rows] = await db.query(
    `SELECT id, danh_muc_id, tieu_de, mo_ta, ram, o_cung, cpu, kich_thuoc_man_hinh, card_do_hoa, do_phan_giai, tinh_trang, gia, tien_te, so_luong, trang_thai, mau_sac, dang_tai_luc, cap_nhat_luc
     FROM products
     ORDER BY dang_tai_luc DESC
     LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
}

async function updateProduct(id, fields = {}) {
  const sets = []; const vals = [];
  const mapping = {
    // Vietnamese -> column
    danh_muc_id: 'danh_muc_id', tieu_de: 'tieu_de', mo_ta: 'mo_ta', tinh_trang: 'tinh_trang', gia: 'gia', tien_te: 'tien_te', so_luong: 'so_luong', trang_thai: 'trang_thai', ram: 'ram', o_cung: 'o_cung', cpu: 'cpu', kich_thuoc_man_hinh: 'kich_thuoc_man_hinh', card_do_hoa: 'card_do_hoa', do_phan_giai: 'do_phan_giai', mau_sac: 'mau_sac',
    // English aliases -> column
    category_id: 'danh_muc_id', title: 'tieu_de', description: 'mo_ta', condition: 'tinh_trang', price: 'gia', currency: 'tien_te', stock: 'so_luong', status: 'trang_thai', disk: 'o_cung', screen_size: 'kich_thuoc_man_hinh', gpu: 'card_do_hoa', resolution: 'do_phan_giai', color: 'mau_sac'
  };
  for (const k of Object.keys(fields)) {
    if (mapping[k]) {
      sets.push(`${mapping[k]} = ?`);
      vals.push(fields[k]);
    }
  }
  if (!sets.length) return false;
  vals.push(id);
  await db.query('UPDATE products SET ' + sets.join(', ') + ' WHERE id = ?', vals);
  return true;
}

async function deleteProduct(id) {
  await db.query('DELETE FROM products WHERE id = ?', [id]);
  return true;
}

module.exports = { createProduct, getProductById, listProducts, updateProduct, deleteProduct };