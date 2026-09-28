import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { isDisallowedFileType } from '@/lib/security';
import fs from 'fs';
import path from 'path';

// STRICT 50 MB SERVER-SIDE ENFORCEMENT
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB = 52,428,800 bytes

function getUploadDir(): string {
  const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
  const dir = isVercel ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to upload files.' }, { status: 401 });
    }

    if (user.is_suspended) {
      return NextResponse.json(
        { error: 'Your account is suspended. You cannot upload files.' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided in the upload request.' }, { status: 400 });
    }

    // Safety validation against executable / dangerous scripts
    if (isDisallowedFileType(file.name)) {
      return NextResponse.json(
        {
          error: `For campus safety, executable and script files (.exe, .bat, etc.) cannot be uploaded. Please share documents, images, code archives, or slides.`,
        },
        { status: 400 }
      );
    }

    // 1. Initial size check from File object header
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File "${file.name}" (${formatBytes(file.size)}) exceeds the maximum server limit of 50 MB. For files larger than 50 MB, please share via a Google Drive link.`,
          maxLimitBytes: MAX_FILE_SIZE_BYTES,
        },
        { status: 413 }
      );
    }

    // 2. Read arrayBuffer and verify actual bytes to prevent spoofed client headers
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File payload (${formatBytes(buffer.byteLength)}) exceeds the strict 50 MB server limit. Please share files larger than 50 MB via Google Drive.`,
          maxLimitBytes: MAX_FILE_SIZE_BYTES,
        },
        { status: 413 }
      );
    }

    // Sanitize filename and create unique storage name
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePrefix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const storedFileName = `${uniquePrefix}-${sanitizedOriginalName}`;

    let fileUrl = `/api/files/${encodeURIComponent(storedFileName)}`;
    let storageEngine = 'serverless-disk';

    // Attempt direct upload to Supabase Storage bucket 'task-attachments'
    if (isSupabaseConfigured()) {
      try {
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('task-attachments')
          .upload(storedFileName, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(storedFileName);

          if (publicUrlData && publicUrlData.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
            storageEngine = 'supabase-storage';
          }
        }
      } catch (sErr) {
        console.warn('[Supabase Storage] Fallback to serverless storage:', sErr);
      }
    }

    // Redundant backup to local serverless filesystem so file is never lost
    try {
      const uploadDir = getUploadDir();
      const filePath = path.join(uploadDir, storedFileName);
      fs.writeFileSync(filePath, buffer);
    } catch {}

    return NextResponse.json({
      success: true,
      file_name: file.name,
      file_url: fileUrl,
      file_size: formatBytes(buffer.byteLength),
      file_size_bytes: buffer.byteLength,
      file_type: file.type || 'application/octet-stream',
      storage_engine: storageEngine,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 });
  }
}
