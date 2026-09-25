import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reason, description, evidence_urls } = await req.json();

    if (!reason || !description) {
      return NextResponse.json({ error: 'Reason and detailed description required' }, { status: 400 });
    }

    const dispute = db.openDispute(
      params.id,
      user.id,
      reason,
      description,
      evidence_urls || []
    );

    return NextResponse.json({ success: true, dispute });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
