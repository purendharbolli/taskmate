'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { Order, Task, User, Message } from '@/lib/types';
import clsx from 'clsx';

export default function OrderChatPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [requester, setRequester] = useState<User | null>(null);
  const [worker, setWorker] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChat = () => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setTask(data.order.task);
          setRequester(data.order.requester);
          setWorker(data.order.worker);
        }
        setLoading(false);
      });

    fetch(`/api/messages?orderId=${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      });
  };

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));
    fetchChat();
  }, [orderId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageText = text.trim();
    setText('');

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, message: messageText }),
    });
    const d = await res.json();
    if (d.success) {
      setMessages((prev) => [...prev, d.message]);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-4" />
        <p className="font-black uppercase text-xs">Loading Chat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Order #{orderId}</span>
        </Link>
        <span className="text-xs font-mono font-bold uppercase bg-taskYellow px-2 py-0.5 brutal-border">
          {order?.status}
        </span>
      </div>

      <div className="bg-white brutal-border brutal-shadow-lg flex flex-col h-[600px]">
        {/* Task Bar */}
        <div className="bg-taskYellow border-b-[3px] border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-black/60 block">
              TASK-SPECIFIC MESSAGING
            </span>
            <h2 className="text-base sm:text-lg font-black uppercase text-taskBlack truncate">
              {task?.title || 'Campus Task'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-black text-taskBlack/80">
            <span>Requester: {requester?.name}</span>
            <span>·</span>
            <span>Worker: {worker?.name}</span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-taskOffWhite">
          {messages.length === 0 ? (
            <div className="text-center py-20 text-black/50 text-xs font-bold space-y-1">
              <p>No messages yet.</p>
              <p className="text-[11px]">Coordinate campus meeting times and notes handover safely here!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isSenderMe = m.sender_id === currentUser?.id;
              return (
                <div
                  key={m.id}
                  className={clsx(
                    'p-3 max-w-[80%] brutal-border text-xs font-bold',
                    isSenderMe
                      ? 'ml-auto bg-taskYellow text-taskBlack brutal-shadow-sm'
                      : 'mr-auto bg-white text-taskBlack brutal-shadow-sm'
                  )}
                >
                  <span className="text-[10px] font-black uppercase text-black/60 block mb-0.5">
                    {(m as any).sender?.name || (isSenderMe ? 'You' : 'Peer')}
                  </span>
                  <p className="leading-snug">{m.message}</p>
                  <span className="text-[9px] font-mono text-black/40 block text-right mt-1">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t-[3px] border-black bg-white flex gap-2">
          <input
            type="text"
            placeholder="Type your message to peer..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 brutal-input px-3.5 py-2.5 text-xs font-bold"
          />
          <BrutalButton type="submit" variant="yellow" size="md">
            <Send className="w-4 h-4 stroke-[3]" />
            <span>SEND</span>
          </BrutalButton>
        </form>
      </div>
    </div>
  );
}
