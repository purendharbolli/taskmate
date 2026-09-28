import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  isSupabaseConfigured,
  supabase,
  getSupabaseTasks,
  getSupabaseTaskFiles,
} from '@/lib/supabase';

const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024; // Strict 50 MB server limit

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId') || undefined;
    const cityId = searchParams.get('cityId') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search')?.toLowerCase() || undefined;
    const budgetMin = searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined;
    const budgetMax = searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined;
    const status = searchParams.get('status') || undefined;
    const requesterId = searchParams.get('requesterId') || undefined;

    let tasks: any[] = [];

    // 1. Direct Supabase read
    if (isSupabaseConfigured()) {
      try {
        const suTasks = await getSupabaseTasks({
          collegeId,
          cityId,
          categoryId,
          requesterId,
          status,
          budgetMin,
          budgetMax,
        });
        if (suTasks && suTasks.length > 0) {
          tasks = suTasks;
        }
      } catch (err) {
        console.warn('[Supabase GET Tasks] Falling back to local cache:', err);
      }
    }

    // 2. Fallback to local database cache if Supabase is offline or empty
    if (tasks.length === 0) {
      tasks = db.getTasks({
        collegeId,
        cityId,
        categoryId,
        search,
        budgetMax,
        status,
        requesterId,
      });
      if (budgetMin) {
        tasks = tasks.filter((t) => t.budget >= budgetMin);
      }
    } else if (search) {
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search)
      );
    }

    const categories = db.getCategories();
    const colleges = db.getColleges();
    const cities = db.getCities();
    const users = db.getUsers();

    const enrichedTasks = await Promise.all(
      tasks.map(async (t) => {
        let files = db.getTaskFiles(t.id);
        if (files.length === 0 && isSupabaseConfigured()) {
          const suFiles = await getSupabaseTaskFiles(t.id);
          if (suFiles && suFiles.length > 0) {
            files = suFiles;
          }
        }
        const reqUser = users.find((u) => u.id === t.requester_id);
        return {
          ...t,
          category: categories.find((c) => c.id === t.category_id),
          college: colleges.find((c) => c.id === t.college_id),
          requester: reqUser
            ? {
                id: reqUser.id,
                name: reqUser.name,
                nickname: reqUser.nickname,
                admin_verified: Boolean(reqUser.admin_verified),
                verification_status: reqUser.verification_status,
              }
            : undefined,
          requester_verified: Boolean(reqUser?.admin_verified),
          files,
        };
      })
    );

    return NextResponse.json({
      tasks: enrichedTasks,
      categories,
      colleges,
      cities,
    });
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
      google_drive_link,
      files,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Please select a task category.' }, { status: 400 });
    }
    if (!budget || Number(budget) <= 0) {
      return NextResponse.json({ error: 'Please provide a valid offered price (min ₹50).' }, { status: 400 });
    }
    if (!deadline || !deadline.trim()) {
      return NextResponse.json({ error: 'Please specify a deadline date and time.' }, { status: 400 });
    }

    // Google Drive URL validation if provided
    let cleanDriveLink: string | undefined = undefined;
    if (google_drive_link && google_drive_link.trim()) {
      const driveUrl = google_drive_link.trim();
      try {
        const parsed = new URL(driveUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: 'Google Drive link must begin with https:// or http://' },
            { status: 400 }
          );
        }
        cleanDriveLink = driveUrl;
      } catch {
        return NextResponse.json(
          { error: 'Please provide a valid URL for the Google Drive link (e.g. https://drive.google.com/...)' },
          { status: 400 }
        );
      }
    }

    // STRICT 50 MB SERVER-SIDE VALIDATION FOR ATTACHED FILES
    const validatedFiles = Array.isArray(files) ? files : [];
    for (const f of validatedFiles) {
      if (f.file_size_bytes && f.file_size_bytes > MAX_ATTACHMENT_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Attachment "${f.file_name || 'file'}" exceeds the strict 50 MB server limit. For files larger than 50 MB, please share them via Google Drive.`,
          },
          { status: 413 }
        );
      }
    }

    // Auto-associate the task giver's registered college and city
    const resolvedCollegeId = college_id || user.college_id || 'col-snist';
    const resolvedCityId = city_id || user.city_id || 'city-hyd';

    const newTask = db.createTask(
      {
        requester_id: user.id,
        category_id,
        college_id: resolvedCollegeId,
        campus_id: campus_id || user.campus_id || 'cam-snist-main',
        city_id: resolvedCityId,
        title: title.trim(),
        description: description?.trim() || '',
        budget: Number(budget),
        quantity: quantity?.trim() || undefined,
        deadline: deadline.trim(),
        location: location?.trim() || 'Campus Meeting Point / Online Delivery',
        distance_approx: 'On campus',
        handover_method: handover_method || 'Campus meeting point',
        google_drive_link: cleanDriveLink,
      },
      validatedFiles
    );

    // Direct write to Supabase
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('tasks').upsert([newTask]);
        if (validatedFiles.length > 0) {
          const tfRecords = validatedFiles.map((f: any, idx: number) => ({
            id: `tf-${newTask.id}-${idx + 1}`,
            task_id: newTask.id,
            file_name: f.file_name,
            file_url: f.file_url,
            file_type: f.file_type,
            file_size: f.file_size || '1.2 MB',
            file_size_bytes: f.file_size_bytes,
          }));
          await supabase.from('task_files').upsert(tfRecords);
        }
      } catch (suErr) {
        console.warn('[Supabase Direct Task Sync] Exception:', suErr);
      }
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
