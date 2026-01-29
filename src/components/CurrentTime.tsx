'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CurrentTimeProps {
  timezone: string;
}

export function CurrentTime({ timezone }: CurrentTimeProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        const dateStr = now.toLocaleDateString('en-US', {
          timeZone: timezone,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        setTime(timeStr);
        setDate(dateStr);
      } catch {
        // Fallback to local time if timezone is invalid
        const now = new Date();
        setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
      <Clock size={18} className="text-[#C967E8]" />
      <div className="flex flex-col">
        <span className="text-lg font-medium text-white tabular-nums">{time}</span>
        <span className="text-xs text-zinc-500">{date}</span>
      </div>
    </div>
  );
}
