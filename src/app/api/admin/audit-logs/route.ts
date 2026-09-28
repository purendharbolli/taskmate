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
    const targetType = searchParams.get('targetType');
    const action = searchParams.get('action');
    const q = searchParams.get('q')?.toLowerCase();

    let logs = db.getAuditLogs();

    if (targetType && targetType !== 'all') {
      logs = logs.filter((l) => l.target_type === targetType);
    }

    if (action && action !== 'all') {
      logs = logs.filter((l) => l.action === action);
    }

    if (q) {
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          (l.admin_name && l.admin_name.toLowerCase().includes(q)) ||
          (l.target_name && l.target_name.toLowerCase().includes(q)) ||
          l.target_id.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
