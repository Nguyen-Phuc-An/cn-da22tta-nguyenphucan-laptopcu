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

// Register: email, name, password
async function register(req, res) {
  try {
    const { email, name, password, phone = null, address = null, role = 'customer' } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: 'email, name and password are required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await usersModel.getUserByEmail(normalizedEmail);
    if (existing) return res.status(409).json({ error: 'email exists' });

    const hash = bcrypt.hashSync(password, 12);
    const insertId = await usersModel.createUser({ email: normalizedEmail, name: String(name).trim(), passwordHash: hash, role, phone, address });
    const user = await usersModel.getUserById(insertId);
    res.status(201).json(userSafe(user));
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

module.exports = { register, login };