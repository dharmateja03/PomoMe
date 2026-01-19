'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface InviteLinkShareProps {
  inviteCode: string;
}

export function InviteLinkShare({ inviteCode }: InviteLinkShareProps) {
  const [copied, setCopied] = useState(false);

  const getInviteLink = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/room/join/${inviteCode}`;
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(getInviteLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareInvite = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my study room',
          text: 'Join my study session on Pomodo.me!',
          url: getInviteLink(),
        });
      } catch (err) {
        // User cancelled or share failed
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
        Invite Friends
      </h3>
      <div className="flex gap-2">
        <div className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-sm truncate">
          {getInviteLink()}
        </div>
        <button
          onClick={copyInviteLink}
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
          title="Copy link"
        >
          {copied ? (
            <Check size={18} className="text-green-500" />
          ) : (
            <Copy size={18} className="text-zinc-400" />
          )}
        </button>
        <button
          onClick={shareInvite}
          className="px-3 py-2 bg-violet-500 hover:bg-violet-400 rounded-lg transition-colors"
          title="Share"
        >
          <Share2 size={18} className="text-white" />
        </button>
      </div>
      <p className="text-xs text-zinc-500 mt-2">
        Share this link with friends to invite them to your study room.
      </p>
    </div>
  );
}
