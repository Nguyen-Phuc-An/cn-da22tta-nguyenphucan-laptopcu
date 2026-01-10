const products = require('../models/products');
// Tạo sản phẩm mới
async function create(req, res) {
  try {
    const id = await products.createProduct(req.body || {});
    res.status(201).json({ id });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
}
// Lấy danh sách tất cả sản phẩm
async function list(req, res) {
  try { const rows = await products.listProducts({ limit: req.query.limit, offset: req.query.offset }); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}
// Lấy thông tin một sản phẩm theo ID
async function getOne(req, res) {
  try { const p = await products.getProductById(req.params.id); if (!p) return res.status(404).json({ error: 'not found' }); res.json(p); } catch (e) { res.status(500).json({ error: e.message }); }
}
// Cập nhật thông tin sản phẩm
async function update(req, res) {
  try { const ok = await products.updateProduct(req.params.id, req.body || {}); if (!ok) return res.status(400).json({ error: 'nothing to update' }); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}
// Xóa sản phẩm
async function remove(req, res) {
  try { await products.deleteProduct(req.params.id); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { create, list, getOne, update, remove };
