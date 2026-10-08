'use client';

import { createElement, useEffect, useId, useRef, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Common icons for admin panel
const iconList = [
  'brain', 'book-open', 'graduation-cap', 'lightbulb', 'trending-up',
  'landmark', 'coins', 'pie-chart', 'scale', 'binary', 'receipt',
  'building', 'user', 'users', 'store', 'briefcase', 'book',
  'book-marked', 'file-text', 'folder', 'folder-tree', 'layers',
  'target', 'star', 'heart', 'flag', 'award', 'trophy',
  'zap', 'rocket', 'compass', 'map', 'globe', 'home',
];

function getIcon(name: string): LucideIcon {
  // Convert kebab-case to PascalCase
  const pascalCase = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return (LucideIcons as unknown as Record<string, LucideIcon>)[pascalCase] || LucideIcons.HelpCircle;
}

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  /** Accessible name of the trigger; the current icon name is appended. */
  label?: string;
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';

/**
 * Icon picker: a button that opens a non-modal grid of icon buttons.
 * Keyboard: opening moves focus to the current icon; Escape closes and returns focus to
 * the trigger; tabbing out of the grid closes it. Icon names are English (lucide ids).
 */
export default function IconPicker({ value, onChange, label = 'Biểu tượng' }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Focus in on open: the selected icon, or the first one.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const target =
      panel?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]') ??
      panel?.querySelector<HTMLButtonElement>('button');
    target?.focus();
  }, [isOpen]);

  // Escape closes; focus leaving the picker (Tab past the grid) closes it too.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const onFocusIn = (e: FocusEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [isOpen]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-label={`${label}: ${value || 'chưa chọn'}`}
        className={`flex items-center gap-2 px-3 py-2 border border-gray-500 rounded-xl hover:bg-gray-50 transition-colors ${focusRing}`}
      >
        {createElement(getIcon(value), { className: 'w-5 h-5 text-gray-700', 'aria-hidden': true })}
        <span lang="en" className="text-sm text-gray-600">{value}</span>
      </button>

      {isOpen && (
        <>
          {/* Mouse convenience: a click outside closes. Keyboard: Escape or Tab away. */}
          <div aria-hidden="true" className="fixed inset-0 z-40" onClick={() => close(false)} />
          <div
            ref={panelRef}
            id={panelId}
            role="group"
            aria-label={`Chọn ${label.toLowerCase()}`}
            className="absolute top-full left-0 mt-2 w-64 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2"
          >
            <div className="grid grid-cols-6 gap-1">
              {iconList.map((iconName) => {
                const isSelected = value === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    lang="en"
                    aria-label={iconName}
                    aria-pressed={isSelected}
                    onClick={() => {
                      onChange(iconName);
                      close(true);
                    }}
                    className={`p-2 rounded-lg transition-colors ${focusRing} ${
                      isSelected
                        ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title={iconName}
                  >
                    {createElement(getIcon(iconName), { className: 'w-5 h-5', 'aria-hidden': true })}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Export the getIcon function for use in other components
export { getIcon };
