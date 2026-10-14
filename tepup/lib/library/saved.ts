'use client';

import { useSyncExternalStore } from 'react';

/**
 * Danh sách mục thư viện người học đã lưu (☆). Người học không có tài khoản, nên —
 * như tiến độ học (`tepup_progress_v2`) — danh sách nằm trong localStorage của trình
 * duyệt và đi theo vào app cài đặt (PWA). Không đồng bộ giữa các thiết bị.
 * docs/design-reference-library.md §7.2.
 */

const STORAGE_ITEM = 'tepup_saved_entries_v1';
const MAX = 500;

export interface SavedEntry {
  slug: string;
  savedAt: string;
}

const listeners = new Set<() => void>();
let cache: SavedEntry[] | null = null;
const EMPTY: SavedEntry[] = [];

function read(): SavedEntry[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_ITEM) ?? '[]');
    cache = Array.isArray(raw)
      ? raw.filter((e): e is SavedEntry => !!e && typeof e.slug === 'string' && typeof e.savedAt === 'string').slice(0, MAX)
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(list: SavedEntry[]) {
  cache = list.slice(0, MAX);
  try {
    localStorage.setItem(STORAGE_ITEM, JSON.stringify(cache));
  } catch {
    // Bộ nhớ đầy hoặc chế độ riêng tư: vẫn giữ trong phiên này.
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_ITEM) {
      cache = null;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** Danh sách đã lưu (mới nhất trước). Ở server luôn rỗng. */
export function useSavedEntries(): SavedEntry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleSaved(slug: string): boolean {
  const list = read();
  if (list.some((e) => e.slug === slug)) {
    write(list.filter((e) => e.slug !== slug));
    return false;
  }
  write([{ slug, savedAt: new Date().toISOString() }, ...list]);
  return true;
}

export function removeSaved(slug: string) {
  write(read().filter((e) => e.slug !== slug));
}
