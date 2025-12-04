const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadDir = process.env.UPLOAD_DIR || 'public/uploads/products';
const absUploadDir = path.isAbsolute(uploadDir) ? uploadDir : path.join(process.cwd(), uploadDir);
fs.mkdirSync(absUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});

function imageFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files allowed'), false);
  cb(null, true);
}

const upload = multer({ storage, fileFilter: imageFilter, limits: { files: 5, fileSize: 5 * 1024 * 1024 } });

module.exports = { upload, absUploadDir };
