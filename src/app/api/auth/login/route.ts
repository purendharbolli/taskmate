import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { provider, email, name, avatar } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = db.getUserByEmail(email);

    if (!user) {
      // Create new user with onboarding incomplete
      const baseName = name || email.split('@')[0];
      user = db.createUser({
        name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
        email: email.toLowerCase(),
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(baseName)}&backgroundColor=ffd84d`,
        auth_provider: provider === 'google' ? 'google' : 'email',
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

    const res = NextResponse.json({
      success: true,
      user,
      redirectTo: user.onboarding_completed ? '/dashboard' : '/onboarding',
    });

    res.cookies.set('taskmate_user_id', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: 'lax',
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
