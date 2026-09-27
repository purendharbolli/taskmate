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
  Award,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { User, College } from '@/lib/types';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [stats, setStats] = useState<{ tasks_posted: number; tasks_completed: number }>({
    tasks_posted: 0,
    tasks_completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (data.college) setCollege(data.college);
          if (data.stats) setStats(data.stats);
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

  const collegeName = college?.name || user.custom_college_name || 'Campus Student';
  const areaCityText = user.area
    ? `${user.area}, Hyderabad`
    : college?.area
    ? `${college.area}, Hyderabad`
    : 'Hyderabad';

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
          <div className="w-20 h-20 brutal-border bg-taskYellow brutal-shadow flex items-center justify-center font-black text-3xl shrink-0 uppercase">
            {(user.nickname || user.name).charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                {user.nickname || user.name}
              </h1>

              {user.nickname && user.nickname !== user.name && (
                <span className="text-xs font-bold text-black/60 bg-taskOffWhite px-2 py-0.5 brutal-border">
                  {user.name}
                </span>
              )}

              {user.admin_verified && (
                <BrutalBadge variant="yellow" size="sm">
                  ⭐ TRUSTED BADGE
                </BrutalBadge>
              )}
              {user.college_verified && (
                <BrutalBadge variant="green" size="sm">
                  ✓ VERIFIED STUDENT
                </BrutalBadge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-black/70">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-taskBlack" />
                <strong>{collegeName}</strong>
              </span>
              <span>·</span>
              <span className="text-black/80">{areaCityText}</span>
            </div>

            <p className="text-xs font-bold text-taskBlack/80 pt-1 leading-relaxed max-w-xl">
              {user.bio ||
                'Active campus student helper. Fast on records, handwriting, and slide presentations.'}
            </p>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="brutal-border bg-taskYellow/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {stats.tasks_posted}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Tasks Posted
            </span>
          </div>

          <div className="brutal-border bg-taskBlue/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {stats.tasks_completed}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Tasks Completed
            </span>
          </div>

          <div className="brutal-border bg-taskGreen/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              ★ {user.rating ? user.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Peer Rating
            </span>
          </div>

          <div className="brutal-border bg-taskPink/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {user.completion_rate ? `${user.completion_rate}%` : '100%'}
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
            {user.skills?.length ? (
              user.skills.map((sk) => (
                <span
                  key={sk}
                  className="sticker-tag bg-taskOffWhite px-2.5 py-1 text-xs font-bold brutal-border"
                >
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs font-bold text-black/50">No skills added yet</span>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-3">
            Recent Peer Reviews
          </h3>
          <div className="p-4 brutal-border bg-taskOffWhite text-center space-y-1">
            <p className="text-xs font-black uppercase text-taskBlack">No reviews yet</p>
            <p className="text-[11px] font-bold text-black/60">
              Reviews will appear here after completing campus tasks.
            </p>
          </div>
        </div>

        {/* Privacy Shield */}
        <div className="p-3 brutal-border bg-taskOffWhite text-[11px] font-semibold text-black/60 flex items-center justify-between">
          <span>
            🔒 Private student credentials (passwords &amp; recovery answers) are never exposed.
          </span>
          <ShieldCheck className="w-4 h-4 text-taskGreen shrink-0 stroke-[3]" />
        </div>
      </div>
    </div>
  );
}
