'use client';

import { useState, useEffect, useCallback } from 'react';

interface Friend {
  id: number;
  friendId: number;
  name: string | null;
  email: string;
  acceptedAt: string;
}

interface FriendRequest {
  id: number;
  senderId: number;
  senderName: string | null;
  senderEmail: string;
  createdAt: string;
}

interface UseFriendsReturn {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
  sendRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
  acceptRequest: (requestId: number) => Promise<boolean>;
  rejectRequest: (requestId: number) => Promise<boolean>;
  removeFriend: (friendId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useFriends(): UseFriendsReturn {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch('/api/friends');
      if (!res.ok) throw new Error('Failed to fetch friends');
      const data = await res.json();
      setFriends(data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/friends/requests');
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setPendingRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchFriends(), fetchRequests()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, [fetchFriends, fetchRequests]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendRequest = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Failed to send request' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to send request' };
    }
  }, []);

  const acceptRequest = useCallback(async (requestId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!res.ok) return false;

      await refresh();
      return true;
    } catch (err) {
      console.error('Error accepting request:', err);
      return false;
    }
  }, [refresh]);

  const rejectRequest = useCallback(async (requestId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (!res.ok) return false;

      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      return true;
    } catch (err) {
      console.error('Error rejecting request:', err);
      return false;
    }
  }, []);

  const removeFriend = useCallback(async (friendId: number): Promise<boolean> => {
    try {
      const res = await fetch(`/api/friends?friendId=${friendId}`, {
        method: 'DELETE',
      });

      if (!res.ok) return false;

      setFriends(prev => prev.filter(f => f.friendId !== friendId));
      return true;
    } catch (err) {
      console.error('Error removing friend:', err);
      return false;
    }
  }, []);

  return {
    friends,
    pendingRequests,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    refresh,
  };
}
