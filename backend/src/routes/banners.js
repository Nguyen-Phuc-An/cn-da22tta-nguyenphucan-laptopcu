const express = require('express');
const controller = require('../controllers/bannersController');
const requireAuth = require('../middlewares/auth');
const { upload: uploadMw } = require('../middlewares/upload');

const router = express.Router();

// Public: get active banners for homepage slide
router.get('/active', controller.listActive);

// Admin only: full CRUD
router.get('/', requireAuth, controller.list);
router.get('/:id', requireAuth, controller.getOne);
router.post('/', requireAuth, uploadMw.single('hinh_anh'), controller.create);
router.put('/:id', requireAuth, uploadMw.single('hinh_anh'), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
