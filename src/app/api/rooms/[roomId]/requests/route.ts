import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomJoinRequests, users } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/rooms/[roomId]/requests - Get pending join requests (host only)
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

    // Get pending requests
    const requests = await db
      .select({
        request: roomJoinRequests,
        user: users,
      })
      .from(roomJoinRequests)
      .innerJoin(users, eq(roomJoinRequests.userId, users.id))
      .where(
        and(
          eq(roomJoinRequests.roomId, roomId),
          eq(roomJoinRequests.status, 'pending')
        )
      );

    const formattedRequests = requests.map(({ request, user }) => ({
      id: request.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      createdAt: request.createdAt,
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return NextResponse.json({ error: 'Failed to fetch join requests' }, { status: 500 });
  }
}

// POST /api/rooms/[roomId]/requests - Request to join a room
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

    // If room is public, just join directly
    if (room.isPublic) {
      return NextResponse.json({ error: 'Room is public, no request needed' }, { status: 400 });
    }

    // Check for existing pending request
    const [existingRequest] = await db
      .select()
      .from(roomJoinRequests)
      .where(
        and(
          eq(roomJoinRequests.roomId, roomId),
          eq(roomJoinRequests.userId, userId),
          eq(roomJoinRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingRequest) {
      return NextResponse.json({ error: 'Request already pending' }, { status: 400 });
    }

    // Create join request
    const [joinRequest] = await db.insert(roomJoinRequests).values({
      roomId,
      userId,
      status: 'pending',
    }).returning();

    return NextResponse.json(joinRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating join request:', error);
    return NextResponse.json({ error: 'Failed to create join request' }, { status: 500 });
  }
}
