const bcrypt = require('bcryptjs');
const db = require('../db');
// Đảm bảo tồn tại tài khoản admin
async function ensureAdmin() {
  try {
    console.log('[ensureAdmin] Checking for admin user...');
    // Kiểm tra xem đã có user với vai trò 'admin' chưa
    const [rows] = await db.query('SELECT id FROM users WHERE vai_tro = ? LIMIT 1', ['admin']);
    // Nếu có rồi thì hiện ok
    if (rows && rows.length > 0) {
      console.log('[ensureAdmin] ✓ Admin user already exists');
      return;
    }
    // Nếu chưa có thì tạo mới
    console.log('[ensureAdmin] Admin user not found. Creating...');
    // Thông tin user admin mặc định
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin';
    const adminPhone = '0363547545';
    const adminAddress = 'Admin Address';
    
    // Mã hóa mật khẩu
    const passwordHash = bcrypt.hashSync(adminPassword, 12);
    // Tạo user admin trong database
    await db.query(
      'INSERT INTO users (email, ten, mat_khau, vai_tro, dien_thoai, dia_chi) VALUES (?, ?, ?, ?, ?, ?)',
      [adminEmail, adminName, passwordHash, 'admin', adminPhone, adminAddress]
    );
    // Hiện thông tin user admin vừa tạo
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
