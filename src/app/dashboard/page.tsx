'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  Star,
  PlusCircle,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { TaskCard } from '@/components/TaskCard';
import { User, Task, Order } from '@/lib/types';
import clsx from 'clsx';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'worker' | 'requester'>('worker');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session user
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          // Fetch my tasks posted
          fetch(`/api/tasks?requesterId=${data.user.id}`)
            .then((r) => r.json())
            .then((tData) => {
              if (tData.tasks) setMyTasks(tData.tasks);
            });
        }
      });

    // Fetch orders
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      });

    // Fetch recommended open tasks
    fetch('/api/tasks?status=OPEN')
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) setRecommendedTasks(data.tasks.slice(0, 3));
        setLoading(false);
      });
  }, []);

  const totalEarned = currentUser?.earnings_total || 2450;
  const availableBalance = currentUser?.earnings_available || 1820;
  const pendingEarnings = currentUser?.earnings_pending || 630;
  const totalSpent = currentUser?.spent_total || 2150;

  const activeWorkerJobs = orders.filter(
    (o) => o.worker_id === currentUser?.id && o.status !== 'PAYMENT_RELEASED' && o.status !== 'REFUNDED'
  );
  const activeRequesterOrders = orders.filter(
    (o) => o.requester_id === currentUser?.id && o.status !== 'PAYMENT_RELEASED' && o.status !== 'REFUNDED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Welcome & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrutalBadge variant="green" size="sm">
              CAMPUS DASHBOARD
            </BrutalBadge>
            <span className="text-xs font-mono font-bold text-black/60 uppercase">
              SNIST Campus
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
            Here&apos;s your campus activity, earnings, and active tasks.
          </p>
        </div>

        {/* View Switcher: Worker vs Requester */}
        <div className="flex items-center gap-2 bg-white brutal-border p-1.5 brutal-shadow-sm self-start md:self-auto">
          <button
            onClick={() => setViewMode('worker')}
            className={clsx(
              'px-4 py-2 text-xs font-black uppercase transition-all',
              viewMode === 'worker'
                ? 'bg-taskYellow brutal-border text-taskBlack shadow-none'
                : 'hover:bg-taskOffWhite text-black/70'
            )}
          >
            Worker View (Earn)
          </button>
          <button
            onClick={() => setViewMode('requester')}
            className={clsx(
              'px-4 py-2 text-xs font-black uppercase transition-all',
              viewMode === 'requester'
                ? 'bg-taskBlue brutal-border text-taskBlack shadow-none'
                : 'hover:bg-taskOffWhite text-black/70'
            )}
          >
            Requester View (Post)
          </button>
        </div>
      </div>

      {/* WORKER DASHBOARD VIEW */}
      {viewMode === 'worker' && (
        <div className="space-y-8">
          {/* Earnings Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total Earned */}
            <div className="bg-taskYellow brutal-border brutal-shadow-lg p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-taskBlack/70 tracking-wider">
                  Total Earned
                </span>
                <p className="text-4xl font-black text-taskBlack mt-1">
                  ₹{totalEarned}
                </p>
              </div>
              <div className="pt-4 border-t-2 border-black/20 text-[11px] font-black uppercase">
                {currentUser?.completed_tasks || 12} jobs completed
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-taskGreen/30 brutal-border brutal-shadow-lg p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-taskBlack/70 tracking-wider">
                  Available to Withdraw
                </span>
                <p className="text-4xl font-black text-taskBlack mt-1">
                  ₹{availableBalance}
                </p>
              </div>
              <div className="pt-4 border-t-2 border-black/20 text-[11px] font-black uppercase flex items-center justify-between">
                <span>Direct UPI Payout</span>
                <span className="bg-white px-2 py-0.5 brutal-border text-[10px]">READY</span>
              </div>
            </div>

            {/* Pending In Vault */}
            <div className="bg-taskPink/30 brutal-border brutal-shadow-lg p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-taskBlack/70 tracking-wider">
                  Pending in Escrow Vault
                </span>
                <p className="text-4xl font-black text-taskBlack mt-1">
                  ₹{pendingEarnings}
                </p>
              </div>
              <div className="pt-4 border-t-2 border-black/20 text-[11px] font-black uppercase">
                Released upon OTP handover
              </div>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="bg-white brutal-border brutal-shadow p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-black uppercase">
            <div className="p-2 border-r-2 border-black/10 last:border-none">
              <span className="text-2xl block text-taskBlack">
                {currentUser?.completed_tasks || 12}
              </span>
              <span className="text-black/60 text-[10px]">Jobs Completed</span>
            </div>
            <div className="p-2 border-r-2 border-black/10 last:border-none">
              <span className="text-2xl block text-taskBlack">18h</span>
              <span className="text-black/60 text-[10px]">Hours Worked</span>
            </div>
            <div className="p-2 border-r-2 border-black/10 last:border-none">
              <span className="text-2xl block text-taskBlack flex items-center justify-center gap-1">
                <span>{currentUser?.rating || 4.8}</span>
                <span className="text-base text-yellow-500">★</span>
              </span>
              <span className="text-black/60 text-[10px]">Peer Rating</span>
            </div>
            <div className="p-2">
              <span className="text-2xl block text-taskBlack">
                {currentUser?.completion_rate || 96}%
              </span>
              <span className="text-black/60 text-[10px]">Completion Rate</span>
            </div>
          </div>

          {/* My Active Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-taskBlack">
                My Active Jobs ({activeWorkerJobs.length})
              </h2>
              <Link href="/orders" className="text-xs font-black uppercase underline hover:text-blue-700">
                View All Orders →
              </Link>
            </div>

            {activeWorkerJobs.length === 0 ? (
              <div className="brutal-border bg-white p-8 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                <p className="font-black text-sm uppercase">No Active Jobs In Progress</p>
                <p className="text-xs font-bold text-black/60">
                  Apply for open tasks on campus below to start earning!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeWorkerJobs.map((job) => (
                  <div
                    key={job.id}
                    className="brutal-border bg-white p-4 brutal-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-black bg-taskBlack text-white px-2 py-0.5">
                          ORDER #{job.id}
                        </span>
                        <BrutalBadge variant="yellow" size="sm">
                          {job.status}
                        </BrutalBadge>
                      </div>
                      <h4 className="font-black text-base uppercase text-taskBlack">
                        {(job as any).task?.title || 'Campus Task'}
                      </h4>
                      <p className="text-xs font-bold text-black/60 mt-0.5">
                        Amount: ₹{job.amount} · Meeting: {(job as any).task?.location || 'Campus'}
                      </p>
                    </div>

                    <Link href={`/orders/${job.id}`}>
                      <BrutalButton variant="yellow" size="md">
                        <span>MANAGE / ENTER OTP →</span>
                      </BrutalButton>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Campus Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black uppercase text-taskBlack">
                Recommended Tasks Near You
              </h2>
              <Link href="/tasks" className="text-xs font-black uppercase underline hover:text-blue-700">
                Browse All ({recommendedTasks.length}+) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedTasks.map((t, i) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  categoryName="Academic Help"
                  collegeName="SNIST"
                  variant={i === 0 ? 'yellow' : i === 1 ? 'blue' : 'pink'}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REQUESTER DASHBOARD VIEW */}
      {viewMode === 'requester' && (
        <div className="space-y-8">
          {/* Requester Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-taskBlue/30 brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Tasks Posted
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                {myTasks.length || 8}
              </span>
              <span className="text-[10px] font-bold text-black/60 mt-1 block">
                By you on campus
              </span>
            </div>

            <div className="bg-taskYellow brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Active Orders
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                {activeRequesterOrders.length || 2}
              </span>
              <span className="text-[10px] font-bold text-black/60 mt-1 block">
                In progress / ready
              </span>
            </div>

            <div className="bg-taskGreen/30 brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Completed
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                5
              </span>
              <span className="text-[10px] font-bold text-black/60 mt-1 block">
                Delivered &amp; verified
              </span>
            </div>

            <div className="bg-white brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Total Spent
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                ₹{totalSpent}
              </span>
              <span className="text-[10px] font-bold text-black/60 mt-1 block">
                On student peer help
              </span>
            </div>
          </div>

          {/* Quick CTA: Post New Task */}
          <div className="p-6 bg-taskYellow brutal-border brutal-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black uppercase text-taskBlack">
                Need more work done on campus?
              </h3>
              <p className="text-xs font-bold text-taskBlack/80 mt-0.5">
                Post handwriting, record copying, print runs, or presentation design in 60 seconds.
              </p>
            </div>
            <Link href="/tasks/create">
              <BrutalButton variant="white" size="lg">
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                <span>POST A TASK NOW</span>
              </BrutalButton>
            </Link>
          </div>

          {/* My Posted Tasks List */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-taskBlack mb-4">
              My Tasks &amp; Applicants
            </h2>

            {myTasks.length === 0 ? (
              <div className="brutal-border bg-white p-8 text-center space-y-3">
                <Inbox className="w-8 h-8 text-black/60 mx-auto" />
                <p className="font-black text-sm uppercase">You haven&apos;t posted any tasks yet.</p>
                <Link href="/tasks/create">
                  <BrutalButton variant="yellow" size="sm">
                    <span>POST YOUR FIRST TASK</span>
                  </BrutalButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myTasks.map((t) => (
                  <div
                    key={t.id}
                    className="brutal-border bg-white p-4 brutal-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BrutalBadge variant="yellow" size="sm">
                          ₹{t.budget}
                        </BrutalBadge>
                        <BrutalBadge variant={t.status === 'OPEN' ? 'green' : 'pink'} size="sm">
                          {t.status}
                        </BrutalBadge>
                      </div>
                      <h4 className="font-black text-base uppercase text-taskBlack">
                        {t.title}
                      </h4>
                      <p className="text-xs font-bold text-black/60">
                        Deadline: {t.deadline} · Location: {t.location}
                      </p>
                    </div>

                    <Link href={`/tasks/${t.id}`}>
                      <BrutalButton variant="white" size="md">
                        <span>VIEW APPLICANTS →</span>
                      </BrutalButton>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
