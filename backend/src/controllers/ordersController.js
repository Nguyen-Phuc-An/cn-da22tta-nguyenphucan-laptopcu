const orders = require('../models/orders');

async function create(req, res) {
  try { const id = await orders.createOrder(req.body || {}); res.status(201).json({ id }); } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
}

async function getOne(req, res) {
  try { const o = await orders.getOrderById(req.params.id); if (!o) return res.status(404).json({ error: 'not found' }); res.json(o); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function listForUser(req, res) {
  try { const rows = await orders.listOrdersForUser(req.params.userId, { limit: req.query.limit, offset: req.query.offset }); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function updateStatus(req, res) {
  try { await orders.updateOrderStatus(req.params.id, req.body.status); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function remove(req, res) {
  try { await orders.deleteOrder(req.params.id); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { create, getOne, listForUser, updateStatus, remove };
