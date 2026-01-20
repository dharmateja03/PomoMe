'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Users, ArrowLeft } from 'lucide-react';

interface RoomPreview {
  id: number;
  name: string;
  host: {
    id: number;
    name: string | null;
    email: string;
  };
  timerDuration: number;
  maxParticipants: number;
  isPublic: boolean;
}

export default function JoinRoomPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [room, setRoom] = useState<RoomPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  const inviteCode = params?.code as string;

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Store the invite code in sessionStorage so we can redirect after login
      if (inviteCode) {
        sessionStorage.setItem('pendingRoomInvite', inviteCode);
      }
      router.push('/login');
    }
  }, [status, router, inviteCode]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!inviteCode || status !== 'authenticated') return;

      try {
        const res = await fetch(`/api/rooms/join/${inviteCode}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Room not found');
        }
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to find room');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [inviteCode, status]);

  const handleJoin = async () => {
    if (!room) return;

    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${room.id}/join`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        // If already in room, just redirect
        if (data.error === 'Already in room') {
          router.push(`/room/${room.id}`);
          return;
        }
        throw new Error(data.error || 'Failed to join room');
      }

      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setJoining(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  if (status === 'loading' || (loading && status === 'authenticated')) {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C967E8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 mt-4">Finding room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Room Not Found</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#010101] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#983AD6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FA93FA]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Join Study Room</h1>
            <p className="text-zinc-400 mt-1">You've been invited to join a study session</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-3 mb-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white">{room.name}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Host</span>
                <span className="text-white">
                  {room.host.name || room.host.email.split('@')[0]}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Timer Duration</span>
                <span className="text-white">{formatDuration(room.timerDuration)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Max Participants</span>
                <span className="text-white flex items-center gap-1">
                  <Users size={14} />
                  {room.maxParticipants}
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] hover:opacity-90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
