'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Maximize, Minimize, Keyboard } from 'lucide-react';
import { playSound, type SoundType } from '@/lib/sounds';

interface CountdownTimerProps {
  soundEnabled?: boolean;
  soundVolume?: number;
  selectedSound?: string;
}

export function CountdownTimer({
  soundEnabled = true,
  soundVolume = 80,
  selectedSound = 'bell',
}: CountdownTimerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSetTime = hours * 3600 + minutes * 60 + seconds;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            if (soundEnabled) {
              playSound(selectedSound as SoundType, soundVolume / 100);
            }
            // Show notification
            if (typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification('Timer Complete!', {
                  body: 'Your countdown timer has finished.',
                  icon: '/favicon.ico',
                });
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timeLeft, soundEnabled, soundVolume, selectedSound]);

  const startTimer = useCallback(() => {
    if (timeLeft === 0 && !isRunning) {
      const total = hours * 3600 + minutes * 60 + seconds;
      if (total > 0) {
        setTimeLeft(total);
        setIsCompleted(false);
        setIsRunning(true);
      }
    } else if (timeLeft > 0) {
      setIsRunning(true);
    }
  }, [hours, minutes, seconds, timeLeft, isRunning]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, pauseTimer, startTimer]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    setIsCompleted(false);
  }, []);

  const adjustTime = (type: 'hours' | 'minutes' | 'seconds', delta: number) => {
    if (isRunning) return;

    if (type === 'hours') {
      setHours(prev => Math.max(0, Math.min(23, prev + delta)));
    } else if (type === 'minutes') {
      setMinutes(prev => Math.max(0, Math.min(59, prev + delta)));
    } else {
      setSeconds(prev => Math.max(0, Math.min(59, prev + delta)));
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggleTimer();
          break;
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            resetTimer();
          }
          break;
        case 'KeyF':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          setShowShortcuts(false);
          break;
        case 'Slash':
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcuts(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTimer, resetTimer, toggleFullscreen, isFullscreen]);

  const formatDisplay = (value: number) => value.toString().padStart(2, '0');

  const displayHours = Math.floor(timeLeft / 3600);
  const displayMinutes = Math.floor((timeLeft % 3600) / 60);
  const displaySeconds = timeLeft % 60;

  const progress = totalSetTime > 0 ? ((totalSetTime - timeLeft) / totalSetTime) * 100 : 0;
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const showTimeInput = !isRunning && timeLeft === 0;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#010101] justify-center' : ''
      }`}
    >
      {/* Fullscreen header */}
      {isFullscreen && (
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            Pomodo<span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">Me</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <Minimize size={20} />
          </button>
        </div>
      )}

      {/* Timer Display */}
      <div className={`relative ${isFullscreen ? 'w-96 h-96' : 'w-80 h-80'}`}>
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
            stroke="url(#countdown-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
          <defs>
            <linearGradient id="countdown-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showTimeInput && !isFullscreen ? (
            <div className="flex items-center gap-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => adjustTime('hours', 1)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
                <span className="text-4xl font-light text-white tabular-nums w-12 text-center">
                  {formatDisplay(hours)}
                </span>
                <button
                  onClick={() => adjustTime('hours', -1)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xs text-zinc-500 mt-1">hrs</span>
              </div>

              <span className="text-4xl font-light text-zinc-500">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => adjustTime('minutes', 1)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
                <span className="text-4xl font-light text-white tabular-nums w-12 text-center">
                  {formatDisplay(minutes)}
                </span>
                <button
                  onClick={() => adjustTime('minutes', -1)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xs text-zinc-500 mt-1">min</span>
              </div>

              <span className="text-4xl font-light text-zinc-500">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => adjustTime('seconds', 1)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
                <span className="text-4xl font-light text-white tabular-nums w-12 text-center">
                  {formatDisplay(seconds)}
                </span>
                <button
                  onClick={() => adjustTime('seconds', -1)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xs text-zinc-500 mt-1">sec</span>
              </div>
            </div>
          ) : (
            <>
              <span className={`font-light tracking-tight text-white tabular-nums ${isFullscreen ? 'text-8xl' : 'text-5xl'}`}>
                {displayHours > 0 && `${formatDisplay(displayHours)}:`}
                {formatDisplay(displayMinutes)}:{formatDisplay(displaySeconds)}
              </span>
              <span className={`text-zinc-500 mt-2 uppercase tracking-widest ${isFullscreen ? 'text-base' : 'text-sm'}`}>
                {isCompleted ? 'Complete!' : isRunning ? 'Counting Down' : 'Paused'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Preset buttons */}
      {showTimeInput && !isFullscreen && (
        <div className="flex gap-2 mt-4">
          {[
            { label: '1m', h: 0, m: 1, s: 0 },
            { label: '5m', h: 0, m: 5, s: 0 },
            { label: '10m', h: 0, m: 10, s: 0 },
            { label: '15m', h: 0, m: 15, s: 0 },
            { label: '30m', h: 0, m: 30, s: 0 },
            { label: '1h', h: 1, m: 0, s: 0 },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setHours(preset.h);
                setMinutes(preset.m);
                setSeconds(preset.s);
              }}
              className="px-3 py-1.5 text-sm bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

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
          onClick={isRunning ? pauseTimer : startTimer}
          disabled={showTimeInput && totalSetTime === 0}
          className={`p-6 rounded-full transition-all duration-200 ${
            showTimeInput && totalSetTime === 0
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/25'
          }`}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <div className="w-14" /> {/* Spacer for symmetry */}
      </div>

      {/* Fullscreen & Shortcuts buttons */}
      <div className={`flex items-center gap-3 ${isFullscreen ? 'mt-10' : 'mt-6'}`}>
        {!isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white rounded-lg transition-all text-sm"
          >
            <Maximize size={16} />
            Focus Mode
          </button>
        )}
        <button
          onClick={() => setShowShortcuts(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white rounded-lg transition-all text-sm"
        >
          <Keyboard size={16} />
          Shortcuts
        </button>
      </div>

      {/* Keyboard shortcuts help */}
      {showShortcuts && (
        <div className={`mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 ${isFullscreen ? 'text-base' : 'text-sm'}`}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-zinc-400">
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">Space</kbd>
              <span>Start / Pause</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">R</kbd>
              <span>Reset</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">F</kbd>
              <span>Fullscreen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">Esc</kbd>
              <span>Exit Fullscreen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">?</kbd>
              <span>Toggle Help</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
