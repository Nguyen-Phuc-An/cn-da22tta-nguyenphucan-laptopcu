const reviews = require('../models/reviews');

async function createOrUpdate(req, res) {
  try { const id = await reviews.createOrUpdateReview(req.body || {}); res.json({ ok: true, id }); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function listByProduct(req, res) {
  try { const rows = await reviews.getReviewsByProduct(req.params.productId); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function remove(req, res) {
  try { await reviews.deleteReview(req.params.productId, req.params.userId); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { createOrUpdate, listByProduct, remove };
