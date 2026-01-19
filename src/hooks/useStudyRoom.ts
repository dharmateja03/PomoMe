'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import type {
  TimerStartedEvent,
  TimerPausedEvent,
  TimerResetEvent,
  TimerCompletedEvent,
  PresenceUpdateEvent,
  ParticipantJoinedEvent,
  ParticipantLeftEvent,
  HostTransferredEvent,
  RoomEndedEvent,
} from '@/lib/socket';
import type { StudyRoom, RoomParticipant } from '@/lib/db';

interface RoomParticipantWithUser extends RoomParticipant {
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface RoomData extends StudyRoom {
  host: {
    id: number;
    name: string | null;
    email: string;
  };
  participants: RoomParticipantWithUser[];
  isHost: boolean;
  isParticipant: boolean;
}

interface UseStudyRoomOptions {
  roomId: number;
  token: string | null;
}

interface UseStudyRoomReturn {
  room: RoomData | null;
  isConnected: boolean;
  onlineUsers: number[];
  error: string | null;
  loading: boolean;
  timerState: TimerState;
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  leaveRoom: () => Promise<void>;
  refreshRoom: () => Promise<void>;
}

interface TimerState {
  status: 'waiting' | 'active' | 'paused' | 'completed';
  duration: number;
  elapsed: number;
  startedAt: Date | null;
  timeLeft: number;
}

export function useStudyRoom({ roomId, token }: UseStudyRoomOptions): UseStudyRoomReturn {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [timerState, setTimerState] = useState<TimerState>({
    status: 'waiting',
    duration: 1500,
    elapsed: 0,
    startedAt: null,
    timeLeft: 1500,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, isConnected } = useSocket({
    token,
    onConnect: () => {
      // Join room on connect
      socket?.emit('room:join', roomId);
    },
  });

  // Fetch room data
  const fetchRoom = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch room');
      }
      const data: RoomData = await res.json();
      setRoom(data);

      // Initialize timer state from room data
      setTimerState({
        status: data.timerStatus as TimerState['status'],
        duration: data.timerDuration,
        elapsed: data.timerElapsed,
        startedAt: data.timerStartedAt ? new Date(data.timerStartedAt) : null,
        timeLeft: calculateTimeLeft(data),
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch room');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  // Calculate time left based on room state
  function calculateTimeLeft(roomData: RoomData): number {
    const { timerDuration, timerElapsed, timerStartedAt, timerStatus } = roomData;

    if (timerStatus === 'waiting') {
      return timerDuration;
    }

    if (timerStatus === 'completed') {
      return 0;
    }

    if (timerStatus === 'paused') {
      return timerDuration - timerElapsed;
    }

    if (timerStatus === 'active' && timerStartedAt) {
      const now = Date.now();
      const startTime = new Date(timerStartedAt).getTime();
      const currentElapsed = timerElapsed + Math.floor((now - startTime) / 1000);
      return Math.max(0, timerDuration - currentElapsed);
    }

    return timerDuration - timerElapsed;
  }

  // Update timer every second when active
  useEffect(() => {
    if (timerState.status === 'active' && timerState.startedAt) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const startTime = timerState.startedAt!.getTime();
        const currentElapsed = timerState.elapsed + Math.floor((now - startTime) / 1000);
        const timeLeft = Math.max(0, timerState.duration - currentElapsed);

        setTimerState(prev => ({
          ...prev,
          timeLeft,
        }));

        // Auto-complete when timer reaches 0
        if (timeLeft <= 0) {
          setTimerState(prev => ({
            ...prev,
            status: 'completed',
            timeLeft: 0,
          }));
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timerState.status, timerState.startedAt, timerState.elapsed, timerState.duration]);

  // Initial fetch
  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleTimerStarted = (data: TimerStartedEvent) => {
      if (data.roomId !== roomId) return;
      setTimerState({
        status: 'active',
        duration: data.duration,
        elapsed: data.elapsed,
        startedAt: new Date(data.startedAt),
        timeLeft: data.duration - data.elapsed,
      });
    };

    const handleTimerPaused = (data: TimerPausedEvent) => {
      if (data.roomId !== roomId) return;
      setTimerState(prev => ({
        ...prev,
        status: 'paused',
        elapsed: data.elapsed,
        startedAt: null,
        timeLeft: prev.duration - data.elapsed,
      }));
    };

    const handleTimerReset = (data: TimerResetEvent) => {
      if (data.roomId !== roomId) return;
      setTimerState({
        status: 'waiting',
        duration: data.duration,
        elapsed: 0,
        startedAt: null,
        timeLeft: data.duration,
      });
    };

    const handleTimerCompleted = (data: TimerCompletedEvent) => {
      if (data.roomId !== roomId) return;
      setTimerState(prev => ({
        ...prev,
        status: 'completed',
        elapsed: data.duration,
        startedAt: null,
        timeLeft: 0,
      }));
    };

    const handlePresenceUpdate = (data: PresenceUpdateEvent) => {
      if (data.roomId !== roomId) return;
      setOnlineUsers(data.onlineUsers);
    };

    const handleParticipantJoined = (data: ParticipantJoinedEvent) => {
      if (data.roomId !== roomId) return;
      fetchRoom(); // Refresh to get updated participant list
    };

    const handleParticipantLeft = (data: ParticipantLeftEvent) => {
      if (data.roomId !== roomId) return;
      fetchRoom(); // Refresh to get updated participant list
    };

    const handleHostTransferred = (data: HostTransferredEvent) => {
      if (data.roomId !== roomId) return;
      fetchRoom(); // Refresh to get updated host info
    };

    const handleRoomEnded = (data: RoomEndedEvent) => {
      if (data.roomId !== roomId) return;
      setError('Room has ended');
      setRoom(null);
    };

    socket.on('timer:started', handleTimerStarted);
    socket.on('timer:paused', handleTimerPaused);
    socket.on('timer:reset', handleTimerReset);
    socket.on('timer:completed', handleTimerCompleted);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('participant:joined', handleParticipantJoined);
    socket.on('participant:left', handleParticipantLeft);
    socket.on('host:transferred', handleHostTransferred);
    socket.on('room:ended', handleRoomEnded);

    return () => {
      socket.off('timer:started', handleTimerStarted);
      socket.off('timer:paused', handleTimerPaused);
      socket.off('timer:reset', handleTimerReset);
      socket.off('timer:completed', handleTimerCompleted);
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('participant:joined', handleParticipantJoined);
      socket.off('participant:left', handleParticipantLeft);
      socket.off('host:transferred', handleHostTransferred);
      socket.off('room:ended', handleRoomEnded);
    };
  }, [socket, roomId, fetchRoom]);

  // Actions
  const startTimer = useCallback(() => {
    if (socket && room?.isHost) {
      socket.emit('timer:start', roomId);
    }
  }, [socket, roomId, room?.isHost]);

  const pauseTimer = useCallback(() => {
    if (socket && room?.isHost) {
      socket.emit('timer:pause', roomId);
    }
  }, [socket, roomId, room?.isHost]);

  const resetTimer = useCallback(() => {
    if (socket && room?.isHost) {
      socket.emit('timer:reset', roomId);
    }
  }, [socket, roomId, room?.isHost]);

  const leaveRoom = useCallback(async () => {
    try {
      socket?.emit('room:leave', roomId);
      const res = await fetch(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to leave room');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave room');
      throw err;
    }
  }, [roomId, socket]);

  return {
    room,
    isConnected,
    onlineUsers,
    error,
    loading,
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    leaveRoom,
    refreshRoom: fetchRoom,
  };
}
