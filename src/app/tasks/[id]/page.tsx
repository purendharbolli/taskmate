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
  Send,
  AlertCircle,
  Share2,
  ShieldCheck,
  Check
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { Task, TaskFile, Application, User, College } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [data, setData] = useState<{
    task: Task;
    files: TaskFile[];
    requester?: User;
    category?: any;
    applications: Application[];
    college?: College;
  } | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Modal State
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<number>(350);
  const [completionTime, setCompletionTime] = useState('Tomorrow by 4:00 PM');
  const [applyMessage, setApplyMessage] = useState('I can complete this accurately and neatly.');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

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
      .catch((err) => {
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

  // Handle Worker Submitting Application
  const handleSendApplication = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setApplySuccess(true);
        setTimeout(() => {
          setApplySuccess(false);
          setApplyModalOpen(false);
          fetchTaskDetails();
        }, 1500);
      } else {
        setError(resData.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      setError('Network failure.');
      setApplying(false);
    }
  };

  // Handle Requester Accepting an Applicant
  const handleAcceptApplicant = async (applicationId: string) => {
    setAcceptingId(applicationId);
    try {
      const res = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
      });
      const resData = await res.json();
      if (resData.success) {
        // Redirect directly to the generated order page to lock payment!
        router.push(`/orders/${resData.order.id}`);
      } else {
        alert(resData.error || 'Failed to accept applicant');
      }
    } catch (err) {
      alert('Error accepting applicant');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 brutal-border bg-taskYellow animate-spin mx-auto mb-4" />
        <p className="font-black uppercase text-sm">Loading task details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="brutal-border bg-white brutal-shadow-lg p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto stroke-[2.5]" />
          <h2 className="text-2xl font-black uppercase">Task Not Found</h2>
          <p className="text-xs font-bold text-black/70">
            {error || 'This task may have been removed or completed.'}
          </p>
          <Link href="/tasks">
            <BrutalButton variant="yellow" size="md">
              <span>← BROWSE OTHER TASKS</span>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to All Tasks</span>
        </Link>

        <span className="text-[11px] font-mono font-bold text-black/50 uppercase">
          TASK ID: #{task.id}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white brutal-border brutal-shadow-lg p-6 md:p-8 space-y-6">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-4">
              <div className="flex items-center gap-2">
                <BrutalBadge variant="yellow" size="md">
                  {category?.name || 'Academic Help'}
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

              {/* Price Tag */}
              <div className="bg-taskYellow px-3.5 py-1 brutal-border brutal-shadow-sm font-black text-2xl text-taskBlack">
                ₹{task.budget}
              </div>
            </div>

            {/* Task Title */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase text-taskBlack leading-tight">
                {task.title}
              </h1>
              <p className="text-xs font-bold text-black/50 mt-1 capitalize">
                {formatTimeAgo(task.created_at)} · {task.view_count || 12} views
              </p>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-semibold mb-0.5">
                  Quantity
                </span>
                <span className="text-sm font-black">{task.quantity || 'Standard'}</span>
              </div>

              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-semibold mb-0.5">
                  Deadline
                </span>
                <span className="text-sm font-black text-red-600">{task.deadline}</span>
              </div>

              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-semibold mb-0.5">
                  Location
                </span>
                <span className="text-sm font-black truncate block">{task.location}</span>
              </div>

              <div className="brutal-border bg-taskOffWhite p-3">
                <span className="text-[10px] text-black/60 uppercase block font-semibold mb-0.5">
                  Handover
                </span>
                <span className="text-sm font-black truncate block">{task.handover_method}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-2">
                Task Description
              </h3>
              <div className="p-4 brutal-border bg-taskOffWhite text-sm font-bold text-taskBlack leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            </div>

            {/* Uploaded Material / Reference Files */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black/60 mb-2">
                Attached Reference Material ({files.length})
              </h3>
              {files.length === 0 ? (
                <p className="text-xs text-black/60 italic">No files attached to this task.</p>
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

          {/* Requester View: Show All Applicants Section */}
          {applications.length > 0 && (
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
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="brutal-border p-4 bg-taskOffWhite flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm uppercase text-taskBlack">
                          {(app as any).worker?.name || 'Student Worker'}
                        </span>
                        <span className="flex items-center text-xs font-black text-taskBlack">
                          ★ {(app as any).worker?.rating || 4.8}
                        </span>
                        <BrutalBadge variant="green" size="sm">
                          VERIFIED
                        </BrutalBadge>
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
                          <span>{acceptingId === app.id ? 'ACCEPTING...' : 'ACCEPT WORKER →'}</span>
                        </BrutalButton>
                      )}
                      {app.status === 'ACCEPTED' && (
                        <BrutalBadge variant="green" size="md">
                          ✓ ACCEPTED
                        </BrutalBadge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info & Action (Right Column) */}
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
              Payment will be secured in the TaskMate vault and released only when you complete the task and verify the 4-digit handover OTP on campus.
            </p>

            {isRequester ? (
              <div className="p-3 brutal-border bg-white text-center text-xs font-black uppercase">
                You posted this task. Review applicants on the left.
              </div>
            ) : alreadyApplied ? (
              <div className="p-3 brutal-border bg-taskGreen/40 text-center text-xs font-black uppercase">
                ✓ You have already applied for this task!
              </div>
            ) : task.status !== 'OPEN' ? (
              <div className="p-3 brutal-border bg-white text-center text-xs font-black uppercase opacity-75">
                This task has been assigned or closed.
              </div>
            ) : (
              <BrutalButton
                variant="white"
                fullWidth
                size="xl"
                onClick={() => setApplyModalOpen(true)}
              >
                <span>I CAN DO THIS →</span>
              </BrutalButton>
            )}
          </div>

          {/* Requester Profile Card */}
          <div className="bg-white brutal-border brutal-shadow p-5 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-black/50 block">
              POSTED BY
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 brutal-border bg-taskYellow flex items-center justify-center font-black text-lg">
                {requester?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h4 className="font-black text-base uppercase text-taskBlack">
                  {requester?.name || 'Student Requester'}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-black/70">
                  <span className="flex items-center text-black font-black">
                    ★ {requester?.rating || 4.8}
                  </span>
                  <span>·</span>
                  <span>{requester?.completed_tasks || 18} tasks</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t-2 border-black/10 text-xs font-semibold text-black/80 space-y-1">
              <p>📍 {college?.name || 'SNIST Hyderabad'}</p>
              <p>🎓 Verified Student Identity</p>
            </div>

            <Link href={`/profile/${requester?.id || 'usr-rohit-1'}`} className="block w-full">
              <button className="w-full text-center text-xs font-black uppercase underline hover:text-blue-700 py-1">
                View Student Profile →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Application Modal ("I CAN DO THIS") */}
      <BrutalModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="APPLY FOR THIS TASK"
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-2">
            <Check className="w-10 h-10 text-green-600 stroke-[3] mx-auto animate-bounce" />
            <h4 className="font-black text-base uppercase">Application Submitted!</h4>
            <p className="text-xs font-bold text-black/70">
              The requester will be notified to review and accept your offer.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendApplication} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Your Proposed Price (₹)
              </label>
              <input
                type="number"
                required
                min="50"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full brutal-input px-3.5 py-2 text-sm font-black"
              />
              <span className="text-[10px] text-black/60 font-semibold block mt-0.5">
                Task budget is ₹{task.budget}
              </span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                When can you complete it?
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tomorrow by 4:00 PM"
                value={completionTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="w-full brutal-input px-3.5 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Message to Requester
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. I have neat handwriting and have done 18 similar lab records with A+ grades. Can meet at Block C cafeteria."
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                className="w-full brutal-input px-3.5 py-2 text-xs font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <BrutalButton
                type="button"
                variant="white"
                size="md"
                onClick={() => setApplyModalOpen(false)}
              >
                CANCEL
              </BrutalButton>
              <BrutalButton
                type="submit"
                variant="yellow"
                size="lg"
                disabled={applying}
              >
                <span>{applying ? 'SENDING...' : 'SEND APPLICATION →'}</span>
              </BrutalButton>
            </div>
          </form>
        )}
      </BrutalModal>
    </div>
  );
}
