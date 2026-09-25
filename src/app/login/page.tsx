'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
        },
      });

      if (oauthError) {
        if (
          oauthError.message.includes('not enabled') ||
          oauthError.message.includes('Unsupported provider') ||
          (oauthError as any).code === 'validation_failed'
        ) {
          setError(
            'Google Sign-In is not enabled in your Supabase project yet. In your Supabase Dashboard, go to Authentication > Providers > Google and enable it. In the meantime, enter your email below to log in directly!'
          );
        } else {
          setError(oauthError.message);
        }
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err?.message || 'Could not connect to Google authentication.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
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
          email: email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirectTo || '/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Network failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
        {/* Brand Stamp */}
        <div className="text-center space-y-2">
          <div className="bg-taskYellow brutal-border px-3 py-1 font-black text-xl brutal-shadow-sm inline-block mx-auto mb-2">
            TASKMATE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
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

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full brutal-btn bg-white hover:bg-taskOffWhite py-3 px-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-black uppercase transition-all"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-black/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black">
            <span className="bg-white px-3 text-taskBlack/50">OR</span>
          </div>
        </div>

        {/* Email Authentication Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-taskBlack mb-1.5">
              Campus or Personal Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@college.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-xs sm:text-sm font-bold text-taskBlack"
              />
            </div>
          </div>

          <BrutalButton
            type="submit"
            variant="yellow"
            fullWidth
            size="lg"
            disabled={loading}
          >
            <span>{loading ? 'AUTHENTICATING...' : 'CONTINUE WITH EMAIL →'}</span>
          </BrutalButton>
        </form>

        <p className="text-[11px] text-taskBlack/60 font-bold text-center">
          First time? Your student profile will be set up automatically.
        </p>

        {/* Footer Integrity Notice */}
        <div className="pt-3 border-t border-black/10 text-center space-y-1">
          <p className="text-[10px] text-taskBlack/50 font-semibold leading-relaxed">
            By continuing, you agree to TaskMate&apos;s campus guidelines. Strictly for legitimate student assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
