import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, sessions } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.completedAt));

    return NextResponse.json(userSessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { categoryId, duration } = await request.json();

    if (!categoryId || !duration) {
      return NextResponse.json({ error: 'Category ID and duration are required' }, { status: 400 });
    }

    const [newSession] = await db
      .insert(sessions)
      .values({
        userId,
        categoryId,
        duration,
      })
      .returning();

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
