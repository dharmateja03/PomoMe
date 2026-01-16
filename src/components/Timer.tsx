'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { playSound, type SoundType } from '@/lib/sounds';

interface TimerProps {
  onComplete: (duration: number) => void;
  isDisabled?: boolean;
  durationMinutes: number;
  soundEnabled: boolean;
  soundVolume: number;
  selectedSound: string;
}

export function Timer({
  onComplete,
  isDisabled = false,
  durationMinutes,
  soundEnabled,
  soundVolume,
  selectedSound,
}: TimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const hasCompletedRef = useRef(false);

  // Reset timer when duration changes (only if not running)
  useEffect(() => {
    if (!isRunning && sessionDuration === 0) {
      setTimeLeft(totalSeconds);
    }
  }, [totalSeconds, isRunning, sessionDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setIsRunning(false);
      onComplete(sessionDuration);

      // Play notification sound
      if (soundEnabled) {
        playSound(selectedSound as SoundType, soundVolume / 100);
      }

      // Show browser notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Timer Complete!', {
            body: `Great job! You focused for ${formatDuration(sessionDuration)}.`,
            icon: '/favicon.ico',
          });
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, sessionDuration, onComplete, soundEnabled, soundVolume, selectedSound]);

  const toggleTimer = useCallback(() => {
    if (isDisabled) return;
    if (!isRunning) {
      hasCompletedRef.current = false;
    }
    setIsRunning(prev => !prev);
  }, [isDisabled, isRunning]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    if (sessionDuration > 60) {
      onComplete(sessionDuration);
    }
    setTimeLeft(totalSeconds);
    setSessionDuration(0);
    hasCompletedRef.current = false;
  }, [sessionDuration, onComplete, totalSeconds]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusText = () => {
    if (isRunning) return 'Focus Time';
    if (timeLeft === 0) return 'Complete!';
    if (timeLeft === totalSeconds) return 'Ready';
    return 'Paused';
  };

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
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#ec4899" />
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
          {sessionDuration > 0 && !isRunning && timeLeft > 0 && (
            <span className="text-xs text-zinc-600 mt-1">
              {formatDuration(sessionDuration)} elapsed
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200"
          aria-label="Reset timer"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={toggleTimer}
          disabled={isDisabled}
          className={`p-6 rounded-full transition-all duration-200 ${
            isDisabled
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-lg shadow-orange-500/25'
          }`}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
