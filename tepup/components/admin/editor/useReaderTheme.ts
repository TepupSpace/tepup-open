'use client';

import { useSyncExternalStore } from 'react';
import { READER_PREFS_EVENT, applyReaderPrefs, readReaderPrefs } from '@/lib/reader-prefs';

export type ResolvedReaderTheme = 'light' | 'dark';

/**
 * The page's current reading theme ("sáng"/"tối"), for widgets that can't follow the
 * Tailwind palette variables on their own, e.g. BlockNote, which takes `theme="light" |
 * "dark"` and styles its menus and toolbars with Mantine's colours.
 *
 * Source of truth: `data-reader-theme` on <html>, set by `lib/reader-prefs.ts` (the
 * <head> script, the "Aa" button, and "Theo máy" following the OS). A MutationObserver on
 * that attribute covers all of them. The prefs event is also subscribed, and when the
 * saved theme is "Theo máy" an OS light/dark switch re-applies the prefs here too, so the
 * page and the editor follow the OS even where no "Aa" button is mounted.
 */
function subscribe(onChange: () => void): () => void {
  const root = document.documentElement;
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ['data-reader-theme'] });
  window.addEventListener(READER_PREFS_EVENT, onChange);
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    const prefs = readReaderPrefs();
    if (prefs.theme === 'system') applyReaderPrefs(prefs);
    onChange();
  };
  mq?.addEventListener?.('change', onSystemChange);
  return () => {
    observer.disconnect();
    window.removeEventListener(READER_PREFS_EVENT, onChange);
    mq?.removeEventListener?.('change', onSystemChange);
  };
}

function getSnapshot(): ResolvedReaderTheme {
  return document.documentElement.dataset.readerTheme === 'dark' ? 'dark' : 'light';
}

/** Server render: light. The client corrects it right after hydration. */
function getServerSnapshot(): ResolvedReaderTheme {
  return 'light';
}

export function useReaderTheme(): ResolvedReaderTheme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
