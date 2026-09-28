import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canAccessAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allRequests = db.getVerificationRequests();

    // Admin receives all requests with full audit & private document references
    if (canAccessAdmin(user)) {
      return NextResponse.json({ requests: allRequests });
    }

    // Regular users ONLY see their own verification request status.
    // Confidential document paths are omitted from regular user responses to preserve strict privacy.
    const userRequests = allRequests
      .filter((r) => r.user_id === user.id)
      .map((r) => ({
        id: r.id,
        user_id: r.user_id,
        user_name: r.user_name,
        college_id: r.college_id,
        college_name: r.college_name,
        college_email: r.college_email,
        student_id_number: r.student_id_number,
        phone: r.phone,
        phone_verified: r.phone_verified,
        status: r.status,
        submission_date: r.submission_date,
        reviewed_at: r.reviewed_at,
        review_notes: r.review_notes,
        created_at: r.created_at,
      }));

    return NextResponse.json({ requests: userRequests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      collegeId,
      collegeName,
      collegeEmail,
      studentIdNumber,
      phone,
      phoneVerified,
      documentUrl,
      documentFilename,
      documentType,
      notesFromUser,
    } = body;

    // Must have at least a college ID or student ID or college proof
    if (!collegeId && !collegeName && !user.college_id) {
      return NextResponse.json(
        { error: 'Please select or provide your college.' },
        { status: 400 }
      );
    }

    if (!documentUrl && !collegeEmail) {
      return NextResponse.json(
        { error: 'Please provide either a photo/PDF of your College ID card or an institutional email address.' },
        { status: 400 }
      );
    }

    const request = db.createVerificationRequest({
      userId: user.id,
      collegeId: collegeId || user.college_id,
      collegeName: collegeName || user.custom_college_name,
      collegeEmail,
      studentIdNumber,
      phone: phone || user.phone,
      phoneVerified: phoneVerified ?? (phone ? true : false),
      documentUrl,
      documentFilename,
      documentType,
      userNotes: notesFromUser,
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

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing request ID or status' }, { status: 400 });
    }

    const validStatuses = ['APPROVED', 'REJECTED', 'ADDITIONAL_INFO_REQUIRED', 'ADDITIONAL_INFO_NEEDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const reviewed = db.reviewVerification(
      id,
      status,
      notes || '',
      user.id,
      user.name || 'Administrator'
    );

    if (!reviewed) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: reviewed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
