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
    const userId = searchParams.get('userId');

    // If specific userId is requested, return deep moderation context
    if (userId) {
      const ctx = db.getUserModerationContext(userId);
      if (!ctx) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({
        ...ctx,
        user: sanitizeUser(ctx.user),
      });
    }

    const q = searchParams.get('q')?.toLowerCase();
    const collegeId = searchParams.get('collegeId');
    const verified = searchParams.get('verified');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let users = db.getUsers();

    if (q) {
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.nickname && u.nickname.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q))
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

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    if (status === 'suspended') {
      users = users.filter((u) => u.is_suspended);
    } else if (status === 'active') {
      users = users.filter((u) => !u.is_suspended);
    } else if (status === 'warned') {
      users = users.filter((u) => (u.warning_count || 0) > 0);
    }

    const colleges = db.getColleges();
    const enriched = users.map((u) => ({
      ...sanitizeUser(u),
      college: colleges.find((c) => c.id === u.college_id),
    }));

    return NextResponse.json({ users: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN' && admin.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const { action, userId, reason, durationDays, newRole } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let updatedUser = null;

    if (action === 'warn') {
      if (!reason) {
        return NextResponse.json({ error: 'Warning reason is required' }, { status: 400 });
      }
      updatedUser = db.warnUser(userId, reason, admin.id, admin.name);
    } else if (action === 'block_temp') {
      if (!reason) {
        return NextResponse.json({ error: 'Block reason is required' }, { status: 400 });
      }
      const days = Number(durationDays) || 7;
      updatedUser = db.blockUser(userId, 'TEMPORARY', reason, admin.id, admin.name, days);
    } else if (action === 'block_perm') {
      if (!reason) {
        return NextResponse.json({ error: 'Permanent block justification is required' }, { status: 400 });
      }
      updatedUser = db.blockUser(userId, 'PERMANENT', reason, admin.id, admin.name);
    } else if (action === 'unblock') {
      updatedUser = db.unblockUser(userId, admin.id, admin.name);
    } else if (action === 'update_role') {
      if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only administrators can change user roles' }, { status: 403 });
      }
      if (!newRole) {
        return NextResponse.json({ error: 'New role is required' }, { status: 400 });
      }
      updatedUser = db.updateUserRole(userId, newRole, admin.id, admin.name);
    } else {
      return NextResponse.json({ error: 'Unknown moderation action' }, { status: 400 });
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found or operation failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: sanitizeUser(updatedUser) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { userId, reason } = await req.json();
    const updated = db.toggleUserSuspension(userId, reason);

    return NextResponse.json({ success: true, user: updated ? sanitizeUser(updated) : null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
