import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = db.getTaskById(params.id);
    if (!data) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const colleges = db.getColleges();
    const college = colleges.find((c) => c.id === data.task.college_id);

    return NextResponse.json({
      ...data,
      college,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
