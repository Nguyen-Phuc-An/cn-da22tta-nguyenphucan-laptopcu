const reviews = require('../models/reviews');

async function createOrUpdate(req, res) {
  try { 
    const id = await reviews.createOrUpdateReview(req.body || {}); 
    res.json({ ok: true, id }); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}

async function listByProduct(req, res) {
  try { const rows = await reviews.getReviewsByProduct(req.params.productId); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}

// List all reviews (for admin/staff)
async function listAll(req, res) {
  try { 
    const rows = await reviews.getAllReviews(); 
    res.json(rows); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}

async function remove(req, res) {
  try { await reviews.deleteReview(req.params.productId, req.params.userId); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function getPending(req, res) {
  try {
    if (!req.user) {
      console.log('[reviewsController.getPending] Unauthorized - req.user:', req.user);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log('[reviewsController.getPending] Fetching pending reviews for user:', req.user.id);
    const rows = await reviews.getPendingReviewsForUser(req.user.id);
    console.log('[reviewsController.getPending] Found', rows.length, 'products');
    res.json(rows);
  } catch (e) {
    console.error('[reviewsController.getPending] Error:', e.message, e.stack);
    res.status(500).json({ error: e.message });
  }
}

module.exports = { createOrUpdate, listByProduct, listAll, remove, getPending };
