'use client';

import { useState } from 'react';
import { X, Users, Clock, Copy, Check } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (roomId: number, inviteCode: string) => void;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 * 60 },
  { label: '25 min', value: 25 * 60 },
  { label: '45 min', value: 45 * 60 },
  { label: '60 min', value: 60 * 60 },
  { label: '90 min', value: 90 * 60 },
];

export function CreateRoomModal({ isOpen, onClose, onRoomCreated }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(25 * 60);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdRoom, setCreatedRoom] = useState<{ id: number; inviteCode: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a room name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          timerDuration: duration,
          maxParticipants,
          isPublic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create room');
      }

      const room = await res.json();
      setCreatedRoom({ id: room.id, inviteCode: room.inviteCode });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const getInviteLink = () => {
    if (!createdRoom) return '';
    return `${window.location.origin}/room/join/${createdRoom.inviteCode}`;
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(getInviteLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleGoToRoom = () => {
    if (createdRoom) {
      onRoomCreated(createdRoom.id, createdRoom.inviteCode);
    }
  };

  const handleClose = () => {
    setName('');
    setDuration(25 * 60);
    setMaxParticipants(10);
    setIsPublic(false);
    setError('');
    setCreatedRoom(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">
            {createdRoom ? 'Room Created!' : 'Create Study Room'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6">
          {createdRoom ? (
            <div className="space-y-6">
              <p className="text-zinc-400">
                Your study room is ready! Share the invite link with friends.
              </p>

              <div className="space-y-2">
                <label className="text-sm text-zinc-500">Invite Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getInviteLink()}
                    readOnly
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <Copy size={20} className="text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleGoToRoom}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all"
              >
                Go to Room
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-zinc-500">Room Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Study Session"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-500 flex items-center gap-2">
                  <Clock size={16} />
                  Timer Duration
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        duration === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-500 flex items-center gap-2">
                  <Users size={16} />
                  Max Participants
                </label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  {[2, 5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} people
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-zinc-300">Make room public</span>
              </label>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
