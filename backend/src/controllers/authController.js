const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usersModel = require('../models/users');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function userSafe(u) {
  if (!u) return null;
  const { mat_khau, password, ...rest } = u;
  return rest;
}

// Đăng ký người dùng
async function register(req, res) {
  try {
    const { email, name, password, phone = null, address = null, role = 'customer' } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: 'email, name and password are required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await usersModel.getUserByEmail(normalizedEmail);
    if (existing) return res.status(409).json({ error: 'email exists' });

    const hash = bcrypt.hashSync(password, 12);
    
    const insertId = await usersModel.createUser({ 
      email: normalizedEmail, 
      name: String(name).trim(), 
      passwordHash: hash, 
      role, 
      phone, 
      address
    });
    const user = await usersModel.getUserById(insertId);
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, ten: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ token, user: userSafe(user) });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'server error' });
  }
}
// Đăng nhập người dùng
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const userRaw = await usersModel.getUserByEmail(String(email).trim().toLowerCase());
    if (!userRaw) return res.status(401).json({ error: 'invalid credentials' });

    const stored = userRaw.mat_khau || userRaw.password || null;
    const ok = stored && typeof stored === 'string' && /^\$2[aby]\$/.test(stored)
      ? bcrypt.compareSync(password, stored)
      : password === stored;

    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const user = await usersModel.getUserById(userRaw.id);
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, ten: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: userSafe(user) });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'server error' });
  }
}
// Đổi mật khẩu người dùng
async function changePassword(req, res) {
  try {
    // Extract userId from jwt payload in req.user
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body || {};

    if (!userId) {
      console.error('[changePassword] No userId found in request');
      return res.status(401).json({ error: 'not authenticated' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'oldPassword and newPassword required' });
    }

    const user = await usersModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    console.log(`[changePassword] User ${userId} attempting to change password`);

    // Verify old password
    const stored = user.mat_khau || user.password || null;
    if (!stored) {
      return res.status(400).json({ error: 'no password set for this user' });
    }

    // Check if password is hashed (bcrypt format)
    const isBcrypt = typeof stored === 'string' && /^\$2[aby]\$/.test(stored);
    const ok = isBcrypt
      ? bcrypt.compareSync(oldPassword, stored)
      : oldPassword === stored;

    if (!ok) {
      console.log(`[changePassword] Wrong password for user ${userId}`);
      return res.status(401).json({ error: 'old password is incorrect' });
    }

    // Hash new password
    const newHash = bcrypt.hashSync(newPassword, 12);

    // Update password
    const db = require('../db');
    const query = 'UPDATE users SET mat_khau = ? WHERE id = ?';
    const [result] = await db.query(query, [newHash, userId]);

    console.log(`[changePassword] Password changed successfully for user ${userId}`);
    res.json({ success: true, message: 'password changed successfully' });
  } catch (err) {
    console.error('[changePassword] Error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
}
// Xác minh Edu - Xác minh Sinh viên/Giáo viên
async function eduVerification(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { edu_email, edu_mssv, edu_cccd, edu_school } = req.body || {};
    if (!edu_email || !edu_mssv || !edu_cccd || !edu_school) {
      return res.status(400).json({ error: 'all fields required: edu_email, edu_mssv, edu_cccd, edu_school' });
    }

    // Validate email format
    if (typeof edu_email !== 'string' || !edu_email.includes('@')) {
      return res.status(400).json({ error: 'invalid email format' });
    }

    // Validate MSSV (student ID)
    if (String(edu_mssv).length < 8) {
      return res.status(400).json({ error: 'student id must be at least 8 characters' });
    }

    // Validate ID/Passport
    if (String(edu_cccd).length < 9) {
      return res.status(400).json({ error: 'id/passport must be at least 9 characters' });
    }

    const db = require('../db');
    
    // Update user with edu info - set edu_verified to 0 (pending approval)
    const query = `
      UPDATE users 
      SET edu_verified = 0, 
          edu_email = ?, 
          edu_mssv = ?, 
          edu_cccd = ?, 
          edu_school = ?,
          cap_nhat_luc = NOW()
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [edu_email, edu_mssv, edu_cccd, edu_school, userId]);

    console.log(`[eduVerification] User ${userId} edu verification submitted`);
    
    // Fetch updated user data to return
    const selectQuery = `SELECT id, email, ten as name, edu_verified, edu_email, edu_mssv, edu_cccd, edu_school FROM users WHERE id = ?`;
    const [updatedUser] = await db.query(selectQuery, [userId]);
    
    res.json({ 
      success: true, 
      message: 'edu verification submitted successfully. you will be verified within 24-48 hours',
      user: updatedUser[0] || { edu_verified: 0, edu_email, edu_mssv, edu_cccd, edu_school }
    });
  } catch (err) {
    console.error('[eduVerification] Error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
}
// Lấy trạng thái Edu
async function getEduStatus(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const user = await usersModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'user not found' });
    }

    res.json({
      edu_verified: user.edu_verified || false,
      edu_email: user.edu_email || null,
      edu_school: user.edu_school || null,
      discount: user.edu_verified ? 500000 : 0
    });
  } catch (err) {
    console.error('[getEduStatus] Error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
}
// Admin: Lấy tất cả các xác minh Edu
async function getAllEduVerifications(req, res) {
  try {
    const db = require('../db');
    
    console.log('[getAllEduVerifications] User:', req.user);
    
    const query = `
      SELECT id, email, ten as name, 
             edu_email, edu_mssv, edu_cccd, edu_school, 
             edu_verified, tao_luc as created_at
      FROM users 
      WHERE edu_email IS NOT NULL
      ORDER BY tao_luc DESC
    `;
    
    console.log('[getAllEduVerifications] Executing query');
    const [verifications] = await db.query(query);
    console.log('[getAllEduVerifications] Found', verifications.length, 'verifications');
    res.json(verifications);
  } catch (err) {
    console.error('[getAllEduVerifications] Error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
}
// Admin: Phê duyệt xác minh Edu
async function approveEduVerification(req, res) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const db = require('../db');
    
    const query = `
      UPDATE users 
      SET edu_verified = 1,
          cap_nhat_luc = NOW()
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [user_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'user not found' });
    }

    console.log(`[approveEduVerification] User ${user_id} edu verification approved`);
    res.json({ success: true, message: 'edu verification approved' });
  } catch (err) {
    console.error('[approveEduVerification] Error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
}
// Admin: Từ chối xác minh Edu
async function rejectEduVerification(req, res) {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const db = require('../db');
    
    const query = `
      UPDATE users 
      SET edu_verified = -1,
          edu_email = NULL,
          edu_mssv = NULL,
          edu_cccd = NULL,
          edu_school = NULL,
          cap_nhat_luc = NOW()
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [user_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'user not found' });
    }

    console.log(`[rejectEduVerification] User ${user_id} edu verification rejected`);
    res.json({ success: true, message: 'edu verification rejected' });
  } catch (err) {
    console.error('[rejectEduVerification] Error:', err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
}

module.exports = { register, login, changePassword, eduVerification, getEduStatus, getAllEduVerifications, approveEduVerification, rejectEduVerification };