const db = require('./db');

// Initialize Socket.IO event handlers
function initializeSocketHandlers(io) {
  // Main namespace for chat
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New connection: ${socket.id}`);

    // User joins chat
    socket.on('user_join', async (data) => {
      const { user_id } = data;
      socket.data.user_id = user_id;
      socket.data.isUser = true;
      socket.join(`user_${user_id}`);
      console.log(`[Socket.IO] User ${user_id} joined`);
    });

    // Admin joins chat interface
    socket.on('admin_join', () => {
      socket.data.isAdmin = true;
      socket.join('admin_room');
      console.log(`[Socket.IO] Admin joined`);
    });

    // User sends message
    socket.on('user_message', async (data) => {
      try {
        const { user_id, noi_dung } = data;
        console.log(`[Socket.IO] User ${user_id} sent message`);

        // Save message to database
        const query = `
          INSERT INTO chat_messages (user_id, noi_dung, la_nguoi_dung, tao_luc)
          VALUES (?, ?, 1, NOW())
        `;
        const [result] = await db.query(query, [user_id, noi_dung]);

        const message = {
          id: result.insertId,
          user_id,
          noi_dung,
          la_nguoi_dung: 1,
          tao_luc: new Date()
        };

        // Broadcast to admin
        io.to('admin_room').emit('user_message', message);
      } catch (err) {
        console.error('[Socket.IO] Error saving message:', err);
      }
    });

    // Admin sends message
    socket.on('admin_message', async (data) => {
      try {
        const { user_id, noi_dung } = data;
        console.log(`[Socket.IO] Admin sent message to user ${user_id}`);

        // Save message to database
        const query = `
          INSERT INTO chat_messages (user_id, noi_dung, la_nguoi_dung, tao_luc)
          VALUES (?, ?, 0, NOW())
        `;
        const [result] = await db.query(query, [user_id, noi_dung]);

        const message = {
          id: result.insertId,
          user_id,
          noi_dung,
          la_nguoi_dung: 0,
          tao_luc: new Date()
        };

        // Send to specific user and admin
        io.to(`user_${user_id}`).emit('receive_message', message);
        io.to('admin_room').emit('message_sent', message);
      } catch (err) {
        console.error('[Socket.IO] Error saving admin message:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeSocketHandlers };
