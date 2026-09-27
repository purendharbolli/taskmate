import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    // If all is requested, allow admin or fallback to user's orders
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const orders = db.getOrders(user.id);
    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
