import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { sanitizeUser, sanitizePublicUser } from '@/lib/security';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let data = db.getTaskById(params.id);

    // If not found in local cache, query Supabase directly
    if (!data && isSupabaseConfigured()) {
      try {
        const { data: suTask, error: tErr } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', params.id)
          .maybeSingle();

        if (!tErr && suTask) {
          const [filesRes, requesterRes, categoryRes, appsRes] = await Promise.all([
            supabase.from('task_files').select('*').eq('task_id', params.id),
            supabase.from('users').select('*').eq('id', suTask.requester_id).maybeSingle(),
            supabase.from('categories').select('*').eq('id', suTask.category_id).maybeSingle(),
            supabase.from('applications').select('*').eq('task_id', params.id),
          ]);

          data = {
            task: suTask,
            files: filesRes.data || [],
            requester: requesterRes.data ? sanitizeUser(requesterRes.data) : undefined,
            category: categoryRes.data || undefined,
            applications: appsRes.data || [],
          };
        }
      } catch (suErr) {
        console.warn('[Supabase getTaskById] Exception:', suErr);
      }
    }

    if (!data) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Ensure attachments from Supabase task_files are populated
    if (data.files.length === 0 && isSupabaseConfigured()) {
      try {
        const { data: suFiles } = await supabase
          .from('task_files')
          .select('*')
          .eq('task_id', params.id);
        if (suFiles && suFiles.length > 0) {
          data.files = suFiles;
        }
      } catch {}
    }

    const colleges = db.getColleges();
    let college = colleges.find((c) => c.id === data!.task.college_id);

    if (!college && isSupabaseConfigured() && data.task.college_id) {
      try {
        const { data: suCollege } = await supabase
          .from('colleges')
          .select('*')
          .eq('id', data.task.college_id)
          .maybeSingle();
        if (suCollege) college = suCollege;
      } catch {}
    }

    const order = db.getOrderByTaskId(params.id);
    const allUsers = db.getUsers();

    // Sanitize requester and applicants to guarantee zero public email/credential leaks
    const sanitizedRequester = data.requester ? sanitizePublicUser(data.requester) : undefined;
    const sanitizedApplications = (data.applications || []).map((app) => {
      const worker = allUsers.find((u) => u.id === app.worker_id);
      return {
        ...app,
        worker: worker ? sanitizePublicUser(worker) : (app as any).worker ? sanitizePublicUser((app as any).worker) : undefined,
      };
    });

    return NextResponse.json({
      ...data,
      requester: sanitizedRequester,
      applications: sanitizedApplications,
      college,
      orderId: order?.id,
      acceptedWorkerId: order?.worker_id,
      order: order
        ? {
            id: order.id,
            status: order.status,
            worker_id: order.worker_id,
            requester_id: order.requester_id,
          }
        : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

