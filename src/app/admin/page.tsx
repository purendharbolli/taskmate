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
  Search,
  Check,
  X,
  FileText,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  Trash2,
  AlertCircle,
  ExternalLink,
  Clock,
  ShieldAlert,
  Send,
  Flag,
  UserCheck,
  UserX,
  Info
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
  AuditLog,
  Task,
  Order
} from '@/lib/types';
import clsx from 'clsx';

type AdminTab =
  | 'overview'
  | 'users'
  | 'moderation'
  | 'tasks'
  | 'verification'
  | 'audit-logs'
  | 'disputes'
  | 'locations'
  | 'college-requests'
  | 'orders';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Core Data
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [moderationReports, setModerationReports] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [collegeRequests, setCollegeRequests] = useState<CollegeRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // User Management State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [selectedUserContext, setSelectedUserContext] = useState<any>(null);
  const [inspectUserModalOpen, setInspectUserModalOpen] = useState(false);

  // User Moderation Action Modal
  const [moderateUserModalOpen, setModerateUserModalOpen] = useState(false);
  const [moderatingUser, setModeratingUser] = useState<UserType | null>(null);
  const [moderationAction, setModerationAction] = useState<'warn' | 'block_temp' | 'block_perm' | 'unblock' | 'update_role'>('warn');
  const [moderationReason, setModerationReason] = useState('');
  const [blockDurationDays, setBlockDurationDays] = useState(7);
  const [newSelectedRole, setNewSelectedRole] = useState<'USER' | 'MODERATOR' | 'ADMIN'>('MODERATOR');
  const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

  // Report Management State
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('all');
  const [reportSearch, setReportSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportAdminNotes, setReportAdminNotes] = useState('');
  const [reportNewStatus, setReportNewStatus] = useState<string>('PENDING');

  // Task Management State
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskRemoveModalOpen, setTaskRemoveModalOpen] = useState(false);
  const [taskRemoveReason, setTaskRemoveReason] = useState('');

  // Verification Review State
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationReviewAction, setVerificationReviewAction] = useState<'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_NEEDED'>('APPROVED');
  const [verificationNotes, setVerificationNotes] = useState('');

  // Audit Logs Filter
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTargetFilter, setAuditTargetFilter] = useState('all');

  // Location Modals
  const [addCollegeModal, setAddCollegeModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColShort, setNewColShort] = useState('');
  const [newColCityId, setNewColCityId] = useState('');
  const [newColDomain, setNewColDomain] = useState('');
  const [newColAddress, setNewColAddress] = useState('');
  const [addCityModal, setAddCityModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityStateId, setNewCityStateId] = useState('st-tg');

  const fetchAdminData = () => {
    setLoading(true);

    Promise.all([
      fetch('/api/admin/metrics').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/users').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/tasks').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/moderation').then((r) => r.json()).catch(() => ({})),
      fetch('/api/verification').then((r) => r.json()).catch(() => ({})),
      fetch('/api/admin/audit-logs').then((r) => r.json()).catch(() => ({})),
      fetch('/api/locations').then((r) => r.json()).catch(() => ({})),
      fetch('/api/college-requests').then((r) => r.json()).catch(() => ({})),
      fetch('/api/orders?all=true').then((r) => r.json()).catch(() => ({}))
    ]).then(([m, u, t, mod, v, a, loc, cr, ord]) => {
      if (m.metrics) setMetrics(m);
      if (u.users) setUsers(u.users);
      if (t.tasks) setTasks(t.tasks);
      if (mod.reports) setModerationReports(mod.reports);
      if (v.requests) setVerifications(v.requests);
      if (a.logs) setAuditLogs(a.logs);
      if (loc.colleges) setColleges(loc.colleges);
      if (loc.cities) {
        setCities(loc.cities);
        if (loc.cities.length > 0) setNewColCityId(loc.cities[0].id);
      }
      if (loc.states) setStates(loc.states);
      if (cr.requests) setCollegeRequests(cr.requests);
      if (ord.orders) {
        setOrders(ord.orders);
        const disps = ord.orders
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
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Open User Inspector
  const handleInspectUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`);
      const data = await res.json();
      if (data && data.user) {
        setSelectedUserContext(data);
        setInspectUserModalOpen(true);
      }
    } catch {
      alert('Failed to load user moderation context.');
    }
  };

  // Open Moderation Action Modal
  const handleOpenModerateUser = (user: UserType, action: 'warn' | 'block_temp' | 'block_perm' | 'unblock' | 'update_role') => {
    setModeratingUser(user);
    setModerationAction(action);
    setModerationReason('');
    setBlockDurationDays(7);
    setNewSelectedRole(user.role === 'USER' ? 'MODERATOR' : 'USER');
    setModerateUserModalOpen(true);
  };

  // Submit Moderation Action
  const handleSubmitUserModeration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moderatingUser) return;

    setIsSubmittingModeration(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: moderationAction,
          userId: moderatingUser.id,
          reason: moderationReason,
          durationDays: blockDurationDays,
          newRole: newSelectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Moderation failed');

      setModerateUserModalOpen(false);
      setInspectUserModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Moderation action failed.');
    } finally {
      setIsSubmittingModeration(false);
    }
  };

  // Open Report Review
  const handleOpenReport = (rep: any) => {
    setSelectedReport(rep);
    setReportAdminNotes(rep.admin_notes || '');
    setReportNewStatus(rep.status || 'PENDING');
    setReportModalOpen(true);
  };

  // Update Report Status & Notes
  const handleUpdateReport = async (actionTaken?: string, warnReason?: string) => {
    if (!selectedReport) return;

    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReport.id,
          status: reportNewStatus,
          notes: reportAdminNotes,
          actionTaken,
          warnReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update report');

      setReportModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update report.');
    }
  };

  // Open Task Inspector
  const handleOpenTask = (task: any) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  // Remove / Cancel Task by Moderator
  const handleRemoveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !taskRemoveReason) return;

    try {
      const res = await fetch('/api/admin/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: selectedTask.id,
          reason: taskRemoveReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove task');

      setTaskRemoveModalOpen(false);
      setTaskModalOpen(false);
      setTaskRemoveReason('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove task.');
    }
  };

  const handleOpenVerificationReview = (v: VerificationRequest, defaultAction: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED' | 'ADDITIONAL_INFO_NEEDED') => {
    setSelectedVerification(v);
    const normalizedAction = defaultAction === 'ADDITIONAL_INFO_NEEDED' ? 'ADDITIONAL_INFO_REQUIRED' : defaultAction;
    setVerificationReviewAction(normalizedAction as any);
    setVerificationNotes(
      normalizedAction === 'APPROVED'
        ? 'Student credentials verified by administrator. Verified Profile badge granted.'
        : normalizedAction === 'ADDITIONAL_INFO_REQUIRED'
        ? 'Please provide a clear photo of your student ID card or updated institutional details.'
        : 'Submitted documentation could not be verified.'
    );
    setVerificationModalOpen(true);
  };

  const handleSubmitVerificationReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerification) return;

    try {
      const res = await fetch('/api/verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVerification.id,
          status: verificationReviewAction,
          notes: verificationNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review verification');

      setVerificationModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification request.');
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async (
    disputeId: string,
    resolution: 'RESOLVED_REQUESTER' | 'RESOLVED_WORKER' | 'DISMISSED'
  ) => {
    const notes = prompt(`Enter resolution audit rationale for ${resolution}:`, 'Evidence reviewed per guidelines');
    if (!notes) return;

    await fetch(`/api/admin/disputes/${disputeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution, notes }),
    });
    fetchAdminData();
  };

  // Add College
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

  // Add City
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

  // Filtered Lists
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.nickname && u.nickname.toLowerCase().includes(userSearch.toLowerCase()));

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

    let matchesStatus = true;
    if (userStatusFilter === 'active') matchesStatus = !u.is_suspended;
    if (userStatusFilter === 'suspended') matchesStatus = !!u.is_suspended;
    if (userStatusFilter === 'warned') matchesStatus = (u.warning_count || 0) > 0;
    if (userStatusFilter === 'verified') matchesStatus = u.college_verified;

    return matchesQuery && matchesRole && matchesStatus;
  });

  const filteredReports = moderationReports.filter((r) => {
    const matchesQuery =
      r.reporter_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.reported_user_name?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.reason?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      r.description?.toLowerCase().includes(reportSearch.toLowerCase());

    let matchesStatus = true;
    if (reportStatusFilter === 'PENDING') {
      matchesStatus = r.status === 'PENDING' || r.status === 'OPEN';
    } else if (reportStatusFilter !== 'all') {
      matchesStatus = r.status === reportStatusFilter;
    }

    return matchesQuery && matchesStatus;
  });

  const filteredTasks = tasks.filter((t) => {
    const matchesQuery =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.location.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.requester && t.requester.name.toLowerCase().includes(taskSearch.toLowerCase()));

    const matchesStatus = taskStatusFilter === 'all' || t.status === taskStatusFilter;

    return matchesQuery && matchesStatus;
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    const matchesQuery =
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (l.admin_name && l.admin_name.toLowerCase().includes(auditSearch.toLowerCase())) ||
      (l.target_name && l.target_name.toLowerCase().includes(auditSearch.toLowerCase())) ||
      l.target_id.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesTarget = auditTargetFilter === 'all' || l.target_type === auditTargetFilter;

    return matchesQuery && matchesTarget;
  });

  const pendingReportsCount = moderationReports.filter((r) => r.status === 'PENDING' || r.status === 'OPEN').length;
  const pendingVerificationsCount = verifications.filter((v) => v.status === 'PENDING').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-taskBlack text-white text-[10px] font-mono px-2 py-0.5 font-black uppercase">
              ADMIN CONTROL CENTER
            </span>
            <span className="text-xs font-bold text-black/60 uppercase">
              Protected Route · Role Verified
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-taskBlack">
            TaskMate Moderation &amp; Management
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-0.5">
            Monitor activity, moderate users and tasks, investigate reports, and audit institutional verifications.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="brutal-btn bg-white hover:bg-taskYellow px-3.5 py-2 text-xs font-black uppercase flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-white brutal-border p-2 brutal-shadow">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          {
            id: 'moderation',
            label: `Reports (${pendingReportsCount > 0 ? `${pendingReportsCount} NEW` : moderationReports.length})`,
            icon: Flag,
            badge: pendingReportsCount > 0,
          },
          { id: 'tasks', label: `Tasks (${tasks.length})`, icon: Package },
          {
            id: 'verification',
            label: `Verifications (${pendingVerificationsCount > 0 ? `${pendingVerificationsCount} PENDING` : verifications.length})`,
            icon: ShieldCheck,
            badge: pendingVerificationsCount > 0,
          },
          { id: 'audit-logs', label: `Audit Log (${auditLogs.length})`, icon: Clock },
          { id: 'disputes', label: `Disputes (${disputes.length})`, icon: AlertTriangle },
          { id: 'locations', label: `Campuses (${colleges.length})`, icon: MapPin },
          { id: 'orders', label: `Orders (${orders.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={clsx(
                'px-3.5 py-2 text-xs font-black uppercase flex items-center gap-1.5 transition-all',
                isActive
                  ? 'bg-taskYellow brutal-border text-taskBlack shadow-none'
                  : 'hover:bg-taskOffWhite text-black/70',
                tab.badge && !isActive && 'border-b-2 border-red-500 font-extrabold'
              )}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Action Alerts Banner if pending reports or verifications */}
          {(pendingReportsCount > 0 || pendingVerificationsCount > 0) && (
            <div className="p-4 bg-taskYellow brutal-border brutal-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 stroke-[3] text-taskBlack shrink-0" />
                <div>
                  <h4 className="text-sm font-black uppercase">Moderation Attention Required</h4>
                  <p className="text-xs font-bold text-taskBlack/80">
                    You have <strong className="underline">{pendingReportsCount} pending user reports</strong> and{' '}
                    <strong className="underline">{pendingVerificationsCount} pending student verification requests</strong> awaiting review.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {pendingReportsCount > 0 && (
                  <BrutalButton
                    size="sm"
                    variant="pink"
                    onClick={() => {
                      setReportStatusFilter('PENDING');
                      setActiveTab('moderation');
                    }}
                  >
                    REVIEW REPORTS ({pendingReportsCount})
                  </BrutalButton>
                )}
                {pendingVerificationsCount > 0 && (
                  <BrutalButton
                    size="sm"
                    variant="white"
                    onClick={() => setActiveTab('verification')}
                  >
                    VERIFY STUDENTS ({pendingVerificationsCount})
                  </BrutalButton>
                )}
              </div>
            </div>
          )}

          {/* 7 Core KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="bg-white brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-black/50 block">Total Users</span>
              <span className="text-2xl font-black text-taskBlack mt-1 block">
                {metrics.metrics.totalUsers}
              </span>
              <span className="text-[10px] font-bold text-black/60 block mt-0.5">
                {metrics.metrics.verifiedStudents} verified
              </span>
            </div>

            <div className="bg-taskGreen/20 brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-green-900 block">Active Users</span>
              <span className="text-2xl font-black text-green-950 mt-1 block">
                {metrics.metrics.activeUsers}
              </span>
              <span className="text-[10px] font-bold text-green-900 block mt-0.5">
                {metrics.metrics.suspendedUsers || 0} suspended
              </span>
            </div>

            <div className="bg-taskYellow/30 brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-taskBlack/70 block">Total Tasks</span>
              <span className="text-2xl font-black text-taskBlack mt-1 block">
                {metrics.metrics.totalTasks}
              </span>
              <span className="text-[10px] font-bold text-black/60 block mt-0.5">All time</span>
            </div>

            <div className="bg-taskBlue/30 brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-blue-900 block">Active Tasks</span>
              <span className="text-2xl font-black text-blue-950 mt-1 block">
                {metrics.metrics.activeTasks}
              </span>
              <span className="text-[10px] font-bold text-blue-900 block mt-0.5">Open &amp; In-progress</span>
            </div>

            <div className="bg-taskGreen/30 brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-green-900 block">Completed</span>
              <span className="text-2xl font-black text-green-950 mt-1 block">
                {metrics.metrics.completedTasks}
              </span>
              <span className="text-[10px] font-bold text-green-900 block mt-0.5">Delivered tasks</span>
            </div>

            <div className="bg-taskPink/40 brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-red-900 block">Pending Reports</span>
              <span className="text-2xl font-black text-red-900 mt-1 block">
                {metrics.metrics.pendingReports}
              </span>
              <span className="text-[10px] font-bold text-red-800 block mt-0.5">Awaiting audit</span>
            </div>

            <div className="bg-taskYellow brutal-border brutal-shadow-sm p-4">
              <span className="text-[10px] font-black uppercase text-taskBlack/70 block">Pending Verifs</span>
              <span className="text-2xl font-black text-taskBlack mt-1 block">
                {metrics.metrics.pendingVerifications}
              </span>
              <span className="text-[10px] font-bold text-taskBlack/80 block mt-0.5">Student IDs</span>
            </div>
          </div>

          {/* Visual Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white brutal-border brutal-shadow p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Task Distribution by Category</span>
                <span className="text-[10px] font-mono text-black/50">LIVE</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(metrics.categoryCounts || {}).slice(0, 6).map(([cat, count]: any) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{cat}</span>
                      <span className="font-mono">{count} tasks</span>
                    </div>
                    <div className="w-full bg-taskOffWhite brutal-border h-4">
                      <div
                        className="bg-taskYellow h-full border-r-2 border-black transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, (count / 15) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campus City Distribution */}
            <div className="bg-white brutal-border brutal-shadow p-6 space-y-4">
              <h3 className="text-sm font-black uppercase text-taskBlack border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Tasks by Campus City</span>
                <span className="text-[10px] font-mono text-black/50">LOCATION</span>
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
                        style={{ width: `${Math.min(100, Math.max(10, (count / 15) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT & MODERATION */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white brutal-border p-4 brutal-shadow">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                <input
                  type="text"
                  placeholder="Search student name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full brutal-input pl-8 pr-3 py-1.5 text-xs font-bold"
                />
              </div>

              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="brutal-input px-3 py-1.5 text-xs font-bold bg-white"
              >
                <option value="all">All Roles</option>
                <option value="USER">Student (USER)</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>

              {/* Status filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="brutal-input px-3 py-1.5 text-xs font-bold bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="warned">Has Warnings</option>
                <option value="suspended">Suspended / Blocked</option>
                <option value="verified">Verified Students</option>
              </select>
            </div>

            <span className="text-xs font-black uppercase text-black/60 shrink-0">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>

          {/* Users Table */}
          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Campus / College</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Standing &amp; Warnings</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-bold">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-black/60">
                      No users match the search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-taskOffWhite transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full brutal-border bg-taskYellow shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-taskBlack uppercase">{u.name}</span>
                              {u.nickname && u.nickname !== u.name && (
                                <span className="text-[10px] text-black/50">({u.nickname})</span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-black/60 block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span
                          className={clsx(
                            'px-2 py-0.5 brutal-border text-[10px] font-black uppercase',
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-taskBlack text-white'
                              : u.role === 'ADMIN'
                              ? 'bg-red-500 text-white'
                              : u.role === 'MODERATOR'
                              ? 'bg-taskBlue text-black'
                              : 'bg-taskOffWhite text-black'
                          )}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-black text-taskBlack block">
                          {u.college?.short_name || u.college?.name || 'SNIST'}
                        </span>
                        <span className="text-[10px] text-black/50 font-bold">
                          {u.completed_tasks} tasks · ★ {u.rating.toFixed(1)}
                        </span>
                      </td>

                      <td className="p-3">
                        {u.college_verified ? (
                          <span className="bg-taskGreen px-2 py-0.5 brutal-border text-[10px] font-black uppercase text-taskBlack">
                            ✓ VERIFIED
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-black/70 px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                            UNVERIFIED
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        {u.is_suspended ? (
                          <span className="bg-red-600 text-white px-2 py-0.5 brutal-border text-[10px] font-black uppercase block w-fit">
                            {u.block_status === 'TEMPORARY' ? 'TEMP BLOCKED' : 'PERM BLOCKED'}
                          </span>
                        ) : (u.warning_count || 0) > 0 ? (
                          <span className="bg-orange-300 text-black px-2 py-0.5 brutal-border text-[10px] font-black uppercase block w-fit">
                            ⚠ {u.warning_count} WARNING{u.warning_count! > 1 ? 'S' : ''}
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-900 px-2 py-0.5 brutal-border text-[10px] font-black uppercase block w-fit">
                            ACTIVE
                          </span>
                        )}
                        {u.suspension_reason && (
                          <span className="text-[9px] text-red-600 font-bold truncate max-w-[150px] block mt-0.5">
                            {u.suspension_reason}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspectUser(u.id)}
                            className="text-xs font-black uppercase px-2 py-1 brutal-border bg-white hover:bg-taskYellow"
                            title="Inspect full profile, tasks, and reports"
                          >
                            Inspect
                          </button>

                          <button
                            onClick={() => handleOpenModerateUser(u, 'warn')}
                            className="text-xs font-black uppercase px-2 py-1 brutal-border bg-taskYellow hover:bg-yellow-400"
                            title="Issue official moderator warning"
                          >
                            Warn
                          </button>

                          {u.is_suspended ? (
                            <button
                              onClick={() => handleOpenModerateUser(u, 'unblock')}
                              className="text-xs font-black uppercase px-2 py-1 brutal-border bg-taskGreen text-taskBlack hover:bg-green-300"
                              title="Unblock account"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenModerateUser(u, 'block_temp')}
                              className="text-xs font-black uppercase px-2 py-1 brutal-border bg-taskPink text-taskBlack hover:bg-red-300"
                              title="Temporarily or permanently block user"
                            >
                              Block
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REPORT MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white brutal-border p-4 brutal-shadow">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                <input
                  type="text"
                  placeholder="Search reporter, reported user, reason..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  className="w-full brutal-input pl-8 pr-3 py-1.5 text-xs font-bold"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1">
                {['all', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportStatusFilter(st)}
                    className={clsx(
                      'px-2.5 py-1 text-[11px] font-black uppercase brutal-border transition-all',
                      reportStatusFilter === st
                        ? 'bg-taskYellow text-taskBlack'
                        : 'bg-white hover:bg-taskOffWhite text-black/70'
                    )}
                  >
                    {st === 'all' ? 'All' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-black uppercase text-black/60 shrink-0">
              Showing {filteredReports.length} reports
            </span>
          </div>

          {/* Reports Stream */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center bg-white brutal-border">
                <Check className="w-8 h-8 text-taskGreen mx-auto mb-2" />
                <h3 className="text-sm font-black uppercase">No Reports In Queue</h3>
                <p className="text-xs font-bold text-black/60 mt-1">
                  All community moderation reports have been reviewed.
                </p>
              </div>
            ) : (
              filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  className={clsx(
                    'bg-white brutal-border brutal-shadow p-5 space-y-3 transition-all',
                    (rep.status === 'PENDING' || rep.status === 'OPEN') && 'border-l-8 border-l-red-500'
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-taskBlack text-white px-2 py-0.5">
                        REPORT #{rep.id}
                      </span>
                      <BrutalBadge variant="pink" size="sm">
                        {rep.reason}
                      </BrutalBadge>
                      <span className="text-[10px] text-black/50 font-mono">
                        {new Date(rep.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-[10px] font-black uppercase brutal-border',
                          rep.status === 'RESOLVED'
                            ? 'bg-taskGreen text-taskBlack'
                            : rep.status === 'DISMISSED'
                            ? 'bg-gray-200 text-black/60'
                            : rep.status === 'UNDER_REVIEW'
                            ? 'bg-taskBlue text-taskBlack'
                            : 'bg-red-500 text-white animate-pulse'
                        )}
                      >
                        {rep.status}
                      </span>

                      <BrutalButton
                        size="sm"
                        variant="yellow"
                        onClick={() => handleOpenReport(rep)}
                      >
                        INVESTIGATE &amp; RESOLVE →
                      </BrutalButton>
                    </div>
                  </div>

                  {/* Reporter vs Reported Parties */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-bold">
                    <div className="p-2.5 bg-taskOffWhite brutal-border">
                      <span className="text-[10px] text-black/50 uppercase block font-black">
                        Reported User (Target)
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-sm text-red-700">
                          {rep.reported_user_name || 'N/A'}
                        </span>
                        {rep.reported_user_id && (
                          <Link
                            href={`/profile/${rep.reported_user_id}`}
                            target="_blank"
                            className="text-[10px] underline font-black"
                          >
                            View Profile ↗
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-taskOffWhite brutal-border">
                      <span className="text-[10px] text-black/50 uppercase block font-black">
                        Reporter
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-black text-sm">
                          {rep.reporter_name}
                        </span>
                        <Link
                          href={`/profile/${rep.reporter_id}`}
                          target="_blank"
                          className="text-[10px] underline font-black"
                        >
                          View Profile ↗
                        </Link>
                      </div>
                    </div>

                    <div className="p-2.5 bg-taskOffWhite brutal-border">
                      <span className="text-[10px] text-black/50 uppercase block font-black">
                        Associated Task
                      </span>
                      <span className="font-black text-xs block truncate mt-1">
                        {rep.related_task?.title || rep.related_task_title || rep.related_task_id || 'None specified'}
                      </span>
                    </div>
                  </div>

                  {/* Report Narrative */}
                  <div className="p-3 bg-red-50/50 brutal-border text-xs font-bold leading-relaxed">
                    <span className="text-[10px] uppercase font-black text-red-900 block mb-1">
                      Details Provided by Reporter:
                    </span>
                    {rep.description}
                  </div>

                  {/* Evidence link preview */}
                  {(rep.evidence_link || rep.evidence_url) && (
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-black/60 font-black uppercase text-[10px]">Evidence Proof:</span>
                      <a
                        href={rep.evidence_link || rep.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-700 flex items-center gap-1 font-black"
                      >
                        <span>Open Submitted Evidence Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Admin notes if resolved */}
                  {rep.admin_notes && (
                    <div className="p-2.5 bg-taskYellow/20 brutal-border text-xs font-bold">
                      <span className="text-[10px] uppercase font-black text-black/60 block">
                        Admin Note ({rep.reviewed_by || 'Admin'}):
                      </span>
                      {rep.admin_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TASK MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white brutal-border p-4 brutal-shadow">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                <input
                  type="text"
                  placeholder="Search task title, location, requester..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full brutal-input pl-8 pr-3 py-1.5 text-xs font-bold"
                />
              </div>

              {/* Status filter */}
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="brutal-input px-3 py-1.5 text-xs font-bold bg-white"
              >
                <option value="all">All Task Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED / MODERATED</option>
              </select>
            </div>

            <span className="text-xs font-black uppercase text-black/60 shrink-0">
              Showing {filteredTasks.length} tasks
            </span>
          </div>

          {/* Tasks Table */}
          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">Task Title &amp; Category</th>
                  <th className="p-3">Task Giver (Requester)</th>
                  <th className="p-3">Taskmate (Acceptor)</th>
                  <th className="p-3">Budget</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-bold">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-black/60">
                      No tasks match the filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-taskOffWhite transition-colors">
                      <td className="p-3 max-w-xs">
                        <span className="font-black text-taskBlack block truncate">{t.title}</span>
                        <span className="text-[10px] text-black/60 font-bold">
                          {t.category?.name || 'General'} · {t.location}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-black text-taskBlack block">
                          {t.requester?.name || 'Requester'}
                        </span>
                        <span className="text-[10px] font-mono text-black/50">
                          {t.requester?.email || t.requester_id}
                        </span>
                      </td>

                      <td className="p-3">
                        {t.worker ? (
                          <div>
                            <span className="font-black text-taskBlack block">{t.worker.name}</span>
                            <span className="text-[10px] font-mono text-black/50">{t.worker.email}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-black/50 font-mono">
                            {t.applications_count || 0} applicants (unassigned)
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono font-black">
                        ₹{t.budget}
                      </td>

                      <td className="p-3">
                        <span
                          className={clsx(
                            'px-2 py-0.5 brutal-border text-[10px] font-black uppercase',
                            t.status === 'COMPLETED'
                              ? 'bg-taskGreen text-taskBlack'
                              : t.status === 'CANCELLED'
                              ? 'bg-red-500 text-white'
                              : t.status === 'OPEN'
                              ? 'bg-taskYellow text-taskBlack'
                              : 'bg-taskBlue text-taskBlack'
                          )}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenTask(t)}
                            className="text-xs font-black uppercase px-2 py-1 brutal-border bg-white hover:bg-taskYellow"
                          >
                            Details
                          </button>

                          {t.status !== 'CANCELLED' && t.status !== 'COMPLETED' && (
                            <button
                              onClick={() => {
                                setSelectedTask(t);
                                setTaskRemoveReason('');
                                setTaskRemoveModalOpen(true);
                              }}
                              className="text-xs font-black uppercase px-2 py-1 brutal-border bg-red-100 text-red-700 hover:bg-red-600 hover:text-white"
                              title="Moderate and remove task"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 5: VERIFIED PROFILE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-taskBlack">
                Verified Profile Queue ({verifications.length})
              </h2>
              <p className="text-xs font-bold text-black/60">
                Manually review submitted College ID cards, phone verification, and student credentials. The &quot;Verified Profile&quot; badge is granted strictly after admin approval.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {verifications.length === 0 ? (
              <p className="text-xs font-bold text-black/60 py-8 text-center bg-white brutal-border">
                No verification requests found in queue.
              </p>
            ) : (
              verifications.map((v) => (
                <div
                  key={v.id}
                  className="bg-white brutal-border brutal-shadow p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-base uppercase text-taskBlack">
                        {v.user_name}
                      </span>
                      <BrutalBadge
                        variant={
                          v.status === 'APPROVED'
                            ? 'green'
                            : v.status === 'REJECTED'
                            ? 'pink'
                            : v.status === 'ADDITIONAL_INFO_NEEDED' || v.status === 'ADDITIONAL_INFO_REQUIRED'
                            ? 'blue'
                            : 'yellow'
                        }
                        size="sm"
                      >
                        {v.status === 'ADDITIONAL_INFO_NEEDED' || v.status === 'ADDITIONAL_INFO_REQUIRED'
                          ? 'INFO REQUIRED'
                          : v.status.replace('_', ' ')}
                      </BrutalBadge>
                    </div>

                    <p className="text-xs font-bold text-black/80">
                      College: <span className="text-taskBlack font-black">{v.college_name}</span>
                      {v.student_id_number && (
                        <span> · Roll/ID: <span className="font-mono text-taskBlack font-black">{v.student_id_number}</span></span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-black/70">
                      {v.phone && (
                        <span>
                          Phone: <strong className="font-mono text-taskBlack">{v.phone}</strong> {v.phone_verified ? '✓ (Confirmed)' : ''}
                        </span>
                      )}
                      {v.college_email && (
                        <span>
                          Email: <strong className="font-mono text-taskBlack">{v.college_email}</strong>
                        </span>
                      )}
                    </div>

                    {v.user_notes && (
                      <p className="text-[11px] font-semibold text-black/70 italic bg-taskOffWhite p-1.5 brutal-border">
                        User Notes: &quot;{v.user_notes}&quot;
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-black/50 font-bold pt-1">
                      <span>Submitted: {new Date(v.submission_date).toLocaleDateString()}</span>
                      {v.reviewed_by && (
                        <span>Reviewed by: {v.reviewed_by}</span>
                      )}
                      {v.reviewed_at && (
                        <span>On: {new Date(v.reviewed_at).toLocaleDateString()}</span>
                      )}
                      {v.review_notes && (
                        <span className="text-taskBlack font-black">Decision Notes: &quot;{v.review_notes}&quot;</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Private Document Viewer Button (Strictly accessible by authorized admins) */}
                    {v.document_url && (
                      <a
                        href={v.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-black uppercase px-2.5 py-1.5 brutal-border bg-taskYellow text-black hover:bg-yellow-300 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1"
                        title="Open confidential College ID Card in secure admin viewer"
                      >
                        <span>Inspect ID Card ↗</span>
                      </a>
                    )}

                    <Link
                      href={`/profile/${v.user_id}`}
                      target="_blank"
                      className="text-xs font-black uppercase px-2.5 py-1.5 brutal-border bg-white hover:bg-taskOffWhite"
                    >
                      Profile ↗
                    </Link>

                    <button
                      onClick={() => handleOpenVerificationReview(v, 'ADDITIONAL_INFO_REQUIRED')}
                      className="text-xs font-black uppercase px-2.5 py-1.5 brutal-border bg-taskBlue text-black hover:bg-blue-300"
                    >
                      Request Info
                    </button>

                    <button
                      onClick={() => handleOpenVerificationReview(v, 'REJECTED')}
                      className="text-xs font-black uppercase px-2.5 py-1.5 brutal-border bg-taskPink text-black hover:bg-red-300"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => handleOpenVerificationReview(v, 'APPROVED')}
                      className="text-xs font-black uppercase px-3 py-1.5 brutal-border bg-taskGreen text-taskBlack hover:bg-green-300 shadow-[2px_2px_0px_0px_#000]"
                    >
                      Approve ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white brutal-border p-4 brutal-shadow">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                <input
                  type="text"
                  placeholder="Search actions, admin names, target details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full brutal-input pl-8 pr-3 py-1.5 text-xs font-bold"
                />
              </div>

              {/* Target filter */}
              <select
                value={auditTargetFilter}
                onChange={(e) => setAuditTargetFilter(e.target.value)}
                className="brutal-input px-3 py-1.5 text-xs font-bold bg-white"
              >
                <option value="all">All Targets</option>
                <option value="user">User Actions</option>
                <option value="task">Task Moderation</option>
                <option value="report">Reports</option>
                <option value="verification">Verifications</option>
                <option value="dispute">Disputes</option>
              </select>
            </div>

            <span className="text-xs font-black uppercase text-black/60 shrink-0">
              {filteredAuditLogs.length} audit trail records
            </span>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Admin / Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details / Audit Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10 font-bold">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-black/60">
                      No audit logs match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-taskOffWhite transition-colors">
                      <td className="p-3 font-mono text-[10px] text-black/60 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="p-3">
                        <span className="font-black text-taskBlack block">
                          {log.admin_name || log.user_id}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="bg-taskBlack text-white px-2 py-0.5 font-mono text-[10px] font-black uppercase">
                          {log.action}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="text-[10px] uppercase font-black text-black/60 block">
                          {log.target_type}
                        </span>
                        <span className="font-mono text-xs text-taskBlack">
                          {log.target_name || log.target_id}
                        </span>
                      </td>

                      <td className="p-3 text-black/80 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DISPUTES */}
      {/* ========================================================================= */}
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
            {disputes.length === 0 ? (
              <p className="text-xs font-bold text-black/60 py-8 text-center bg-white brutal-border">
                No active disputes.
              </p>
            ) : (
              disputes.map((d) => (
                <div
                  key={d.id}
                  className="bg-white brutal-border brutal-shadow p-6 space-y-4"
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
                      Order Amount: ₹{(d as any).order?.amount || 0}
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
                      <span className="text-[10px] text-black/60 uppercase block">Handover State</span>
                      <span className="font-black text-sm text-green-700">CAMPUS OTP VERIFIED</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black/60 mb-1">
                      Student Description of Dispute
                    </h4>
                    <div className="p-3 brutal-border bg-taskPink/20 text-xs font-bold leading-relaxed">
                      {d.description}
                    </div>
                  </div>

                  {d.status === 'OPEN' && (
                    <div className="pt-3 border-t-2 border-black/10 flex flex-wrap items-center gap-3">
                      <BrutalButton
                        variant="yellow"
                        size="sm"
                        onClick={() => handleResolveDispute(d.id, 'RESOLVED_WORKER')}
                      >
                        RELEASE TO WORKER
                      </BrutalButton>

                      <BrutalButton
                        variant="pink"
                        size="sm"
                        onClick={() => handleResolveDispute(d.id, 'RESOLVED_REQUESTER')}
                      >
                        REFUND REQUESTER
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
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: LOCATIONS & CAMPUSES */}
      {/* ========================================================================= */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-taskBlack">
                Campus Location Hierarchy ({colleges.length} Colleges)
              </h2>
              <p className="text-xs font-bold text-black/60">
                Relational structure: Country → State → City → College → Campus.
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

          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">College Name</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Official Email Domain</th>
                  <th className="p-3">Status</th>
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
                        <span className="bg-taskGreen px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: ORDERS AUDIT */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black uppercase text-taskBlack">
              All Orders ({orders.length})
            </h2>
            <p className="text-xs font-bold text-black/60">
              Audit trails, OTP verification, and payment stages across all platform orders.
            </p>
          </div>

          <div className="bg-white brutal-border brutal-shadow overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-taskYellow border-b-2 border-black font-black uppercase">
                <tr>
                  <th className="p-3">Order ID</th>
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
                    <td className="p-3">₹{o.amount}</td>
                    <td className="p-3">
                      <span className="bg-taskOffWhite px-2 py-0.5 brutal-border text-[10px] font-black uppercase">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black">{o.handover_otp || '—'}</td>
                    <td className="p-3 text-right">
                      <Link href={`/orders/${o.id}`} className="underline text-blue-700 font-black">
                        View Order →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER INSPECTOR (Full Profile, Task History, Reports) */}
      {/* ========================================================================= */}
      <BrutalModal
        isOpen={inspectUserModalOpen}
        onClose={() => setInspectUserModalOpen(false)}
        title="USER ACCOUNT &amp; MODERATION AUDIT"
      >
        {selectedUserContext && (
          <div className="space-y-6 text-xs font-bold max-h-[80vh] overflow-y-auto pr-1">
            {/* User Profile Header */}
            <div className="flex items-start gap-3 p-3 bg-taskOffWhite brutal-border">
              <img
                src={selectedUserContext.user.avatar}
                alt=""
                className="w-14 h-14 rounded-full brutal-border bg-taskYellow shrink-0"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black uppercase text-taskBlack">
                    {selectedUserContext.user.name}
                  </h3>
                  <span className="bg-taskBlack text-white text-[10px] font-mono px-2 py-0.5">
                    {selectedUserContext.user.role}
                  </span>
                  {selectedUserContext.user.is_suspended && (
                    <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 uppercase">
                      SUSPENDED
                    </span>
                  )}
                </div>
                <p className="text-black/60 font-mono text-[11px]">{selectedUserContext.user.email}</p>
                <div className="flex items-center gap-2 text-[10px] text-black/70 pt-0.5">
                  <span>College: {selectedUserContext.college?.name || 'SNIST'}</span>
                  <span>·</span>
                  <span>Tasks Completed: {selectedUserContext.user.completed_tasks}</span>
                  <span>·</span>
                  <span>Rating: ★ {selectedUserContext.user.rating}</span>
                </div>
              </div>
            </div>

            {/* Account Details authorized for admins */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-white brutal-border">
              <div>
                <span className="text-[10px] text-black/50 uppercase block">User ID</span>
                <span className="font-mono">{selectedUserContext.user.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-black/50 uppercase block">Verified Profile Status</span>
                <span className={selectedUserContext.user.admin_verified ? 'text-blue-700 font-bold' : 'text-black/60'}>
                  {selectedUserContext.user.admin_verified ? 'Verified Profile (Admin Approved)' : 'Not Verified'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-black/50 uppercase block">Registration Date</span>
                <span>{new Date(selectedUserContext.user.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-black/50 uppercase block">Last Login</span>
                <span>
                  {selectedUserContext.user.last_login_at
                    ? new Date(selectedUserContext.user.last_login_at).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Warnings History */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black/70 mb-1 flex items-center justify-between">
                <span>Warnings Issued ({selectedUserContext.user.warnings?.length || 0})</span>
                <button
                  type="button"
                  onClick={() => handleOpenModerateUser(selectedUserContext.user, 'warn')}
                  className="underline text-taskBlack hover:text-red-700"
                >
                  + Issue Warning
                </button>
              </h4>
              <div className="space-y-1.5">
                {(!selectedUserContext.user.warnings || selectedUserContext.user.warnings.length === 0) ? (
                  <p className="text-[11px] text-black/50 p-2 bg-taskOffWhite brutal-border">
                    No warnings have been issued to this student.
                  </p>
                ) : (
                  selectedUserContext.user.warnings.map((w: any) => (
                    <div key={w.id} className="p-2 bg-orange-100 brutal-border text-[11px]">
                      <span className="text-black/60 text-[9px] block">
                        Warned by {w.warned_by} on {new Date(w.created_at).toLocaleDateString()}
                      </span>
                      <span className="font-black text-taskBlack">&quot;{w.reason}&quot;</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Associated Moderation Reports */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black/70 mb-1">
                Reports Filed Against This Profile ({selectedUserContext.reportsAgainst?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {(!selectedUserContext.reportsAgainst || selectedUserContext.reportsAgainst.length === 0) ? (
                  <p className="text-[11px] text-black/50 p-2 bg-taskOffWhite brutal-border">
                    Clean record: No user reports filed against this profile.
                  </p>
                ) : (
                  selectedUserContext.reportsAgainst.map((r: any) => (
                    <div key={r.id} className="p-2 bg-red-50 brutal-border text-[11px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="font-black text-red-800">{r.reason}</span>
                        <span className="font-mono text-[9px] uppercase">{r.status}</span>
                      </div>
                      <p className="text-black/70 italic">&quot;{r.description}&quot;</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Task History Summary */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black/70 mb-1">
                Recent Tasks Posted ({selectedUserContext.postedTasks?.length || 0})
              </h4>
              <div className="space-y-1">
                {selectedUserContext.postedTasks?.slice(0, 3).map((t: any) => (
                  <div key={t.id} className="p-2 bg-white brutal-border flex justify-between text-[11px]">
                    <span className="font-black truncate max-w-[200px]">{t.title}</span>
                    <span className="font-mono">₹{t.budget} · {t.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation Controls Footer */}
            <div className="pt-3 border-t-2 border-black flex flex-wrap items-center justify-end gap-2">
              <BrutalButton
                variant="white"
                size="sm"
                onClick={() => handleOpenModerateUser(selectedUserContext.user, 'update_role')}
              >
                CHANGE ROLE
              </BrutalButton>

              <BrutalButton
                variant="yellow"
                size="sm"
                onClick={() => handleOpenModerateUser(selectedUserContext.user, 'warn')}
              >
                WARN USER
              </BrutalButton>

              {selectedUserContext.user.is_suspended ? (
                <BrutalButton
                  variant="green"
                  size="sm"
                  onClick={() => handleOpenModerateUser(selectedUserContext.user, 'unblock')}
                >
                  UNBLOCK ACCOUNT
                </BrutalButton>
              ) : (
                <>
                  <BrutalButton
                    variant="pink"
                    size="sm"
                    onClick={() => handleOpenModerateUser(selectedUserContext.user, 'block_temp')}
                  >
                    TEMP BLOCK (DAYS)
                  </BrutalButton>
                  <BrutalButton
                    variant="pink"
                    size="sm"
                    onClick={() => handleOpenModerateUser(selectedUserContext.user, 'block_perm')}
                  >
                    PERMANENT BLOCK
                  </BrutalButton>
                </>
              )}
            </div>
          </div>
        )}
      </BrutalModal>

      {/* ========================================================================= */}
      {/* MODAL: EXECUTE USER MODERATION ACTION (Warn, Temp Block, Perm Block, Unblock, Role) */}
      {/* ========================================================================= */}
      <BrutalModal
        isOpen={moderateUserModalOpen}
        onClose={() => setModerateUserModalOpen(false)}
        title={
          moderationAction === 'warn'
            ? `ISSUE OFFICIAL WARNING: ${moderatingUser?.name.toUpperCase()}`
            : moderationAction === 'block_temp'
            ? `TEMPORARY ACCOUNT SUSPENSION: ${moderatingUser?.name.toUpperCase()}`
            : moderationAction === 'block_perm'
            ? `PERMANENT BAN JUSTIFICATION: ${moderatingUser?.name.toUpperCase()}`
            : moderationAction === 'unblock'
            ? `RESTORE ACCOUNT: ${moderatingUser?.name.toUpperCase()}`
            : `CHANGE USER ROLE: ${moderatingUser?.name.toUpperCase()}`
        }
      >
        <form onSubmit={handleSubmitUserModeration} className="space-y-4">
          {moderationAction === 'warn' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Warning Reason / Violation Notice *
              </label>
              <textarea
                required
                rows={3}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="e.g. Inappropriate task posting, unverified academic work submission..."
                className="w-full brutal-input p-2.5 text-xs font-bold resize-none"
              />
              <span className="text-[10px] text-black/50 font-bold block mt-1">
                This warning will be logged to the audit log and delivered via in-app alert to the user.
              </span>
            </div>
          )}

          {moderationAction === 'block_temp' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Suspension Duration *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 7, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setBlockDurationDays(days)}
                      className={clsx(
                        'py-2 brutal-border text-xs font-black',
                        blockDurationDays === days
                          ? 'bg-taskYellow text-taskBlack'
                          : 'bg-white hover:bg-taskOffWhite'
                      )}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">
                  Suspension Rationale *
                </label>
                <textarea
                  required
                  rows={3}
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="e.g. Multiple community reports, repeated policy breach..."
                  className="w-full brutal-input p-2.5 text-xs font-bold resize-none"
                />
              </div>
            </div>
          )}

          {moderationAction === 'block_perm' && (
            <div>
              <div className="p-3 bg-red-100 brutal-border text-xs font-bold text-red-800 mb-3">
                ⚠️ Permanent suspension locks the account permanently. Ensure this is supported by investigation evidence.
              </div>
              <label className="block text-xs font-black uppercase mb-1">
                Permanent Ban Justification *
              </label>
              <textarea
                required
                rows={3}
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="e.g. Confirmed payment scam / fraudulent identity theft..."
                className="w-full brutal-input p-2.5 text-xs font-bold resize-none"
              />
            </div>
          )}

          {moderationAction === 'unblock' && (
            <div className="p-3 bg-green-100 brutal-border text-xs font-bold text-green-900">
              Are you sure you want to lift the suspension for <strong>{moderatingUser?.name}</strong>? Their ability to post tasks, apply, and chat will be restored immediately.
            </div>
          )}

          {moderationAction === 'update_role' && (
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Select New Role *
              </label>
              <select
                value={newSelectedRole}
                onChange={(e) => setNewSelectedRole(e.target.value as any)}
                className="w-full brutal-input p-2.5 text-xs font-bold bg-white"
              >
                <option value="USER">USER (Normal Student)</option>
                <option value="MODERATOR">MODERATOR (Can review reports &amp; verifications)</option>
                <option value="ADMIN">ADMIN (Full management privileges)</option>
              </select>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={() => setModerateUserModalOpen(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton
              type="submit"
              variant={moderationAction === 'unblock' ? 'green' : 'pink'}
              size="sm"
              disabled={isSubmittingModeration}
            >
              {isSubmittingModeration ? 'SAVING...' : 'CONFIRM ACTION →'}
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* ========================================================================= */}
      {/* MODAL: REPORT INVESTIGATION & STATUS UPDATE */}
      {/* ========================================================================= */}
      <BrutalModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={`INVESTIGATE REPORT #${selectedReport?.id}`}
      >
        {selectedReport && (
          <div className="space-y-4 text-xs font-bold max-h-[80vh] overflow-y-auto pr-1">
            {/* Target Parties */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-taskOffWhite brutal-border">
              <div>
                <span className="text-[10px] text-black/50 uppercase block font-black">
                  Reported User
                </span>
                <span className="font-black text-sm text-red-700 block">
                  {selectedReport.reported_user_name || 'N/A'}
                </span>
                {selectedReport.reported_user_id && (
                  <Link
                    href={`/profile/${selectedReport.reported_user_id}`}
                    target="_blank"
                    className="text-[10px] underline"
                  >
                    Open Profile ↗
                  </Link>
                )}
              </div>

              <div>
                <span className="text-[10px] text-black/50 uppercase block font-black">
                  Reporter
                </span>
                <span className="font-black text-sm block">
                  {selectedReport.reporter_name}
                </span>
                <span className="font-mono text-[10px] text-black/50">
                  {selectedReport.reporter_email || selectedReport.reporter_id}
                </span>
              </div>
            </div>

            {/* Reason & Narrative */}
            <div>
              <span className="text-[10px] uppercase font-black text-black/50 block mb-1">
                Reported Reason:
              </span>
              <BrutalBadge variant="pink" size="sm">
                {selectedReport.reason}
              </BrutalBadge>
            </div>

            <div>
              <span className="text-[10px] uppercase font-black text-black/50 block mb-1">
                Description of Violation:
              </span>
              <div className="p-3 bg-red-50 brutal-border leading-relaxed">
                {selectedReport.description}
              </div>
            </div>

            {/* Evidence Link */}
            {(selectedReport.evidence_link || selectedReport.evidence_url) && (
              <div>
                <span className="text-[10px] uppercase font-black text-black/50 block mb-1">
                  Evidence Proof:
                </span>
                <a
                  href={selectedReport.evidence_link || selectedReport.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-taskYellow/20 brutal-border flex items-center justify-between text-blue-700 underline"
                >
                  <span>{selectedReport.evidence_link || selectedReport.evidence_url}</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              </div>
            )}

            {/* Status Switcher */}
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Update Moderation Status:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReportNewStatus(st)}
                    className={clsx(
                      'py-2 brutal-border text-[11px] font-black uppercase',
                      reportNewStatus === st
                        ? 'bg-taskYellow text-taskBlack shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white hover:bg-taskOffWhite'
                    )}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Internal Admin Notes / Investigation Findings:
              </label>
              <textarea
                rows={3}
                value={reportAdminNotes}
                onChange={(e) => setReportAdminNotes(e.target.value)}
                placeholder="Document your findings, decision rationale, or verification with participants..."
                className="w-full brutal-input p-2 text-xs font-bold resize-none"
              />
            </div>

            {/* One-Click Action Shortcuts */}
            {selectedReport.reported_user_id && (
              <div className="p-3 bg-taskOffWhite brutal-border space-y-2">
                <span className="text-[10px] uppercase font-black text-black/60 block">
                  Direct Moderation Actions Against Reported User:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Enter official warning reason to send to user:', `Community flag on ${selectedReport.reason}`);
                      if (reason) handleUpdateReport('warn', reason);
                    }}
                    className="px-2.5 py-1 text-xs font-black uppercase bg-taskYellow brutal-border hover:bg-yellow-400"
                  >
                    Warn Reported User
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <BrutalButton
                type="button"
                variant="white"
                size="sm"
                onClick={() => setReportModalOpen(false)}
              >
                CANCEL
              </BrutalButton>
              <BrutalButton
                type="button"
                variant="yellow"
                size="sm"
                onClick={() => handleUpdateReport('status_update')}
              >
                SAVE STATUS &amp; NOTES →
              </BrutalButton>
            </div>
          </div>
        )}
      </BrutalModal>

      {/* ========================================================================= */}
      {/* MODAL: TASK DETAILS & INSPECTION */}
      {/* ========================================================================= */}
      <BrutalModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="TASK DETAILS &amp; AUDIT"
      >
        {selectedTask && (
          <div className="space-y-4 text-xs font-bold">
            <div className="p-3 bg-taskYellow/30 brutal-border space-y-1">
              <span className="font-mono text-[10px] text-black/50 uppercase">{selectedTask.id}</span>
              <h3 className="text-base font-black uppercase text-taskBlack">{selectedTask.title}</h3>
              <p className="text-black/80">{selectedTask.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-taskOffWhite brutal-border">
                <span className="text-[10px] text-black/50 uppercase block">Budget</span>
                <span className="text-base font-black">₹{selectedTask.budget}</span>
              </div>
              <div className="p-2.5 bg-taskOffWhite brutal-border">
                <span className="text-[10px] text-black/50 uppercase block">Status</span>
                <span className="font-black text-sm">{selectedTask.status}</span>
              </div>
              <div className="p-2.5 bg-taskOffWhite brutal-border">
                <span className="text-[10px] text-black/50 uppercase block">Location</span>
                <span className="font-black truncate block">{selectedTask.location}</span>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-white brutal-border">
              <div>
                <span className="text-[10px] text-black/50 uppercase block font-black">Task Giver</span>
                <span className="font-black text-sm block">{selectedTask.requester?.name || 'N/A'}</span>
                <span className="text-[10px] font-mono text-black/50">{selectedTask.requester?.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-black/50 uppercase block font-black">Taskmate (Worker)</span>
                <span className="font-black text-sm block">{selectedTask.worker?.name || 'Not yet assigned'}</span>
                {selectedTask.worker && (
                  <span className="text-[10px] font-mono text-black/50">{selectedTask.worker.email}</span>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                href={`/tasks/${selectedTask.id}`}
                target="_blank"
                className="text-xs font-black uppercase underline text-blue-700"
              >
                View Public Task Page ↗
              </Link>

              <BrutalButton
                variant="white"
                size="sm"
                onClick={() => setTaskModalOpen(false)}
              >
                CLOSE
              </BrutalButton>
            </div>
          </div>
        )}
      </BrutalModal>

      {/* ========================================================================= */}
      {/* MODAL: REMOVE TASK (Moderator Rationale) */}
      {/* ========================================================================= */}
      <BrutalModal
        isOpen={taskRemoveModalOpen}
        onClose={() => setTaskRemoveModalOpen(false)}
        title="REMOVE / CANCEL TASK"
      >
        <form onSubmit={handleRemoveTask} className="space-y-4">
          <div className="p-3 bg-red-100 brutal-border text-xs font-bold text-red-900">
            Removing this task will mark it CANCELLED, remove it from active campus listings, and notify the task giver with your moderation rationale.
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Moderation Rationale *
            </label>
            <textarea
              required
              rows={3}
              value={taskRemoveReason}
              onChange={(e) => setTaskRemoveReason(e.target.value)}
              placeholder="e.g. Academic cheating policy breach, offensive description, scam request..."
              className="w-full brutal-input p-2.5 text-xs font-bold resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={() => setTaskRemoveModalOpen(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton
              type="submit"
              variant="pink"
              size="sm"
            >
              CONFIRM REMOVAL →
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* ========================================================================= */}
      {/* MODAL: VERIFICATION REVIEW */}
      {/* ========================================================================= */}
      <BrutalModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        title={`REVIEW VERIFICATION: ${selectedVerification?.user_name.toUpperCase()}`}
      >
        <form onSubmit={handleSubmitVerificationReview} className="space-y-4">
          <div className="p-3 bg-taskOffWhite brutal-border text-xs font-bold space-y-1.5">
            <div>User: <strong className="text-taskBlack">{selectedVerification?.user_name}</strong></div>
            <div>College: <strong className="text-taskBlack">{selectedVerification?.college_name}</strong></div>
            {selectedVerification?.student_id_number && (
              <div>Roll / Student ID: <strong className="font-mono text-taskBlack">{selectedVerification.student_id_number}</strong></div>
            )}
            {selectedVerification?.phone && (
              <div>Phone: <strong className="font-mono text-taskBlack">{selectedVerification.phone}</strong> {selectedVerification.phone_verified ? '✓ (Confirmed)' : ''}</div>
            )}
            {selectedVerification?.college_email && (
              <div>Submitted Email: <strong className="font-mono text-taskBlack">{selectedVerification.college_email}</strong></div>
            )}
            {selectedVerification?.user_notes && (
              <div className="p-2 bg-white brutal-border text-[11px] text-taskBlack/85">
                <strong>Applicant Notes:</strong> &quot;{selectedVerification.user_notes}&quot;
              </div>
            )}
            {selectedVerification?.document_url && (
              <div className="pt-2 border-t border-black/20">
                <a
                  href={selectedVerification.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-taskYellow text-taskBlack brutal-border font-black text-xs uppercase hover:bg-yellow-300 shadow-[1.5px_1.5px_0px_0px_#000]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Inspect Submitted College ID Card (Private Admin Document) ↗</span>
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Select Decision:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'APPROVED', label: 'APPROVE VERIFIED PROFILE', color: 'bg-taskGreen' },
                { id: 'ADDITIONAL_INFO_REQUIRED', label: 'REQUEST INFO', color: 'bg-taskBlue' },
                { id: 'REJECTED', label: 'REJECT', color: 'bg-taskPink' },
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setVerificationReviewAction(act.id as any)}
                  className={clsx(
                    'py-2 px-1 brutal-border text-[10px] font-black uppercase text-center',
                    verificationReviewAction === act.id
                      ? `${act.color} text-taskBlack shadow-[2px_2px_0px_0px_#000]`
                      : 'bg-white hover:bg-taskOffWhite'
                  )}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase mb-1">
              Notification &amp; Audit Notes *
            </label>
            <textarea
              required
              rows={3}
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              className="w-full brutal-input p-2.5 text-xs font-bold resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <BrutalButton
              type="button"
              variant="white"
              size="sm"
              onClick={() => setVerificationModalOpen(false)}
            >
              CANCEL
            </BrutalButton>
            <BrutalButton
              type="submit"
              variant="yellow"
              size="sm"
            >
              SUBMIT DECISION →
            </BrutalButton>
          </div>
        </form>
      </BrutalModal>

      {/* ========================================================================= */}
      {/* MODAL: ADD COLLEGE */}
      {/* ========================================================================= */}
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

      {/* ========================================================================= */}
      {/* MODAL: ADD CITY */}
      {/* ========================================================================= */}
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
              placeholder="e.g. Warangal"
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
