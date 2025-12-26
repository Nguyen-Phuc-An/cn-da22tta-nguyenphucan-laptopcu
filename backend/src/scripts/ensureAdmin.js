const bcrypt = require('bcryptjs');
const db = require('../db');

async function ensureAdmin() {
  try {
    console.log('[ensureAdmin] Checking for admin user...');
    
    const [rows] = await db.query('SELECT id FROM users WHERE vai_tro = ? LIMIT 1', ['admin']);
    
    if (rows && rows.length > 0) {
      console.log('[ensureAdmin] ✓ Admin user already exists');
      return;
    }

    console.log('[ensureAdmin] Admin user not found. Creating...');
    
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin';
    const adminPhone = '0363547545';
    const adminAddress = 'Admin Address';
    
    // Hash password with bcrypt
    const passwordHash = bcrypt.hashSync(adminPassword, 12);
    
    await db.query(
      'INSERT INTO users (email, ten, mat_khau, vai_tro, dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)',
      [adminEmail, adminName, passwordHash, 'admin', adminPhone, adminAddress]
    );
    
    console.log('[ensureAdmin] ✓ Admin user created successfully');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    
  } catch (err) {
    console.error('[ensureAdmin] Error:', err.message);
    throw err;
  }
}

if (require.main === module) {
  ensureAdmin()
    .then(() => {
      console.log('[ensureAdmin] Done');
      process.exit(0);
    })
    .catch(err => {
      console.error('[ensureAdmin] Failed:', err);
      process.exit(1);
    });
}

module.exports = ensureAdmin;
