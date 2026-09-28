import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canAccessAdmin } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

function getPrivateVerificationDir(): string {
  const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
  return isVercel
    ? path.join('/tmp', 'private-verifications')
    : path.join(process.cwd(), 'storage', 'private-verifications');
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    // STRICT SECURITY: Verification documents are private and accessible ONLY by authorized administrators
    if (!user || !canAccessAdmin(user)) {
      return NextResponse.json(
        { error: 'FORBIDDEN: Verification documents are confidential and accessible only to TaskMate administrators.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: 'Missing document file parameter.' }, { status: 400 });
    }

    // Path traversal defense
    const sanitizedFileName = path.basename(fileName);
    const dir = getPrivateVerificationDir();
    const filePath = path.join(dir, sanitizedFileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Document not found or has expired.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Determine MIME type
    let contentType = 'application/octet-stream';
    if (sanitizedFileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (sanitizedFileName.endsWith('.png')) {
      contentType = 'image/png';
    } else if (sanitizedFileName.endsWith('.jpg') || sanitizedFileName.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (sanitizedFileName.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${sanitizedFileName}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to retrieve document.' }, { status: 500 });
  }
}
