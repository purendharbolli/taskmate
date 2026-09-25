import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase();
    const collegeId = searchParams.get('collegeId');
    const verified = searchParams.get('verified');

    let users = db.getUsers();

    if (q) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (collegeId && collegeId !== 'all') {
      users = users.filter((u) => u.college_id === collegeId);
    }

    if (verified === 'true') {
      users = users.filter((u) => u.college_verified);
    } else if (verified === 'false') {
      users = users.filter((u) => !u.college_verified);
    }

    const colleges = db.getColleges();
    const enriched = users.map((u) => ({
      ...u,
      college: colleges.find((c) => c.id === u.college_id),
    }));

    return NextResponse.json({ users: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { userId, reason } = await req.json();
    const updated = db.toggleUserSuspension(userId, reason);

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
