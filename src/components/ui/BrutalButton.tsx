import React from 'react';
import clsx from 'clsx';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'blue' | 'pink' | 'white' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  fullWidth = false,
  className,
  ...props
}) => {
  const variantStyles = {
    yellow: 'bg-taskYellow text-taskBlack hover:bg-[#ffcf33]',
    blue: 'bg-taskBlue text-taskBlack hover:bg-[#78cdfa]',
    pink: 'bg-taskPink text-taskBlack hover:bg-[#f77aa9]',
    white: 'bg-white text-taskBlack hover:bg-[#fff9e6]',
    black: 'bg-taskBlack text-white hover:bg-[#222222]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-extrabold',
    lg: 'px-6 py-3.5 text-base font-extrabold tracking-wide',
    xl: 'px-8 py-4 text-lg font-black tracking-wide',
  };

  return (
    <button
      className={clsx(
        'brutal-btn uppercase inline-flex items-center justify-center gap-2 select-none cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
