import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { sanitizeUser } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN' && admin.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.toLowerCase();

    let reports = db.getModerationReports();

    if (status && status !== 'all') {
      if (status === 'PENDING') {
        reports = reports.filter((r) => r.status === 'PENDING' || r.status === 'OPEN');
      } else {
        reports = reports.filter((r) => r.status === status);
      }
    }

    if (q) {
      reports = reports.filter(
        (r) =>
          r.reporter_name.toLowerCase().includes(q) ||
          (r.reported_user_name && r.reported_user_name.toLowerCase().includes(q)) ||
          r.reason.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    // Enrich reports with full details
    const users = db.getUsers();
    const tasks = db.getTasks();

    const enriched = reports.map((r) => {
      const reporter = users.find((u) => u.id === r.reporter_id);
      const reportedUser = r.reported_user_id ? users.find((u) => u.id === r.reported_user_id) : undefined;
      const relatedTask = r.related_task_id ? tasks.find((t) => t.id === r.related_task_id) : undefined;

      return {
        ...r,
        reporter: reporter ? sanitizeUser(reporter) : undefined,
        reported_user: reportedUser ? sanitizeUser(reportedUser) : undefined,
        related_task: relatedTask
          ? {
              id: relatedTask.id,
              title: relatedTask.title,
              budget: relatedTask.budget,
              status: relatedTask.status,
            }
          : undefined,
      };
    });

    return NextResponse.json({ reports: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN' && admin.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { id, status, notes, actionTaken, warnReason, blockType, blockReason, durationDays } = await req.json();

    const rep = db.getModerationReports().find((r) => r.id === id);
    if (!rep) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // If an action was taken against the reported user directly from the report resolution
    if (rep.reported_user_id) {
      if (actionTaken === 'warn' && warnReason) {
        db.warnUser(rep.reported_user_id, warnReason, admin.id, admin.name);
      } else if (actionTaken === 'block_temp' && blockReason) {
        db.blockUser(rep.reported_user_id, 'TEMPORARY', blockReason, admin.id, admin.name, Number(durationDays) || 7);
      } else if (actionTaken === 'block_perm' && blockReason) {
        db.blockUser(rep.reported_user_id, 'PERMANENT', blockReason, admin.id, admin.name);
      }
    }

    const updated = db.updateModerationReport(
      id,
      status,
      notes,
      admin.id,
      admin.name,
      actionTaken || 'None'
    );

    return NextResponse.json({ success: true, report: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
