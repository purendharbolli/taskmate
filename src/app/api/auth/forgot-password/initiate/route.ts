import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseUserByEmail } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    let user = db.getUserByEmail(cleanEmail);
    if (!user) {
      try {
        const suUser = await getSupabaseUserByEmail(cleanEmail);
        if (suUser) user = db.upsertUser(suUser);
      } catch (suErr) {
        console.warn('[Forgot Password Initiate Supabase] Exception:', suErr);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No TaskMate account found for this email address. Please check your spelling or create an account.' },
        { status: 404 }
      );
    }

    if (!user.recovery_questions || user.recovery_questions.length === 0) {
      return NextResponse.json(
        {
          error:
            'No recovery questions have been configured for this account yet. Please log in directly or contact support.',
        },
        { status: 400 }
      );
    }

    // Return only the questions (NEVER the answers or answer hashes)
    const questions = user.recovery_questions.map((rq, idx) => ({
      index: idx,
      question: rq.question,
    }));

    return NextResponse.json({
      success: true,
      email: user.email,
      questions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
