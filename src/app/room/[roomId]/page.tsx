'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RoomView } from '@/components/rooms/RoomView';
import { useSettings } from '@/hooks/useSettings';

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const { settings } = useSettings();
  const [token, setToken] = useState<string | null>(null);

  const roomId = params?.roomId ? parseInt(params.roomId as string) : null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Get JWT token from session for socket auth
  useEffect(() => {
    const fetchToken = async () => {
      try {
        // In NextAuth v5, the token can be accessed via a custom API route
        // For now, we'll use the session user ID as a simple auth mechanism
        // The socket server will verify the user exists
        if (session?.user?.id) {
          setToken(session.user.id);
        }
      } catch (err) {
        console.error('Failed to get token:', err);
      }
    };

    if (session?.user?.id) {
      fetchToken();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C967E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user?.id || !roomId) {
    return null;
  }

  const handleLeave = () => {
    router.push('/');
  };

  return (
    <RoomView
      roomId={roomId}
      token={token || session.user.id}
      currentUserId={parseInt(session.user.id)}
      onLeave={handleLeave}
      soundEnabled={settings.soundEnabled}
      soundVolume={settings.soundVolume}
      selectedSound={settings.selectedSound}
    />
  );
}
