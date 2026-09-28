import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, sanitizeUser } from '@/lib/security';
import { getSupabaseUserByEmail } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'login', email, password, name, avatar } = body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    let user = db.getUserByEmail(cleanEmail);
    if (!user) {
      try {
        const suUser = await getSupabaseUserByEmail(cleanEmail);
        if (suUser) {
          user = db.upsertUser(suUser);
        }
      } catch (suErr) {
        console.warn('[Login Supabase check] Exception:', suErr);
      }
    }

    // ==========================================
    // ACTION: SIGNUP
    // ==========================================
    if (action === 'signup') {
      // 1. One unique TaskMate profile per email address.
      // Prevent duplicate accounts using the same email.
      if (user && (user.onboarding_completed || user.password_hash)) {
        return NextResponse.json(
          {
            error: 'An account with this email already exists. Please log in with your password.',
            accountExists: true,
          },
          { status: 409 }
        );
      }

      // If user started onboarding previously but didn't finish, resume
      if (!user) {
        const baseName = name || cleanEmail.split('@')[0];
        user = db.createUser({
          name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
          nickname: baseName,
          email: cleanEmail,
          avatar:
            avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
              baseName
            )}&backgroundColor=ffd84d`,
          auth_provider: 'email',
          email_verified: true,
          college_verified: false,
          admin_verified: false,
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

      const res = NextResponse.json({
        success: true,
        user: sanitizeUser(user),
        redirectTo: '/onboarding',
      });

      setSessionCookies(res, user);
      return res;
    }

    // ==========================================
    // ACTION: LOGIN
    // ==========================================
    if (!user && cleanEmail === 'admin@taskmate.campus') {
      user = db.createUser({
        id: 'usr-admin-1',
        name: 'Campus Lead Admin',
        email: 'admin@taskmate.campus',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin&backgroundColor=ffd84d',
        auth_provider: 'email',
        email_verified: true,
        college_verified: true,
        role: 'SUPER_ADMIN',
        skills: ['Platform Admin', 'Moderation'],
        rating: 5.0,
        completed_tasks: 0,
        completion_rate: 100,
        onboarding_completed: true,
        earnings_total: 0,
        earnings_available: 0,
        earnings_pending: 0,
        spent_total: 0,
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          error: 'No TaskMate account found for this email. Please switch to Create Account to get started.',
          notFound: true,
        },
        { status: 404 }
      );
    }

    // If user has a password set, require and verify it
    if (user.password_hash) {
      if (!password) {
        return NextResponse.json(
          { error: 'Please enter your password to log in.' },
          { status: 400 }
        );
      }

      const isValid = verifyPassword(password, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          {
            error: 'Incorrect password. Please try again or use Forgot Password to reset it.',
            invalidPassword: true,
          },
          { status: 401 }
        );
      }
    } else if (password) {
      // First-time login: save provided password as secure hash
      const hash = (await import('@/lib/security')).hashPassword(password);
      db.updateUser(user.id, { password_hash: hash });
    }

    // Check if user is an admin by email
    const envAdmins = (process.env.ADMIN_EMAILS || 'admin@taskmate.campus')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());
    if (envAdmins.includes(user.email.toLowerCase()) && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      user.role = 'SUPER_ADMIN';
      db.updateUser(user.id, { role: 'SUPER_ADMIN' });
    }

    // Update last login timestamp
    db.updateUser(user.id, {
      last_login_at: new Date().toISOString(),
    });

    const isAdminUser = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR';

    const res = NextResponse.json({
      success: true,
      user: sanitizeUser(user),
      redirectTo: isAdminUser ? '/admin' : user.onboarding_completed ? '/dashboard' : '/onboarding',
    });

    setSessionCookies(res, user);
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function setSessionCookies(res: NextResponse, user: any) {
  const sessionToken = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  ).toString('base64');

  res.cookies.set('taskmate_user_id', sessionToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    sameSite: 'lax',
  });

  res.cookies.set('taskmate_user_email', user.email, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    sameSite: 'lax',
  });
}
