'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Puzzle, Pencil, Copy, Eye, TrendingUp, Calculator, BarChart3, Sliders, Brain, Zap, Loader2, AlertCircle } from 'lucide-react';
import type { CustomBlockTypeSummary } from '@/lib/types/custom-block';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';

const ICON_MAP: Record<string, React.ElementType> = {
  'trending-up': TrendingUp,
  'calculator': Calculator,
  'bar-chart-3': BarChart3,
  'sliders': Sliders,
  'brain': Brain,
  'zap': Zap,
  'puzzle': Puzzle,
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    border: 'border-cyan-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-200' },
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200' },
};

export default function CustomBlocksClient() {
  const [blockTypes, setBlockTypes] = useState<CustomBlockTypeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [cloneError, setCloneError] = useState('');
  const [message, announce] = useAnnouncer();

  async function loadBlockTypes() {
    try {
      const res = await fetch('/api/admin/custom-block-types');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Lỗi tải danh sách');
      setBlockTypes(json.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadBlockTypes(); }, []);

  async function handleClone(id: string) {
    // Nút không bị `disabled` lúc đang nhân bản (để không mất focus): chặn bấm lặp ở đây.
    if (cloningId) return;
    const name = blockTypes.find((b) => b.id === id)?.name ?? '';
    setCloningId(id);
    setCloneError('');
    try {
      const res = await fetch(`/api/admin/custom-block-types/${id}?action=clone`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Lỗi nhân bản');
      await loadBlockTypes();
      announce(`Đã nhân bản ${name}. Bản sao nằm trong danh sách.`);
    } catch (e) {
      // Trước đây là alert(); giờ hiện trong vùng role="alert" trên trang.
      setCloneError((e as Error).message);
    } finally {
      setCloningId(null);
    }
  }

  return (
    <div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Block tuỳ chỉnh</h1>
          <p className="text-gray-600 mt-1">Tạo loại block tương tác mới bằng mô tả cho AI</p>
        </div>
        <Link
          href="/admin/custom-blocks/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo block mới</span>
        </Link>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
        <Puzzle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Trình tạo block</strong> cho phép bạn tạo loại block tương tác mới bằng mô tả tự nhiên — không cần viết code.
          AI sinh component React và bạn xem trước ngay trong trình duyệt.
          Khi dùng trong bài học, admin điền các trường cấu hình để tuỳ chỉnh nội dung.
        </div>
      </div>

      {/* Loading */}
      <div role="status" className="empty:hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Đang tải...</span>
          </div>
        )}
      </div>

      {/* Error (tải danh sách hoặc nhân bản) */}
      <div role="alert" className="empty:hidden">
        {(error || cloneError) && (
          <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error || cloneError}
          </div>
        )}
      </div>

      {/* Block types grid */}
      {!isLoading && !error && blockTypes.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Puzzle className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Chưa có loại block nào</h2>
          <p className="text-gray-500 mb-6">Tạo loại block đầu tiên bằng mô tả cho AI</p>
          <Link
            href="/admin/custom-blocks/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo block đầu tiên
          </Link>
        </div>
      )}

      {!isLoading && !error && blockTypes.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {blockTypes.map((bt) => {
            const Icon = ICON_MAP[bt.icon] ?? Puzzle;
            const colors = COLOR_MAP[bt.accentColor] ?? COLOR_MAP.blue;

            return (
              <li
                key={bt.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="font-semibold text-gray-900 truncate">{bt.name}</h2>
                      {bt.usageCount === 0 && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded flex-shrink-0">Chưa dùng</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">/{bt.slug}</p>
                  </div>
                </div>

                {bt.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bt.description}</p>
                )}

                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                  <span>Dùng trong <strong className="text-gray-700">{bt.usageCount}</strong> bài học</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(bt.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  {/* Chưa làm: nút ở dạng aria-disabled (vẫn Tab tới được) và nói rõ là sắp có. */}
                  <button
                    type="button"
                    aria-disabled="true"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 rounded-lg cursor-not-allowed"
                    title="Xem trước — sắp có"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem trước
                    <span className="sr-only"> (sắp có)</span>
                  </button>

                  {bt.usageCount === 0 ? (
                    <Link
                      href={`/admin/custom-blocks/new?edit=${bt.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Chỉnh sửa<span className="sr-only"> {bt.name}</span>
                    </Link>
                  ) : (
                    // aria-disabled thay cho disabled: vẫn Tab tới được, nên lý do không sửa được
                    // đến được người dùng bàn phím và trình đọc màn hình, không chỉ qua `title`.
                    <button
                      type="button"
                      aria-disabled="true"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 rounded-lg cursor-not-allowed"
                      title="Không thể chỉnh sửa khi đang dùng trong bài học"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="line-through">Chỉnh sửa</span>
                      <span className="sr-only"> {bt.name} — không sửa được vì đang dùng trong bài học</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleClone(bt.id)}
                    aria-disabled={cloningId === bt.id || undefined}
                    aria-busy={cloningId === bt.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ml-auto aria-disabled:opacity-70 aria-disabled:cursor-wait"
                    title="Nhân bản để tạo biến thể mới"
                  >
                    {cloningId === bt.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Nhân bản<span className="sr-only"> {bt.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
