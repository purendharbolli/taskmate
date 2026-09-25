'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  Briefcase,
  AlertCircle,
  Inbox,
  User,
  Star,
  Search,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { TaskCard } from '@/components/TaskCard';
import { User as UserType, Task, Order, Application, College } from '@/lib/types';
import clsx from 'clsx';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    // 1. Fetch current session user
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);

          // Fetch user's college details
          if (data.user.college_id) {
            fetch(`/api/locations`)
              .then((r) => r.json())
              .then((locData) => {
                if (locData.colleges) {
                  const col = locData.colleges.find((c: College) => c.id === data.user.college_id);
                  if (col) setCollege(col);
                }
              });
          }

          // Fetch tasks posted by user
          fetch(`/api/tasks?requesterId=${data.user.id}`)
            .then((r) => r.json())
            .then((tData) => {
              if (tData.tasks) setMyTasks(tData.tasks);
            });
        }
      });

    // 2. Fetch orders
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      });

    // 3. Fetch recommended open tasks
    fetch('/api/tasks?status=OPEN')
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) setRecommendedTasks(data.tasks.slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalEarned = currentUser?.earnings_total || 0;
  const completedCount = currentUser?.completed_tasks || 0;
  const ratingValue = currentUser?.rating || 5.0;

  const activeTasks = myTasks.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Header & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-taskGreen border border-black animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-taskBlack/70">
              CAMPUS DASHBOARD
            </span>
            <span className="text-black/30">·</span>
            <span className="text-xs font-bold text-taskBlack flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-taskBlack" />
              <span>{college?.name || 'SNIST'} · Main Campus</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack">
            {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
            Manage your campus tasks, active applications, and student earnings.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/tasks/create">
            <BrutalButton variant="yellow" size="lg">
              <PlusCircle className="w-4 h-4 stroke-[3]" />
              <span>POST A TASK</span>
            </BrutalButton>
          </Link>

          <Link href="/tasks">
            <BrutalButton variant="white" size="lg">
              <Search className="w-4 h-4 stroke-[3]" />
              <span>FIND TASKS</span>
            </BrutalButton>
          </Link>
        </div>
      </div>

      {/* Real Worker Metrics (Strictly Real Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="brutal-border bg-white p-5 brutal-shadow-sm space-y-1">
          <span className="text-xs font-black uppercase text-taskBlack/60">Total Earned</span>
          <div className="text-3xl font-black text-taskGreen">₹{totalEarned}</div>
          <p className="text-[11px] font-bold text-black/50">
            {totalEarned === 0
              ? 'Your earnings will appear here after you complete your first task.'
              : 'Direct student payouts'}
          </p>
        </div>

        <div className="brutal-border bg-white p-5 brutal-shadow-sm space-y-1">
          <span className="text-xs font-black uppercase text-taskBlack/60">Jobs Completed</span>
          <div className="text-3xl font-black text-taskBlack">{completedCount}</div>
          <p className="text-[11px] font-bold text-black/50">
            {completedCount === 0 ? 'No completed tasks yet.' : 'Verified handovers on campus'}
          </p>
        </div>

        <div className="brutal-border bg-white p-5 brutal-shadow-sm space-y-1">
          <span className="text-xs font-black uppercase text-taskBlack/60">Student Rating</span>
          <div className="text-3xl font-black text-taskYellow flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-taskYellow stroke-black stroke-2" />
            <span className="text-taskBlack">{ratingValue.toFixed(1)}</span>
          </div>
          <p className="text-[11px] font-bold text-black/50">Based on verified reviews</p>
        </div>
      </div>

      {/* Section 1: Recommended Near You */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-taskBlack">
              Recommended Near You
            </h2>
            <p className="text-xs font-bold text-black/60">
              Tasks posted by students on your campus.
            </p>
          </div>

          <Link
            href="/tasks"
            className="text-xs font-black uppercase underline hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        {recommendedTasks.length === 0 ? (
          <div className="brutal-border bg-white p-8 text-center space-y-2">
            <p className="font-black uppercase text-sm">No tasks nearby yet</p>
            <p className="text-xs font-bold text-black/60">
              Be the first to post a task on your campus.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedTasks.map((task, idx) => {
              const variants: ('white' | 'yellow' | 'blue' | 'pink')[] = [
                'white',
                'yellow',
                'white',
              ];
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant={variants[idx % variants.length]}
                  collegeName={college?.short_name || 'SNIST'}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout: Your Active Tasks & Your Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Active Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase text-taskBlack">Your Active Tasks</h3>
            <span className="text-xs font-bold text-black/60">
              {activeTasks.length} posted
            </span>
          </div>

          {activeTasks.length === 0 ? (
            <div className="brutal-border bg-white p-8 text-center space-y-3">
              <Inbox className="w-8 h-8 mx-auto text-black/40 stroke-[2]" />
              <p className="font-black text-sm uppercase text-taskBlack">No active tasks</p>
              <p className="text-xs font-bold text-black/60 max-w-xs mx-auto">
                Need help with record writing, diagrams, or errands? Post a task to find peers.
              </p>
              <Link href="/tasks/create">
                <BrutalButton variant="yellow" size="sm">
                  <span>POST A TASK</span>
                </BrutalButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((t) => (
                <div
                  key={t.id}
                  className="brutal-border bg-white p-4 brutal-shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="truncate">
                    <span className="text-[10px] font-mono font-bold bg-taskYellow px-1.5 py-0.2 brutal-border uppercase">
                      {t.status}
                    </span>
                    <h4 className="font-black text-sm text-taskBlack truncate mt-1">{t.title}</h4>
                    <p className="text-xs font-bold text-black/60">Due {t.deadline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-base font-black text-taskBlack block">₹{t.budget}</span>
                    <Link
                      href={`/tasks/${t.id}`}
                      className="text-xs font-black uppercase underline hover:text-blue-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Applications & Active Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase text-taskBlack">Active Orders & Handover</h3>
            <Link
              href="/orders"
              className="text-xs font-black uppercase underline hover:text-blue-700"
            >
              All Orders ({orders.length})
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="brutal-border bg-white p-8 text-center space-y-3">
              <Briefcase className="w-8 h-8 mx-auto text-black/40 stroke-[2]" />
              <p className="font-black text-sm uppercase text-taskBlack">No active orders</p>
              <p className="text-xs font-bold text-black/60 max-w-xs mx-auto">
                Once an applicant is accepted, your order lifecycle and handover OTP will appear here.
              </p>
              <Link href="/tasks">
                <BrutalButton variant="white" size="sm">
                  <span>BROWSE TASKS</span>
                </BrutalButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <Link
                  key={ord.id}
                  href={`/orders/${ord.id}`}
                  className="brutal-border bg-white p-4 brutal-shadow-sm flex items-center justify-between gap-4 block hover:bg-taskOffWhite transition-all"
                >
                  <div className="truncate">
                    <span className="text-[10px] font-mono font-bold bg-taskBlue px-1.5 py-0.2 brutal-border uppercase">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                    <h4 className="font-black text-sm text-taskBlack truncate mt-1">
                      {(ord as any).task?.title || `Order #${ord.id}`}
                    </h4>
                    <p className="text-xs font-bold text-black/60">
                      Amount: ₹{ord.amount} · Campus Handover
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <BrutalButton variant="yellow" size="sm">
                      <span>OPEN →</span>
                    </BrutalButton>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4 pt-4 border-t-2 border-black/10">
        <h3 className="text-lg font-black uppercase text-taskBlack">Recent Activity</h3>
        {orders.length === 0 && myTasks.length === 0 ? (
          <div className="brutal-border bg-white p-8 text-center space-y-1">
            <p className="font-black uppercase text-sm text-taskBlack">No activity yet</p>
            <p className="text-xs font-bold text-black/60">
              Post a task or apply to one to get started.
            </p>
          </div>
        ) : (
          <div className="brutal-border bg-white p-4 space-y-3">
            {orders.slice(0, 4).map((o) => (
              <div key={o.id} className="flex items-center justify-between text-xs font-bold border-b border-black/10 pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-taskGreen" />
                  <span>Order #{o.id}: Status changed to {o.status.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-[10px] text-black/50">{new Date(o.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
