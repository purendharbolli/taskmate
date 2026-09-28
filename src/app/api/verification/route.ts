import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canAccessAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allRequests = db.getVerificationRequests();
    // Admin gets all requests; regular users only see their own
    if (canAccessAdmin(user)) {
      return NextResponse.json({ requests: allRequests });
    }

    const userRequests = allRequests.filter((r) => r.user_id === user.id);
    return NextResponse.json({ requests: userRequests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { collegeId, collegeEmail } = await req.json();
    if (!collegeId || !collegeEmail) {
      return NextResponse.json({ error: 'College ID and institutional email required' }, { status: 400 });
    }

    const request = db.createVerificationRequest({
      userId: user.id,
      collegeId,
      collegeEmail,
    });

    return NextResponse.json({ success: true, request });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canAccessAdmin(user)) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { id, status, notes } = await req.json();

    const reviewed = db.reviewVerification(
      id,
      status,
      notes || '',
      user.id,
      user.name || 'Administrator'
    );

    if (!reviewed) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: reviewed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
