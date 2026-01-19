import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomParticipants } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/rooms/[roomId]/timer - Control timer (host only)
// Actions: start, pause, reset, complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId: roomIdParam } = await params;
    const roomId = parseInt(roomIdParam);
    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { action } = body;

    if (isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    if (!['start', 'pause', 'reset', 'complete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify user is host
    const [room] = await db
      .select()
      .from(studyRooms)
      .where(
        and(
          eq(studyRooms.id, roomId),
          eq(studyRooms.hostId, userId),
          isNull(studyRooms.endedAt)
        )
      )
      .limit(1);

    if (!room) {
      return NextResponse.json({ error: 'Room not found or not authorized' }, { status: 404 });
    }

    const now = new Date();
    let updates: Partial<typeof studyRooms.$inferSelect> = {};

    switch (action) {
      case 'start':
        updates = {
          timerStatus: 'active',
          timerStartedAt: now,
          timerPausedAt: null,
        };
        break;

      case 'pause':
        if (room.timerStatus !== 'active' || !room.timerStartedAt) {
          return NextResponse.json({ error: 'Timer is not running' }, { status: 400 });
        }
        const additionalElapsed = Math.floor((now.getTime() - room.timerStartedAt.getTime()) / 1000);
        updates = {
          timerStatus: 'paused',
          timerPausedAt: now,
          timerElapsed: room.timerElapsed + additionalElapsed,
          timerStartedAt: null,
        };
        break;

      case 'reset':
        updates = {
          timerStatus: 'waiting',
          timerStartedAt: null,
          timerPausedAt: null,
          timerElapsed: 0,
        };
        break;

      case 'complete':
        updates = {
          timerStatus: 'completed',
          timerStartedAt: null,
          timerPausedAt: null,
          timerElapsed: room.timerDuration,
        };
        // Update participant stats
        await db
          .update(roomParticipants)
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
        break;
    }

    const [updatedRoom] = await db
      .update(studyRooms)
      .set(updates)
      .where(eq(studyRooms.id, roomId))
      .returning();

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error controlling timer:', error);
    return NextResponse.json({ error: 'Failed to control timer' }, { status: 500 });
  }
}
