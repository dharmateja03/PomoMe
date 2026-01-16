'use client';

import { X, BarChart3, TrendingUp, Target, Flame } from 'lucide-react';
import { type Category, type Session } from '@/lib/db/schema';

interface AnalyticsProps {
  sessions: Session[];
  categories: Category[];
  onClose: () => void;
}

export function Analytics({ sessions, categories, onClose }: AnalyticsProps) {
  const getCategoryById = (id: number) =>
    categories.find(c => c.id === id) || { name: 'Unknown', color: '#666', targetHours: 10 };

  // Calculate stats
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = totalSeconds / 3600;
  const totalSessions = sessions.length;

  // Sessions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = sessions.filter(s => new Date(s.completedAt) >= weekAgo);
  const weekHours = weekSessions.reduce((sum, s) => sum + s.duration, 0) / 3600;

  // Sessions today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySessions = sessions.filter(s => new Date(s.completedAt) >= today);
  const todayHours = todaySessions.reduce((sum, s) => sum + s.duration, 0) / 3600;

  // Calculate streak
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;

    const sessionDates = [...new Set(
      sessions.map(s => new Date(s.completedAt).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Check if today has a session
    const todayStr = checkDate.toDateString();
    if (!sessionDates.includes(todayStr)) {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toDateString();
      if (sessionDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  // Category breakdown
  const categoryStats = categories.map(cat => {
    const catSessions = sessions.filter(s => s.categoryId === cat.id);
    const totalTime = catSessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      ...cat,
      totalTime,
      sessionCount: catSessions.length,
      progress: Math.min((totalTime / 3600 / cat.targetHours) * 100, 100),
    };
  }).sort((a, b) => b.totalTime - a.totalTime);

  // Daily activity for last 7 days
  const dailyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const daySeconds = sessions
      .filter(s => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate >= date && sessionDate < nextDate;
      })
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: daySeconds / 3600,
    };
  });

  const maxDayHours = Math.max(...dailyActivity.map(d => d.hours), 1);

  const formatHours = (hours: number) => {
    if (hours < 1) {
      const mins = Math.round(hours * 60);
      return `${mins}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[85vh] border border-zinc-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <BarChart3 size={20} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <TrendingUp size={14} />
                Today
              </div>
              <p className="text-2xl font-bold text-white">{formatHours(todayHours)}</p>
            </div>

            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <BarChart3 size={14} />
                This Week
              </div>
              <p className="text-2xl font-bold text-white">{formatHours(weekHours)}</p>
            </div>

            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <Target size={14} />
                Total
              </div>
              <p className="text-2xl font-bold text-white">{formatHours(totalHours)}</p>
            </div>

            <div className="bg-zinc-800/30 rounded-xl p-4 border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
                <Flame size={14} />
                Streak
              </div>
              <p className="text-2xl font-bold text-orange-400">{streak} days</p>
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Weekly Activity</h3>
            <div className="flex items-end gap-2 h-32">
              {dailyActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-zinc-700/30 rounded-t-lg relative" style={{ height: '100px' }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${(day.hours / maxDayHours) * 100}%`,
                        background: 'linear-gradient(180deg, #f97316, #ec4899)',
                        minHeight: day.hours > 0 ? '4px' : '0',
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-zinc-800/30 rounded-xl p-5 border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Category Progress</h3>
            {categoryStats.length === 0 ? (
              <p className="text-zinc-500 text-sm">No categories yet</p>
            ) : (
              <div className="space-y-4">
                {categoryStats.map(cat => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm text-white">{cat.name}</span>
                      </div>
                      <span className="text-sm text-zinc-400">
                        {formatHours(cat.totalTime / 3600)} / {cat.targetHours}h
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-700/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.progress}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session Count */}
          <div className="text-center text-zinc-500 text-sm">
            {totalSessions} total sessions completed
          </div>
        </div>
      </div>
    </div>
  );
}
