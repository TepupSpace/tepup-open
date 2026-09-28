'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// v2 keys progress by lesson/chapter **id** instead of slug. The old key is left
// behind rather than migrated: its slug-based keys cannot be resolved once slugs are
// renormalised, so v1 progress is intentionally dropped.
const STORAGE_KEY = 'tepup_progress_v2';

// Tên sự kiện đồng bộ giữa các component. Được export để bộ nạp PWA có thể báo
// cho provider biết nó vừa ghi tiến độ chuyển từ trình duyệt sang.
export const PROGRESS_UPDATE_EVENT = 'tepup_progress_update';

interface ProgressItem {
  contentType: 'lesson' | 'chapter';
  completed: boolean;
  score: number | null;
  completedAt: string | null;
}

interface LocalStorageData {
  version: number;
  progress: Record<string, ProgressItem>;
  lastUpdated: string;
}

interface Progress {
  id: string;
  contentType: string;
  contentId: string;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
}

interface ProgressContextType {
  progress: Progress[];
  isLoading: boolean;
  error: string | null;
  isCompleted: (contentType: string, contentId: string) => boolean;
  markCompleted: (contentType: 'lesson' | 'chapter', contentId: string, score?: number) => boolean;
  getCurrentLessonIndex: (allLessonIds: string[]) => number;
  isSkippingAhead: (lessonIndex: number, allLessonIds: string[]) => boolean;
  getCurrentChapterIndex: (allChapterIds: string[]) => number;
  isChapterSkippingAhead: (chapterIndex: number, allChapterIds: string[]) => boolean;
  clearProgress: () => void;
  refreshProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);


// Helper to safely read from localStorage
function readFromStorage(): LocalStorageData {
  if (typeof window === 'undefined') {
    return { version: 1, progress: {}, lastUpdated: new Date().toISOString() };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as LocalStorageData;
      return parsed;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }

  return { version: 1, progress: {}, lastUpdated: new Date().toISOString() };
}

// Helper to safely write to localStorage
function writeToStorage(data: LocalStorageData): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent(PROGRESS_UPDATE_EVENT, { detail: data }));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
}

// Convert storage data to Progress array
function storageToProgressArray(data: LocalStorageData): Progress[] {
  return Object.entries(data.progress).map(([contentId, item]) => ({
    id: contentId,
    contentType: item.contentType,
    contentId,
    completed: item.completed,
    score: item.score,
    completedAt: item.completedAt,
  }));
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [storageData, setStorageData] = useState<LocalStorageData>(() => readFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const data = readFromStorage();
    setStorageData(data);
  }, []);

  // Listen for progress updates from other components/tabs
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent<LocalStorageData>) => {
      setStorageData(event.detail);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue) as LocalStorageData;
          setStorageData(data);
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener(PROGRESS_UPDATE_EVENT, handleProgressUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(PROGRESS_UPDATE_EVENT, handleProgressUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to manually refresh progress from localStorage
  const refreshProgress = useCallback(() => {
    const data = readFromStorage();
    setStorageData(data);
  }, []);

  // Convert to Progress array for compatibility
  const progress = storageToProgressArray(storageData);

  // Check if a specific content is completed
  const isCompleted = useCallback(
    (contentType: string, contentId: string) => {
      const item = storageData.progress[contentId];
      return item?.contentType === contentType && item?.completed === true;
    },
    [storageData]
  );

  // Mark content as completed
  const markCompleted = useCallback(
    (contentType: 'lesson' | 'chapter', contentId: string, score?: number): boolean => {
      setIsLoading(true);
      setError(null);

      try {
        const newData: LocalStorageData = {
          ...storageData,
          progress: {
            ...storageData.progress,
            [contentId]: {
              contentType,
              completed: true,
              score: score ?? null,
              completedAt: new Date().toISOString(),
            },
          },
          lastUpdated: new Date().toISOString(),
        };

        const success = writeToStorage(newData);
        if (success) {
          setStorageData(newData);
          return true;
        } else {
          setError('Không thể lưu tiến độ');
          return false;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [storageData]
  );

  // Get current lesson index (first incomplete lesson)
  const getCurrentLessonIndex = useCallback(
    (allLessonIds: string[]) => {
      for (let i = 0; i < allLessonIds.length; i++) {
        if (!isCompleted('lesson', allLessonIds[i])) {
          return i;
        }
      }
      // All completed - return last index
      return allLessonIds.length - 1;
    },
    [isCompleted]
  );

  // Check if user is skipping ahead of their current lesson
  const isSkippingAhead = useCallback(
    (lessonIndex: number, allLessonIds: string[]) => {
      const currentIndex = getCurrentLessonIndex(allLessonIds);
      return lessonIndex > currentIndex;
    },
    [getCurrentLessonIndex]
  );

  // Get current chapter index (first incomplete chapter)
  const getCurrentChapterIndex = useCallback(
    (allChapterIds: string[]) => {
      for (let i = 0; i < allChapterIds.length; i++) {
        if (!isCompleted('chapter', allChapterIds[i])) {
          return i;
        }
      }
      // All completed - return last index
      return allChapterIds.length - 1;
    },
    [isCompleted]
  );

  // Check if user is skipping ahead of their current chapter
  const isChapterSkippingAhead = useCallback(
    (chapterIndex: number, allChapterIds: string[]) => {
      const currentIndex = getCurrentChapterIndex(allChapterIds);
      return chapterIndex > currentIndex;
    },
    [getCurrentChapterIndex]
  );

  // Clear all progress
  const clearProgress = useCallback(() => {
    const emptyData: LocalStorageData = {
      version: 1,
      progress: {},
      lastUpdated: new Date().toISOString(),
    };
    writeToStorage(emptyData);
    setStorageData(emptyData);
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        error,
        isCompleted,
        markCompleted,
        getCurrentLessonIndex,
        isSkippingAhead,
        getCurrentChapterIndex,
        isChapterSkippingAhead,
        clearProgress,
        refreshProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
