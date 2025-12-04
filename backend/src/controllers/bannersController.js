const banners = require('../models/banners');

async function create(req, res) {
  try {
    const payload = req.body || {};
    // If file uploaded, use that path; otherwise use duong_dan from body
    if (req.file) {
      payload.duong_dan = `/public/uploads/products/${req.file.filename}`;
    }
    const id = await banners.createBanner(payload);
    res.status(201).json({ id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

async function list(req, res) {
  try {
    const rows = await banners.listBanners();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function listActive(req, res) {
  try {
    const rows = await banners.listActiveBanners();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function getOne(req, res) {
  try {
    const b = await banners.getBannerById(req.params.id);
    if (!b) return res.status(404).json({ error: 'not found' });
    res.json(b);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function update(req, res) {
  try {
    const payload = req.body || {};
    // If file uploaded, use that path
    if (req.file) {
      payload.duong_dan = `/public/uploads/products/${req.file.filename}`;
    }
    const ok = await banners.updateBanner(req.params.id, payload);
    if (!ok) return res.status(400).json({ error: 'nothing to update' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function remove(req, res) {
  try {
    await banners.deleteBanner(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { create, list, listActive, getOne, update, remove };
