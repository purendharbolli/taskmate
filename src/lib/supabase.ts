import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Polyfill WebSocket in Node.js runtime environments (Node < 22) for Supabase client
if (typeof window === 'undefined' && typeof (globalThis as any).WebSocket === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require('ws');
    (globalThis as any).WebSocket = ws;
  } catch (e) {
    // ws is optional or polyfilled elsewhere
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Fallback client to prevent crashing when credentials are not yet entered
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-taskmate.supabase.co', 'mock-anon-key-public-taskmate');

/**
 * Persists records directly to Supabase with non-blocking error handling
 */
export async function syncRecordToSupabase(table: string, record: any): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from(table).upsert([record]);
    if (error) {
      console.warn(`[Supabase Sync] Warning on table '${table}':`, error.message);
    }
  } catch (err: any) {
    console.warn(`[Supabase Sync] Exception on table '${table}':`, err?.message || err);
  }
}

/**
 * Direct Supabase Read Helpers
 */
export async function getSupabaseUserByEmail(email: string): Promise<any | null> {
  if (!isSupabaseConfigured() || !email) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase getUser] Exception:', err);
  }
  return null;
}

export async function getSupabaseUserById(id: string): Promise<any | null> {
  if (!isSupabaseConfigured() || !id) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase getUserById] Exception:', err);
  }
  return null;
}

export async function getSupabaseTasks(filter?: {
  collegeId?: string;
  categoryId?: string;
  requesterId?: string;
  status?: string;
  budgetMax?: number;
}): Promise<any[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    let q = supabase.from('tasks').select('*');
    if (filter?.collegeId) q = q.eq('college_id', filter.collegeId);
    if (filter?.categoryId) q = q.eq('category_id', filter.categoryId);
    if (filter?.requesterId) q = q.eq('requester_id', filter.requesterId);
    if (filter?.status) q = q.eq('status', filter.status);
    if (filter?.budgetMax) q = q.lte('budget', filter.budgetMax);
    q = q.order('created_at', { ascending: false });

    const { data, error } = await q;
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase getTasks] Exception:', err);
  }
  return null;
}

export async function getSupabaseTaskFiles(taskId: string): Promise<any[] | null> {
  if (!isSupabaseConfigured() || !taskId) return null;
  try {
    const { data, error } = await supabase
      .from('task_files')
      .select('*')
      .eq('task_id', taskId);
    if (!error && data) return data;
  } catch (err) {
    console.warn('[Supabase getTaskFiles] Exception:', err);
  }
  return null;
}
