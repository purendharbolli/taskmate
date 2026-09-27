'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Star,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Edit3,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { User as UserType, Review, College, Task } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [college, setCollege] = useState<College | null>(null);
  const [tasksPostedCount, setTasksPostedCount] = useState<number>(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || '');
          setNickname(data.user.nickname || data.user.name || '');
          setBio(data.user.bio || '');

          // Fetch college details
          if (data.user.college_id) {
            fetch('/api/locations')
              .then((r) => r.json())
              .then((lData) => {
                const col = lData.colleges?.find((c: College) => c.id === data.user.college_id);
                if (col) setCollege(col);
              });
          }

          // Fetch tasks posted by this user
          fetch(`/api/tasks?requesterId=${data.user.id}`)
            .then((r) => r.json())
            .then((tData) => {
              if (tData.tasks) {
                setTasksPostedCount(tData.tasks.length);
              }
            })
            .catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const res = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nickname, bio }),
    });
    const d = await res.json();
    if (d.success) {
      setUser(d.user);
      setEditModalOpen(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-4" />
        <p className="font-black uppercase text-xs">Loading Profile...</p>
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Profile Header Card */}
      <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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

                {/* Trustable / Verified Badges */}
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

              {/* Location & College info */}
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
                  'Active college student on TaskMate. Open for handwriting, record notes, diagrams, and campus help.'}
              </p>
            </div>
          </div>

          <BrutalButton
            variant="yellow"
            size="md"
            onClick={() => setEditModalOpen(true)}
            className="self-start"
          >
            <Edit3 className="w-3.5 h-3.5 stroke-[3]" />
            <span>EDIT PROFILE</span>
          </BrutalButton>
        </div>

        {/* 4 Stats Cards including Tasks Posted & Completed */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="brutal-border bg-taskYellow/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {tasksPostedCount}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Tasks Posted
            </span>
          </div>

          <div className="brutal-border bg-taskBlue/30 p-3">
            <span className="text-2xl font-black text-taskBlack block">
              {user.completed_tasks || 0}
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
              ₹{user.earnings_total || 0}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              Campus Earnings
            </span>
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-2">
            Campus Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.skills?.length ? (
              user.skills.map((sk) => (
                <span
                  key={sk}
                  className="sticker-tag bg-white px-2.5 py-1 text-xs font-bold brutal-border"
                >
                  {sk}
                </span>
              ))
            ) : (
              <span className="text-xs font-bold text-black/50">No skills selected yet</span>
            )}
          </div>
        </div>

        {/* Student Reviews Showcase */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-3">
            Peer Reviews &amp; Recommendations
          </h3>

          {reviews.length === 0 ? (
            <div className="p-5 brutal-border bg-taskOffWhite text-center space-y-1">
              <p className="text-xs font-black uppercase text-taskBlack">No reviews yet</p>
              <p className="text-[11px] font-bold text-black/60">
                Complete tasks with student peers to earn ratings and feedback on your campus profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 brutal-border bg-taskOffWhite space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-taskBlack">
                      Verified Student Peer
                    </span>
                    <span className="text-xs font-black text-yellow-500">
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-black/80 italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-3 brutal-border bg-white text-[11px] font-semibold text-black/60 flex items-center justify-between">
          <span>
            🔒 <strong>Privacy Protection:</strong> Passwords and recovery questions are encrypted. Your personal contact details are never exposed.
          </span>
          <ShieldCheck className="w-4 h-4 text-taskGreen shrink-0 stroke-[3]" />
        </div>
      </div>

      {/* Edit Profile Modal */}
      <BrutalModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="EDIT YOUR CAMPUS PROFILE"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1">Campus Nickname</label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Rohit"
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Bio / Major</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share what tasks you do best..."
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton type="submit" variant="yellow" size="sm">
              SAVE CHANGES
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>
    </div>
  );
}
