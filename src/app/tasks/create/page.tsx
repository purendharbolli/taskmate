'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink,
  Info,
  Calendar,
  IndianRupee,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { User, College } from '@/lib/types';
import clsx from 'clsx';

const MAX_DIRECT_UPLOAD_MB = 50;
const MAX_DIRECT_UPLOAD_BYTES = MAX_DIRECT_UPLOAD_MB * 1024 * 1024; // 52,428,800 bytes

// Categories required by prompt
const TASK_CATEGORIES = [
  {
    id: 'cat-record',
    key: 'writing',
    name: 'Writing',
    icon: '✍️',
    description: 'Lab records, notes copying, handwritten papers & assignments',
  },
  {
    id: 'cat-diagrams',
    key: 'drawing',
    name: 'Drawing',
    icon: '📐',
    description: 'Engineering drawings, circuit diagrams, biology charts & sketches',
  },
  {
    id: 'cat-poster',
    key: 'design',
    name: 'Design',
    icon: '🎨',
    description: 'Canva graphics, posters, club banners, flyers & UI layouts',
  },
  {
    id: 'cat-ppt',
    key: 'ppt',
    name: 'PPT/Presentation',
    icon: '📊',
    description: 'PowerPoint slide decks, seminar presentations & pitch decks',
  },
  {
    id: 'cat-resume',
    key: 'resume',
    name: 'Resume/CV preparation',
    icon: '📄',
    description: 'Internship resumes, LaTeX formatting & ATS-friendly layouts',
  },
  {
    id: 'cat-other',
    key: 'other',
    name: 'Other',
    icon: '⚡',
    description: 'Campus errands, data entry, printing pickup & other assistance',
  },
];

