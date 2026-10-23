'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  LINK_RULES,
  SOURCE_TYPES,
  SUMMARY_MAX,
  TOOL_TIERS,
  TOOL_TIER_LABELS,
  TYPE_LABELS,
  type EntryType,
} from '@/lib/library/schemas';
import { SOURCE_TYPE_LABELS } from '@/lib/library/citation';
import { CONTRIBUTOR_META_KEYS, type ContributorLinkKind } from '@/lib/schemas/contribution-types/library-entry';

/**
 * Form for an EDIT_LIBRARY_ENTRY proposal: the contributor-safe subset only (title, summary,
 * body sections, descriptive meta of the entry's type, RELATED/CITES links). Slug, type,
 * visibility and admin-only meta are not shown: they can't be proposed.
 */

export interface EntryFormValue {
  title: string;
  summary: string;
  body: { sections: { heading?: string; paragraphs: string[] }[] } | null;
  meta: Record<string, unknown>;
  links: { toId: string; kind: ContributorLinkKind; order: number }[];
}

interface Tier {
  level: string;
  what: string;
  minutes?: number;
  limits?: string;
  picks: { name: string; url: string }[];
}

interface Candidate {
  id: string;
  title: string;
  entryType?: EntryType;
}

const input =
  'w-full px-3 py-2 border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-700 disabled:bg-gray-50 disabled:border-gray-200';
const smallBtn =
  'inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700';

export function asEntryFormValue(data: unknown): EntryFormValue {
  const d = (data && typeof data === 'object' ? data : {}) as Partial<EntryFormValue>;
  return {
    title: typeof d.title === 'string' ? d.title : '',
    summary: typeof d.summary === 'string' ? d.summary : '',
    body: d.body && Array.isArray(d.body.sections) ? d.body : null,
    meta: d.meta && typeof d.meta === 'object' ? d.meta : {},
    links: Array.isArray(d.links) ? d.links : [],
  };
}

/** What gets saved: empty meta values and blank author lines dropped. */
export function entryFormToSaved(v: EntryFormValue): EntryFormValue {
  const meta: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(v.meta)) {
    if (val === undefined || val === null || val === '') continue;
    if (k === 'authors' && Array.isArray(val)) {
      const authors = val.map((a) => String(a).trim()).filter(Boolean);
      if (authors.length) meta.authors = authors;
      continue;
    }
    meta[k] = val;
  }
  return { ...v, meta, links: v.links.map((l, i) => ({ ...l, order: i })) };
}

/**
 * Remove buttons take themselves away. `focusLater(id)` focuses the element with that id
 * after the next render, so keyboard focus isn't dropped to <body>.
 */
function useFocusAfterRender() {
  const target = useRef<string | null>(null);
  useEffect(() => {
    const id = target.current;
    if (!id) return;
    target.current = null;
    document.getElementById(id)?.focus();
  });
  return (id: string) => {
    target.current = id;
  };
}

/** After removing item `i` of `n`: the remove button now at `i`, else the one before, else `fallback`. */
function afterRemoval(i: number, n: number, idAt: (j: number) => string, fallback: string) {
  if (i < n - 1) return idAt(i);
  if (i > 0) return idAt(i - 1);
  return fallback;
}

