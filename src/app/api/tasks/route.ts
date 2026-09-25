import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const budgetMax = searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined;
    const status = searchParams.get('status') || undefined;
    const requesterId = searchParams.get('requesterId') || undefined;

    const tasks = db.getTasks({
      collegeId,
      categoryId,
      search,
      budgetMax,
      status,
      requesterId,
    });

    const categories = db.getCategories();
    const colleges = db.getColleges();

    const enrichedTasks = tasks.map((t) => ({
      ...t,
      category: categories.find((c) => c.id === t.category_id),
      college: colleges.find((c) => c.id === t.college_id),
    }));

    return NextResponse.json({ tasks: enrichedTasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to post a task.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category_id,
      description,
      budget,
      quantity,
      deadline,
      location,
      handover_method,
      college_id,
      campus_id,
      city_id,
      files,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Please select a category.' }, { status: 400 });
    }
    if (!budget || budget <= 0) {
      return NextResponse.json({ error: 'Please provide a valid budget (min ₹50).' }, { status: 400 });
    }
    if (!deadline) {
      return NextResponse.json({ error: 'Please specify a deadline.' }, { status: 400 });
    }

    const newTask = db.createTask(
      {
        requester_id: user.id,
        category_id,
        college_id: college_id || user.college_id || 'col-snist',
        campus_id: campus_id || user.campus_id || 'cam-snist-main',
        city_id: city_id || user.city_id || 'city-hyd',
        title: title.trim(),
        description: description?.trim() || '',
        budget: Number(budget),
        quantity: quantity?.trim() || undefined,
        deadline,
        location: location?.trim() || 'Campus Meeting Point',
        distance_approx: 'On campus (0.5 km)',
        handover_method: handover_method || 'Campus meeting point',
      },
      files || []
    );

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
