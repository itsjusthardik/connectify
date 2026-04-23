import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && window.__accessToken) {
      // Connect to the Socket.IO server (backend, not the Vite dev server)
      const serverUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:5000';

      const newSocket = io(serverUrl, {
        auth: { token: window.__accessToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected');
        newSocket.emit('get_online_users');
      });

      newSocket.on('online_users', ({ users }) => {
        setOnlineUsers(users);
      });

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => [...new Set([...prev, userId])]);
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      newSocket.on('unread_update', ({ conversationId }) => {
        setUnreadConversations(prev => new Set([...prev, conversationId]));
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      // Not logged in — disconnect if connected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [user]);

  const clearUnread = (conversationId) => {
    setUnreadConversations(prev => {
      const next = new Set(prev);
      next.delete(conversationId);
      return next;
    });
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      unreadConversations,
      clearUnread,
      totalUnread: unreadConversations.size
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
