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
  AlertCircle,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  User,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { State, City, College } from '@/lib/types';
import { STANDARD_RECOVERY_QUESTIONS } from '@/lib/security';
import clsx from 'clsx';

export default function OnboardingPage() {
  const router = useRouter();

  // Current authenticated user session details
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  // 4 Sequential Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cascading Location Hierarchy from Database
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  // Step 1: "Where do you study?"
  const [selectedState, setSelectedState] = useState('st-tg'); // Telangana default
  const [selectedCity, setSelectedCity] = useState('city-hyd'); // Hyderabad default
  const [selectedArea, setSelectedArea] = useState(''); // Area in city (e.g. Ghatkesar, Uppal)
  const [selectedCollege, setSelectedCollege] = useState(''); // Empty by default!
  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [customCollegeName, setCustomCollegeName] = useState('');

  // Step 2: "Tell us about yourself"
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Handwriting',
    'PowerPoint',
  ]);

  // Step 3: "Account Security & Credentials"
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryQ1, setRecoveryQ1] = useState(STANDARD_RECOVERY_QUESTIONS[0]);
  const [recoveryA1, setRecoveryA1] = useState('');
  const [recoveryQ2, setRecoveryQ2] = useState(STANDARD_RECOVERY_QUESTIONS[1]);
  const [recoveryA2, setRecoveryA2] = useState('');

  // Step 4: "Preferences & Confirmation"
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

  // Initial load: Fetch States, Cities & Areas from DB
  useEffect(() => {
    fetch('/api/locations?cityId=city-hyd')
      .then((res) => res.json())
      .then((data) => {
        if (data.states) setStates(data.states);
        if (data.cities) {
          const defaultCities = data.cities.filter((c: City) => c.state_id === 'st-tg');
          setCities(defaultCities);
        }
        if (data.areas) setAreas(data.areas);
        if (data.colleges) {
          setColleges(data.colleges);
        }
      })
      .catch((err) => console.error(err));

    // Also fetch current user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUserId(data.user.id || '');
          setCurrentUserEmail(data.user.email || '');
          setName(data.user.name || '');
          setNickname(data.user.nickname || data.user.name?.split(' ')[0] || '');
          setAvatar(data.user.avatar || '');
          if (data.user.onboarding_completed) {
            router.push('/dashboard');
          }
        }
      });
  }, [router]);

  // When State Changes -> Fetch Cities
  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setSelectedArea('');
    setSelectedCollege('');
    setIsCustomCollege(false);
    setCustomCollegeName('');
    fetch(`/api/locations?stateId=${stateId}`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data.cities || []);
        setAreas([]);
        setColleges([]);
      });
  };

  // When City Changes -> Fetch Areas & Colleges
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedArea('');
    setSelectedCollege('');
    setIsCustomCollege(false);
    setCustomCollegeName('');
    if (cityId) {
      fetch(`/api/locations?cityId=${cityId}`)
        .then((res) => res.json())
        .then((data) => {
          setAreas(data.areas || []);
          setColleges(data.colleges || []);
        });
    } else {
      setAreas([]);
      setColleges([]);
    }
  };

  // When Area Changes -> Fetch / Filter Colleges
  const handleAreaChange = (area: string) => {
    setSelectedArea(area);
    setSelectedCollege('');
    setIsCustomCollege(false);
    setCustomCollegeName('');
    const query = area
      ? `/api/locations?cityId=${selectedCity}&area=${encodeURIComponent(area)}`
      : `/api/locations?cityId=${selectedCity}`;
    fetch(query)
      .then((res) => res.json())
      .then((data) => {
        setColleges(data.colleges || []);
      });
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Step 1 Validation
  const handleNextFromStep1 = () => {
    if (!selectedState || !selectedCity) {
      setError('Please select your state and city.');
      return;
    }

    if (isCustomCollege) {
      if (!customCollegeName.trim()) {
        setError('Please enter your college name or choose from the list.');
        return;
      }
    } else if (!selectedCollege) {
      setError('Please select your college from the list, or select "Other" to type your college name.');
      return;
    }

    setError(null);
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleNextFromStep2 = () => {
    if (!nickname.trim()) {
      setError('Please enter a campus Nickname / Handle.');
      return;
    }
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  // Step 3 Validation (Password & Recovery Questions)
  const handleNextFromStep3 = () => {
    if (!password || password.length < 6) {
      setError('Please set a password with at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!recoveryQ1 || !recoveryA1.trim()) {
      setError('Please select and answer Security Recovery Question 1.');
      return;
    }
    if (!recoveryQ2 || !recoveryA2.trim()) {
      setError('Please select and answer Security Recovery Question 2.');
      return;
    }
    if (recoveryQ1 === recoveryQ2) {
      setError('Please choose two different recovery questions.');
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
          user_id: currentUserId,
          email: currentUserEmail,
          state_id: selectedState,
          city_id: selectedCity,
          area: selectedArea,
          college_id: isCustomCollege ? 'custom' : selectedCollege,
          custom_college_name: customCollegeName.trim(),
          name: name.trim(),
          nickname: nickname.trim(),
          bio: bio.trim(),
          skills: selectedSkills,
          password: password,
          recovery_questions: [
            { question: recoveryQ1, answer: recoveryA1.trim() },
            { question: recoveryQ2, answer: recoveryA2.trim() },
          ],
          need_help: needHelp,
          want_to_earn: wantToEarn,
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
  const collegeDisplayTitle = isCustomCollege
    ? customCollegeName
    : selectedCollegeObj?.name || 'Your College';

  // Group colleges by category type
  const categoriesList = ['B.Tech / Engineering', 'Degree & PG', 'Pharmacy', 'University & Autonomous'];
  const groupedColleges = categoriesList
    .map((category) => ({
      label: category,
      items: colleges.filter((c) => c.category_type === category),
    }))
    .filter((group) => group.items.length > 0);

  const uncategorizedColleges = colleges.filter(
    (c) => !c.category_type || !categoriesList.includes(c.category_type)
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white brutal-border brutal-shadow-lg p-6 sm:p-10 space-y-6">
        {/* Progress Tracker (4 Steps) */}
        <div className="border-b-2 border-black/10 pb-4">
          <div className="flex items-center justify-between text-xs font-black uppercase text-taskBlack mb-2">
            <span>Student Onboarding Setup</span>
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

        {/* STEP 1: "Where do you study?" (Location & College) */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <span className="sticker-tag bg-taskYellow px-2 py-0.5 text-xs font-black uppercase inline-block mb-1">
                LOCATION &amp; COLLEGE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Where do you study?
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                TaskMate is strictly hyperlocal. Tasks are shown only to students in your area and campus.
              </p>
            </div>

            <div className="space-y-4">
              {/* State & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold bg-white"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    disabled={!selectedState}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold bg-white"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Area in Hyderabad / City Selector */}
              {areas.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black uppercase">
                      Select Area (e.g. Ghatkesar, Uppal, Kukatpally)
                    </label>
                    <span className="text-[10px] font-bold text-black/50">
                      {selectedArea ? 'Filtering by area' : 'All areas shown'}
                    </span>
                  </div>
                  <select
                    value={selectedArea}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold bg-white"
                  >
                    <option value="">-- All Areas in Hyderabad --</option>
                    {areas.map((a) => (
                      <option key={a} value={a}>
                        📍 {a}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* College Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black uppercase">
                    Select College / University
                  </label>
                  <span className="text-[10px] font-bold text-black/50">
                    {colleges.length} colleges available
                  </span>
                </div>

                <select
                  value={isCustomCollege ? 'custom' : selectedCollege}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomCollege(true);
                      setSelectedCollege('custom');
                    } else {
                      setIsCustomCollege(false);
                      setSelectedCollege(e.target.value);
                    }
                  }}
                  disabled={!selectedCity}
                  className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold bg-white"
                >
                  <option value="">-- Select Your College --</option>

                  {groupedColleges.map((group) => (
                    <optgroup key={group.label} label={`── ${group.label.toUpperCase()} ──`}>
                      {group.items.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.area ? `(${c.area})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}

                  {uncategorizedColleges.length > 0 && (
                    <optgroup label="── OTHER COLLEGES ──">
                      {uncategorizedColleges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <option value="custom" className="font-bold text-blue-700">
                    ✏️ Other — Type My College Name...
                  </option>
                </select>
              </div>

              {/* Custom College Input if 'custom' is selected */}
              {isCustomCollege && (
                <div className="p-4 brutal-border bg-taskYellow/20 space-y-2">
                  <label className="block text-xs font-black uppercase text-taskBlack">
                    Enter Your College / University Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Government Degree College, Anurag Pharmacy, etc."
                    value={customCollegeName}
                    onChange={(e) => setCustomCollegeName(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold bg-white"
                  />
                  <p className="text-[11px] text-taskBlack/70 font-semibold">
                    Degree, B.Tech, Pharmacy or University — your college will be added to your campus zone on TaskMate!
                  </p>
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

        {/* STEP 2: "Tell us about yourself" (Nickname, Name, Bio & Skills) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <span className="sticker-tag bg-taskBlue px-2 py-0.5 text-xs font-black uppercase inline-block mb-1">
                PROFILE IDENTITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Set Your Campus Identity
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                Your nickname will be displayed publicly on tasks and peer reviews.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Campus Nickname <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit, Sunny, Spark"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold bg-taskYellow/10"
                  />
                  <p className="text-[11px] text-taskBlack/60 font-semibold mt-1">
                    Public handle shown to campus peers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Full Legal Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohit Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 3rd year student. Available for lab records, diagram charts, and errands around campus."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full brutal-input py-2 px-3 text-xs sm:text-sm font-bold resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1.5">
                  Select Skills You Can Offer
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => {
                    const selected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={clsx(
                          'px-3 py-1 text-xs font-extrabold uppercase brutal-border transition-all select-none',
                          selected
                            ? 'bg-taskYellow brutal-shadow-sm translate-x-[1px] translate-y-[1px]'
                            : 'bg-taskOffWhite hover:bg-white text-black/70'
                        )}
                      >
                        {selected ? '✓ ' : '+ '}
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
                <span>CONTINUE TO SECURITY →</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 3: "Account Security & Credentials" (Password & 2 Recovery Questions) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <span className="sticker-tag bg-taskPink px-2 py-0.5 text-xs font-black uppercase inline-block mb-1">
                SECURITY SETUP
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-taskBlack">
                Password &amp; Recovery Questions
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
                Set a secure password and configure 2 recovery questions for password recovery.
              </p>
            </div>

            <div className="space-y-4">
              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Set Account Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full brutal-input py-2.5 px-3 pr-10 text-xs sm:text-sm font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-taskBlack/60 hover:text-taskBlack"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase mb-1">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full brutal-input py-2.5 px-3 text-xs sm:text-sm font-bold"
                  />
                </div>
              </div>

              {/* Recovery Questions Info */}
              <div className="p-3 brutal-border bg-taskYellow/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-taskBlack uppercase">
                  <KeyRound className="w-4 h-4 text-taskBlack shrink-0" />
                  <span>Password Recovery Questions</span>
                </div>
                <p className="text-[11px] font-bold text-taskBlack/70">
                  These answers are encrypted and hashed. They will only ever be used if you need to recover or reset your password.
                </p>
              </div>

              {/* Question 1 */}
              <div className="space-y-2 p-3.5 brutal-border bg-taskOffWhite">
                <label className="block text-xs font-black uppercase text-taskBlack">
                  Recovery Question 1
                </label>
                <select
                  value={recoveryQ1}
                  onChange={(e) => setRecoveryQ1(e.target.value)}
                  className="w-full brutal-input py-2 px-3 text-xs font-bold bg-white"
                >
                  {STANDARD_RECOVERY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Your answer to Question 1"
                  value={recoveryA1}
                  onChange={(e) => setRecoveryA1(e.target.value)}
                  className="w-full brutal-input py-2 px-3 text-xs sm:text-sm font-bold bg-white"
                />
              </div>

              {/* Question 2 */}
              <div className="space-y-2 p-3.5 brutal-border bg-taskOffWhite">
                <label className="block text-xs font-black uppercase text-taskBlack">
                  Recovery Question 2
                </label>
                <select
                  value={recoveryQ2}
                  onChange={(e) => setRecoveryQ2(e.target.value)}
                  className="w-full brutal-input py-2 px-3 text-xs font-bold bg-white"
                >
                  {STANDARD_RECOVERY_QUESTIONS.map((q) => (
                    <option key={q} value={q} disabled={q === recoveryQ1}>
                      {q}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Your answer to Question 2"
                  value={recoveryA2}
                  onChange={(e) => setRecoveryA2(e.target.value)}
                  className="w-full brutal-input py-2 px-3 text-xs sm:text-sm font-bold bg-white"
                />
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
                <span>REVIEW &amp; CONFIRM →</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* STEP 4: "You're ready." (Confirmation & Final Submit) */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 bg-taskYellow brutal-border brutal-shadow mx-auto flex items-center justify-center text-3xl">
              🎓
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black uppercase text-taskBlack">
                Confirm Your Profile
              </h2>
              <p className="text-xs sm:text-sm font-bold text-black/60 max-w-md mx-auto">
                Welcome to TaskMate! Review your campus profile setup before accessing the dashboard.
              </p>
            </div>

            {/* Profile Confirmation Card */}
            <div className="brutal-border bg-taskOffWhite p-5 max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                <div>
                  <span className="font-black text-base text-taskBlack block">
                    {nickname}
                  </span>
                  <span className="text-[11px] font-bold text-black/60">
                    Public Identity on TaskMate
                  </span>
                </div>
                <span className="bg-taskYellow px-2.5 py-1 text-[10px] font-black brutal-border">
                  VERIFIED PROFILE
                </span>
              </div>

              <div className="text-xs font-bold text-black/80 space-y-1">
                <p>
                  📍 <strong>Campus:</strong> {collegeDisplayTitle}
                  {selectedArea ? ` · ${selectedArea}` : ''}
                </p>
                <p>
                  🏙️ <strong>City:</strong> Hyderabad, Telangana
                </p>
                <p>
                  🔒 <strong>Security:</strong> Password Protected &amp; 2 Recovery Questions Saved
                </p>
              </div>

              <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-bold text-black/70">
                <span>Privacy: Password &amp; answers never displayed</span>
                <ShieldCheck className="w-4 h-4 text-taskGreen stroke-[3]" />
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-2">
              <BrutalButton
                variant="yellow"
                size="xl"
                disabled={loading}
                onClick={handleCompleteOnboarding}
                className="w-full max-w-md"
              >
                <span>{loading ? 'SETTING UP ACCOUNT...' : 'GO TO TASKMATE →'}</span>
              </BrutalButton>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-xs font-black uppercase text-taskBlack underline hover:text-black/60 flex items-center gap-1 pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Security Step</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
