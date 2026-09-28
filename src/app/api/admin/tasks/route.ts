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
    const q = searchParams.get('q')?.toLowerCase();
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const collegeId = searchParams.get('collegeId');

    let tasks = db.getTasks();

    if (q) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'all') {
      tasks = tasks.filter((t) => t.status === status);
    }

    if (categoryId && categoryId !== 'all') {
      tasks = tasks.filter((t) => t.category_id === categoryId);
    }

    if (collegeId && collegeId !== 'all') {
      tasks = tasks.filter((t) => t.college_id === collegeId);
    }

    const users = db.getUsers();
    const colleges = db.getColleges();
    const categories = db.getCategories();
    const orders = db.getOrders();
    const applications = db.getApplications();

    const enriched = tasks.map((t) => {
      const requester = users.find((u) => u.id === t.requester_id);
      const college = colleges.find((c) => c.id === t.college_id);
      const category = categories.find((c) => c.id === t.category_id);
      const taskOrder = orders.find((o) => o.task_id === t.id);
      const worker = taskOrder ? users.find((u) => u.id === taskOrder.worker_id) : undefined;
      const appsCount = applications.filter((a) => a.task_id === t.id).length;

      return {
        ...t,
        requester: requester ? sanitizeUser(requester) : undefined,
        worker: worker ? sanitizeUser(worker) : undefined,
        college,
        category,
        order: taskOrder,
        applications_count: appsCount,
      };
    });

    return NextResponse.json({ tasks: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN' && admin.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const { taskId, reason } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }
    if (!reason) {
      return NextResponse.json({ error: 'Moderation rationale is required' }, { status: 400 });
    }

    const updatedTask = db.removeTaskByAdmin(taskId, reason, admin.id, admin.name);
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
