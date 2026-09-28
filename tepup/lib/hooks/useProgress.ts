'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Progress {
  id: string;
  contentType: string;
  contentId: string;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
}

export function useProgress() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all progress for user
  const fetchProgress = useCallback(async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/progress');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      setProgress(data.progress || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  // Check if a specific content is completed
  const isCompleted = useCallback((contentType: string, contentId: string) => {
    return progress.some(
      (p) => p.contentType === contentType && p.contentId === contentId && p.completed
    );
  }, [progress]);

  // Mark content as completed
  const markCompleted = useCallback(async (
    contentType: 'lesson' | 'chapter',
    contentId: string,
    score?: number
  ) => {
    if (!session?.user) {
      setError('Bạn cần đăng nhập để lưu tiến độ');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          completed: true,
          score,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update local state
      setProgress((prev) => {
        const existing = prev.findIndex(
          (p) => p.contentType === contentType && p.contentId === contentId
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data.progress;
          return updated;
        }
        return [...prev, data.progress];
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  // Check if a lesson is unlocked (previous lesson completed or first lesson)
  const isLessonUnlocked = useCallback((
    lessonId: string,
    lessonIndex: number,
    allLessonIds: string[]
  ) => {
    // First lesson is always unlocked
    if (lessonIndex === 0) return true;
    
    // User not logged in - all lessons locked except first
    if (!session?.user) return false;
    
    // Check if previous lesson is completed
    const previousLessonId = allLessonIds[lessonIndex - 1];
    return isCompleted('lesson', previousLessonId);
  }, [session?.user, isCompleted]);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    isCompleted,
    markCompleted,
    isLessonUnlocked,
    isLoggedIn: !!session?.user,
  };
}
