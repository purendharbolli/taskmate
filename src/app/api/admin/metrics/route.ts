import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    // Server-side role protection
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const raw = db.getRaw();

    const totalUsers = raw.users.length;
    const verifiedStudents = raw.users.filter((u) => u.college_verified).length;
    const activeTasks = raw.tasks.filter((t) => t.status === 'OPEN').length;
    const completedTasks = raw.tasks.filter((t) => t.status === 'COMPLETED').length;
    const activeColleges = raw.colleges.filter((c) => c.active).length;
    const activeCities = raw.cities.length;
    const openDisputes = raw.disputes.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length;
    const pendingVerifications = raw.verification_requests.filter((v) => v.status === 'PENDING').length;
    const pendingCollegeRequests = raw.college_requests.filter((r) => r.status === 'PENDING').length;

    const totalVolume = raw.orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const platformRevenue = raw.orders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);

    // Breakdown by Category
    const categoryCounts: { [key: string]: number } = {};
    raw.tasks.forEach((t) => {
      const cat = raw.categories.find((c) => c.id === t.category_id)?.name || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Breakdown by City
    const cityCounts: { [key: string]: number } = {};
    raw.tasks.forEach((t) => {
      const city = raw.cities.find((c) => c.id === t.city_id)?.name || 'Hyderabad';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    // Order status breakdown
    const orderStatuses: { [key: string]: number } = {};
    raw.orders.forEach((o) => {
      orderStatuses[o.status] = (orderStatuses[o.status] || 0) + 1;
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        verifiedStudents,
        activeTasks,
        completedTasks,
        activeColleges,
        activeCities,
        openDisputes,
        pendingVerifications,
        pendingCollegeRequests,
        totalVolume,
        platformRevenue,
      },
      categoryCounts,
      cityCounts,
      orderStatuses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
