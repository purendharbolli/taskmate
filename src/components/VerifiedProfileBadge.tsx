'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Info, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export interface VerifiedProfileBadgeProps {
  isVerified?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  interactive?: boolean;
}

export const VerifiedProfileBadge: React.FC<VerifiedProfileBadgeProps> = ({
  isVerified = false,
  size = 'sm',
  showText = true,
  className,
  interactive = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Strictly only show if verified by administrator
  if (!isVerified) return null;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2 py-0.5 text-[10px] sm:text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => interactive && setIsOpen(true)}
      onMouseLeave={() => interactive && setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (interactive) setIsOpen(!isOpen);
        }}
        aria-label="Verified Profile information"
        className={clsx(
          'inline-flex items-center font-black uppercase brutal-border bg-[#8DD8FF] text-taskBlack border-black shadow-[1.5px_1.5px_0px_0px_#000] hover:bg-[#70cdff] active:translate-x-[1px] active:translate-y-[1px] transition-all select-none',
          sizeStyles[size],
          className
        )}
      >
        <ShieldCheck className={clsx(iconSizes[size], 'stroke-[2.5] text-taskBlack shrink-0')} />
        {showText && <span>Verified Profile</span>}
      </button>

      {/* Interactive Explanation Tooltip / Popover */}
      {interactive && isOpen && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 bottom-full left-0 mb-2 w-72 sm:w-80 p-3.5 bg-white brutal-border border-black shadow-[4px_4px_0px_0px_#000] text-taskBlack text-left animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700 stroke-[2.5]" />
              <span className="font-black uppercase text-xs tracking-wide">
                Verified Profile
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-black/60 hover:text-black p-0.5"
              aria-label="Close explanation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Mandated Explanation */}
          <p className="text-xs font-bold text-taskBlack leading-relaxed mb-2.5">
            Verified Profile means TaskMate has reviewed the information submitted by this user. It does not guarantee future transactions or behavior.
          </p>

          {/* Boundaries & Responsibilities Checklist */}
          <div className="p-2 bg-taskOffWhite brutal-border border-black text-[10px] font-semibold space-y-1 text-black/85">
            <div className="flex items-start gap-1.5">
              <span className="text-blue-700 font-bold shrink-0">•</span>
              <span>Administrators have reviewed the submitted college ID / verification credentials.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-amber-700 font-bold shrink-0">•</span>
              <span>Does not guarantee honesty, transaction safety, or work quality.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-green-700 font-bold shrink-0">•</span>
              <span>Always verify completed work yourself in person before releasing payment.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
