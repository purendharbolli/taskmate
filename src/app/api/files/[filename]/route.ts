import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const rawFilename = params.filename;
    // Security: Prevent path traversal
    const safeFilename = path.basename(decodeURIComponent(rawFilename));

    const possibleDirs = [
      path.join('/tmp', 'uploads'),
      path.join(process.cwd(), 'public', 'uploads'),
    ];

    let foundPath: string | null = null;
    for (const dir of possibleDirs) {
      const candidate = path.join(dir, safeFilename);
      if (fs.existsSync(candidate)) {
        foundPath = candidate;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(foundPath);
    const ext = path.extname(safeFilename).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
