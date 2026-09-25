import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Box, Check } from 'lucide-react';
import { OrderStatus } from '@/lib/types';
import clsx from 'clsx';

interface StatusTimelineProps {
  status: OrderStatus;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ status }) => {
  const steps = [
    { key: 'ACCEPTED', label: 'Worker Accepted', desc: 'Application approved' },
    { key: 'PAYMENT_HELD', label: 'Payment Secured', desc: 'Funds safely held in vault' },
    { key: 'WORK_IN_PROGRESS', label: 'Work In Progress', desc: 'Student working on task' },
    { key: 'READY_FOR_HANDOVER', label: 'Ready for Handover', desc: '4-digit OTP generated' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Campus OTP verified' },
    { key: 'PAYMENT_RELEASED', label: 'Payment Released', desc: 'Funds credited to worker' },
  ];

  // Helper to map order status to step index
  const getActiveIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'PAYMENT_PENDING':
        return 0;
      case 'PAYMENT_HELD':
        return 1;
      case 'WORK_IN_PROGRESS':
        return 2;
      case 'READY_FOR_HANDOVER':
        return 3;
      case 'DELIVERED':
        return 4;
      case 'PAYMENT_RELEASED':
        return 5;
      case 'DISPUTE_OPEN':
      case 'UNDER_REVIEW':
      case 'REFUNDED':
        return 4; // Special dispute state branch
      default:
        return 1;
    }
  };

  const currentIndex = getActiveIndex(status);
  const isDispute = status === 'DISPUTE_OPEN' || status === 'UNDER_REVIEW' || status === 'REFUNDED';

  return (
    <div className="w-full">
      {isDispute && (
        <div className="mb-4 brutal-border bg-taskPink/30 p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 stroke-[3] shrink-0" />
          <div className="text-xs font-bold text-taskBlack">
            <span className="font-extrabold uppercase">Order Under Dispute Review: </span>
            Admin is currently verifying evidence and notes. Funds remain safely frozen.
          </div>
        </div>
      )}

      {/* Mobile Stack / Desktop Horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;

          return (
            <div
              key={step.key}
              className={clsx(
                'brutal-border p-2.5 flex flex-col justify-between transition-all',
                isDone && 'bg-taskGreen/30 brutal-shadow-sm',
                isCurrent && 'bg-taskYellow brutal-shadow font-bold',
                isPending && 'bg-white opacity-50'
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-taskBlack/70">
                  0{idx + 1}
                </span>
                {isDone ? (
                  <Check className="w-4 h-4 text-green-700 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-taskBlack animate-pulse stroke-[3]" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-taskBlack/30" />
                )}
              </div>

              <div>
                <p className="text-xs font-black uppercase text-taskBlack leading-tight">
                  {step.label}
                </p>
                <p className="text-[10px] text-taskBlack/70 line-clamp-1 mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
