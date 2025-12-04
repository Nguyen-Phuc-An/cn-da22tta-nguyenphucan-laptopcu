const productImages = require('../models/productImages');
const products = require('../models/products');
const fs = require('fs');
const path = require('path');
const { absUploadDir } = require('../middlewares/upload');

// upload files via multer before calling this handler
async function upload(req, res) {
  try {
    const productId = req.params.productId;
    const product = await products.getProductById(productId);
    if (!product) return res.status(404).json({ error: 'product not found' });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'no files uploaded' });

    // debug log saved filenames and upload dir
    try { console.log('Upload handler files:', files.map(f => f.filename)); console.log('absUploadDir:', absUploadDir); } catch (e) { void e; }

    const existing = await productImages.countImagesForProduct(productId);
    if (existing + files.length > 5) return res.status(400).json({ error: 'maximum 5 images per product' });

    const urls = files.map(f => path.join('uploads', 'products', path.basename(f.filename)).replace(/\\/g, '/'));
    await productImages.addImages(productId, urls);
    let rows = await productImages.getImagesByProduct(productId);
    // attach full URL for convenience
    const host = req.protocol + '://' + req.get('host');
    rows = rows.map(r => ({ ...r, full_url: host + '/public/' + (r.url || r.duong_dan || '').replace(/^\//, '') }));
    res.status(201).json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

async function list(req, res) {
  try {
    const productId = req.params.productId;
    let rows = await productImages.getImagesByProduct(productId);
    const host = req.protocol + '://' + req.get('host');
    rows = rows.map(r => ({ ...r, full_url: host + '/public/' + (r.url || r.duong_dan || '').replace(/^\//, '') }));
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

async function remove(req, res) {
  try {
    const id = req.params.id;
    const rec = await productImages.getImageById(id);
    if (!rec) return res.status(404).json({ error: 'not found' });
    // delete file from disk
    const filePath = path.isAbsolute(rec.duong_dan || '') ? rec.duong_dan : path.join(process.cwd(), 'public', rec.duong_dan || '');
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (err) { console.warn('failed unlink', filePath, err.message); }
    await productImages.deleteImageById(id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { upload, list, remove };

