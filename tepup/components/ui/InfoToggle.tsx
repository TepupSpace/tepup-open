'use client';

import { useCallback, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { Info } from 'lucide-react';

/**
 * A small (i) button that shows or hides static how-to text (a disclosure, not a
 * dialog: no focus trap). Warnings and errors never belong in here; they stay visible.
 *
 * - The button's accessible name is `label`; its state is `aria-expanded`.
 * - The panel stays in the DOM with `hidden` while closed, so an `aria-describedby`
 *   pointing into it (e.g. the block editor's keyboard help) still resolves.
 * - Escape inside the panel (or on the button) closes it and returns focus to the button.
 * - With `storageKey`, open/closed is remembered in localStorage. Default: closed.
 */
type Accent = 'teal' | 'blue';

const ACCENT: Record<Accent, { button: string; open: string; panel: string }> = {
  teal: {
    button: 'text-teal-700 hover:bg-teal-50 focus-visible:ring-teal-700',
    open: 'bg-teal-50 text-teal-800',
    panel: 'border-teal-100 bg-teal-50',
  },
  blue: {
    button: 'text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600',
    open: 'bg-blue-50 text-blue-700',
    panel: 'border-blue-100 bg-blue-50',
  },
};

interface Props {
  /** Accessible name of the button, e.g. "Hướng dẫn soạn bài". Also its tooltip. */
  label: string;
  /** The how-to content, shown only while open. */
  children: ReactNode;
  /** Optional heading/label shown on the same row, left of the button. */
  heading?: ReactNode;
  /** localStorage key that remembers open/closed. */
  storageKey?: string;
  accent?: Accent;
  /** Id for the panel (default: generated). */
  panelId?: string;
  className?: string;
  panelClassName?: string;
}

// Remembered state lives in localStorage, read through useSyncExternalStore (the server
// snapshot is "closed", so server and client HTML match). If storage is blocked, the
// choice is kept in memory for this page load.
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readStored(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, open: boolean) {
  const v = open ? '1' : '0';
  try {
    window.localStorage.setItem(key, v);
    memory.delete(key);
  } catch {
    memory.set(key, v);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

export default function InfoToggle({
  label,
  children,
  heading,
  storageKey,
  accent = 'teal',
  panelId,
  className,
  panelClassName,
}: Props) {
  const generatedId = useId();
  const id = panelId ?? `${generatedId}-panel`;
  const [localOpen, setLocalOpen] = useState(false);
  const stored = useSyncExternalStore(
    subscribe,
    () => (storageKey ? readStored(storageKey) : null),
    () => null
  );
  const open = storageKey ? stored === '1' : localOpen;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const setAndStore = useCallback(
    (next: boolean) => {
      if (storageKey) writeStored(storageKey, next);
      else setLocalOpen(next);
    },
    [storageKey]
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !open) return;
    e.stopPropagation();
    setAndStore(false);
    buttonRef.current?.focus();
  };

  const a = ACCENT[accent];

  return (
    <div className={className}>
      <div className={heading ? 'flex items-center justify-between gap-2' : 'flex justify-end'}>
        {heading}
        <button
          ref={buttonRef}
          type="button"
          aria-label={label}
          title={label}
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setAndStore(!open)}
          onKeyDown={onKeyDown}
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${a.button} ${
            open ? a.open : ''
          }`}
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Escape from inside the panel closes it (bubbled from its content); the button is the real control. */}
      <div
        id={id}
        hidden={!open}
        onKeyDown={onKeyDown}
        className={`mt-2 rounded-lg border p-3 text-xs text-gray-600 ${a.panel} ${panelClassName ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}
