import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/auth';

// Track online users: Map<roomId, Set<userId>>
const roomPresence = new Map<number, Set<number>>();

// Track user's current room: Map<socketId, roomId>
const userRooms = new Map<string, number>();

export function setupPresenceHandlers(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.userId;

  socket.on('room:join', (roomId: number) => {
    // Leave previous room if any
    const previousRoom = userRooms.get(socket.id);
    if (previousRoom !== undefined) {
      leaveRoom(socket, previousRoom);
    }

    // Join new room
    socket.join(`room:${roomId}`);
    userRooms.set(socket.id, roomId);

    // Add to presence
    if (!roomPresence.has(roomId)) {
      roomPresence.set(roomId, new Set());
    }
    roomPresence.get(roomId)!.add(userId);

    // Notify room of user joining
    io.to(`room:${roomId}`).emit('presence:update', {
      roomId,
      onlineUsers: Array.from(roomPresence.get(roomId) || []),
    });

    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on('room:leave', (roomId: number) => {
    leaveRoom(socket, roomId);
  });

  socket.on('disconnect', () => {
    const roomId = userRooms.get(socket.id);
    if (roomId !== undefined) {
      leaveRoom(socket, roomId);
    }
    console.log(`User ${userId} disconnected`);
  });
}

function leaveRoom(socket: AuthenticatedSocket, roomId: number) {
  const userId = socket.userId;

  socket.leave(`room:${roomId}`);
  userRooms.delete(socket.id);

  // Remove from presence
  const roomUsers = roomPresence.get(roomId);
  if (roomUsers) {
    roomUsers.delete(userId);
    if (roomUsers.size === 0) {
      roomPresence.delete(roomId);
    } else {
      // Notify remaining users
      socket.to(`room:${roomId}`).emit('presence:update', {
        roomId,
        onlineUsers: Array.from(roomUsers),
      });
    }
  }

  console.log(`User ${userId} left room ${roomId}`);
}

export function getOnlineUsers(roomId: number): number[] {
  return Array.from(roomPresence.get(roomId) || []);
}
