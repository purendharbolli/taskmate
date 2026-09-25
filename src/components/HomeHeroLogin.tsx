'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  LogOut,
  Key
} from 'lucide-react';
import { User as UserType } from '@/lib/types';

export const HomeHeroLogin: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check active session on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (targetEmail: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: name || targetEmail.split('@')[0],
          provider: targetEmail.includes('google') ? 'google' : 'email',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        router.push(data.redirectTo || '/dashboard');
      } else {
        setError(data.error || 'Failed to sign in');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    document.cookie = 'taskmate_user_id=; path=/; max-age=0';
    setCurrentUser(null);
    router.refresh();
  };

  return (
    <div className="bg-white brutal-border brutal-shadow-lg p-5 sm:p-6 space-y-5">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-taskGreen animate-pulse border border-black" />
          <span className="text-[11px] font-black uppercase tracking-wider text-taskBlack">
            CAMPUS ACCESS PORTAL
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-taskYellow px-2 py-0.5 brutal-border uppercase">
          SNIST · CBIT · VNR
        </span>
      </div>

      {currentUser ? (
        /* Logged In State */
        <div className="space-y-4">
          <div className="bg-taskYellow/20 brutal-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-taskBlack">
                Currently Signed In
              </span>
              <span className="bg-white brutal-border text-[10px] font-black px-2 py-0.5">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 brutal-border bg-taskYellow overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <h4 className="font-black text-sm text-taskBlack truncate">{currentUser.name}</h4>
                <p className="text-xs font-bold text-black/60 truncate">{currentUser.email}</p>
                <p className="text-[11px] font-black text-taskGreen mt-0.5">
                  ₹{currentUser.earnings_available} Balance Available
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard"
              className="brutal-btn bg-taskYellow text-taskBlack text-xs font-black uppercase py-2.5 px-3 text-center flex items-center justify-center gap-1 hover:bg-[#ffe066]"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
            <Link
              href="/orders"
              className="brutal-btn bg-white hover:bg-taskOffWhite text-taskBlack text-xs font-black uppercase py-2.5 px-3 text-center flex items-center justify-center gap-1"
            >
              <span>Orders & OTP</span>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/tasks/create"
              className="text-xs font-black uppercase text-taskBlack underline hover:text-blue-700"
            >
              + Post a New Task
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        /* Not Logged In State */
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-black uppercase text-taskBlack">
              Sign In to Your Campus
            </h3>
            <p className="text-xs font-bold text-black/60 mt-0.5">
              Access student tasks, escrow payments, and earn on campus.
            </p>
          </div>

          {error && (
            <div className="brutal-border bg-taskPink/30 p-2.5 text-xs font-black text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Quick Direct Email Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) handleLogin(email);
            }}
            className="space-y-2.5"
          >
            <div>
              <label className="block text-[11px] font-black uppercase mb-1">
                College or Student Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@sreenidhi.edu.in"
                required
                className="w-full brutal-input py-2 px-3 text-xs font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full brutal-btn bg-taskYellow text-taskBlack py-2.5 px-4 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-[#ffe066]"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>CONTINUE WITH EMAIL</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In */}
          <button
            onClick={() => handleLogin('student@campus.edu.in', 'Campus Student')}
            disabled={loading}
            className="w-full brutal-btn bg-white hover:bg-taskOffWhite py-2 px-3 flex items-center justify-center gap-2 text-xs font-black uppercase"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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

          {/* Quick Login Profiles / Testing Details */}
          <div className="pt-2 border-t-2 border-black/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-black/60 flex items-center gap-1">
                <Key className="w-3 h-3 text-taskBlack" />
                <span>Instant Login Profiles (1-Click Test)</span>
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Profile 1: Requester */}
              <button
                type="button"
                onClick={() => handleLogin('rohit.ece@sreenidhi.edu.in', 'Rohit Sharma')}
                className="w-full text-left p-2 brutal-border bg-taskYellow/10 hover:bg-taskYellow/30 transition-all flex items-center justify-between group"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-taskBlack">Rohit Sharma</span>
                    <span className="bg-taskYellow px-1.5 py-0.2 text-[9px] font-black brutal-border">
                      Requester
                    </span>
                  </div>
                  <p className="text-[10px] text-black/60 font-mono truncate">
                    rohit.ece@sreenidhi.edu.in
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Profile 2: Worker */}
              <button
                type="button"
                onClick={() => handleLogin('priya.cse@sreenidhi.edu.in', 'Priya Reddy')}
                className="w-full text-left p-2 brutal-border bg-taskPink/10 hover:bg-taskPink/30 transition-all flex items-center justify-between group"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-taskBlack">Priya Reddy</span>
                    <span className="bg-taskPink px-1.5 py-0.2 text-[9px] font-black brutal-border">
                      Top Earner · 4.9⭐
                    </span>
                  </div>
                  <p className="text-[10px] text-black/60 font-mono truncate">
                    priya.cse@sreenidhi.edu.in
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Profile 3: Campus Admin */}
              <button
                type="button"
                onClick={() => handleLogin('admin@taskmate.campus', 'Campus Admin')}
                className="w-full text-left p-2 brutal-border bg-taskBlue/10 hover:bg-taskBlue/30 transition-all flex items-center justify-between group"
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs text-taskBlack">Campus Admin</span>
                    <span className="bg-taskBlue px-1.5 py-0.2 text-[9px] font-black brutal-border">
                      Moderator / Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-black/60 font-mono truncate">
                    admin@taskmate.campus
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Micro-Footer */}
      <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-bold text-black/60">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-taskGreen stroke-[2.5]" />
          <span>4-Digit Handover OTP</span>
        </span>
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-black/70" />
          <span>Escrow Vault</span>
        </span>
      </div>
    </div>
  );
};
