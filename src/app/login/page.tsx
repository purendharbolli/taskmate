'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  UserPlus,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import clsx from 'clsx';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountExistsNotice, setAccountExistsNotice] = useState(false);
  const [existingUser, setExistingUser] = useState<any | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Check if a session is currently active
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setExistingUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'taskmate_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
    document.cookie = 'taskmate_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
    setExistingUser(null);
    setEmail('');
    setPassword('');
    setLoggingOut(false);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid college or personal email address.');
      return;
    }

    if (mode === 'login' && !password) {
      setError('Please enter your password to sign in.');
      return;
    }

    setLoading(true);
    setError(null);
    setAccountExistsNotice(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          email: cleanEmail,
          password: mode === 'login' ? password : undefined,
          name: mode === 'signup' ? name.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409 || data.accountExists) {
          // Account already exists on signup
          setAccountExistsNotice(true);
          setError('An account with this email already exists. Please log in with your password.');
          setMode('login');
        } else if (res.status === 404 || data.notFound) {
          setError('No TaskMate account found for this email. Switch to "Create Account" below.');
        } else if (data.invalidPassword) {
          setError('Incorrect password. Please try again or use "Forgot Password?" below.');
        } else {
          setError(data.error || 'Authentication failed. Please try again.');
        }
      } else {
        window.location.href = data.redirectTo || '/dashboard';
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
              CAMPUS ACCESS · HYPERLOCAL MARKETPLACE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack pt-1">
            {mode === 'login' ? 'Sign In to TaskMate' : 'Join TaskMate Campus'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70">
            {mode === 'login'
              ? 'Access your tasks, active orders, and campus earnings.'
              : 'Create your unique student profile to post or complete tasks.'}
          </p>
        </div>

        {/* Active Session Notice if already logged in */}
        {existingUser && (
          <div className="brutal-border bg-taskYellow/25 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="sticker-tag bg-taskYellow text-taskBlack px-2 py-0.5 text-[10px] font-black brutal-border">
                ACTIVE ACCOUNT DETECTED
              </span>
              <span className="text-[10px] font-bold text-black/60">Already signed in</span>
            </div>

            <div className="bg-white p-2.5 brutal-border space-y-0.5">
              <p className="text-xs font-black text-taskBlack uppercase">
                {existingUser.nickname || existingUser.name}
              </p>
              <p className="text-[11px] font-bold text-taskBlack/70 truncate">
                {existingUser.email}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <BrutalButton
                type="button"
                variant="yellow"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <span>DASHBOARD →</span>
              </BrutalButton>
              <BrutalButton
                type="button"
                variant="white"
                size="sm"
                disabled={loggingOut}
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span>{loggingOut ? 'SIGNING OUT...' : 'LOG OUT'}</span>
              </BrutalButton>
            </div>
            <p className="text-[10px] font-bold text-black/60 text-center">
              Click &quot;Log Out&quot; above to sign into or register a different student account.
            </p>
          </div>
        )}

        {/* Tab Toggle: Log In vs Create Account */}
        <div className="grid grid-cols-2 gap-2 brutal-border p-1 bg-taskOffWhite">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={clsx(
              'py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
              mode === 'login'
                ? 'bg-taskYellow brutal-border brutal-shadow-sm text-taskBlack'
                : 'text-taskBlack/60 hover:text-taskBlack'
            )}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={clsx(
              'py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5',
              mode === 'signup'
                ? 'bg-taskYellow brutal-border brutal-shadow-sm text-taskBlack'
                : 'text-taskBlack/60 hover:text-taskBlack'
            )}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {error && (
          <div
            className={clsx(
              'brutal-border p-3 text-xs font-black flex items-start gap-2.5',
              accountExistsNotice ? 'bg-taskYellow/40 text-taskBlack' : 'bg-taskPink/30 text-red-700'
            )}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-black uppercase text-taskBlack mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-xs sm:text-sm font-bold text-taskBlack"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase text-taskBlack mb-1">
              Email Address
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
                className="w-full brutal-input pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-bold text-taskBlack"
              />
            </div>
            {mode === 'signup' && (
              <p className="text-[11px] text-taskBlack/60 font-semibold mt-1">
                Only one TaskMate account is allowed per email address.
              </p>
            )}
          </div>

          {mode === 'login' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase text-taskBlack">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-black text-taskBlack hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black/50">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full brutal-input pl-10 pr-10 py-2.5 text-xs sm:text-sm font-bold text-taskBlack"
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
          )}

          <BrutalButton
            type="submit"
            variant="yellow"
            fullWidth
            size="lg"
            disabled={loading}
          >
            <span>
              {loading
                ? mode === 'login'
                  ? 'SIGNING IN...'
                  : 'CREATING ACCOUNT...'
                : mode === 'login'
                ? 'SIGN IN TO TASKMATE →'
                : 'CONTINUE TO ONBOARDING →'}
            </span>
          </BrutalButton>
        </form>

        {/* Trust & Ease Points */}
        <div className="bg-taskOffWhite brutal-border p-3.5 space-y-2 text-xs font-bold text-taskBlack/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0" />
            <span>Hyperlocal verified access for college students</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0" />
            <span>Setup Nickname, College &amp; Recovery in quick onboarding</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-taskBlue stroke-[3] shrink-0" />
            <span>Passkeys &amp; security answers are securely hashed</span>
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
