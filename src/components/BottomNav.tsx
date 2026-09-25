'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, PackageCheck, User } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Tasks', href: '/tasks', icon: Search },
    { label: 'Post', href: '/tasks/create', icon: PlusCircle, highlight: true },
    { label: 'Orders', href: '/orders', icon: PackageCheck },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-[3px] border-black brutal-shadow-lg pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-14 h-14 bg-taskYellow brutal-border brutal-shadow flex items-center justify-center group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none transition-all">
                  <Icon className="w-7 h-7 text-black stroke-[3]" />
                </div>
                <span className="text-[10px] font-black uppercase text-taskBlack mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center h-full gap-0.5 transition-colors',
                isActive ? 'text-taskBlack font-black' : 'text-taskBlack/60 font-bold'
              )}
            >
              <div
                className={clsx(
                  'p-1 transition-all',
                  isActive && 'bg-taskYellow/50 brutal-border border-black'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive ? 'stroke-[2.8]' : 'stroke-2')} />
              </div>
              <span className="text-[10px] tracking-tight uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
