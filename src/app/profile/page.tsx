'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
  AlertTriangle,
  Upload,
  Phone,
  HelpCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { VerifiedProfileBadge } from '@/components/VerifiedProfileBadge';
import { User as UserType, Review, College, Task, VerificationRequest, VerificationStatus } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [college, setCollege] = useState<College | null>(null);
  const [tasksPostedCount, setTasksPostedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');

  // Verification Request State
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [collegeEmailInput, setCollegeEmailInput] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVerificationStatus = () => {
    fetch('/api/verification')
      .then((res) => res.json())
      .then((vData) => {
        if (vData.requests && vData.requests.length > 0) {
          setVerificationRequest(vData.requests[0]);
        }
      })
      .catch(() => {});
  };

  const loadUserData = () => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || '');
          setNickname(data.user.nickname || data.user.name || '');
          setBio(data.user.bio || '');
          setPhoneInput(data.user.phone || '');
          if (data.user.phone) setPhoneConfirmed(true);

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

          fetchVerificationStatus();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadUserData();
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

  // Submit Verification Request (strictly private document upload + admin queue)
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifySuccess(null);

    if (!idCardFile && !collegeEmailInput.trim()) {
      setVerifyError('Please upload a clear photo/PDF of your College ID card or provide your institutional email.');
      return;
    }

    if (!phoneInput.trim() || !phoneConfirmed) {
      setVerifyError('Please provide and confirm your active phone number for verification.');
      return;
    }

    setVerifying(true);

    try {
      let documentUrl: string | undefined = undefined;
      let documentFilename: string | undefined = undefined;
      let documentType: string | undefined = undefined;

      // 1. Upload private verification document
      if (idCardFile) {
        const formData = new FormData();
        formData.append('file', idCardFile);

        const uploadRes = await fetch('/api/verification/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'Failed to securely upload ID card.');
        }

        documentUrl = uploadData.document_url;
        documentFilename = uploadData.document_filename;
        documentType = uploadData.document_type;
      }

      // 2. Submit verification request to database queue
      const verifyRes = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeId: user?.college_id,
          collegeName: college?.name,
          collegeEmail: collegeEmailInput.trim() || undefined,
          studentIdNumber: studentIdNumber.trim() || undefined,
          phone: phoneInput.trim(),
          phoneVerified: true,
          documentUrl,
          documentFilename,
          documentType,
          notesFromUser: userNotes.trim() || undefined,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Failed to submit verification request.');
      }

      setVerifySuccess('Verification request submitted successfully! An administrator will manually review your credentials.');
      setTimeout(() => {
        setVerificationModalOpen(false);
        setVerifySuccess(null);
        setIdCardFile(null);
        setUserNotes('');
        loadUserData();
      }, 1800);
    } catch (err: any) {
      setVerifyError(err.message || 'Error submitting verification request. Please try again.');
    } finally {
      setVerifying(false);
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

  // Compute effective verification state
  const effectiveStatus: VerificationStatus = user.admin_verified
    ? 'APPROVED'
    : verificationRequest?.status === 'PENDING'
    ? 'PENDING'
    : verificationRequest?.status === 'ADDITIONAL_INFO_REQUIRED' ||
      verificationRequest?.status === 'ADDITIONAL_INFO_NEEDED'
    ? 'ADDITIONAL_INFO_REQUIRED'
    : verificationRequest?.status === 'REJECTED'
    ? 'REJECTED'
    : 'NOT_REQUESTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
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
                  <span className="text-[11px] font-bold text-black/60 bg-taskOffWhite px-2 py-0.5 brutal-border" title="Your registered real name is private to your account">
                    🔒 Real Name (Private): {user.name}
                  </span>
                )}

                {/* Verified Profile Badge (appears strictly after admin approval) */}
                {user.admin_verified && (
                  <VerifiedProfileBadge isVerified={true} size="sm" />
                )}
                {user.college_verified && !user.admin_verified && (
                  <BrutalBadge variant="green" size="sm">
                    ✓ CAMPUS STUDENT
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

        {/* 4 Stats Cards */}
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
              ★ {user.completed_tasks && user.completed_tasks > 0 && user.rating ? user.rating.toFixed(1) : '—'}
            </span>
            <span className="text-[10px] font-black uppercase text-black/60">
              {user.completed_tasks && user.completed_tasks > 0 ? 'Peer Rating' : 'No Ratings Yet'}
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

        {/* Verification Status & Request Card (Sections 1, 2, 3, 10) */}
        <div className="brutal-border p-5 space-y-3 bg-[#FAF8F5]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-taskBlack stroke-[2.5]" />
              <h2 className="text-sm sm:text-base font-black uppercase text-taskBlack tracking-wide">
                User Verification Status
              </h2>
            </div>

            {effectiveStatus === 'APPROVED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase bg-[#8DD8FF] brutal-border border-black">
                ✓ VERIFIED PROFILE ACTIVE
              </span>
            )}
            {effectiveStatus === 'PENDING' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase bg-taskYellow brutal-border border-black">
                ⏳ PENDING ADMIN REVIEW
              </span>
            )}
            {effectiveStatus === 'ADDITIONAL_INFO_REQUIRED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase bg-amber-200 brutal-border border-black text-amber-900">
                ⚠️ ADDITIONAL INFO REQUIRED
              </span>
            )}
            {effectiveStatus === 'REJECTED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase bg-taskPink brutal-border border-black text-red-900">
                ❌ REQUEST NOT APPROVED
              </span>
            )}
            {effectiveStatus === 'NOT_REQUESTED' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase bg-white brutal-border border-black text-black/60">
                NOT REQUESTED
              </span>
            )}
          </div>

          {/* Explanation Box (Mandated wording: "Verified Profile means TaskMate has reviewed the information submitted by this user. It does not guarantee future transactions or behavior.") */}
          <div className="p-3 bg-white brutal-border border-black text-xs space-y-1.5">
            <p className="font-bold text-taskBlack leading-relaxed">
              <strong>Verified Profile Notice:</strong> Verified Profile means TaskMate has reviewed the information submitted by this user. It does not guarantee future transactions or behavior.
            </p>
            <p className="text-[11px] font-semibold text-black/70 leading-normal">
              Documents submitted (such as College ID cards) are strictly confidential and accessible only to authorized TaskMate administrators.
            </p>
          </div>

          {/* Conditional Guidance & Action Button according to the 5 states */}
          {effectiveStatus === 'APPROVED' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs font-bold text-green-800">
                ✓ Your profile verification was approved by administrators on {verificationRequest?.reviewed_at ? new Date(verificationRequest.reviewed_at).toLocaleDateString() : 'recent review'}. The &quot;Verified Profile&quot; badge is visible across your profile, posted tasks, and chats.
              </p>
            </div>
          )}

          {effectiveStatus === 'PENDING' && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-taskBlack/80">
                Your verification request was submitted on {verificationRequest?.submission_date ? new Date(verificationRequest.submission_date).toLocaleDateString() : 'recently'}. An administrator will manually inspect your submitted credentials.
              </p>
              <span className="text-[11px] font-semibold text-black/60 italic block">
                Average review time: within 24 hours.
              </span>
            </div>
          )}

          {effectiveStatus === 'ADDITIONAL_INFO_REQUIRED' && (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-amber-50 brutal-border border-black text-xs space-y-1">
                <span className="font-black uppercase text-amber-900 block">
                  Admin Note:
                </span>
                <p className="font-bold text-amber-950">
                  &quot;{verificationRequest?.review_notes || 'Please provide a clearer photo of your student ID card or updated institutional details.'}&quot;
                </p>
              </div>
              <BrutalButton
                variant="yellow"
                size="sm"
                onClick={() => setVerificationModalOpen(true)}
              >
                <span>PROVIDE ADDITIONAL INFORMATION →</span>
              </BrutalButton>
            </div>
          )}

          {effectiveStatus === 'REJECTED' && (
            <div className="space-y-3 pt-1">
              <div className="p-3 bg-red-50 brutal-border border-black text-xs space-y-1">
                <span className="font-black uppercase text-red-900 block">
                  Admin Decision Reason:
                </span>
                <p className="font-bold text-red-950">
                  &quot;{verificationRequest?.review_notes || 'Submitted credentials could not be verified.'}&quot;
                </p>
              </div>
              <BrutalButton
                variant="yellow"
                size="sm"
                onClick={() => setVerificationModalOpen(true)}
              >
                <span>RE-SUBMIT VERIFICATION REQUEST →</span>
              </BrutalButton>
            </div>
          )}

          {effectiveStatus === 'NOT_REQUESTED' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs font-bold text-taskBlack/70 max-w-md">
                Verify your student identity with your College ID card and phone verification for an admin-reviewed Verified Profile badge.
              </p>
              <BrutalButton
                variant="yellow"
                size="sm"
                onClick={() => setVerificationModalOpen(true)}
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>REQUEST VERIFIED PROFILE →</span>
              </BrutalButton>
            </div>
          )}
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
            🔒 <strong>Privacy Protection:</strong> Sensitive verification documents are confidential and accessible only to authorized TaskMate administrators. They are never shown publicly.
          </span>
          <ShieldCheck className="w-4 h-4 text-taskGreen shrink-0 stroke-[3]" />
        </div>
      </div>

      {/* Verification Submission Modal */}
      <BrutalModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        title="REQUEST VERIFIED PROFILE"
      >
        <form onSubmit={handleSubmitVerification} className="space-y-4">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-[#FFF9E6] brutal-border border-black space-y-2 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-taskBlack stroke-[2.5]" />
              <span className="font-black uppercase tracking-wide text-taskBlack">
                About Verified Profile
              </span>
            </div>
            <p className="font-bold text-taskBlack leading-relaxed">
              Verified Profile means TaskMate has reviewed the information submitted by this user. It does not guarantee future transactions or behavior.
            </p>
            <div className="p-2 bg-white brutal-border border-black text-[10px] text-black/75 space-y-1">
              <p>• Only authorized administrators can access submitted verification documents.</p>
              <p>• Never display or share your college ID publicly.</p>
              <p>• Admin will manually review your submission before activating the badge.</p>
            </div>
          </div>

          {verifyError && (
            <div className="p-2.5 brutal-border bg-taskPink/30 text-xs font-black text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{verifyError}</span>
            </div>
          )}

          {verifySuccess && (
            <div className="p-2.5 brutal-border bg-taskGreen/30 text-xs font-black text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{verifySuccess}</span>
            </div>
          )}

          {/* 1. College ID Card Document (Private Upload) */}
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              College ID Card (Photo or PDF) <span className="text-red-600">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setIdCardFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="brutal-border p-4 bg-taskOffWhite hover:bg-white cursor-pointer text-center space-y-1.5 border-dashed border-2 transition-all"
            >
              {idCardFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-black text-green-700">
                  <FileCheck className="w-5 h-5" />
                  <span>{idCardFile.name} ({(idCardFile.size / 1024).toFixed(0)} KB)</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdCardFile(null);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 stroke-[2.5] mx-auto text-black/60" />
                  <p className="text-xs font-black uppercase text-taskBlack">
                    Click to select College ID Card photo or PDF
                  </p>
                  <p className="text-[10px] font-bold text-black/50">
                    Max size: 15 MB. Strictly private &amp; confidential.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 2. Phone Number Verification */}
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Phone Number Verification <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer select-none text-xs font-bold text-taskBlack">
              <input
                type="checkbox"
                checked={phoneConfirmed}
                onChange={(e) => setPhoneConfirmed(e.target.checked)}
                className="w-4 h-4 border-2 border-black accent-taskYellow"
              />
              <span>I confirm this is my personal active phone number for campus task coordination.</span>
            </label>
          </div>

          {/* 3. Student ID / Roll Number */}
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Student ID / Roll Number (Optional)
            </label>
            <input
              type="text"
              value={studentIdNumber}
              onChange={(e) => setStudentIdNumber(e.target.value)}
              placeholder="e.g. 21B91A0501"
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          {/* 4. College Institutional Email (Alternative/Supporting Proof) */}
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Institutional Email (Optional)
            </label>
            <input
              type="email"
              value={collegeEmailInput}
              onChange={(e) => setCollegeEmailInput(e.target.value)}
              placeholder="e.g. yourname@sreenidhi.edu.in"
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          {/* 5. Notes to Administrator */}
          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Additional Notes for Administrator (Optional)
            </label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Any details to help administrators confirm your student status..."
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              disabled={verifying}
              onClick={() => setVerificationModalOpen(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton
              type="submit"
              variant="yellow"
              size="sm"
              disabled={verifying}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{verifying ? 'SUBMITTING...' : 'SUBMIT FOR ADMIN REVIEW'}</span>
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

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
