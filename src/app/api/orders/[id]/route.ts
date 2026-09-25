import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const orderData = db.getOrderById(params.id);

    if (!orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isRequester = user?.id === orderData.requester_id;
    const isWorker = user?.id === orderData.worker_id;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    // The OTP must be visible ONLY to the requester (and admin for audit)
    // If worker views the order and it's not yet delivered, mask the OTP!
    let sanitizedOrder = { ...orderData };
    if (isWorker && !isRequester && !isAdmin && orderData.status === 'READY_FOR_HANDOVER') {
      delete sanitizedOrder.handover_otp;
      if (sanitizedOrder.handover) {
        sanitizedOrder.handover = {
          ...sanitizedOrder.handover,
          otp_code: '••••',
          otp_hash: '••••',
        };
      }
    }

    return NextResponse.json({
      order: sanitizedOrder,
      isRequester,
      isWorker,
      isAdmin,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
