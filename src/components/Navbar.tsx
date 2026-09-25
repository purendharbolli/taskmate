'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  PlusCircle,
  MapPin,
  User,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Notification } from '@/lib/types';
import clsx from 'clsx';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch notifications
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch((err) => console.error(err));
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 bg-taskOffWhite border-b-[3px] border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2 md:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group select-none shrink-0">
            <div className="bg-taskYellow brutal-border px-2.5 py-1 brutal-shadow group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
              <span className="font-black text-base md:text-xl tracking-tighter leading-none block text-black">
                TASK
              </span>
              <span className="font-black text-xs md:text-sm tracking-widest leading-none block text-black">
                MATE
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-black/70 uppercase max-w-[120px] leading-tight">
              Students Helping Students
            </span>
          </Link>

          {/* Campus Indicator Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white brutal-border px-3 py-1 text-xs font-black brutal-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-taskYellow fill-taskYellow stroke-black stroke-2" />
            <span className="text-taskBlack">SNIST</span>
            <span className="text-black/40">·</span>
            <span className="text-black/60 font-semibold">Hyderabad</span>
            <span className="ml-1 bg-taskGreen text-black text-[9px] px-1.5 py-0.2 font-mono uppercase border border-black">
              LIVE
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-3 text-xs lg:text-sm font-extrabold uppercase">
            <Link
              href="/tasks"
              className={clsx(
                'px-3 py-2 border-2 transition-all',
                pathname === '/tasks'
                  ? 'bg-taskYellow border-black brutal-shadow-sm'
                  : 'border-transparent hover:border-black hover:bg-white'
              )}
            >
              Browse Tasks
            </Link>

            <Link
              href="/orders"
              className={clsx(
                'px-3 py-2 border-2 transition-all',
                pathname.startsWith('/orders')
                  ? 'bg-taskBlue border-black brutal-shadow-sm'
                  : 'border-transparent hover:border-black hover:bg-white'
              )}
            >
              Orders & OTP
            </Link>

            <Link
              href="/dashboard"
              className={clsx(
                'px-3 py-2 border-2 transition-all',
                pathname === '/dashboard'
                  ? 'bg-taskPink border-black brutal-shadow-sm'
                  : 'border-transparent hover:border-black hover:bg-white'
              )}
            >
              Dashboard
            </Link>

            <Link
              href="/trust"
              className={clsx(
                'px-3 py-2 border-2 transition-all',
                pathname === '/trust'
                  ? 'bg-taskYellow border-black brutal-shadow-sm'
                  : 'border-transparent hover:border-black hover:bg-white'
              )}
            >
              Trust & Safety
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Post a Task CTA (Desktop) */}
            <Link
              href="/tasks/create"
              className="brutal-btn bg-taskYellow text-taskBlack px-3 md:px-4 py-2 text-xs md:text-sm uppercase flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline font-black">POST A TASK</span>
              <span className="sm:hidden font-black">POST</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setUserMenuOpen(false);
                }}
                className="w-10 h-10 brutal-border bg-white flex items-center justify-center brutal-shadow-sm hover:bg-taskYellow transition-all relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 stroke-[2.5]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-taskPink border-2 border-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-taskOffWhite brutal-border brutal-shadow-lg z-50 p-3 max-h-[420px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wide">
                      Campus Notifications ({notifications.length})
                    </h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-extrabold uppercase underline hover:text-blue-700"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-black/60 py-4 text-center">No notifications yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.slice(0, 6).map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || '/orders'}
                          onClick={() => setNotifOpen(false)}
                          className={clsx(
                            'block p-2 text-xs brutal-border transition-all',
                            n.read ? 'bg-white opacity-80' : 'bg-taskYellow/40 font-bold'
                          )}
                        >
                          <p className="font-black text-taskBlack text-[12px]">{n.title}</p>
                          <p className="text-[11px] text-taskBlack/80 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifOpen(false);
                }}
                className="w-10 h-10 brutal-border bg-taskBlue flex items-center justify-center brutal-shadow-sm hover:bg-[#73c8f5] transition-all overflow-hidden"
              >
                <User className="w-5 h-5 stroke-[2.5]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-taskOffWhite brutal-border brutal-shadow-lg z-50 p-2 space-y-1">
                  <div className="p-2 border-b-2 border-black mb-1 bg-taskYellow">
                    <p className="font-black text-xs uppercase text-taskBlack">Student Account</p>
                    <p className="text-[11px] text-taskBlack/80 font-bold">SNIST Campus</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                  >
                    My Student Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                  >
                    Earnings & Jobs
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                  >
                    Account Settings
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="block p-2 text-xs font-black text-purple-900 bg-taskPink/20 hover:bg-taskPink brutal-border border-black"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setUserMenuOpen(false)}
                    className="block p-2 text-xs font-bold text-red-600 hover:bg-red-50 brutal-border border-transparent hover:border-black flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch / Logout</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 brutal-border bg-white flex items-center justify-center brutal-shadow-sm"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 stroke-[3]" /> : <Menu className="w-5 h-5 stroke-[3]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-black bg-taskYellow p-4 space-y-2 brutal-shadow">
          <Link
            href="/tasks"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 bg-white brutal-border font-black text-sm uppercase"
          >
            🔍 Browse Campus Tasks
          </Link>
          <Link
            href="/tasks/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 bg-taskPink brutal-border font-black text-sm uppercase"
          >
            ➕ Post a New Task
          </Link>
          <Link
            href="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 bg-taskBlue brutal-border font-black text-sm uppercase"
          >
            📦 My Orders & Handover OTP
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 bg-white brutal-border font-black text-sm uppercase"
          >
            📊 Earnings & Dashboard
          </Link>
          <Link
            href="/trust"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 bg-taskOffWhite brutal-border font-black text-sm uppercase"
          >
            🛡️ Trust & Campus Safety
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 bg-taskBlack text-white brutal-border font-black text-sm uppercase"
          >
            ⚡ Admin Control Center
          </Link>
        </div>
      )}
    </header>
  );
};
