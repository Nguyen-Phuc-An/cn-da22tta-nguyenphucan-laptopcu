const db = require('../db');

// Send a chat message
async function sendMessage({ user_id = null, email_nguoi_gui = null, content, sender_name = null, is_user = true }) {
  if (!content || (!user_id && !email_nguoi_gui)) {
    throw new Error('content and (user_id or email_nguoi_gui) required');
  }

  const [res] = await db.query(
    'INSERT INTO chat_messages (user_id, email_nguoi_gui, noi_dung, ten_nguoi_gui, la_nguoi_dung, tao_luc) VALUES (?, ?, ?, ?, ?, NOW())',
    [user_id || null, email_nguoi_gui || null, content, sender_name || null, is_user ? 1 : 0]
  );
  return res.insertId;
}

// Get messages for a conversation (by user_id or email)
async function getMessages(identifier) {
  const isUserId = !isNaN(identifier);
  let query, params;

  if (isUserId) {
    query = 'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY tao_luc ASC';
    params = [Number(identifier)];
  } else {
    query = 'SELECT * FROM chat_messages WHERE email_nguoi_gui = ? ORDER BY tao_luc ASC';
    params = [identifier];
  }

  const [rows] = await db.query(query, params);
  return rows;
}

// Get all conversations (grouped by user_id or email)
async function getConversations() {
  const [rows] = await db.query(`
    SELECT 
      CASE 
        WHEN user_id IS NOT NULL THEN CONCAT('user_', user_id)
        ELSE COALESCE(email_nguoi_gui, 'guest')
      END as conversation_id,
      user_id,
      email_nguoi_gui,
      MAX(ten_nguoi_gui) as ten_nguoi_gui,
      MAX(tao_luc) as last_message_time,
      COUNT(*) as message_count
    FROM chat_messages
    GROUP BY user_id, email_nguoi_gui
    ORDER BY last_message_time DESC
  `);
  return rows;
}

// Get conversation details with messages
async function getConversationWithMessages(identifier) {
  let query, params;

  // Check if identifier is in format "user_123"
  if (identifier.startsWith('user_')) {
    const user_id = Number(identifier.substring(5));
    query = `SELECT * FROM chat_messages WHERE user_id = ? ORDER BY tao_luc ASC`;
    params = [user_id];
  } else {
    // Assume it's an email
    query = `SELECT * FROM chat_messages WHERE email_nguoi_gui = ? ORDER BY tao_luc ASC`;
    params = [identifier];
  }

  const [rows] = await db.query(query, params);
  return rows;
}

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  getConversationWithMessages
};
