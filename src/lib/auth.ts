import { cookies } from 'next/headers';
import { db } from './db';
import { User, UserRole } from './types';
import { sanitizeUser } from './security';
import { getSupabaseUserById, getSupabaseUserByEmail } from './supabase';

const SESSION_COOKIE_NAME = 'taskmate_user_id';
const EMAIL_COOKIE_NAME = 'taskmate_user_email';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const emailCookie = cookieStore.get(EMAIL_COOKIE_NAME)?.value;

  if (!rawCookie && !emailCookie) return null;

  let userId = rawCookie;
  let cachedEmail: string | undefined = emailCookie;

  if (rawCookie) {
    try {
      const decoded = JSON.parse(Buffer.from(rawCookie, 'base64').toString('utf-8'));
      if (decoded && decoded.id) {
        userId = decoded.id;
        if (decoded.email) cachedEmail = decoded.email;
      }
    } catch {
      userId = rawCookie;
    }
  }

  let user = userId ? db.getUserById(userId) : undefined;
  if (!user && cachedEmail) {
    user = db.getUserByEmail(cachedEmail);
  }

  // Check live Supabase database directly for persistent cloud account
  if (!user && (userId || cachedEmail)) {
    try {
      if (userId) {
        const suUser = await getSupabaseUserById(userId);
        if (suUser) user = suUser;
      }
      if (!user && cachedEmail) {
        const suUser = await getSupabaseUserByEmail(cachedEmail);
        if (suUser) user = suUser;
      }
      if (user) {
        db.upsertUser(user);
      }
    } catch (e) {
      console.warn('[getCurrentUser Supabase] Fallback:', e);
    }
  }

  // Resilient multi-instance synchronization:
  // If the user authenticated in another serverless lambda instance, re-hydrate in the current lambda
  if (!user && cachedEmail) {
    const email = cachedEmail.toLowerCase();
    const baseName = email.split('@')[0];
    user = db.createUser({
      id: userId && userId.startsWith('usr-') ? userId : `usr-${Date.now()}`,
      name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}&backgroundColor=ffd84d`,
      auth_provider: 'email',
      email_verified: true,
      college_verified: false,
      role: 'USER',
      skills: [],
      rating: 5.0,
      completed_tasks: 0,
      completion_rate: 100,
      onboarding_completed: false,
      onboarding_step: 1,
      earnings_total: 0,
      earnings_available: 0,
      earnings_pending: 0,
      spent_total: 0,
    });
  }

  if (user) {
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@taskmate.campus')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());
    if (adminEmails.includes(user.email.toLowerCase())) {
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        user.role = 'SUPER_ADMIN';
        db.updateUser(user.id, { role: 'SUPER_ADMIN' });
      }
    }
  }

  return user ? sanitizeUser(user) : null;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  if (user.is_suspended) {
    // If temporary block has expired, automatically lift suspension
    if (user.blocked_until && new Date(user.blocked_until).getTime() <= Date.now()) {
      user.is_suspended = false;
      user.block_status = 'NONE';
      user.suspension_reason = undefined;
      user.blocked_until = undefined;
      db.updateUser(user.id, {
        is_suspended: false,
        block_status: 'NONE',
        suspension_reason: undefined,
        blocked_until: undefined,
      });
      return user;
    }
    throw new Error('SUSPENDED');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export function canAccessAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.is_suspended) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@taskmate.campus')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim());
  if (adminEmails.includes(user.email.toLowerCase())) return true;
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR';
}
