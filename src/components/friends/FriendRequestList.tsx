'use client';

import { useState } from 'react';
import { Check, X, User } from 'lucide-react';

interface FriendRequest {
  id: number;
  senderId: number;
  senderName: string | null;
  senderEmail: string;
  createdAt: string;
}

interface FriendRequestListProps {
  requests: FriendRequest[];
  onAccept: (requestId: number) => Promise<boolean>;
  onReject: (requestId: number) => Promise<boolean>;
}

export function FriendRequestList({ requests, onAccept, onReject }: FriendRequestListProps) {
  const [processing, setProcessing] = useState<number | null>(null);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const handleAccept = async (requestId: number) => {
    setProcessing(requestId);
    await onAccept(requestId);
    setProcessing(null);
  };

  const handleReject = async (requestId: number) => {
    setProcessing(requestId);
    await onReject(requestId);
    setProcessing(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-500 text-sm">No pending requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
            {getInitials(request.senderName, request.senderEmail)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {request.senderName || request.senderEmail.split('@')[0]}
            </p>
            <p className="text-zinc-500 text-xs">{formatDate(request.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(request.id)}
              disabled={processing === request.id}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50"
              title="Accept"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => handleReject(request.id)}
              disabled={processing === request.id}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
              title="Reject"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
