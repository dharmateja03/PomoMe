'use client';

import { useState } from 'react';
import { X, Settings as SettingsIcon, Volume2, VolumeX, Clock, RotateCcw, Play } from 'lucide-react';
import { type Settings as SettingsType, DURATION_PRESETS } from '@/hooks/useSettings';
import { playSound, type SoundType } from '@/lib/sounds';

const SOUND_OPTIONS = [
  { id: 'bell', name: 'Bell' },
  { id: 'chime', name: 'Chime' },
  { id: 'gong', name: 'Gong' },
  { id: 'digital', name: 'Digital' },
];

interface SettingsProps {
  settings: SettingsType;
  onUpdate: (updates: Partial<SettingsType>) => void;
  onReset: () => void;
  onClose: () => void;
}

export function Settings({ settings, onUpdate, onReset, onClose }: SettingsProps) {
  const [customDuration, setCustomDuration] = useState(
    !DURATION_PRESETS.some(p => p.value === settings.timerDuration)
      ? settings.timerDuration
      : 0
  );

  const playTestSound = () => {
    if (settings.soundEnabled) {
      playSound(settings.selectedSound as SoundType, settings.soundVolume / 100);
    }
  };

  const handleCustomDuration = (value: string) => {
    const mins = parseInt(value) || 0;
    setCustomDuration(mins);
    if (mins > 0 && mins <= 480) {
      onUpdate({ timerDuration: mins });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <SettingsIcon size={20} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timer Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-3">
              <Clock size={16} />
              Timer Duration
            </label>

            {/* Preset buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {DURATION_PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => {
                    onUpdate({ timerDuration: preset.value });
                    setCustomDuration(0);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    settings.timerDuration === preset.value
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom duration input */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">Custom:</span>
              <input
                type="number"
                min="1"
                max="480"
                value={customDuration || ''}
                onChange={e => handleCustomDuration(e.target.value)}
                placeholder="minutes"
                className="w-24 px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <span className="text-sm text-zinc-500">minutes</span>
            </div>
          </div>

          {/* Sound Settings */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-3">
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Sound Notification
            </label>

            {/* Enable/Disable toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-300">Play sound when timer ends</span>
              <button
                onClick={() => onUpdate({ soundEnabled: !settings.soundEnabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.soundEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {settings.soundEnabled && (
              <>
                {/* Sound selection */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {SOUND_OPTIONS.map(sound => (
                    <button
                      key={sound.id}
                      onClick={() => onUpdate({ selectedSound: sound.id })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.selectedSound === sound.id
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                      }`}
                    >
                      {sound.name}
                    </button>
                  ))}
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-4 mb-4">
                  <VolumeX size={16} className="text-zinc-500" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.soundVolume}
                    onChange={e => onUpdate({ soundVolume: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer"
                  />
                  <Volume2 size={16} className="text-zinc-500" />
                  <span className="text-sm text-zinc-400 w-10 text-right">{settings.soundVolume}%</span>
                </div>

                {/* Test sound button */}
                <button
                  onClick={playTestSound}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white rounded-lg transition-all text-sm"
                >
                  <Play size={14} />
                  Test Sound
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white rounded-lg font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
