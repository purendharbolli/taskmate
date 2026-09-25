'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  Lock,
  Clock,
  Sparkles,
  HelpCircle,
  FileText,
  CreditCard,
  Star
} from 'lucide-react';
import { StatusTimeline } from '@/components/StatusTimeline';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { BrutalModal } from '@/components/ui/BrutalModal';
import { AcademicIntegrityBanner } from '@/components/AcademicIntegrityBanner';
import { Order, Task, User, Message, Dispute, Review } from '@/lib/types';
import clsx from 'clsx';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [requester, setRequester] = useState<User | null>(null);
  const [worker, setWorker] = useState<User | null>(null);
  const [isRequester, setIsRequester] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Entry State (for Worker)
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Dispute Modal State
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState<Dispute['reason']>('Work not received');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Super neat handwriting, delivered right on time!');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Chat Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchOrderData = () => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data.order);
          setTask(data.order.task);
          setRequester(data.order.requester);
          setWorker(data.order.worker);
          setIsRequester(data.isRequester);
          setIsWorker(data.isWorker);
          setIsAdmin(data.isAdmin);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load order');
        setLoading(false);
      });

    // Fetch chat messages
    fetch(`/api/messages?orderId=${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      });
  };

  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  // Action 1: Pay & Lock in Vault (Requester)
  const handleSimulatePayment = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: 'UPI / TaskMate Vault' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrderData();
      } else {
        alert(data.error || 'Payment failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 2: Mark Task Ready for Handover (Worker)
  const handleMarkReady = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/ready`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        fetchOrderData();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 3: Verify Handover OTP (Worker enters code received from Requester on campus)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!enteredOtp || enteredOtp.length !== 4) {
      setOtpError('Please enter a 4-digit OTP code.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: enteredOtp }),
      });
      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setOtpSuccess(true);
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        setTimeout(() => {
          setOtpSuccess(false);
          fetchOrderData();
        }, 1800);
      } else {
        setOtpError(data.error || 'Incorrect OTP code.');
      }
    } catch (err) {
      setOtpError('Verification failed.');
      setActionLoading(false);
    }
  };

  // Action 4: Requester Approves & Releases Payment
  const handleCompleteOrder = async () => {
    if (!confirm('Confirm receipt of your completed work and release payment to the worker?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        fetchOrderData();
        setReviewModalOpen(true);
      } else {
        alert(data.error || 'Error completing order');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  // Action 5: Submit Dispute
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: disputeReason,
          description: disputeDescription,
          evidence_urls: [
            'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&auto=format&fit=crop&q=60',
          ],
        }),
      });

      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setDisputeSubmitted(true);
        setTimeout(() => {
          setDisputeSubmitted(false);
          setDisputeModalOpen(false);
          fetchOrderData();
        }, 1500);
      } else {
        alert(data.error || 'Failed to submit dispute');
      }
    } catch (err) {
      alert('Network error');
      setActionLoading(false);
    }
  };

  // Action 6: Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: reviewComment }),
      });
      const data = await res.json();
      setActionLoading(false);

      if (data.success) {
        setReviewSubmitted(true);
        setTimeout(() => {
          setReviewSubmitted(false);
          setReviewModalOpen(false);
          fetchOrderData();
        }, 1500);
      }
    } catch (err) {
      setActionLoading(false);
    }
  };

  // Action 7: Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, message: text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 brutal-border bg-taskYellow animate-spin mx-auto mb-4" />
        <p className="font-black uppercase text-sm">Loading Order Details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="brutal-border bg-white brutal-shadow-lg p-8 space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto stroke-[2.5]" />
          <h2 className="text-2xl font-black uppercase">Order Not Found</h2>
          <p className="text-xs font-bold text-black/70">{error}</p>
          <Link href="/orders">
            <BrutalButton variant="yellow" size="md">
              <span>← BACK TO ORDERS</span>
            </BrutalButton>
          </Link>
        </div>
      </div>
    );
  }

  const isReady = order.status === 'READY_FOR_HANDOVER';
  const isDelivered = order.status === 'DELIVERED';
  const isCompleted = order.status === 'PAYMENT_RELEASED';
  const isDispute = order.status === 'DISPUTE_OPEN' || order.status === 'UNDER_REVIEW';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to All Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black uppercase bg-taskBlack text-white px-2 py-0.5">
            ORDER #{order.id}
          </span>
          <span className="text-xs font-bold text-black/60">
            Created {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Main Order Container */}
      <div className="space-y-8">
        {/* Status Timeline Component */}
        <div className="bg-white brutal-border brutal-shadow-lg p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black uppercase text-taskBlack flex items-center gap-2">
              <Clock className="w-5 h-5 stroke-[2.5]" />
              <span>Order Lifecycle Status</span>
            </h2>
            <span className="text-xs font-mono font-bold uppercase bg-taskYellow px-2 py-0.5 brutal-border">
              {order.status}
            </span>
          </div>

          <StatusTimeline status={order.status} />
        </div>

        {/* Dynamic Action Banner / OTP Card */}
        {/* CASE 1: Payment Pending */}
        {order.status === 'PAYMENT_PENDING' && (
          <div className="bg-taskYellow brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 stroke-[3]" />
              <h3 className="text-xl sm:text-2xl font-black uppercase text-taskBlack">
                TASK PAYMENT
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-bold text-taskBlack/80 leading-relaxed max-w-xl">
              Review the order total below. Once you continue to payment, the funds are held securely until you inspect the work in person on campus.
            </p>

            <div className="bg-white brutal-border p-4 max-w-md space-y-2 text-xs font-black">
              <div className="flex justify-between">
                <span>Task Price:</span>
                <span>₹{order.amount}</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Platform Fee:</span>
                <span>₹{order.platform_fee}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-black text-sm">
                <span>Total:</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>

            <div className="pt-2">
              <BrutalButton
                variant="white"
                size="xl"
                disabled={actionLoading}
                onClick={handleSimulatePayment}
              >
                <CreditCard className="w-5 h-5 stroke-[2.5]" />
                <span>CONTINUE TO PAYMENT →</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* CASE 2: Work In Progress */}
        {order.status === 'WORK_IN_PROGRESS' && (
          <div className="bg-taskBlue/30 brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <BrutalBadge variant="blue" size="sm" className="mb-1">
                  PAYMENT SECURED
                </BrutalBadge>
                <h3 className="text-xl sm:text-2xl font-black uppercase text-taskBlack">
                  Work In Progress
                </h3>
              </div>
              <span className="text-2xl font-black bg-white px-3 py-1 brutal-border">
                ₹{order.amount}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-taskBlack/80 leading-relaxed">
              Your payment of ₹{order.amount} is secured in the TaskMate vault. The student worker is currently completing the task.
            </p>

            {/* Worker Action: Mark As Ready */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <BrutalButton
                variant="yellow"
                size="lg"
                disabled={actionLoading}
                onClick={handleMarkReady}
              >
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                <span>MARK AS READY FOR HANDOVER →</span>
              </BrutalButton>

              <span className="text-xs font-bold text-black/60 italic">
                (Worker clicks when ready to meet on campus)
              </span>
            </div>
          </div>
        )}

        {/* CASE 3: Ready for Handover — THE OTP VERIFICATION SYSTEM */}
        {isReady && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Requester's Secret OTP Card */}
            <div className="bg-taskYellow brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound className="w-6 h-6 stroke-[3]" />
                  <BrutalBadge variant="pink" size="sm">
                    CONFIDENTIAL OTP
                  </BrutalBadge>
                </div>

                <h3 className="text-2xl font-black uppercase text-taskBlack">
                  Your Handover OTP
                </h3>

                {/* Secret OTP Display */}
                {order.handover_otp ? (
                  <div className="my-4 p-5 bg-white brutal-border brutal-shadow text-center">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-widest text-taskBlack">
                      {order.handover_otp}
                    </span>
                    <span className="block text-[11px] font-black uppercase text-black/60 mt-1">
                      4-DIGIT VERIFICATION CODE
                    </span>
                  </div>
                ) : (
                  <div className="my-4 p-4 bg-white/70 brutal-border text-center text-xs font-bold">
                    •••• (Visible only to the requester on their device)
                  </div>
                )}

                <div className="p-3 brutal-border bg-white text-xs font-bold text-taskBlack space-y-1">
                  <p className="font-black uppercase text-red-600">
                    ⚠️ IMPORTANT HANDOVER RULE:
                  </p>
                  <p>
                    Give this OTP to the worker <strong>ONLY AFTER</strong> you inspect and receive your completed work on campus.
                  </p>
                </div>
              </div>

              <p className="text-[11px] font-bold text-black/60">
                Location: {task?.location || 'Campus Meeting Point'}
              </p>
            </div>

            {/* Worker's OTP Entry & Verification Card */}
            <div className="bg-white brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-6 h-6 stroke-[3]" />
                  <BrutalBadge variant="green" size="sm">
                    CAMPUS HANDOVER
                  </BrutalBadge>
                </div>

                <h3 className="text-2xl font-black uppercase text-taskBlack">
                  ENTER HANDOVER OTP
                </h3>

                <p className="text-xs font-bold text-taskBlack/70 mt-1 leading-relaxed">
                  Worker: Meet the requester in person on campus. Ask them for their 4-digit code once you hand over the completed work.
                </p>

                {otpSuccess ? (
                  <div className="my-4 p-6 brutal-border bg-taskGreen/40 text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-green-700 stroke-[3] mx-auto animate-bounce" />
                    <h4 className="text-xl font-black uppercase text-taskBlack">
                      DELIVERY CONFIRMED ✓
                    </h4>
                    <p className="text-xs font-bold text-black/80">
                      Handover timestamp and order verification recorded!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="my-4 space-y-3">
                    {otpError && (
                      <div className="p-2.5 brutal-border bg-taskPink/30 text-xs font-black text-red-700">
                        ⚠️ {otpError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-black uppercase mb-1">
                        4-Digit Code from Requester
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 5832"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value.trim())}
                        className="w-full brutal-input px-4 py-3 text-2xl font-mono font-black text-center tracking-widest bg-taskOffWhite"
                      />
                    </div>

                    <BrutalButton
                      type="submit"
                      variant="yellow"
                      fullWidth
                      size="lg"
                      disabled={actionLoading || enteredOtp.length !== 4}
                    >
                      <span>{actionLoading ? 'VERIFYING...' : 'VERIFY OTP & CONFIRM DELIVERY →'}</span>
                    </BrutalButton>
                  </form>
                )}
              </div>

              <div className="text-[11px] font-bold text-black/50">
                Verified handovers automatically move the order into the 24-hour review window.
              </div>
            </div>
          </div>
        )}

        {/* CASE 4: Delivered — Requester Review Window */}
        {isDelivered && (
          <div className="bg-taskGreen/20 brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <BrutalBadge variant="green" size="sm" className="mb-1">
                  DELIVERY CONFIRMED ✓
                </BrutalBadge>
                <h3 className="text-2xl font-black uppercase text-taskBlack">
                  Did you receive your work?
                </h3>
              </div>
              <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 brutal-border">
                24H DISPUTE WINDOW OPEN
              </span>
            </div>

            <p className="text-xs sm:text-sm font-bold text-taskBlack/80 leading-relaxed max-w-2xl">
              The OTP was confirmed on campus. Please review the finished handwriting, diagrams, or material. If everything is satisfactory, click complete to release payment to the student worker!
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <BrutalButton
                variant="yellow"
                size="lg"
                disabled={actionLoading}
                onClick={handleCompleteOrder}
              >
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                <span>YES — COMPLETE ORDER &amp; RELEASE PAYMENT</span>
              </BrutalButton>

              <button
                type="button"
                onClick={() => setDisputeModalOpen(true)}
                className="brutal-btn bg-white hover:bg-taskPink px-4 py-3 text-xs font-black uppercase flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 stroke-[3] text-red-600" />
                <span>REPORT A PROBLEM</span>
              </button>
            </div>
          </div>
        )}

        {/* CASE 5: Payment Released / Completed */}
        {isCompleted && (
          <div className="bg-taskYellow brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 stroke-[3]" />
              <h3 className="text-2xl font-black uppercase text-taskBlack">
                PAYMENT RELEASED! ORDER COMPLETED 🎉
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-bold text-taskBlack/80">
              ₹{order.amount} has been credited to the worker&apos;s available balance. Both students completed this legitimate campus task safely!
            </p>
            <div className="pt-2">
              <BrutalButton
                variant="white"
                size="md"
                onClick={() => setReviewModalOpen(true)}
              >
                <Star className="w-4 h-4 stroke-[2.5]" />
                <span>LEAVE / UPDATE STAR REVIEW</span>
              </BrutalButton>
            </div>
          </div>
        )}

        {/* CASE 6: Dispute Open */}
        {isDispute && (
          <div className="bg-taskPink/30 brutal-border brutal-shadow-lg p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-6 h-6 stroke-[3]" />
              <h3 className="text-2xl font-black uppercase">
                DISPUTE UNDER ADMIN REVIEW
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-bold text-taskBlack/80">
              A problem was reported on this order. Campus moderators are reviewing evidence, timestamps, and messages. Funds remain safely secured in escrow.
            </p>
            <Link href="/admin">
              <button className="text-xs font-black uppercase underline hover:text-purple-900 mt-2 block">
                Campus Admin Review Portal →
              </button>
            </Link>
          </div>
        )}

        {/* Order Details & Peer Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Task & Handover Audit Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white brutal-border brutal-shadow p-6 space-y-4">
              <h3 className="text-base font-black uppercase text-taskBlack border-b-2 border-black pb-2">
                Order Specifications
              </h3>

              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase text-taskBlack">
                  {task?.title || 'Campus Task'}
                </h4>
                <p className="text-xs font-bold text-black/70 leading-relaxed whitespace-pre-wrap">
                  {task?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-black pt-2">
                <div className="p-2.5 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 uppercase block font-semibold">
                    Task Price
                  </span>
                  <span>₹{order.amount}</span>
                </div>
                <div className="p-2.5 bg-taskOffWhite brutal-border">
                  <span className="text-[10px] text-black/60 uppercase block font-semibold">
                    Meeting Location
                  </span>
                  <span className="truncate block">{task?.location}</span>
                </div>
              </div>

              {/* Handover Audit Record */}
              <div className="pt-3 border-t-2 border-black/10">
                <span className="text-[10px] font-black uppercase tracking-wider text-black/50 block mb-1">
                  Handover Verification Record
                </span>
                <div className="text-xs font-mono font-bold text-black/70 space-y-0.5">
                  <p>Order ID: {order.id}</p>
                  <p>Requester ID: {order.requester_id}</p>
                  <p>Worker ID: {order.worker_id}</p>
                  <p>Handover Status: {order.handover_otp ? 'GENERATED' : 'PENDING'}</p>
                  {order.delivered_at && <p>Delivered At: {new Date(order.delivered_at).toLocaleString()}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Task-Specific Messaging */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white brutal-border brutal-shadow flex flex-col h-[460px]">
              {/* Chat Header */}
              <div className="bg-taskYellow brutal-border-b px-4 py-3 border-b-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 stroke-[3]" />
                  <span className="text-xs font-black uppercase text-taskBlack">
                    Task Chat (Requester &amp; Worker)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 brutal-border">
                  SECURE
                </span>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-taskOffWhite text-xs font-bold">
                {messages.length === 0 ? (
                  <p className="text-center text-black/50 py-10 italic">
                    No messages yet. Coordinate campus meeting time &amp; location here!
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender_id === (order.requester_id === requester?.id ? requester?.id : worker?.id);
                    return (
                      <div
                        key={m.id}
                        className={clsx(
                          'p-2.5 max-w-[85%] brutal-border text-xs',
                          isMe
                            ? 'ml-auto bg-taskYellow text-taskBlack'
                            : 'mr-auto bg-white text-taskBlack'
                        )}
                      >
                        <span className="text-[10px] font-black uppercase text-black/60 block mb-0.5">
                          {(m as any).sender?.name || 'Peer'}
                        </span>
                        <p>{m.message}</p>
                        <span className="text-[9px] font-mono text-black/40 block text-right mt-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-2 border-t-2 border-black bg-white flex gap-1.5">
                <input
                  type="text"
                  placeholder="Type message to peer..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 brutal-input px-3 py-1.5 text-xs font-bold"
                />
                <button
                  type="submit"
                  className="brutal-btn bg-taskYellow px-3 py-1.5 text-xs font-black uppercase flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Modal (REPORT A PROBLEM) */}
      <BrutalModal
        isOpen={disputeModalOpen}
        onClose={() => setDisputeModalOpen(false)}
        title="REPORT A PROBLEM / OPEN DISPUTE"
      >
        {disputeSubmitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-10 h-10 text-green-600 stroke-[3] mx-auto animate-bounce" />
            <h4 className="font-black text-base uppercase">Dispute Submitted to Admin!</h4>
            <p className="text-xs font-bold text-black/70">
              Campus moderator will review notes, OTP status, and evidence. Funds remain safely frozen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitDispute} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Reason for Problem *
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value as any)}
                className="w-full brutal-input px-3 py-2 text-xs font-bold bg-white"
              >
                <option value="Work not received">Work not received</option>
                <option value="Missing pages">Missing pages</option>
                <option value="Incorrect work">Incorrect work</option>
                <option value="Poor quality">Poor quality</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Detailed Description &amp; What Went Wrong *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain the issue with page numbers, missing sections, or unfulfilled instructions..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="p-3 brutal-border bg-taskOffWhite text-xs font-semibold text-black/70">
              📷 <strong>Evidence Photo Upload:</strong> Reference photos of physical pages or defective submission attached automatically for campus admin verification.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <BrutalButton
                type="button"
                variant="white"
                size="md"
                onClick={() => setDisputeModalOpen(false)}
              >
                CANCEL
              </BrutalButton>
              <BrutalButton
                type="submit"
                variant="pink"
                size="md"
                disabled={actionLoading}
              >
                <span>SUBMIT DISPUTE →</span>
              </BrutalButton>
            </div>
          </form>
        )}
      </BrutalModal>

      {/* Review Modal */}
      <BrutalModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="LEAVE A PEER REVIEW"
      >
        {reviewSubmitted ? (
          <div className="text-center py-6 space-y-2">
            <CheckCircle className="w-10 h-10 text-green-600 stroke-[3] mx-auto animate-bounce" />
            <h4 className="font-black text-base uppercase">Review Published!</h4>
            <p className="text-xs font-bold text-black/70">
              Your feedback helps maintain trust in the campus community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Rating (1 to 5 Stars)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRating(st)}
                    className={clsx(
                      'w-10 h-10 brutal-border text-base font-black flex items-center justify-center transition-all',
                      st <= rating ? 'bg-taskYellow text-black' : 'bg-white opacity-40'
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Comment &amp; Feedback
              </label>
              <textarea
                rows={3}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full brutal-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <BrutalButton
                type="button"
                variant="white"
                size="md"
                onClick={() => setReviewModalOpen(false)}
              >
                CANCEL
              </BrutalButton>
              <BrutalButton
                type="submit"
                variant="yellow"
                size="md"
                disabled={actionLoading}
              >
                <span>SUBMIT REVIEW →</span>
              </BrutalButton>
            </div>
          </form>
        )}
      </BrutalModal>
    </div>
  );
}
