'use client';

import { Eye, EyeOff } from 'lucide-react';

/**
 * Show/hide button inside a password field. A toggle button: the name stays "Hiện mật khẩu"
 * and `aria-pressed` says whether it is on (a name that flips as well would be read as
 * "Ẩn mật khẩu, đã nhấn", which contradicts itself). 32px target, gray-600 icon (3:1+).
 */
export default function PasswordToggle({
  shown,
  onToggle,
  controls,
}: {
  shown: boolean;
  onToggle: () => void;
  /** Ids of the password inputs it reveals. */
  controls: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Hiện mật khẩu"
      aria-pressed={shown}
      aria-controls={controls}
      title={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      {shown ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}
