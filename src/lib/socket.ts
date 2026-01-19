import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface SocketAuth {
  token: string;
}

export function getSocket(auth?: SocketAuth): Socket {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      throw new Error('NEXT_PUBLIC_SOCKET_URL is not configured');
    }

    socket = io(socketUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: auth || {},
    });
  }

  return socket;
}

export function connectSocket(token: string): Socket {
  const s = getSocket({ token });

  if (!s.connected) {
    s.auth = { token };
    s.connect();
  }

  return s;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Timer event types
export interface TimerStartedEvent {
  roomId: number;
  startedAt: string;
  elapsed: number;
  duration: number;
}

export interface TimerPausedEvent {
  roomId: number;
  pausedAt: string;
  elapsed: number;
}

export interface TimerResetEvent {
  roomId: number;
  duration: number;
}

export interface TimerCompletedEvent {
  roomId: number;
  duration: number;
}

export interface PresenceUpdateEvent {
  roomId: number;
  onlineUsers: number[];
}

export interface ParticipantJoinedEvent {
  roomId: number;
  participant: {
    id: number;
    name: string | null;
  };
}

export interface ParticipantLeftEvent {
  roomId: number;
  userId: number;
}

export interface HostTransferredEvent {
  roomId: number;
  newHostId: number;
}

export interface RoomEndedEvent {
  roomId: number;
}
