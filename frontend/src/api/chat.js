import io from 'socket.io-client';

let socket = null;

// Khởi tạo kết nối Socket.IO - sử dụng namespace chính (không phải /chat)
export function initializeSocket() {
  if (!socket) {
    socket = io('http://localhost:3000', {
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}
// Lấy instance của socket  
export function getSocket() {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}
// Người dùng tham gia phòng chat
export function joinChat(user_id) {
  const s = getSocket();
  console.log('[API] User joining chat with ID:', user_id);
  s.emit('user_join', { user_id });
}

// Người dùng gửi tin nhắn
export function sendMessage(user_id, noi_dung) {
  const s = getSocket();
  console.log('[API] User sending message, socket connected:', s.connected);
  if (!s.connected) {
    console.error('[API] Socket not connected! Cannot send message');
    return;
  }
  s.emit('user_message', { user_id, noi_dung });
}

// Admin tham gia phòng chat
export function adminJoin() {
  const s = getSocket();
  console.log('[API] Admin joining chat');
  s.emit('admin_join', {});
}

// Admin gửi tin nhắn đến người dùng
export function sendAdminMessage(user_id, noi_dung) {
  const s = getSocket();
  console.log('[API] Admin sending message to user:', user_id);
  if (!s.connected) {
    console.error('[API] Socket not connected! Cannot send message');
    return;
  }
  s.emit('admin_message', { user_id, noi_dung });
}

// Nghe tin nhắn từ người dùng
export function onUserMessage(callback) {
  const s = getSocket();
  s.on('user_message', callback);
}

// Nghe tin nhắn từ admin
export function onAdminMessage(callback) {
  const s = getSocket();
  s.on('admin_message', callback);
}

// Nghe tin nhắn đến
export function onReceiveMessage(callback) {
  const s = getSocket();
  s.on('receive_message', callback);
}

// Nghe sự kiện kết nối socket
export function onSocketConnected(callback) {
  const s = getSocket();
  s.on('connect', callback);
}

// Nghe sự kiện ngắt kết nối socket
export function onSocketDisconnected(callback) {
  const s = getSocket();
  s.on('disconnect', callback);
}

// Nghe lỗi socket
export function onSocketError(callback) {
  const s = getSocket();
  s.on('error', callback);
}

// Ngắt kết nối socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
