'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { Order } from '@/lib/types';

export default function MessagesListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) setOrders(d.orders);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <BrutalBadge variant="yellow" size="sm" className="mb-2">
          TASK CONVERSATIONS
        </BrutalBadge>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-taskBlack">
          Task Messages
        </h1>
        <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
          Chat directly with students assigned to your tasks.
        </p>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="brutal-border bg-white p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-black/50 mx-auto" />
            <h3 className="font-black text-base uppercase">No active conversations</h3>
            <p className="text-xs font-bold text-black/60">
              Chats open automatically once you have an accepted application or active order.
            </p>
          </div>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/messages/${o.id}`}
              className="block p-4 brutal-border bg-white hover:bg-taskYellow/30 brutal-shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] font-black bg-taskBlack text-white px-2 py-0.5 uppercase">
                    ORDER #{o.id}
                  </span>
                  <h4 className="font-black text-base uppercase text-taskBlack mt-1">
                    {(o as any).task?.title || 'Campus Service Task'}
                  </h4>
                  <p className="text-xs font-bold text-black/60">
                    With: {(o as any).worker?.name || (o as any).requester?.name || 'Peer'}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-black uppercase">
                  <span>OPEN CHAT</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
