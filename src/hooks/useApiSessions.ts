'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Session } from '@/lib/db/schema';

export function useApiSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const addSession = useCallback(async (session: { categoryId: number; duration: number; startedAt?: Date }) => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          startedAt: session.startedAt?.toISOString(),
        }),
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions(prev => [newSession, ...prev]);
        return newSession.id;
      }
    } catch (error) {
      console.error('Failed to add session:', error);
    }
    return null;
  }, []);

  const getTotalTimeByCategory = useCallback((categoryId: number) => {
    return sessions
      .filter(s => s.categoryId === categoryId)
      .reduce((total, s) => total + s.duration, 0);
  }, [sessions]);

  return { sessions, loading, addSession, getTotalTimeByCategory, refetch: fetchSessions };
}
