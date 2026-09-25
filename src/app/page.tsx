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
  Clock,
  Sparkles,
  Check,
  AlignLeft,
  Search,
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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block">
              <span className="sticker-tag bg-white text-taskBlack px-3 py-1 text-xs font-black brutal-border">
                CAMPUS TASKS, MADE SIMPLE
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-taskBlack leading-[1.05]">
              Need something done on campus? <br />
              <span className="bg-taskYellow px-2 brutal-border inline-block mt-1">
                Someone nearby can help.
              </span>
            </h1>

            <p className="text-base sm:text-lg font-bold text-taskBlack/80 max-w-xl leading-relaxed">
              Post small tasks, find students around you, and get things done without leaving campus.
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
                  <span>FIND TASKS →</span>
                </BrutalButton>
              </Link>
            </div>

            <p className="text-xs font-bold text-black/60 pt-1">
              Built for students. Designed for campus life.
            </p>
          </div>

          {/* Right Column: Authentic Platform Overview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white brutal-border brutal-shadow-lg p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <span className="sticker-tag bg-taskYellow text-taskBlack text-xs font-black px-2.5 py-0.5 brutal-border">
                  STUDENTS HELPING STUDENTS
                </span>
                <span className="text-[11px] font-black text-taskGreen flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-taskGreen animate-pulse"></span>
                  HYPERLOCAL
                </span>
              </div>

              <div className="space-y-3">
                <div className="brutal-border bg-taskOffWhite p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-taskYellow brutal-border flex items-center justify-center font-black text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase text-taskBlack">Post Your Task</h4>
                    <p className="text-[11px] font-bold text-black/60 leading-snug">
                      Specify number of pages, subject, charts, PPT slides, or campus errand details.
                    </p>
                  </div>
                </div>

                <div className="brutal-border bg-taskOffWhite p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-taskBlue brutal-border flex items-center justify-center font-black text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase text-taskBlack">Connect With Peers Nearby</h4>
                    <p className="text-[11px] font-bold text-black/60 leading-snug">
                      Students in your college or campus area accept your task.
                    </p>
                  </div>
                </div>

                <div className="brutal-border bg-taskOffWhite p-3.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-taskPink brutal-border flex items-center justify-center font-black text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase text-taskBlack">Handover with 4-Digit OTP</h4>
                    <p className="text-[11px] font-bold text-black/60 leading-snug">
                      Meet at your library or canteen. Inspect the work, verify with a secret 4-digit code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-taskGreen/20 brutal-border p-3 flex items-center justify-between text-xs font-black text-taskBlack">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-green-700 stroke-[3]" />
                  <span>Strict Academic Honor Code</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-black/60">Legitimate Services</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (15 Legitimate Student Categories) */}
      <section className="bg-white border-y-[3px] border-black py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-block mb-1">
                <span className="sticker-tag bg-taskPink text-taskBlack px-2.5 py-0.5 text-xs font-black">
                  POPULAR ON CAMPUS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
                Legitimate Campus Services
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                Strictly legitimate assistance: handwriting, transcription, formatting, diagrams, and campus errands.
              </p>
            </div>

            <Link href="/tasks" className="text-xs font-black uppercase underline hover:text-blue-700 shrink-0">
              View all tasks →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.slice(0, 10).map((cat) => (
              <Link
                key={cat.id}
                href={`/tasks?category=${cat.id}`}
                className="brutal-border bg-taskOffWhite p-4 brutal-shadow-sm brutal-card-hover flex flex-col justify-between group transition-all"
              >
                <div>
                  <div
                    className="w-10 h-10 brutal-border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: cat.bgColor || '#FFD84D' }}
                  >
                    <BookOpen className="w-5 h-5 text-black stroke-[2.5]" />
                  </div>
                  <h3 className="font-black text-sm text-taskBlack uppercase leading-tight mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-taskBlack/70 font-bold line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase text-taskBlack/50 group-hover:text-black mt-3 block">
                  Find tasks →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (4 Clean Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="sticker-tag bg-taskBlue text-taskBlack px-3 py-1 text-xs font-black inline-block mb-2">
            SIMPLE & SECURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
            How TaskMate Works
          </h2>
          <p className="text-xs sm:text-sm font-bold text-black/70 mt-1">
            Peer-to-peer campus services with 4-digit handover verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="brutal-border bg-white p-5 brutal-shadow space-y-2">
            <span className="w-8 h-8 rounded-full bg-taskYellow brutal-border font-black text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="font-black text-base uppercase text-taskBlack">Post a Task</h3>
            <p className="text-xs font-bold text-black/70 leading-relaxed">
              Describe your task, specify number of pages or requirements, set your budget, and choose a campus deadline.
            </p>
          </div>

          <div className="brutal-border bg-white p-5 brutal-shadow space-y-2">
            <span className="w-8 h-8 rounded-full bg-taskBlue brutal-border font-black text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="font-black text-base uppercase text-taskBlack">Choose a Student</h3>
            <p className="text-xs font-bold text-black/70 leading-relaxed">
              Review proposals from verified students on your campus. Accept the best fit and secure task payment.
            </p>
          </div>

          <div className="brutal-border bg-white p-5 brutal-shadow space-y-2">
            <span className="w-8 h-8 rounded-full bg-taskPink brutal-border font-black text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="font-black text-base uppercase text-taskBlack">Campus Handover</h3>
            <p className="text-xs font-bold text-black/70 leading-relaxed">
              Meet at your campus library or canteen. Inspect the work, then share your secret 4-digit OTP code.
            </p>
          </div>

          <div className="brutal-border bg-white p-5 brutal-shadow space-y-2">
            <span className="w-8 h-8 rounded-full bg-taskGreen brutal-border font-black text-sm flex items-center justify-center">
              4
            </span>
            <h3 className="font-black text-base uppercase text-taskBlack">Instant Release</h3>
            <p className="text-xs font-bold text-black/70 leading-relaxed">
              Entering the OTP confirms successful physical handover and releases payment directly to the student earner.
            </p>
          </div>
        </div>
      </section>

      {/* Real Live Campus Tasks Feed */}
      <section className="bg-white border-y-[3px] border-black py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-taskGreen animate-pulse border border-black" />
                <span className="text-xs font-black uppercase tracking-wider text-taskGreen">
                  CAMPUS TASKS NEAR YOU
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
                Latest Available Tasks
              </h2>
            </div>

            <Link href="/tasks">
              <BrutalButton variant="yellow" size="sm">
                <span>VIEW ALL TASKS</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </BrutalButton>
            </Link>
          </div>

          {featuredTasks.length === 0 ? (
            <div className="brutal-border bg-taskOffWhite p-12 text-center space-y-3">
              <h3 className="text-lg font-black uppercase text-taskBlack">No tasks nearby yet</h3>
              <p className="text-xs font-bold text-black/60">
                Be the first to post a task on your campus.
              </p>
              <Link href="/tasks/create">
                <BrutalButton variant="yellow" size="md">
                  <span>POST THE FIRST TASK</span>
                </BrutalButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTasks.map((task, idx) => {
                const cat = categories.find((c) => c.id === task.category_id);
                const col = colleges.find((c) => c.id === task.college_id);
                const variants: ('yellow' | 'blue' | 'pink' | 'white')[] = ['white', 'yellow', 'white', 'blue', 'white', 'pink'];
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    categoryName={cat?.name}
                    collegeName={col?.short_name || 'Campus'}
                    variant={variants[idx % variants.length]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Academic Integrity & Safety Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AcademicIntegrityBanner />
      </section>
    </div>
  );
}
