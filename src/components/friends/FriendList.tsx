'use client';

import { useState } from 'react';
import { UserMinus, Circle } from 'lucide-react';

interface Friend {
  id: number;
  friendId: number;
  name: string | null;
  email: string;
  acceptedAt: string;
}

interface FriendListProps {
  friends: Friend[];
  onlineUsers?: number[];
  onRemove: (friendId: number) => Promise<boolean>;
}

export function FriendList({ friends, onlineUsers = [], onRemove }: FriendListProps) {
  const [removing, setRemoving] = useState<number | null>(null);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const handleRemove = async (friendId: number) => {
    setRemoving(friendId);
    await onRemove(friendId);
    setRemoving(null);
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-500">No friends yet</p>
        <p className="text-zinc-600 text-sm mt-1">Add friends by their email</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-medium text-sm">
              {getInitials(friend.name, friend.email)}
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-800 ${
                onlineUsers.includes(friend.friendId) ? 'bg-green-500' : 'bg-zinc-600'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {friend.name || friend.email.split('@')[0]}
            </p>
            <p className="text-zinc-500 text-xs truncate">{friend.email}</p>
          </div>
          <button
            onClick={() => handleRemove(friend.friendId)}
            disabled={removing === friend.friendId}
            className="p-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
            title="Remove friend"
          >
            <UserMinus size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
