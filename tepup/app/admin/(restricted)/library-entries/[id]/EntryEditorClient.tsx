'use client';

import { use, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2, ExternalLink, X, Search } from 'lucide-react';
import Link from '@/components/ui/AppLink';
import EditorSaveBar from '@/components/admin/editor/EditorSaveBar';
import { useDraftAutosave } from '@/lib/hooks/useDraftAutosave';
import { useUnsavedChangesGuard } from '@/lib/hooks/useUnsavedChangesGuard';
import Spinner from '@/components/ui/Spinner';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import ConfirmDialog from '../../../_components/ConfirmDialog';
import { FormError, RequiredMark, RequiredNote, labelClass } from '../../../_components/form';
import {
  ENTRY_TYPES,
  LINK_RULES,
  SOURCE_TYPES,
  SUMMARY_MAX,
  TOOL_TIERS,
  TOOL_TIER_LABELS,
  TYPE_LABELS,
  EDITABLE_LINK_KINDS,
  type EntryType,
  type LinkKind,
} from '@/lib/library/schemas';
import { SOURCE_TYPE_LABELS } from '@/lib/library/citation';
import { slugifyEntry } from '@/lib/library/slugify';
import { useSourceDuplicate } from '@/lib/library/useSourceDuplicate';

const fieldClass =
  'w-full px-3 py-2 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 aria-[invalid=true]:border-red-600';

interface EntryRef {
  id: string;
  slug: string;
  type: EntryType;
  title: string;
}
interface LinkRow {
  kind: LinkKind;
  to: EntryRef;
}
type Meta = Record<string, unknown>;
/** Toàn bộ form của mục: là thứ được tự lưu thành nháp, và nạp lại từ nháp. */
interface FormValue {
  type: EntryType;
  title: string;
  slug: string;
  summary: string;
  isActive: boolean;
  meta: Meta;
  sections: Section[];
  links: LinkRow[];
}
interface Section {
  heading: string;
  /** Các đoạn, cách nhau bằng một dòng trống. */
  text: string;
}

/** Nhóm liên kết hiện trong form, theo loại mục (§4.1). Link /tv/ trong thân bài tự thành liên kết. */
const LINK_GROUPS: Record<EntryType, { kind: LinkKind; legend: string; hint: string }[]> = {
  CONCEPT: [
    { kind: 'RELATED', legend: 'Liên quan', hint: 'Hai chiều: hiện ở cả hai mục. Link /tv/ trong thân bài cũng tự nối hai mục (liên kết ngược).' },
    { kind: 'CITES', legend: 'Nguồn', hint: 'Liên kết tĩnh: nhập nguồn một lần ở đây, bài học chỉ cần trỏ tới mục này.' },
  ],
  SOURCE: [],
  ACRONYM: [{ kind: 'EXPANDS_TO', legend: 'Trỏ tới mục', hint: 'Bắt buộc, ít nhất một.' }],
  TOOL: [
    { kind: 'RELATED', legend: 'Liên quan', hint: 'Hai chiều: hiện ở cả hai mục.' },
    { kind: 'CITES', legend: 'Nguồn', hint: 'Nguồn cho các khuyến nghị trong công cụ.' },
  ],
};

const isEditableKind = (k: LinkKind) => (EDITABLE_LINK_KINDS as readonly string[]).includes(k);

function sectionsFromBody(body: unknown): Section[] {
  const b = body as { sections?: { heading?: string; paragraphs?: string[] }[] } | null;
  if (!b?.sections?.length) return [];
  return b.sections.map((s) => ({ heading: s.heading ?? '', text: (s.paragraphs ?? []).join('\n\n') }));
}

function bodyFromSections(sections: Section[]) {
  const out = sections
    .map((s) => ({
      ...(s.heading.trim() ? { heading: s.heading.trim() } : {}),
      paragraphs: s.text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    }))
    .filter((s) => s.paragraphs.length || s.heading);
  return out.length ? { sections: out } : null;
}

/** Ô nhập số trống → undefined, để không gửi 0 khi người dùng chưa điền. */
const numOrUndef = (v: string) => (v.trim() === '' ? undefined : Number(v));
const strOrUndef = (v: string) => (v.trim() === '' ? undefined : v.trim());

