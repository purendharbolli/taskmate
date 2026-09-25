import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { step, state_id, city_id, college_id, campus_id, name, bio, skills, college_email, complete } = body;

    const updates: any = {};
    if (step) updates.onboarding_step = step;
    if (state_id) updates.state_id = state_id;
    if (city_id) updates.city_id = city_id;
    if (college_id) updates.college_id = college_id;
    if (campus_id) updates.campus_id = campus_id;
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (skills) updates.skills = skills;

    if (college_email && college_id) {
      // Create verification request automatically
      db.createVerificationRequest({
        userId: user.id,
        collegeId: college_id,
        collegeEmail: college_email,
      });
      // For demo convenience, if email ends with official domain, grant verified badge directly
      const college = db.getCollegeById(college_id);
      if (college && college_email.includes(college.email_domain)) {
        updates.college_verified = true;
      }
    }

    if (complete) {
      updates.onboarding_completed = true;
      updates.onboarding_step = 4;
    }

    const updatedUser = db.updateUser(user.id, updates);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
