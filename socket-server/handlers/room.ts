import { Server } from 'socket.io';
import { eq, and, isNull } from 'drizzle-orm';
import { AuthenticatedSocket } from '../middleware/auth';
import { db, studyRooms, roomParticipants } from '../db';

export function setupRoomHandlers(io: Server, socket: AuthenticatedSocket) {
  const userId = socket.userId;

  // Timer controls (host only)
  socket.on('timer:start', async (roomId: number) => {
    try {
      const room = await getRoomIfHost(roomId, userId);
      if (!room) {
        socket.emit('error', { message: 'Not authorized to control timer' });
        return;
      }

      const now = new Date();
      await db.update(studyRooms)
        .set({
          timerStatus: 'active',
          timerStartedAt: now,
          timerPausedAt: null,
        })
        .where(eq(studyRooms.id, roomId));

      io.to(`room:${roomId}`).emit('timer:started', {
        roomId,
        startedAt: now.toISOString(),
        elapsed: room.timerElapsed,
        duration: room.timerDuration,
      });

      console.log(`Timer started in room ${roomId} by user ${userId}`);
    } catch (error) {
      console.error('Error starting timer:', error);
      socket.emit('error', { message: 'Failed to start timer' });
    }
  });

  socket.on('timer:pause', async (roomId: number) => {
    try {
      const room = await getRoomIfHost(roomId, userId);
      if (!room) {
        socket.emit('error', { message: 'Not authorized to control timer' });
        return;
      }

      if (room.timerStatus !== 'active' || !room.timerStartedAt) {
        socket.emit('error', { message: 'Timer is not running' });
        return;
      }

      const now = new Date();
      const additionalElapsed = Math.floor((now.getTime() - room.timerStartedAt.getTime()) / 1000);
      const newElapsed = room.timerElapsed + additionalElapsed;

      await db.update(studyRooms)
        .set({
          timerStatus: 'paused',
          timerPausedAt: now,
          timerElapsed: newElapsed,
          timerStartedAt: null,
        })
        .where(eq(studyRooms.id, roomId));

      io.to(`room:${roomId}`).emit('timer:paused', {
        roomId,
        pausedAt: now.toISOString(),
        elapsed: newElapsed,
      });

      console.log(`Timer paused in room ${roomId} by user ${userId}`);
    } catch (error) {
      console.error('Error pausing timer:', error);
      socket.emit('error', { message: 'Failed to pause timer' });
    }
  });

  socket.on('timer:reset', async (roomId: number) => {
    try {
      const room = await getRoomIfHost(roomId, userId);
      if (!room) {
        socket.emit('error', { message: 'Not authorized to control timer' });
        return;
      }

      await db.update(studyRooms)
        .set({
          timerStatus: 'waiting',
          timerStartedAt: null,
          timerPausedAt: null,
          timerElapsed: 0,
        })
        .where(eq(studyRooms.id, roomId));

      io.to(`room:${roomId}`).emit('timer:reset', {
        roomId,
        duration: room.timerDuration,
      });

      console.log(`Timer reset in room ${roomId} by user ${userId}`);
    } catch (error) {
      console.error('Error resetting timer:', error);
      socket.emit('error', { message: 'Failed to reset timer' });
    }
  });

  socket.on('timer:complete', async (roomId: number) => {
    try {
      const room = await getRoomIfHost(roomId, userId);
      if (!room) {
        socket.emit('error', { message: 'Not authorized to control timer' });
        return;
      }

      await db.update(studyRooms)
        .set({
          timerStatus: 'completed',
          timerStartedAt: null,
          timerPausedAt: null,
          timerElapsed: room.timerDuration,
        })
        .where(eq(studyRooms.id, roomId));

      // Update participant stats
      await db.update(roomParticipants)
        .set({
          completedRounds: room.timerDuration,
          totalFocusTime: room.timerDuration,
        })
        .where(
          and(
            eq(roomParticipants.roomId, roomId),
            isNull(roomParticipants.leftAt)
          )
        );

      io.to(`room:${roomId}`).emit('timer:completed', {
        roomId,
        duration: room.timerDuration,
      });

      console.log(`Timer completed in room ${roomId}`);
    } catch (error) {
      console.error('Error completing timer:', error);
      socket.emit('error', { message: 'Failed to complete timer' });
    }
  });

  // Participant events
  socket.on('participant:joined', async (roomId: number, participantData: { id: number; name: string | null }) => {
    io.to(`room:${roomId}`).emit('participant:joined', {
      roomId,
      participant: participantData,
    });
  });

  socket.on('participant:left', async (roomId: number, userId: number) => {
    io.to(`room:${roomId}`).emit('participant:left', {
      roomId,
      userId,
    });
  });

  // Host transfer
  socket.on('host:transfer', async (roomId: number, newHostId: number) => {
    try {
      const room = await getRoomIfHost(roomId, userId);
      if (!room) {
        socket.emit('error', { message: 'Not authorized to transfer host' });
        return;
      }

      // Update room host
      await db.update(studyRooms)
        .set({ hostId: newHostId })
        .where(eq(studyRooms.id, roomId));

      // Update participant roles
      await db.update(roomParticipants)
        .set({ role: 'participant' })
        .where(
          and(
            eq(roomParticipants.roomId, roomId),
            eq(roomParticipants.userId, userId)
          )
        );

      await db.update(roomParticipants)
        .set({ role: 'host' })
        .where(
          and(
            eq(roomParticipants.roomId, roomId),
            eq(roomParticipants.userId, newHostId)
          )
        );

      io.to(`room:${roomId}`).emit('host:transferred', {
        roomId,
        newHostId,
      });

      console.log(`Host transferred in room ${roomId} from ${userId} to ${newHostId}`);
    } catch (error) {
      console.error('Error transferring host:', error);
      socket.emit('error', { message: 'Failed to transfer host' });
    }
  });

  // End room
  socket.on('room:end', async (roomId: number) => {
    try {
      const room = await getRoomIfHost(roomId, userId);
      if (!room) {
        socket.emit('error', { message: 'Not authorized to end room' });
        return;
      }

      await db.update(studyRooms)
        .set({ endedAt: new Date() })
        .where(eq(studyRooms.id, roomId));

      io.to(`room:${roomId}`).emit('room:ended', { roomId });

      console.log(`Room ${roomId} ended by user ${userId}`);
    } catch (error) {
      console.error('Error ending room:', error);
      socket.emit('error', { message: 'Failed to end room' });
    }
  });
}

async function getRoomIfHost(roomId: number, userId: number) {
  const [room] = await db.select()
    .from(studyRooms)
    .where(
      and(
        eq(studyRooms.id, roomId),
        eq(studyRooms.hostId, userId),
        isNull(studyRooms.endedAt)
      )
    )
    .limit(1);

  return room;
}
