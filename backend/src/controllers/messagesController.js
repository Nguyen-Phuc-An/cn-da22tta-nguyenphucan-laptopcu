const db = require('../db');

/**
 * Lấy danh sách người dùng đã chat
 */
exports.getChatUsers = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT 
        cm.user_id,
        u.ten,
        u.email,
        COUNT(cm.id) as message_count,
        MAX(cm.tao_luc) as last_message_time
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.user_id IS NOT NULL
      GROUP BY cm.user_id
      ORDER BY MAX(cm.tao_luc) DESC
    `;

    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error getting chat users:', err);
    res.status(500).json({ error: 'Failed to get chat users' });
  }
};

/**
 * Lấy lịch sử chat với một người dùng
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const query = `
      SELECT id, user_id, noi_dung, la_nguoi_dung, tao_luc
      FROM chat_messages
      WHERE user_id = ?
      ORDER BY tao_luc ASC
    `;

    const [results] = await db.query(query, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Error getting chat history:', err);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

/**
 * Gửi tin nhắn mới
 */
exports.sendMessage = async (req, res) => {
  try {
    const { user_id, noi_dung, la_nguoi_dung } = req.body;

    if (!user_id || !noi_dung) {
      return res.status(400).json({ error: 'user_id and noi_dung required' });
    }

    const query = `
      INSERT INTO chat_messages (user_id, noi_dung, la_nguoi_dung, tao_luc)
      VALUES (?, ?, ?, NOW())
    `;

    const [result] = await db.query(query, [user_id, noi_dung, la_nguoi_dung || 1]);

    res.status(201).json({
      id: result.insertId,
      user_id,
      noi_dung,
      la_nguoi_dung: la_nguoi_dung || 1,
      tao_luc: new Date()
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
