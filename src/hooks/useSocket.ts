import { useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  auth?: Record<string, any>;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(event: string, data?: T) => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: (event: string) => void;
}

export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    // TODO: Change URL
    // url = "http://192.168.29.232:3000/api/socket",
    url = "https://wm-next-lyart.vercel.app/api/socket",
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 3000,
    auth = {},
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<Function>>>(new Map());

  // Initialize or get the socket
  const getSocket = useCallback(() => {
    if (!socketRef.current) {
      setIsConnecting(true);
      setError(null);

      socketRef.current = io(url, {
        autoConnect: false,
        reconnectionAttempts,
        reconnectionDelay,
        auth,
      });
    }
    return socketRef.current;
  }, [url, reconnectionAttempts, reconnectionDelay, auth]);

  // Connect to the socket server
  const connect = useCallback(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
      setIsConnecting(true);
    }
  }, [getSocket]);

  // Disconnect from the socket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  // Emit an event to the socket server
  const emit = useCallback(
    <T>(event: string, data?: T) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(event, data);
      } else {
        console.warn("Socket is not connected. Cannot emit event:", event);
      }
    },
    [isConnected]
  );

  // Subscribe to a socket event
  const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }

    const handlers = eventHandlersRef.current.get(event)!;
    handlers.add(callback);

    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Unsubscribe from a socket event
  const off = useCallback((event: string) => {
    if (socketRef.current && eventHandlersRef.current.has(event)) {
      const handlers = eventHandlersRef.current.get(event)!;

      handlers.forEach((callback) => {
        socketRef.current?.off(event, callback as any);
      });

      eventHandlersRef.current.delete(event);
    }
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      console.log("Socket connected");
    };

    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log("Socket disconnected:", reason);
    };

    const onConnectError = (err: Error) => {
      setIsConnecting(false);
      setError(err);
      console.error("Socket connection error:", err);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Reattach all event handlers if socket instance changes
    eventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach((callback) => {
        socket.on(event, callback as any);
      });
    });

    if (autoConnect) {
      connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);

      // Clean up all event handlers
      eventHandlersRef.current.forEach((handlers, event) => {
        handlers.forEach((callback) => {
          socket.off(event, callback as any);
        });
      });

      // Disconnect socket when component unmounts
      socket.disconnect();
      socketRef.current = null;
    };
  }, [getSocket, connect, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
