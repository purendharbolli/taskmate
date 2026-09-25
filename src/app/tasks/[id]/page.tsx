'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  FileText,
  Star,
  CheckCircle,
  Download,
  AlertCircle,
  Bookmark,
  Flag,
  User,
  ShieldCheck,
  Check,
  ChevronDown
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { Task, TaskFile, Application, User as UserType, College } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import clsx from 'clsx';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [data, setData] = useState<{
    task: Task;
    files: TaskFile[];
    requester?: UserType;
    category?: any;
    applications: Application[];
    college?: College;
  } | null>(null);

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(350);
  const [completionTime, setCompletionTime] = useState('Tomorrow by 5:00 PM');
  const [applyMessage, setApplyMessage] = useState('I can complete this neatly and deliver on campus.');
  const [applying, setApplying] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Academic integrity concern');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Accept Applicant State
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchTaskDetails = () => {
    setLoading(true);
    fetch(`/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          setError(resData.error);
        } else {
          setData(resData);
          setProposedPrice(resData.task.budget);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load task details');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTaskDetails();
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      });
  }, [taskId]);

  // Worker Application Submit
  const handleSendApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setApplying(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposed_price: proposedPrice,
          completion_time: completionTime,
          message: applyMessage,
        }),
      });

      const resData = await res.json();
      setApplying(false);

      if (resData.success) {
        setApplyModalOpen(false);
        fetchTaskDetails();
      } else {
        alert(resData.error || 'Failed to submit application');
      }
    } catch {
      alert('Network failure');
      setApplying(false);
    }
  };

  // Requester Accepts an Applicant
  const handleAcceptApplicant = async (applicationId: string) => {
    setAcceptingId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
      });
      const resData = await res.json();
      if (resData.success) {
        router.push(`/orders/${resData.order.id}`);
      } else {
        alert(resData.error || 'Failed to accept applicant');
      }
    } catch {
      alert('Error accepting applicant');
    } finally {
      setAcceptingId(null);
    }
  };

  // Submit Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSuccess(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSuccess(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-3" />
        <p className="font-black uppercase text-xs">Loading task details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="brutal-border bg-white brutal-shadow p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-xl font-black uppercase">Task Not Found</h2>
          <p className="text-xs font-bold text-black/60">
            {error || 'This task may have been closed or removed.'}
          </p>
          <Link href="/tasks">
            <BrutalButton variant="yellow" size="md">
              <span>BACK TO TASKS</span>
            </BrutalButton>
          </Link>
        </div>
      </div>
    );
  }

  const { task, files, requester, category, applications, college } = data;
  const isRequester = currentUser?.id === task.requester_id;
  const alreadyApplied = applications.some((a) => a.worker_id === currentUser?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Tasks</span>
        </Link>

        {/* Small Report Menu */}
        <button
          onClick={() => setReportModalOpen(true)}
          className="text-xs font-bold text-black/50 hover:text-red-600 flex items-center gap-1 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-6">
            {/* Top Badge & Price */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-4">
              <div className="flex items-center gap-2">
                <BrutalBadge variant="yellow" size="md">
                  {category?.name || 'Campus Task'}
                </BrutalBadge>
                {task.status === 'OPEN' ? (
                  <BrutalBadge variant="green" size="sm">
                    OPEN FOR APPLICANTS
                  </BrutalBadge>
                ) : (
                  <BrutalBadge variant="pink" size="sm">
                    {task.status}
                  </BrutalBadge>
                )}
              </div>

              <div className="bg-taskYellow px-3.5 py-1 brutal-border brutal-shadow-sm font-black text-2xl text-taskBlack">
                ₹{task.budget}
              </div>
            </div>

            {/* Task Title & Relative Time */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase text-taskBlack leading-tight">
                {task.title}
              </h1>
              <p className="text-xs font-bold text-black/50 mt-1 capitalize">
                {formatTimeAgo(task.created_at)} · {task.view_count || 12} views
              </p>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-bold mb-0.5">
                  Quantity / Pages
                </span>
                <span className="text-taskBlack font-black">{task.quantity || 'Standard'}</span>
              </div>

              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-bold mb-0.5">
                  Deadline
                </span>
                <span className="text-red-600 font-black flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.deadline}</span>
                </span>
              </div>

              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-bold mb-0.5">
                  Campus
                </span>
                <span className="text-taskBlack font-black truncate block">
                  {college?.short_name || 'SNIST'}
                </span>
              </div>

              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-bold mb-0.5">
                  Handover Mode
                </span>
                <span className="text-taskBlack font-black">Library / Canteen</span>
              </div>
            </div>

            {/* Description / What Needs to Be Done */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-2">
                What Needs to Be Done
              </h3>
              <p className="text-sm font-bold text-taskBlack/85 leading-relaxed whitespace-pre-wrap brutal-border bg-taskOffWhite p-4">
                {task.description}
              </p>
            </div>

            {/* Attachments */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-2">
                Attached Reference Material ({files.length})
              </h3>
              {files.length === 0 ? (
                <p className="text-xs text-black/50 italic">No reference files attached.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="brutal-border p-3 bg-white flex items-center justify-between hover:bg-taskYellow/20 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-5 h-5 text-taskBlack stroke-[2.5] shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-black text-taskBlack truncate">
                            {file.file_name}
                          </p>
                          <span className="text-[10px] text-black/60 uppercase font-semibold">
                            {file.file_size || 'PDF'}
                          </span>
                        </div>
                      </div>

                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="brutal-btn bg-white hover:bg-taskYellow px-2.5 py-1 text-xs font-extrabold flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>VIEW</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Academic Integrity Notice */}
            <AcademicIntegrityBanner />
          </div>

          {/* Requester View: Student Applicants List */}
          {isRequester && applications.length > 0 && (
            <div className="bg-white brutal-border brutal-shadow-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <h3 className="text-lg font-black uppercase text-taskBlack">
                  Student Applicants ({applications.length})
                </h3>
                <span className="text-xs font-bold text-black/60">
                  Select a worker to lock payment and start
                </span>
              </div>

              <div className="space-y-3">
                {applications.map((app) => {
                  const workerUser = (app as any).worker;
                  return (
                    <div
                      key={app.id}
                      className="brutal-border p-4 bg-taskOffWhite flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm uppercase text-taskBlack">
                            {workerUser?.name || 'Student Worker'}
                          </span>
                          <span className="flex items-center text-xs font-black text-taskBlack">
                            ★ {workerUser?.rating || 5.0}
                          </span>
                          <span className="text-xs font-bold text-black/60">
                            · {workerUser?.completed_tasks || 0} tasks done
                          </span>
                        </div>

                        <p className="text-xs font-bold text-black/80 italic mb-2">
                          &quot;{app.message}&quot;
                        </p>

                        <div className="flex items-center gap-3 text-xs font-bold text-black/60">
                          <span>ETA: {app.completion_time}</span>
                          <span>·</span>
                          <span className="text-black font-black">Offer: ₹{app.proposed_price}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {task.status === 'OPEN' && (
                          <BrutalButton
                            variant="yellow"
                            size="md"
                            disabled={acceptingId === app.id}
                            onClick={() => handleAcceptApplicant(app.id)}
                          >
                            <span>{acceptingId === app.id ? 'ACCEPTING...' : 'ACCEPT →'}</span>
                          </BrutalButton>
                        )}
                        {app.status === 'ACCEPTED' && (
                          <BrutalBadge variant="green" size="md">
                            ✓ ACCEPTED
                          </BrutalBadge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & CTAs (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Action Card */}
          <div className="bg-taskYellow brutal-border brutal-shadow-lg p-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-black uppercase text-taskBlack/70">
                Offered Price
              </span>
              <span className="text-3xl font-black text-taskBlack">
                ₹{task.budget}
              </span>
            </div>

            <p className="text-xs font-bold text-taskBlack/80 leading-relaxed">
              Task payment is held securely and released to you upon in-person campus handover verified by 4-digit OTP.
            </p>

            {isRequester ? (
              <div className="p-3 brutal-border bg-white text-center text-xs font-black uppercase">
                You posted this task. Review applications below.
              </div>
            ) : alreadyApplied ? (
              <div className="p-3 brutal-border bg-taskGreen/40 text-center text-xs font-black uppercase">
                ✓ Application Sent! Awaiting Requester Approval.
              </div>
            ) : task.status !== 'OPEN' ? (
              <div className="p-3 brutal-border bg-white text-center text-xs font-black uppercase opacity-75">
                This task has been assigned or completed.
              </div>
            ) : (
              <div className="space-y-2">
                <BrutalButton
                  variant="white"
                  fullWidth
                  size="xl"
                  onClick={() => setApplyModalOpen(true)}
                >
                  <span>I CAN DO THIS →</span>
                </BrutalButton>

                <button
                  type="button"
                  onClick={() => setSaved(!saved)}
                  className="w-full brutal-btn bg-taskOffWhite hover:bg-white py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5"
                >
                  <Bookmark className={clsx('w-3.5 h-3.5', saved && 'fill-black')} />
                  <span>{saved ? 'TASK SAVED' : 'SAVE TASK'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Requester Information Card */}
          <div className="bg-white brutal-border brutal-shadow p-5 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50 block">
              POSTED BY
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 brutal-border bg-taskYellow flex items-center justify-center font-black text-lg">
                {requester?.name?.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <h4 className="font-black text-base uppercase text-taskBlack truncate">
                  {requester?.name || 'Student Requester'}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-black/70">
                  <span className="flex items-center text-black font-black">
                    ★ {requester?.rating?.toFixed(1) || '5.0'}
                  </span>
                  <span>·</span>
                  <span>{requester?.completed_tasks || 0} tasks completed</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black/10 text-xs font-semibold text-black/80 space-y-1">
              <p>📍 {college?.name || 'Campus'}</p>
              <p>🤝 In-person campus delivery only</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal (Section 12) */}
      <BrutalModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for this Task"
      >
        <form onSubmit={handleSendApplication} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-taskBlack mb-1">
              Your Proposed Price (₹)
            </label>
            <input
              type="number"
              min="50"
              max="5000"
              required
              value={proposedPrice}
              onChange={(e) => setProposedPrice(Number(e.target.value))}
              className="w-full brutal-input py-2 px-3 text-xs sm:text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-taskBlack mb-1">
              Estimated Completion Time
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tomorrow by 4:00 PM"
              value={completionTime}
              onChange={(e) => setCompletionTime(e.target.value)}
              className="w-full brutal-input py-2 px-3 text-xs sm:text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-taskBlack mb-1">
              Message to Requester
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tell them why you're a good fit, your handwriting sample, or tools you'll use..."
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              className="w-full brutal-input py-2 px-3 text-xs sm:text-sm font-bold resize-none"
            />
          </div>

          <div className="pt-2">
            <BrutalButton
              type="submit"
              variant="yellow"
              fullWidth
              size="lg"
              disabled={applying}
            >
              <span>{applying ? 'SUBMITTING...' : 'SEND APPLICATION →'}</span>
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* Report Task Modal */}
      <BrutalModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Task"
      >
        {reportSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-taskGreen mx-auto" />
            <h4 className="font-black text-sm uppercase">Report Submitted</h4>
            <p className="text-xs font-bold text-black/60">
              Campus moderators will review this task promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-taskBlack mb-1">
                Reason for reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full brutal-input py-2 px-3 text-xs font-bold"
              >
                <option value="Academic integrity concern">Academic integrity / Cheating concern</option>
                <option value="Inappropriate content">Inappropriate content or spam</option>
                <option value="Unrealistic requirements">Unrealistic requirements or scam</option>
                <option value="Other">Other policy violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-taskBlack mb-1">
                Details (Optional)
              </label>
              <textarea
                rows={2}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Explain the issue..."
                className="w-full brutal-input py-2 px-3 text-xs font-bold resize-none"
              />
            </div>

            <BrutalButton type="submit" variant="pink" fullWidth size="md">
              <span>SUBMIT REPORT</span>
            </BrutalButton>
          </form>
        )}
      </BrutalModal>
    </div>
  );
}
