'use client';

import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Video, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface SafetyGuidanceBannerProps {
  variant?: 'chat' | 'payment' | 'task' | 'inline';
  className?: string;
}

export const SafetyGuidanceBanner: React.FC<SafetyGuidanceBannerProps> = ({
  variant = 'chat',
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Variant 1: Immediate Pre-Payment & Pre-Release Checklist (Stronger guidance before payment/completion actions)
  if (variant === 'payment') {
    return (
      <div
        className={clsx(
          'p-4 bg-amber-50 brutal-border border-black text-xs font-bold text-taskBlack space-y-3',
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-700 stroke-[2.5] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-taskBlack tracking-wide flex items-center gap-1.5">
              <span>Safety &amp; Verification Checklist Before Payment</span>
            </h4>
            <p className="text-[11px] text-taskBlack/85 leading-relaxed">
              Before making payment, always verify the completed work and task proof yourself. If you and your TaskMate are from the same college, consider meeting in person in a safe/public place and confirming the work before payment.
            </p>
          </div>
        </div>

        <div className="p-2.5 bg-white brutal-border border-black text-[11px] text-taskBlack/90 leading-relaxed flex items-start gap-2">
          <Video className="w-4 h-4 text-blue-700 stroke-[2] shrink-0 mt-0.5" />
          <p>
            <strong>Verification Tip:</strong> Prefer genuine video proof or live verification of completed work rather than relying only on screenshots or images, which can potentially be edited or AI-generated. TaskMate provides a platform to connect users but cannot guarantee that every user or transaction is legitimate. Stay cautious and verify before making payments.
          </p>
        </div>
      </div>
    );
  }

  // Variant 2: Task Detail / Application Review Card
  if (variant === 'task') {
    return (
      <div
        className={clsx(
          'p-4 bg-[#FFF9E6] brutal-border border-black text-xs space-y-2',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-taskBlack stroke-[2.5]" />
          <span className="font-black uppercase text-xs text-taskBlack tracking-wider">
            Campus Safety &amp; Verification
          </span>
        </div>
        <p className="text-[11px] font-bold text-black/80 leading-relaxed">
          Before making payment, always verify the completed work and task proof yourself. If you and your TaskMate are from the same college, consider meeting in person in a safe/public place and confirming the work before payment.
        </p>
        <p className="text-[10px] font-semibold text-black/70 italic">
          Prefer genuine video proof or live verification over editable screenshots. TaskMate provides a connection platform but cannot guarantee every user or transaction.
        </p>
      </div>
    );
  }

  // Variant 3: Inline Disclaimer (compact)
  if (variant === 'inline') {
    return (
      <div
        className={clsx(
          'p-3 bg-amber-50/80 brutal-border border-black text-[11px] font-bold text-taskBlack flex items-start gap-2',
          className
        )}
      >
        <AlertCircle className="w-4 h-4 text-amber-700 stroke-[2.5] shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Safety Note:</strong> Always verify completed work and task proof yourself before making payment. Prefer genuine video proof or live verification.
        </p>
      </div>
    );
  }

  // Variant 4: Chat Header (Concise, friendly, non-cluttering with expandable guide)
  return (
    <div
      className={clsx(
        'w-full bg-[#FFF9E6] border-b-2 border-black text-xs px-3 sm:px-4 py-2 transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-taskBlack stroke-[2.5] shrink-0" />
          <p className="font-bold text-[11px] text-taskBlack truncate">
            <span className="font-black uppercase">Campus Safety Tip: </span>
            Verify completed work yourself before making payment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-[10px] font-black uppercase text-black/70 hover:text-black flex items-center gap-0.5 px-1.5 py-0.5 brutal-border bg-white"
        >
          <span>{expanded ? 'Less' : 'Safety Guide'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2 border-t border-black/20 space-y-2 text-[11px] text-taskBlack/85 leading-relaxed">
          <p>
            Before making payment, always verify the completed work and task proof yourself. If you and your TaskMate are from the same college, consider meeting in person in a safe/public place and confirming the work before payment.
          </p>
          <div className="p-2 bg-white brutal-border border-black text-[10px] space-y-1">
            <p>
              <strong>Disclaimer:</strong> Prefer genuine video proof or live verification of completed work rather than relying only on screenshots or images, which can potentially be edited or AI-generated. TaskMate provides a platform to connect users but cannot guarantee that every user or transaction is legitimate. Stay cautious and verify before making payments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
