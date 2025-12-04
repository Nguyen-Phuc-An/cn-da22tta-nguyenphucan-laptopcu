const users = require('../models/users');
require('dotenv').config();

// Pre-hashed password for "admin123" (bcrypt). You can override with ADMIN_PASSWORD_HASH env var.
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const DEFAULT_ADMIN_ROLE = process.env.ADMIN_ROLE || 'admin';
const DEFAULT_ADMIN_PHONE = process.env.ADMIN_PHONE || '0363547545';
const DEFAULT_ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || 'Vĩnh Long';
const DEFAULT_ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$w1l7ZIjpE2wn/Fi3glneieA4OdGSCPiZy30Ww9Xv9h6hVqesYf44K';

async function initAdminAccount() {
  try {
    const email = String(DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
    const existing = await users.getUserByEmail(email);
    if (existing) {
      console.log('Admin account already exists:', existing.email || existing.id);
      return existing;
    }

    const id = await users.createUser({
      email,
      name: DEFAULT_ADMIN_NAME,
      passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
      role: DEFAULT_ADMIN_ROLE,
      phone: DEFAULT_ADMIN_PHONE,
      address: DEFAULT_ADMIN_ADDRESS,
    });

    console.log('Admin account created successfully, id=', id);
    return await users.getUserById(id);
  } catch (err) {
    console.error('Failed to initialize admin account:', err && err.message ? err.message : err);
    throw err;
  }
}

module.exports = { initAdminAccount };
