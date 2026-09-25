import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId') || undefined;
    const stateId = searchParams.get('stateId') || undefined;
    const cityId = searchParams.get('cityId') || undefined;
    const collegeId = searchParams.get('collegeId') || undefined;

    const countries = db.getCountries();
    const states = db.getStates(countryId);
    const cities = db.getCities(stateId);
    const colleges = db.getColleges(cityId, true); // Active only
    const campuses = db.getCampuses(collegeId);

    return NextResponse.json({
      countries,
      states,
      cities,
      colleges,
      campuses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
