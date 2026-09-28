'use client';

import { useState } from 'react';
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
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const SelectedIcon = getIcon(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <SelectedIcon className="w-5 h-5 text-gray-700" />
        <span className="text-sm text-gray-600">{value}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2">
            <div className="grid grid-cols-6 gap-1">
              {iconList.map((iconName) => {
                const Icon = getIcon(iconName);
                const isSelected = value === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title={iconName}
                  >
                    <Icon className="w-5 h-5" />
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
