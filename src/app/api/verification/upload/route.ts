import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function getPrivateVerificationDir(): string {
  const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
  const dir = isVercel
    ? path.join('/tmp', 'private-verifications')
    : path.join(process.cwd(), 'storage', 'private-verifications');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to submit verification documents.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No verification document provided.' }, { status: 400 });
    }

    // Strict MIME type validation for student identity documents
    const mimeType = file.type?.toLowerCase() || '';
    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !file.name.match(/\.(jpe?g|png|webp|pdf)$/i)) {
      return NextResponse.json(
        { error: 'Invalid document format. Please upload a clear photo or PDF of your College ID card.' },
        { status: 400 }
      );
    }

    // Size limit: 15 MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'College ID document must be under 15 MB.' }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Secure unguessable private filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const privateFileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const dir = getPrivateVerificationDir();
    const filePath = path.join(dir, privateFileName);
    fs.writeFileSync(filePath, buffer);

    // Private Admin-Only access URL (requires admin authentication session to read)
    const privateDocumentUrl = `/api/verification/document?file=${encodeURIComponent(privateFileName)}`;

    return NextResponse.json({
      success: true,
      document_url: privateDocumentUrl,
      document_filename: file.name,
      document_type: file.type || 'application/octet-stream',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upload verification document' }, { status: 500 });
  }
}
