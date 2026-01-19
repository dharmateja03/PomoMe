import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, friendships, users } from '@/lib/db';
import { eq, and, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/friends/requests - Get pending friend requests (received)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get pending requests where current user is the recipient (friendId)
    const pendingRequests = await db
      .select({
        request: friendships,
        sender: users,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.userId, users.id))
      .where(
        and(
          eq(friendships.friendId, userId),
          eq(friendships.status, 'pending')
        )
      );

    const requests = pendingRequests.map(({ request, sender }) => ({
      id: request.id,
      senderId: sender.id,
      senderName: sender.name,
      senderEmail: sender.email,
      createdAt: request.createdAt,
    }));

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json({ error: 'Failed to fetch friend requests' }, { status: 500 });
  }
}

// POST /api/friends/requests - Send friend request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if friendship already exists
    const [existingFriendship] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, targetUser.id)),
          and(eq(friendships.userId, targetUser.id), eq(friendships.friendId, userId))
        )
      )
      .limit(1);

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }
      if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 });
      }
      if (existingFriendship.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send request to this user' }, { status: 400 });
      }
    }

    // Create friend request
    const [friendRequest] = await db.insert(friendships).values({
      userId,
      friendId: targetUser.id,
      status: 'pending',
    }).returning();

    return NextResponse.json({
      id: friendRequest.id,
      friendId: targetUser.id,
      friendName: targetUser.name,
      friendEmail: targetUser.email,
      status: 'pending',
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
