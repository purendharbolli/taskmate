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
  Flag,
  AlertTriangle,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { User, College } from '@/lib/types';

const REPORT_REASONS = [
  'Suspected scam/fraud',
  'Fake identity',
  'Fake proof/work',
  'Payment-related issue',
  'Harassment/abuse',
  'Spam',
  'Other',
];

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [college, setCollege] = useState<College | null>(null);
  const [stats, setStats] = useState<{ tasks_posted: number; tasks_completed: number }>({
    tasks_posted: 0,
    tasks_completed: 0,
  });
  const [loading, setLoading] = useState(true);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDescription, setReportDescription] = useState('');
  const [reportEvidenceLink, setReportEvidenceLink] = useState('');
  const [reportTaskId, setReportTaskId] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile
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

    // Fetch current logged in user to check if reporting self
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, [userId]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportError(null);
    setReportSuccess(null);

    if (!currentUser) {
      setReportError('Please log in first to submit a moderation report.');
      return;
    }

    if (currentUser.id === user?.id) {
      setReportError('You cannot report your own profile.');
      return;
    }

    if (reportDescription.trim().length < 10) {
      setReportError('Please provide a detailed explanation of at least 10 characters.');
      return;
    }

    setIsSubmittingReport(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_user_id: user?.id,
          reason: reportReason,
          description: reportDescription.trim(),
          evidence_link: reportEvidenceLink.trim() || undefined,
          related_task_id: reportTaskId.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setReportSuccess(
        data.message || 'Report submitted successfully. Our campus moderation team will review this report carefully.'
      );
      setReportDescription('');
      setReportEvidenceLink('');
      setReportTaskId('');
    } catch (err: any) {
      setReportError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

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

  const isSelf = currentUser?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Report Button (Hidden if self) */}
        {!isSelf && (
          <button
            onClick={() => {
              setReportError(null);
              setReportSuccess(null);
              setIsReportOpen(true);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-600 hover:text-red-800 bg-white hover:bg-red-50 px-2.5 py-1 brutal-border shadow-[2px_2px_0px_0px_#000] transition-all"
            title="Report this user to campus moderation"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report Profile</span>
          </button>
        )}
      </div>

      <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 brutal-border bg-taskYellow brutal-shadow flex items-center justify-center font-black text-3xl shrink-0 uppercase">
            {(user.nickname || user.name).charAt(0)}
          </div>

          <div className="space-y-1 flex-1">
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

      {/* REPORT USER MODAL */}
      <BrutalModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportError(null);
          setReportSuccess(null);
        }}
        title={`REPORT PROFILE: ${user.name.toUpperCase()}`}
      >
        {reportSuccess ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-green-100 brutal-border flex items-start gap-3">
              <Check className="w-5 h-5 text-green-700 stroke-[3] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase text-green-900">
                  Report Received
                </h4>
                <p className="text-xs font-bold text-green-800 leading-relaxed">
                  {reportSuccess}
                </p>
              </div>
            </div>

            <p className="text-[11px] font-bold text-black/60">
              The reported user has not been notified. An administrator will review your report shortly.
            </p>

            <BrutalButton
              variant="yellow"
              size="sm"
              onClick={() => setIsReportOpen(false)}
              className="w-full"
            >
              CLOSE
            </BrutalButton>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div className="p-3 bg-taskYellow/20 brutal-border text-xs font-bold text-taskBlack/80 leading-relaxed">
              <strong>Notice:</strong> TaskMate takes campus safety and integrity seriously. Submitting a report alerts administrators for investigation. Reports are strictly private and not visible to the reported user.
            </div>

            {reportError && (
              <div className="p-3 bg-red-100 brutal-border text-xs font-black text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{reportError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase mb-1.5">
                Reason for Report *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReportReason(r)}
                    className={`text-left text-xs font-bold px-3 py-2 brutal-border transition-all ${
                      reportReason === r
                        ? 'bg-taskYellow text-taskBlack shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white hover:bg-taskOffWhite text-black/80'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe what occurred, dates, messages, or broken agreements..."
                className="w-full brutal-input p-2.5 text-xs font-bold resize-none"
              />
              <span className="text-[10px] font-bold text-black/50 block mt-0.5">
                Minimum 10 characters required. Be as factual as possible.
              </span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Evidence Link (Optional)
              </label>
              <input
                type="url"
                value={reportEvidenceLink}
                onChange={(e) => setReportEvidenceLink(e.target.value)}
                placeholder="https://drive.google.com/... or image URL"
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
              <span className="text-[10px] font-bold text-black/50 block mt-0.5">
                Link to screenshot proofs or Google Drive files.
              </span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Related Task ID (Optional)
              </label>
              <input
                type="text"
                value={reportTaskId}
                onChange={(e) => setReportTaskId(e.target.value)}
                placeholder="e.g. tsk-1 or task title"
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <BrutalButton
                type="button"
                variant="white"
                size="sm"
                onClick={() => setIsReportOpen(false)}
                disabled={isSubmittingReport}
              >
                CANCEL
              </BrutalButton>
              <BrutalButton
                type="submit"
                variant="pink"
                size="sm"
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? 'SUBMITTING...' : 'SUBMIT REPORT →'}
              </BrutalButton>
            </div>
          </form>
        )}
      </BrutalModal>
    </div>
  );
}
