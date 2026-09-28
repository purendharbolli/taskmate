import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const {
      reported_user_id,
      reason,
      description,
      evidence_url,
      evidence_link,
      related_task_id,
    } = body;

    if (!reported_user_id) {
      return NextResponse.json(
        { error: 'Reported user ID is required.' },
        { status: 400 }
      );
    }

    if (user.id === reported_user_id) {
      return NextResponse.json(
        { error: 'You cannot report your own profile.' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Please select a reason for reporting.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a detailed description (at least 10 characters).' },
        { status: 400 }
      );
    }

    const reportedUser = db.getUserById(reported_user_id);
    if (!reportedUser) {
      return NextResponse.json(
        { error: 'Reported user profile not found.' },
        { status: 404 }
      );
    }

    let relatedTaskTitle = undefined;
    if (related_task_id) {
      const task = db.getTaskById(related_task_id);
      if (task) {
        relatedTaskTitle = task.task.title;
      }
    }

    const result = db.createModerationReport({
      reporter_id: user.id,
      reporter_name: user.nickname || user.name,
      reporter_email: user.email,
      reported_user_id: reportedUser.id,
      reported_user_name: reportedUser.nickname || reportedUser.name,
      related_task_id: related_task_id || undefined,
      related_task_title: relatedTaskTitle,
      reason,
      description: description.trim(),
      evidence_url: evidence_url?.trim() || undefined,
      evidence_link: evidence_link?.trim() || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'A duplicate report is already under investigation.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Our campus moderation team will review this report carefully.',
      reportId: result.report?.id,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in to submit a report.' }, { status: 401 });
    }
    if (err.message === 'SUSPENDED') {
      return NextResponse.json({ error: 'Your account is currently suspended.' }, { status: 403 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
