'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, Users } from 'lucide-react';
import { RoomTimer } from './RoomTimer';
import { ParticipantList } from './ParticipantList';
import { InviteLinkShare } from './InviteLinkShare';
import { JoinRequestList } from './JoinRequestList';
import { useStudyRoom } from '@/hooks/useStudyRoom';
import { playSound, type SoundType } from '@/lib/sounds';

interface RoomViewProps {
  roomId: number;
  token: string;
  currentUserId: number;
  onLeave: () => void;
  soundEnabled: boolean;
  soundVolume: number;
  selectedSound: string;
}

export function RoomView({
  roomId,
  token,
  currentUserId,
  onLeave,
  soundEnabled,
  soundVolume,
  selectedSound,
}: RoomViewProps) {
  const {
    room,
    isConnected,
    onlineUsers,
    error,
    loading,
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    leaveRoom,
  } = useStudyRoom({ roomId, token });

  const [leaving, setLeaving] = useState(false);
  const [prevStatus, setPrevStatus] = useState(timerState.status);

  // Play sound when timer completes
  useEffect(() => {
    if (prevStatus === 'active' && timerState.status === 'completed') {
      if (soundEnabled) {
        playSound(selectedSound as SoundType, soundVolume / 100);
      }
      // Show browser notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Study Session Complete!', {
          body: 'Great job! Your group study session is complete.',
          icon: '/favicon.ico',
        });
      }
    }
    setPrevStatus(timerState.status);
  }, [timerState.status, prevStatus, soundEnabled, soundVolume, selectedSound]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await leaveRoom();
      onLeave();
    } catch (err) {
      console.error('Failed to leave room:', err);
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 mt-4">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={onLeave}
            className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onLeave}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
              {isConnected ? 'Connected' : 'Connecting...'}
            </div>

            <button
              onClick={handleLeave}
              disabled={leaving}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut size={18} />
              {leaving ? 'Leaving...' : 'Leave Room'}
            </button>
          </div>
        </div>

        {/* Room name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">{room.name}</h1>
          <p className="text-zinc-500 mt-1">
            Hosted by {room.host.name || room.host.email.split('@')[0]}
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer - center column */}
          <div className="lg:col-span-2 flex justify-center">
            <RoomTimer
              timeLeft={timerState.timeLeft}
              duration={timerState.duration}
              status={timerState.status}
              isHost={room.isHost}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <JoinRequestList roomId={roomId} isHost={room.isHost} />
            <ParticipantList
              participants={room.participants}
              hostId={room.hostId}
              onlineUsers={onlineUsers}
              currentUserId={currentUserId}
            />
            <InviteLinkShare inviteCode={room.inviteCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
