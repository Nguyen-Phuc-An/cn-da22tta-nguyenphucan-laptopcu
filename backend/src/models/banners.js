const db = require('../db');

async function createBanner(payload = {}) {
  const tieu_de = payload.tieu_de ?? null;
  const duong_dan = payload.duong_dan ?? null;
  const link = payload.link ?? null;
  const vi_tri = payload.vi_tri ?? 0;
  const trang_thai = payload.trang_thai ?? 'active';

  if (!tieu_de || !duong_dan) {
    throw new Error('Tiêu đề và đường dẫn ảnh không được để trống');
  }

  const [res] = await db.query(
    `INSERT INTO banners (tieu_de, duong_dan, link, vi_tri, trang_thai)
     VALUES (?, ?, ?, ?, ?)`,
    [tieu_de, duong_dan, link, vi_tri, trang_thai]
  );
  return res.insertId;
}

async function getBannerById(id) {
  const [rows] = await db.query(
    `SELECT id, tieu_de, duong_dan, link, vi_tri, trang_thai, tao_luc, cap_nhat_luc
     FROM banners WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listBanners() {
  const [rows] = await db.query(
    `SELECT id, tieu_de, duong_dan, link, vi_tri, trang_thai, tao_luc, cap_nhat_luc
     FROM banners
     ORDER BY vi_tri ASC, tao_luc DESC`
  );
  return rows;
}

async function listActiveBanners() {
  const [rows] = await db.query(
    `SELECT id, tieu_de, duong_dan, link, vi_tri, trang_thai, tao_luc, cap_nhat_luc
     FROM banners
     WHERE trang_thai = 'active'
     ORDER BY vi_tri ASC`
  );
  return rows;
}

async function updateBanner(id, fields = {}) {
  const sets = [];
  const vals = [];
  const mapping = {
    tieu_de: 'tieu_de',
    duong_dan: 'duong_dan',
    link: 'link',
    vi_tri: 'vi_tri',
    trang_thai: 'trang_thai'
  };

  for (const k of Object.keys(fields)) {
    if (mapping[k]) {
      sets.push(`${mapping[k]} = ?`);
      vals.push(fields[k]);
    }
  }

  if (!sets.length) return false;
  vals.push(id);
  await db.query('UPDATE banners SET ' + sets.join(', ') + ' WHERE id = ?', vals);
  return true;
}

async function deleteBanner(id) {
  await db.query('DELETE FROM banners WHERE id = ?', [id]);
  return true;
}

module.exports = { createBanner, getBannerById, listBanners, listActiveBanners, updateBanner, deleteBanner };
