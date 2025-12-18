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
    <div className="admin-panel" style={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '0'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fff',
        flexShrink: 0
      }}>
        <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#333' }}>Chat Trực Tiếp</h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Giao tiếp với khách hàng</p>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '0',
        flex: 1,
        minHeight: '0',
        overflow: 'hidden'
      }}>
        {/* Users List */}
        <div style={{ 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafafa',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '15px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fff'
          }}>
            <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#333' }}>Khách hàng</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
              {users.length} người đang chat
            </p>
          </div>
          
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fff'
          }}>
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box',
                color: '#333'
              }}
            />
          </div>
          
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: '0'
          }}>
            {users.length === 0 ? (
              <div style={{ 
                padding: '30px 20px',
                textAlign: 'center',
                color: '#999'
              }}>
                <p style={{ fontSize: '14px', margin: '0' }}>Chưa có cuộc trò chuyện</p>
              </div>
            ) : (
              users.filter(user => 
                (user.ten || 'Khách hàng').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
              ).map((user) => (
                <div
                  key={user.user_id}
                  onClick={() => handleSelectUser(user.user_id)}
                  style={{
                    padding: '15px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === user.user_id ? '#fff' : 'transparent',
                    borderLeft: selectedUserId === user.user_id ? '4px solid #667eea' : '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUserId !== user.user_id) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUserId !== user.user_id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: '0' }}>
                      <div style={{ 
                        fontWeight: '600', 
                        fontSize: '15px',
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.ten || 'Khách hàng'}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#999',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '4px'
                      }}>
                        {user.email || 'Không có email'}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#bbb',
                        marginTop: '6px'
                      }}>
                        {user.message_count || 0} tin nhắn
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div style={{ 
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                flexShrink: 0
              }}>
                <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                  Chat với khách hàng
                </h3>
              </div>

              {/* Messages */}
              <div style={{ 
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '0'
              }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#999'
                  }}>
                    <p style={{ fontSize: '14px', margin: '0' }}>Chưa có tin nhắn</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={msg.id || `msg-${i}`}
                      style={{
                        display: 'flex',
                        justifyContent: msg.la_nguoi_dung ? 'flex-start' : 'flex-end',
                        marginBottom: '0'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: msg.la_nguoi_dung ? '#f3f4f6' : '#667eea',
                          color: msg.la_nguoi_dung ? '#333' : 'white'
                        }}
                      >
                        <p style={{ 
                          margin: '0 0 6px 0', 
                          fontSize: '12px',
                          fontWeight: '600',
                          opacity: 0.8
                        }}>
                          {msg.la_nguoi_dung ? 'Khách hàng' : 'Admin'}
                        </p>
                        <p style={{ 
                          margin: '0', 
                          wordWrap: 'break-word',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}>
                          {msg.noi_dung}
                        </p>
                        <p style={{ 
                          fontSize: '11px', 
                          margin: '6px 0 0 0', 
                          opacity: 0.7
                        }}>
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
              <form onSubmit={handleSendReply} style={{ 
                borderTop: '1px solid #e5e7eb', 
                padding: '15px 20px',
                backgroundColor: '#fafafa',
                display: 'flex',
                gap: '12px',
                flexShrink: 0
              }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  rows="2"
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'none',
                    color: '#333'
                  }}
                />
                <button 
                  type="submit"
                  disabled={sending}
                  style={{ 
                    padding: '10px 20px',
                    backgroundColor: sending ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) e.target.style.backgroundColor = '#5568d3';
                  }}
                  onMouseLeave={(e) => {
                    if (!sending) e.target.style.backgroundColor = '#667eea';
                  }}
                >
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '16px', margin: '0 0 10px 0' }}>👋</p>
                <p style={{ fontSize: '14px', margin: '0' }}>Chọn khách hàng để bắt đầu trò chuyện</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
