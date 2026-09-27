import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const user = db.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const colleges = db.getColleges();
    const college = colleges.find((c) => c.id === user.college_id) || null;

    const tasksPosted = db.getTasks({ requesterId: user.id }).length;

    return NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      college,
      stats: {
        tasks_posted: tasksPosted,
        tasks_completed: user.completed_tasks || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
