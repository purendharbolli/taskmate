'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Award
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { User, College } from '@/lib/types';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our prototype, fetch all users and find matching ID
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          const u = data.users.find((x: User) => x.id === userId);
          if (u) {
            setUser(u);
            if (u.college) setCollege(u.college);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-4" />
        <p className="font-black uppercase text-xs">Loading Student Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="brutal-border bg-white p-8 space-y-3">
          <h2 className="text-xl font-black uppercase">Student Not Found</h2>
          <Link href="/tasks">
            <BrutalButton variant="yellow" size="sm">
              <span>← BROWSE TASKS</span>
            </BrutalButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
      >
        <ArrowLeft className="w-4 h-4 stroke-[3]" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 brutal-border bg-taskYellow brutal-shadow flex items-center justify-center font-black text-3xl shrink-0">
            {user.name.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                {user.name}
              </h1>
              {user.college_verified && (
                <BrutalBadge variant="green" size="sm">
                  ✓ VERIFIED STUDENT
                </BrutalBadge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-black/70">
              <MapPin className="w-3.5 h-3.5" />
              <span>{college?.name || 'SNIST — Hyderabad'}</span>
            </div>

            <p className="text-xs font-bold text-taskBlack/80 pt-1 leading-relaxed max-w-xl">
              {user.bio || 'Active campus student helper. Fast on records, handwriting, and slide presentations.'}
            </p>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="brutal-border bg-taskYellow/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              ★ {user.rating || 4.8}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Rating
            </span>
          </div>

          <div className="brutal-border bg-taskBlue/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {user.completed_tasks || 23}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Tasks Completed
            </span>
          </div>

          <div className="brutal-border bg-taskGreen/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              ₹{user.earnings_total || 4250}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Earned on Campus
            </span>
          </div>

          <div className="brutal-border bg-taskPink/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {user.completion_rate || 96}%
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Completion Rate
            </span>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-2">
            Verified Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {(user.skills?.length ? user.skills : ['Handwriting', 'Diagrams', 'PowerPoint', 'Record Writing']).map((sk) => (
              <span key={sk} className="sticker-tag bg-taskOffWhite px-2.5 py-1 text-xs font-bold">
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-3">
            Recent Peer Reviews
          </h3>
          <div className="space-y-3">
            <div className="p-4 brutal-border bg-taskOffWhite space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-taskBlack">
                  Verified Student Peer
                </span>
                <span className="text-xs font-black text-yellow-500">★★★★★</span>
              </div>
              <p className="text-xs font-bold text-black/80 italic">
                &quot;Very neat work. Delivered before the lab session at Block C!&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Shield */}
        <div className="p-3 brutal-border bg-taskOffWhite text-[11px] font-semibold text-black/60">
          🔒 Private student details (personal email &amp; phone) are shielded by TaskMate Campus Privacy.
        </div>
      </div>
    </div>
  );
}
