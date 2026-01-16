'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Category } from '@/lib/db/schema';

export function useApiCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (category: { name: string; color: string; targetHours: number }) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (res.ok) {
        const newCategory = await res.json();
        setCategories(prev => [...prev, newCategory]);
        return newCategory.id;
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    }
    return null;
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  }, []);

  return { categories, loading, addCategory, deleteCategory, refetch: fetchCategories };
}
