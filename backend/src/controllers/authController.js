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

// Register: email, name, password, optional phone, address
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

module.exports = { register, login, changePassword };