export default function EntryEditorClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const search = useSearchParams();
  const initialType = (ENTRY_TYPES as readonly string[]).includes(search.get('type') ?? '')
    ? (search.get('type') as EntryType)
    : 'CONCEPT';

  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [message, announce] = useAnnouncer();
  const [type, setType] = useState<EntryType>(initialType);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [summary, setSummary] = useState('');
  const [isActive, setIsActive] = useState(true);
  // "Tạo nguồn từ link này" (bộ chọn tham chiếu trong trình soạn thảo) mở trang này với ?url=.
  const prefillUrl = search.get('url');
  const [meta, setMeta] = useState<Meta>(() => ({
    ...defaultMeta(initialType),
    ...(initialType === 'SOURCE' && prefillUrl && /^https?:\/\//i.test(prefillUrl)
      ? { url: prefillUrl, accessedAt: new Date().toISOString().slice(0, 10) }
      : {}),
  }));
  const [sections, setSections] = useState<Section[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [incoming, setIncoming] = useState<LinkRow[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  // Nháp / xuất bản, như trình soạn bài học (docs: CLAUDE.md › Admin editors: drafts and publishing).
  const [loaded, setLoaded] = useState(isNew);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState('');
  // updatedAt của mục lúc mở trình soạn (kiểm tra xung đột khi xuất bản).
  const [baseUpdatedAt, setBaseUpdatedAt] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ updatedBy: string | null; updatedAt: string } | null>(null);

  const value: FormValue = useMemo(
    () => ({ type, title, slug, summary, isActive, meta, sections, links }),
    [type, title, slug, summary, isActive, meta, sections, links],
  );

  const saveDraft = useCallback(
    async (v: FormValue) => {
      const res = await fetch(`/api/admin/library-entries/${id}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: v.title, blocks: [], meta: v, baseUpdatedAt }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Không thể lưu nháp');
      setHasDraft(true);
      setDraftInfo(null);
    },
    [id, baseUpdatedAt],
  );
  // Mục mới chưa có id để gắn nháp: "Lưu nháp" lần đầu tạo mục ở trạng thái ẩn (xem saveNew).
  const autosave = useDraftAutosave<FormValue>({ value, enabled: loaded && !isNew, save: saveDraft });
  const { resetBaseline } = autosave;
  useUnsavedChangesGuard(autosave.isDirty || publishing);

  const applyForm = useCallback(
    (v: FormValue) => {
      setType(v.type);
      setTitle(v.title);
      setSlug(v.slug);
      setSummary(v.summary);
      setIsActive(v.isActive);
      setMeta(v.meta ?? {});
      setSections(v.sections ?? []);
      setLinks(v.links ?? []);
      resetBaseline(v);
    },
    [resetBaseline],
  );

  /** Mục đang hiển thị (bản chính thức), và các liên kết đi vào để hiện "Được trỏ tới từ". */
  const loadLive = useCallback(async (): Promise<{ form: FormValue; updatedAt: string } | null> => {
    const res = await fetch(`/api/admin/library-entries/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    const e = json.data;
    const seenIn = new Set<string>();
    setIncoming(
      e.linksTo
        .filter((l: { from: EntryRef }) => !seenIn.has(l.from.id) && !!seenIn.add(l.from.id))
        .map((l: { kind: LinkKind; from: EntryRef }) => ({ kind: l.kind, to: l.from })),
    );
    return {
      updatedAt: e.updatedAt,
      form: {
        type: e.type,
        title: e.title,
        slug: e.slug,
        summary: e.summary,
        isActive: e.isActive,
        meta: e.meta ?? {},
        sections: sectionsFromBody(e.body),
        // MENTIONS do server tự dựng từ thân bài: không hiện như liên kết sửa được.
        links: e.linksFrom
          .filter((l: { kind: LinkKind }) => isEditableKind(l.kind))
          .map((l: { kind: LinkKind; to: EntryRef }) => ({ kind: l.kind, to: l.to })),
      },
    };
  }, [id]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const [live, draftRes] = await Promise.all([loadLive(), fetch(`/api/admin/library-entries/${id}/draft`)]);
        const draft = draftRes.ok ? (await draftRes.json()).data : null;
        if (!live) return;
        // Có nháp thì mở nháp, và giữ mốc của lúc nháp bắt đầu: xuất bản vẫn nhận ra thay
        // đổi của người khác xen giữa.
        applyForm(draft?.meta ? (draft.meta as FormValue) : live.form);
        setBaseUpdatedAt(draft?.baseUpdatedAt ?? live.updatedAt);
        setHasDraft(!!draft);
        setDraftInfo(draft ? { updatedBy: draft.updatedBy, updatedAt: draft.updatedAt } : null);
        setLoaded(true);
      } catch {
        setError('Không tải được mục');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew, loadLive, applyForm]);

  function onTitle(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugifyEntry(v));
  }

  function onType(t: EntryType) {
    setType(t);
    setMeta(defaultMeta(t));
    // Liên kết không hợp với loại mới bị bỏ, để không lưu dữ liệu sai quy tắc.
    setLinks((ls) => ls.filter((l) => LINK_RULES[l.kind].from.includes(t)));
  }

  function payload(v: FormValue, overrides: Partial<{ isActive: boolean }> = {}) {
    return {
      slug: v.slug,
      type: v.type,
      title: v.title,
      summary: v.summary,
      isActive: overrides.isActive ?? v.isActive,
      meta: cleanMeta(v.type, v.meta),
      body: bodyFromSections(v.sections),
      links: v.links.map((l, i) => ({ toId: l.to.id, kind: l.kind, order: i })),
    };
  }

  function showError(json: { error?: string; issues?: string[] } | null, fallback: string) {
    setError([json?.error || fallback, ...(json?.issues ?? [])].filter(Boolean).join('\n'));
    requestAnimationFrame(() => errorRef.current?.focus());
  }

  /** Mục mới: tạo mục. "Lưu nháp" tạo ở trạng thái ẩn; "Xuất bản" theo ô "Hiển thị công khai". */
  async function saveNew(asDraft: boolean) {
    if (publishing) return;
    setPublishing(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/library-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(value, asDraft ? { isActive: false } : {})),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        showError(json, asDraft ? 'Chưa tạo được mục (lưu nháp lần đầu cần đủ các ô bắt buộc).' : 'Không tạo được mục');
        return;
      }
      announce(asDraft ? 'Đã tạo mục ở trạng thái ẩn' : 'Đã tạo mục');
      router.replace(`/admin/library-entries/${json.data.id}`);
    } catch {
      setError('Không lưu được. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setPublishing(false);
    }
  }

  async function publish(force = false): Promise<void> {
    if (isNew) return saveNew(false);
    if (publishing) return;
    setPublishing(true);
    setError('');
    setNotice('');
    try {
      // Đợi lần tự lưu đang chạy xong, để nó không tạo lại nháp sau khi xuất bản.
      await autosave.saveNow();
      const snapshot = value;
      const res = await fetch(`/api/admin/library-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload(snapshot), baseUpdatedAt, force }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 409 && json?.conflict && !force) {
        if (window.confirm(`${json.error}\n\nVẫn xuất bản bản của bạn?`)) {
          setPublishing(false);
          return publish(true);
        }
        return;
      }
      if (!res.ok) {
        showError(json, 'Không xuất bản được');
        return;
      }
      setBaseUpdatedAt(json?.data?.updatedAt ?? null);
      setHasDraft(false);
      setDraftInfo(null);
      resetBaseline(snapshot);
      setNotice(
        snapshot.isActive
          ? 'Đã xuất bản. Người học sẽ thấy nội dung mới trong vài phút.'
          : 'Đã xuất bản. Mục đang ẩn (ô "Hiển thị công khai" chưa đánh dấu), nên người học chưa thấy.',
      );
    } catch {
      setError('Không xuất bản được. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setPublishing(false);
    }
  }

  async function discardDraft() {
    if (!window.confirm('Bỏ bản nháp và quay về mục đang hiển thị cho người học?')) return;
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/library-entries/${id}/draft`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Không thể bỏ bản nháp');
        return;
      }
      const live = await loadLive();
      if (live) {
        applyForm(live.form);
        setBaseUpdatedAt(live.updatedAt);
      }
      setHasDraft(false);
      setDraftInfo(null);
    } catch {
      setError('Đã xảy ra lỗi khi bỏ bản nháp');
    }
  }

  async function doDelete() {
    setDeleting(true);
    const res = await fetch(`/api/admin/library-entries/${id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) router.push('/admin/library-entries');
    else setError('Không xoá được mục');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const setM = (k: string, v: unknown) => setMeta((m) => ({ ...m, [k]: v }));
  const str = (k: string) => (typeof meta[k] === 'string' ? (meta[k] as string) : '');
  const num = (k: string) => (typeof meta[k] === 'number' ? String(meta[k]) : '');

  return (
    <>
      {/* Phần tử đầu tiên của trang: thanh tự kéo sát lên dưới thanh đầu admin. */}
      <EditorSaveBar
        backHref="/admin/library-entries"
        title={isNew ? 'Tạo mục thư viện' : 'Mục thư viện'}
        breadcrumb={`${TYPE_LABELS[type]}${title ? ` › ${title}` : ''}`}
        status={isNew ? 'idle' : autosave.status}
        lastSavedAt={autosave.lastSavedAt}
        error={autosave.error}
        hasUnpublishedDraft={!isNew && (hasDraft || autosave.isDirty)}
        draftInfo={draftInfo}
        onSaveDraft={() => (isNew ? void saveNew(true) : void autosave.saveNow())}
        onPublish={() => void publish()}
        publishing={publishing}
        publishDisabled={!loaded}
        saveDraftHint={
          isNew
            ? 'Lưu nháp lần đầu: tạo mục ở trạng thái ẩn (người học chưa thấy). Cần đủ các ô bắt buộc. Sau đó nháp tự lưu khi bạn gõ.'
            : undefined
        }
        publishHint={
          isNew
            ? 'Tạo mục và đưa lên thư viện (nếu ô "Hiển thị công khai" được đánh dấu).'
            : !isActive
              ? 'Đưa nội dung đang soạn lên bản chính thức. Mục đang ẩn (ô "Hiển thị công khai" chưa đánh dấu), nên người học vẫn chưa thấy.'
              : 'Đưa nội dung đang soạn lên cho người học xem; trang cập nhật trong vài phút. Khác với "Lưu nháp": bản nháp chỉ người quản trị thấy.'
        }
        onDiscardDraft={hasDraft ? () => void discardDraft() : undefined}
        extraActions={
          !isNew && isActive ? (
            <a
              href={`/thu-vien/muc/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-purple-700 hover:underline"
            >
              Xem trang công khai <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">(mở thẻ mới)</span>
            </a>
          ) : null
        }
      />
    <div className="max-w-4xl">
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      <p role="status" className="mb-4 text-sm text-green-800 empty:hidden">
        {notice}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void publish();
        }}
        className="space-y-6"
        noValidate
      >
        <RequiredNote />
        <div ref={errorRef} tabIndex={-1} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-purple-600">
          <FormError message={error} />
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="e-type" className={labelClass}>
                Loại mục <RequiredMark />
              </label>
              <select
                id="e-type"
                value={type}
                onChange={(e) => onType(e.target.value as EntryType)}
                disabled={!isNew}
                aria-describedby="e-type-hint"
                className={`${fieldClass} bg-white`}
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <p id="e-type-hint" className="text-xs text-gray-600 mt-1">
                {isNew ? 'Không đổi được sau khi tạo.' : 'Loại không đổi được sau khi tạo.'}
              </p>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-5 h-5" />
                Hiển thị công khai
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="e-title" className={labelClass}>
              {type === 'ACRONYM' ? 'Chữ viết tắt' : 'Tiêu đề'} <RequiredMark />
            </label>
            <input id="e-title" required value={title} onChange={(e) => onTitle(e.target.value)} className={fieldClass} />
          </div>

          <div>
            <label htmlFor="e-slug" className={labelClass}>
              Slug <RequiredMark />
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-mono text-sm" aria-hidden="true">
                /tv/
              </span>
              <input
                id="e-slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                aria-describedby="e-slug-hint"
                className={`${fieldClass} font-mono`}
              />
            </div>
            <p id="e-slug-hint" className="text-xs text-gray-600 mt-1">
              Chữ thường không dấu, số, gạch ngang. Đổi slug sẽ làm hỏng link đã có trong bài học.
            </p>
          </div>

          <div>
            <label htmlFor="e-summary" className={labelClass}>
              Xem nhanh <RequiredMark />
            </label>
            <textarea
              id="e-summary"
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              aria-describedby="e-summary-count"
              aria-invalid={summary.length > SUMMARY_MAX}
              className={fieldClass}
            />
            <p id="e-summary-count" className={`text-xs mt-1 ${summary.length > SUMMARY_MAX ? 'text-red-700' : 'text-gray-600'}`}>
              {summary.length}/{SUMMARY_MAX} ký tự · tối đa hai câu, viết riêng (không cắt từ thân bài)
            </p>
          </div>
        </section>

        <MetaFields type={type} meta={meta} setM={setM} str={str} num={num} />
        {type === 'SOURCE' && <DuplicateWarning meta={meta} selfId={isNew ? undefined : id} />}

        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Liên kết</h2>
          {type === 'SOURCE' && (
            <p className="text-sm text-gray-700">
              Nguồn không trỏ đi đâu. Mục nào dùng nguồn này thì thêm nguồn ở mục đó (phần “Nguồn”); các mục ấy hiện bên dưới.
            </p>
          )}
          {LINK_GROUPS[type].map((g) => (
            <LinkGroup
              key={g.kind}
              kind={g.kind}
              legend={g.legend}
              hint={g.hint}
              selfId={isNew ? undefined : id}
              rows={links.filter((l) => l.kind === g.kind)}
              onAdd={(to) => {
                setLinks((ls) => (ls.some((l) => l.kind === g.kind && l.to.id === to.id) ? ls : [...ls, { kind: g.kind, to }]));
                announce(`Đã thêm ${to.title}`);
              }}
              onRemove={(toId) => {
                setLinks((ls) => ls.filter((l) => !(l.kind === g.kind && l.to.id === toId)));
                announce('Đã bỏ liên kết');
              }}
            />
          ))}
          {incoming.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Được trỏ tới từ (gồm cả link trong thân bài)</h3>
              <ul className="flex flex-wrap gap-2">
                {incoming.map((l) => (
                  <li key={`${l.kind}-${l.to.id}`}>
                    <Link
                      href={`/admin/library-entries/${l.to.id}`}
                      className="inline-flex px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      {TYPE_LABELS[l.to.type]}: {l.to.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Nội dung (bảng bên)</h2>
            <button
              type="button"
              onClick={() => setSections((s) => [...s, { heading: '', text: '' }])}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-50 rounded-lg"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Thêm phần
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Các đoạn cách nhau bằng một dòng trống. Dùng được **đậm**, *nghiêng* và link [chữ](/tv/slug-khac) tới mục khác.
          </p>
          {sections.length === 0 && <p className="text-sm text-gray-600">Chưa có phần nào. Mục chỉ có phần xem nhanh.</p>}
          {sections.map((s, i) => (
            <fieldset key={i} className="border border-gray-200 rounded-xl p-4 space-y-2">
              <legend className="text-sm font-medium text-gray-700 px-1">Phần {i + 1}</legend>
              <label htmlFor={`sec-h-${i}`} className={labelClass}>
                Tiêu đề phần (không bắt buộc)
              </label>
              <input
                id={`sec-h-${i}`}
                value={s.heading}
                onChange={(e) => setSections((ss) => ss.map((x, j) => (j === i ? { ...x, heading: e.target.value } : x)))}
                className={fieldClass}
              />
              <label htmlFor={`sec-t-${i}`} className={labelClass}>
                Nội dung
              </label>
              <textarea
                id={`sec-t-${i}`}
                rows={6}
                value={s.text}
                onChange={(e) => setSections((ss) => ss.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => setSections((ss) => ss.filter((_, j) => j !== i))}
                className="inline-flex items-center gap-1 text-sm text-red-700 hover:underline"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" /> Xoá phần {i + 1}
              </button>
            </fieldset>
          ))}
        </section>

        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto inline-flex items-center gap-1 px-4 py-2.5 text-red-700 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Xoá mục
            </button>
          )}
        </div>
      </form>

      {confirmDelete && (
        <ConfirmDialog onConfirm={doDelete} onCancel={() => setConfirmDelete(false)} busy={deleting}>
          Xoá “{title}”? Link <code>/tv/{slug}</code> trong các bài học sẽ không còn mở được.
        </ConfirmDialog>
      )}
    </div>
    </>
  );
}

function defaultMeta(t: EntryType): Meta {
  switch (t) {
    case 'SOURCE':
      return { sourceType: 'bao-chi', authors: [], language: 'vi' };
    case 'ACRONYM':
      return { expansion: '' };
    case 'TOOL':
      return { owner: '', reviewBy: '', tiers: [] };
    default:
      return {};
  }
}

/** Bỏ chuỗi rỗng để zod không báo lỗi định dạng cho trường người dùng để trống. */
function cleanMeta(t: EntryType, m: Meta): Meta {
  const out: Meta = {};
  for (const [k, v] of Object.entries(m)) {
    if (v === '' || v === undefined || v === null) continue;
    out[k] = v;
  }
  if (t === 'SOURCE') out.authors = Array.isArray(m.authors) ? m.authors : [];
  return out;
}

function MetaFields({
  type,
  meta,
  setM,
  str,
  num,
}: {
  type: EntryType;
  meta: Meta;
  setM: (k: string, v: unknown) => void;
  str: (k: string) => string;
  num: (k: string) => string;
}) {
  const text = (k: string, label: string, opts: { required?: boolean; hint?: string; type?: string; mono?: boolean } = {}) => (
    <div>
      <label htmlFor={`m-${k}`} className={labelClass}>
        {label} {opts.required && <RequiredMark />}
      </label>
      <input
        id={`m-${k}`}
        type={opts.type ?? 'text'}
        required={opts.required}
        value={opts.type === 'number' ? num(k) : str(k)}
        onChange={(e) => setM(k, opts.type === 'number' ? numOrUndef(e.target.value) : e.target.value)}
        aria-describedby={opts.hint ? `m-${k}-hint` : undefined}
        className={`${fieldClass} ${opts.mono ? 'font-mono' : ''}`}
      />
      {opts.hint && (
        <p id={`m-${k}-hint`} className="text-xs text-gray-600 mt-1">
          {opts.hint}
        </p>
      )}
    </div>
  );

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Thông tin {TYPE_LABELS[type].toLowerCase()}</h2>

      {type === 'CONCEPT' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {text('titleEn', 'Tên tiếng Anh / tên gốc', { hint: 'Hiện cạnh tiêu đề trong xem nhanh.' })}
          {text('pronunciation', 'Cách đọc')}
        </div>
      )}

      {type === 'ACRONYM' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {text('expansion', 'Dạng đầy đủ', { required: true })}
          {text('expansionVi', 'Dạng đầy đủ tiếng Việt')}
        </div>
      )}

      {type === 'SOURCE' && (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="m-sourceType" className={labelClass}>
                Loại nguồn <RequiredMark />
              </label>
              <select
                id="m-sourceType"
                value={str('sourceType')}
                onChange={(e) => setM('sourceType', e.target.value)}
                className={`${fieldClass} bg-white`}
              >
                {SOURCE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_TYPE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="m-language" className={labelClass}>
                Ngôn ngữ
              </label>
              <select id="m-language" value={str('language') || 'vi'} onChange={(e) => setM('language', e.target.value)} className={`${fieldClass} bg-white`}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">Tiếng Anh</option>
                <option value="fr">Tiếng Pháp</option>
                <option value="zh">Tiếng Trung</option>
                <option value="de">Tiếng Đức</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="m-authors" className={labelClass}>
              Tác giả
            </label>
            <input
              id="m-authors"
              value={Array.isArray(meta.authors) ? (meta.authors as string[]).join('; ') : ''}
              onChange={(e) =>
                setM(
                  'authors',
                  e.target.value
                    .split(';')
                    .map((a) => a.trim())
                    .filter(Boolean),
                )
              }
              aria-describedby="m-authors-hint"
              className={fieldClass}
            />
            <p id="m-authors-hint" className="text-xs text-gray-600 mt-1">
              Cách nhau bằng dấu chấm phẩy. Ba tác giả trở lên hiện là “X và cộng sự” ở bản ngắn.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {text('year', 'Năm', { type: 'number' })}
            {text('date', 'Ngày đăng', { type: 'date' })}
            {text('durationMin', 'Thời lượng (phút)', { type: 'number' })}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {text('containerTitle', 'Tạp chí / tờ báo / chương trình')}
            {text('publisher', 'Nhà xuất bản / đơn vị')}
          </div>
          {text('url', 'Link', { type: 'url', hint: 'Bắt buộc, trừ sách hoặc văn bản pháp luật đã có số hiệu.' })}
          <div className="grid sm:grid-cols-2 gap-4">
            {text('archivedUrl', 'Bản lưu trữ', { type: 'url' })}
            {text('accessedAt', 'Ngày truy cập', { type: 'date' })}
          </div>
          {text('identifier', 'DOI / ISBN / số hiệu văn bản', { mono: true })}
        </>
      )}

      {type === 'TOOL' && <ToolFields meta={meta} setM={setM} text={text} />}
    </section>
  );
}

