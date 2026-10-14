'use client';

import { useState } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { useSavedEntries, toggleSaved } from '@/lib/library/saved';
import SuggestEditDialog from '@/components/learn/SuggestEditDialog';

/**
 * Hàng nút của một mục: ☆ Lưu (danh sách cá nhân, trong trình duyệt) và "Góp ý về
 * mục này" (vào hàng chờ duyệt ẩn danh như góp ý bài học). §7.1, §7.2.
 */
export default function EntryActions({ id, slug, title }: { id: string; slug: string; title: string }) {
  const saved = useSavedEntries().some((e) => e.slug === slug);
  const [suggesting, setSuggesting] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => setMessage(toggleSaved(slug) ? `Đã lưu “${title}”` : `Đã bỏ lưu “${title}”`)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
      >
        <Star className={`w-4 h-4 ${saved ? 'fill-amber-400 text-amber-600' : 'text-gray-600'}`} aria-hidden="true" />
        {saved ? 'Đã lưu' : 'Lưu'}
      </button>
      <button
        type="button"
        onClick={() => setSuggesting(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
      >
        <MessageSquarePlus className="w-4 h-4 text-gray-600" aria-hidden="true" />
        Góp ý về mục này
      </button>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      <SuggestEditDialog
        open={suggesting}
        onClose={() => setSuggesting(false)}
        contentType="library-entry"
        contentId={id}
        title={title}
      />
    </div>
  );
}
