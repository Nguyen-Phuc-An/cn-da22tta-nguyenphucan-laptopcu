const users = require('../models/users');
const bcrypt = require('bcryptjs');

// Tạo người dùng mới
async function create(req, res) {
  try {
    const { email, name, password, phone, address, role } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: 'email, name and password required' });

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await users.getUserByEmail(normalizedEmail);
    if (existing) return res.status(409).json({ error: 'email exists' });

    const hash = bcrypt.hashSync(password, 12);
    const insertId = await users.createUser({ email: normalizedEmail, name: String(name).trim(), passwordHash: hash, role, phone, address });
    res.status(201).json({ id: insertId });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
}
// Lấy thông tin một người dùng theo ID
async function getOne(req, res) {
  try {
    const id = req.params.id;
    const user = await users.getUserById(id);
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
}
// Lấy danh sách tất cả người dùng
async function list(req, res) {
  try {
    const all = await users.listUsers();
    res.json(all || []);
  } catch (e) { console.error('users.list error', e); res.status(500).json({ error: e.message }); }
}
// Cập nhật thông tin người dùng
async function update(req, res) {
  try {
    const id = req.params.id;
    // Nếu có password trong body, băm mật khẩu trước khi lưu
    const body = { ...req.body };
    if (body.password) {
      body.passwordHash = bcrypt.hashSync(body.password, 12);
      delete body.password;
    }
    // Nếu có file avatar được tải lên, sử dụng đường dẫn này
    if (req.file) {
      body.avatar = `/public/uploads/users/${req.file.filename}`;
    }
    const ok = await users.updateUser(id, body);
    if (!ok) return res.status(400).json({ error: 'nothing to update' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}
// Vô hiệu hóa người dùng
async function remove(req, res) {
  try {
    const id = req.params.id;
    await users.deactivateUser(id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

module.exports = { create, list, getOne, update, remove };
