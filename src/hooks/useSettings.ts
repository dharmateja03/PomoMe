'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Settings {
  timerDuration: number; // in minutes
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  selectedSound: string;
  timezone: string; // IANA timezone identifier
}

const DEFAULT_SETTINGS: Settings = {
  timerDuration: 25,
  soundEnabled: true,
  soundVolume: 80,
  selectedSound: 'bell',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export const TIMEZONE_OPTIONS = [
  { id: 'America/Los_Angeles', name: 'Pacific Time (PT)', offset: 'UTC-8' },
  { id: 'America/Denver', name: 'Mountain Time (MT)', offset: 'UTC-7' },
  { id: 'America/Chicago', name: 'Central Time (CT)', offset: 'UTC-6' },
  { id: 'America/New_York', name: 'Eastern Time (ET)', offset: 'UTC-5' },
  { id: 'America/Sao_Paulo', name: 'Brasília Time', offset: 'UTC-3' },
  { id: 'Europe/London', name: 'London (GMT)', offset: 'UTC+0' },
  { id: 'Europe/Paris', name: 'Central European', offset: 'UTC+1' },
  { id: 'Europe/Moscow', name: 'Moscow Time', offset: 'UTC+3' },
  { id: 'Asia/Dubai', name: 'Dubai Time', offset: 'UTC+4' },
  { id: 'Asia/Kolkata', name: 'India Standard Time', offset: 'UTC+5:30' },
  { id: 'Asia/Shanghai', name: 'China Standard Time', offset: 'UTC+8' },
  { id: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+9' },
  { id: 'Australia/Sydney', name: 'Sydney Time', offset: 'UTC+11' },
  { id: 'Pacific/Auckland', name: 'New Zealand Time', offset: 'UTC+13' },
];

const STORAGE_KEY = 'pomodo-me-settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch {
          // Invalid JSON, use defaults
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      }
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}

// Sound options
export const SOUND_OPTIONS = [
  { id: 'bell', name: 'Bell', file: '/sounds/bell.mp3' },
  { id: 'chime', name: 'Chime', file: '/sounds/chime.mp3' },
  { id: 'gong', name: 'Gong', file: '/sounds/gong.mp3' },
  { id: 'digital', name: 'Digital', file: '/sounds/digital.mp3' },
];

// Timer duration presets (in minutes)
export const DURATION_PRESETS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
];
