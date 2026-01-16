'use client';

import { useState } from 'react';
import { Plus, X, Target, Check } from 'lucide-react';
import { type Category } from '@/lib/db/schema';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  onAdd: (category: { name: string; color: string; targetHours: number }) => void;
  onDelete: (id: number) => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4',
];

export function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  onAdd,
  onDelete,
}: CategorySelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [targetHours, setTargetHours] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({ name: name.trim(), color, targetHours });
    setName('');
    setColor(COLORS[0]);
    setTargetHours(10);
    setShowForm(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {categories.map(category => (
          <div
            key={category.id}
            className="group relative"
          >
            <button
              onClick={() => onSelect(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory?.id === category.id
                  ? 'text-white shadow-lg'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }`}
              style={{
                backgroundColor:
                  selectedCategory?.id === category.id ? category.color : undefined,
                boxShadow:
                  selectedCategory?.id === category.id
                    ? `0 4px 14px ${category.color}40`
                    : undefined,
              }}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedCategory?.id === category.id ? 'bg-white/50' : ''
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory?.id !== category.id ? category.color : undefined,
                  }}
                />
                {category.name}
                {selectedCategory?.id === category.id && (
                  <Check size={14} className="ml-1" />
                )}
              </span>
            </button>

            {/* Delete button on hover */}
            <button
              onClick={() => onDelete(category.id!)}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
              aria-label={`Delete ${category.name}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Add Category Button */}
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-800/30 text-zinc-500 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 border border-dashed border-zinc-700 hover:border-zinc-500"
        >
          <span className="flex items-center gap-2">
            <Plus size={16} />
            Add Category
          </span>
        </button>
      </div>

      {/* Add Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">New Category</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g., Mathematics, Coding..."
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all duration-200 ${
                        color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>

              {/* Target Hours */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  <span className="flex items-center gap-2">
                    <Target size={16} />
                    Weekly Target (hours)
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={targetHours}
                    onChange={e => setTargetHours(Number(e.target.value))}
                    className="flex-1 h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-white font-medium w-12 text-center tabular-nums">
                    {targetHours}h
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl font-medium transition-all duration-200 disabled:bg-zinc-800 disabled:text-zinc-600 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-lg disabled:shadow-none"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
