const messagesModel = require('./models/messages');

// Initialize Socket.IO event handlers
function initializeSocketHandlers(io) {
  // Namespace for chat
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);

    // User joins a chat room
    socket.on('join_chat', async (data) => {
      const { user_id, email_nguoi_gui, sender_name } = data;
      const conversationId = user_id ? `user_${user_id}` : email_nguoi_gui;

      // Store user info on socket
      socket.data.user_id = user_id;
      socket.data.email_nguoi_gui = email_nguoi_gui;
      socket.data.sender_name = sender_name || 'Guest';
      socket.data.conversationId = conversationId;

      // Join room for this conversation
      socket.join(conversationId);
      console.log(`[Socket.IO] ${socket.data.sender_name} joined ${conversationId}`);

      // Notify admin that a user is online
      socket.to(`admin_${conversationId}`).emit('user_online', {
        conversationId,
        user_id,
        email_nguoi_gui,
        sender_name: socket.data.sender_name
      });
    });

    // Admin joins a conversation room
    socket.on('admin_join', async (data) => {
      const { conversationId } = data;
      socket.data.isAdmin = true;
      socket.data.conversationId = conversationId;
      
      // Extract user info from conversationId for linking messages
      if (conversationId.startsWith('user_')) {
        socket.data.user_id = Number(conversationId.substring(5));
      } else {
        socket.data.email_nguoi_gui = conversationId;
      }

      socket.join(conversationId);
      socket.join(`admin_${conversationId}`);
      console.log(`[Socket.IO] Admin joined ${conversationId}`);

      // Load and send message history
      try {
        const messages = await messagesModel.getConversationWithMessages(conversationId);
        socket.emit('message_history', { messages });
        console.log(`[Socket.IO] Sent ${messages.length} messages to admin`);
      } catch (err) {
        console.error('Error loading message history:', err);
      }

      // Notify customer that admin is online
      socket.to(conversationId).emit('admin_online', { conversationId });
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { content, conversationId } = data;
        const isAdmin = socket.data.isAdmin || false;

        console.log(`[Socket.IO] Sending message from ${isAdmin ? 'admin' : 'user'}:`, {
          user_id: socket.data.user_id,
          email_nguoi_gui: socket.data.email_nguoi_gui,
          content,
          isAdmin
        });

        // Save to database
        const messageId = await messagesModel.sendMessage({
          user_id: socket.data.user_id || null,
          email_nguoi_gui: socket.data.email_nguoi_gui || null,
          content,
          sender_name: socket.data.sender_name || 'Support',
          is_user: !isAdmin
        });

        // Broadcast message to room
        chatNamespace.to(conversationId).emit('receive_message', {
          id: messageId,
          content,
          sender_name: socket.data.sender_name || 'Support',
          sender_type: isAdmin ? 'admin' : 'user',
          timestamp: new Date()
        });

        console.log(`[Socket.IO] Message saved: ${messageId}`);
      } catch (err) {
        console.error('send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Get message history
    socket.on('get_history', async (data) => {
      try {
        const { identifier } = data; // user_id or email
        const messages = await messagesModel.getMessages(identifier);
        socket.emit('message_history', { messages });
      } catch (err) {
        console.error('get_history error:', err);
        socket.emit('error', { message: 'Failed to load history' });
      }
    });

    // Admin: Get all conversations
    socket.on('get_conversations', async () => {
      try {
        const conversations = await messagesModel.getConversations();
        socket.emit('conversations_list', { conversations });
      } catch (err) {
        console.error('get_conversations error:', err);
        socket.emit('error', { message: 'Failed to load conversations' });
      }
    });

    // Leave chat
    socket.on('leave_chat', () => {
      const { conversationId } = socket.data;
      if (conversationId) {
        socket.leave(conversationId);
        socket.to(conversationId).emit('user_offline', { conversationId });
        console.log(`[Socket.IO] User left ${conversationId}`);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const { conversationId, sender_name } = socket.data;
      if (conversationId) {
        socket.to(conversationId).emit('user_offline', { conversationId, sender_name });
      }
      console.log(`[Socket.IO] User disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeSocketHandlers };
