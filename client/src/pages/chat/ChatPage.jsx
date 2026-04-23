import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { Send, MessageCircle, Circle, ArrowLeft } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, clearUnread } = useSocket();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // ── Fetch conversations ──
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Auto-open conversation from URL param ──
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    if (targetUserId && user) {
      (async () => {
        try {
          const res = await axios.post('/chat/conversations', { targetUserId });
          const conv = res.data.conversation;
          if (conv) {
            setActiveConversation(conv);
            setShowSidebar(false);
            fetchConversations();
          }
        } catch (err) {
          if (err.response?.status === 403) {
            toast.error('You must be connected to chat with this user');
          } else {
            toast.error('Could not start conversation');
          }
        }
      })();
    }
  }, [searchParams, user, fetchConversations]);

  // ── Fetch messages when active conversation changes ──
  useEffect(() => {
    if (!activeConversation) return;
    const fetchMessages = async () => {
      setMessagesLoading(true);
      try {
        const res = await axios.get(`/chat/conversations/${activeConversation._id}/messages`);
        setMessages(res.data.messages || []);
        clearUnread(activeConversation._id);
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();

    // Join socket room
    if (socket) {
      socket.emit('join_conversation', activeConversation._id);
      socket.emit('mark_read', { conversationId: activeConversation._id });
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation?._id, socket]);

  // ── Socket listeners ──
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message }) => {
      if (message.conversation === activeConversation?._id) {
        setMessages(prev => [...prev, message]);
        socket.emit('mark_read', { conversationId: activeConversation._id });
      }
      fetchConversations();
    };

    const handleTyping = ({ userId, conversationId }) => {
      if (conversationId === activeConversation?._id) {
        setTypingUsers(prev => ({ ...prev, [userId]: true }));
      }
    };

    const handleStopTyping = ({ userId, conversationId }) => {
      if (conversationId === activeConversation?._id) {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, activeConversation?._id, fetchConversations]);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;

    socket.emit('send_message', {
      conversationId: activeConversation._id,
      content: newMessage.trim()
    });
    socket.emit('stop_typing', { conversationId: activeConversation._id });
    setNewMessage('');
    inputRef.current?.focus();
  };

  // ── Typing indicator ──
  const handleTypingInput = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeConversation) return;

    socket.emit('typing', { conversationId: activeConversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConversation._id });
    }, 2000);
  };

  // ── Helpers ──
  const getOtherUser = (conv) => {
    if (!conv?.participants) return null;
    return conv.participants.find(
      p => (p._id || p.id || p) !== (user?._id || user?.id)
    );
  };

  const isOnline = (userId) => onlineUsers.includes(userId?.toString());

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const otherUserActive = activeConversation ? getOtherUser(activeConversation) : null;
  const isTyping = Object.keys(typingUsers).length > 0;

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* ── Sidebar ── */}
        <div
          className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-80 lg:w-96 border-r border-border-color`}
          style={{ background: 'var(--card-bg, #111)' }}
        >
          <div className="p-4 border-b border-border-color">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <MessageCircle size={22} className="text-primary" />
              Messages
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-text-secondary">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-text-secondary">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold mb-1">No conversations yet</p>
                <p className="text-sm">Connect with someone and start chatting!</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherUser(conv);
                const isActive = activeConversation?._id === conv._id;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <motion.button
                    key={conv._id}
                    whileHover={{ backgroundColor: 'rgba(99,102,241,0.08)' }}
                    onClick={() => {
                      setActiveConversation(conv);
                      setShowSidebar(false);
                    }}
                    className={`w-full p-4 flex items-center gap-3 text-left transition-all border-b border-border-color/50 ${
                      isActive ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-lg font-bold">
                        {other?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      {isOnline(other?._id || other?.id) && (
                        <Circle
                          size={12}
                          fill="#22c55e"
                          stroke="#111"
                          strokeWidth={2}
                          className="absolute -bottom-0.5 -right-0.5"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold truncate">{other?.name || 'User'}</span>
                        <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
                          {formatDate(conv.lastMessage?.createdAt || conv.updatedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-text-secondary truncate">
                          {conv.lastMessage?.content || 'Start a conversation'}
                        </p>
                        {hasUnread && (
                          <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary text-xs font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col flex-1`} style={{ background: 'var(--bg, #0a0a0a)' }}>
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle size={64} className="mx-auto mb-4 text-primary/20" />
                <h3 className="text-xl font-semibold text-text-secondary mb-2">Select a conversation</h3>
                <p className="text-sm text-text-secondary/70">Choose from your existing chats or start a new one</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div
                className="p-4 border-b border-border-color flex items-center gap-3"
                style={{ background: 'var(--card-bg, #111)' }}
              >
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-1 rounded hover:bg-primary/10 transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center font-bold">
                    {otherUserActive?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  {isOnline(otherUserActive?._id || otherUserActive?.id) && (
                    <Circle
                      size={10}
                      fill="#22c55e"
                      stroke="#111"
                      strokeWidth={2}
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{otherUserActive?.name || 'User'}</h3>
                  <p className="text-xs text-text-secondary">
                    {isTyping
                      ? 'typing…'
                      : isOnline(otherUserActive?._id || otherUserActive?.id)
                        ? 'Online'
                        : otherUserActive?.role || ''}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="text-center text-text-secondary py-8">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-text-secondary py-8">
                    <p className="font-semibold mb-1">No messages yet</p>
                    <p className="text-sm">Say hello! 👋</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMine = (msg.sender?._id || msg.sender?.id || msg.sender) === (user?._id || user?.id);
                      const showAvatar =
                        i === 0 ||
                        (messages[i - 1]?.sender?._id || messages[i - 1]?.sender) !== (msg.sender?._id || msg.sender);

                      return (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                            {showAvatar && !isMine && (
                              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            {!showAvatar && !isMine && <div className="w-7 flex-shrink-0" />}
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? 'bg-primary text-white rounded-br-md'
                                  : 'bg-white/5 border border-border-color rounded-bl-md'
                              }`}
                            >
                              <p style={{ wordBreak: 'break-word' }}>{msg.content}</p>
                              <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-text-secondary/60'}`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="flex items-center gap-2 text-text-secondary text-sm"
                    >
                      <div className="flex gap-1 px-3 py-2 rounded-full bg-white/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-border-color flex items-center gap-3"
                style={{ background: 'var(--card-bg, #111)' }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleTypingInput}
                  placeholder="Type a message…"
                  maxLength={2000}
                  className="flex-1 bg-white/5 border border-border-color rounded-xl px-4 py-3 text-sm text-white placeholder-text-secondary/50 outline-none focus:border-primary/50 transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-primary text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-primary/90"
                >
                  <Send size={18} />
                </motion.button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
