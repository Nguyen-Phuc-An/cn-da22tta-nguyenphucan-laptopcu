const usersImagesModel = require('../models/usersImages');
const path = require('path');
const fs = require('fs');

// Tải lên hình ảnh người dùng
async function upload(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'no files uploaded' });

    // Xóa tất cả hình ảnh cũ của người dùng trước khi tải lên hình ảnh mới
    const oldImages = await usersImagesModel.getUserImages(userId);
    for (const img of oldImages) {
      if (img.duong_dan) {
        const filePath = path.join(process.cwd(), 'public', img.duong_dan.replace(/^\/public\//, ''));
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Deleted old image:', filePath);
          }
        } catch (err) {
          console.warn('Failed to delete old image:', filePath, err.message);
        }
      }
    }

    // Xóa tất cả bản ghi hình ảnh cũ trong cơ sở dữ liệu
    await usersImagesModel.deleteAllUserImages(userId);

    const uploadedIds = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `/public/uploads/users/${file.filename}`;
      // Đánh dấu hình ảnh đầu tiên là hình chính
      const isMain = (i === 0);
      const id = await usersImagesModel.uploadUserImage({
        nguoi_dung_id: userId,
        duong_dan: filePath,
        la_chinh: isMain ? 1 : 0
      });
      uploadedIds.push(id);
    }

    res.status(201).json({ ok: true, ids: uploadedIds });
  } catch (e) {
    console.error('users images upload error:', e);
    res.status(500).json({ error: e.message });
  }
}
// Lấy danh sách tất cả hình ảnh người dùng
async function list(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const images = await usersImagesModel.getUserImages(userId);
    res.json(images || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
// Lấy hình ảnh đại diện chính
async function getMain(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const image = await usersImagesModel.getMainUserImage(userId);
    res.json(image || { duong_dan: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
// Đặt hình ảnh làm hình chính
async function setMain(req, res) {
  try {
    const { imageId, userId } = req.body || {};
    if (!imageId || !userId) return res.status(400).json({ error: 'imageId and userId required' });

    const ok = await usersImagesModel.setMainImage(imageId, userId);
    if (!ok) return res.status(404).json({ error: 'image not found' });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
// Xóa hình ảnh người dùng
async function remove(req, res) {
  try {
    const { imageId, userId } = req.body || {};
    if (!imageId || !userId) return res.status(400).json({ error: 'imageId and userId required' });

    // Get image info first to delete file
    const images = await usersImagesModel.getUserImages(userId);
    const image = images.find(img => img.id === parseInt(imageId));
    
    if (image && image.duong_dan) {
      const filePath = path.join(process.cwd(), 'public', image.duong_dan.replace(/^\/public\//, ''));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Failed to delete file:', filePath, err.message);
      }
    }

    const ok = await usersImagesModel.deleteUserImage(imageId, userId);
    if (!ok) return res.status(404).json({ error: 'image not found' });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { upload, list, getMain, setMain, remove };
