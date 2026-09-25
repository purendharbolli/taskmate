import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const requests = db.getCollegeRequests();
    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { college_name, city_id, city_name, website, email_domain, message } = await req.json();

    if (!college_name || !city_id) {
      return NextResponse.json({ error: 'College name and city are required' }, { status: 400 });
    }

    const newReq = db.createCollegeRequest({
      requested_by: user ? user.id : 'anonymous-user',
      requester_name: user ? user.name : 'Prospective Student',
      college_name,
      city_id,
      city_name: city_name || 'Hyderabad',
      website,
      email_domain,
      message,
    });

    return NextResponse.json({ success: true, request: newReq });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { id, status } = await req.json();

    const reviewed = db.reviewCollegeRequest(id, status, user ? user.id : 'admin');
    if (!reviewed) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: reviewed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
