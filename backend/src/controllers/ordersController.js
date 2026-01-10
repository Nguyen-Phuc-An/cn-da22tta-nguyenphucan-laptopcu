const orders = require('../models/orders');
// Tạo đơn hàng mới
async function create(req, res) {
  try { 
    const id = await orders.createOrder(req.body || {}); 
    res.status(201).json({ id }); 
  } catch (e) { 
    console.error(e); 
    res.status(500).json({ error: e.message }); 
  }
}
// Lấy thông tin một đơn hàng theo ID
async function getOne(req, res) {
  try { 
    const o = await orders.getOrderById(req.params.id); 
    if (!o) return res.status(404).json({ error: 'not found' }); 
    res.json(o); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}
// Lấy danh sách tất cả đơn hàng
async function listAll(req, res) {
  try { 
    const rows = await orders.listAll({ 
      limit: req.query.limit || 100, 
      offset: req.query.offset || 0,
      status: req.query.status
    }); 
    res.json(rows); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}
// Lấy danh sách đơn hàng của một người dùng
async function listForUser(req, res) {
  try { 
    const rows = await orders.listOrdersForUser(req.params.userId, { limit: req.query.limit, offset: req.query.offset }); 
    res.json(rows); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}
// Cập nhật trạng thái đơn hàng
async function updateStatus(req, res) {
  try { 
    await orders.updateOrderStatus(req.params.id, req.body.trang_thai || req.body.status); 
    res.json({ ok: true }); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}
// Cập nhật thông tin đơn hàng
async function update(req, res) {
  try { 
    const ok = await orders.updateOrder(req.params.id, req.body); 
    res.json({ ok }); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}
// Xóa đơn hàng
async function remove(req, res) {
  try { 
    await orders.deleteOrder(req.params.id); 
    res.json({ ok: true }); 
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}

module.exports = { create, getOne, listAll, listForUser, updateStatus, update, remove };
