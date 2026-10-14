'use client';

import { useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import { Plus, Pencil, Search, AlertTriangle } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { ENTRY_TYPES, TYPE_LABELS, type EntryType } from '@/lib/library/schemas';

interface Row {
  id: string;
  slug: string;
  type: EntryType;
  title: string;
  summary: string;
  isActive: boolean;
  updatedAt: string;
  meta: { reviewBy?: string };
}

const TYPE_CHIP: Record<EntryType, string> = {
  CONCEPT: 'bg-indigo-100 text-indigo-800',
  SOURCE: 'bg-amber-100 text-amber-900',
  ACRONYM: 'bg-sky-100 text-sky-800',
  TOOL: 'bg-rose-100 text-rose-800',
};

/**
 * Danh sách mục thư viện (mục từ, nguồn, viết tắt, công cụ).
 * Công cụ quá hạn rà soát được đưa lên đầu (docs/design-reference-library.md §9.1).
 */
export default function EntriesClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState<EntryType | ''>('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [today] = useState(() => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10));

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set('q', q.trim());
        if (type) params.set('type', type);
        params.set('take', '500');
        const res = await fetch(`/api/admin/library-entries?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setRows(json.data);
        setError('');
      } catch {
        setError('Không tải được danh sách mục');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, type]);

  const overdue = (r: Row) => r.type === 'TOOL' && !!r.meta?.reviewBy && r.meta.reviewBy < today;
  const sorted = [...rows].sort((a, b) => Number(overdue(b)) - Number(overdue(a)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thư viện</h1>
          <p className="text-gray-600 mt-1">
            Mục từ, nguồn, viết tắt và công cụ, nối với nhau thành mạng. Bài học trỏ tới một mục bằng link{' '}
            <code className="text-sm">/tv/&lt;slug&gt;</code>.
          </p>
        </div>
        <Link
          href={`/admin/library-entries/new${type ? `?type=${type}` : ''}`}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span>Tạo mục mới</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <label htmlFor="entry-search" className="sr-only">
            Tìm mục
          </label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" aria-hidden="true" />
          <input
            id="entry-search"
            type="search"
            placeholder="Tìm theo tiêu đề, slug hoặc phần xem nhanh..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label htmlFor="entry-type" className="sr-only">
            Lọc theo loại
          </label>
          <select
            id="entry-type"
            value={type}
            onChange={(e) => setType(e.target.value as EntryType | '')}
            className="px-4 py-2 border border-gray-500 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Mọi loại</option>
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p role="status" className="sr-only">
        {loading ? '' : `${rows.length} mục`}
      </p>
      {error && (
        <p role="alert" className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <caption className="sr-only">Danh sách mục tham chiếu</caption>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="text-left px-6 py-3 text-sm font-medium text-gray-600">Mục</th>
                <th scope="col" className="text-left px-6 py-3 text-sm font-medium text-gray-600">Loại</th>
                <th scope="col" className="text-left px-6 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
                <th scope="col" className="text-right px-6 py-3 text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {q || type ? 'Không có mục nào phù hợp' : 'Chưa có mục nào.'}
                  </td>
                </tr>
              ) : (
                sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <th scope="row" className="px-6 py-3 text-left font-normal">
                      <div className="font-medium text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-600 font-mono">/tv/{r.slug}</div>
                      <div className="text-sm text-gray-600 line-clamp-1">{r.summary}</div>
                    </th>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${TYPE_CHIP[r.type]}`}>
                        {TYPE_LABELS[r.type]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {overdue(r) ? (
                        <span className="inline-flex items-center gap-1 text-red-700 font-medium">
                          <AlertTriangle className="w-4 h-4" aria-hidden="true" /> Quá hạn rà soát
                        </span>
                      ) : r.isActive ? (
                        <span className="text-green-800">Hiển thị</span>
                      ) : (
                        <span className="text-gray-600">Đang ẩn</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        href={`/admin/library-entries/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-50 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                        Sửa<span className="sr-only"> {r.title}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
