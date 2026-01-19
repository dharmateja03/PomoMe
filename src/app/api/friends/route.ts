import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, friendships, users } from '@/lib/db';
import { eq, and, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/friends - List friends with status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get all accepted friendships where user is either userId or friendId
    const myFriendships = await db
      .select({
        friendship: friendships,
        user: users,
      })
      .from(friendships)
      .innerJoin(
        users,
        or(
          and(eq(friendships.userId, userId), eq(users.id, friendships.friendId)),
          and(eq(friendships.friendId, userId), eq(users.id, friendships.userId))
        )
      )
      .where(
        and(
          or(
            eq(friendships.userId, userId),
            eq(friendships.friendId, userId)
          ),
          eq(friendships.status, 'accepted')
        )
      );

    const friends = myFriendships.map(({ friendship, user }) => ({
      id: friendship.id,
      friendId: user.id,
      name: user.name,
      email: user.email,
      acceptedAt: friendship.acceptedAt,
    }));

    return NextResponse.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

// DELETE /api/friends?friendId=<id> - Remove friend
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const friendId = parseInt(request.nextUrl.searchParams.get('friendId') || '');

    if (isNaN(friendId)) {
      return NextResponse.json({ error: 'Invalid friend ID' }, { status: 400 });
    }

    // Delete the friendship (both directions)
    await db.delete(friendships).where(
      or(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json({ error: 'Failed to remove friend' }, { status: 500 });
  }
}
