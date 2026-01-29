'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Maximize, Minimize, Keyboard } from 'lucide-react';

interface StopwatchProps {
  onClose?: () => void;
}

export function Stopwatch({ onClose }: StopwatchProps) {
  const [time, setTime] = useState(0); // time in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - accumulatedTimeRef.current;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      accumulatedTimeRef.current = time;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const toggleStopwatch = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const resetStopwatch = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
  }, []);

  const addLap = useCallback(() => {
    if (isRunning && time > 0) {
      setLaps(prev => [time, ...prev]);
    }
  }, [isRunning, time]);

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
          toggleStopwatch();
          break;
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            resetStopwatch();
          }
          break;
        case 'KeyL':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            addLap();
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
  }, [toggleStopwatch, resetStopwatch, addLap, toggleFullscreen, isFullscreen]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const formatLapDiff = (current: number, previous: number | undefined) => {
    const diff = previous ? current - previous : current;
    return formatTime(diff);
  };

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

      {/* Time Display */}
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
            stroke="url(#stopwatch-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 140}
            strokeDashoffset={2 * Math.PI * 140 * (1 - (time % 60000) / 60000)}
            className="transition-all duration-100"
          />
          <defs>
            <linearGradient id="stopwatch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-light tracking-tight text-white tabular-nums ${
            isFullscreen ? 'text-7xl' : time >= 3600000 ? 'text-4xl' : 'text-5xl'
          }`}>
            {formatTime(time)}
          </span>
          <span className={`text-zinc-500 mt-2 uppercase tracking-widest ${isFullscreen ? 'text-base' : 'text-sm'}`}>
            {isRunning ? 'Running' : time > 0 ? 'Paused' : 'Stopwatch'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={resetStopwatch}
          className="p-4 rounded-full bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white transition-all duration-200"
          aria-label="Reset stopwatch"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={toggleStopwatch}
          className="p-6 rounded-full transition-all duration-200 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-white shadow-lg shadow-green-500/25"
          aria-label={isRunning ? 'Pause stopwatch' : 'Start stopwatch'}
        >
          {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={addLap}
          disabled={!isRunning}
          className={`p-4 rounded-full transition-all duration-200 ${
            isRunning
              ? 'bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-white'
              : 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
          }`}
          aria-label="Add lap"
        >
          <Flag size={24} />
        </button>
      </div>

      {/* Laps */}
      {laps.length > 0 && !isFullscreen && (
        <div className="mt-8 w-full max-w-xs">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Laps</h3>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {laps.map((lap, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-zinc-800/30 rounded-lg"
              >
                <span className="text-sm text-zinc-400">Lap {laps.length - index}</span>
                <div className="text-right">
                  <span className="text-sm text-white tabular-nums">{formatTime(lap)}</span>
                  <span className="text-xs text-zinc-500 ml-2 tabular-nums">
                    +{formatLapDiff(lap, laps[index + 1])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <span>Start / Stop</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">R</kbd>
              <span>Reset</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-zinc-700 rounded text-xs text-white">L</kbd>
              <span>Add Lap</span>
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
