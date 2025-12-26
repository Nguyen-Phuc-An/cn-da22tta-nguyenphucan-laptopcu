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
    const successStatuses = ['completed','shipping','confirmed'];
    const placeholders = successStatuses.map(()=>'?').join(',');

    const [[{ revenueToday }]] = await db.query(`SELECT COALESCE(SUM(tong_tien),0) AS revenueToday FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders})`, [toMySQL(todayStart), ...successStatuses]);
    const [[{ revenueMonth }]] = await db.query(`SELECT COALESCE(SUM(tong_tien),0) AS revenueMonth FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders})`, [toMySQL(monthStart), ...successStatuses]);
    const [[{ successfulOrdersToday }]] = await db.query(`SELECT COUNT(*) AS successfulOrdersToday FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders})`, [toMySQL(todayStart), ...successStatuses]);

    // Unread messages - count recent messages from chat_messages table
    const [[{ unreadMessages }]] = await db.query('SELECT COUNT(*) AS unreadMessages FROM chat_messages WHERE tao_luc >= ?', [toMySQL(todayStart)]);

    // Alerts: products out of stock, orders pending
    const [[{ pendingOrders }]] = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE trang_thai = 'pending'");

    // NEW orders created today (not viewed yet by admin)
    const [[{ newOrders }]] = await db.query("SELECT COUNT(*) AS newOrders FROM orders WHERE trang_thai = 'pending' AND DATE(tao_luc) = CURDATE()");

    // Revenue series: 7 days
    const daysStart = new Date(); daysStart.setHours(0,0,0,0); daysStart.setDate(daysStart.getDate() - 6);
    const [dayRows] = await db.query(`SELECT DATE(tao_luc) AS d, COALESCE(SUM(tong_tien),0) AS total, COUNT(*) AS cnt FROM orders WHERE tao_luc >= ? AND trang_thai IN (${placeholders}) GROUP BY DATE(tao_luc) ORDER BY DATE(tao_luc) ASC`, [toMySQL(daysStart), ...successStatuses]);
    console.log('DEBUG: daysStart=', daysStart.toISOString());
    console.log('DEBUG: toMySQL(daysStart)=', toMySQL(daysStart));
    console.log('DEBUG: successStatuses=', successStatuses);
    console.log('DEBUG: dayRows=', dayRows);
    // build last 7 days array
    const revenue7days = [];
    for (let i=0;i<7;i++){
      const d = new Date(daysStart); d.setDate(daysStart.getDate()+i);
      const key = d.toISOString().slice(0,10);
      const found = dayRows.find(r => String(r.d) === key);
      console.log(`DEBUG: day ${i}, key=${key}, found=${found ? 'yes' : 'no'}, d.d=${found?.d}`);
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

    // Brand statistics from purchased products
    const [brandData] = await db.query(`
      SELECT 
        p.tieu_de,
        COUNT(oi.id) as tong_so_lan
      FROM order_items oi
      JOIN products p ON oi.san_pham_id = p.id
      GROUP BY oi.san_pham_id
      ORDER BY tong_so_lan DESC
    `);

    // Extract brand names from product titles and aggregate
    const brandMap = {};
    const brands = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer', 'Sony', 'Samsung', 'LG', 'Toshiba'];
    
    brandData.forEach(item => {
      let foundBrand = null;
      for (const brand of brands) {
        if (item.tieu_de.includes(brand)) {
          foundBrand = brand;
          break;
        }
      }
      
      if (foundBrand) {
        if (!brandMap[foundBrand]) {
          brandMap[foundBrand] = 0;
        }
        brandMap[foundBrand] += item.tong_so_lan;
      }
    });

    const brandStats = Object.entries(brandMap)
      .map(([brand, count]) => ({ brand, count: Number(count) }))
      .sort((a, b) => b.count - a.count);

    res.json({
      products: { totalProducts: Number(totalProducts), sellingCount: Number(sellingCount), outOfStock: Number(outOfStock), hiddenCount: Number(hiddenCount) },
      users: { totalUsers: Number(totalUsers), newUsersWeek: Number(newUsersWeek) },
      orders: { revenueToday: Number(revenueToday), revenueMonth: Number(revenueMonth), successfulOrdersToday: Number(successfulOrdersToday), pendingOrders: Number(pendingOrders), newOrders: Number(newOrders), newOrdersCount: Number(newOrders) },
      messages: { unreadMessages: Number(unreadMessages), newMessagesCount: Number(unreadMessages) },
      revenue7days, revenue12months, brandStats
    });
  } catch (err) {
    console.error('admin stats error', err && err.message ? err.message : err);
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
}

async function getDayOrders(req, res) {
  try {
    // Ensure only admin users can access
    if (!req.user || !(req.user.role === 'admin' || req.user.isAdmin || req.user.is_admin)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date parameter required' });
    }

    const successStatuses = ['completed','shipping','confirmed'];
    const placeholders = successStatuses.map(()=>'?').join(',');

    // Get orders for the specified date with items
    const [orders] = await db.query(`
      SELECT 
        o.id, o.khach_hang_id, o.ten_nguoi_nhan, o.dien_thoai_nhan, 
        o.dia_chi_nhan, o.tong_tien, o.trang_thai, o.ghi_chu, o.tao_luc,
        u.ten as khach_hang_ten, u.email as khach_hang_email
      FROM orders o
      LEFT JOIN users u ON o.khach_hang_id = u.id
      WHERE DATE(o.tao_luc) = ? AND o.trang_thai IN (${placeholders})
      ORDER BY o.tao_luc DESC
    `, [date, ...successStatuses]);

    // For each order, fetch its items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await db.query(`
          SELECT 
            oi.id, oi.don_hang_id, oi.san_pham_id, oi.so_luong, oi.don_gia, oi.thanh_tien,
            p.tieu_de, p.tieu_de as ten
          FROM order_items oi
          LEFT JOIN products p ON oi.san_pham_id = p.id
          WHERE oi.don_hang_id = ?
        `, [order.id]);
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);
  } catch (err) {
    console.error('admin get day orders error', err && err.message ? err.message : err);
    res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
}

module.exports = { stats, getDayOrders };
