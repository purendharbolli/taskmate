import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { isDisallowedFileType, sanitizeUser, sanitizePublicUser } from '@/lib/security';
import { syncRecordToSupabase } from '@/lib/supabase';

// STRICT 50 MB LIMIT
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to view this private task conversation.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Task conversation not found.' }, { status: 404 });
    }

    // STRICT PRIVACY PROTECTION: Only Task Giver and Task Acceptor (or staff) can access
    const isParticipant = user.id === order.requester_id || user.id === order.worker_id;
    const isStaff = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR';

    if (!isParticipant && !isStaff) {
      return NextResponse.json(
        {
          error:
            'Access denied. This conversation is private and restricted strictly to the task giver and the accepted taskmate.',
        },
        { status: 403 }
      );
    }

    const messages = db.getMessages(orderId);

    return NextResponse.json({
      messages,
      order: {
        id: order.id,
        status: order.status,
        amount: order.amount,
        platform_fee: order.platform_fee,
        total_amount: order.total_amount,
        created_at: order.created_at,
      },
      task: order.task,
      requester: sanitizePublicUser(order.requester),
      worker: sanitizePublicUser(order.worker),
      currentUserId: user.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to send a message.' },
        { status: 401 }
      );
    }

    if (user.is_suspended) {
      return NextResponse.json(
        { error: 'Your account is suspended. You cannot send messages.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderId, message, attachment, google_drive_link } = body;

    if (!orderId || (!message?.trim() && !attachment && !google_drive_link)) {
      return NextResponse.json(
        { error: 'A message, attachment, or Google Drive link is required.' },
        { status: 400 }
      );
    }

    const order = db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Task conversation not found.' }, { status: 404 });
    }

    // STRICT PRIVACY PROTECTION: Only Task Giver and Task Acceptor can send messages
    const isParticipant = user.id === order.requester_id || user.id === order.worker_id;
    const isStaff = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR';

    if (!isParticipant && !isStaff) {
      return NextResponse.json(
        {
          error: 'Access denied. You are not authorized to participate in this task conversation.',
        },
        { status: 403 }
      );
    }

    // Attachment validation (Strict 50 MB limit & unsafe file types block)
    if (attachment) {
      if (attachment.file_size_bytes && attachment.file_size_bytes > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Attachment "${attachment.file_name || 'file'}" exceeds the strict 50 MB limit. For files larger than 50 MB, please share via Google Drive.`,
          },
          { status: 413 }
        );
      }

      if (isDisallowedFileType(attachment.file_name)) {
        return NextResponse.json(
          {
            error: 'For safety, executable and script files (.exe, .bat, etc.) cannot be shared in chat.',
          },
          { status: 400 }
        );
      }
    }

    // Google Drive URL validation if provided
    let cleanDriveLink: string | undefined = undefined;
    if (google_drive_link && typeof google_drive_link === 'string' && google_drive_link.trim()) {
      const trimmed = google_drive_link.trim();
      try {
        const parsed = new URL(trimmed);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: 'Google Drive URL must start with https://' },
            { status: 400 }
          );
        }
        cleanDriveLink = trimmed;
      } catch {
        return NextResponse.json(
          { error: 'Please enter a valid Google Drive URL (e.g. https://drive.google.com/...)' },
          { status: 400 }
        );
      }
    }

    let cleanMessage = message?.trim() || '';
    if (!cleanMessage) {
      if (cleanDriveLink) {
        cleanMessage = `Shared Google Drive resource: ${cleanDriveLink}`;
      } else if (attachment) {
        cleanMessage = `Shared attachment: ${attachment.file_name}`;
      }
    }

    const newMsg = db.createMessage(orderId, user.id, cleanMessage, attachment);
    if (cleanDriveLink) {
      (newMsg as any).google_drive_link = cleanDriveLink;
    }

    syncRecordToSupabase('messages', newMsg);

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
