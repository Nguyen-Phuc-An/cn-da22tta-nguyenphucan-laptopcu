const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadDir = process.env.UPLOAD_DIR || 'public/uploads/products';
const absUploadDir = path.isAbsolute(uploadDir) ? uploadDir : path.join(process.cwd(), uploadDir);
fs.mkdirSync(absUploadDir, { recursive: true });
// Cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});
// Bộ lọc để chỉ chấp nhận các file hình ảnh
function imageFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files allowed'), false);
  cb(null, true);
}
// Tạo middleware upload
const upload = multer({ storage, fileFilter: imageFilter, limits: { files: 5, fileSize: 5 * 1024 * 1024 } });
// Tải lên avatar với thư mục riêng
const avatarUploadDir = path.join(process.cwd(), 'public/uploads/users');
fs.mkdirSync(avatarUploadDir, { recursive: true });
// Cấu hình lưu trữ cho avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});
// Tạo middleware upload cho avatar
const avatarUpload = multer({ 
  storage: avatarStorage, 
  fileFilter: imageFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

module.exports = { upload, absUploadDir, avatarUpload };
