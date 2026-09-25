import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let user = await getCurrentUser();

    // Fallback 1: Resolve by body email or body user_id if cookies were stripped
    if (!user && body.email) {
      user = db.getUserByEmail(body.email.trim().toLowerCase()) || null;
    }
    if (!user && body.user_id) {
      user = db.getUserById(body.user_id) || null;
    }

    // Fallback 2: Re-create user if missing in this lambda instance
    if (!user && (body.email || body.name)) {
      const email = (body.email || 'student@campus.edu.in').trim().toLowerCase();
      const baseName = body.name || email.split('@')[0];
      user = db.createUser({
        id: body.user_id && body.user_id.startsWith('usr-') ? body.user_id : `usr-${Date.now()}`,
        name: baseName.charAt(0).toUpperCase() + baseName.slice(1),
        email: email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}&backgroundColor=ffd84d`,
        auth_provider: 'email',
        email_verified: true,
        college_verified: false,
        role: 'USER',
        skills: body.skills || [],
        rating: 5.0,
        completed_tasks: 0,
        completion_rate: 100,
        onboarding_completed: false,
        onboarding_step: 4,
        earnings_total: 0,
        earnings_available: 0,
        earnings_pending: 0,
        spent_total: 0,
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      step,
      state_id,
      city_id,
      area,
      college_id,
      custom_college_name,
      campus_id,
      name,
      bio,
      skills,
      college_email,
      complete
    } = body;

    let finalCollegeId = college_id;

    // If user provided a custom college name, register it into the database
    if ((finalCollegeId === 'custom' || !finalCollegeId) && custom_college_name?.trim()) {
      const newCollege = db.addCollege({
        name: custom_college_name.trim(),
        city_id: city_id || 'city-hyd',
        area: area || 'Hyderabad',
        category_type: 'Degree & PG',
        address: `${custom_college_name.trim()}, ${area || 'Hyderabad'}`,
        email_domain: 'college.edu.in',
        verification_required: false,
        active: true,
      });
      finalCollegeId = newCollege.id;
    }

    const updates: any = {};
    if (step) updates.onboarding_step = step;
    if (state_id) updates.state_id = state_id;
    if (city_id) updates.city_id = city_id;
    if (finalCollegeId) updates.college_id = finalCollegeId;
    if (campus_id) updates.campus_id = campus_id;
    if (name) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (skills) updates.skills = skills;

    if (college_email && finalCollegeId) {
      db.createVerificationRequest({
        userId: user.id,
        collegeId: finalCollegeId,
        collegeEmail: college_email,
      });
      const college = db.getCollegeById(finalCollegeId);
      if (college && college_email.includes(college.email_domain)) {
        updates.college_verified = true;
      }
    }

    if (complete) {
      updates.onboarding_completed = true;
      updates.onboarding_step = 4;
    }

    const updatedUser = db.updateUser(user.id, updates) || user;

    const res = NextResponse.json({ success: true, user: updatedUser });

    // Refresh cookies with confirmed user identity
    const sessionToken = Buffer.from(
      JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      })
    ).toString('base64');

    res.cookies.set('taskmate_user_id', sessionToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      sameSite: 'lax',
    });

    res.cookies.set('taskmate_user_email', updatedUser.email, {
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
