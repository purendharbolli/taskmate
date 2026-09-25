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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
 * Background non-blocking sync helpers that safely persist records to Supabase
 * when configured, without halting application execution if tables are pending migration.
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
