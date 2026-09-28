import React from 'react';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  FileText,
  ArrowRight,
  Paperclip,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Building2,
} from 'lucide-react';
import { BrutalBadge } from './ui/BrutalBadge';
import { VerifiedProfileBadge } from './VerifiedProfileBadge';
import { Task } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';

export interface TaskCardProps {
  task: Task;
  categoryName?: string;
  collegeName?: string;
  cityName?: string;
  proximity?: 'own_college' | 'nearby' | 'other';
  variant?: 'yellow' | 'blue' | 'pink' | 'white';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categoryName = 'Academic Help',
  collegeName,
  cityName,
  proximity = 'other',
  variant = 'white',
}) => {
  const resolvedCollege = collegeName || task.college?.short_name || task.college?.name || 'Campus';

  const bgStyles = {
    yellow: 'bg-taskYellow/10 hover:bg-taskYellow/25',
    blue: 'bg-taskBlue/10 hover:bg-taskBlue/25',
    pink: 'bg-taskPink/10 hover:bg-taskPink/25',
    white: 'bg-white hover:bg-[#FFFDF5]',
  };

  const statusConfig: Record<string, { label: string; bg: string }> = {
    OPEN: { label: 'OPEN', bg: 'bg-[#4DE680]' },
    ASSIGNED: { label: 'ASSIGNED', bg: 'bg-[#8DD8FF]' },
    IN_PROGRESS: { label: 'IN PROGRESS', bg: 'bg-[#8DD8FF]' },
    READY_FOR_HANDOVER: { label: 'READY', bg: 'bg-[#FFD84D]' },
    DELIVERED: { label: 'DELIVERED', bg: 'bg-[#D0BFFF]' },
    COMPLETED: { label: 'COMPLETED', bg: 'bg-zinc-200' },
    CANCELLED: { label: 'CLOSED', bg: 'bg-red-200' },
  };

  const status = statusConfig[task.status] || { label: task.status, bg: 'bg-zinc-100' };

  const isOwnCollege = proximity === 'own_college';

  return (
    <div
      className={`brutal-border brutal-shadow brutal-card-hover p-4 md:p-5 flex flex-col justify-between transition-all relative ${bgStyles[variant]} ${
        isOwnCollege ? 'ring-2 ring-black bg-[#FFFEEA]/60' : ''
      }`}
    >
      <div>
        {/* Top Hierarchy & Status Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Proximity / Scope Badge */}
          {proximity === 'own_college' && (
            <span className="inline-flex items-center gap-1 bg-[#FFD84D] text-black border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-[1.5px_1.5px_0px_0px_#000]">
              <Sparkles className="w-3 h-3 fill-black text-black" />
              FROM YOUR COLLEGE
            </span>
          )}
          {proximity === 'nearby' && (
            <span className="inline-flex items-center gap-1 bg-[#8DD8FF] text-black border border-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-[1.5px_1.5px_0px_0px_#000]">
              <MapPin className="w-3 h-3 stroke-[2.5]" />
              NEARBY {cityName ? `(${cityName})` : ''}
            </span>
          )}
          {proximity === 'other' && (
            <span className="inline-flex items-center gap-1 bg-white text-black/70 border border-black/30 px-2 py-0.5 text-[10px] font-bold uppercase">
              <Building2 className="w-3 h-3 stroke-[2]" />
              OTHER CAMPUS
            </span>
          )}

          {/* Current Status Badge */}
          <span
            className={`border border-black px-2 py-0.5 text-[10px] font-black uppercase ${status.bg}`}
          >
            {status.label}
          </span>
        </div>

        {/* Category, Posted Time & Price Tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <BrutalBadge variant="yellow" size="sm" className="truncate max-w-[130px]">
              {categoryName}
            </BrutalBadge>
            <span className="text-[10px] font-bold text-black/60 bg-black/5 px-1.5 py-0.5 border border-black/15">
              {formatTimeAgo(task.created_at)}
            </span>
            {task.requester && (
              <span className="text-[10px] font-black uppercase text-taskBlack/75 bg-taskYellow/30 px-1.5 py-0.5 border border-black/20 truncate max-w-[120px]" title={`Posted by @${task.requester.nickname || task.requester.name}`}>
                @{task.requester.nickname || task.requester.name}
              </span>
            )}
            {Boolean(task.requester_verified || task.requester?.admin_verified) && (
              <VerifiedProfileBadge isVerified={true} size="xs" />
            )}
          </div>

          <span className="brutal-border bg-taskYellow px-2.5 py-1 text-sm font-black brutal-shadow-sm whitespace-nowrap">
            ₹{task.budget}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="font-black text-base sm:text-lg text-taskBlack line-clamp-2 mb-2 leading-snug">
          {task.title}
        </h3>

        {/* Work Volume (Pages/Slides) & Attachments Indicator */}
        <div className="flex items-center gap-2 flex-wrap mb-2.5">
          {task.quantity && (
            <div className="inline-flex items-center gap-1 text-[11px] font-bold bg-white px-2 py-0.5 border border-black">
              <FileText className="w-3 h-3 stroke-[2.5]" />
              <span>{task.quantity}</span>
            </div>
          )}

          {/* Attachment indicators */}
          {task.files && task.files.length > 0 && (
            <div
              className="inline-flex items-center gap-1 text-[11px] font-black bg-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]"
              title={`${task.files.length} attachment(s) available`}
            >
              <Paperclip className="w-3 h-3 stroke-[2.5] text-black" />
              <span>
                {task.files.length} {task.files.length === 1 ? 'file' : 'files'}
              </span>
            </div>
          )}

          {task.google_drive_link && (
            <div
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 border border-blue-300"
              title="Reference materials available on Google Drive"
            >
              <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              <span>Drive Link</span>
            </div>
          )}
        </div>

        {/* College & Campus Location */}
        <div className="space-y-1 mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-taskBlack">
            <GraduationCap className="w-3.5 h-3.5 stroke-[2.5] shrink-0 text-taskBlack" />
            <span className="truncate">{resolvedCollege}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-taskBlack/70">
            <MapPin className="w-3.5 h-3.5 stroke-[2] shrink-0 text-taskBlack/60" />
            <span className="truncate">{task.location || 'Campus Meeting Point'}</span>
            {task.distance_approx && (
              <span className="text-taskBlack/50 shrink-0">· {task.distance_approx}</span>
            )}
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-xs font-black text-red-600 mb-3 bg-red-50 border border-red-200 px-2 py-1">
          <Clock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="truncate">Due: {task.deadline}</span>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-taskBlack/60 uppercase">
          {task.handover_method || 'Campus Delivery'}
        </span>

        <Link
          href={`/tasks/${task.id}`}
          className="brutal-btn bg-taskYellow px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 hover:bg-[#ffe066] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <span>VIEW TASK</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
};

