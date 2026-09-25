'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'email',
          email: cleanEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectTo || '/dashboard');
      } else {
        setError(data.error || 'Authentication failed. Please try again.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
        {/* Brand Stamp */}
        <div className="text-center space-y-2">
          <div className="inline-block">
            <span className="sticker-tag bg-taskYellow text-taskBlack px-3 py-1 text-xs font-black brutal-border">
              CAMPUS ACCESS · DIRECT LOGIN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack pt-1">
            Welcome to TaskMate
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70">
            Your campus. Your tasks. Your side income.
          </p>
        </div>

        {error && (
          <div className="brutal-border bg-taskPink/30 p-3 text-xs font-black text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Authentication Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-taskBlack mb-1.5">
              Enter your college or personal email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/50">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@college.edu.in or you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full brutal-input pl-10 pr-3.5 py-3 text-xs sm:text-sm font-bold text-taskBlack"
              />
            </div>
            <p className="text-[11px] text-taskBlack/60 font-semibold mt-1.5">
              No password needed. We'll use this email for task updates and payouts.
            </p>
          </div>

          <BrutalButton
            type="submit"
            variant="yellow"
            fullWidth
            size="lg"
            disabled={loading}
          >
            <span>{loading ? 'SIGNING IN...' : 'CONTINUE WITH EMAIL →'}</span>
          </BrutalButton>
        </form>

        {/* Trust & Ease Points */}
        <div className="bg-taskOffWhite brutal-border p-3.5 space-y-2 text-xs font-bold text-taskBlack/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0" />
            <span>Instant access for all college students</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0" />
            <span>New users complete a quick 30-second campus setup</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-taskBlue stroke-[3] shrink-0" />
            <span>Protected by in-person 4-digit OTP handover</span>
          </div>
        </div>

        {/* Footer Academic Integrity Notice */}
        <div className="pt-2 border-t border-black/10 text-center space-y-1">
          <p className="text-[10px] text-taskBlack/50 font-semibold leading-relaxed">
            By continuing, you agree to TaskMate&apos;s campus honor code. Strictly legitimate assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
