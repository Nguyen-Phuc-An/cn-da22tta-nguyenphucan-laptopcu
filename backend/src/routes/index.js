const express = require('express');
const path = require('path');
const usersCtrl = require('../controllers/usersController');
const categoriesCtrl = require('../controllers/categoriesController');
const productsCtrl = require('../controllers/productsController');
const ordersCtrl = require('../controllers/ordersController');
const reviewsCtrl = require('../controllers/reviewsController');
const wishlistsCtrl = require('../controllers/wishlistsController');
const productImagesCtrl = require('../controllers/productImagesController');
const { upload: uploadMw } = require('../middlewares/upload');
const auth = require('../middlewares/auth');
const authRoutes = require('./auth');
const bannersRoutes = require('./banners');

const router = express.Router();

// Debug endpoints (help verify upload directory and write permissions)
try {
	const { absUploadDir } = require('../middlewares/upload');
	const fs = require('fs');
	router.get('/debug/uploads', (req, res) => {
		try {
			const files = fs.readdirSync(absUploadDir || path.join(process.cwd(), 'public', 'uploads', 'products'));
			res.json({ path: absUploadDir, files });
		} catch (e) { res.status(500).json({ error: e.message }); }
	});

	router.post('/debug/uploads/test-write', (req, res) => {
		try {
			const name = `test-${Date.now()}.txt`;
			const p = require('path').join(absUploadDir, name);
			fs.writeFileSync(p, 'ok');
			res.json({ ok: true, path: p, name });
		} catch (e) { res.status(500).json({ error: e.message }); }
	});

	// Debug-only: accept multipart file upload without auth to verify multer/store works
	router.post('/debug/uploads/upload-test', uploadMw.array('images', 5), (req, res) => {
		try {
			const files = req.files || [];
			console.log('[debug upload-test] received files:', files.map(f => f.filename));
			// return filenames and saved paths
			const paths = files.map(f => ({ filename: f.filename, savedPath: require('path').join(absUploadDir, f.filename) }));
			res.status(201).json({ ok: true, files: paths });
		} catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
	});
} catch (e) { /* ignore if upload middleware missing */ }

/* Users */
router.post('/users', usersCtrl.create);
router.get('/users', usersCtrl.list);
router.get('/users/:id', usersCtrl.getOne);
router.put('/users/:id', usersCtrl.update);
router.delete('/users/:id', usersCtrl.remove);

// Admin stats
try {
	const adminCtrl = require('../controllers/adminController');
	router.get('/admin/stats', auth, adminCtrl.stats);
} catch (e) { console.warn('admin stats route not added', e && e.message ? e.message : e); }

/* Categories */
router.post('/categories', categoriesCtrl.create);
router.get('/categories', categoriesCtrl.list);
router.get('/categories/:id', categoriesCtrl.getOne);
router.put('/categories/:id', categoriesCtrl.update);
router.delete('/categories/:id', categoriesCtrl.remove);

/* Products */
router.post('/products', productsCtrl.create);
router.get('/products', productsCtrl.list);
router.get('/products/:id', productsCtrl.getOne);
router.put('/products/:id', productsCtrl.update);
router.delete('/products/:id', productsCtrl.remove);

// Product images
router.post('/products/:productId/images', auth, uploadMw.array('images', 5), productImagesCtrl.upload);
router.get('/products/:productId/images', productImagesCtrl.list);
router.delete('/products/:productId/images/:id', auth, productImagesCtrl.remove);

/* Orders */
router.post('/orders', ordersCtrl.create);
router.get('/orders/:id', ordersCtrl.getOne);
router.get('/users/:userId/orders', ordersCtrl.listForUser);
router.put('/orders/:id/status', ordersCtrl.updateStatus);
router.delete('/orders/:id', ordersCtrl.remove);

/* Reviews */
router.post('/reviews', reviewsCtrl.createOrUpdate);
router.get('/products/:productId/reviews', reviewsCtrl.listByProduct);
router.delete('/products/:productId/reviews/:userId', reviewsCtrl.remove);

/* Wishlists */
router.post('/wishlists', wishlistsCtrl.add);
router.get('/users/:userId/wishlists', wishlistsCtrl.list);
router.delete('/users/:userId/wishlists/:productId', wishlistsCtrl.remove);

/* Banners */
router.use('/banners', bannersRoutes);

/* Chat Messages */
try {
	const messagesCtrl = require('../controllers/messagesController');
	router.post('/messages/chat', messagesCtrl.sendMessage);
	router.get('/messages/chat/conversations', messagesCtrl.getConversationsList);
	router.get('/messages/chat/history/:identifier', messagesCtrl.getChatHistory);
	router.get('/messages/chat/:identifier', messagesCtrl.getConversation);
} catch (e) { console.warn('chat routes not added', e && e.message ? e.message : e); }

// mount auth
router.use('/auth', authRoutes);

module.exports = router;