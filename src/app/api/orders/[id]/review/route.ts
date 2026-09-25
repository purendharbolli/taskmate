import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = db.getOrderById(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Determine reviewee (if user is requester, reviewee is worker, and vice versa)
    const revieweeId = user.id === order.requester_id ? order.worker_id : order.requester_id;

    const review = db.createReview({
      order_id: params.id,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating: Number(rating),
      comment: comment || 'Great peer collaboration on campus!',
    });

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
