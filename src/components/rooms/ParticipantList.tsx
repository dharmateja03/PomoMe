'use client';

import { Crown, Circle } from 'lucide-react';

interface Participant {
  id: number;
  userId: number;
  role: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
}

interface ParticipantListProps {
  participants: Participant[];
  hostId: number;
  onlineUsers: number[];
  currentUserId: number;
}

export function ParticipantList({ participants, hostId, onlineUsers, currentUserId }: ParticipantListProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const getDisplayName = (participant: Participant) => {
    const { user } = participant;
    if (user.id === currentUserId) {
      return user.name ? `${user.name} (You)` : 'You';
    }
    return user.name || user.email.split('@')[0];
  };

  const isOnline = (userId: number) => onlineUsers.includes(userId);

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
        Participants ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
                {getInitials(participant.user.name, participant.user.email)}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                  isOnline(participant.user.id) ? 'bg-green-500' : 'bg-zinc-600'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-medium truncate">
                  {getDisplayName(participant)}
                </span>
                {participant.user.id === hostId && (
                  <Crown size={14} className="text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <span className="text-xs text-zinc-500">
                {isOnline(participant.user.id) ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