export default function LibraryEntryProposalForm({
  value,
  entryType,
  selfId,
  readOnly,
  onChange,
}: {
  value: EntryFormValue;
  entryType: EntryType | null;
  /** The entry being edited (never offered as its own link target). */
  selfId: string | null;
  readOnly: boolean;
  onChange: (next: EntryFormValue) => void;
}) {
  const uid = useId();
  const focusLater = useFocusAfterRender();
  const set = (patch: Partial<EntryFormValue>) => onChange({ ...value, ...patch });
  const setMeta = (key: string, v: unknown) => set({ meta: { ...value.meta, [key]: v } });
  const metaStr = (key: string) => (typeof value.meta[key] === 'string' ? (value.meta[key] as string) : '');
  const metaNum = (key: string) => (typeof value.meta[key] === 'number' ? String(value.meta[key]) : '');
  const sections = value.body?.sections ?? [];
  const setSections = (next: { heading?: string; paragraphs: string[] }[]) =>
    set({ body: next.length ? { sections: next } : null });
  const keys = entryType ? CONTRIBUTOR_META_KEYS[entryType] : [];

  const textField = (key: string, label: string, opts: { type?: string; hint?: string } = {}) => (
    <div key={key}>
      <label htmlFor={`${uid}-${key}`} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={`${uid}-${key}`}
        type={opts.type ?? 'text'}
        value={metaStr(key)}
        disabled={readOnly}
        onChange={(e) => setMeta(key, e.target.value)}
        aria-describedby={opts.hint ? `${uid}-${key}-hint` : undefined}
        className={input}
      />
      {opts.hint && (
        <p id={`${uid}-${key}-hint`} className="mt-1 text-xs text-gray-600">
          {opts.hint}
        </p>
      )}
    </div>
  );
  const numberField = (key: string, label: string) => (
    <div key={key}>
      <label htmlFor={`${uid}-${key}`} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={`${uid}-${key}`}
        type="number"
        inputMode="numeric"
        value={metaNum(key)}
        disabled={readOnly}
        onChange={(e) => setMeta(key, e.target.value === '' ? undefined : Number(e.target.value))}
        className={input}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6" aria-labelledby={`${uid}-basic`}>
        <h2 id={`${uid}-basic`} tabIndex={-1} className="text-lg font-semibold text-gray-900">
          Nội dung mục {entryType ? `(${TYPE_LABELS[entryType]})` : ''}
        </h2>
        <div>
          <label htmlFor={`${uid}-title`} className="mb-1 block text-sm font-medium text-gray-700">
            Tiêu đề
          </label>
          <input
            id={`${uid}-title`}
            type="text"
            value={value.title}
            maxLength={300}
            disabled={readOnly}
            onChange={(e) => set({ title: e.target.value })}
            className={input}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-summary`} className="mb-1 block text-sm font-medium text-gray-700">
            Xem nhanh
          </label>
          <textarea
            id={`${uid}-summary`}
            value={value.summary}
            maxLength={SUMMARY_MAX}
            rows={3}
            disabled={readOnly}
            onChange={(e) => set({ summary: e.target.value })}
            aria-describedby={`${uid}-summary-hint`}
            className={`${input} resize-y`}
          />
          <p id={`${uid}-summary-hint`} className="mt-1 text-xs text-gray-600">
            Tối đa 2 câu, {SUMMARY_MAX} ký tự ({value.summary.length}/{SUMMARY_MAX}). Liên kết tới mục khác viết dạng
            [chữ](/tv/slug).
          </p>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6" aria-labelledby={`${uid}-body`}>
        <h2 id={`${uid}-body`} className="text-lg font-semibold text-gray-900">
          Thân bài
        </h2>
        {sections.length === 0 && <p className="text-sm text-gray-600">Chưa có phần nào.</p>}
        {sections.map((sec, si) => (
          <fieldset key={si} className="space-y-3 rounded-lg border border-gray-200 p-3">
            <legend className="px-1 text-sm font-medium text-gray-700">Phần {si + 1}</legend>
            <div>
              <label htmlFor={`${uid}-s${si}-h`} className="mb-1 block text-sm text-gray-700">
                Tiêu đề phần <span className="text-gray-600">(tuỳ chọn)</span>
              </label>
              <input
                id={`${uid}-s${si}-h`}
                type="text"
                value={sec.heading ?? ''}
                maxLength={200}
                disabled={readOnly}
                onChange={(e) =>
                  setSections(sections.map((s, i) => (i === si ? { ...s, heading: e.target.value || undefined } : s)))
                }
                className={input}
              />
            </div>
            {sec.paragraphs.map((p, pi) => (
              <div key={pi}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label htmlFor={`${uid}-s${si}-p${pi}`} className="text-sm text-gray-700">
                    Đoạn {pi + 1}
                  </label>
                  {!readOnly && (
                    <button
                      type="button"
                      id={`${uid}-s${si}-p${pi}-del`}
                      onClick={() => {
                        focusLater(
                          afterRemoval(pi, sec.paragraphs.length, (j) => `${uid}-s${si}-p${j}-del`, `${uid}-s${si}-addp`)
                        );
                        setSections(
                          sections.map((s, i) => (i === si ? { ...s, paragraphs: s.paragraphs.filter((_, j) => j !== pi) } : s))
                        );
                      }}
                      className={`${smallBtn} text-red-700 hover:bg-red-50`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Xóa đoạn<span className="sr-only"> {pi + 1} của phần {si + 1}</span>
                    </button>
                  )}
                </div>
                <textarea
                  id={`${uid}-s${si}-p${pi}`}
                  value={p}
                  maxLength={5000}
                  rows={4}
                  disabled={readOnly}
                  onChange={(e) =>
                    setSections(
                      sections.map((s, i) =>
                        i === si ? { ...s, paragraphs: s.paragraphs.map((x, j) => (j === pi ? e.target.value : x)) } : s
                      )
                    )
                  }
                  className={`${input} resize-y`}
                />
              </div>
            ))}
            {!readOnly && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  id={`${uid}-s${si}-addp`}
                  onClick={() =>
                    setSections(sections.map((s, i) => (i === si ? { ...s, paragraphs: [...s.paragraphs, ''] } : s)))
                  }
                  className={`${smallBtn} bg-teal-50 text-teal-800 hover:bg-teal-100`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Thêm đoạn<span className="sr-only"> vào phần {si + 1}</span>
                </button>
                <button
                  type="button"
                  id={`${uid}-s${si}-del`}
                  onClick={() => {
                    focusLater(afterRemoval(si, sections.length, (j) => `${uid}-s${j}-del`, `${uid}-adds`));
                    setSections(sections.filter((_, i) => i !== si));
                  }}
                  className={`${smallBtn} text-red-700 hover:bg-red-50`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Xóa phần {si + 1}
                </button>
              </div>
            )}
          </fieldset>
        ))}
        {!readOnly && (
          <button
            type="button"
            id={`${uid}-adds`}
            onClick={() => setSections([...sections, { paragraphs: [''] }])}
            className={`${smallBtn} bg-teal-50 text-teal-800 hover:bg-teal-100`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Thêm phần
          </button>
        )}
      </section>

      {keys.length > 0 && (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 sm:p-6" aria-labelledby={`${uid}-meta`}>
          <h2 id={`${uid}-meta`} className="text-lg font-semibold text-gray-900">
            Thông tin mô tả
          </h2>
          {entryType === 'CONCEPT' && (
            <>
              {textField('titleEn', 'Tên tiếng Anh (hoặc tên gốc)')}
              {textField('pronunciation', 'Cách đọc')}
            </>
          )}
          {entryType === 'ACRONYM' && (
            <>
              {textField('expansion', 'Dạng đầy đủ')}
              {textField('expansionVi', 'Dạng đầy đủ (tiếng Việt)')}
            </>
          )}
          {entryType === 'SOURCE' && (
            <>
              <div>
                <label htmlFor={`${uid}-sourceType`} className="mb-1 block text-sm font-medium text-gray-700">
                  Loại nguồn
                </label>
                <select
                  id={`${uid}-sourceType`}
                  value={metaStr('sourceType')}
                  disabled={readOnly}
                  onChange={(e) => setMeta('sourceType', e.target.value || undefined)}
                  className={input}
                >
                  <option value="">Chọn…</option>
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {SOURCE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${uid}-authors`} className="mb-1 block text-sm font-medium text-gray-700">
                  Tác giả
                </label>
                <textarea
                  id={`${uid}-authors`}
                  rows={3}
                  value={Array.isArray(value.meta.authors) ? (value.meta.authors as string[]).join('\n') : ''}
                  disabled={readOnly}
                  onChange={(e) => setMeta('authors', e.target.value.split('\n'))}
                  aria-describedby={`${uid}-authors-hint`}
                  className={`${input} resize-y`}
                />
                <p id={`${uid}-authors-hint`} className="mt-1 text-xs text-gray-600">
                  Mỗi dòng một tác giả.
                </p>
              </div>
              {numberField('year', 'Năm')}
              {textField('date', 'Ngày đăng', { type: 'date' })}
              {textField('containerTitle', 'Tạp chí / báo / chương trình / kênh')}
              {textField('publisher', 'Nhà xuất bản')}
              {textField('url', 'Link', { type: 'url', hint: 'Link http(s). Sách và văn bản pháp luật có số hiệu có thể bỏ trống.' })}
              {textField('archivedUrl', 'Bản lưu trữ (archive)', { type: 'url' })}
              {textField('accessedAt', 'Ngày truy cập', { type: 'date' })}
              {textField('language', 'Ngôn ngữ', { hint: 'Hai chữ cái, ví dụ vi, en.' })}
              {textField('identifier', 'Số hiệu (DOI, ISBN, số văn bản)')}
              {numberField('durationMin', 'Thời lượng (phút)')}
            </>
          )}
          {entryType === 'TOOL' && (
            <TiersEditor
              tiers={Array.isArray(value.meta.tiers) ? (value.meta.tiers as Tier[]) : []}
              readOnly={readOnly}
              onChange={(tiers) => setMeta('tiers', tiers)}
            />
          )}
        </section>
      )}

      <LinksEditor
        entryType={entryType}
        selfId={selfId}
        links={value.links}
        readOnly={readOnly}
        onChange={(links) => set({ links })}
      />
    </div>
  );
}

