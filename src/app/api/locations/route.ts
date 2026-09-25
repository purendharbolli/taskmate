import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId') || undefined;
    const stateId = searchParams.get('stateId') || undefined;
    const cityId = searchParams.get('cityId') || undefined;
    const area = searchParams.get('area') || undefined;
    const collegeId = searchParams.get('collegeId') || undefined;

    const countries = db.getCountries();
    const states = db.getStates(countryId);
    const cities = db.getCities(stateId);
    const areas = db.getAreas(cityId);
    const colleges = db.getColleges(cityId, true, area); // Active only, filtered by area
    const campuses = db.getCampuses(collegeId);

    return NextResponse.json({
      countries,
      states,
      cities,
      areas,
      colleges,
      campuses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
