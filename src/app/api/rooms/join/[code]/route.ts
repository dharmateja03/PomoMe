import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, studyRooms, users } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/rooms/join/[code] - Get room by invite code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;

    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
    }

    // Find room by invite code
    const [room] = await db
      .select()
      .from(studyRooms)
      .where(
        and(
          eq(studyRooms.inviteCode, code),
          isNull(studyRooms.endedAt)
        )
      )
      .limit(1);

    if (!room) {
      return NextResponse.json({ error: 'Room not found or has ended' }, { status: 404 });
    }

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
      id: room.id,
      name: room.name,
      hostId: room.hostId,
      host,
      timerDuration: room.timerDuration,
      maxParticipants: room.maxParticipants,
      isPublic: room.isPublic,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error('Error fetching room by code:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}
