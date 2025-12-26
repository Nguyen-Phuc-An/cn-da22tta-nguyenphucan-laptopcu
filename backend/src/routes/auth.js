const express = require('express');
const authCtrl = require('../controllers/authController');
const { avatarUpload } = require('../middlewares/upload');
const auth = require('../middlewares/auth');

const router = express.Router();

// Register and login
router.post('/register', avatarUpload.single('avatar'), authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/change-password', auth, authCtrl.changePassword);
router.post('/edu-verification', auth, authCtrl.eduVerification);
router.get('/edu-status', auth, authCtrl.getEduStatus);

module.exports = router;
