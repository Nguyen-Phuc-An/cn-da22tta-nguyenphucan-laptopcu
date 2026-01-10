const db = require('./db');

// Khởi tạo các handler cho Socket.IO
function initializeSocketHandlers(io) {
  // Xử lý kết nối mới
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Kết nối mới: ${socket.id}`);
    // Người dùng tham gia chat
    socket.on('user_join', async (data) => {
      const { user_id } = data;
      socket.data.user_id = user_id;
      socket.data.isUser = true;
      socket.join(`user_${user_id}`);
      console.log(`[Socket.IO] User ${user_id} joined`);
    });

    // Admin tham gia giao diện chat
    socket.on('admin_join', () => {
      socket.data.isAdmin = true;
      socket.join('admin_room');
      console.log(`[Socket.IO] Admin joined`);
    });

    // Người dùng gửi tin nhắn
    socket.on('user_message', async (data) => {
      try {
        const { user_id, noi_dung } = data;
        console.log(`[Socket.IO] User ${user_id} sent message`);

        // Lưu tin nhắn vào cơ sở dữ liệu
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

        // Phát tin nhắn đến admin
        io.to('admin_room').emit('user_message', message);
      } catch (err) {
        console.error('[Socket.IO] Error saving message:', err);
      }
    });

    // Admin gửi tin nhắn
    socket.on('admin_message', async (data) => {
      try {
        const { user_id, noi_dung } = data;
        console.log(`[Socket.IO] Admin sent message to user ${user_id}`);

        // Lưu tin nhắn vào cơ sở dữ liệu
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

        // Gửi đến người dùng cụ thể và admin
        io.to(`user_${user_id}`).emit('receive_message', message);
        io.to('admin_room').emit('message_sent', message);
      } catch (err) {
        console.error('[Socket.IO] Error saving admin message:', err);
      }
    });

    // Xử lý ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeSocketHandlers };
