import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'college') {
      if (!data.name || !data.city_id) {
        return NextResponse.json({ error: 'College name and city are required' }, { status: 400 });
      }
      const newCollege = db.addCollege({
        name: data.name,
        short_name: data.short_name || data.name.split(' ')[0],
        city_id: data.city_id,
        address: data.address || '',
        email_domain: data.email_domain || '',
        verification_required: data.verification_required ?? true,
        active: true,
      });
      return NextResponse.json({ success: true, college: newCollege });
    }

    if (type === 'city') {
      if (!data.name || !data.state_id) {
        return NextResponse.json({ error: 'City name and state are required' }, { status: 400 });
      }
      const newCity = db.addCity({
        name: data.name,
        state_id: data.state_id,
      });
      return NextResponse.json({ success: true, city: newCity });
    }

    if (type === 'campus') {
      if (!data.name || !data.college_id) {
        return NextResponse.json({ error: 'Campus name and college are required' }, { status: 400 });
      }
      const newCampus = db.addCampus({
        name: data.name,
        college_id: data.college_id,
        location: data.location || '',
        active: true,
      });
      return NextResponse.json({ success: true, campus: newCampus });
    }

    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const { action, id, updates } = await req.json();

    if (action === 'toggle-active') {
      const updated = db.toggleCollegeActive(id);
      return NextResponse.json({ success: true, college: updated });
    }

    if (action === 'update-college') {
      const updated = db.updateCollege(id, updates);
      return NextResponse.json({ success: true, college: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
