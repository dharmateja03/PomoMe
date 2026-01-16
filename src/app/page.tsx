'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Clock, BarChart3, Sparkles, LogOut, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { Timer } from '@/components/Timer';
import { CategorySelector } from '@/components/CategorySelector';
import { ProgressMeter } from '@/components/ProgressMeter';
import { History } from '@/components/History';
import { Analytics } from '@/components/Analytics';
import { Settings } from '@/components/Settings';
import { useApiCategories } from '@/hooks/useApiCategories';
import { useApiSessions } from '@/hooks/useApiSessions';
import { useSettings } from '@/hooks/useSettings';
import { type Category } from '@/lib/db/schema';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { categories, loading: categoriesLoading, addCategory, deleteCategory } = useApiCategories();
  const { sessions, loading: sessionsLoading, addSession, getTotalTimeByCategory } = useApiSessions();
  const { settings, updateSettings, resetSettings, loaded: settingsLoaded } = useSettings();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Auto-select first category if none selected
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const handleSessionComplete = useCallback(
    async (duration: number) => {
      if (!selectedCategory?.id || duration < 60) return;

      await addSession({
        categoryId: selectedCategory.id,
        duration,
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
    router.push('/login');
  };

  const selectedCategoryTime = selectedCategory?.id
    ? getTotalTimeByCategory(selectedCategory.id)
    : 0;

  // Loading state
  if (status === 'loading' || categoriesLoading || sessionsLoading || !settingsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-orange-400 animate-spin" />
          <p className="text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
              title="Settings"
            >
              <SettingsIcon size={18} />
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/30 rounded-full border border-zinc-700/50">
              <Sparkles size={14} className="text-orange-400" />
              <span className="text-sm text-zinc-400">Focus Timer</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
            Pomodo
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Me
            </span>
          </h1>
          <p className="text-zinc-500">
            Welcome back, {session?.user?.name || session?.user?.email}
          </p>
        </header>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 border border-zinc-700/50"
          >
            <Clock size={18} />
            <span className="text-sm font-medium">History</span>
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800/40 hover:bg-zinc-700/40 text-zinc-300 hover:text-white rounded-xl transition-all duration-200 border border-zinc-700/50"
          >
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Analytics</span>
          </button>
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
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <Sparkles size={28} className="text-zinc-600" />
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
    </div>
  );
}
