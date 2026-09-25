import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info } from 'lucide-react';

export const AcademicIntegrityBanner: React.FC = () => {
  return (
    <div className="w-full bg-taskYellow/30 border-y-2 md:border-2 border-taskBlack py-2.5 px-4 my-4 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-taskBlack stroke-[2.5] shrink-0" />
        <p className="font-bold text-taskBlack">
          <span className="font-black uppercase">Campus Honor Code: </span>
          TaskMate is strictly for legitimate peer assistance (transcription, notes, diagrams, errands, PPTs). Users are responsible for following their institution&apos;s academic-integrity rules.
        </p>
      </div>
      <Link
        href="/trust"
        className="shrink-0 font-black underline hover:text-blue-700 uppercase tracking-tight text-[11px]"
      >
        Trust & Safety Policy →
      </Link>
    </div>
  );
};
