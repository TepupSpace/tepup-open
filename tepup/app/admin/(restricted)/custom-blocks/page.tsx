'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Puzzle, Pencil, Copy, Eye, TrendingUp, Calculator, BarChart3, Sliders, Brain, Zap, Loader2, AlertCircle } from 'lucide-react';
import type { CustomBlockTypeSummary } from '@/lib/types/custom-block';

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

export default function CustomBlocksPage() {
  const [blockTypes, setBlockTypes] = useState<CustomBlockTypeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cloningId, setCloningId] = useState<string | null>(null);

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
    setCloningId(id);
    try {
      const res = await fetch(`/api/admin/custom-block-types/${id}?action=clone`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Lỗi nhân bản');
      await loadBlockTypes();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setCloningId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Block Builder</h1>
          <p className="text-gray-600 mt-1">Tạo loại block tương tác mới bằng prompt AI</p>
        </div>
        <Link
          href="/admin/custom-blocks/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo block mới</span>
        </Link>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
        <Puzzle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Block Builder</strong> cho phép bạn tạo loại block tương tác mới bằng prompt tự nhiên — không cần viết code.
          AI sinh React component và bạn xem preview ngay trong trình duyệt.
          Khi dùng trong bài học, admin điền các trường cấu hình để tuỳ chỉnh nội dung.
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Đang tải...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Block types grid */}
      {!isLoading && !error && blockTypes.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Puzzle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có block type nào</h3>
          <p className="text-gray-500 mb-6">Tạo block type đầu tiên bằng prompt AI</p>
          <Link
            href="/admin/custom-blocks/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo block đầu tiên
          </Link>
        </div>
      )}

      {!isLoading && !error && blockTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {blockTypes.map((bt) => {
            const Icon = ICON_MAP[bt.icon] ?? Puzzle;
            const colors = COLOR_MAP[bt.accentColor] ?? COLOR_MAP.blue;

            return (
              <div
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
                      <h3 className="font-semibold text-gray-900 truncate">{bt.name}</h3>
                      {bt.usageCount === 0 && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded flex-shrink-0">Chưa dùng</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">/{bt.slug}</p>
                  </div>
                </div>

                {bt.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bt.description}</p>
                )}

                <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
                  <span>Dùng trong <strong className="text-gray-700">{bt.usageCount}</strong> bài học</span>
                  <span>·</span>
                  <span>{new Date(bt.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Xem preview — coming soon"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>

                  {bt.usageCount === 0 ? (
                    <Link
                      href={`/admin/custom-blocks/new?edit=${bt.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Chỉnh sửa
                    </Link>
                  ) : (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 rounded-lg cursor-not-allowed"
                      title="Không thể chỉnh sửa khi đang dùng trong bài học"
                      disabled
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="line-through">Chỉnh sửa</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleClone(bt.id)}
                    disabled={cloningId === bt.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ml-auto disabled:opacity-50"
                    title="Nhân bản để tạo biến thể mới"
                  >
                    {cloningId === bt.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Nhân bản
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