type Tier = { level: string; what: string; minutes?: number; limits?: string; picks: { name: string; url: string }[] };

function ToolFields({
  meta,
  setM,
  text,
}: {
  meta: Meta;
  setM: (k: string, v: unknown) => void;
  text: (k: string, label: string, opts?: { required?: boolean; hint?: string; type?: string }) => React.ReactNode;
}) {
  const tiers = (Array.isArray(meta.tiers) ? meta.tiers : []) as Tier[];
  const setTiers = (t: Tier[]) => setM('tiers', t);
  const free = TOOL_TIERS.filter((lv) => !tiers.some((t) => t.level === lv));
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {text('owner', 'Người phụ trách', { required: true })}
        {text('reviewBy', 'Rà soát lại trước ngày', { required: true, type: 'date', hint: 'Quá ngày này, mục hiện cảnh báo cho người học.' })}
      </div>
      {tiers.map((t, i) => (
        <fieldset key={t.level} className="border border-gray-200 rounded-xl p-4 space-y-2">
          <legend className="text-sm font-medium text-gray-700 px-1">Mức {TOOL_TIER_LABELS[t.level as keyof typeof TOOL_TIER_LABELS]}</legend>
          <label htmlFor={`tier-what-${i}`} className={labelClass}>
            Làm gì <RequiredMark />
          </label>
          <textarea
            id={`tier-what-${i}`}
            rows={3}
            value={t.what}
            onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, what: e.target.value } : x)))}
            className={fieldClass}
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor={`tier-min-${i}`} className={labelClass}>
                Mất khoảng (phút)
              </label>
              <input
                id={`tier-min-${i}`}
                type="number"
                value={t.minutes ?? ''}
                onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, minutes: numOrUndef(e.target.value) } : x)))}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`tier-lim-${i}`} className={labelClass}>
                Không bảo vệ được gì
              </label>
              <input
                id={`tier-lim-${i}`}
                value={t.limits ?? ''}
                onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, limits: strOrUndef(e.target.value) } : x)))}
                className={fieldClass}
              />
            </div>
          </div>
          <label htmlFor={`tier-picks-${i}`} className={labelClass}>
            Công cụ đề xuất
          </label>
          <textarea
            id={`tier-picks-${i}`}
            rows={2}
            value={t.picks.map((p) => `${p.name} | ${p.url}`).join('\n')}
            onChange={(e) =>
              setTiers(
                tiers.map((x, j) =>
                  j === i
                    ? {
                        ...x,
                        picks: e.target.value
                          .split('\n')
                          .map((line) => line.split('|').map((s) => s.trim()))
                          .filter(([n, u]) => n && u)
                          .map(([name, url]) => ({ name, url })),
                      }
                    : x,
                ),
              )
            }
            aria-describedby={`tier-picks-${i}-hint`}
            className={`${fieldClass} font-mono text-sm`}
          />
          <p id={`tier-picks-${i}-hint`} className="text-xs text-gray-600">
            Mỗi dòng: <code>Tên | https://link</code>
          </p>
          <button
            type="button"
            onClick={() => setTiers(tiers.filter((_, j) => j !== i))}
            className="inline-flex items-center gap-1 text-sm text-red-700 hover:underline"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" /> Bỏ mức này
          </button>
        </fieldset>
      ))}
      {free.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {free.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setTiers([...tiers, { level: lv, what: '', picks: [] }].sort((a, b) => TOOL_TIERS.indexOf(a.level as never) - TOOL_TIERS.indexOf(b.level as never)))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-700 border border-purple-200 hover:bg-purple-50 rounded-lg"
            >
              <Plus className="w-4 h-4" aria-hidden="true" /> Thêm mức {TOOL_TIER_LABELS[lv]}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/** Một nhóm liên kết: các mục đã chọn + ô tìm để thêm (chỉ hiện loại đích hợp lệ). */
function LinkGroup({
  kind,
  legend,
  hint,
  rows,
  selfId,
  onAdd,
  onRemove,
}: {
  kind: LinkKind;
  legend: string;
  hint: string;
  rows: LinkRow[];
  selfId?: string;
  onAdd: (to: EntryRef) => void;
  onRemove: (toId: string) => void;
}) {
  const hintId = useId();
  const inputId = useId();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<EntryRef[]>([]);
  const allowed = LINK_RULES[kind].to;
  const inputRef = useRef<HTMLInputElement>(null);
  // Chuỗi id ổn định: `rows` là mảng mới mỗi lần render, dùng thẳng làm dependency sẽ gọi API liên tục.
  const chosen = rows.map((r) => r.to.id).join(',');

  useEffect(() => {
    if (q.trim().length < 1) return;
    const t = setTimeout(async () => {
      const lists = await Promise.all(
        allowed.map((ty) =>
          fetch(`/api/admin/library-entries?type=${ty}&take=10&q=${encodeURIComponent(q.trim())}`)
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((j) => j.data as EntryRef[]),
        ),
      );
      const taken = new Set(chosen.split(','));
      setResults(lists.flat().filter((e) => e.id !== selfId && !taken.has(e.id)));
    }, 250);
    return () => clearTimeout(t);
  }, [q, allowed, selfId, chosen]);

  return (
    <fieldset className="pt-4 border-t border-gray-100 first:border-t-0 first:pt-0">
      <legend className="text-sm font-medium text-gray-800 mb-1">{legend}</legend>
      {hint && (
        <p id={hintId} className="text-xs text-gray-600 mb-2">
          {hint}
        </p>
      )}
      <ul className="flex flex-wrap gap-2 mb-2">
        {rows.map((r) => (
          <li key={r.to.id} className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-purple-50 text-purple-900 text-sm">
            {TYPE_LABELS[r.to.type]}: {r.to.title}
            <button
              type="button"
              onClick={() => {
                onRemove(r.to.id);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-purple-100"
              aria-label={`Bỏ ${r.to.title}`}
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          Tìm {allowed.map((t) => TYPE_LABELS[t].toLowerCase()).join(' hoặc ')} để thêm vào “{legend}”
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Tìm ${allowed.map((t) => TYPE_LABELS[t].toLowerCase()).join('/')}…`}
          aria-describedby={hint ? hintId : undefined}
          className={`${fieldClass} pl-9`}
        />
      </div>
      {q.trim() !== '' && results.length > 0 && (
        <ul className="mt-2 border border-gray-200 rounded-lg divide-y divide-gray-100" aria-label="Kết quả tìm">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  onAdd(r);
                  setQ('');
                  inputRef.current?.focus();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                <span className="text-gray-600">{TYPE_LABELS[r.type]}:</span> {r.title}{' '}
                <span className="text-gray-600 font-mono text-xs">/tv/{r.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}

/** Cảnh báo sớm khi link/số hiệu của Nguồn đã có mục khác (lưu vẫn bị chặn ở server). */
function DuplicateWarning({ meta, selfId }: { meta: Meta; selfId?: string }) {
  const url = typeof meta.url === 'string' ? meta.url : '';
  const identifier = typeof meta.identifier === 'string' ? meta.identifier : '';
  const dup = useSourceDuplicate(url, identifier, selfId);
  if (!dup) return null;
  return (
    <div role="alert" className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900">
      Nguồn này đã có trong thư viện:{' '}
      <Link href={`/admin/library-entries/${dup.id}`} className="font-semibold underline">
        “{dup.title}”
      </Link>
      . Mỗi tài liệu chỉ nên có một mục Nguồn; hãy sửa mục đó thay vì tạo mục mới.
    </div>
  );
}
