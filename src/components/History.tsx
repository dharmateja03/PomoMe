'use client';

import { X, Clock, Calendar } from 'lucide-react';
import { type Category, type Session } from '@/lib/db/schema';

interface HistoryProps {
  sessions: Session[];
  categories: Category[];
  onClose: () => void;
}

export function History({ sessions, categories, onClose }: HistoryProps) {
  const getCategoryById = (id: number) =>
    categories.find(c => c.id === id) || { name: 'Unknown', color: '#666' };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimezone = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      timeZoneName: 'short',
    }).split(' ').pop() || '';
  };

  const formatTimeRange = (startedAt: Date | null, completedAt: Date) => {
    const tz = getTimezone(completedAt);
    if (startedAt) {
      return `${formatTime(startedAt)} - ${formatTime(completedAt)} ${tz}`;
    }
    return `${formatTime(completedAt)} ${tz}`;
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const dateKey = new Date(session.completedAt).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(session);
    return groups;
  }, {} as Record<string, Session[]>);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[80vh] border border-zinc-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg">
              <Clock size={20} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Session History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center">
                <Calendar size={32} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500">No sessions yet</p>
              <p className="text-zinc-600 text-sm mt-1">
                Start your first pomodoro to see history
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions).map(([dateKey, dateSessions]) => (
                <div key={dateKey}>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(new Date(dateKey))}
                  </h3>
                  <div className="space-y-2">
                    {dateSessions.map(session => {
                      const category = getCategoryById(session.categoryId);
                      return (
                        <div
                          key={session.id}
                          className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {category.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatTimeRange(session.startedAt, session.completedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-zinc-300">
                              {formatDuration(session.duration)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