interface UploadedFileItem {
  file_name: string;
  file_url: string;
  file_size: string;
  file_size_bytes?: number;
  file_type: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authenticated user session & college
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCollege, setUserCollege] = useState<College | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);

  // 1. Task Category
  const [categoryId, setCategoryId] = useState('cat-record');

  // 2. Task Title
  const [title, setTitle] = useState('');

  // 3. Short Task Description
  const [description, setDescription] = useState('');

  // 4. Deadline / Date
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('17:00');

  // 5. Price Offered
  const [budget, setBudget] = useState<number | ''>(300);

  // 6. Amount of Work (Dynamic based on Category)
  // For Writing:
  const [writingPages, setWritingPages] = useState<number | ''>(15);
  // For PPT:
  const [pptSlides, setPptSlides] = useState<number | ''>(12);
  // For Design:
  const [designCountType, setDesignCountType] = useState('2 Instagram Posters');
  // For Resume:
  const [resumePages, setResumePages] = useState('1-Page Resume (Fresher/Internship)');
  // For Drawing:
  const [drawingCount, setDrawingCount] = useState<number | ''>(4);
  // For Other:
  const [otherWorkVolume, setOtherWorkVolume] = useState('');

  // 7. Resource Attachments
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 8. Google Drive Link
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [driveLinkError, setDriveLinkError] = useState<string | null>(null);

  // 9. College / Location information
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [handoverMethod, setHandoverMethod] = useState<
    'Campus meeting point' | 'Self-arranged delivery' | 'Other'
  >('Campus meeting point');
  const [meetingLocation, setMeetingLocation] = useState('Campus Library / Canteen');

  // 10. Confirmation & Publishing State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load session & college information on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setCurrentUser(data.user);
        setSelectedCollegeId(data.user.college_id || 'col-snist');

        // Fetch colleges to find user's college details
        fetch('/api/locations')
          .then((lRes) => lRes.json())
          .then((lData) => {
            if (lData.colleges) {
              setColleges(lData.colleges);
              const foundCol = lData.colleges.find(
                (c: College) => c.id === (data.user.college_id || 'col-snist')
              );
              if (foundCol) setUserCollege(foundCol);
            }
          });
      })
      .catch(() => {
        router.push('/login');
      });

    // Default deadline: Tomorrow 5 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDeadlineDate(`${yyyy}-${mm}-${dd}`);
  }, [router]);

  // Selected category object
  const currentCategory =
    TASK_CATEGORIES.find((c) => c.id === categoryId) || TASK_CATEGORIES[0];

  // Compute work volume summary string for submission
  const getFormattedWorkVolume = (): string => {
    switch (currentCategory.key) {
      case 'writing':
        return `${writingPages || 1} Pages (One side of a page)`;
      case 'ppt':
        return `${pptSlides || 1} Slides`;
      case 'design':
        return designCountType.trim() || 'Custom Graphic Design';
      case 'drawing':
        return `${drawingCount || 1} Diagrams / Charts`;
      case 'resume':
        return resumePages.trim() || '1 Resume / CV';
      case 'other':
      default:
        return otherWorkVolume.trim() || 'Standard Work Scope';
    }
  };

  // Google Drive Link Validation
  const handleDriveLinkChange = (value: string) => {
    setGoogleDriveLink(value);
    if (!value.trim()) {
      setDriveLinkError(null);
      return;
    }
    const clean = value.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      setDriveLinkError('Link must start with https:// or http://');
    } else {
      setDriveLinkError(null);
    }
  };

  // File Upload Handler with Client-Side 50 MB check + Server-Side Validation
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const file = files[0];

    // Client-side pre-upload validation: Reject files > 50 MB
    if (file.size > MAX_DIRECT_UPLOAD_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(
        `File "${file.name}" is ${fileSizeMB} MB, which exceeds the direct upload limit of 50 MB. For files larger than 50 MB, please share them via Google Drive below.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Progress animation
      const progressTimer = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 20 : p));
      }, 150);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUploadError(
          data.error || 'Failed to upload file. Please try again or share via Google Drive.'
        );
      } else {
        setUploadedFiles((prev) => [
          ...prev,
          {
            file_name: data.file_name,
            file_url: data.file_url,
            file_size: data.file_size,
            file_size_bytes: data.file_size_bytes,
            file_type: data.file_type,
          },
        ]);
        setUploadError(null);
      }
    } catch {
      setUploadError('Network error during upload. Please check your connection.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Validation before opening confirmation
  const handleValidateAndConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please provide a brief task description.');
      return;
    }
    if (!deadlineDate) {
      setFormError('Please select a deadline date.');
      return;
    }
    if (!budget || Number(budget) < 50) {
      setFormError('Please offer a valid price (minimum ₹50).');
      return;
    }
    if (driveLinkError) {
      setFormError('Please fix the Google Drive link format.');
      return;
    }

    // Open Confirmation modal
    setConfirmModalOpen(true);
  };

  // Single Final Publishing Action
  const handlePublishTask = async () => {
    setSubmitting(true);
    setFormError(null);

    const deadlineString = `${deadlineDate} · ${deadlineTime}`;
    const amountOfWork = getFormattedWorkVolume();

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category_id: categoryId,
          description: description.trim(),
          budget: Number(budget),
          quantity: amountOfWork,
          deadline: deadlineString,
          location: meetingLocation.trim() || 'Campus Meeting Point',
          handover_method: handoverMethod,
          college_id: selectedCollegeId || currentUser?.college_id,
          google_drive_link: googleDriveLink.trim() || undefined,
          files: uploadedFiles,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to post task. Please review the details.');
        setConfirmModalOpen(false);
      } else {
        router.push(`/tasks/${data.task.id}`);
      }
    } catch {
      setFormError('Network connection error. Please try again.');
      setConfirmModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const activeCollegeDisplay =
    userCollege?.name || currentUser?.custom_college_name || 'Hyderabad Campus';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Marketplace</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="sticker-tag bg-taskYellow text-taskBlack px-2.5 py-0.5 text-xs font-black brutal-border">
            1-STEP TASK CREATION
          </span>
        </div>
      </div>

      {formError && (
        <div className="brutal-border bg-taskPink/40 p-3.5 text-xs font-black text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="leading-snug">{formError}</div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleValidateAndConfirm} className="space-y-6">
        <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-8">
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack tracking-tight">
              Post a Campus Task
            </h1>
            <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
              Fill in the details below. Once published, qualified peers on your campus can apply to help.
            </p>
          </div>

          {/* 1. TASK CATEGORY SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                1. Select Task Category <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] font-bold text-black/50">
                Determines work-volume fields
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TASK_CATEGORIES.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={clsx(
                      'p-3.5 brutal-border text-left transition-all flex flex-col justify-between space-y-1.5 select-none',
                      isSelected
                        ? 'bg-taskYellow brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                        : 'bg-taskOffWhite hover:bg-white text-taskBlack/80'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{cat.icon}</span>
                      <div
                        className={clsx(
                          'w-4 h-4 rounded-full border-2 border-black flex items-center justify-center',
                          isSelected ? 'bg-black text-white' : 'bg-white'
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </div>
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase block text-taskBlack">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-bold text-black/60 line-clamp-1">
                        {cat.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TASK TITLE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
              2. Task Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Physics Lab Record Copying (Exp 4 to 8), Canva Tech Fest Poster, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full brutal-input px-3.5 py-3 text-xs sm:text-sm font-bold text-taskBlack"
            />
            <p className="text-[11px] text-black/50 font-bold">
              Be specific and clear so student helpers know exactly what is required.
            </p>
          </div>

          {/* 3. TASK DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
              3. Short Task Description <span className="text-red-600">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe requirements, handwriting neatness, format guidelines, or specific instructions for the student worker..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full brutal-input px-3.5 py-2.5 text-xs sm:text-sm font-bold text-taskBlack resize-none"
            />
          </div>

          {/* 4 & 5. DEADLINE & OFFERED PRICE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                4. Deadline Date &amp; Time <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full brutal-input px-2.5 py-2.5 text-xs sm:text-sm font-bold bg-white"
                />
                <input
                  type="time"
                  required
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full brutal-input px-2.5 py-2.5 text-xs sm:text-sm font-bold bg-white"
                />
              </div>
            </div>

            {/* Offered Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                5. Price Offered (₹ INR) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-black text-sm text-taskBlack">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={50}
                  step={10}
                  placeholder="300"
                  value={budget}
                  onChange={(e) =>
                    setBudget(e.target.value ? Number(e.target.value) : '')
                  }
                  className="w-full brutal-input pl-8 pr-3.5 py-2.5 text-xs sm:text-sm font-bold text-taskBlack"
                />
              </div>
              <p className="text-[11px] text-black/50 font-bold">
                Funds are held securely by TaskMate and released via 4-digit OTP upon completion.
              </p>
            </div>
          </div>

          {/* 6. DYNAMIC AMOUNT OF WORK BASED ON CATEGORY */}
          <div className="p-4 brutal-border bg-taskYellow/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                6. Amount of Work ({currentCategory.name})
              </label>
              <span className="text-[10px] font-black uppercase bg-taskYellow px-2 py-0.5 brutal-border">
                DYNAMIC SPECIFICATION
              </span>
            </div>

            {/* Condition 1: Writing Category */}
            {currentCategory.key === 'writing' && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-taskBlack">
                    Total Number of Pages:
                  </span>
                  <div className="w-full sm:w-48">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={writingPages}
                      onChange={(e) =>
                        setWritingPages(e.target.value ? Number(e.target.value) : '')
                      }
                      className="w-full brutal-input px-3 py-1.5 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                {/* Clear Definition: 1 Page = One side of a page */}
                <div className="brutal-border bg-white p-2.5 text-xs font-bold text-taskBlack flex items-center gap-2">
                  <span className="sticker-tag bg-taskYellow text-taskBlack px-2 py-0.5 text-[10px] font-black shrink-0">
                    IMPORTANT DEFINITION
                  </span>
                  <span>
                    <strong>1 Page = One side of a page.</strong> A standard double-sided sheet counts as 2 pages.
                  </span>
                </div>
              </div>
            )}

            {/* Condition 2: PPT / Presentation */}
            {currentCategory.key === 'ppt' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-taskBlack block">
                    Number of Slides:
                  </span>
                  <span className="text-[11px] text-black/60 font-semibold">
                    Expected presentation deck slide count
                  </span>
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={pptSlides}
                    onChange={(e) =>
                      setPptSlides(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full brutal-input px-3 py-1.5 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                    placeholder="e.g. 12"
                  />
                </div>
              </div>
            )}

            {/* Condition 3: Design Category */}
            {currentCategory.key === 'design' && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-taskBlack block">
                  Number &amp; Type of Designs:
                </span>
                <input
                  type="text"
                  value={designCountType}
                  onChange={(e) => setDesignCountType(e.target.value)}
                  placeholder="e.g. 2 Instagram posters + 1 event flyer"
                  className="w-full brutal-input px-3 py-2 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                />
              </div>
            )}

            {/* Condition 4: Resume / CV Preparation */}
            {currentCategory.key === 'resume' && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-taskBlack block">
                  Resume / CV Format &amp; Pages:
                </span>
                <input
                  type="text"
                  value={resumePages}
                  onChange={(e) => setResumePages(e.target.value)}
                  placeholder="e.g. 1-Page Tech Resume (LaTeX / Overleaf)"
                  className="w-full brutal-input px-3 py-2 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                />
              </div>
            )}

            {/* Condition 5: Drawing Category */}
            {currentCategory.key === 'drawing' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-taskBlack block">
                    Number of Diagrams / Charts:
                  </span>
                  <span className="text-[11px] text-black/60 font-semibold">
                    Circuit diagrams, biology diagrams, or A4 sheets
                  </span>
                </div>
                <div className="w-full sm:w-48">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={drawingCount}
                    onChange={(e) =>
                      setDrawingCount(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full brutal-input px-3 py-1.5 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>
            )}

            {/* Condition 6: Other Category */}
            {currentCategory.key === 'other' && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-taskBlack block">
                  Work Volume / Scope:
                </span>
                <input
                  type="text"
                  value={otherWorkVolume}
                  onChange={(e) => setOtherWorkVolume(e.target.value)}
                  placeholder="e.g. Pick up 2 spiral-bound xerox sets, 1 hour errand"
                  className="w-full brutal-input px-3 py-2 text-xs sm:text-sm font-bold bg-white text-taskBlack"
                />
              </div>
            )}
          </div>

          {/* 7. RESOURCE ATTACHMENT (MAX 50 MB DIRECT UPLOAD) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                7. Resource Attachments (Optional)
              </label>
              <span className="text-[11px] font-black uppercase text-taskBlack bg-taskYellow px-2 py-0.5 brutal-border">
                Max 50 MB Direct Upload
              </span>
            </div>

            {/* Drag & Drop / Click Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-[3px] border-dashed border-black/30 hover:border-black p-6 text-center cursor-pointer bg-taskOffWhite hover:bg-taskYellow/10 transition-colors space-y-2 select-none"
            >
              <Upload className="w-8 h-8 mx-auto text-taskBlack/70" />
              <div>
                <p className="text-xs font-black uppercase text-taskBlack">
                  Click to select reference notes, PDFs, or photos
                </p>
                <p className="text-[11px] font-bold text-black/50">
                  Files up to 50 MB allowed directly · PDFs, images, DOCX, ZIP
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Progress Indicator */}
            {isUploading && (
              <div className="space-y-1 brutal-border p-3 bg-white">
                <div className="flex items-center justify-between text-xs font-black uppercase">
                  <span>Uploading File...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-taskOffWhite h-2 brutal-border">
                  <div
                    className="bg-taskYellow h-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="brutal-border bg-taskPink/30 p-3 text-xs font-black text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-snug">{uploadError}</div>
              </div>
            )}

            {/* List of Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black uppercase text-black/60 block">
                  Attached Files ({uploadedFiles.length}):
                </span>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="brutal-border p-2.5 bg-white flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-taskBlack shrink-0" />
                      <span className="text-xs font-bold text-taskBlack truncate">
                        {file.file_name}
                      </span>
                      <span className="text-[10px] font-bold text-black/60 bg-taskOffWhite px-1.5 py-0.5 brutal-border">
                        {file.file_size}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUploadedFile(idx)}
                      className="text-black/50 hover:text-red-600 p-1 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8. GOOGLE DRIVE LINK */}
          <div className="space-y-2 p-4 brutal-border bg-taskBlue/10">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                8. Google Drive Link (Optional)
              </label>
              <span className="text-[10px] font-bold text-taskBlue uppercase font-mono">
                For Large Resources (&gt; 50 MB)
              </span>
            </div>

            <p className="text-[11px] font-bold text-taskBlack/70 leading-relaxed">
              Files larger than <strong>50 MB</strong> should preferably be shared through a Google Drive link. Please ensure link sharing permissions are set to &quot;Anyone with the link can view&quot;.
            </p>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-taskBlack/60">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={googleDriveLink}
                onChange={(e) => handleDriveLinkChange(e.target.value)}
                className="w-full brutal-input pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-bold bg-white text-taskBlack"
              />
            </div>

            {driveLinkError && (
              <p className="text-[11px] font-black text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{driveLinkError}</span>
              </p>
            )}
          </div>

          {/* 9. COLLEGE / LOCATION INFORMATION */}
          <div className="space-y-3 p-4 brutal-border bg-taskOffWhite">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-taskBlack">
                9. Campus &amp; Location Information
              </label>
              <span className="text-[10px] font-black uppercase bg-taskGreen/40 px-2 py-0.5 brutal-border">
                AUTO-CONFIGURED
              </span>
            </div>

            {/* Hyperlocal Campus Discovery Notice */}
            <div className="bg-white p-3 brutal-border space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-taskBlack">
                <MapPin className="w-4 h-4 text-taskBlack shrink-0" />
                <span>Priority Discovery Campus: {activeCollegeDisplay}</span>
              </div>
              <p className="text-[11px] font-bold text-black/60 leading-relaxed">
                TaskMate automatically pairs this task with students at <strong>{activeCollegeDisplay}</strong> so your campus peers see it first in their hyperlocal feed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-black uppercase mb-1">
                  Handover Mode
                </label>
                <select
                  value={handoverMethod}
                  onChange={(e: any) => setHandoverMethod(e.target.value)}
                  className="w-full brutal-input px-3 py-2 text-xs font-bold bg-white"
                >
                  <option value="Campus meeting point">Campus Meeting Point</option>
                  <option value="Self-arranged delivery">Digital / Self-Arranged Delivery</option>
                  <option value="Other">Other Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase mb-1">
                  Campus Spot / Meeting Spot
                </label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="e.g. Block C Canteen, Library Gate, Online"
                  className="w-full brutal-input px-3 py-2 text-xs font-bold bg-white"
                />
              </div>
            </div>
          </div>

          {/* Academic Integrity Honor Banner */}
          <AcademicIntegrityBanner />

          {/* Bottom Review & Publish Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-2 border-black/10">
            <div>
              <span className="text-xs font-black uppercase text-taskBlack block">
                Total Budget: ₹{budget || 0}
              </span>
              <span className="text-[11px] font-bold text-black/50">
                Single step. Review summary before broadcast.
              </span>
            </div>

            <BrutalButton type="submit" variant="yellow" size="lg">
              <span>REVIEW &amp; PUBLISH TASK →</span>
            </BrutalButton>
          </div>
        </div>
      </form>

      {/* 10. CLEAR CONFIRMATION BEFORE PUBLISHING MODAL */}
      <BrutalModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="CONFIRM TASK DETAILS BEFORE BROADCAST"
      >
        <div className="space-y-5">
          <p className="text-xs font-bold text-black/70">
            Please verify your task specifications. Once published, qualified peers on your campus can immediately apply.
          </p>

          <div className="p-4 brutal-border bg-taskOffWhite space-y-3">
            {/* Title & Category */}
            <div className="border-b-2 border-black/10 pb-2">
              <span className="sticker-tag bg-taskYellow text-taskBlack px-2 py-0.5 text-[10px] font-black uppercase inline-block mb-1">
                {currentCategory.name}
              </span>
              <h3 className="font-black text-base text-taskBlack uppercase leading-snug">
                {title}
              </h3>
            </div>

            {/* Scope / Work Amount & Deadline */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <div>
                <span className="text-[10px] font-black uppercase text-black/50 block">
                  Work Amount
                </span>
                <span className="text-taskBlack">{getFormattedWorkVolume()}</span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-black/50 block">
                  Deadline
                </span>
                <span className="text-taskBlack">
                  {deadlineDate} · {deadlineTime}
                </span>
              </div>
            </div>

            {/* Price Offered & Campus */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold border-t border-black/10 pt-2">
              <div>
                <span className="text-[10px] font-black uppercase text-black/50 block">
                  Offered Price
                </span>
                <span className="text-base font-black text-taskBlack">
                  ₹{budget}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-black/50 block">
                  Campus Discovery
                </span>
                <span className="text-taskBlack truncate block">
                  {activeCollegeDisplay}
                </span>
              </div>
            </div>

            {/* Attachments / Drive */}
            <div className="border-t border-black/10 pt-2 text-xs font-bold">
              <span className="text-[10px] font-black uppercase text-black/50 block">
                Reference Material
              </span>
              <span className="text-taskBlack">
                {uploadedFiles.length > 0
                  ? `${uploadedFiles.length} file(s) attached`
                  : 'No direct files attached'}
                {googleDriveLink ? ' · Google Drive link provided' : ''}
              </span>
            </div>
          </div>

          {/* Important Warning / Disclaimer */}
          <div className="brutal-border bg-taskYellow/30 p-3 text-xs font-bold text-taskBlack space-y-1">
            <div className="flex items-center gap-1.5 font-black uppercase">
              <ShieldCheck className="w-4 h-4 text-taskBlack shrink-0" />
              <span>Campus Honor Code Notice</span>
            </div>
            <p className="text-[11px] text-black/80 leading-relaxed">
              TaskMate strictly facilitates legitimate assistance (notes copying, record formatting, diagrams, slide decks, errands). Academic cheating, proxy exams, or unauthorized submissions are strictly prohibited.
            </p>
          </div>

          {/* 11. PUBLISHING SINGLE FINAL ACTION BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <BrutalButton
              type="button"
              variant="white"
              size="md"
              disabled={submitting}
              onClick={() => setConfirmModalOpen(false)}
            >
              <span>EDIT DETAILS</span>
            </BrutalButton>
            <BrutalButton
              type="button"
              variant="yellow"
              size="lg"
              disabled={submitting}
              onClick={handlePublishTask}
            >
              <span>{submitting ? 'PUBLISHING...' : 'PUBLISH TASK NOW →'}</span>
            </BrutalButton>
          </div>
        </div>
      </BrutalModal>
    </div>
  );
}
