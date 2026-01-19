import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, roomJoinRequests, roomParticipants } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PATCH /api/rooms/[roomId]/requests/[requestId] - Accept or reject join request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; requestId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId: roomIdParam, requestId: requestIdParam } = await params;
    const roomId = parseInt(roomIdParam);
    const requestId = parseInt(requestIdParam);
    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { action } = body;

    if (isNaN(roomId) || isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
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

    // Get the join request
    const [joinRequest] = await db
      .select()
      .from(roomJoinRequests)
      .where(
        and(
          eq(roomJoinRequests.id, requestId),
          eq(roomJoinRequests.roomId, roomId),
          eq(roomJoinRequests.status, 'pending')
        )
      )
      .limit(1);

    if (!joinRequest) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Update request status
      await db
        .update(roomJoinRequests)
        .set({
          status: 'accepted',
          respondedAt: new Date(),
        })
        .where(eq(roomJoinRequests.id, requestId));

      // Add user as participant
      await db.insert(roomParticipants).values({
        roomId,
        userId: joinRequest.userId,
        role: 'participant',
      });

      return NextResponse.json({ success: true, status: 'accepted' });
    } else {
      // Reject
      await db
        .update(roomJoinRequests)
        .set({
          status: 'rejected',
          respondedAt: new Date(),
        })
        .where(eq(roomJoinRequests.id, requestId));

      return NextResponse.json({ success: true, status: 'rejected' });
    }
  } catch (error) {
    console.error('Error handling join request:', error);
    return NextResponse.json({ error: 'Failed to handle join request' }, { status: 500 });
  }
}
