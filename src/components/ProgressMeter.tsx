'use client';

import { type Category } from '@/lib/db/schema';

interface ProgressMeterProps {
  category: Category;
  totalSeconds: number;
}

export function ProgressMeter({ category, totalSeconds }: ProgressMeterProps) {
  const targetSeconds = category.targetHours * 3600;
  const progress = Math.min((totalSeconds / targetSeconds) * 100, 100);
  const hoursCompleted = totalSeconds / 3600;
  const hoursRemaining = Math.max(category.targetHours - hoursCompleted, 0);

  // Determine color based on progress
  const getStatusColor = () => {
    if (progress >= 100) return { bg: '#22c55e', text: 'Completed!', emoji: '' };
    if (progress >= 70) return { bg: '#22c55e', text: 'Almost there!', emoji: '' };
    if (progress >= 40) return { bg: '#eab308', text: 'Keep going!', emoji: '' };
    return { bg: '#ef4444', text: 'Get started!', emoji: '' };
  };

  const status = getStatusColor();

  const formatHours = (hours: number) => {
    if (hours < 1) {
      const mins = Math.round(hours * 60);
      return `${mins}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-zinc-800/30 rounded-2xl p-5 border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm font-medium text-zinc-300">{category.name}</span>
          </div>
          <span className="text-xs text-zinc-500">
            {formatHours(hoursCompleted)} / {category.targetHours}h
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-zinc-700/50 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${status.bg}80, ${status.bg})`,
              boxShadow: `0 0 20px ${status.bg}40`,
            }}
          />
          {/* Milestone markers */}
          <div className="absolute inset-0 flex">
            <div className="w-[40%] border-r border-zinc-600/50" />
            <div className="w-[30%] border-r border-zinc-600/50" />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mt-3">
          <span
            className="text-sm font-medium"
            style={{ color: status.bg }}
          >
            {status.text}
          </span>
          <span className="text-xs text-zinc-500">
            {hoursRemaining > 0 ? `${formatHours(hoursRemaining)} remaining` : 'Target reached!'}
          </span>
        </div>

        {/* Progress percentage */}
        <div className="mt-4 flex items-center justify-center">
          <div
            className="text-4xl font-bold tabular-nums"
            style={{ color: status.bg }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}
