import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom Hook: useSocket
 * Manages Socket.io connection lifecycle
 * 
 * @param {string} serverUrl - Backend server URL
 * @returns {Object} Socket instance
 */
export const useSocket = (serverUrl) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(serverUrl || process.env.VITE_API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to server:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('⚠️  Socket error:', error);
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl]);

  return socketRef.current;
};

export default useSocket;
