import io from 'socket.io-client';

let socket = null;

// Initialize Socket.IO connection - uses main namespace (not /chat)
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

// Get socket instance
export function getSocket() {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}

// User joins chat room
export function joinChat(user_id) {
  const s = getSocket();
  console.log('[API] User joining chat with ID:', user_id);
  s.emit('user_join', { user_id });
}

// Send message as user
export function sendMessage(user_id, noi_dung) {
  const s = getSocket();
  console.log('[API] User sending message, socket connected:', s.connected);
  if (!s.connected) {
    console.error('[API] Socket not connected! Cannot send message');
    return;
  }
  s.emit('user_message', { user_id, noi_dung });
}

// Admin joins chat room
export function adminJoin() {
  const s = getSocket();
  console.log('[API] Admin joining chat');
  s.emit('admin_join', {});
}

// Admin sends message to user
export function sendAdminMessage(user_id, noi_dung) {
  const s = getSocket();
  console.log('[API] Admin sending message to user:', user_id);
  if (!s.connected) {
    console.error('[API] Socket not connected! Cannot send message');
    return;
  }
  s.emit('admin_message', { user_id, noi_dung });
}

// Listen for messages from user
export function onUserMessage(callback) {
  const s = getSocket();
  s.on('user_message', callback);
}

// Listen for messages from admin
export function onAdminMessage(callback) {
  const s = getSocket();
  s.on('admin_message', callback);
}

// Listen for incoming messages
export function onReceiveMessage(callback) {
  const s = getSocket();
  s.on('receive_message', callback);
}

// Listen for socket connected
export function onSocketConnected(callback) {
  const s = getSocket();
  s.on('connect', callback);
}

// Listen for socket disconnected
export function onSocketDisconnected(callback) {
  const s = getSocket();
  s.on('disconnect', callback);
}

// Listen for socket errors
export function onSocketError(callback) {
  const s = getSocket();
  s.on('error', callback);
}

// Disconnect socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
