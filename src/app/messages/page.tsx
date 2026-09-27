'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { Order, User } from '@/lib/types';

export default function MessagesListPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user);
          fetch('/api/orders')
            .then((r) => r.json())
            .then((d) => {
              if (d.orders) setOrders(d.orders);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div>
        <BrutalBadge variant="yellow" size="sm" className="mb-2">
          TASK CONVERSATIONS
        </BrutalBadge>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-taskBlack">
          Task Messages
        </h1>
        <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
          Private, task-based conversations between task givers and accepted taskmates.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto shadow-[2px_2px_0px_0px_#000]" />
          <p className="font-black text-xs uppercase">Loading conversations...</p>
        </div>
      ) : !currentUser ? (
        <div className="brutal-border bg-white p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-taskYellow brutal-border flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
            <Lock className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-lg uppercase text-taskBlack">Authentication Required</h3>
            <p className="text-xs font-bold text-black/60">
              Please log in to access your private task conversations.
            </p>
          </div>
          <Link href="/login">
            <BrutalButton variant="yellow" size="md">
              <span>LOG IN TO TASKMATE →</span>
            </BrutalButton>
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="brutal-border bg-white p-12 text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-black/40 mx-auto stroke-[2]" />
          <div className="space-y-1">
            <h3 className="font-black text-lg uppercase text-taskBlack">No active conversations yet</h3>
            <p className="text-xs sm:text-sm font-bold text-black/60 max-w-md mx-auto">
              Private chat rooms open automatically the moment an application is accepted on a task.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/tasks">
              <BrutalButton variant="yellow" size="md">
                <span>FIND TASKS</span>
              </BrutalButton>
            </Link>
            <Link href="/tasks/create">
              <BrutalButton variant="white" size="md">
                <span>POST A TASK</span>
              </BrutalButton>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const isRequester = currentUser?.id === o.requester_id;
            const peerName = isRequester
              ? (o as any).worker?.name || 'Taskmate'
              : (o as any).requester?.name || 'Task Giver';

            return (
              <Link
                key={o.id}
                href={`/messages/${o.id}`}
                className="block p-4 sm:p-5 brutal-border bg-white hover:bg-[#FFFEEA] brutal-shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-black bg-black text-white px-2 py-0.5 uppercase">
                        ORDER #{o.id.slice(-6)}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase bg-taskYellow px-1.5 py-0.5 border border-black">
                        {o.status}
                      </span>
                      <span className="text-xs font-black">₹{o.amount}</span>
                    </div>

                    <h4 className="font-black text-base uppercase text-taskBlack">
                      {(o as any).task?.title || 'Campus Peer Service'}
                    </h4>

                    <p className="text-xs font-bold text-black/70">
                      Peer: <span className="text-black font-black">{peerName}</span> ·{' '}
                      {isRequester ? 'You are Task Giver' : 'You are Taskmate'}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs font-black uppercase self-end sm:self-center bg-taskYellow px-3 py-1.5 border border-black">
                    <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>OPEN PRIVATE CHAT</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
