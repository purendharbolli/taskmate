'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ShieldCheck,
  Building2,
  Bell,
  Lock,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { User as UserType, College, City } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [skills, setSkills] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name);
          setBio(data.user.bio || '');
          setCollegeId(data.user.college_id || 'col-snist');
          setSkills(data.user.skills?.join(', ') || 'Handwriting, Diagrams, PowerPoint');
        }
        setLoading(false);
      });

    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges) setColleges(data.colleges);
        if (data.cities) setCities(data.cities);
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
    const collegeChanged = collegeId !== user.college_id;

    const res = await fetch('/api/auth/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        bio,
        college_id: collegeId,
        skills: skillsArray,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleLogout = async () => {
    document.cookie = 'taskmate_user_id=; path=/; max-age=0';
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-4" />
        <p className="font-black uppercase text-xs">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <BrutalBadge variant="yellow" size="sm" className="mb-2">
          ACCOUNT PREFERENCES
        </BrutalBadge>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-taskBlack">
          Settings
        </h1>
        <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
          Manage your personal details, campus affiliation, and notification preferences.
        </p>
      </div>

      <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-6">
        {savedSuccess && (
          <div className="brutal-border bg-taskGreen/30 p-3 text-xs font-black text-green-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 stroke-[3]" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Student Profile Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full brutal-input px-3.5 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Registered Email (Private)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full brutal-input px-3.5 py-2 text-xs font-bold bg-gray-100 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Bio / Major</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full brutal-input px-3.5 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Handwriting, Diagrams, PowerPoint, LaTeX..."
                className="w-full brutal-input px-3.5 py-2 text-xs font-bold"
              />
            </div>
          </div>

          {/* Campus Affiliation Section */}
          <div className="space-y-4 pt-4 border-t-2 border-black/10">
            <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Campus Affiliation &amp; Verification</span>
            </h3>

            <div>
              <label className="block text-xs font-black uppercase mb-1">Select College</label>
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full brutal-input px-3.5 py-2 text-xs font-bold bg-white"
              >
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.short_name})
                  </option>
                ))}
              </select>
              <p className="text-[11px] font-semibold text-black/60 mt-1">
                Note: Changing your college will prompt you to verify your institutional email for that campus.
              </p>
            </div>

            <div className="p-3 brutal-border bg-taskOffWhite flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase text-taskBlack">
                  Verification Status
                </span>
                <p className="text-[11px] text-black/70 font-semibold">
                  {user.college_verified ? 'Verified Institutional Email' : 'Unverified Student Account'}
                </p>
              </div>

              {user.college_verified ? (
                <BrutalBadge variant="green" size="sm">
                  ✓ VERIFIED
                </BrutalBadge>
              ) : (
                <Link href="/onboarding">
                  <button className="brutal-btn bg-taskYellow px-2.5 py-1 text-xs font-black uppercase">
                    Verify Now →
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Privacy & Safety Defaults */}
          <div className="space-y-2 pt-4 border-t-2 border-black/10">
            <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Privacy Defaults</span>
            </h3>
            <p className="text-xs font-semibold text-black/70">
              ✓ Email and phone numbers are hidden from other students.<br />
              ✓ Precise residential addresses are never stored or exposed.<br />
              ✓ All task communication happens on campus or via protected task chat.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="brutal-btn bg-white hover:bg-red-50 text-red-600 px-4 py-2.5 text-xs font-black uppercase flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>LOG OUT / SWITCH ACCOUNT</span>
            </button>

            <BrutalButton type="submit" variant="yellow" size="lg">
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>SAVE SETTINGS</span>
            </BrutalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
