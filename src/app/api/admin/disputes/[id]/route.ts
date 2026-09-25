import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { resolution, notes } = await req.json();

    if (!resolution || !notes) {
      return NextResponse.json({ error: 'Resolution choice and audit notes are required' }, { status: 400 });
    }

    const resolved = db.resolveDispute(params.id, resolution, notes, user.id);
    return NextResponse.json({ success: true, dispute: resolved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
