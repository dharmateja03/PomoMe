'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, X, Bell } from 'lucide-react';

interface JoinRequest {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string;
  createdAt: string;
}

interface JoinRequestListProps {
  roomId: number;
  isHost: boolean;
}

export function JoinRequestList({ roomId, isHost }: JoinRequestListProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!isHost) return;

    try {
      const res = await fetch(`/api/rooms/${roomId}/requests`);
      if (!res.ok) return;
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching join requests:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, isHost]);

  useEffect(() => {
    fetchRequests();
    // Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleAction = async (requestId: number, action: 'accept' | 'reject') => {
    setProcessing(requestId);

    try {
      const res = await fetch(`/api/rooms/${roomId}/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error('Error handling request:', err);
    } finally {
      setProcessing(null);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  if (!isHost || loading) return null;

  if (requests.length === 0) return null;

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Bell size={14} className="text-yellow-500" />
        Join Requests ({requests.length})
      </h3>
      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-medium text-xs">
              {getInitials(request.userName, request.userEmail)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {request.userName || request.userEmail.split('@')[0]}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleAction(request.id, 'accept')}
                disabled={processing === request.id}
                className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors disabled:opacity-50"
                title="Accept"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => handleAction(request.id, 'reject')}
                disabled={processing === request.id}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors disabled:opacity-50"
                title="Reject"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
