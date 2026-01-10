const banners = require('../models/banners');
// Tạo banner mới
async function create(req, res) {
  try {
    const payload = req.body || {};
    // Nếu có file được tải lên, sử dụng đường dẫn này
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
// Lấy danh sách tất cả banner
async function list(req, res) {
  try {
    const rows = await banners.listBanners();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
// Lấy danh sách banner đang hoạt động
async function listActive(req, res) {
  try {
    const rows = await banners.listActiveBanners();
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
// Lấy thông tin một banner theo ID
async function getOne(req, res) {
  try {
    const b = await banners.getBannerById(req.params.id);
    if (!b) return res.status(404).json({ error: 'not found' });
    res.json(b);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
// Cập nhật thông tin banner
async function update(req, res) {
  try {
    const payload = req.body || {};
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
// Xóa banner
async function remove(req, res) {
  try {
    await banners.deleteBanner(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { create, list, listActive, getOne, update, remove };
