import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  FileText,
  PieChart,
  Presentation,
  Palette,
  Printer,
  Scan,
  Database,
  Video,
  Camera,
  Package,
  Users,
  ShieldCheck,
  CheckCircle,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { TaskCard } from '@/components/TaskCard';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { db } from '@/lib/db';

export default function HomePage() {
  const allTasks = db.getTasks();
  const featuredTasks = allTasks.slice(0, 6);
  const categories = db.getCategories();
  const colleges = db.getColleges();

  const completedCount = 128 + allTasks.filter((t) => t.status === 'COMPLETED').length;
  const activeCampusesCount = colleges.filter((c) => c.active).length;

  return (
    <div className="w-full">
      {/* Clean Campus Announcement */}
      <div className="bg-taskYellow border-b-[3px] border-black py-2 px-4 text-center text-xs font-black uppercase tracking-wide">
        ⚡ Hyderabad Campus Pilot Live: SNIST · CBIT · VNR VJIET · GRIET · Vasavi
      </div>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block">
              <span className="sticker-tag bg-white text-taskBlack px-3 py-1 text-xs font-black">
                🎓 HYPERLOCAL STUDENT MARKETPLACE
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-taskBlack leading-[1.02]">
              Got a task? <br />
              <span className="bg-taskYellow px-2 brutal-border inline-block mt-1">
                Someone on campus
              </span>{' '}
              can do it.
            </h1>

            <p className="text-base sm:text-lg font-bold text-taskBlack/80 max-w-lg leading-relaxed">
              Post small legitimate tasks, connect with verified students on your campus, and earn money in your free time.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/tasks/create">
                <BrutalButton variant="yellow" size="lg" className="w-full sm:w-auto">
                  <span>POST A TASK</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </BrutalButton>
              </Link>

              <Link href="/tasks">
                <BrutalButton variant="white" size="lg" className="w-full sm:w-auto">
                  <span>FIND WORK →</span>
                </BrutalButton>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-black/60 pt-1">
              <MapPin className="w-3.5 h-3.5 text-black" />
              <span>Campus-first peer network · Verified student handovers</span>
            </div>
          </div>

          {/* Right: Clean Hero Task Card */}
          <div className="lg:col-span-5">
            <div className="bg-white brutal-border brutal-shadow-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <span className="sticker-tag bg-taskYellow px-2 py-0.5 text-[11px] font-black uppercase">
                  RECORD WRITING
                </span>
                <span className="text-2xl font-black bg-taskYellow px-2 py-0.5 brutal-border">
                  ₹350
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-taskBlack leading-tight">
                  Electronics Lab Record (35 Pages)
                </h3>
                <p className="text-xs font-semibold text-black/70 mt-1 line-clamp-2">
                  Neat handwriting copies of 555 timer &amp; Op-Amp experiments from provided reference sheets.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-black">
                <div className="p-2 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Quantity</span>
                  <span>35 pages</span>
                </div>
                <div className="p-2 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Deadline</span>
                  <span className="text-red-600">Tomorrow · 5 PM</span>
                </div>
                <div className="p-2 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Location</span>
                  <span className="truncate block">SNIST · Block C</span>
                </div>
                <div className="p-2 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Proximity</span>
                  <span className="text-blue-700">0.8 km away</span>
                </div>
              </div>

              <Link href="/tasks/tsk-1" className="block w-full pt-1">
                <BrutalButton variant="yellow" fullWidth size="md">
                  <span>VIEW TASK →</span>
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Bar */}
      <section className="border-y-[3px] border-black bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-taskBlack block">
                {completedCount}+
              </span>
              <span className="text-xs font-extrabold uppercase text-taskBlack/70 mt-0.5 block">
                Tasks Completed
              </span>
            </div>

            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-taskBlack block">
                ₹24K+
              </span>
              <span className="text-xs font-extrabold uppercase text-taskBlack/70 mt-0.5 block">
                Student Earnings
              </span>
            </div>

            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-taskBlack block">
                {activeCampusesCount}
              </span>
              <span className="text-xs font-extrabold uppercase text-taskBlack/70 mt-0.5 block">
                Active Campuses
              </span>
            </div>

            <div className="p-2">
              <span className="text-3xl sm:text-4xl font-black text-taskBlack flex items-center justify-center gap-1">
                <span>4.8</span>
                <span className="text-yellow-500 text-xl">★</span>
              </span>
              <span className="text-xs font-extrabold uppercase text-taskBlack/70 mt-0.5 block">
                Average Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Integrity Notice */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AcademicIntegrityBanner />
      </div>

      {/* 4-Step "How It Works" Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8">
          <span className="sticker-tag bg-taskBlue text-taskBlack px-2.5 py-0.5 text-xs font-black mb-1 inline-block">
            PROCESS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-taskBlack">
            How TaskMate Works
          </h2>
          <p className="text-xs sm:text-sm font-bold text-black/70 mt-0.5">
            4 simple steps to get things done or earn between classes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="brutal-border bg-taskYellow p-5 brutal-shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-3xl font-black block mb-2 font-mono">01</span>
              <h3 className="text-lg font-black uppercase mb-1">POST</h3>
              <p className="text-xs font-bold text-taskBlack/80 leading-relaxed">
                Tell us what you need. Set your budget, deadline, and upload reference files.
              </p>
            </div>
          </div>

          <div className="brutal-border bg-taskBlue p-5 brutal-shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-3xl font-black block mb-2 font-mono">02</span>
              <h3 className="text-lg font-black uppercase mb-1">MATCH</h3>
              <p className="text-xs font-bold text-taskBlack/80 leading-relaxed">
                Students on your campus apply. Review peer ratings, turnarounds, and choose a worker.
              </p>
            </div>
          </div>

          <div className="brutal-border bg-taskPink p-5 brutal-shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-3xl font-black block mb-2 font-mono">03</span>
              <h3 className="text-lg font-black uppercase mb-1">HANDOVER</h3>
              <p className="text-xs font-bold text-taskBlack/80 leading-relaxed">
                Meet safely on campus. Verify the delivered work with a private 4-digit handover OTP.
              </p>
            </div>
          </div>

          <div className="brutal-border bg-white p-5 brutal-shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-3xl font-black block mb-2 font-mono">04</span>
              <h3 className="text-lg font-black uppercase mb-1">EARN</h3>
              <p className="text-xs font-bold text-taskBlack/80 leading-relaxed">
                Payment is safely released after confirmation. Build your campus rating and repeat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Task Categories Grid */}
      <section className="bg-white border-y-[3px] border-black py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="sticker-tag bg-taskPink text-taskBlack px-2.5 py-0.5 text-xs font-black mb-1 inline-block">
                CATEGORIES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase text-taskBlack">
                Legitimate Task Services
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/70 mt-0.5">
                Explore popular student-to-student services across campuses.
              </p>
            </div>

            <Link href="/tasks">
              <BrutalButton variant="white" size="sm">
                <span>VIEW ALL TASKS →</span>
              </BrutalButton>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/tasks?categoryId=${cat.id}`}
                className="brutal-border p-3.5 bg-taskOffWhite hover:bg-taskYellow brutal-card-hover transition-all text-left"
              >
                <span className="font-mono text-xs font-black block mb-1 text-black/60 uppercase">
                  {cat.group.split(' ')[0]}
                </span>
                <h4 className="font-black text-sm uppercase text-taskBlack leading-tight">
                  {cat.name}
                </h4>
                <p className="text-[11px] font-semibold text-black/70 mt-1 line-clamp-1">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Campus Tasks */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
              <span className="text-xs font-black uppercase text-taskBlack">Live Feed</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-taskBlack">
              Open Tasks at SNIST &amp; Nearby
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70 mt-0.5">
              Available jobs waiting for student workers today.
            </p>
          </div>

          <Link href="/tasks">
            <BrutalButton variant="yellow" size="md">
              <span>EXPLORE ALL TASKS →</span>
            </BrutalButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredTasks.map((task, idx) => {
            const cardVariants: ('white' | 'yellow' | 'blue' | 'pink')[] = [
              'white',
              'yellow',
              'blue',
              'pink',
            ];
            const variant = cardVariants[idx % cardVariants.length];
            const cat = categories.find((c) => c.id === task.category_id);
            const col = colleges.find((c) => c.id === task.college_id);

            return (
              <TaskCard
                key={task.id}
                task={task}
                categoryName={cat?.name}
                collegeName={col?.short_name || 'SNIST'}
                variant={variant}
              />
            );
          })}
        </div>
      </section>

      {/* Trust & Safety Banner */}
      <section className="bg-taskBlack text-white py-12 border-t-[3px] border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="sticker-tag bg-taskYellow text-taskBlack px-2.5 py-0.5 text-xs font-black">
                CAMPUS SAFETY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskYellow">
                Trust is built right into the platform.
              </h2>
              <p className="text-xs sm:text-sm text-white/80 font-semibold leading-relaxed">
                Payments are secured in our campus vault until a secret 4-digit OTP is verified between students on campus. Peer ratings and institutional emails ensure safe transactions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/trust">
                <BrutalButton variant="yellow" size="md">
                  <span>READ TRUST POLICY →</span>
                </BrutalButton>
              </Link>
              <Link href="/login">
                <BrutalButton variant="white" size="md">
                  <span>JOIN YOUR CAMPUS</span>
                </BrutalButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-taskOffWhite border-t-[3px] border-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-black/70">
          <div className="flex items-center gap-2">
            <div className="bg-taskYellow brutal-border px-2 py-0.5 font-black text-sm">
              TASKMATE
            </div>
            <span>© 2026 TaskMate Technologies. Hyperlocal student marketplace.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 uppercase font-black">
            <Link href="/tasks" className="hover:underline">Tasks</Link>
            <Link href="/tasks/create" className="hover:underline">Post</Link>
            <Link href="/orders" className="hover:underline">Orders</Link>
            <Link href="/trust" className="hover:underline">Trust &amp; Safety</Link>
            <Link href="/admin" className="hover:underline text-purple-900">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
