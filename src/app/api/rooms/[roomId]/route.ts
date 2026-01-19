import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomParticipants, users } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/rooms/[roomId] - Get room details
export async function GET(
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

    // Get room
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

    // Check if user is a participant
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

    // If room is private and user is not a participant, deny access
    if (!room.isPublic && !participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all active participants with user info
    const participants = await db
      .select({
        participant: roomParticipants,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(roomParticipants)
      .innerJoin(users, eq(roomParticipants.userId, users.id))
      .where(
        and(
          eq(roomParticipants.roomId, roomId),
          isNull(roomParticipants.leftAt)
        )
      );

    // Get host info
    const [host] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, room.hostId))
      .limit(1);

    return NextResponse.json({
      ...room,
      host,
      participants: participants.map(p => ({
        ...p.participant,
        user: p.user,
      })),
      isHost: room.hostId === userId,
      isParticipant: !!participant,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

// DELETE /api/rooms/[roomId] - End room (host only)
export async function DELETE(
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

    // End the room
    await db
      .update(studyRooms)
      .set({ endedAt: new Date() })
      .where(eq(studyRooms.id, roomId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending room:', error);
    return NextResponse.json({ error: 'Failed to end room' }, { status: 500 });
  }
}
