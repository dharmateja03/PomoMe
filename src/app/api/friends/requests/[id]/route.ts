import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, friendships } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PATCH /api/friends/requests/[id] - Accept or reject friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: requestIdParam } = await params;
    const requestId = parseInt(requestIdParam);
    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { action } = body;

    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the friend request where current user is the recipient
    const [friendRequest] = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.id, requestId),
          eq(friendships.friendId, userId),
          eq(friendships.status, 'pending')
        )
      )
      .limit(1);

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    if (action === 'accept') {
      await db
        .update(friendships)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
        })
        .where(eq(friendships.id, requestId));

      return NextResponse.json({ success: true, status: 'accepted' });
    } else {
      // Reject - delete the request
      await db.delete(friendships).where(eq(friendships.id, requestId));

      return NextResponse.json({ success: true, status: 'rejected' });
    }
  } catch (error) {
    console.error('Error handling friend request:', error);
    return NextResponse.json({ error: 'Failed to handle friend request' }, { status: 500 });
  }
}
