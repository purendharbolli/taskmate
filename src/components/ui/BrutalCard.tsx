import React from 'react';
import clsx from 'clsx';

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'yellow' | 'blue' | 'pink' | 'offwhite';
  hoverEffect?: boolean;
  shadowSize?: 'sm' | 'md' | 'lg';
}

export const BrutalCard: React.FC<BrutalCardProps> = ({
  children,
  variant = 'white',
  hoverEffect = false,
  shadowSize = 'md',
  className,
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white',
    offwhite: 'bg-taskOffWhite',
    yellow: 'bg-taskYellow',
    blue: 'bg-taskBlue',
    pink: 'bg-taskPink',
  };

  const shadowStyles = {
    sm: 'brutal-shadow-sm',
    md: 'brutal-shadow',
    lg: 'brutal-shadow-lg',
  };

  return (
    <div
      className={clsx(
        'brutal-border',
        variantStyles[variant],
        shadowStyles[shadowSize],
        hoverEffect && 'brutal-card-hover cursor-pointer',
        'p-4 md:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
