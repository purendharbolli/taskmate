import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRecoveryAnswer, hashPassword } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, answers, new_password } = body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    if (!new_password || typeof new_password !== 'string' || new_password.length < 6) {
      return NextResponse.json(
        { error: 'Your new password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const user = db.getUserByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'No user account found for this email.' },
        { status: 404 }
      );
    }

    if (!user.recovery_questions || user.recovery_questions.length === 0) {
      return NextResponse.json(
        { error: 'No recovery questions configured for this account.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Please answer all security recovery questions.' },
        { status: 400 }
      );
    }

    // Verify all submitted answers against stored hashes
    for (const storedQ of user.recovery_questions) {
      const submitted = answers.find(
        (a: any) =>
          a.question &&
          a.question.trim().toLowerCase() === storedQ.question.trim().toLowerCase()
      );

      if (!submitted || !submitted.answer || !submitted.answer.trim()) {
        return NextResponse.json(
          { error: `Please provide an answer for: "${storedQ.question}"` },
          { status: 400 }
        );
      }

      const isMatch = verifyRecoveryAnswer(submitted.answer.trim(), storedQ.answer_hash);
      if (!isMatch) {
        return NextResponse.json(
          {
            error:
              'One or more recovery question answers are incorrect. Please verify your answers and try again.',
          },
          { status: 400 }
        );
      }
    }

    // Hash new password securely with unique PBKDF2 salt
    const newPasswordHash = hashPassword(new_password);

    db.updateUser(user.id, {
      password_hash: newPasswordHash,
    });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
