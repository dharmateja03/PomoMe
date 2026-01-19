import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomParticipants, users } from '@/lib/db';
import { eq, and, isNull, ne } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/rooms/[roomId]/leave - Leave a room
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

    if (isNaN(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    // Get room and verify user is a participant
    const [room] = await db
      .select()
      .from(studyRooms)
      .where(
        and(
          eq(studyRooms.id, roomId),
          isNull(studyRooms.endedAt)
        )
      )
      .limit(1);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const [participant] = await db
      .select()
      .from(roomParticipants)
      .where(
        and(
          eq(roomParticipants.roomId, roomId),
          eq(roomParticipants.userId, userId),
          isNull(roomParticipants.leftAt)
        )
      )
      .limit(1);

    if (!participant) {
      return NextResponse.json({ error: 'Not in room' }, { status: 400 });
    }

    // Mark as left
    await db
      .update(roomParticipants)
      .set({ leftAt: new Date() })
      .where(eq(roomParticipants.id, participant.id));

    // If host is leaving, transfer to next participant or end room
    if (room.hostId === userId) {
      const [nextParticipant] = await db
        .select({
          participant: roomParticipants,
          user: users,
        })
        .from(roomParticipants)
        .innerJoin(users, eq(roomParticipants.userId, users.id))
        .where(
          and(
            eq(roomParticipants.roomId, roomId),
            isNull(roomParticipants.leftAt),
            ne(roomParticipants.userId, userId)
          )
        )
        .limit(1);

      if (nextParticipant) {
        // Transfer host
        await db
          .update(studyRooms)
          .set({ hostId: nextParticipant.user.id })
          .where(eq(studyRooms.id, roomId));

        await db
          .update(roomParticipants)
          .set({ role: 'host' })
          .where(eq(roomParticipants.id, nextParticipant.participant.id));

        return NextResponse.json({
          success: true,
          hostTransferred: true,
          newHostId: nextParticipant.user.id,
        });
      } else {
        // No other participants, end room
        await db
          .update(studyRooms)
          .set({ endedAt: new Date() })
          .where(eq(studyRooms.id, roomId));

        return NextResponse.json({
          success: true,
          roomEnded: true,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
