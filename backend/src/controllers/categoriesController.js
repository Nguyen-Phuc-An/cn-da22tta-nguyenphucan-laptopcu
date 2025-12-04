const categories = require('../models/categories');

async function create(req, res) {
  try { const id = await categories.createCategory(req.body || {}); res.status(201).json({ id }); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function list(req, res) {
  try { const rows = await categories.listCategories(); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function getOne(req, res) {
  try { const c = await categories.getCategoryById(req.params.id); if (!c) return res.status(404).json({ error: 'not found' }); res.json(c); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function update(req, res) {
  try { const ok = await categories.updateCategory(req.params.id, req.body || {}); if (!ok) return res.status(400).json({ error: 'nothing to update' }); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

async function remove(req, res) {
  try { await categories.deleteCategory(req.params.id); res.json({ ok: true }); } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { create, list, getOne, update, remove };
