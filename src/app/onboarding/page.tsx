'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Building2,
  UserCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { State, City, College, Campus } from '@/lib/types';
import clsx from 'clsx';

export default function OnboardingPage() {
  const router = useRouter();

  // 4 Sequential Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cascading Location Hierarchy from Database
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  // Step 1: "Where do you study?"
  const [selectedState, setSelectedState] = useState('st-tg'); // Telangana default
  const [selectedCity, setSelectedCity] = useState('city-hyd'); // Hyderabad default
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('');

  // Step 2: "Tell us about yourself"
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Handwriting',
    'PowerPoint',
  ]);

  // Step 3: "How do you want to use TaskMate?" (Allow both)
  const [needHelp, setNeedHelp] = useState(true);
  const [wantToEarn, setWantToEarn] = useState(true);

  const availableSkills = [
    'Handwriting',
    'Record Writing',
    'Canva',
    'PowerPoint',
    'Diagrams & Charts',
    'Video Editing',
    'Photography',
    'Printing',
    'Scanning',
    'Data Entry',
    'LaTeX Formatting',
    'Campus Errands',
  ];

  // Initial load: Fetch States & Cities from DB
  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.states) setStates(data.states);
        if (data.cities) {
          const defaultCities = data.cities.filter((c: City) => c.state_id === 'st-tg');
          setCities(defaultCities);
        }
      })
      .catch((err) => console.error(err));

    // Also fetch current user to prefill name
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || '');
          setAvatar(data.user.avatar || '');
          if (data.user.onboarding_completed) {
            // Already completed onboarding
            router.push('/dashboard');
          }
        }
      });
  }, [router]);

  // When State Changes -> Fetch Cities
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setSelectedCollege('');
    setSelectedCampus('');
    fetch(`/api/locations?stateId=${stateId}`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities || []);
      });
  };

  // When City Changes -> Fetch Colleges
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
      setSelectedCollege('');
    }
  }, [selectedCity]);

  // When College Changes -> Fetch Campuses
  useEffect(() => {
    if (selectedCollege) {
      fetch(`/api/locations?collegeId=${selectedCollege}`)
        .then((res) => res.json())
        .then((data) => {
          setCampuses(data.campuses || []);
          if (data.campuses && data.campuses.length > 0) {
            setSelectedCampus(data.campuses[0].id);
          }
        });
    } else {
      setCampuses([]);
      setSelectedCampus('');
    }
  }, [selectedCollege]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Navigation handlers
  const handleNextFromStep1 = () => {
    if (!selectedState || !selectedCity || !selectedCollege) {
      setError('Please select your state, city, and college to continue.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleNextFromStep3 = () => {
    if (!needHelp && !wantToEarn) {
      setError('Please select at least one way you would like to use TaskMate.');
      return;
    }
    setError(null);
    setCurrentStep(4);
  };

  // Complete Onboarding (Save permanently to DB)
  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state_id: selectedState,
          city_id: selectedCity,
          college_id: selectedCollege,
          campus_id: selectedCampus,
          name: name.trim(),
          bio: bio.trim(),
          skills: selectedSkills,
          complete: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to save onboarding');
        setLoading(false);
      }
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const selectedCollegeObj = colleges.find((c) => c.id === selectedCollege);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
        {/* Progress Tracker (4 Steps) */}
        <div className="border-b-2 border-black/10 pb-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-taskBlack mb-2">
            <span>Student Onboarding</span>
            <span>Step {currentStep} of 4</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={clsx(
                  'h-2 brutal-border transition-all',
                  stepNum <= currentStep ? 'bg-taskYellow' : 'bg-taskOffWhite'
                )}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="brutal-border bg-taskPink/30 p-3 text-xs font-black text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: "Where do you study?" */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="sticker-tag bg-taskYellow px-2 py-0.5 text-xs font-black uppercase inline-block mb-1">
                LOCATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Where do you study?
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                TaskMate is strictly hyperlocal. Tasks are shown only to students in your area.
              </p>
            </div>

            <div className="space-y-4">
              {/* State Dropdown */}
              <div>
                <label className="block text-xs font-black uppercase mb-1">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block text-xs font-black uppercase mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* College Dropdown */}
              <div>
                <label className="block text-xs font-black uppercase mb-1">College / University</label>
                <select
                  value={selectedCollege}
                  onChange={(e) => setSelectedCollege(e.target.value)}
                  disabled={!selectedCity}
                  className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                >
                  <option value="">Select College</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.short_name || 'Campus'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campus Dropdown */}
              {campuses.length > 0 && (
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Campus</label>
                  <select
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                  >
                    {campuses.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <BrutalButton variant="yellow" size="lg" onClick={handleNextFromStep1}>
                <span>CONTINUE TO PROFILE →</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 2: "Tell us about yourself" */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="sticker-tag bg-taskBlue px-2 py-0.5 text-xs font-black uppercase inline-block mb-1">
                PROFILE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Tell us about yourself
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                Your campus peers will see this profile when you post or apply for tasks.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Reddy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 3rd year CSE student. Neat handwriting and quick with PPT design."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-2">
                  Skills you can help with
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => {
                    const active = selectedSkills.includes(skill);
                    return (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={clsx(
                          'px-3 py-1.5 text-xs font-black uppercase brutal-border transition-all',
                          active
                            ? 'bg-taskYellow brutal-shadow-sm'
                            : 'bg-white text-black/70 hover:bg-taskOffWhite'
                        )}
                      >
                        {active ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-black uppercase text-taskBlack underline hover:text-black/60 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <BrutalButton variant="yellow" size="lg" onClick={handleNextFromStep2}>
                <span>CONTINUE TO INTENT →</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 3: "How do you want to use TaskMate?" */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="sticker-tag bg-taskPink px-2 py-0.5 text-xs font-black uppercase inline-block mb-1">
                PREFERENCES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                How do you want to use TaskMate?
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                You can select both options and switch anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: I Need Help */}
              <div
                onClick={() => setNeedHelp(!needHelp)}
                className={clsx(
                  'p-5 brutal-border cursor-pointer transition-all space-y-2 select-none',
                  needHelp
                    ? 'bg-taskYellow/40 brutal-shadow'
                    : 'bg-white hover:bg-taskOffWhite opacity-80'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🙋</span>
                  <div
                    className={clsx(
                      'w-5 h-5 brutal-border flex items-center justify-center',
                      needHelp ? 'bg-taskBlack text-white' : 'bg-white'
                    )}
                  >
                    {needHelp && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="font-black text-sm uppercase text-taskBlack">I Need Help</h3>
                <p className="text-xs font-bold text-black/70 leading-relaxed">
                  I want to post tasks and get help with records, notes, charts, printing, and errands.
                </p>
              </div>

              {/* Option 2: I Want to Earn */}
              <div
                onClick={() => setWantToEarn(!wantToEarn)}
                className={clsx(
                  'p-5 brutal-border cursor-pointer transition-all space-y-2 select-none',
                  wantToEarn
                    ? 'bg-taskGreen/40 brutal-shadow'
                    : 'bg-white hover:bg-taskOffWhite opacity-80'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💼</span>
                  <div
                    className={clsx(
                      'w-5 h-5 brutal-border flex items-center justify-center',
                      wantToEarn ? 'bg-taskBlack text-white' : 'bg-white'
                    )}
                  >
                    {wantToEarn && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
                <h3 className="font-black text-sm uppercase text-taskBlack">I Want to Earn</h3>
                <p className="text-xs font-bold text-black/70 leading-relaxed">
                  I want to complete tasks for peers in my free time and earn money on campus.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-black uppercase text-taskBlack underline hover:text-black/60 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <BrutalButton variant="yellow" size="lg" onClick={handleNextFromStep3}>
                <span>REVIEW & FINISH →</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 4: "You're ready." */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-taskYellow brutal-border brutal-shadow mx-auto flex items-center justify-center text-3xl">
              🎓
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black uppercase text-taskBlack">
                You&apos;re ready.
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 max-w-md mx-auto">
                Welcome to TaskMate. Your campus marketplace profile has been configured.
              </p>
            </div>

            {/* Profile Confirmation Card */}
            <div className="brutal-border bg-taskOffWhite p-4 max-w-md mx-auto text-left space-y-2">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                <span className="font-black text-sm text-taskBlack">{name}</span>
                <span className="bg-taskYellow px-2 py-0.5 text-[10px] font-black brutal-border">
                  STUDENT
                </span>
              </div>
              <p className="text-xs font-bold text-black/70">
                📍 {selectedCollegeObj?.name || 'Selected Campus'}
              </p>
              <p className="text-[11px] font-bold text-black/60">
                Mode: {needHelp && wantToEarn ? 'Requester & Earner' : needHelp ? 'Requester' : 'Earner'}
              </p>
            </div>

            <div className="pt-4 flex flex-col items-center gap-2">
              <BrutalButton
                variant="yellow"
                size="xl"
                disabled={loading}
                onClick={handleCompleteOnboarding}
                className="w-full max-w-md"
              >
                <span>{loading ? 'SETTING UP...' : 'GO TO TASKMATE →'}</span>
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
