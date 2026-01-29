'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Coffee } from 'lucide-react';
import { playSound, type SoundType } from '@/lib/sounds';

interface PomodoroTimerProps {
  onComplete: (duration: number, startedAt: Date) => void;
  isDisabled?: boolean;
  // Session settings
  totalSessions: number;
  workDuration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number;
  selectedSound: string;
  voiceEnabled: boolean;
}

type SessionPhase = 'work' | 'break' | 'longBreak' | 'completed';

function speak(text: string, volume: number = 0.8) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = volume;
  window.speechSynthesis.speak(utterance);
}

export function PomodoroTimer({
  onComplete,
  isDisabled = false,
  totalSessions,
  workDuration,
  breakDuration,
  longBreakDuration,
  sessionsBeforeLongBreak,
  soundEnabled,
  soundVolume,
  selectedSound,
  voiceEnabled,
}: PomodoroTimerProps) {
  const [currentSession, setCurrentSession] = useState(1);
  const [phase, setPhase] = useState<SessionPhase>('work');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const sessionStartRef = useRef<Date | null>(null);

  const getDurationForPhase = useCallback((p: SessionPhase, session: number) => {
    if (p === 'work') return workDuration * 60;
    if (p === 'longBreak') return longBreakDuration * 60;
    return breakDuration * 60;
  }, [workDuration, breakDuration, longBreakDuration]);

  const isLongBreak = useCallback((session: number) => {
    return session > 0 && session % sessionsBeforeLongBreak === 0 && session < totalSessions;
  }, [sessionsBeforeLongBreak, totalSessions]);

  // Reset when settings change (only if not running)
  useEffect(() => {
    if (!isRunning && phase === 'work' && currentSession === 1 && totalWorkTime === 0) {
      setTimeLeft(workDuration * 60);
    }
  }, [workDuration, isRunning, phase, currentSession, totalWorkTime]);

  // Main timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        if (phase === 'work') {
          setTotalWorkTime(prev => prev + 1);
        }
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Phase completed
      setIsRunning(false);

      // Play sound
      if (soundEnabled) {
        playSound(selectedSound as SoundType, soundVolume / 100);
      }

      if (phase === 'work') {
        // Work session completed
        if (sessionStartRef.current && totalWorkTime > 0) {
          onComplete(totalWorkTime, sessionStartRef.current);
        }

        if (currentSession >= totalSessions) {
          // All sessions completed
          setPhase('completed');
          if (voiceEnabled) {
            speak('Congratulations! All sessions completed. Great work!', soundVolume / 100);
          }
          showNotification('All Sessions Complete!', `You completed ${totalSessions} sessions. Great work!`);
        } else {
          // Move to break
          const nextBreakType = isLongBreak(currentSession) ? 'longBreak' : 'break';
          setPhase(nextBreakType);
          const breakTime = nextBreakType === 'longBreak' ? longBreakDuration : breakDuration;
          setTimeLeft(breakTime * 60);

          if (voiceEnabled) {
            const breakMsg = nextBreakType === 'longBreak'
              ? `Session ${currentSession} complete. Time for a long break. ${longBreakDuration} minutes.`
              : `Session ${currentSession} complete. Take a ${breakDuration} minute break.`;
            speak(breakMsg, soundVolume / 100);
          }
          showNotification('Break Time!', `Session ${currentSession} complete. Take a ${breakTime} minute break.`);

          // Auto-start break
          setTimeout(() => setIsRunning(true), 1500);
        }
      } else if (phase === 'break' || phase === 'longBreak') {
        // Break completed, start next work session
        const nextSession = currentSession + 1;
        setCurrentSession(nextSession);
        setPhase('work');
        setTimeLeft(workDuration * 60);
        sessionStartRef.current = new Date();

        if (voiceEnabled) {
          speak(`Break over. Starting session ${nextSession} of ${totalSessions}. Let's focus!`, soundVolume / 100);
        }
        showNotification('Back to Work!', `Starting session ${nextSession} of ${totalSessions}`);

        // Auto-start work
        setTimeout(() => setIsRunning(true), 1500);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, phase, currentSession, totalSessions, workDuration, breakDuration, longBreakDuration, soundEnabled, soundVolume, selectedSound, voiceEnabled, onComplete, totalWorkTime, isLongBreak]);

  const showNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const toggleTimer = useCallback(() => {
    if (isDisabled || phase === 'completed') return;

    if (!isRunning) {
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
      }
      if (voiceEnabled && phase === 'work' && timeLeft === workDuration * 60) {
        speak(`Starting session ${currentSession} of ${totalSessions}. Focus time!`, soundVolume / 100);
      }
    }
    setIsRunning(prev => !prev);
  }, [isDisabled, isRunning, phase, currentSession, totalSessions, workDuration, voiceEnabled, soundVolume, timeLeft]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentSession(1);
    setPhase('work');
    setTimeLeft(workDuration * 60);
    setTotalWorkTime(0);
    sessionStartRef.current = null;
  }, [workDuration]);

  const skipPhase = useCallback(() => {
    if (phase === 'completed') return;

    setIsRunning(false);

    if (phase === 'work') {
      if (currentSession >= totalSessions) {
        setPhase('completed');
      } else {
        const nextBreakType = isLongBreak(currentSession) ? 'longBreak' : 'break';
        setPhase(nextBreakType);
        const breakTime = nextBreakType === 'longBreak' ? longBreakDuration : breakDuration;
        setTimeLeft(breakTime * 60);
      }
    } else {
      const nextSession = currentSession + 1;
      setCurrentSession(nextSession);
      setPhase('work');
      setTimeLeft(workDuration * 60);
      sessionStartRef.current = new Date();
    }
  }, [phase, currentSession, totalSessions, workDuration, breakDuration, longBreakDuration, isLongBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    if (phase === 'work') return { from: '#f97316', to: '#ec4899', shadow: 'shadow-orange-500/25' };
    if (phase === 'completed') return { from: '#22c55e', to: '#10b981', shadow: 'shadow-green-500/25' };
    return { from: '#06b6d4', to: '#3b82f6', shadow: 'shadow-cyan-500/25' };
  };

  const getStatusText = () => {
    if (phase === 'completed') return 'All Done!';
    if (!isRunning && timeLeft === getDurationForPhase(phase, currentSession)) return 'Ready';
    if (!isRunning) return 'Paused';
    if (phase === 'work') return 'Focus Time';
    if (phase === 'longBreak') return 'Long Break';
    return 'Break Time';
  };

  const totalDuration = getDurationForPhase(phase, currentSession);
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const colors = getPhaseColor();

  return (
    <div className="flex flex-col items-center">
      {/* Session indicators */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: totalSessions }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i + 1 < currentSession
                ? 'bg-green-500'
                : i + 1 === currentSession
                ? phase === 'work'
                  ? 'bg-orange-500 ring-2 ring-orange-500/30'
                  : 'bg-cyan-500 ring-2 ring-cyan-500/30'
                : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      {/* Phase indicator */}
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 ${
        phase === 'work' ? 'bg-orange-500/10 text-orange-400' :
        phase === 'completed' ? 'bg-green-500/10 text-green-400' :
        'bg-cyan-500/10 text-cyan-400'
      }`}>
        {phase === 'break' || phase === 'longBreak' ? <Coffee size={14} /> : null}
        <span className="text-sm font-medium">
          {phase === 'work' && `Session ${currentSession}/${totalSessions}`}
          {phase === 'break' && 'Short Break'}
          {phase === 'longBreak' && 'Long Break'}
          {phase === 'completed' && 'Completed'}
        </span>
      </div>

      {/* Timer display */}
      <div className="relative w-80 h-80">
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
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke={`url(#pomodoro-gradient-${phase})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id={`pomodoro-gradient-${phase}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-light tracking-tight text-white tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-zinc-500 mt-2 uppercase tracking-widest">
            {getStatusText()}
          </span>
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
          disabled={isDisabled || phase === 'completed'}
          className={`p-6 rounded-full transition-all duration-200 ${
            isDisabled || phase === 'completed'
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : `bg-gradient-to-r from-[${colors.from}] to-[${colors.to}] hover:opacity-90 text-white shadow-lg ${colors.shadow}`
          }`}
          style={!isDisabled && phase !== 'completed' ? { background: `linear-gradient(to right, ${colors.from}, ${colors.to})` } : undefined}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={skipPhase}
          disabled={phase === 'completed'}
          className={`p-4 rounded-full transition-all duration-200 ${
            phase === 'completed'
              ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
              : 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white'
          }`}
          aria-label="Skip to next phase"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Total work time */}
      {totalWorkTime > 0 && (
        <p className="text-sm text-zinc-500 mt-6">
          Total focus time: {Math.floor(totalWorkTime / 60)}m {totalWorkTime % 60}s
        </p>
      )}
    </div>
  );
}
