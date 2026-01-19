'use client';

import { useState } from 'react';
import { X, UserPlus, Bell } from 'lucide-react';
import { FriendList } from './FriendList';
import { FriendRequestList } from './FriendRequestList';
import { AddFriendModal } from './AddFriendModal';
import { useFriends } from '@/hooks/useFriends';

interface FriendsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FriendsPanel({ isOpen, onClose }: FriendsPanelProps) {
  const {
    friends,
    pendingRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriends();

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Friends</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddFriend(true)}
              className="p-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg transition-colors"
              title="Add friend"
            >
              <UserPlus size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-white border-b-2 border-violet-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'friends' ? (
            <FriendList
              friends={friends}
              onRemove={removeFriend}
            />
          ) : (
            <FriendRequestList
              requests={pendingRequests}
              onAccept={acceptRequest}
              onReject={rejectRequest}
            />
          )}
        </div>
      </div>

      <AddFriendModal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        onSendRequest={sendRequest}
      />
    </div>
  );
}
