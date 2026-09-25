import React from 'react';
import clsx from 'clsx';

interface BrutalBadgeProps {
  children: React.ReactNode;
  variant?: 'yellow' | 'blue' | 'pink' | 'green' | 'white' | 'black';
  rotate?: '-2' | '-1' | '0' | '1' | '2';
  size?: 'sm' | 'md';
  className?: string;
}

export const BrutalBadge: React.FC<BrutalBadgeProps> = ({
  children,
  variant = 'yellow',
  rotate = '0',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    yellow: 'bg-taskYellow text-taskBlack',
    blue: 'bg-taskBlue text-taskBlack',
    pink: 'bg-taskPink text-taskBlack',
    green: 'bg-taskGreen text-taskBlack',
    white: 'bg-white text-taskBlack',
    black: 'bg-taskBlack text-white',
  };

  const rotateStyles = {
    '-2': '-rotate-2',
    '-1': '-rotate-1',
    '0': 'rotate-0',
    '1': 'rotate-1',
    '2': 'rotate-2',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={clsx(
        'sticker-tag inline-flex items-center gap-1 select-none',
        variantStyles[variant],
        rotateStyles[rotate],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
