'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Clock, BarChart3, Sparkles, LogOut, Loader2, Settings as SettingsIcon, Users, UserPlus } from 'lucide-react';
import { Timer } from '@/components/Timer';
import { CategorySelector } from '@/components/CategorySelector';
import { ProgressMeter } from '@/components/ProgressMeter';
import { History } from '@/components/History';
import { Analytics } from '@/components/Analytics';
import { Settings } from '@/components/Settings';
import { LandingPage } from '@/components/LandingPage';
import { CreateRoomModal } from '@/components/rooms/CreateRoomModal';
import { JoinRoomModal } from '@/components/rooms/JoinRoomModal';
import { FriendsPanel } from '@/components/friends/FriendsPanel';
import { useApiCategories } from '@/hooks/useApiCategories';
import { useApiSessions } from '@/hooks/useApiSessions';
import { useSettings } from '@/hooks/useSettings';
import { type Category } from '@/lib/db/schema';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { categories, loading: categoriesLoading, addCategory, deleteCategory } = useApiCategories();
  const { sessions, loading: sessionsLoading, addSession, getTotalTimeByCategory } = useApiSessions();
  const { settings, updateSettings, resetSettings, loaded: settingsLoaded } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  // Auto-select first category if none selected
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && status === 'authenticated') {
      Notification.requestPermission();
    }
  }, [status]);

  const handleSessionComplete = useCallback(
    async (duration: number, startedAt: Date) => {
      if (!selectedCategory?.id || duration < 60) return;

      await addSession({
        categoryId: selectedCategory.id,
        duration,
        startedAt,
      });
    },
    [selectedCategory, addSession]
  );

  const handleAddCategory = useCallback(
    async (category: { name: string; color: string; targetHours: number }) => {
      const id = await addCategory(category);
      if (id) {
        const newCategory = { ...category, id, userId: 0, createdAt: new Date() };
        setSelectedCategory(newCategory);
      }
    },
    [addCategory]
  );

  const handleDeleteCategory = useCallback(
    async (id: number) => {
      await deleteCategory(id);
      if (selectedCategory?.id === id) {
        setSelectedCategory(categories.find(c => c.id !== id) || null);
      }
    },
    [deleteCategory, selectedCategory, categories]
  );

  const handleSignOut = async () => {
    await signOut({ redirect: false });
  };

  const selectedCategoryTime = selectedCategory?.id
    ? getTotalTimeByCategory(selectedCategory.id)
    : 0;

  // Show landing page for unauthenticated users
  if (status === 'unauthenticated') {
    return <LandingPage />;
  }

  // Loading state
  if (status === 'loading' || categoriesLoading || sessionsLoading || !settingsLoaded) {
    return (
      <div className="min-h-screen bg-[#010101] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#C967E8] animate-spin" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010101]">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#983AD6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FA93FA]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
              <button
                onClick={() => setShowFriends(true)}
                className="p-2 text-zinc-500 hover:text-[#C967E8] hover:bg-white/5 rounded-lg transition-all"
                title="Friends"
              >
                <UserPlus size={18} />
              </button>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <Sparkles size={14} className="text-[#C967E8]" />
              <span className="text-sm text-zinc-400">Focus Timer</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Pomodo
            <span className="bg-gradient-to-r from-[#FA93FA] to-[#983AD6] bg-clip-text text-transparent">
              Me
            </span>
          </h1>
          <p className="text-zinc-500">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </header>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 border border-white/10"
          >
            <Clock size={18} />
            <span className="text-sm font-medium">History</span>
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 border border-white/10"
          >
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Analytics</span>
          </button>
        </div>

        {/* Study Together Card */}
        <div className="mb-10 p-4 bg-gradient-to-r from-[#FA93FA]/10 via-[#C967E8]/5 to-[#983AD6]/10 rounded-2xl border border-[#983AD6]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FA93FA] to-[#983AD6] rounded-xl flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Study Together</h3>
                <p className="text-xs text-zinc-400">Create or join a study room with friends</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowJoinRoom(true)}
                className="px-4 py-2 text-sm text-[#FA93FA] hover:text-white hover:bg-[#983AD6]/20 rounded-lg transition-colors"
              >
                Join Room
              </button>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-[#FA93FA] via-[#C967E8] to-[#983AD6] text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-10">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onAdd={handleAddCategory}
            onDelete={handleDeleteCategory}
          />
        </div>

        {/* Timer */}
        <div className="mb-10">
          <Timer
            onComplete={handleSessionComplete}
            isDisabled={!selectedCategory}
            durationMinutes={settings.timerDuration}
            soundEnabled={settings.soundEnabled}
            soundVolume={settings.soundVolume}
            selectedSound={settings.selectedSound}
          />
        </div>

        {/* Progress Meter */}
        {selectedCategory && (
          <div className="mb-10">
            <ProgressMeter
              category={selectedCategory}
              totalSeconds={selectedCategoryTime}
            />
          </div>
        )}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <Sparkles size={28} className="text-[#C967E8]" />
            </div>
            <p className="text-zinc-400 mb-2">No categories yet</p>
            <p className="text-zinc-600 text-sm">
              Create a category to start tracking your focus sessions
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showHistory && (
        <History
          sessions={sessions}
          categories={categories}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showAnalytics && (
        <Analytics
          sessions={sessions}
          categories={categories}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={updateSettings}
          onReset={resetSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showCreateRoom && (
        <CreateRoomModal
          isOpen={showCreateRoom}
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={(roomId) => {
            setShowCreateRoom(false);
            router.push(`/room/${roomId}`);
          }}
        />
      )}

      {showJoinRoom && (
        <JoinRoomModal
          isOpen={showJoinRoom}
          onClose={() => setShowJoinRoom(false)}
          onJoin={(roomId) => {
            setShowJoinRoom(false);
            router.push(`/room/${roomId}`);
          }}
        />
      )}

      {showFriends && (
        <FriendsPanel
          isOpen={showFriends}
          onClose={() => setShowFriends(false)}
        />
      )}
    </div>
  );
}
