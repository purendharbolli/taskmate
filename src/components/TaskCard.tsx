import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, Star, FileText, ArrowRight } from 'lucide-react';
import { BrutalBadge } from './ui/BrutalBadge';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  categoryName?: string;
  collegeName?: string;
  variant?: 'yellow' | 'blue' | 'pink' | 'white';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  categoryName = 'Academic Help',
  collegeName = 'SNIST',
  variant = 'white',
}) => {
  const bgStyles = {
    yellow: 'bg-taskYellow/20 hover:bg-taskYellow/30',
    blue: 'bg-taskBlue/20 hover:bg-taskBlue/30',
    pink: 'bg-taskPink/20 hover:bg-taskPink/30',
    white: 'bg-white hover:bg-[#FFFDF5]',
  };

  return (
    <div
      className={`brutal-border brutal-shadow brutal-card-hover p-4 md:p-5 flex flex-col justify-between transition-all ${bgStyles[variant]}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <BrutalBadge variant="yellow" size="sm" className="truncate max-w-[170px]">
            {categoryName}
          </BrutalBadge>

          <span className="brutal-border bg-taskYellow px-2.5 py-1 text-sm font-black brutal-shadow-sm">
            ₹{task.budget}
          </span>
        </div>

        {/* Task Title */}
        <h3 className="font-black text-lg text-taskBlack line-clamp-2 mb-2 leading-snug">
          {task.title}
        </h3>

        {/* Quantity / Pages if present */}
        {task.quantity && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-taskBlack/80 mb-2">
            <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="bg-white px-2 py-0.5 brutal-border text-[11px]">
              {task.quantity}
            </span>
          </div>
        )}

        {/* Location & College */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-taskBlack/80 mb-1.5">
          <MapPin className="w-3.5 h-3.5 stroke-[2.5] text-taskBlack" />
          <span className="truncate">{task.location || collegeName}</span>
          {task.distance_approx && (
            <span className="text-taskBlack/60">· {task.distance_approx}</span>
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-3">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Due {task.deadline}</span>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs font-black">
          <Star className="w-3.5 h-3.5 fill-taskYellow stroke-[2] text-black" />
          <span>4.8</span>
          <span className="text-taskBlack/50 font-medium ml-1 text-[11px]">campus</span>
        </div>

        <Link
          href={`/tasks/${task.id}`}
          className="brutal-btn bg-taskYellow px-3 py-1.5 text-xs font-extrabold uppercase flex items-center gap-1 hover:bg-[#ffe066]"
        >
          <span>VIEW TASK</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
};
