'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface UseSocketOptions {
  token: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

export function useSocket({ token, onConnect, onDisconnect, onError }: UseSocketOptions): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const s = connectSocket(token);
    socketRef.current = s;
    setSocket(s);

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      onConnect?.();
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      onDisconnect?.();
    };

    const handleError = (err: Error) => {
      setError(err.message);
      onError?.(err);
    };

    const handleConnectError = (err: Error) => {
      setError(`Connection failed: ${err.message}`);
      onError?.(err);
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('error', handleError);
    s.on('connect_error', handleConnectError);

    // Check if already connected
    if (s.connected) {
      setIsConnected(true);
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('error', handleError);
      s.off('connect_error', handleConnectError);
    };
  }, [token, onConnect, onDisconnect, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return { socket, isConnected, error };
}