function TiersEditor({ tiers, readOnly, onChange }: { tiers: Tier[]; readOnly: boolean; onChange: (t: Tier[]) => void }) {
  const uid = useId();
  const focusLater = useFocusAfterRender();
  const update = (i: number, patch: Partial<Tier>) => onChange(tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">
        Mức làm theo (tối đa {TOOL_TIERS.length}). Người phụ trách và hạn rà soát do quản trị viên đặt.
      </p>
      {tiers.map((t, i) => (
        <fieldset key={i} className="space-y-2 rounded-lg border border-gray-200 p-3">
          <legend className="px-1 text-sm font-medium text-gray-700">Mức {i + 1}</legend>
          <label htmlFor={`${uid}-${i}-level`} className="block text-sm text-gray-700">
            Mức
          </label>
          <select
            id={`${uid}-${i}-level`}
            value={t.level}
            disabled={readOnly}
            onChange={(e) => update(i, { level: e.target.value })}
            className={input}
          >
            {TOOL_TIERS.map((lv) => (
              <option key={lv} value={lv}>
                {TOOL_TIER_LABELS[lv]}
              </option>
            ))}
          </select>
          <label htmlFor={`${uid}-${i}-what`} className="block text-sm text-gray-700">
            Làm gì
          </label>
          <textarea
            id={`${uid}-${i}-what`}
            rows={3}
            value={t.what}
            disabled={readOnly}
            onChange={(e) => update(i, { what: e.target.value })}
            className={`${input} resize-y`}
          />
          <label htmlFor={`${uid}-${i}-minutes`} className="block text-sm text-gray-700">
            Số phút
          </label>
          <input
            id={`${uid}-${i}-minutes`}
            type="number"
            value={t.minutes ?? ''}
            disabled={readOnly}
            onChange={(e) => update(i, { minutes: e.target.value === '' ? undefined : Number(e.target.value) })}
            className={input}
          />
          <label htmlFor={`${uid}-${i}-limits`} className="block text-sm text-gray-700">
            Giới hạn
          </label>
          <textarea
            id={`${uid}-${i}-limits`}
            rows={2}
            value={t.limits ?? ''}
            disabled={readOnly}
            onChange={(e) => update(i, { limits: e.target.value || undefined })}
            className={`${input} resize-y`}
          />
          <p className="text-sm text-gray-700">Gợi ý công cụ</p>
          {(t.picks ?? []).map((p, pi) => (
            <div key={pi} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                aria-label={`Tên gợi ý ${pi + 1}, mức ${i + 1}`}
                value={p.name}
                disabled={readOnly}
                onChange={(e) => update(i, { picks: t.picks.map((x, j) => (j === pi ? { ...x, name: e.target.value } : x)) })}
                className={input}
              />
              <input
                aria-label={`Link gợi ý ${pi + 1}, mức ${i + 1}`}
                type="url"
                value={p.url}
                disabled={readOnly}
                onChange={(e) => update(i, { picks: t.picks.map((x, j) => (j === pi ? { ...x, url: e.target.value } : x)) })}
                className={input}
              />
              {!readOnly && (
                <button
                  type="button"
                  id={`${uid}-${i}-pick${pi}-del`}
                  onClick={() => {
                    focusLater(afterRemoval(pi, t.picks.length, (j) => `${uid}-${i}-pick${j}-del`, `${uid}-${i}-addpick`));
                    update(i, { picks: t.picks.filter((_, j) => j !== pi) });
                  }}
                  className={`${smallBtn} text-red-700 hover:bg-red-50`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Xóa<span className="sr-only"> gợi ý {pi + 1}</span>
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                id={`${uid}-${i}-addpick`}
                onClick={() => update(i, { picks: [...(t.picks ?? []), { name: '', url: '' }] })}
                className={`${smallBtn} bg-teal-50 text-teal-800 hover:bg-teal-100`}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Thêm gợi ý<span className="sr-only"> cho mức {i + 1}</span>
              </button>
              <button
                type="button"
                id={`${uid}-${i}-del`}
                onClick={() => {
                  focusLater(afterRemoval(i, tiers.length, (j) => `${uid}-${j}-del`, `${uid}-addtier`));
                  onChange(tiers.filter((_, j) => j !== i));
                }}
                className={`${smallBtn} text-red-700 hover:bg-red-50`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Xóa mức {i + 1}
              </button>
            </div>
          )}
        </fieldset>
      ))}
      {!readOnly && tiers.length < TOOL_TIERS.length && (
        <button
          type="button"
          id={`${uid}-addtier`}
          onClick={() => onChange([...tiers, { level: TOOL_TIERS[tiers.length] ?? 'co-ban', what: '', picks: [] }])}
          className={`${smallBtn} bg-teal-50 text-teal-800 hover:bg-teal-100`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Thêm mức
        </button>
      )}
    </div>
  );
}

const KIND_LABEL: Record<ContributorLinkKind, string> = { RELATED: 'Liên quan', CITES: 'Trích nguồn' };

function LinksEditor({
  entryType,
  selfId,
  links,
  readOnly,
  onChange,
}: {
  entryType: EntryType | null;
  selfId: string | null;
  links: EntryFormValue['links'];
  readOnly: boolean;
  onChange: (links: EntryFormValue['links']) => void;
}) {
  const uid = useId();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<ContributorLinkKind>('RELATED');
  const [announce, setAnnounce] = useState('');
  const focusLater = useFocusAfterRender();
  const allowedKinds = (['RELATED', 'CITES'] as const).filter((k) => !entryType || LINK_RULES[k].from.includes(entryType));

  useEffect(() => {
    let cancelled = false;
    fetch('/api/library')
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { data?: Candidate[] } | null) => {
        if (!cancelled && body?.data) setCandidates(body.data.filter((c) => c.entryType));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const titleOf = useMemo(() => new Map(candidates.map((c) => [c.id, c.title])), [candidates]);
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('vi');
    if (!q) return [];
    const to = LINK_RULES[kind].to;
    return candidates
      .filter((c) => c.id !== selfId && c.entryType && to.includes(c.entryType))
      .filter((c) => !links.some((l) => l.toId === c.id && l.kind === kind))
      .filter((c) => c.title.toLocaleLowerCase('vi').includes(q))
      .slice(0, 8);
  }, [candidates, query, kind, links, selfId]);

  return (
    <section className="space-y-3 rounded-xl border border-gray-100 bg-white p-4 sm:p-6" aria-labelledby={`${uid}-links`}>
      <h2 id={`${uid}-links`} className="text-lg font-semibold text-gray-900">
        Liên kết
      </h2>
      {allowedKinds.length === 0 ? (
        <p className="text-sm text-gray-600">Loại mục này không có liên kết do người đóng góp đề xuất.</p>
      ) : (
        <>
          {links.length === 0 ? (
            <p className="text-sm text-gray-600">Chưa có liên kết.</p>
          ) : (
            <ul className="space-y-1">
              {links.map((l, i) => (
                <li key={`${l.toId}-${l.kind}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span>
                    <span className="font-medium">{KIND_LABEL[l.kind]}:</span> {titleOf.get(l.toId) ?? `mục ${l.toId}`}
                  </span>
                  {!readOnly && (
                    <button
                      type="button"
                      id={`${uid}-link${i}-del`}
                      onClick={() => {
                        // Links are keyed by target, so the next link's button moves up into slot i.
                        focusLater(afterRemoval(i, links.length, (j) => `${uid}-link${j}-del`, `${uid}-q`));
                        onChange(links.filter((_, j) => j !== i));
                        setAnnounce(`Đã bỏ liên kết tới ${titleOf.get(l.toId) ?? 'mục'}`);
                      }}
                      className={`${smallBtn} text-red-700 hover:bg-red-50`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Bỏ<span className="sr-only"> liên kết tới {titleOf.get(l.toId) ?? 'mục'}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!readOnly && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr]">
                <div>
                  <label htmlFor={`${uid}-kind`} className="mb-1 block text-sm text-gray-700">
                    Loại liên kết
                  </label>
                  <select
                    id={`${uid}-kind`}
                    value={kind}
                    onChange={(e) => setKind(e.target.value as ContributorLinkKind)}
                    className={input}
                  >
                    {allowedKinds.map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`${uid}-q`} className="mb-1 block text-sm text-gray-700">
                    Tìm mục để liên kết
                  </label>
                  <input
                    id={`${uid}-q`}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-describedby={`${uid}-q-hint`}
                    className={input}
                  />
                  <p id={`${uid}-q-hint`} className="mt-1 text-xs text-gray-600">
                    {kind === 'CITES' ? 'Trích nguồn chỉ trỏ tới mục Nguồn.' : 'Liên quan trỏ tới Mục từ hoặc Công cụ.'}
                  </p>
                </div>
              </div>
              {query.trim() && (
                <ul aria-label="Kết quả tìm" className="space-y-1">
                  {results.length === 0 ? (
                    <li className="text-sm text-gray-600">Không có mục phù hợp.</li>
                  ) : (
                    results.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            // The added entry leaves the results: back to the search box for the next one.
                            focusLater(`${uid}-q`);
                            onChange([...links, { toId: c.id, kind, order: links.length }]);
                            setAnnounce(`Đã thêm liên kết ${KIND_LABEL[kind]} tới ${c.title}`);
                          }}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                        >
                          Thêm: {c.title}
                          {c.entryType && <span className="text-gray-600"> ({TYPE_LABELS[c.entryType]})</span>}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </>
      )}
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}
