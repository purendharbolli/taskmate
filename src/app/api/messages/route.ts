import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const messages = db.getMessages(orderId);
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { orderId, message, attachment } = await req.json();

    if (!orderId || (!message?.trim() && !attachment)) {
      return NextResponse.json({ error: 'Order ID and a message or attachment are required' }, { status: 400 });
    }

    // STRICT 50 MB SERVER-SIDE VALIDATION FOR CHAT ATTACHMENTS
    const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
    if (attachment) {
      if (attachment.file_size_bytes && attachment.file_size_bytes > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            error: `Attachment "${attachment.file_name || 'file'}" exceeds the strict 50 MB server limit. For files larger than 50 MB, please share via a Google Drive link.`,
          },
          { status: 413 }
        );
      }
    }

    const cleanMessage = message?.trim() || (attachment ? `Shared attachment: ${attachment.file_name}` : '');
    const newMsg = db.createMessage(orderId, user.id, cleanMessage, attachment);
    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
