'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying your Google session...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        // 1. Check if Supabase session is already established
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (sessionData?.session?.user) {
          await syncUserAndRedirect(sessionData.session.user);
          return;
        }

        // 2. If PKCE code param exists in URL
        const code = searchParams.get('code');
        if (code) {
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (exchangeData?.session?.user) {
            await syncUserAndRedirect(exchangeData.session.user);
            return;
          }
        }

        // 3. Fallback: listen for auth state change
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            authListener.subscription.unsubscribe();
            await syncUserAndRedirect(session.user);
          }
        });

        // Set a timeout in case no session is detected
        const timer = setTimeout(() => {
          if (!error) {
            setError('Could not establish session. Please try logging in again.');
          }
        }, 8000);

        return () => {
          clearTimeout(timer);
          authListener.subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err?.message || 'Failed to authenticate with Google.');
      }
    }

    async function syncUserAndRedirect(user: any) {
      setStatus('Setting up your campus profile...');
      const email = user.email || '';
      const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
      const avatar = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffd84d`;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          email,
          name,
          avatar,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(data.redirectTo || '/dashboard');
      } else {
        setError(data.error || 'Failed to initialize account.');
      }
    }

    handleAuth();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white brutal-border brutal-shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="bg-taskPink text-red-700 brutal-border p-3 font-black text-sm uppercase">
            Authentication Error
          </div>
          <p className="text-xs font-bold text-taskBlack/80">{error}</p>
          <a href="/login" className="brutal-btn bg-taskYellow text-taskBlack px-5 py-2.5 text-xs font-black uppercase inline-block">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white brutal-border brutal-shadow-lg p-8 max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-taskBlack" />
        </div>
        <h2 className="text-lg font-black uppercase text-taskBlack">{status}</h2>
        <p className="text-xs font-bold text-taskBlack/60">Please wait while we connect your campus credentials...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white brutal-border brutal-shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-taskBlack" />
          </div>
          <h2 className="text-lg font-black uppercase text-taskBlack">Connecting...</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
