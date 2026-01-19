'use client';

import { Play, Pause, RotateCcw, Lock } from 'lucide-react';

interface RoomTimerProps {
  timeLeft: number;
  duration: number;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  isHost: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  soundEnabled?: boolean;
}

export function RoomTimer({
  timeLeft,
  duration,
  status,
  isHost,
  onStart,
  onPause,
  onReset,
}: RoomTimerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return 'Focus Time';
      case 'completed':
        return 'Complete!';
      case 'paused':
        return 'Paused';
      default:
        return 'Ready';
    }
  };

  const isRunning = status === 'active';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-80 h-80">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          {/* Progress circle */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="url(#room-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="room-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-light tracking-tight text-white tabular-nums ${
            timeLeft >= 3600 ? 'text-5xl' : 'text-6xl'
          }`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-zinc-500 mt-2 uppercase tracking-widest">
            {getStatusText()}
          </span>
          {!isHost && (
            <span className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
              <Lock size={12} />
              Host controls timer
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={onReset}
          disabled={!isHost}
          className={`p-4 rounded-full transition-all duration-200 ${
            isHost
              ? 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white'
              : 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
          }`}
          aria-label="Reset timer"
          title={isHost ? 'Reset timer' : 'Only host can control timer'}
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={isRunning ? onPause : onStart}
          disabled={!isHost}
          className={`p-6 rounded-full transition-all duration-200 ${
            !isHost
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-400 hover:to-blue-400 text-white shadow-lg shadow-violet-500/25'
          }`}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          title={isHost ? (isRunning ? 'Pause timer' : 'Start timer') : 'Only host can control timer'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
