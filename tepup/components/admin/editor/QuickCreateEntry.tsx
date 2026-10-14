'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import {
  SOURCE_TYPES,
  SUMMARY_MAX,
  TYPE_LABELS,
  type EntryType,
  type LinkKind,
} from '@/lib/library/schemas';
import { SOURCE_TYPE_LABELS } from '@/lib/library/citation';
import { slugifyEntry } from '@/lib/library/slugify';
import type { PickedEntry } from './ReferencePicker';
import { useSourceDuplicate } from '@/lib/library/useSourceDuplicate';

/**
 * Tạo nhanh một mục thư viện ngay trong trình soạn bài (chỉ quản trị viên): chỉ các
 * trường mà loại mục BẮT BUỘC (viết tắt cần đích, nguồn cần link…).
 * Lưu xong thì chèn luôn link /tv/ vào bài. Thân bài, công cụ theo mức… bổ sung sau ở
 * trang đầy đủ (Quản trị › Thư viện). API: POST /api/admin/library-entries.
 */

const FIELD =
  'w-full rounded-md border border-gray-500 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 aria-[invalid=true]:border-red-600';
const LABEL = 'block text-xs font-medium text-gray-700 mb-0.5';

const QUICK_TYPES: EntryType[] = ['CONCEPT', 'SOURCE', 'ACRONYM', 'TOOL'];

interface Target {
  id: string;
  slug: string;
  type: EntryType;
  title: string;
}

