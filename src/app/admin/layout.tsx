import React from 'react';
import Link from 'next/link';
import { getCurrentUser, canAccessAdmin } from '@/lib/auth';
import { ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';

export const metadata = {
  title: 'TaskMate Admin Control Center',
  description: 'Moderation, User & Task Management',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAuthorized = user && canAccessAdmin(user);

  if (!isAuthorized || !user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#FFFDF5]">
        <div className="max-w-md w-full bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500 brutal-border mx-auto flex items-center justify-center text-white brutal-shadow">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="bg-taskBlack text-white text-[10px] font-mono px-2 py-0.5 font-black uppercase">
              HTTP 403 · FORBIDDEN
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
              Admin Access Restricted
            </h1>
            <p className="text-xs font-bold text-taskBlack/70 leading-relaxed">
              The TaskMate Moderation Dashboard is strictly restricted to verified administrators and campus moderators. Normal student accounts cannot view or manipulate administrative routes.
            </p>
          </div>

          <div className="p-3.5 bg-taskOffWhite brutal-border text-left space-y-1 text-xs font-bold">
            <div className="text-[10px] uppercase text-black/50 font-black">Authentication Status:</div>
            <div>
              User:{' '}
              <span className="font-mono text-taskBlack font-black">
                {user ? user.email : 'Anonymous / Not Logged In'}
              </span>
            </div>
            <div>
              Assigned Role:{' '}
              <span className="font-mono font-black text-red-600">
                {user ? user.role : 'NONE'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {user ? (
              <Link href="/dashboard" className="w-full">
                <BrutalButton variant="yellow" className="w-full flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>RETURN TO STUDENT DASHBOARD</span>
                </BrutalButton>
              </Link>
            ) : (
              <Link href="/login?redirect=/admin" className="w-full">
                <BrutalButton variant="yellow" className="w-full flex items-center justify-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>LOG IN AS ADMINISTRATOR</span>
                </BrutalButton>
              </Link>
            )}

            <Link href="/tasks" className="text-xs font-black uppercase underline hover:text-black/60 pt-1">
              Browse Campus Tasks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* Top Admin Clearance Bar */}
      <div className="bg-taskBlack text-white px-4 sm:px-6 py-2 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono uppercase font-black tracking-wider text-[11px]">
            TaskMate Moderation Console
          </span>
          <span className="bg-taskYellow text-taskBlack text-[10px] font-black uppercase px-2 py-0.5">
            {user.role}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Admin: {user.name} ({user.email})</span>
          <Link
            href="/dashboard"
            className="text-taskYellow hover:underline font-black text-[10px] uppercase"
          >
            ← Exit to App
          </Link>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
