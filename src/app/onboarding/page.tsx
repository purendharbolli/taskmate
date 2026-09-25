'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Building2,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Check,
  Sparkles
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { State, City, College } from '@/lib/types';
import clsx from 'clsx';

export default function OnboardingPage() {
  const router = useRouter();

  // Current Step (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cascading Location Data from Database
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  // Selected Values
  const [selectedState, setSelectedState] = useState('st-tg'); // Telangana default
  const [selectedCity, setSelectedCity] = useState('city-hyd'); // Hyderabad default
  const [selectedCollege, setSelectedCollege] = useState('');
  const [collegeSearch, setCollegeSearch] = useState('');

  // Step 3 Profile Info
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 4 Verification Info
  const [collegeEmail, setCollegeEmail] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // College Request Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeWebsite, setNewCollegeWebsite] = useState('');
  const [newCollegeMessage, setNewCollegeMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const availableSkills = [
    'Handwriting',
    'Record Writing',
    'Notes Copying',
    'Diagrams & Charts',
    'PowerPoint',
    'Poster Design',
    'Printing & Binding',
    'Data Entry',
    'Video Editing',
    'Photography',
    'LaTeX Formatting',
    'Campus Errands',
  ];

  // Load States from DB
  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.states) setStates(data.states);
        if (data.cities) setCities(data.cities.filter((c: City) => c.state_id === selectedState));
      })
      .catch((err) => console.error(err));
  }, []);

  // When State Changes -> Query Database for Cities
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setSelectedCollege('');
    fetch(`/api/locations?stateId=${stateId}`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities || []);
      });
  };

  // When City Changes -> Query Database for Colleges belonging to that City
  useEffect(() => {
    if (selectedCity) {
      fetch(`/api/locations?cityId=${selectedCity}`)
        .then((res) => res.json())
        .then((data) => {
          setColleges(data.colleges || []);
          if (data.colleges && data.colleges.length > 0 && !selectedCollege) {
            setSelectedCollege(data.colleges[0].id);
          }
        });
    } else {
      setColleges([]);
    }
  }, [selectedCity]);

  // Toggle Skill Selection
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Submit Step 1
  const handleStep1Next = async () => {
    if (!selectedState || !selectedCity) {
      setError('Please select your state and city.');
      return;
    }
    setError(null);
    setLoading(true);
    await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 2,
        state_id: selectedState,
        city_id: selectedCity,
      }),
    });
    setLoading(false);
    setCurrentStep(2);
  };

  // Submit Step 2
  const handleStep2Next = async () => {
    if (!selectedCollege) {
      setError('Please select your college to continue.');
      return;
    }
    setError(null);
    setLoading(true);
    await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 3,
        college_id: selectedCollege,
      }),
    });
    setLoading(false);
    setCurrentStep(3);
  };

  // Submit Step 3
  const handleStep3Next = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError(null);
    setLoading(true);
    await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 4,
        name: name.trim(),
        bio: bio.trim(),
        skills: selectedSkills,
      }),
    });
    setLoading(false);
    setCurrentStep(4);
  };

  // Submit Step 4 (Verification or Skip)
  const handleFinishOnboarding = async (skipVerification: boolean = false) => {
    setLoading(true);
    setError(null);

    const body: any = {
      complete: true,
    };

    if (!skipVerification && collegeEmail) {
      body.college_email = collegeEmail;
    }

    const res = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setVerificationSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } else {
      setError(data.error || 'Failed to complete profile.');
    }
  };

  // Submit College Addition Request
  const handleRequestCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName) return;

    await fetch('/api/college-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        college_name: newCollegeName,
        city_id: selectedCity,
        website: newCollegeWebsite,
        message: newCollegeMessage,
      }),
    });

    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setRequestModalOpen(false);
      setNewCollegeName('');
    }, 1800);
  };

  // Filtered colleges by search query
  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    c.short_name?.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const selectedCollegeObj = colleges.find((c) => c.id === selectedCollege);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Progress Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <BrutalBadge variant="yellow" size="sm">
            SETUP YOUR CAMPUS ACCOUNT
          </BrutalBadge>
          <span className="text-xs font-black uppercase text-taskBlack/60">
            Step {currentStep} of 4
          </span>
        </div>

        {/* 4-Step Progress Track */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { num: '01', title: 'LOCATION' },
            { num: '02', title: 'COLLEGE' },
            { num: '03', title: 'PROFILE' },
            { num: '04', title: 'VERIFY' },
          ].map((s, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={s.num}
                className={clsx(
                  'brutal-border p-2 text-center transition-all',
                  isCompleted && 'bg-taskGreen/40',
                  isCurrent && 'bg-taskYellow brutal-shadow font-black',
                  stepNum > currentStep && 'bg-white opacity-50'
                )}
              >
                <span className="text-[10px] block font-mono font-black">{s.num}</span>
                <span className="text-xs font-black uppercase tracking-tight block truncate">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white brutal-border brutal-shadow-lg p-6 md:p-8">
        {error && (
          <div className="mb-5 brutal-border bg-taskPink/30 p-3 text-xs font-black text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: LOCATION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Where are you studying?
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                TaskMate is campus-first. Select your state and city to find your college marketplace.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Select State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full brutal-input px-3.5 py-2.5 text-sm font-bold bg-white"
                >
                  <option value="">-- Choose State --</option>
                  {states.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Select City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full brutal-input px-3.5 py-2.5 text-sm font-bold bg-white"
                  disabled={!selectedState}
                >
                  <option value="">-- Choose City --</option>
                  {cities.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] font-semibold text-taskBlack/60 mt-1">
                  Only colleges belonging to this city will be queried dynamically from the database.
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <BrutalButton
                variant="yellow"
                size="lg"
                onClick={handleStep1Next}
                disabled={loading || !selectedCity}
              >
                <span>NEXT: SELECT COLLEGE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 2: COLLEGE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                What&apos;s your college?
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Showing colleges in {cities.find((c) => c.id === selectedCity)?.name || 'your city'}.
              </p>
            </div>

            {/* Search colleges */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search college name or acronym (e.g. SNIST, CBIT)..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="w-full brutal-input px-4 py-2.5 text-sm font-bold"
              />
            </div>

            {/* List of colleges */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredColleges.length === 0 ? (
                <div className="p-6 brutal-border bg-taskOffWhite text-center">
                  <p className="text-sm font-black uppercase text-taskBlack">
                    No colleges match your search.
                  </p>
                  <p className="text-xs text-taskBlack/70 mt-1">
                    Don&apos;t see your college? Request us to add it below!
                  </p>
                </div>
              ) : (
                filteredColleges.map((college) => {
                  const isSelected = selectedCollege === college.id;
                  return (
                    <div
                      key={college.id}
                      onClick={() => setSelectedCollege(college.id)}
                      className={clsx(
                        'brutal-border p-3 cursor-pointer flex items-center justify-between transition-all',
                        isSelected
                          ? 'bg-taskYellow brutal-shadow-sm font-black'
                          : 'bg-white hover:bg-taskOffWhite'
                      )}
                    >
                      <div className="pr-3">
                        <p className="text-sm font-black text-taskBlack">
                          {college.name}
                        </p>
                        <p className="text-[11px] text-taskBlack/70 font-semibold truncate mt-0.5">
                          {college.address}
                        </p>
                      </div>

                      <div
                        className={clsx(
                          'w-6 h-6 brutal-border flex items-center justify-center shrink-0',
                          isSelected ? 'bg-black text-white' : 'bg-white'
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Don't see your college CTA */}
            <div className="p-3 brutal-border bg-taskBlue/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-taskBlack">
                  Don&apos;t see your college listed?
                </p>
                <p className="text-[11px] font-semibold text-taskBlack/70">
                  Submit a request and campus admin will approve it.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRequestModalOpen(true)}
                className="brutal-btn bg-white hover:bg-taskYellow px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ REQUEST TO ADD MY COLLEGE</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <BrutalButton
                variant="white"
                size="md"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>BACK</span>
              </BrutalButton>

              <BrutalButton
                variant="yellow"
                size="lg"
                onClick={handleStep2Next}
                disabled={loading || !selectedCollege}
              >
                <span>NEXT: PROFILE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 3: PROFILE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Set up your student profile
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Tell other students who you are and what skills you can offer on campus.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purii Rao, Rohit Sharma..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full brutal-input px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Short Bio / Major (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 3rd year ECE student. Fast at diagrams, circuit schematics, and lab notebook records."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full brutal-input px-3.5 py-2 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-2">
                  Select Your Skills (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((sk) => {
                    const isSelected = selectedSkills.includes(sk);
                    return (
                      <button
                        type="button"
                        key={sk}
                        onClick={() => toggleSkill(sk)}
                        className={clsx(
                          'brutal-btn text-xs py-1 px-2.5 transition-all',
                          isSelected
                            ? 'bg-taskYellow border-black brutal-shadow-sm font-black'
                            : 'bg-white hover:bg-taskOffWhite opacity-80'
                        )}
                      >
                        {isSelected ? '✓ ' : '+ '} {sk}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <BrutalButton
                variant="white"
                size="md"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>BACK</span>
              </BrutalButton>

              <BrutalButton
                variant="yellow"
                size="lg"
                onClick={handleStep3Next}
                disabled={loading || !name.trim()}
              >
                <span>NEXT: VERIFICATION</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 4: COLLEGE VERIFICATION */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <BrutalBadge variant="green" size="sm" className="mb-2">
                CAMPUS COMMUNITY
              </BrutalBadge>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Want to become a verified student?
              </h2>
              <p className="text-xs font-bold text-taskBlack/70 mt-1">
                Verification helps other students know that you&apos;re part of this campus community.
              </p>
            </div>

            {verificationSuccess ? (
              <div className="p-6 brutal-border bg-taskGreen/30 text-center space-y-2">
                <Check className="w-10 h-10 text-green-700 stroke-[3] mx-auto animate-bounce" />
                <h3 className="text-xl font-black uppercase text-taskBlack">
                  ✓ COLLEGE VERIFIED!
                </h3>
                <p className="text-xs font-bold text-taskBlack/80">
                  Welcome to TaskMate! Redirecting to your campus dashboard...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 brutal-border bg-taskOffWhite space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-taskBlack stroke-[2.5]" />
                    <span className="text-xs font-black uppercase text-taskBlack">
                      Official College Email Verification
                    </span>
                  </div>
                  <p className="text-xs text-taskBlack/70 font-semibold">
                    Enter your official college email address ({selectedCollegeObj?.email_domain ? `@${selectedCollegeObj.email_domain}` : 'institutional domain'}).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    College Email Address
                  </label>
                  <input
                    type="email"
                    placeholder={`e.g. yourname@${selectedCollegeObj?.email_domain || 'college.edu.in'}`}
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    className="w-full brutal-input px-3.5 py-2.5 text-sm font-bold"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleFinishOnboarding(true)}
                    className="text-xs font-black uppercase underline hover:text-black/60 text-center py-2"
                  >
                    Skip for now (Continue as unverified)
                  </button>

                  <BrutalButton
                    variant="yellow"
                    size="lg"
                    onClick={() => handleFinishOnboarding(false)}
                    disabled={loading || !collegeEmail}
                  >
                    <span>VERIFY COLLEGE &amp; ENTER →</span>
                  </BrutalButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* College Request Modal */}
      <BrutalModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="REQUEST TO ADD YOUR COLLEGE"
      >
        {requestSent ? (
          <div className="text-center py-6 space-y-2">
            <Check className="w-8 h-8 text-green-600 stroke-[3] mx-auto" />
            <h4 className="font-black text-base uppercase text-taskBlack">
              Request Submitted to Admin!
            </h4>
            <p className="text-xs text-taskBlack/70 font-semibold">
              Our campus moderator will review and approve your college shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRequestCollegeSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase mb-1">College Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Malla Reddy Engineering College"
                value={newCollegeName}
                onChange={(e) => setNewCollegeName(e.target.value)}
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Official Website (Optional)</label>
              <input
                type="url"
                placeholder="https://collegename.ac.in"
                value={newCollegeWebsite}
                onChange={(e) => setNewCollegeWebsite(e.target.value)}
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Reason / Student Community Message</label>
              <textarea
                rows={2}
                placeholder="Tell us about the student demand on your campus..."
                value={newCollegeMessage}
                onChange={(e) => setNewCollegeMessage(e.target.value)}
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <BrutalButton
                type="button"
                variant="white"
                size="sm"
                onClick={() => setRequestModalOpen(false)}
              >
                CANCEL
              </BrutalButton>
              <BrutalButton type="submit" variant="yellow" size="sm">
                SUBMIT REQUEST →
              </BrutalButton>
            </div>
          </form>
        )}
      </BrutalModal>
    </div>
  );
}
