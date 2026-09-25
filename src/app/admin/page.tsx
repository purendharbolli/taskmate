'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  MapPin,
  Building2,
  AlertTriangle,
  Package,
  CreditCard,
  Plus,
  Search,
  Check,
  X,
  FileText,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  Lock,
  Eye
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import {
  User as UserType,
  College,
  City,
  State,
  Dispute,
  VerificationRequest,
  CollegeRequest,
  ModerationReport,
  Order
} from '@/lib/types';
import clsx from 'clsx';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'locations' | 'verification' | 'college-requests' | 'users' | 'disputes' | 'moderation' | 'orders'
  >('overview');

  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<CollegeRequest[]>([]);
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Add College Modal State
  const [addCollegeModal, setAddCollegeModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColShort, setNewColShort] = useState('');
  const [newColCityId, setNewColCityId] = useState('');
  const [newColDomain, setNewColDomain] = useState('');
  const [newColAddress, setNewColAddress] = useState('');

  // Add City Modal State
  const [addCityModal, setAddCityModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityStateId, setNewCityStateId] = useState('st-tg');

  // Search & Filter state for users
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = () => {
    setLoading(true);
    // Metrics
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then((d) => {
        if (d.metrics) setMetrics(d);
      });

    // Users
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setUsers(d.users);
      });

    // Locations
    fetch('/api/locations')
      .then((r) => r.json())
      .then((d) => {
        if (d.colleges) setColleges(d.colleges);
        if (d.cities) {
          setCities(d.cities);
          if (d.cities.length > 0) setNewColCityId(d.cities[0].id);
        }
        if (d.states) setStates(d.states);
      });

    // Verifications
    fetch('/api/verification')
      .then((r) => r.json())
      .then((d) => {
        if (d.requests) setVerifications(d.requests);
      });

    // College Requests
    fetch('/api/college-requests')
      .then((r) => r.json())
      .then((d) => {
        if (d.requests) setCollegeRequests(d.requests);
      });

    // Moderation
    fetch('/api/admin/moderation')
      .then((r) => r.json())
      .then((d) => {
        if (d.reports) setModerationReports(d.reports);
      });

    // Orders & Disputes
    fetch('/api/orders?all=true')
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) {
          setOrders(d.orders);
          const disps = d.orders
            .filter((o: any) => o.dispute)
            .map((o: any) => ({
              ...o.dispute,
              order: o,
              requester: o.requester,
              worker: o.worker,
            }));
          setDisputes(disps);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Admin Action: Add College
  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName || !newColCityId) return;

    await fetch('/api/admin/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'college',
        name: newColName,
        short_name: newColShort || newColName.split(' ')[0],
        city_id: newColCityId,
        email_domain: newColDomain,
        address: newColAddress,
      }),
    });

    setAddCollegeModal(false);
    setNewColName('');
    fetchAdminData();
  };

  // Admin Action: Add City
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName || !newCityStateId) return;

    await fetch('/api/admin/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'city',
        name: newCityName,
        state_id: newCityStateId,
      }),
    });

    setAddCityModal(false);
    setNewCityName('');
    fetchAdminData();
  };

  // Admin Action: Toggle College Active
  const handleToggleCollegeActive = async (collegeId: string) => {
    await fetch('/api/admin/locations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle-active',
        id: collegeId,
      }),
    });
    fetchAdminData();
  };

  // Admin Action: Approve / Reject Student Verification
  const handleReviewVerification = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const notes = prompt(`Enter audit notes for ${status}:`, status === 'APPROVED' ? 'Domain verified' : 'Incomplete proof');
    if (notes === null) return;

    await fetch('/api/verification', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, notes }),
    });
    fetchAdminData();
  };

  // Admin Action: Approve / Reject College Addition Request
  const handleReviewCollegeRequest = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    await fetch('/api/college-requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAdminData();
  };

  // Admin Action: Resolve Dispute
  const handleResolveDispute = async (
    disputeId: string,
    resolution: 'RESOLVED_REQUESTER' | 'RESOLVED_WORKER' | 'DISMISSED'
  ) => {
    const notes = prompt(`Enter resolution audit rationale for ${resolution}:`, 'Evidence reviewed strictly per guidelines');
    if (!notes) return;

    await fetch(`/api/admin/disputes/${disputeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution, notes }),
    });
    fetchAdminData();
  };

  // Admin Action: Toggle User Suspension
  const handleToggleSuspension = async (userId: string, currentStatus: boolean | undefined) => {
    const reason = !currentStatus
      ? prompt('Enter suspension reason (e.g. academic integrity flag / spam):', 'Academic-integrity policy breach')
      : undefined;
    if (!currentStatus && reason === null) return;

    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason }),
    });
    fetchAdminData();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-taskBlack text-white text-[10px] font-mono px-2 py-0.5 font-black uppercase">
              SUPER_ADMIN PORTAL
            </span>
            <span className="text-xs font-bold text-black/60 uppercase">
              Server-Side Role Protection Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack">
            Admin Control Center
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
            Manage users, campus location hierarchy, student verifications, and disputes.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="brutal-btn bg-white hover:bg-taskYellow px-3.5 py-2 text-xs font-black uppercase flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Subnav Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-white brutal-border p-2 brutal-shadow">
        {[
          { id: 'overview', label: 'Dashboard & Metrics', icon: LayoutDashboard },
          { id: 'locations', label: `Locations (${colleges.length})`, icon: MapPin },
          { id: 'verification', label: `Verification (${verifications.filter((v) => v.status === 'PENDING').length})`, icon: ShieldCheck },
          { id: 'college-requests', label: `College Requests (${collegeRequests.filter((c) => c.status === 'PENDING').length})`, icon: Building2 },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'disputes', label: `Disputes (${disputes.length})`, icon: AlertTriangle },
          { id: 'moderation', label: `Moderation (${moderationReports.length})`, icon: FileText },
          { id: 'orders', label: `All Orders (${orders.length})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'px-3.5 py-2 text-xs font-black uppercase flex items-center gap-1.5 transition-all',
                isActive
                  ? 'bg-taskYellow brutal-border text-taskBlack shadow-none'
                  : 'hover:bg-taskOffWhite text-black/70'
              )}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW METRICS & CHARTS */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-taskYellow brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Total Users
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                {metrics.metrics.totalUsers}
              </span>
              <span className="text-[10px] font-bold text-black/70 mt-1 block">
                {metrics.metrics.verifiedStudents} Verified Students
              </span>
            </div>

            <div className="bg-taskBlue/30 brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Active Campuses
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                {metrics.metrics.activeColleges}
              </span>
              <span className="text-[10px] font-bold text-black/70 mt-1 block">
                Across {metrics.metrics.activeCities} Telangana Cities
              </span>
            </div>

            <div className="bg-taskGreen/30 brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Task Volume
              </span>
              <span className="text-3xl font-black text-taskBlack mt-1 block">
                ₹{metrics.metrics.totalVolume}
              </span>
              <span className="text-[10px] font-bold text-black/70 mt-1 block">
                ₹{metrics.metrics.platformRevenue} Platform Revenue
              </span>
            </div>

            <div className="bg-taskPink/30 brutal-border brutal-shadow p-5">
              <span className="text-[10px] font-black uppercase text-black/60 block">
                Open Disputes
              </span>
              <span className="text-3xl font-black text-red-700 mt-1 block">
                {metrics.metrics.openDisputes}
              </span>
              <span className="text-[10px] font-bold text-black/70 mt-1 block">
                {metrics.metrics.pendingVerifications} Pending Verifications
              </span>
            </div>
          </div>

          {/* Visual Distribution Breakdown Charts (Pure Neo-Brutalist CSS/SVG) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <div className="bg-white brutal-border brutal-shadow p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Tasks by Category</span>
                <span className="text-[10px] font-mono text-black/50">LIVE DATABASE</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(metrics.categoryCounts || {}).slice(0, 5).map(([cat, count]: any) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{cat}</span>
                      <span className="font-mono">{count} tasks</span>
                    </div>
                    <div className="w-full bg-taskOffWhite brutal-border h-4">
                      <div
                        className="bg-taskYellow h-full border-r-2 border-black transition-all"
                        style={{ width: `${Math.min(100, (count / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City Distribution */}
            <div className="bg-white brutal-border brutal-shadow p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Tasks by Campus City</span>
                <span className="text-[10px] font-mono text-black/50">HIERARCHY</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(metrics.cityCounts || {}).map(([city, count]: any) => (
                  <div key={city} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{city}</span>
                      <span className="font-mono">{count} tasks</span>
                    </div>
                    <div className="w-full bg-taskOffWhite brutal-border h-4">
                      <div
                        className="bg-taskBlue h-full border-r-2 border-black transition-all"
                        style={{ width: `${Math.min(100, (count / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOCATION MANAGEMENT (Colleges, Cities, Campuses) */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-taskBlack">
                Campus Location Hierarchy
              </h2>
              <p className="text-xs font-bold text-black/60">
                Relational tree: Country → State → City → College → Campus. Database queries only.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <BrutalButton
                variant="white"
                size="sm"
                onClick={() => setAddCityModal(true)}
              >
                + ADD CITY
              </BrutalButton>

              <BrutalButton
                variant="yellow"
                size="sm"
                onClick={() => setAddCollegeModal(true)}
              >
                + ADD COLLEGE
              </BrutalButton>
            </div>
          </div>

          {/* Colleges Table */}
          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">College Name</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Official Email Domain</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-bold">
                {colleges.map((c) => {
                  const city = cities.find((ct) => ct.id === c.city_id);
                  return (
                    <tr key={c.id} className="hover:bg-taskOffWhite">
                      <td className="p-3 font-black text-taskBlack">
                        {c.name}
                        {c.short_name && (
                          <span className="ml-1 text-[10px] font-mono text-black/50">
                            ({c.short_name})
                          </span>
                        )}
                      </td>
                      <td className="p-3">{city?.name || 'Hyderabad'}</td>
                      <td className="p-3 font-mono">@{c.email_domain}</td>
                      <td className="p-3">
                        {c.active ? (
                          <span className="bg-taskGreen px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="bg-gray-200 px-2 py-0.5 brutal-border text-[10px] font-black uppercase opacity-60">
                            INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleCollegeActive(c.id)}
                          className="text-xs font-black uppercase underline hover:text-blue-700"
                        >
                          {c.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT VERIFICATION REQUESTS */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase text-taskBlack">
              Student Institutional Verifications ({verifications.length})
            </h2>
            <p className="text-xs font-bold text-black/60">
              Review institutional email proof and grant verified badges.
            </p>
          </div>

          <div className="space-y-3">
            {verifications.length === 0 ? (
              <p className="text-xs font-bold text-black/60 py-8 text-center bg-white brutal-border">
                No verification requests.
              </p>
            ) : (
              verifications.map((v) => (
                <div
                  key={v.id}
                  className="bg-white brutal-border brutal-shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-base uppercase text-taskBlack">
                        {v.user_name}
                      </span>
                      <BrutalBadge
                        variant={v.status === 'APPROVED' ? 'green' : v.status === 'REJECTED' ? 'pink' : 'yellow'}
                        size="sm"
                      >
                        {v.status}
                      </BrutalBadge>
                    </div>

                    <p className="text-xs font-bold text-black/70">
                      College: <span className="text-taskBlack font-black">{v.college_name}</span> · Email:{' '}
                      <span className="font-mono text-taskBlack">{v.college_email}</span>
                    </p>
                    <span className="text-[10px] text-black/50 font-bold block mt-1">
                      Submitted: {new Date(v.submission_date).toLocaleDateString()}
                    </span>
                  </div>

                  {v.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <BrutalButton
                        variant="pink"
                        size="sm"
                        onClick={() => handleReviewVerification(v.id, 'REJECTED')}
                      >
                        REJECT
                      </BrutalButton>
                      <BrutalButton
                        variant="yellow"
                        size="sm"
                        onClick={() => handleReviewVerification(v.id, 'APPROVED')}
                      >
                        APPROVE ✓
                      </BrutalButton>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: COLLEGE ADDITION REQUESTS */}
      {activeTab === 'college-requests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase text-taskBlack">
              Student College Requests ({collegeRequests.length})
            </h2>
            <p className="text-xs font-bold text-black/60">
              When approved, the college is automatically inserted into the database and selectable by all future students!
            </p>
          </div>

          <div className="space-y-3">
            {collegeRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white brutal-border brutal-shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-base uppercase text-taskBlack">
                      {req.college_name}
                    </span>
                    <BrutalBadge
                      variant={req.status === 'APPROVED' ? 'green' : req.status === 'REJECTED' ? 'pink' : 'yellow'}
                      size="sm"
                    >
                      {req.status}
                    </BrutalBadge>
                  </div>

                  <p className="text-xs font-bold text-black/70">
                    City: {req.city_name} · Requested By: {req.requester_name}
                  </p>
                  {req.message && (
                    <p className="text-xs italic text-black/80 mt-1">
                      &quot;{req.message}&quot;
                    </p>
                  )}
                </div>

                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <BrutalButton
                      variant="pink"
                      size="sm"
                      onClick={() => handleReviewCollegeRequest(req.id, 'REJECTED')}
                    >
                      REJECT
                    </BrutalButton>
                    <BrutalButton
                      variant="yellow"
                      size="sm"
                      onClick={() => handleReviewCollegeRequest(req.id, 'APPROVED')}
                    >
                      APPROVE &amp; CREATE COLLEGE →
                    </BrutalButton>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-taskBlack">
                Campus Student Registry ({users.length})
              </h2>
              <p className="text-xs font-bold text-black/60">
                Audit student reputations, verification flags, and suspension controls.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full brutal-input px-3 py-1.5 text-xs font-bold"
              />
            </div>
          </div>

          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Tasks Done</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-bold">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-taskOffWhite">
                    <td className="p-3">
                      <span className="font-black text-taskBlack block uppercase">{u.name}</span>
                      <span className="text-[10px] text-black/50 font-mono">{u.email}</span>
                    </td>
                    <td className="p-3">{u.college?.short_name || 'SNIST'}</td>
                    <td className="p-3">★ {u.rating}</td>
                    <td className="p-3">{u.completed_tasks}</td>
                    <td className="p-3">
                      {u.is_suspended ? (
                        <span className="bg-red-500 text-white px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                          SUSPENDED
                        </span>
                      ) : u.college_verified ? (
                        <span className="bg-taskGreen px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="bg-yellow-200 px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                          UNVERIFIED
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleSuspension(u.id, u.is_suspended)}
                        className={`text-xs font-black uppercase underline ${
                          u.is_suspended ? 'text-green-700' : 'text-red-600'
                        }`}
                      >
                        {u.is_suspended ? 'Reactivate' : 'Suspend Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DISPUTES RESOLUTION SCREEN (DISPUTE #184) */}
      {activeTab === 'disputes' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase text-taskBlack">
              Dispute Resolution Management ({disputes.length})
            </h2>
            <p className="text-xs font-bold text-black/60">
              Inspect order timestamps, handover OTP status, uploaded photos, and resolve with audit logging.
            </p>
          </div>

          <div className="space-y-4">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-white brutal-border brutal-shadow-lg p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black bg-taskBlack text-white px-2 py-0.5">
                      DISPUTE #{d.id}
                    </span>
                    <BrutalBadge variant="pink" size="sm">
                      {d.reason}
                    </BrutalBadge>
                    <span className="text-xs font-bold text-black/60">
                      Status: {d.status}
                    </span>
                  </div>

                  <span className="text-sm font-black bg-taskYellow px-2.5 py-1 brutal-border">
                    Amount: ₹{(d as any).order?.amount || 380}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                  <div className="p-3 bg-taskOffWhite brutal-border">
                    <span className="text-[10px] text-black/60 uppercase block">Requester</span>
                    <span className="font-black text-sm">{(d as any).requester?.name || 'Requester'}</span>
                  </div>
                  <div className="p-3 bg-taskOffWhite brutal-border">
                    <span className="text-[10px] text-black/60 uppercase block">Worker</span>
                    <span className="font-black text-sm">{(d as any).worker?.name || 'Worker'}</span>
                  </div>
                  <div className="p-3 bg-taskOffWhite brutal-border">
                    <span className="text-[10px] text-black/60 uppercase block">Handover OTP State</span>
                    <span className="font-black text-sm text-green-700">VERIFIED ON CAMPUS</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black/60 mb-1">
                    Student Description of Issue
                  </h4>
                  <div className="p-3 brutal-border bg-taskPink/20 text-xs font-bold leading-relaxed">
                    {d.description}
                  </div>
                </div>

                {/* Evidence preview */}
                {d.evidence_urls && d.evidence_urls.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black/60 mb-1">
                      Uploaded Photo Evidence
                    </h4>
                    <div className="p-2 bg-taskOffWhite brutal-border inline-block">
                      <img
                        src={d.evidence_urls[0]}
                        alt="Evidence"
                        className="w-32 h-24 object-cover brutal-border"
                      />
                    </div>
                  </div>
                )}

                {/* Dispute Actions */}
                {d.status === 'OPEN' && (
                  <div className="pt-3 border-t-2 border-black/10 flex flex-wrap items-center gap-3">
                    <BrutalButton
                      variant="yellow"
                      size="sm"
                      onClick={() => handleResolveDispute(d.id, 'RESOLVED_WORKER')}
                    >
                      <span>RESOLVE IN FAVOR OF WORKER (RELEASE FUNDS)</span>
                    </BrutalButton>

                    <BrutalButton
                      variant="pink"
                      size="sm"
                      onClick={() => handleResolveDispute(d.id, 'RESOLVED_REQUESTER')}
                    >
                      <span>RESOLVE IN FAVOR OF REQUESTER (REFUND)</span>
                    </BrutalButton>

                    <button
                      onClick={() => handleResolveDispute(d.id, 'DISMISSED')}
                      className="text-xs font-black uppercase underline hover:text-black/60"
                    >
                      Dismiss Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: MODERATION REPORTS */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase text-taskBlack">
              Campus Moderation &amp; Academic Integrity Flags ({moderationReports.length})
            </h2>
            <p className="text-xs font-bold text-black/60">
              Community flags regarding cheating, spam, or harassment.
            </p>
          </div>

          <div className="space-y-3">
            {moderationReports.map((rep) => (
              <div key={rep.id} className="bg-white brutal-border brutal-shadow-sm p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-taskBlack text-white px-2 py-0.5">
                      REPORT #{rep.id}
                    </span>
                    <BrutalBadge variant="pink" size="sm">
                      {rep.reason}
                    </BrutalBadge>
                  </div>
                  <span className="text-xs font-mono font-bold">{rep.status}</span>
                </div>

                <p className="text-xs font-bold text-black/80">
                  Reporter: {rep.reporter_name} · Reported User: {rep.reported_user_name || 'N/A'}
                </p>
                <div className="p-2.5 brutal-border bg-taskOffWhite text-xs font-bold">
                  {rep.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ALL ORDERS AUDIT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase text-taskBlack">
              All Campus Orders ({orders.length})
            </h2>
            <p className="text-xs font-bold text-black/60">
              Audit trails, secret OTPs, and payment stages across all users.
            </p>
          </div>

          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Task</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Handover OTP</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-bold">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-taskOffWhite">
                    <td className="p-3 font-mono font-black">{o.id}</td>
                    <td className="p-3 truncate max-w-xs">{(o as any).task?.title || 'Campus Task'}</td>
                    <td className="p-3">₹{o.amount}</td>
                    <td className="p-3">
                      <span className="bg-taskOffWhite px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black">
                      {o.handover_otp || '—'}
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/orders/${o.id}`} className="underline text-blue-700 font-black">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD COLLEGE */}
      <BrutalModal
        isOpen={addCollegeModal}
        onClose={() => setAddCollegeModal(false)}
        title="ADD NEW COLLEGE TO SYSTEM"
      >
        <form onSubmit={handleAddCollege} className="space-y-3">
          <div>
            <label className="block text-xs font-black uppercase mb-1">College Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vardhaman College of Engineering"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Acronym / Short Name</label>
            <input
              type="text"
              placeholder="e.g. VCE"
              value={newColShort}
              onChange={(e) => setNewColShort(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">City *</label>
            <select
              value={newColCityId}
              onChange={(e) => setNewColCityId(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold bg-white"
            >
              {cities.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Official Email Domain</label>
            <input
              type="text"
              placeholder="vardhaman.org"
              value={newColDomain}
              onChange={(e) => setNewColDomain(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">Campus Address</label>
            <input
              type="text"
              placeholder="Shamshabad, Hyderabad"
              value={newColAddress}
              onChange={(e) => setNewColAddress(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={() => setAddCollegeModal(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton type="submit" variant="yellow" size="sm">
              ADD COLLEGE TO DATABASE →
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* MODAL: ADD CITY */}
      <BrutalModal
        isOpen={addCityModal}
        onClose={() => setAddCityModal(false)}
        title="ADD NEW CITY TO HIERARCHY"
      >
        <form onSubmit={handleAddCity} className="space-y-3">
          <div>
            <label className="block text-xs font-black uppercase mb-1">City Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Khammam"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">State *</label>
            <select
              value={newCityStateId}
              onChange={(e) => setNewCityStateId(e.target.value)}
              className="w-full brutal-input px-3 py-2 text-xs font-bold bg-white"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={() => setAddCityModal(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton type="submit" variant="yellow" size="sm">
              CREATE CITY →
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>
    </div>
  );
}
