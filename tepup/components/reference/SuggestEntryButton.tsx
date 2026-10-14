'use client';

import { useState } from 'react';
import { PencilLine } from 'lucide-react';
import SuggestEditDialog from '@/components/learn/SuggestEditDialog';

/** "Đề xuất mục mới" trên trang thư viện: cùng form góp ý, người học chọn loại mục. */
export default function SuggestEntryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
      >
        <PencilLine className="w-4 h-4" aria-hidden="true" />
        Đề xuất mục mới
      </button>
      <SuggestEditDialog open={open} onClose={() => setOpen(false)} contentType="new-entry" contentId="thu-vien" title="Thư viện" />
    </>
  );
}
