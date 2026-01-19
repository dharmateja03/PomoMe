import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomParticipants } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/rooms/[roomId]/join - Join a room
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

    // Check if already a participant
    const [existingParticipant] = await db
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

    if (existingParticipant) {
      return NextResponse.json({ error: 'Already in room' }, { status: 400 });
    }

    // Check participant count
    const participantsCount = await db
      .select()
      .from(roomParticipants)
      .where(
        and(
          eq(roomParticipants.roomId, roomId),
          isNull(roomParticipants.leftAt)
        )
      );

    if (participantsCount.length >= room.maxParticipants) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Add participant
    const [participant] = await db.insert(roomParticipants).values({
      roomId,
      userId,
      role: 'participant',
    }).returning();

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
