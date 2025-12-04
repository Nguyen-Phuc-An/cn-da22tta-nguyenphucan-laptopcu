const wishlists = require('../models/wishlists');

async function add(req, res) {
  try { const { user_id, product_id } = req.body || {}; if (!user_id || !product_id) return res.status(400).json({ error: 'user_id and product_id required' }); await wishlists.addToWishlist(user_id, product_id); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function list(req, res) {
  try { const rows = await wishlists.listWishlist(req.params.userId); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function remove(req, res) {
  try { await wishlists.removeFromWishlist(req.params.userId, req.params.productId); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { add, list, remove };
