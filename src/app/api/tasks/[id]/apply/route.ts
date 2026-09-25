import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to apply.' }, { status: 401 });
    }

    const taskData = db.getTaskById(params.id);
    if (!taskData) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (taskData.task.requester_id === user.id) {
      return NextResponse.json({ error: 'You cannot apply for your own task.' }, { status: 400 });
    }

    if (taskData.task.status !== 'OPEN') {
      return NextResponse.json({ error: 'Oops. That task has already been taken or closed.' }, { status: 400 });
    }

    const { proposed_price, completion_time, message } = await req.json();

    if (!proposed_price || proposed_price <= 0) {
      return NextResponse.json({ error: 'Please enter a proposed price.' }, { status: 400 });
    }

    const application = db.createApplication({
      task_id: params.id,
      worker_id: user.id,
      proposed_price: Number(proposed_price),
      completion_time: completion_time || 'By agreed deadline',
      message: message || 'I can complete this accurately.',
    });

    return NextResponse.json({ success: true, application });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
