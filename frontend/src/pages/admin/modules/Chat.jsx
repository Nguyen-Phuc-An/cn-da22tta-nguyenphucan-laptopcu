import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../../../services/apiClient';
import io from 'socket.io-client';

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Load users who have chatted
  const loadChatUsers = useCallback(async () => {
    try {
      const res = await apiFetch('/messages/chat/users');
      const data = Array.isArray(res) ? res : res?.data || [];
      console.log('[Chat] Loaded chat users:', data.length);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('[Chat] Error loading chat users:', err);
      setLoading(false);
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    loadChatUsers();

    // Initialize WebSocket connection
    if (socketRef.current) return;

    const socket = io('http://localhost:3000', { 
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: false
    });

    socket.on('connect', () => {
      console.log('[WebSocket] Admin connected:', socket.id);
      socket.emit('admin_join');
    });

    socket.on('user_message', (data) => {
      console.log('[WebSocket] Received user message:', data);
      // Update messages if this is from the selected user
      if (data.user_id === selectedUserId) {
        setMessages(prev => [...prev, {
          id: data.id,
          noi_dung: data.noi_dung,
          la_nguoi_dung: 1,
          tao_luc: data.tao_luc
        }]);
      }
      // Refresh users list to show new/updated conversations
      loadChatUsers();
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Admin disconnected');
    });

    socketRef.current = socket;

    return () => {
      // Don't disconnect to maintain connection
    };
  }, [loadChatUsers, selectedUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectUser = async (userId) => {
    console.log('[Chat] Selected user:', userId);
    setSelectedUserId(userId);
    setMessages([]);

    try {
      // Load chat history for this user
      const res = await apiFetch(`/messages/chat/user/${userId}`);
      const data = Array.isArray(res) ? res : res?.data || [];
      console.log('[Chat] Loaded messages for user:', data.length);
      setMessages(data);
    } catch (err) {
      console.error('[Chat] Error loading messages:', err);
      setMessages([]);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUserId) return;

    setSending(true);
    try {
      if (socketRef.current && socketRef.current.connected) {
        // Send via WebSocket
        socketRef.current.emit('admin_message', {
          user_id: selectedUserId,
          noi_dung: replyText
        });
        setReplyText('');
        
        // Add message to UI immediately
        setMessages(prev => [...prev, {
          id: Date.now(),
          noi_dung: replyText,
          la_nguoi_dung: 0,
          tao_luc: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('[Chat] Error sending message:', err);
      alert('Lỗi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">    
      {/* Main Content */}
      <div className="chat-grid">
        {/* Users List */}
        <div className="chat-users-panel">
          <div className="chat-users-header">
            <h3>Khách hàng</h3>
            <p className="chat-users-count">{users.length} người đang chat</p>
          </div>
          
          <div className="chat-search">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="chat-users-list">
            {users.length === 0 ? (
              <div className="chat-users-empty">Chưa có cuộc trò chuyện</div>
            ) : (
              users.filter(user => 
                (user.ten || 'Khách hàng').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => handleSelectUser(user.user_id)}
                  className={`chat-user-item ${selectedUserId === user.user_id ? 'active' : ''}`}
                >
                  <div className="chat-user-name">{user.ten || 'Khách hàng'}</div>
                  <div className="chat-user-email">{user.email || 'Không có email'}</div>
                  <div className="chat-user-count">{user.message_count || 0} tin nhắn</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <h3>Chat với khách hàng</h3>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="chat-empty">
                    <p style={{ fontSize: '14px', margin: '0' }}>Chưa có tin nhắn</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={msg.id || `msg-${i}`}
                      className={`chat-message ${msg.la_nguoi_dung ? 'user' : 'admin'}`}
                    >
                      <div className={`chat-message-bubble ${msg.la_nguoi_dung ? 'user' : 'admin'}`}>
                        <p className="chat-message-sender">
                          {msg.la_nguoi_dung ? 'Khách hàng' : 'Admin'}
                        </p>
                        <p className="chat-message-text">{msg.noi_dung}</p>
                        <p className="chat-message-time">
                          {msg.tao_luc ? new Date(msg.tao_luc).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                <form onSubmit={handleSendReply} className="chat-input-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    rows="2"
                    className="chat-textarea"
                  />
                  <button 
                    type="submit"
                    disabled={sending}
                    className="chat-send-btn"
                  >
                    {sending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <div>
                <div className="chat-empty-icon">👋</div>
                <p className="chat-empty-text">Chọn khách hàng để bắt đầu trò chuyện</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
