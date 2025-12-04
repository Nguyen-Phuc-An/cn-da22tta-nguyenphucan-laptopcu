const db = require('../db');

// Helper to format JS Date to MySQL DATETIME string
function toMySQL(dt) {
  const pad = n => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

async function stats(req, res) {
  try {
    // Ensure only admin users can access
    if (!req.user || !(req.user.role === 'admin' || req.user.isAdmin || req.user.is_admin)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    // Totals for products
    const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ sellingCount }]] = await db.query("SELECT COUNT(*) AS sellingCount FROM products WHERE trang_thai = 'available'");
    const [[{ outOfStock }]] = await db.query('SELECT COUNT(*) AS outOfStock FROM products WHERE so_luong = 0');
    const [[{ hiddenCount }]] = await db.query("SELECT COUNT(*) AS hiddenCount FROM products WHERE trang_thai = 'hidden'");

    // Users
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');

    // New users this week
    const weekStart = new Date();
    weekStart.setHours(0,0,0,0);
    weekStart.setDate(weekStart.getDate() - 6); // last 7 days
    const [[{ newUsersWeek }]] = await db.query('SELECT COUNT(*) AS newUsersWeek FROM users WHERE tao_luc >= ?', [toMySQL(weekStart)]);

    // Orders: revenue today and this month, count of successful orders
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const monthStart = new Date(); monthStart.setHours(0,0,0,0); monthStart.setDate(1);
    const successStatuses = ['paid','completed','shipped','processing'];
    const placeholders = successStatuses.map(()=>'?').join(',');

    const [[{ revenueToday }]] = await db.query(`SELECT COALESCE(SUM(tong_tien),0) AS revenueToday FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders})`, [toMySQL(todayStart), ...successStatuses]);
    const [[{ revenueMonth }]] = await db.query(`SELECT COALESCE(SUM(tong_tien),0) AS revenueMonth FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders})`, [toMySQL(monthStart), ...successStatuses]);
    const [[{ successfulOrdersToday }]] = await db.query(`SELECT COUNT(*) AS successfulOrdersToday FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders})`, [toMySQL(todayStart), ...successStatuses]);

    // Unread messages - count recent messages from chat_messages table
    const [[{ unreadMessages }]] = await db.query('SELECT COUNT(*) AS unreadMessages FROM chat_messages WHERE tao_luc >= ?', [toMySQL(todayStart)]);

    // Alerts: products out of stock, orders pending
    const [[{ pendingOrders }]] = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE trang_thai = 'pending'");

    // Revenue series: 7 days
    const daysStart = new Date(); daysStart.setHours(0,0,0,0); daysStart.setDate(daysStart.getDate() - 6);
    const [dayRows] = await db.query(`SELECT DATE(tao_luc) AS d, COALESCE(SUM(tong_tien),0) AS total, COUNT(*) AS cnt FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders}) GROUP BY DATE(tao_luc) ORDER BY DATE(tao_luc) ASC`, [toMySQL(daysStart), ...successStatuses]);
    // build last 7 days array
    const revenue7days = [];
    for (let i=0;i<7;i++){
      const d = new Date(daysStart); d.setDate(daysStart.getDate()+i);
      const key = d.toISOString().slice(0,10);
      const found = dayRows.find(r => String(r.d) === key);
      revenue7days.push({ date: key, total: found ? Number(found.total) : 0, orders: found ? Number(found.cnt) : 0 });
    }

    // Revenue per month: last 12 months
    const monthsStart = new Date(); monthsStart.setHours(0,0,0,0); monthsStart.setMonth(monthsStart.getMonth() - 11); monthsStart.setDate(1);
    const [monthRows] = await db.query(`SELECT DATE_FORMAT(tao_luc, '%Y-%m') AS m, COALESCE(SUM(tong_tien),0) AS total, COUNT(*) AS cnt FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders}) GROUP BY m ORDER BY m ASC`, [toMySQL(monthsStart), ...successStatuses]);
    const revenue12months = [];
    for (let i=0;i<12;i++){
      const d = new Date(monthsStart); d.setMonth(monthsStart.getMonth()+i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const found = monthRows.find(r => String(r.m) === key);
      revenue12months.push({ month: key, total: found ? Number(found.total) : 0, orders: found ? Number(found.cnt) : 0 });
    }

    res.json({
      products: { totalProducts: Number(totalProducts), sellingCount: Number(sellingCount), outOfStock: Number(outOfStock), hiddenCount: Number(hiddenCount) },
      users: { totalUsers: Number(totalUsers), newUsersWeek: Number(newUsersWeek) },
      orders: { revenueToday: Number(revenueToday), revenueMonth: Number(revenueMonth), successfulOrdersToday: Number(successfulOrdersToday), pendingOrders: Number(pendingOrders) },
      messages: { unreadMessages: Number(unreadMessages) },
      revenue7days, revenue12months
    });
  } catch (err) {
    console.error('admin stats error', err && err.message ? err.message : err);
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
}

module.exports = { stats };
