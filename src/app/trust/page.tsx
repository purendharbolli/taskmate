import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Star,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';

export default function TrustPage() {
  const trustPillars = [
    {
      icon: ShieldCheck,
      badge: '01 IDENTITY',
      title: 'Institutional College Verification',
      desc: 'Students verify their profile using their official college email domain (e.g. @sreenidhi.edu.in, @cbit.ac.in). Unverified accounts carry clear badges so you always know who you are interacting with.',
      bg: 'bg-taskYellow',
    },
    {
      icon: Star,
      badge: '02 REPUTATION',
      title: 'Transparent Ratings & Task History',
      desc: 'Every completed order includes peer reviews and star ratings. Both requesters and workers build verifiable campus reputations over time.',
      bg: 'bg-taskBlue',
    },
    {
      icon: Lock,
      badge: '03 PAYMENT PROTECTION',
      title: 'TaskMate Vault Protection',
      desc: 'Payments remain safely locked in a pending vault state when work starts. Funds are only transferred after the physical handover is validated on campus.',
      bg: 'bg-taskPink',
    },
    {
      icon: KeyRound,
      badge: '04 HANDOVER VERIFICATION',
      title: 'Secret 4-Digit Handover OTP',
      desc: 'Requesters receive a private 4-digit code. Hand it over to the worker ONLY after inspecting physical notes, records, charts, or deliverables in person.',
      bg: 'bg-taskYellow',
    },
    {
      icon: AlertTriangle,
      badge: '05 DISPUTE RESOLUTION',
      title: 'Evidence-Based Dispute Resolution',
      desc: 'If work is missing pages, substandard, or not received, students can submit photo evidence within the 24-hour review window. Campus moderators investigate before releasing or refunding funds.',
      bg: 'bg-taskBlue',
    },
    {
      icon: Users,
      badge: '06 CAMPUS-FIRST',
      title: 'Hyperlocal Campus Communities',
      desc: 'We launch campus-by-campus. You interact with students from your own university or neighboring colleges in your city, eliminating long-distance courier friction and anonymous strangers.',
      bg: 'bg-taskPink',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-12">
      {/* Hero Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <BrutalBadge variant="green" size="md">
            TRUST &amp; SAFETY ARCHITECTURE
          </BrutalBadge>
          <span className="text-xs font-mono font-bold text-black/60 uppercase">
            Campus Standard v1.0
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-taskBlack leading-tight">
          Trust is part of the product.
        </h1>

        <p className="text-base sm:text-xl font-bold text-taskBlack/80 leading-relaxed">
          TaskMate was built from the ground up for students on university campuses. Here is how we ensure legitimate peer work, safe handovers, and reliable payments.
        </p>
      </div>

      {/* Prominent Academic Integrity Notice */}
      <div className="bg-taskYellow brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 stroke-[3] text-black" />
          <h2 className="text-xl sm:text-2xl font-black uppercase text-taskBlack">
            Campus Academic-Integrity Policy
          </h2>
        </div>

        <p className="text-xs sm:text-sm font-bold text-taskBlack/90 leading-relaxed">
          TaskMate is strictly designed for <strong>legitimate peer assistance</strong>: handwritten transcription/copying of provided material, record notebook writing where permitted by the institution, notes copying, diagrams and charts, presentation slide styling, printing, binding, scanning, data entry, campus errands, and event assistance.
        </p>

        <div className="p-3 bg-white brutal-border text-xs font-black text-taskBlack">
          ⚠️ <strong>Student Responsibility:</strong> Users are responsible for following their institution&apos;s academic-integrity rules. TaskMate is NOT intended for cheating, ghost-writing graded exams, or outsourced academic dishonesty. Flagged tasks will be immediately removed by campus moderators.
        </div>
      </div>

      {/* The 6 Trust Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trustPillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.badge}
              className={`brutal-border brutal-shadow p-6 ${pillar.bg}/25 hover:${pillar.bg}/40 transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 brutal-border bg-white flex items-center justify-center brutal-shadow-sm">
                    <Icon className="w-6 h-6 stroke-[2.5] text-taskBlack" />
                  </div>
                  <span className="text-xs font-mono font-black uppercase bg-taskBlack text-white px-2.5 py-1">
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black uppercase text-taskBlack mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-taskBlack/80 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t-2 border-black/10 flex items-center gap-1.5 text-xs font-black uppercase text-taskBlack/70">
                <CheckCircle className="w-4 h-4 text-green-700 stroke-[3]" />
                <span>Enforced on all campuses</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="brutal-border bg-taskBlack text-white p-8 sm:p-10 brutal-shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskYellow">
            Ready to join your campus marketplace?
          </h2>
          <p className="text-xs sm:text-sm font-bold text-white/80 mt-1 max-w-lg">
            Post your first task or start earning from your free time today.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/tasks">
            <BrutalButton variant="yellow" size="lg">
              <span>EXPLORE TASKS →</span>
            </BrutalButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