export default function QuickCreateEntry({
  initialText,
  onCreated,
  onCancel,
}: {
  /** Chữ đang tìm hoặc đang bôi đen: điền sẵn làm tiêu đề (hoặc link, nếu là URL). */
  initialText: string;
  onCreated: (entry: PickedEntry & { id: string }) => void;
  onCancel: () => void;
}) {
  const uid = useId();
  const isUrl = /^https?:\/\//i.test(initialText.trim());
  const [type, setType] = useState<EntryType>(isUrl ? 'SOURCE' : 'CONCEPT');
  const [title, setTitle] = useState(isUrl ? '' : initialText.trim());
  const [slug, setSlug] = useState(isUrl ? '' : slugifyEntry(initialText));
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState('');
  // Trường riêng theo loại.
  const [titleEn, setTitleEn] = useState('');
  const [expansion, setExpansion] = useState('');
  const [sourceType, setSourceType] = useState<string>('bao-chi');
  const [url, setUrl] = useState(isUrl ? initialText.trim() : '');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [owner, setOwner] = useState('');
  const [reviewBy, setReviewBy] = useState('');
  const [target, setTarget] = useState<Target | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const firstRef = useRef<HTMLSelectElement>(null);
  const duplicate = useSourceDuplicate(type === 'SOURCE' ? url : '', type === 'SOURCE' ? identifier : '');

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  // Một liên kết đặt luôn khi tạo: mục từ → mục liên quan (không bắt buộc); viết tắt → mục nó
  // viết tắt cho (bắt buộc). Nguồn thì được mục khác trích, gắn ở mục đó.
  const linkSpec: { kind: LinkKind; label: string; types: EntryType[]; required: boolean } | null =
    type === 'CONCEPT'
      ? { kind: 'RELATED', label: 'Liên quan tới (không bắt buộc)', types: ['CONCEPT', 'TOOL'], required: false }
      : type === 'ACRONYM'
        ? { kind: 'EXPANDS_TO', label: 'Trỏ tới mục', types: ['CONCEPT', 'TOOL'], required: true }
        : null;

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugifyEntry(v));
  }

  function meta(): Record<string, unknown> {
    switch (type) {
      case 'CONCEPT':
        return titleEn.trim() ? { titleEn: titleEn.trim() } : {};
      case 'ACRONYM':
        return { expansion: expansion.trim() };
      case 'SOURCE':
        return {
          sourceType,
          authors: authors.split(';').map((a) => a.trim()).filter(Boolean),
          ...(url.trim() ? { url: url.trim(), accessedAt: new Date().toISOString().slice(0, 10) } : {}),
          ...(year.trim() ? { year: Number(year) } : {}),
          ...(identifier.trim() ? { identifier: identifier.trim() } : {}),
        };
      case 'TOOL':
        return { owner: owner.trim(), reviewBy, tiers: [] };
      default:
        return {};
    }
  }

  async function save() {
    if (saving) return;
    if (linkSpec?.required && !target) {
      setError(`Chọn mục cho “${linkSpec.label}”.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/library-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          slug,
          summary,
          isActive: true,
          meta: meta(),
          links: linkSpec && target ? [{ kind: linkSpec.kind, toId: target.id, order: 0 }] : [],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError([json.error, ...(json.issues ?? [])].filter(Boolean).join('\n'));
        return;
      }
      const e = json.data;
      onCreated({ id: e.id, slug: e.slug, type: e.type, title: e.title, summary: e.summary });
    } catch {
      setError('Không lưu được. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setSaving(false);
    }
  }

  /** Enter ở ô một dòng = lưu (không khi đang gõ dấu tiếng Việt bằng bộ gõ). */
  const enterSaves = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      save();
    }
  };

  return (
    // Không dùng <form>: ô này có thể nằm trong form khác (ngăn sửa block). Enter ở ô một dòng = lưu (enterSaves).
    <div role="group" aria-labelledby={`${uid}-h`} className="space-y-2 text-sm">
      <p id={`${uid}-h`} className="font-semibold text-gray-900">
        Tạo mục mới
      </p>
      <div>
        <label htmlFor={`${uid}-type`} className={LABEL}>
          Loại
        </label>
        <select
          ref={firstRef}
          id={`${uid}-type`}
          value={type}
          onChange={(e) => {
            setType(e.target.value as EntryType);
            setTarget(null);
          }}
          className={FIELD}
        >
          {QUICK_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${uid}-title`} className={LABEL}>
          {type === 'ACRONYM' ? 'Chữ viết tắt' : 'Tiêu đề'} *
        </label>
        <input id={`${uid}-title`} onKeyDown={enterSaves} value={title} onChange={(e) => onTitle(e.target.value)} className={FIELD} />
      </div>
      <div>
        <label htmlFor={`${uid}-slug`} className={LABEL}>
          Slug *
        </label>
        <input
          onKeyDown={enterSaves}
          id={`${uid}-slug`}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={`${FIELD} font-mono`}
        />
      </div>
      <div>
        <label htmlFor={`${uid}-sum`} className={LABEL}>
          Xem nhanh * <span className="font-normal text-gray-600">({summary.length}/{SUMMARY_MAX})</span>
        </label>
        <textarea
          id={`${uid}-sum`}
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          aria-invalid={summary.length > SUMMARY_MAX}
          className={FIELD}
        />
      </div>

      {type === 'CONCEPT' && (
        <div>
          <label htmlFor={`${uid}-en`} className={LABEL}>
            Tên tiếng Anh / tên gốc
          </label>
          <input id={`${uid}-en`} onKeyDown={enterSaves} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={FIELD} />
        </div>
      )}
      {type === 'ACRONYM' && (
        <div>
          <label htmlFor={`${uid}-exp`} className={LABEL}>
            Dạng đầy đủ *
          </label>
          <input id={`${uid}-exp`} onKeyDown={enterSaves} value={expansion} onChange={(e) => setExpansion(e.target.value)} className={FIELD} />
        </div>
      )}
      {type === 'SOURCE' && (
        <>
          <div>
            <label htmlFor={`${uid}-st`} className={LABEL}>
              Loại nguồn
            </label>
            <select id={`${uid}-st`} value={sourceType} onChange={(e) => setSourceType(e.target.value)} className={FIELD}>
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_TYPE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-url`} className={LABEL}>
              Link {sourceType === 'sach' || sourceType === 'van-ban-phap-luat' ? '' : '*'}
            </label>
            <input id={`${uid}-url`} onKeyDown={enterSaves} type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label htmlFor={`${uid}-au`} className={LABEL}>
              Tác giả (cách nhau bằng ;)
            </label>
            <input id={`${uid}-au`} onKeyDown={enterSaves} value={authors} onChange={(e) => setAuthors(e.target.value)} className={FIELD} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`${uid}-yr`} className={LABEL}>
                Năm
              </label>
              <input id={`${uid}-yr`} onKeyDown={enterSaves} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} className={FIELD} />
            </div>
            <div>
              <label htmlFor={`${uid}-id`} className={LABEL}>
                DOI / ISBN / số hiệu
              </label>
              <input id={`${uid}-id`} onKeyDown={enterSaves} value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={FIELD} />
            </div>
          </div>
        </>
      )}
      {duplicate && (
        <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 space-y-1">
          <p>
            Nguồn này đã có trong thư viện: <strong>“{duplicate.title}”</strong>.
          </p>
          <button
            type="button"
            onClick={() => onCreated({ ...duplicate })}
            className="font-medium text-purple-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Dùng mục có sẵn và chèn link
          </button>
        </div>
      )}
      {type === 'TOOL' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={`${uid}-ow`} className={LABEL}>
              Người phụ trách *
            </label>
            <input id={`${uid}-ow`} onKeyDown={enterSaves} value={owner} onChange={(e) => setOwner(e.target.value)} className={FIELD} />
          </div>
          <div>
            <label htmlFor={`${uid}-rv`} className={LABEL}>
              Rà soát trước *
            </label>
            <input id={`${uid}-rv`} onKeyDown={enterSaves} type="date" value={reviewBy} onChange={(e) => setReviewBy(e.target.value)} className={FIELD} />
          </div>
        </div>
      )}

      {linkSpec && (
        <TargetSearch
          label={linkSpec.label}
          types={linkSpec.types}
          value={target}
          onChange={setTarget}
        />
      )}

      <p role="alert" className="text-xs text-red-700 whitespace-pre-line empty:hidden">
        {error}
      </p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={save}
          aria-disabled={saving}
          className="flex-1 px-3 py-1.5 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 aria-disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
        >
          {saving ? 'Đang lưu…' : 'Tạo và chèn'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Huỷ
        </button>
      </div>
      <p className="text-xs text-gray-600">Thân bài và nguồn trích dẫn bổ sung sau ở Quản trị › Thư viện.</p>
    </div>
  );
}

/** Chọn một mục đích cho liên kết đặt lúc tạo (mục liên quan, đích của viết tắt). */
function TargetSearch({
  label,
  types,
  value,
  onChange,
}: {
  label: string;
  types: EntryType[];
  value: Target | null;
  onChange: (t: Target | null) => void;
}) {
  const id = useId();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Target[]>([]);
  const typesKey = types.join(',');

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const t = setTimeout(async () => {
      const lists = await Promise.all(
        typesKey.split(',').map((ty) =>
          fetch(`/api/admin/library-entries?type=${ty}&take=8&q=${encodeURIComponent(term)}`)
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((j) => j.data as Target[]),
        ),
      );
      setResults(lists.flat());
    }, 200);
    return () => clearTimeout(t);
  }, [q, typesKey]);

  if (value) {
    return (
      <div>
        <p className={LABEL}>{label}</p>
        <p className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-purple-50 text-purple-900 text-xs">
          {TYPE_LABELS[value.type]}: {value.title}
          <button type="button" onClick={() => onChange(null)} className="p-0.5 rounded-full hover:bg-purple-100" aria-label={`Bỏ ${value.title}`}>
            <X className="w-3 h-3" aria-hidden="true" />
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
        <input id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm…" className={`${FIELD} pl-7`} />
      </div>
      {q.trim() !== '' && results.length > 0 && (
        <ul className="mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onChange(r)}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span className="text-gray-600">{TYPE_LABELS[r.type]}:</span> {r.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.trim() !== '' && results.length === 0 && (
        <p className="mt-1 text-xs text-gray-600">Chưa có. Tạo mục đó trước, rồi quay lại.</p>
      )}
    </div>
  );
}
