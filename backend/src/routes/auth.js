const express = require('express');
const authCtrl = require('../controllers/authController');

const router = express.Router();

// Register and login
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

module.exports = router;
