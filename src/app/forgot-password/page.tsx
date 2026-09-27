'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';

interface SecurityQuestionItem {
  index: number;
  question: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<SecurityQuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Submit email to fetch security questions
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to retrieve recovery questions.');
      } else {
        setQuestions(data.questions || []);
        // Initialize answer keys
        const initialAnswers: Record<string, string> = {};
        (data.questions || []).forEach((q: SecurityQuestionItem) => {
          initialAnswers[q.question] = '';
        });
        setAnswers(initialAnswers);
        setStep(2);
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit answers and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate answers
    for (const q of questions) {
      if (!answers[q.question] || !answers[q.question].trim()) {
        setError(`Please answer: "${q.question}"`);
        return;
      }
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    setLoading(true);

    try {
      const formattedAnswers = questions.map((q) => ({
        question: q.question,
        answer: answers[q.question].trim(),
      }));

      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          answers: formattedAnswers,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password. Please check your answers.');
      } else {
        setStep(3);
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-black uppercase text-taskBlack hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            <span>Back to Login</span>
          </Link>
          <span className="text-xs font-black uppercase tracking-wider text-black/60">
            {step === 1 && 'Step 1 of 2: Lookup'}
            {step === 2 && 'Step 2 of 2: Verification'}
            {step === 3 && 'Complete'}
          </span>
        </div>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-block mb-1">
            <span className="sticker-tag bg-taskYellow text-taskBlack px-2.5 py-0.5 text-xs font-black brutal-border">
              🔐 PASSWORD RECOVERY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Answer Security Questions'}
            {step === 3 && 'Password Reset Complete!'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70">
            {step === 1 && 'Enter your registered email address to verify your account.'}
            {step === 2 &&
              `Answer your configured security questions to authorize a password change for ${email}.`}
            {step === 3 && 'Your new password is now active and protected with secure hashing.'}
          </p>
        </div>

        {error && (
          <div className="brutal-border bg-taskPink/30 p-3.5 text-xs font-black text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleInitiate} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-taskBlack mb-1.5">
                TaskMate Account Email
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@college.edu.in or you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full brutal-input px-3.5 py-3 text-xs sm:text-sm font-bold text-taskBlack"
              />
              <p className="text-[11px] text-taskBlack/60 font-semibold mt-1.5">
                We will retrieve the recovery questions you set up during registration.
              </p>
            </div>

            <BrutalButton
              type="submit"
              variant="yellow"
              fullWidth
              size="lg"
              disabled={loading}
            >
              <span>{loading ? 'CHECKING EMAIL...' : 'VERIFY ACCOUNT →'}</span>
            </BrutalButton>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs font-bold text-taskBlack hover:underline uppercase"
              >
                Remember your password? Sign in here
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Questions & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="p-3.5 brutal-border bg-taskOffWhite space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-taskBlack">
                    <HelpCircle className="w-4 h-4 text-taskBlue shrink-0" />
                    <span>Question {idx + 1}: {q.question}</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your secret answer"
                    value={answers[q.question] || ''}
                    onChange={(e) =>
                      setAnswers({ ...answers, [q.question]: e.target.value })
                    }
                    className="w-full brutal-input px-3 py-2 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                  />
                </div>
              ))}
            </div>

            <div className="border-t-2 border-black/10 pt-4 space-y-3">
              <div className="text-xs font-black uppercase text-taskBlack">
                Set New Password
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-taskBlack/70 mb-1">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full brutal-input px-3 py-2.5 pr-10 text-xs sm:text-sm font-bold text-taskBlack"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-taskBlack/60 hover:text-taskBlack"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-taskBlack/70 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full brutal-input px-3 py-2.5 text-xs sm:text-sm font-bold text-taskBlack"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-black uppercase text-taskBlack underline hover:text-black/60 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <BrutalButton
                type="submit"
                variant="yellow"
                fullWidth
                size="lg"
                disabled={loading}
              >
                <span>{loading ? 'RESETTING PASSWORD...' : 'UPDATE PASSWORD & SIGN IN →'}</span>
              </BrutalButton>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-taskGreen brutal-border brutal-shadow mx-auto flex items-center justify-center text-3xl">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase text-taskBlack">
                Password Successfully Reset!
              </h3>
              <p className="text-xs sm:text-sm font-bold text-black/70 max-w-sm mx-auto">
                You can now log in to TaskMate using your registered email and your new password.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/login">
                <BrutalButton variant="yellow" size="lg" fullWidth>
                  <span>LOG IN NOW →</span>
                </BrutalButton>
              </Link>
            </div>
          </div>
        )}

        {/* Security Assurance */}
        <div className="bg-taskOffWhite brutal-border p-3 space-y-1 text-xs font-bold text-taskBlack/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0" />
            <span>Passwords &amp; recovery answers are encrypted using salted PBKDF2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
