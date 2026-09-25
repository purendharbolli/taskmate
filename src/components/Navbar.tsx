'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  PlusCircle,
  MapPin,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  MessageSquare,
  Sparkles,
  Settings
} from 'lucide-react';
import { User as UserType, Notification } from '@/lib/types';
import clsx from 'clsx';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check auth session
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user || null);
      })
      .catch(() => setCurrentUser(null));
  }, [pathname]);

  // Fetch notifications if user exists
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, [currentUser, pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
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

          {/* Navigation Links */}
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

            {currentUser ? (
              <>
                <Link
                  href="/orders"
                  className={clsx(
                    'px-3 py-2 border-2 transition-all',
                    pathname.startsWith('/orders')
                      ? 'bg-taskBlue border-black brutal-shadow-sm'
                      : 'border-transparent hover:border-black hover:bg-white'
                  )}
                >
                  My Tasks
                </Link>

                <Link
                  href="/messages"
                  className={clsx(
                    'px-3 py-2 border-2 transition-all',
                    pathname.startsWith('/messages')
                      ? 'bg-taskPink border-black brutal-shadow-sm'
                      : 'border-transparent hover:border-black hover:bg-white'
                  )}
                >
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/trust"
                  className={clsx(
                    'px-3 py-2 border-2 transition-all',
                    pathname === '/trust'
                      ? 'bg-taskYellow border-black brutal-shadow-sm'
                      : 'border-transparent hover:border-black hover:bg-white'
                  )}
                >
                  How It Works
                </Link>

                <Link
                  href="/tasks"
                  className="px-3 py-2 border-2 border-transparent hover:border-black hover:bg-white transition-all text-black/70 hover:text-black"
                >
                  Become a Worker
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Primary Action CTA */}
            <Link
              href="/tasks/create"
              className="brutal-btn bg-taskYellow text-taskBlack px-3 md:px-4 py-2 text-xs md:text-sm uppercase flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[3]" />
              <span className="font-black">POST A TASK</span>
            </Link>

            {currentUser ? (
              <>
                {/* Notifications Bell */}
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

                {/* Authenticated Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotifOpen(false);
                    }}
                    className="w-10 h-10 brutal-border bg-taskBlue flex items-center justify-center brutal-shadow-sm hover:bg-[#73c8f5] transition-all overflow-hidden"
                  >
                    {currentUser.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-taskOffWhite brutal-border brutal-shadow-lg z-50 p-2 space-y-1">
                      <div className="p-2 border-b-2 border-black mb-1 bg-taskYellow">
                        <p className="font-black text-xs uppercase text-taskBlack truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-taskBlack/80 font-bold truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                      >
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                      >
                        My Profile
                      </Link>

                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                      >
                        My Active Tasks
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="block p-2 text-xs font-bold hover:bg-white brutal-border border-transparent hover:border-black"
                      >
                        Settings
                      </Link>

                      {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block p-2 text-xs font-black text-purple-900 bg-taskPink/20 hover:bg-taskPink brutal-border border-black"
                        >
                          Admin Portal
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-left p-2 text-xs font-bold text-red-600 hover:bg-red-50 brutal-border border-transparent hover:border-black flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated: Clean Log in Button */
              <Link
                href="/login"
                className="brutal-btn bg-white hover:bg-taskOffWhite px-3.5 md:px-4 py-2 text-xs md:text-sm font-extrabold uppercase shrink-0"
              >
                Log In
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 brutal-border bg-white flex items-center justify-center brutal-shadow-sm"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-black py-4 space-y-2 bg-white px-2">
            <Link
              href="/tasks"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 text-xs font-black uppercase brutal-border hover:bg-taskYellow"
            >
              Browse Tasks
            </Link>

            {currentUser ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 text-xs font-black uppercase brutal-border hover:bg-taskBlue"
                >
                  My Tasks
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 text-xs font-black uppercase brutal-border hover:bg-taskPink"
                >
                  Dashboard
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 text-xs font-black uppercase brutal-border hover:bg-white"
                >
                  Messages
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 text-xs font-black uppercase brutal-border hover:bg-white"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-2.5 text-xs font-black uppercase text-red-600 brutal-border hover:bg-red-50 flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/trust"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 text-xs font-black uppercase brutal-border hover:bg-taskYellow"
                >
                  How It Works
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2.5 text-xs font-black uppercase brutal-border bg-taskYellow text-center"
                >
                  Log In / Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
