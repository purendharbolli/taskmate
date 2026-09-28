'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Paperclip,
  ExternalLink,
  ShieldCheck,
  Clock,
  MapPin,
  Download,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Check,
  CheckCheck,
  X,
  GraduationCap,
  Sparkles,
  Lock,
} from 'lucide-react';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { SafetyGuidanceBanner } from '@/components/SafetyGuidanceBanner';
import { Order, Task, User, Message } from '@/lib/types';
import { isDisallowedFileType } from '@/lib/security';
import clsx from 'clsx';

const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function OrderChatPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [requester, setRequester] = useState<User | null>(null);
  const [worker, setWorker] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attachment & Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Google Drive Modal / Inline Form State
  const [driveModalOpen, setDriveModalOpen] = useState(false);
  const [driveUrl, setDriveUrl] = useState('');
  const [driveNote, setDriveNote] = useState('');
  const [driveError, setDriveError] = useState<string | null>(null);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async (isInitial = false) => {
    try {
      const res = await fetch(`/api/messages?orderId=${orderId}`);
      if (res.status === 403) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        if (data.order) setOrder(data.order);
        if (data.task) setTask(data.task);
        if (data.requester) setRequester(data.requester);
        if (data.worker) setWorker(data.worker);
        if (data.currentUserId) setCurrentUserId(data.currentUserId);
        if (data.messages) {
          setMessages(data.messages);
          if (isInitial) {
            setTimeout(scrollToBottom, 200);
          }
        }
      }
    } catch {
      setErrorMessage('Failed to connect to chat server.');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      });

    fetchChat(true);

    // Poll for new messages every 3.5 seconds
    const interval = setInterval(() => {
      fetchChat(false);
    }, 3500);

    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // File Picker Change Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);

    // 1. Strict 50 MB Client-Side Validation
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      setFileError(
        `"${file.name}" (${formatBytes(file.size)}) exceeds the 50 MB direct upload limit. Please share files larger than 50 MB using a Google Drive link.`
      );
      setDriveModalOpen(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Unsafe Executable Validation
    if (isDisallowedFileType(file.name)) {
      setFileError(
        `For campus safety, executable and script files (.exe, .bat, etc.) cannot be uploaded. Please share documents, images, slides, or zip archives.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // Upload file with simulated/accurate progress
  const uploadAttachment = async (file: File): Promise<any> => {
    setUploading(true);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('file', file);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      return {
        file_name: data.file_name,
        file_url: data.file_url,
        file_size: data.file_size,
        file_size_bytes: data.file_size_bytes,
        file_type: data.file_type,
      };
    } finally {
      clearInterval(progressTimer);
      setUploading(false);
    }
  };

  // Send Message Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    let attachmentPayload = undefined;
    const msgText = text.trim();

    if (selectedFile) {
      try {
        attachmentPayload = await uploadAttachment(selectedFile);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setFileError(err.message || 'Attachment upload failed. Please try again.');
        return;
      }
    }

    setText('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          message: msgText,
          attachment: attachmentPayload,
        }),
      });

      const d = await res.json();
      if (d.success && d.message) {
        setMessages((prev) => [...prev, d.message]);
        setTimeout(scrollToBottom, 100);
      } else {
        alert(d.error || 'Failed to send message');
      }
    } catch {
      alert('Network failure sending message.');
    }
  };

  // Google Drive Share Handler
  const handleSendDriveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl.trim()) return;

    let validUrl = driveUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    try {
      new URL(validUrl);
    } catch {
      setDriveError('Please enter a valid URL.');
      return;
    }

    const driveMessage = driveNote.trim()
      ? `📁 Google Drive Shared: ${validUrl}\nNote: "${driveNote.trim()}"`
      : `📁 Google Drive Shared: ${validUrl}`;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          message: driveMessage,
          google_drive_link: validUrl,
        }),
      });

      const d = await res.json();
      if (d.success && d.message) {
        setMessages((prev) => [...prev, d.message]);
        setDriveModalOpen(false);
        setDriveUrl('');
        setDriveNote('');
        setDriveError(null);
        setTimeout(scrollToBottom, 100);
      } else {
        setDriveError(d.error || 'Failed to send link');
      }
    } catch {
      setDriveError('Failed to send Google Drive link.');
    }
  };

  // ACCESS DENIED SCREEN (Strict Privacy Enforcement)
  if (accessDenied) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-red-50 brutal-border p-8 brutal-shadow-lg space-y-4">
          <div className="w-14 h-14 bg-red-600 brutal-border text-white flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000]">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase text-taskBlack">
              Private Task Conversation
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70 leading-relaxed">
              Access to this conversation is strictly restricted to the registered task giver and the
              accepted taskmate. Unrelated users are prevented from viewing or participating.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/tasks">
              <BrutalButton variant="yellow" size="md">
                <span>BROWSE TASKS →</span>
              </BrutalButton>
            </Link>
            <Link href="/dashboard">
              <BrutalButton variant="white" size="md">
                <span>DASHBOARD</span>
              </BrutalButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-12 h-12 brutal-border bg-taskYellow animate-spin mx-auto shadow-[3px_3px_0px_0px_#000]" />
        <p className="font-black uppercase text-xs tracking-wider">
          Loading secure task conversation...
        </p>
      </div>
    );
  }

  const isRequester = currentUserId && order && currentUserId === order.requester_id;
  const isWorker = currentUserId && order && currentUserId === order.worker_id;
  const peerUser = isRequester ? worker : requester;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 md:py-8 space-y-3">
      {/* Navigation & Order Status Bar */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Back to Order #{orderId.slice(-6)}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black uppercase bg-[#4DE680] text-black px-2 py-0.5 border border-black shadow-[1.5px_1.5px_0px_0px_#000]">
            🔒 PRIVATE CHAT
          </span>
          <span className="text-[10px] font-mono font-bold uppercase bg-taskYellow px-2 py-0.5 border border-black">
            {order?.status || 'ASSIGNED'}
          </span>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white brutal-border brutal-shadow-lg flex flex-col h-[calc(100vh-170px)] sm:h-[650px] overflow-hidden">
        {/* 1. Task Specification Header (Clearly shows which task conversation belongs to) */}
        <div className="bg-taskYellow border-b-[3px] border-black p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase bg-black text-white px-2 py-0.5">
                  TASK #{task?.id ? task.id.slice(-6) : 'CAMPUS'}
                </span>
                {task?.category && (
                  <span className="text-[10px] font-black uppercase bg-white border border-black px-1.5 py-0.5">
                    {task.category.name}
                  </span>
                )}
                <span className="text-xs font-black bg-white px-2 py-0.5 border border-black">
                  ₹{task?.budget || order?.amount}
                </span>
                {task?.deadline && (
                  <span className="text-[10px] font-black text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due {task.deadline}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-black uppercase text-taskBlack line-clamp-1">
                {task?.title || 'Campus Peer Service'}
              </h2>

              <div className="flex items-center gap-2 text-xs font-bold text-taskBlack/80">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{task?.location || 'Campus Meeting Point'}</span>
                </span>
                {task && (
                  <Link
                    href={`/tasks/${task.id}`}
                    target="_blank"
                    className="text-xs font-black underline hover:text-blue-900 inline-flex items-center gap-0.5 ml-1"
                  >
                    <span>View Task Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Peer Identity Box */}
            <div className="shrink-0 bg-white border border-black p-2 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2.5">
              <div className="w-9 h-9 bg-taskBlue border border-black font-black flex items-center justify-center text-sm">
                {peerUser?.name?.charAt(0) || 'P'}
              </div>
              <div className="text-left text-xs">
                <span className="text-[10px] font-bold text-black/60 uppercase block">
                  {isRequester ? 'Taskmate (Worker)' : 'Task Giver (Requester)'}
                </span>
                <span className="font-black text-taskBlack block leading-tight truncate max-w-[130px]">
                  {peerUser?.name || 'Campus Student'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Guidance Banner for Task Giver and Taskmate */}
        <SafetyGuidanceBanner variant="chat" />

        {/* 2. Message History Log */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]">
          {messages.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-3">
              <div className="w-12 h-12 bg-taskYellow/50 brutal-border flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000]">
                <ShieldCheck className="w-6 h-6 stroke-[2.5] text-black" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black uppercase text-sm text-taskBlack">
                  Private Conversation Ready
                </h4>
                <p className="text-xs font-bold text-black/60 max-w-md mx-auto leading-relaxed">
                  Greet your peer! Use this channel to share notes, clarify requirements, send draft
                  previews, and coordinate in-person campus handover.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isSenderMe = m.sender_id === currentUserId;
              const senderName = isSenderMe
                ? 'You'
                : (m as any).sender?.name || (isRequester ? worker?.name : requester?.name) || 'Peer';

              const attachment = m.attachment;
              const driveLink = (m as any).google_drive_link;

              return (
                <div
                  key={m.id || idx}
                  className={clsx(
                    'p-3 max-w-[85%] sm:max-w-[75%] brutal-border text-xs font-bold space-y-1.5 transition-all',
                    isSenderMe
                      ? 'ml-auto bg-taskYellow text-taskBlack brutal-shadow-sm'
                      : 'mr-auto bg-white text-taskBlack brutal-shadow-sm'
                  )}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase text-black/60 border-b border-black/10 pb-1">
                    <span>{senderName}</span>
                    <span className="font-mono text-[9px] text-black/50">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>

                  {/* File Attachment Card */}
                  {attachment && (
                    <div className="bg-white border-2 border-black p-2.5 mt-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          {attachment.file_type?.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-taskBlue stroke-[2.5] shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-taskYellow stroke-[2.5] shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-black text-xs block truncate text-taskBlack">
                              {attachment.file_name}
                            </span>
                            <span className="text-[10px] text-black/60 font-mono">
                              {attachment.file_size ||
                                (attachment.file_size_bytes
                                  ? formatBytes(attachment.file_size_bytes)
                                  : 'File')}
                            </span>
                          </div>
                        </div>

                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={attachment.file_name}
                          className="brutal-btn bg-taskYellow p-1.5 hover:bg-[#ffe066] shrink-0"
                          title="Download attachment"
                        >
                          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>
                      </div>

                      {/* Image Preview if applicable */}
                      {attachment.file_type?.startsWith('image/') && (
                        <div className="mt-1 border border-black/30 overflow-hidden max-h-48 bg-zinc-100">
                          <img
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            className="w-full h-auto object-cover max-h-48"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Google Drive Shared Card */}
                  {driveLink && (
                    <div className="bg-[#E8F0FE] border-2 border-[#1A73E8] p-2.5 mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-7 h-7 bg-[#1A73E8] text-white flex items-center justify-center border border-black font-black text-xs shrink-0">
                          G
                        </div>
                        <div className="truncate">
                          <span className="font-black text-xs text-[#1A73E8] block truncate">
                            Google Drive Resource
                          </span>
                          <span className="text-[10px] text-black/60 truncate block font-mono">
                            {driveLink}
                          </span>
                        </div>
                      </div>

                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brutal-btn bg-white text-[#1A73E8] border border-[#1A73E8] px-2 py-1 text-[11px] font-black uppercase flex items-center gap-1 hover:bg-[#D2E3FC] shrink-0"
                      >
                        <span>OPEN</span>
                        <ExternalLink className="w-3 h-3 stroke-[3]" />
                      </a>
                    </div>
                  )}

                  {/* Message status tick */}
                  <div className="flex justify-end pt-0.5">
                    {isSenderMe && (
                      <span className="inline-flex items-center text-[9px] text-black/50" title="Delivered">
                        <CheckCheck className="w-3.5 h-3.5 text-black/60" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. File Preview & Upload Progress Notification */}
        {selectedFile && (
          <div className="bg-[#FFFEEA] border-t-2 border-black p-2.5 px-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <Paperclip className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
              <div className="truncate text-xs">
                <span className="font-black text-taskBlack truncate block">{selectedFile.name}</span>
                <span className="text-[10px] text-black/60">{formatBytes(selectedFile.size)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="text-black/60 hover:text-black p-1"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="bg-taskYellow/30 border-t-2 border-black p-2 px-4 space-y-1">
            <div className="flex justify-between text-[11px] font-black uppercase">
              <span>Uploading attachment...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white h-2 brutal-border overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error notification if file rejected */}
        {fileError && (
          <div className="bg-red-50 border-t-2 border-black p-2.5 px-4 flex items-center justify-between text-xs text-red-700 font-bold">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
            <button onClick={() => setFileError(null)} className="text-black/60 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4. Chat Input Form */}
        <form
          onSubmit={handleSend}
          className="p-2.5 sm:p-3 border-t-[3px] border-black bg-white flex items-center gap-2"
        >
          {/* File Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.tex,.ppt,.pptx,.key,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.svg,.gif,.bmp,.psd,.ai,.fig,.zip,.rar,.7z,.tar,.gz,.py,.java,.cpp,.c,.js,.ts,.html,.css,.json"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="brutal-btn bg-white hover:bg-zinc-100 p-2 sm:px-3 text-xs font-black uppercase flex items-center gap-1.5 shrink-0"
            title="Attach file (Up to 50 MB)"
          >
            <Paperclip className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Attach</span>
          </button>

          {/* Share Google Drive Button (Requirement 4) */}
          <button
            type="button"
            onClick={() => setDriveModalOpen(true)}
            className="brutal-btn bg-blue-50 text-blue-800 border-blue-400 hover:bg-blue-100 p-2 sm:px-3 text-xs font-black uppercase flex items-center gap-1.5 shrink-0"
            title="Share files larger than 50 MB via Google Drive"
          >
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Drive Link</span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder="Type your message to peer..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={uploading}
            className="flex-1 brutal-input px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold min-w-0"
          />

          {/* Send Button */}
          <BrutalButton type="submit" variant="yellow" size="md" disabled={uploading}>
            <Send className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">SEND</span>
          </BrutalButton>
        </form>
      </div>

      {/* 5. Google Drive Share Modal (Requirement 4) */}
      {driveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white brutal-border brutal-shadow-lg w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-taskYellow border border-black flex items-center justify-center font-black">
                  📁
                </div>
                <h3 className="font-black text-base uppercase text-taskBlack">
                  Share Google Drive Link
                </h3>
              </div>
              <button
                onClick={() => {
                  setDriveModalOpen(false);
                  setDriveError(null);
                }}
                className="brutal-btn p-1 hover:bg-zinc-100"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            <div className="bg-sky-50 border border-sky-300 p-3 text-xs font-bold text-sky-900 leading-relaxed">
              💡 <strong>Recommended for large files (&gt; 50 MB):</strong> Upload your high-res scans,
              large zip archives, or presentation assets to Google Drive with <em>&quot;Anyone with the link can view&quot;</em> permissions, and paste the share link below.
            </div>

            <form onSubmit={handleSendDriveLink} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
                  Google Drive URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  className="w-full brutal-input p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
                  Optional Note / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full 4K reference video & complete lab scans"
                  value={driveNote}
                  onChange={(e) => setDriveNote(e.target.value)}
                  className="w-full brutal-input p-2.5 text-xs font-bold"
                />
              </div>

              {driveError && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2 border border-red-300">
                  {driveError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <BrutalButton
                  type="button"
                  variant="white"
                  size="md"
                  onClick={() => {
                    setDriveModalOpen(false);
                    setDriveError(null);
                  }}
                >
                  <span>CANCEL</span>
                </BrutalButton>

                <BrutalButton type="submit" variant="yellow" size="md">
                  <Send className="w-3.5 h-3.5 stroke-[3]" />
                  <span>SHARE IN CHAT</span>
                </BrutalButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
