'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  X,
  Check,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalCard } from '@/components/ui/BrutalCard';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { Category, College } from '@/lib/types';
import clsx from 'clsx';

export default function CreateTaskPage() {
  const router = useRouter();

  // 5 Step Form
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  // Step 1: What do you need?
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('cat-record');
  const [description, setDescription] = useState('');

  // Step 2: Add Material
  const [uploadedFiles, setUploadedFiles] = useState<
    { file_name: string; file_size: string; file_type: string; file_url: string }[]
  >([]);
  const [newFileName, setNewFileName] = useState('');

  // Step 3: Requirements
  const [quantity, setQuantity] = useState('');
  const [deadline, setDeadline] = useState('Tomorrow · 5:00 PM');
  const [location, setLocation] = useState('Campus Library / Canteen');
  const [budget, setBudget] = useState<number>(300);

  // Step 4: Handover
  const [handoverMethod, setHandoverMethod] = useState<'Campus meeting point' | 'Self-arranged delivery' | 'Other'>('Campus meeting point');

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges) setColleges(data.colleges);
      });
  }, []);

  // Quick Material Upload Simulator
  const handleSimulateAddFile = (type: string) => {
    const name = newFileName.trim() || (type === 'pdf' ? 'reference_notes_sample.pdf' : 'experiment_circuit_diagram.png');
    setUploadedFiles((prev) => [
      ...prev,
      {
        file_name: name,
        file_size: '1.8 MB',
        file_type: type === 'pdf' ? 'application/pdf' : 'image/png',
        file_url: '/demo-files/sample.pdf',
      },
    ]);
    setNewFileName('');
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Step Navigations & Validations
  const handleStep1Next = () => {
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe what you need done.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleStep2Next = () => {
    setError(null);
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    if (!budget || budget <= 0) {
      setError('Please specify a fair budget (minimum ₹50).');
      return;
    }
    if (!deadline.trim()) {
      setError('Please enter a completion deadline.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify your campus meeting point.');
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  const handleStep4Next = () => {
    setError(null);
    setCurrentStep(5);
  };

  // Final Step 5 Submit
  const handlePostTaskSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category_id: categoryId,
          description,
          budget,
          quantity,
          deadline,
          location,
          handover_method: handoverMethod,
          files: uploadedFiles,
        }),
      });

      const resData = await res.json();
      setLoading(false);

      if (resData.success) {
        router.push(`/tasks/${resData.task.id}`);
      } else {
        setError(resData.error || 'Failed to post task.');
      }
    } catch (err: any) {
      setError('Network failure.');
      setLoading(false);
    }
  };

  const stepLabels = [
    '01 WHAT',
    '02 MATERIAL',
    '03 DETAILS',
    '04 HANDOVER',
    '05 REVIEW',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Cancel &amp; Back</span>
        </Link>
        <BrutalBadge variant="yellow" size="sm">
          POST A TASK
        </BrutalBadge>
      </div>

      {/* Progress Track */}
      <div className="grid grid-cols-5 gap-1.5 mb-8">
        {stepLabels.map((lbl, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={lbl}
              className={clsx(
                'brutal-border py-2 px-1 text-center transition-all',
                isDone && 'bg-taskGreen/40',
                isCurrent && 'bg-taskYellow brutal-shadow font-black',
                stepNum > currentStep && 'bg-white opacity-40'
              )}
            >
              <span className="text-[11px] font-black uppercase tracking-tight block truncate">
                {lbl}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Form Container */}
      <div className="bg-white brutal-border brutal-shadow-lg p-6 md:p-8 space-y-6">
        {error && (
          <div className="brutal-border bg-taskPink/30 p-3 text-xs font-black text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[3]" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: WHAT DO YOU NEED? */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Step 1 — What do you need?
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Tell nearby students what legitimate assistance you need help with.
              </p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RECORD WRITING — Electronics Lab (35 Pages)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Task Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-xs font-bold bg-white"
              >
                <optgroup label="Academic &amp; Creative (Legitimate Aid)">
                  <option value="cat-record">Record Writing</option>
                  <option value="cat-notes">Notes Copying</option>
                  <option value="cat-diagrams">Diagrams &amp; Charts</option>
                  <option value="cat-ppt">PPT Creation</option>
                  <option value="cat-poster">Poster Design</option>
                </optgroup>
                <optgroup label="Student Services">
                  <option value="cat-print">Printing &amp; Binding</option>
                  <option value="cat-scan">Scanning &amp; Digitizing</option>
                  <option value="cat-format">Formatting &amp; LaTeX</option>
                  <option value="cat-data">Data Entry</option>
                </optgroup>
                <optgroup label="Creative">
                  <option value="cat-thumb">Thumbnail Design</option>
                  <option value="cat-video">Video Editing</option>
                  <option value="cat-photo">Photography</option>
                </optgroup>
                <optgroup label="Campus Help">
                  <option value="cat-errand">Campus Errands</option>
                  <option value="cat-event">Event Assistance</option>
                  <option value="cat-other">Other Assistance</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain what needs to be done, formatting guidelines, handwriting style preferences, or specific experiment numbers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-xs font-bold leading-relaxed"
              />
            </div>

            <AcademicIntegrityBanner />

            <div className="pt-2 flex justify-end">
              <BrutalButton variant="yellow" size="lg" onClick={handleStep1Next}>
                <span>NEXT: ADD MATERIAL</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 2: ADD MATERIAL */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Step 2 — Add Reference Material
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Upload PDFs, photos, or rough notes so the student worker can review before starting.
              </p>
            </div>

            {/* Dropzone Simulation */}
            <div className="brutal-border border-dashed border-3 p-6 text-center bg-taskOffWhite space-y-3">
              <Upload className="w-10 h-10 text-taskBlack stroke-[2.5] mx-auto" />
              <div>
                <p className="text-xs font-black uppercase text-taskBlack">
                  Attach PDF, Images, or Documents
                </p>
                <p className="text-[11px] text-taskBlack/60 font-semibold mt-0.5">
                  Supported formats: PDF, PNG, JPG, DOCX (Max 25 MB)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSimulateAddFile('pdf')}
                  className="brutal-btn bg-white hover:bg-taskYellow px-3 py-1.5 text-xs font-black uppercase"
                >
                  + Attach PDF Document
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAddFile('image')}
                  className="brutal-btn bg-white hover:bg-taskPink px-3 py-1.5 text-xs font-black uppercase"
                >
                  + Attach Image / Photo
                </button>
              </div>
            </div>

            {/* Attached Files List */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-taskBlack/70 block">
                Attached Files ({uploadedFiles.length})
              </span>
              {uploadedFiles.map((f, i) => (
                <div
                  key={i}
                  className="brutal-border p-2.5 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 stroke-[2.5] shrink-0" />
                    <span className="text-xs font-black truncate">{f.file_name}</span>
                    <span className="text-[10px] text-black/50 font-bold uppercase shrink-0">
                      ({f.file_size})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                    title="Remove file"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <BrutalButton variant="white" size="md" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>BACK</span>
              </BrutalButton>

              <BrutalButton variant="yellow" size="lg" onClick={handleStep2Next}>
                <span>NEXT: REQUIREMENTS</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 3: REQUIREMENTS */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Step 3 — Task Requirements
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Define the volume of work, deadline, location, and budget.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Quantity / Pages / Slides
                </label>
                <input
                  type="text"
                  placeholder="e.g. 35 pages, 15 slides, 4 sheets..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full brutal-input px-3.5 py-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Budget (₹) *
                </label>
                <input
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full brutal-input px-3.5 py-2.5 text-sm font-black bg-taskYellow/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Completion Deadline *
              </label>
              <input
                type="text"
                placeholder="e.g. Tomorrow · 5:00 PM, or Friday · 11:00 AM"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-xs font-bold"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Today · 6:00 PM', 'Tomorrow · 5:00 PM', 'In 2 days · 12:00 PM', 'This Weekend'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setDeadline(chip)}
                    className="text-[10px] font-black uppercase px-2 py-0.5 brutal-border bg-white hover:bg-taskYellow"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Preferred Campus Location *
              </label>
              <input
                type="text"
                placeholder="e.g. SNIST · Block C Electronics Lab or CBIT Canteen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full brutal-input px-3.5 py-2.5 text-xs font-bold"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <BrutalButton variant="white" size="md" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>BACK</span>
              </BrutalButton>

              <BrutalButton variant="yellow" size="lg" onClick={handleStep3Next}>
                <span>NEXT: HANDOVER</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 4: HANDOVER */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Step 4 — Handover Method
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                How will you receive your completed work?
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'Campus meeting point',
                  title: 'Campus Meeting Point (Recommended)',
                  desc: 'Meet safely at a library, canteen, or lab lobby. Work is inspected in-person before OTP exchange.',
                },
                {
                  id: 'Self-arranged delivery',
                  title: 'Self-Arranged Digital / Delivery',
                  desc: 'Delivered digitally (PPT, Google Drive, email) or dropped off at your hostel reception.',
                },
                {
                  id: 'Other',
                  title: 'Other Campus Arrangement',
                  desc: 'Custom meeting point or coordination via task messages.',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setHandoverMethod(opt.id as any)}
                  className={clsx(
                    'brutal-border p-4 cursor-pointer transition-all flex items-start gap-3',
                    handoverMethod === opt.id
                      ? 'bg-taskYellow brutal-shadow-sm font-black'
                      : 'bg-white hover:bg-taskOffWhite'
                  )}
                >
                  <div
                    className={clsx(
                      'w-5 h-5 brutal-border mt-0.5 flex items-center justify-center shrink-0',
                      handoverMethod === opt.id ? 'bg-black text-white' : 'bg-white'
                    )}
                  >
                    {handoverMethod === opt.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-black uppercase text-taskBlack">
                      {opt.title}
                    </h4>
                    <p className="text-xs text-taskBlack/70 font-semibold mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 brutal-border bg-taskBlue/20 text-xs font-bold">
              🔒 <strong>Handover OTP Security:</strong> You will receive a secret 4-digit code. Hand it over to the worker ONLY after you inspect the completed work!
            </div>

            <div className="pt-4 flex items-center justify-between">
              <BrutalButton variant="white" size="md" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>BACK</span>
              </BrutalButton>

              <BrutalButton variant="yellow" size="lg" onClick={handleStep4Next}>
                <span>NEXT: REVIEW TASK</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & POST */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <BrutalBadge variant="green" size="sm" className="mb-2">
                FINAL STEP
              </BrutalBadge>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Review Your Task
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Verify the details below before publishing to your campus feed.
              </p>
            </div>

            {/* Task Preview Card */}
            <div className="brutal-border bg-taskOffWhite p-5 space-y-4 brutal-shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-black/20 pb-2">
                <span className="sticker-tag bg-taskYellow text-xs px-2 py-0.5 font-black uppercase">
                  {categoryId.replace('cat-', '').toUpperCase()}
                </span>
                <span className="text-2xl font-black bg-taskYellow px-2.5 py-0.5 brutal-border">
                  ₹{budget}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black uppercase text-taskBlack">
                  {title}
                </h3>
                <p className="text-xs font-bold text-black/70 mt-1 whitespace-pre-wrap">
                  {description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-black">
                <div className="p-2 bg-white brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="p-2 bg-white brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Deadline</span>
                  <span className="text-red-600">{deadline}</span>
                </div>
                <div className="p-2 bg-white brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Location</span>
                  <span className="truncate block">{location}</span>
                </div>
                <div className="p-2 bg-white brutal-border">
                  <span className="text-[10px] text-black/60 block font-semibold">Files</span>
                  <span>{uploadedFiles.length} attached</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <BrutalButton variant="white" size="md" onClick={() => setCurrentStep(4)}>
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>BACK</span>
              </BrutalButton>

              <BrutalButton
                variant="yellow"
                size="xl"
                disabled={loading}
                onClick={handlePostTaskSubmit}
              >
                <span>{loading ? 'POSTING...' : 'POST TASK →'}</span>
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
