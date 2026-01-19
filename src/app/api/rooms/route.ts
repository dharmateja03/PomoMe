import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomParticipants, users } from '@/lib/db';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { nanoid } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET /api/rooms - List my rooms (as host or participant)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get rooms where user is a participant (active rooms only)
    const myRooms = await db
      .select({
        room: studyRooms,
        participant: roomParticipants,
        hostName: users.name,
        hostEmail: users.email,
      })
      .from(roomParticipants)
      .innerJoin(studyRooms, eq(roomParticipants.roomId, studyRooms.id))
      .innerJoin(users, eq(studyRooms.hostId, users.id))
      .where(
        and(
          eq(roomParticipants.userId, userId),
          isNull(roomParticipants.leftAt),
          isNull(studyRooms.endedAt)
        )
      )
      .orderBy(desc(studyRooms.createdAt));

    const rooms = myRooms.map(({ room, participant, hostName, hostEmail }) => ({
      ...room,
      role: participant.role,
      host: { name: hostName, email: hostEmail },
    }));

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { name, timerDuration = 1500, maxParticipants = 10, isPublic = false } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }

    // Generate unique invite code
    const inviteCode = nanoid(8);

    // Create room
    const [room] = await db.insert(studyRooms).values({
      hostId: userId,
      name: name.trim(),
      inviteCode,
      timerDuration,
      maxParticipants,
      isPublic,
    }).returning();

    // Add host as participant
    await db.insert(roomParticipants).values({
      roomId: room.id,
      userId,
      role: 'host',
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
