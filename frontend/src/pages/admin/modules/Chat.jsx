import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../../services/apiClient';
import io from 'socket.io-client';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineCustomers, setOnlineCustomers] = useState(new Set());
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Skip if socket already exists (prevents reconnection in Strict Mode)
    if (socketRef.current) return;

    const loadConversations = async () => {
      try {
        const res = await apiFetch('/messages/chat/conversations');
        let data = Array.isArray(res) ? res : res?.data || [];
        
        // Deduplicate conversations
        const uniqueMap = new Map();
        data.forEach(conv => {
          const convId = conv.user_id ? `user_${conv.user_id}` : (conv.email_nguoi_gui || 'guest');
          const existing = uniqueMap.get(convId);
          if (!existing || new Date(conv.tao_luc || 0) > new Date(existing.tao_luc || 0)) {
            uniqueMap.set(convId, conv);
          }
        });
        data = Array.from(uniqueMap.values());
        
        setConversations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading conversations:', err);
        setLoading(false);
      }
    };
    loadConversations();

    // Initialize WebSocket connection
    const socket = io('http://localhost:3000/chat', { 
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      forceNew: false
    });

    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);
      // Admin joins chat namespace
      socket.emit('get_conversations');
    });

    socket.on('conversations_list', (data) => {
      console.log('[WebSocket] Received conversations list');
      if (data.conversations) {
        // Deduplicate conversations using a Map
        const uniqueMap = new Map();
        data.conversations.forEach(conv => {
          const convId = conv.user_id ? `user_${conv.user_id}` : (conv.email_nguoi_gui || 'guest');
          // Keep the one with the latest message
          const existing = uniqueMap.get(convId);
          if (!existing || new Date(conv.tao_luc || 0) > new Date(existing.tao_luc || 0)) {
            uniqueMap.set(convId, conv);
          }
        });
        const uniqueConversations = Array.from(uniqueMap.values());
        console.log(`[Chat] Deduped conversations: ${data.conversations.length} -> ${uniqueConversations.length}`);
        setConversations(uniqueConversations);
      }
    });

    socket.on('user_online', (data) => {
      console.log('[WebSocket] User online:', data.conversationId);
      setOnlineCustomers(prev => new Set([...prev, data.conversationId]));
    });

    socket.on('user_offline', (data) => {
      console.log('[WebSocket] User offline:', data.conversationId);
      setOnlineCustomers(prev => {
        const updated = new Set(prev);
        updated.delete(data.conversationId);
        return updated;
      });
    });

    socket.on('receive_message', (data) => {
      console.log('[WebSocket] Received message:', data);
      setMessages(prev => [...prev, {
        id: data.id,
        noi_dung: data.content,
        ten_nguoi_gui: data.sender_name,
        la_nguoi_dung: data.sender_type === 'user' ? 1 : 0,
        tao_luc: data.timestamp
      }]);
    });

    socket.on('message_history', (data) => {
      console.log('[WebSocket] Received message history:', data.messages?.length);
      if (data.messages) {
        setMessages(data.messages);
      }
    });

    socket.on('error', (data) => {
      console.error('[WebSocket] Error:', data.message);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    socketRef.current = socket;
    
    return () => {
      // Only disconnect on component unmount, not on re-render
      if (socketRef.current === socket) {
        // Don't call disconnect() to avoid React Strict Mode issues
        // The socket will auto-cleanup on unmount
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (convId) => {
    console.log('[Chat] Selected conversation:', convId);
    setSelectedConversation(convId);
    setMessages([]);
    
    let historyLoaded = false;

    // Set a timeout to fallback to REST API if WebSocket doesn't respond
    const fallbackTimer = setTimeout(async () => {
      if (!historyLoaded) {
        console.log('[Chat] WebSocket timeout, using REST API fallback');
        try {
          const res = await apiFetch(`/messages/chat/${convId}`);
          const data = Array.isArray(res) ? res : res?.data || [];
          console.log('[Chat] Loaded messages via REST:', data.length);
          setMessages(data);
          historyLoaded = true;
        } catch (err) {
          console.error('[Chat] Error loading messages via REST:', err);
        }
      }
    }, 2000); // 2 second timeout

    // Use WebSocket to join conversation and load history
    if (socketRef.current && socketRef.current.connected) {
      console.log('[Chat] Sending admin_join via WebSocket');
      socketRef.current.emit('admin_join', { conversationId: convId });
      
      // Once we get the message_history event, we know WebSocket worked
      const handleHistoryReceived = () => {
        historyLoaded = true;
        clearTimeout(fallbackTimer);
        socketRef.current.off('message_history', handleHistoryReceived);
      };
      
      socketRef.current.on('message_history', handleHistoryReceived);
    } else {
      console.log('[Chat] WebSocket not connected, using REST API directly');
      clearTimeout(fallbackTimer);
      // Fallback to REST API if WebSocket not ready
      try {
        const res = await apiFetch(`/messages/chat/${convId}`);
        const data = Array.isArray(res) ? res : res?.data || [];
        console.log('[Chat] Loaded messages via REST:', data.length);
        setMessages(data);
        historyLoaded = true;
      } catch (err) {
        console.error('[Chat] Error loading messages:', err);
        setMessages([]);
      }
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;
    
    setSending(true);
    try {
      if (socketRef.current && socketRef.current.connected) {
        // Send via WebSocket
        socketRef.current.emit('send_message', {
          content: replyText,
          conversationId: selectedConversation
        });
        setReplyText('');
      } else {
        // Fallback to REST API
        await apiFetch('/messages/chat', {
          method: 'POST',
          body: JSON.stringify({
            conversation_id: selectedConversation,
            message: replyText,
            is_staff: true
          })
        });
        setReplyText('');
        // Reload messages via REST API
        const res = await apiFetch(`/messages/chat/${selectedConversation}`);
        const data = Array.isArray(res) ? res : res?.data || [];
        setMessages(data);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Lỗi gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="admin-panel" style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>;
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
        {/* Conversations List */}
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
            <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#333' }}>Danh sách khách hàng</h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
              {conversations.length} cuộc hội thoại
            </p>
          </div>
          
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: '0'
          }}>
            {conversations.length === 0 ? (
              <div style={{ 
                padding: '30px 20px',
                textAlign: 'center',
                color: '#999'
              }}>
                <p style={{ fontSize: '14px', margin: '0' }}>Chưa có cuộc hội thoại</p>
              </div>
            ) : (
              conversations.map((conv, idx) => {
                const convId = conv.user_id ? `user_${conv.user_id}` : (conv.email_nguoi_gui || 'guest');
                const isOnline = onlineCustomers.has(convId);
                return (
                  <div
                    key={convId || idx}
                    onClick={() => handleSelectConversation(convId)}
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      backgroundColor: selectedConversation === convId ? '#fff' : 'transparent',
                      borderLeft: selectedConversation === convId ? '4px solid #667eea' : '4px solid transparent',
                      transition: 'all 0.2s ease',
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (selectedConversation !== convId) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedConversation !== convId) {
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
                          {conv.ten_nguoi_gui || 'Khách hàng'}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#999',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: '4px'
                        }}>
                          {conv.email_nguoi_gui || 'Không có email'}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#bbb',
                          marginTop: '6px'
                        }}>
                          {conv.message_count || 0} tin nhắn
                        </div>
                      </div>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isOnline ? '#10b981' : '#d1d5db',
                        flexShrink: 0,
                        marginTop: '2px'
                      }} title={isOnline ? 'Đang online' : 'Offline'} />
                    </div>
                  </div>
                );
              })
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
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{ 
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                flexShrink: 0
              }}>
                <h3 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                  Trò chuyện
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
                        justifyContent: !msg.la_nguoi_dung ? 'flex-end' : 'flex-start',
                        marginBottom: '0'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          backgroundColor: !msg.la_nguoi_dung ? '#667eea' : '#f3f4f6',
                          color: !msg.la_nguoi_dung ? 'white' : '#333'
                        }}
                      >
                        <p style={{ 
                          margin: '0 0 6px 0', 
                          fontSize: '12px',
                          fontWeight: '600',
                          opacity: 0.8
                        }}>
                          {msg.ten_nguoi_gui || (!msg.la_nguoi_dung ? 'Support' : 'Khách')}
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
                    fontColor: '#333'
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
                <p style={{ fontSize: '14px', margin: '0' }}>Chọn cuộc hội thoại để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
