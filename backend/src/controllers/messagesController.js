const messagesModel = require('../models/messages');

// REST: Get chat history for a user/email
async function getChatHistory(req, res) {
  try {
    const { identifier } = req.params; // user_id or email
    const messages = await messagesModel.getMessages(identifier);
    res.json(messages);
  } catch (err) {
    console.error('getChatHistory error:', err);
    res.status(500).json({ error: err.message });
  }
}

// REST: Get all conversations
async function getConversationsList(req, res) {
  try {
    const conversations = await messagesModel.getConversations();
    res.json(conversations);
  } catch (err) {
    console.error('getConversationsList error:', err);
    res.status(500).json({ error: err.message });
  }
}

// REST: Get single conversation with all messages
async function getConversation(req, res) {
  try {
    const { identifier } = req.params;
    const messages = await messagesModel.getConversationWithMessages(identifier);
    res.json(messages);
  } catch (err) {
    console.error('getConversation error:', err);
    res.status(500).json({ error: err.message });
  }
}

// REST: Send a message (fallback for non-Socket.IO)
async function sendMessage(req, res) {
  try {
    const { user_id, email_nguoi_gui, content, sender_name, is_user } = req.body;
    
    if (!content || (!user_id && !email_nguoi_gui)) {
      return res.status(400).json({ error: 'content and (user_id or email_nguoi_gui) required' });
    }

    const id = await messagesModel.sendMessage({
      user_id: user_id || null,
      email_nguoi_gui: email_nguoi_gui || null,
      content,
      sender_name,
      is_user: is_user !== undefined ? is_user : true
    });

    res.status(201).json({ id, timestamp: new Date() });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getChatHistory,
  getConversationsList,
  getConversation,
  sendMessage
};
