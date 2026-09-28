import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  FileText,
  PieChart,
  Presentation,
  Palette,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  Sparkles,
  Check,
  Search,
  Lock,
  MessageSquare,
  Paperclip,
  ExternalLink,
  AlertTriangle,
  Building2,
  GraduationCap,
  PlusCircle,
  Layers,
  Video,
  Eye,
  HelpCircle,
  UploadCloud,
  FileUp,
  Scale,
  Flag,
  Share2,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { TaskCard } from '@/components/TaskCard';
import { VerifiedProfileBadge } from '@/components/VerifiedProfileBadge';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { db } from '@/lib/db';

export default function HomePage() {
  const allTasks = db.getTasks({ status: 'OPEN' });
  const featuredTasks = allTasks.slice(0, 6);
  const categories = db.getCategories();
  const colleges = db.getColleges();

  const supportedCategories = [
    {
      id: 'cat-notes',
      name: 'Writing',
      tag: 'HANDWRITING',
      icon: FileText,
      bgColor: '#FFD84D',
      desc: 'Handwritten lab record notebooks, lecture notes copying, and assignment transcription.',
      href: '/tasks?categoryId=cat-notes',
    },
    {
      id: 'cat-diagrams',
      name: 'Drawing',
      tag: 'GRAPHICS',
      icon: PieChart,
      bgColor: '#8DD8FF',
      desc: 'Engineering graphics sheets, circuit schematics, biology diagrams, and chart drafting.',
      href: '/tasks?categoryId=cat-diagrams',
    },
    {
      id: 'cat-poster',
      name: 'Design',
      tag: 'CREATIVE',
      icon: Palette,
      bgColor: '#FF8FB8',
      desc: 'College tech fest posters, club graphics, social media carousels, and event flyers.',
      href: '/tasks?categoryId=cat-poster',
    },
    {
      id: 'cat-ppt',
      name: 'PPT / Presentation',
      tag: 'SEMINAR',
      icon: Presentation,
      bgColor: '#FFD84D',
      desc: 'Seminar slide decks, tech-talk presentations, and professional PowerPoint formatting.',
      href: '/tasks?categoryId=cat-ppt',
    },
    {
      id: 'cat-resume',
      name: 'Resume / CV',
      tag: 'CAREER',
      icon: BookOpen,
      bgColor: '#8DD8FF',
      desc: 'ATS-optimized software resumes, single-page LaTeX templates, and placement CV styling.',
      href: '/tasks?categoryId=cat-resume',
    },
    {
      id: 'cat-other',
      name: 'Other Assistance',
      tag: 'CAMPUS',
      icon: HelpCircle,
      bgColor: '#FF8FB8',
      desc: 'Campus errands, queue assistance, print pickup, and peer-to-peer student services.',
      href: '/tasks?categoryId=cat-other',
    },
  ];

  return (
    <div className="w-full space-y-12 md:space-y-16 pb-16">
      {/* ========================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="sticker-tag bg-taskYellow text-taskBlack px-3 py-1 text-xs font-black brutal-border shadow-[2px_2px_0px_0px_#000]">
                📍 HYPERLOCAL STUDENT MARKETPLACE
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-taskBlack leading-[1.05]">
              Get small tasks done by students around you.
            </h1>

            <p className="text-base sm:text-lg font-bold text-taskBlack/80 max-w-xl leading-relaxed">
              TaskMate connects college students so you can post small academic and campus tasks, discover relevant work from your college, and connect directly with peers nearby.
            </p>

            {/* Clear Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/tasks/create">
                <BrutalButton variant="yellow" size="xl" className="w-full sm:w-auto">
                  <PlusCircle className="w-4 h-4 stroke-[3]" />
                  <span>POST A TASK</span>
                </BrutalButton>
              </Link>

              <Link href="/tasks">
                <BrutalButton variant="white" size="xl" className="w-full sm:w-auto">
                  <Search className="w-4 h-4 stroke-[3]" />
                  <span>FIND TASKS →</span>
                </BrutalButton>
              </Link>
            </div>

            {/* Key feature micro-tags */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-black text-taskBlack/70">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-taskGreen stroke-[3]" />
                <span>Your College Priority</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-taskGreen stroke-[3]" />
                <span>Private Task Chat</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-taskGreen stroke-[3]" />
                <span>50 MB Direct Uploads</span>
              </span>
            </div>
          </div>

          {/* Right Column: Live Feature Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white brutal-border brutal-shadow-lg p-6 space-y-4 relative">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                <span className="sticker-tag bg-taskYellow text-taskBlack text-xs font-black px-2.5 py-0.5 brutal-border">
                  TASKMATE WORKFLOW
                </span>
                <span className="text-[11px] font-black text-taskGreen flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-taskGreen animate-pulse"></span>
                  LIVE ON CAMPUS
                </span>
              </div>

              {/* Sample Task Card Preview */}
              <div className="brutal-border bg-[#FFFEEA]/70 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 bg-[#FFD84D] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-[1.5px_1.5px_0px_0px_#000]">
                    <Sparkles className="w-3 h-3 fill-black text-black" />
                    FROM YOUR COLLEGE
                  </span>
                  <span className="border border-black px-2 py-0.5 text-[10px] font-black uppercase bg-[#4DE680]">
                    OPEN
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm uppercase text-taskBlack line-clamp-1">
                    Data Structures Lab Record (25 Pages)
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-black/60 mt-0.5">
                    <span>Due: Tomorrow 5 PM</span>
                    <span>·</span>
                    <span className="text-taskBlack font-black">₹450</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/10 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-black/70">Posted by @CampusStudent</span>
                    <VerifiedProfileBadge isVerified={true} size="xs" />
                  </div>
                  <span className="bg-taskBlue/30 px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                    50 MB BRIEF
                  </span>
                </div>
              </div>

              {/* Hyperlocal Guarantee Highlight */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
                <div className="p-2.5 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 uppercase block font-semibold">
                    Discovery
                  </span>
                  <span>Campus-Ranked</span>
                </div>
                <div className="p-2.5 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 uppercase block font-semibold">
                    Messaging
                  </span>
                  <span>Private Chat</span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] brutal-border p-3 flex items-center justify-between text-xs font-bold text-taskBlack">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-taskBlack stroke-[2.5]" />
                  <span>Verify Work Before Payment</span>
                </div>
                <span className="text-[10px] uppercase font-mono text-black/60">Peer Safety</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. HOW IT WORKS (5 CLEAR STEPS) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="sticker-tag bg-taskBlue text-taskBlack px-3 py-1 text-xs font-black inline-block">
              SIMPLE & TRANSPARENT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
              How TaskMate Works
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              A peer-to-peer campus task flow designed for clarity, safety, and accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="brutal-border bg-taskOffWhite p-4 space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-taskYellow brutal-border font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-black text-sm uppercase text-taskBlack">Post a Task</h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Describe your requirements, volume (pages/slides), budget, and campus deadline. Attach reference files up to 50 MB.
              </p>
            </div>

            {/* Step 2 */}
            <div className="brutal-border bg-taskOffWhite p-4 space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-taskBlue brutal-border font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-black text-sm uppercase text-taskBlack">Find a Taskmate</h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Receive proposals from students in your college or nearby campuses. Review profile ratings and accept the right match.
              </p>
            </div>

            {/* Step 3 */}
            <div className="brutal-border bg-taskOffWhite p-4 space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-taskPink brutal-border font-black text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-black text-sm uppercase text-taskBlack">Chat & Share Work</h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Coordinate directly in private task chat. Exchange progress drafts, questions, and reference files securely.
              </p>
            </div>

            {/* Step 4 */}
            <div className="brutal-border bg-taskOffWhite p-4 space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-taskYellow brutal-border font-black text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="font-black text-sm uppercase text-taskBlack">Verify the Work</h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Inspect the completed work yourself. Prefer live or video proof to confirm handwriting or slides before paying.
              </p>
            </div>

            {/* Step 5 */}
            <div className="brutal-border bg-taskOffWhite p-4 space-y-2 relative">
              <span className="w-7 h-7 rounded-full bg-taskGreen brutal-border font-black text-xs flex items-center justify-center">
                5
              </span>
              <h3 className="font-black text-sm uppercase text-taskBlack">Complete Payment</h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Once satisfied with the completed work, finalize payment directly with your student taskmate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. TASK CATEGORIES */}
      {/* ========================================================= */}
      <section className="bg-white border-y-[3px] border-black py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="sticker-tag bg-taskPink text-taskBlack px-2.5 py-0.5 text-xs font-black inline-block mb-1">
                SUPPORTED SERVICES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
                Task Categories
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                Explore supported task categories tailored for student requirements.
              </p>
            </div>

            <Link href="/tasks" className="text-xs font-black uppercase underline hover:text-blue-700 shrink-0">
              Browse all categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {supportedCategories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="brutal-border bg-taskOffWhite p-5 brutal-shadow-sm brutal-card-hover flex flex-col justify-between group transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 brutal-border flex items-center justify-center group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: cat.bgColor }}
                      >
                        <IconComp className="w-6 h-6 text-black stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-black uppercase bg-white border border-black px-2 py-0.5">
                        {cat.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-base sm:text-lg text-taskBlack uppercase leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-taskBlack/75 font-bold leading-relaxed mt-1">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black uppercase text-taskBlack flex items-center gap-1 group-hover:underline mt-4 pt-3 border-t border-black/10">
                    <span>Explore {cat.name} Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHY TASKMATE (ACTUAL ADVANTAGES) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="sticker-tag bg-taskYellow text-taskBlack px-3 py-1 text-xs font-black inline-block">
              PLATFORM ADVANTAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
              Why Students Choose TaskMate
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              Built specifically for college campuses with safety, proximity, and convenience at the core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="brutal-border bg-white p-6 brutal-shadow space-y-3">
              <div className="w-10 h-10 bg-taskYellow brutal-border flex items-center justify-center">
                <GraduationCap className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                College-Focused Task Discovery
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                TaskMate automatically prioritizes tasks from your own campus first, making meetups and handovers quick and accessible between classes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="brutal-border bg-white p-6 brutal-shadow space-y-3">
              <div className="w-10 h-10 bg-taskBlue brutal-border flex items-center justify-center">
                <MapPin className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Hyperlocal Campus Connections
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Connect directly with students in your immediate department, academic blocks, or neighboring campus areas without dealing with remote strangers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="brutal-border bg-white p-6 brutal-shadow space-y-3">
              <div className="w-10 h-10 bg-taskPink brutal-border flex items-center justify-center">
                <MessageSquare className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Task-Based Private Chat
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Conversations are created automatically when a task is accepted and are strictly restricted to the task giver and the accepted taskmate.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="brutal-border bg-white p-6 brutal-shadow space-y-3">
              <div className="w-10 h-10 bg-taskGreen brutal-border flex items-center justify-center">
                <FileUp className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Direct 50 MB File Sharing
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Upload PDFs, scans, photos, and slides up to 50 MB with progress tracking, plus seamless Google Drive links for larger reference archives.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="brutal-border bg-white p-6 brutal-shadow space-y-3">
              <div className="w-10 h-10 bg-taskYellow brutal-border flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Verified Profile Review System
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Students can submit their College ID card for administrative review to earn an official &quot;Verified Profile&quot; badge on their profile.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="brutal-border bg-white p-6 brutal-shadow space-y-3">
              <div className="w-10 h-10 bg-taskBlue brutal-border flex items-center justify-center">
                <Flag className="w-5 h-5 stroke-[2.5] text-black" />
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Reporting &amp; Admin Moderation
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Authorized administrators monitor reports, investigate disputes, and moderate suspicious accounts to uphold community standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. VERIFIED PROFILE SECTION */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
            <div className="space-y-1">
              <span className="sticker-tag bg-taskBlue text-taskBlack px-2.5 py-0.5 text-xs font-black inline-block">
                PROFILE AUTHENTICITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
                What Does a &quot;Verified Profile&quot; Mean?
              </h2>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <VerifiedProfileBadge isVerified={true} size="md" interactive={true} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3 text-xs sm:text-sm font-bold text-taskBlack/85 leading-relaxed">
              <p>
                Some students on TaskMate display an official <strong>&quot;Verified Profile&quot;</strong> badge. This badge indicates that TaskMate administrators have reviewed the user&apos;s submitted verification details, such as their College ID card or institutional information.
              </p>
              
              {/* Mandatory Clarification Box */}
              <div className="p-4 bg-white brutal-border border-black space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-black uppercase">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Important Verification Notice:</span>
                </div>
                <p className="font-bold text-taskBlack leading-relaxed">
                  <strong>Verified Profile means TaskMate has reviewed the information submitted by this user. It does not guarantee future transactions or behavior.</strong>
                </p>
                <p className="text-[11px] font-medium text-black/70 leading-normal">
                  The badge does not guarantee a user&apos;s honesty, ensure that a user can never scam someone, or guarantee the quality of completed work. All users must verify deliverables independently before paying.
                </p>
              </div>
            </div>

            <div className="md:col-span-4 bg-white brutal-border p-4 space-y-2 text-xs">
              <h4 className="font-black uppercase text-taskBlack">Verification Privacy</h4>
              <ul className="space-y-1.5 font-bold text-black/70 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0 mt-0.5" />
                  <span>College IDs are kept private and never shown publicly.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0 mt-0.5" />
                  <span>Reviewed solely by authorized platform administrators.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-taskGreen stroke-[3] shrink-0 mt-0.5" />
                  <span>Students can request verification directly from their profile.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. SAFETY GUIDANCE SECTION */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50 brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-amber-200 brutal-border flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-900 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                SAFETY GUIDANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Stay Safe on TaskMate
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-taskBlack/85 leading-relaxed max-w-3xl">
            TaskMate provides a platform to connect campus peers, but users are responsible for verifying completed work before payment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white brutal-border p-4 space-y-2">
              <h3 className="font-black text-xs uppercase text-taskBlack flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-taskGreen shrink-0 stroke-[2.5]" />
                <span>Verify Before Payment</span>
              </h3>
              <p className="text-[11px] font-bold text-black/70 leading-relaxed">
                Before making payment, always verify the completed work and task proof yourself. Confirm that notes, diagrams, or slides match your instructions.
              </p>
            </div>

            <div className="bg-white brutal-border p-4 space-y-2">
              <h3 className="font-black text-xs uppercase text-taskBlack flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-700 shrink-0 stroke-[2.5]" />
                <span>Prefer Video/Live Proof</span>
              </h3>
              <p className="text-[11px] font-bold text-black/70 leading-relaxed">
                Prefer genuine video proof or live verification of completed work rather than relying only on screenshots or images, which can potentially be edited or AI-generated.
              </p>
            </div>

            <div className="bg-white brutal-border p-4 space-y-2">
              <h3 className="font-black text-xs uppercase text-taskBlack flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-taskBlack shrink-0 stroke-[2.5]" />
                <span>Meet in Safe Campus Spots</span>
              </h3>
              <p className="text-[11px] font-bold text-black/70 leading-relaxed">
                If you and your TaskMate are from the same college, consider meeting in person in a safe, public place (e.g. campus library or cafeteria) before payment.
              </p>
            </div>

            <div className="bg-white brutal-border p-4 space-y-2">
              <h3 className="font-black text-xs uppercase text-taskBlack flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 stroke-[2.5]" />
                <span>No Platform Guarantee</span>
              </h3>
              <p className="text-[11px] font-bold text-black/70 leading-relaxed">
                TaskMate provides a platform to connect users but cannot guarantee that every user or transaction is legitimate. Stay cautious and report suspicious behavior.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. COLLEGE PRIORITY & DISCOVERY */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="sticker-tag bg-taskYellow text-taskBlack px-3 py-1 text-xs font-black inline-block">
              SMART CAMPUS RANKING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
              College Priority Discovery
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70">
              Tasks from your own campus receive highest priority, while still keeping nearby institutions accessible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Tier 1 */}
            <div className="brutal-border bg-[#FFFEEA] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#FFD84D] brutal-border font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                  HIGHEST PRIORITY
                </span>
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                From Your College
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Tasks posted by students in your own institution are automatically prioritized at the top of your feed with prominent gold badges.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="brutal-border bg-[#F0F8FF] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#8DD8FF] brutal-border font-black text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-400 px-2 py-0.5">
                  CAMPUS CLUSTER
                </span>
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Nearby Campuses
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Tasks from colleges within your city and nearby academic zones, giving you convenient cross-campus assistance options.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="brutal-border bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-taskPink brutal-border font-black text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-[10px] font-black uppercase bg-gray-100 text-black/70 border border-black/20 px-2 py-0.5">
                  NEVER HIDDEN
                </span>
              </div>
              <h3 className="font-black text-base uppercase text-taskBlack">
                Other Colleges
              </h3>
              <p className="text-xs font-bold text-black/70 leading-relaxed">
                Tasks from other universities remain visible and filterable so you can explore campus opportunities anywhere across the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FILE SHARING SECTION */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="sticker-tag bg-taskGreen text-taskBlack px-2.5 py-0.5 text-xs font-black inline-block">
                FILE ATTACHMENTS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
                Direct File Sharing up to 50 MB
              </h2>
              <p className="text-xs sm:text-sm font-bold text-taskBlack/80 leading-relaxed">
                TaskMate supports direct uploads of reference PDFs, images, documents, and slide presentations up to 50 MB directly in task creation and private task chat.
              </p>

              <div className="space-y-2.5 text-xs font-bold text-black/75 pt-1">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-taskGreen stroke-[3] shrink-0 mt-0.5" />
                  <span>Real-time file size validation and progress tracking during upload.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-taskGreen stroke-[3] shrink-0 mt-0.5" />
                  <span>Dedicated Google Drive link sharing field recommended for files over 50 MB.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-taskGreen stroke-[3] shrink-0 mt-0.5" />
                  <span>Security protection against invalid or unsafe executable files (.exe, .bat).</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-taskOffWhite brutal-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-taskYellow brutal-border flex items-center justify-center font-black">
                  <Paperclip className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase text-taskBlack">Direct &amp; Drive Ready</h4>
                  <p className="text-[11px] font-bold text-black/60">Built for student assignments</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white brutal-border flex items-center justify-between">
                  <span className="font-bold">Under 50 MB:</span>
                  <span className="font-black text-green-700 bg-green-50 px-2 py-0.5 border border-green-300">
                    Direct Upload
                  </span>
                </div>
                <div className="p-3 bg-white brutal-border flex items-center justify-between">
                  <span className="font-bold">Over 50 MB:</span>
                  <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-300">
                    Google Drive Link
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. LIVE CAMPUS TASKS FEED */}
      {/* ========================================================= */}
      <section className="bg-white border-y-[3px] border-black py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-taskGreen animate-pulse border border-black" />
                <span className="text-xs font-black uppercase tracking-wider text-taskGreen">
                  CAMPUS MARKETPLACE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-taskBlack">
                Available Campus Tasks
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-0.5">
                Explore real tasks posted by students open for assistance right now.
              </p>
            </div>

            <Link href="/tasks">
              <BrutalButton variant="yellow" size="sm">
                <span>BROWSE ALL TASKS</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </BrutalButton>
            </Link>
          </div>

          {featuredTasks.length === 0 ? (
            <div className="brutal-border bg-taskOffWhite p-12 text-center space-y-3">
              <h3 className="text-lg font-black uppercase text-taskBlack">No open tasks yet</h3>
              <p className="text-xs font-bold text-black/60">
                Be the first to post a task and connect with peers.
              </p>
              <Link href="/tasks/create">
                <BrutalButton variant="yellow" size="md">
                  <span>POST A TASK</span>
                </BrutalButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTasks.map((task, idx) => {
                const cat = categories.find((c) => c.id === task.category_id);
                const col = colleges.find((c) => c.id === task.college_id);
                const variants: ('yellow' | 'blue' | 'pink' | 'white')[] = [
                  'white',
                  'yellow',
                  'white',
                  'blue',
                  'white',
                  'pink',
                ];
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

      {/* ========================================================= */}
      {/* 10. FINAL CALL TO ACTION */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-taskYellow brutal-border brutal-shadow-lg p-8 sm:p-14 text-center space-y-6">
          <div className="inline-block">
            <span className="sticker-tag bg-white text-taskBlack px-3 py-1 text-xs font-black brutal-border shadow-[2px_2px_0px_0px_#000]">
              START CONNECTING TODAY
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack max-w-2xl mx-auto leading-tight">
            Ready to get small tasks done on campus?
          </h2>

          <p className="text-xs sm:text-base font-bold text-taskBlack/85 max-w-xl mx-auto leading-relaxed">
            Post your requirements in minutes or browse available tasks from students across your college and city.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/tasks/create" className="w-full sm:w-auto">
              <BrutalButton variant="white" size="xl" className="w-full">
                <PlusCircle className="w-4 h-4 stroke-[3]" />
                <span>POST A TASK</span>
              </BrutalButton>
            </Link>

            <Link href="/tasks" className="w-full sm:w-auto">
              <BrutalButton variant="yellow" size="xl" className="w-full bg-black text-white hover:bg-neutral-800">
                <Search className="w-4 h-4 stroke-[3]" />
                <span>EXPLORE AVAILABLE TASKS</span>
              </BrutalButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Academic Honor Code Notice Footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AcademicIntegrityBanner />
      </section>
    </div>
  );
}
