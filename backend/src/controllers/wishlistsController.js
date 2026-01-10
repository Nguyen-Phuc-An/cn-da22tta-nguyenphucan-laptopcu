const wishlists = require('../models/wishlists');
// Thêm sản phẩm vào danh sách yêu thích
async function add(req, res) {
  try { const { user_id, product_id } = req.body || {}; if (!user_id || !product_id) return res.status(400).json({ error: 'user_id and product_id required' }); await wishlists.addToWishlist(user_id, product_id); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}
// Lấy danh sách sản phẩm trong danh sách yêu thích của người dùng
async function list(req, res) {
  try { const rows = await wishlists.listWishlist(req.params.userId); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}
// Xóa sản phẩm khỏi danh sách yêu thích
async function remove(req, res) {
  try { await wishlists.removeFromWishlist(req.params.userId, req.params.productId); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { add, list, remove };
