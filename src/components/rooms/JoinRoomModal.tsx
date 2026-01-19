'use client';

import { useState } from 'react';
import { X, Users } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomId: number) => void;
}

interface RoomPreview {
  id: number;
  name: string;
  host: {
    name: string | null;
    email: string;
  };
  timerDuration: number;
  maxParticipants: number;
}

export function JoinRoomModal({ isOpen, onClose, onJoin }: JoinRoomModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomPreview, setRoomPreview] = useState<RoomPreview | null>(null);
  const [joining, setJoining] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async () => {
    const code = inviteCode.trim();
    if (!code) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    setError('');
    setRoomPreview(null);

    try {
      const res = await fetch(`/api/rooms/join/${code}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Room not found');
      }

      const room = await res.json();
      setRoomPreview(room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomPreview) return;

    setJoining(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${roomPreview.id}/join`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to join room');
      }

      onJoin(roomPreview.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const handleClose = () => {
    setInviteCode('');
    setError('');
    setRoomPreview(null);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} minutes`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Join Study Room</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!roomPreview ? (
            <>
              <div className="space-y-2">
                <label className="text-sm text-zinc-500">Invite Code or Link</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                  placeholder="Enter invite code..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
                <p className="text-xs text-zinc-500">
                  Enter the invite code or paste the full invite link
                </p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleLookup}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Looking up...' : 'Find Room'}
              </button>
            </>
          ) : (
            <>
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white">{roomPreview.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Host</span>
                    <span className="text-white">
                      {roomPreview.host.name || roomPreview.host.email.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Timer</span>
                    <span className="text-white">{formatDuration(roomPreview.timerDuration)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Max participants</span>
                    <span className="text-white flex items-center gap-1">
                      <Users size={14} />
                      {roomPreview.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setRoomPreview(null)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joining ? 'Joining...' : 'Join Room'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
