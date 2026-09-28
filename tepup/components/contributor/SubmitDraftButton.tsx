'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function SubmitDraftButton({ contributionId }: { contributionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!confirm('Gửi bản nháp này để duyệt?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/contributor/contributions/${contributionId}/submit`, {
        method: 'POST',
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi gửi duyệt');
      }
    } catch {
      alert('Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={loading}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
    >
      <Send className="w-3.5 h-3.5" />
      {loading ? 'Đang gửi...' : 'Gửi duyệt'}
    </button>
  );
}
