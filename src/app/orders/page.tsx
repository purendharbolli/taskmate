'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PackageCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Shield,
  KeyRound,
  FileText
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { Order, OrderStatus } from '@/lib/types';
import clsx from 'clsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return <BrutalBadge variant="pink" size="sm">PAYMENT PENDING</BrutalBadge>;
      case 'PAYMENT_HELD':
      case 'WORK_IN_PROGRESS':
        return <BrutalBadge variant="yellow" size="sm">IN PROGRESS</BrutalBadge>;
      case 'READY_FOR_HANDOVER':
        return <BrutalBadge variant="yellow" size="sm">OTP READY FOR HANDOVER</BrutalBadge>;
      case 'DELIVERED':
        return <BrutalBadge variant="blue" size="sm">DELIVERED (REVIEW WINDOW)</BrutalBadge>;
      case 'PAYMENT_RELEASED':
        return <BrutalBadge variant="green" size="sm">COMPLETED ✓</BrutalBadge>;
      case 'DISPUTE_OPEN':
      case 'UNDER_REVIEW':
        return <BrutalBadge variant="pink" size="sm">DISPUTE UNDER REVIEW</BrutalBadge>;
      case 'REFUNDED':
        return <BrutalBadge variant="white" size="sm">REFUNDED</BrutalBadge>;
      default:
        return <BrutalBadge variant="white" size="sm">{status}</BrutalBadge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrutalBadge variant="blue" size="sm">
              CAMPUS TRANSACTIONS
            </BrutalBadge>
            <span className="text-xs font-black uppercase text-taskBlack/60">
              Escrow &amp; OTP Protected
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack">
            Orders &amp; Handovers
          </h1>
          <p className="text-sm font-bold text-taskBlack/70 mt-1">
            Track active jobs, generate 4-digit handover OTPs, and manage payments.
          </p>
        </div>

        <Link href="/tasks">
          <BrutalButton variant="yellow" size="md">
            <span>BROWSE TASKS →</span>
          </BrutalButton>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="brutal-border bg-white p-6 h-28 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="brutal-border bg-white brutal-shadow p-12 text-center max-w-lg mx-auto space-y-4">
          <PackageCheck className="w-12 h-12 text-taskBlack stroke-[2.5] mx-auto" />
          <h3 className="text-2xl font-black uppercase text-taskBlack">
            No Active Orders Yet
          </h3>
          <p className="text-xs font-bold text-taskBlack/70">
            When you post a task or get accepted for a job, you will be able to track status and handover OTPs here.
          </p>
          <Link href="/tasks">
            <BrutalButton variant="yellow" size="md">
              <span>EXPLORE TASKS</span>
            </BrutalButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isReadyForOtp = order.status === 'READY_FOR_HANDOVER';
            const isDispute = order.status === 'DISPUTE_OPEN' || order.status === 'UNDER_REVIEW';

            return (
              <div
                key={order.id}
                className={clsx(
                  'brutal-border brutal-shadow p-5 sm:p-6 transition-all brutal-card-hover flex flex-col md:flex-row md:items-center justify-between gap-4',
                  isReadyForOtp ? 'bg-taskYellow/30 border-black' : isDispute ? 'bg-taskPink/20' : 'bg-white'
                )}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black uppercase bg-taskBlack text-white px-2 py-0.5">
                      ORDER #{order.id}
                    </span>
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-bold text-black/60">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black uppercase text-taskBlack">
                    {(order as any).task?.title || 'Campus Service Task'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black/70">
                    <span>
                      Requester:{' '}
                      <strong className="text-taskBlack uppercase">
                        {(order as any).requester?.name || 'Peer'}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Worker:{' '}
                      <strong className="text-taskBlack uppercase">
                        {(order as any).worker?.name || 'Peer'}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Amount:{' '}
                      <strong className="text-taskBlack">
                        ₹{order.amount} (+ ₹{order.platform_fee} fee)
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isReadyForOtp && (
                    <div className="flex items-center gap-1.5 bg-taskYellow px-3 py-1.5 brutal-border text-xs font-black">
                      <KeyRound className="w-4 h-4" />
                      <span>OTP READY</span>
                    </div>
                  )}

                  <Link href={`/orders/${order.id}`}>
                    <BrutalButton variant="yellow" size="md">
                      <span>VIEW ORDER &amp; OTP →</span>
                    </BrutalButton>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
