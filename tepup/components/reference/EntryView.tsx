'use client';

import { AlertTriangle, ExternalLink, Archive, BookOpen, GraduationCap, Share2 } from 'lucide-react';
import type { EntryFull, EntryRef } from '@/lib/library/entry-service';
import { renderInlineMarkdown } from '@/lib/utils/renderInlineMarkdown';
import { TOOL_TIER_LABELS, type ToolMeta } from '@/lib/library/schemas';
import { tvHref } from '@/lib/library/refs';
import Citation from './Citation';
import EntryActions from './EntryActions';

/**
 * Nội dung đầy đủ của một mục thư viện — dùng chung cho bảng bên (ReferencePanels)
 * và trang /thu-vien/muc/<slug>. Link tới mục khác là `<a data-tv>`, nên
 * ReferenceProvider mở chúng thành bảng chồng lên (docs/design-reference-library.md §6.3).
 */
export default function EntryView({
  entry,
  headingTag = 'h3',
  idPrefix,
}: {
  entry: EntryFull;
  /** Thẻ tiêu đề các phần: h3 trong bảng bên (tiêu đề bảng là h2), h2 trên trang riêng (tiêu đề là h1). */
  headingTag?: 'h2' | 'h3';
  idPrefix: string;
}) {
  const H = headingTag;
  const tool = entry.type === 'TOOL' ? (entry.meta as unknown as ToolMeta) : null;

  return (
    <div className="space-y-6 text-gray-800">
      <EntryActions id={entry.id} slug={entry.slug} title={entry.title} />
      {entry.type === 'TOOL' && entry.overdue && (
        <p className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Mục này đã quá hạn rà soát. Công cụ thay đổi nhanh; nếu có chỗ khác với bài học, hãy tin bài học hơn tin tủ.</span>
        </p>
      )}

      {entry.type === 'SOURCE' && entry.fullCitation && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
          <p className="leading-relaxed">
            <Citation citation={entry.fullCitation} />
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            {entry.fullCitation.url && (
              <a
                href={entry.fullCitation.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 font-medium text-purple-700 hover:underline"
              >
                Mở nguồn <ExternalLink className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">(mở thẻ mới)</span>
              </a>
            )}
            {entry.fullCitation.archivedUrl && (
              <a
                href={entry.fullCitation.archivedUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 text-gray-700 hover:underline"
              >
                <Archive className="w-4 h-4" aria-hidden="true" /> Bản lưu trữ
                <span className="sr-only">(mở thẻ mới)</span>
              </a>
            )}
          </div>
        </div>
      )}

      <p className="text-lg leading-relaxed">{renderInlineMarkdown(entry.summary)}</p>

      {entry.body?.sections.map((s, i) => (
        <section key={i} id={`${idPrefix}-s${i}`} className="space-y-3 scroll-mt-20">
          {s.heading && <H className="text-lg font-semibold text-gray-900">{s.heading}</H>}
          {s.paragraphs.map((p, j) => (
            <p key={j} className="leading-relaxed">
              {renderInlineMarkdown(p)}
            </p>
          ))}
        </section>
      ))}

      {tool && tool.tiers.length > 0 && (
        <section className="space-y-3">
          <H className="text-lg font-semibold text-gray-900">Làm theo mức</H>
          <ol className="space-y-3">
            {tool.tiers.map((t) => (
              <li key={t.level} className="p-4 rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-900">
                  {TOOL_TIER_LABELS[t.level]}
                  {t.minutes ? <span className="font-normal text-gray-600"> · khoảng {t.minutes} phút</span> : null}
                </p>
                <p className="mt-1 leading-relaxed">{renderInlineMarkdown(t.what)}</p>
                {t.limits && (
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Không bảo vệ được:</span> {t.limits}
                  </p>
                )}
                {t.picks.length > 0 && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Gợi ý:</span>{' '}
                    {t.picks.map((p, k) => (
                      <span key={p.url}>
                        {k > 0 && ', '}
                        <a href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="text-purple-700 hover:underline">
                          {p.name}
                          <span className="sr-only"> (mở thẻ mới)</span>
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ol>
          <p className="text-sm text-gray-600">
            Cập nhật {entry.updatedAt}
            {tool.owner ? ` · phụ trách: ${tool.owner}` : ''}
          </p>
        </section>
      )}

      <RefList title="Trỏ tới" items={entry.expandsTo} H={H} />
      <RefList title="Được trích trong" items={entry.citedBy} H={H} />

      {entry.sources.length > 0 && (
        <section className="space-y-2">
          <H className="text-base font-semibold text-gray-900">Nguồn</H>
          <ul className="space-y-2">
            {entry.sources.map((s) => (
              <li key={s.slug} className="flex gap-2">
                <BookOpen className="w-4 h-4 mt-1 shrink-0 text-gray-500" aria-hidden="true" />
                <a href={tvHref(s.slug)} data-tv={s.slug}>
                  {s.citation ? <Citation citation={s.citation} /> : s.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RefList title="Liên quan" items={entry.related} H={H} />
      <RefList title="Được nhắc đến trong" items={entry.mentionedIn} H={H} />
      <RefList title="Viết tắt" items={entry.acronyms} H={H} />
      <RefList title="Cùng tên" items={entry.otherMeanings} H={H} />
      {(entry.related.length > 0 || entry.mentionedIn.length > 0 || entry.sources.length > 0 || entry.citedBy.length > 0) && (
        <p className="text-sm">
          <a href={`/thu-vien/ban-do?muc=${entry.slug}`} className="inline-flex items-center gap-1 text-purple-700 hover:underline">
            <Share2 className="w-4 h-4" aria-hidden="true" /> Xem trên bản đồ thư viện
          </a>
        </p>
      )}

      {entry.usages.length > 0 && (
        <section className="space-y-2 pt-4 border-t border-gray-200">
          <H className="text-base font-semibold text-gray-900">Xuất hiện trong</H>
          <ul className="space-y-1.5">
            {entry.usages.map((u) => (
              <li key={u.href} className="flex gap-2 text-sm">
                <GraduationCap className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
                <span>
                  <a href={u.href} className="text-purple-700 hover:underline">
                    {u.title}
                  </a>
                  <span className="text-gray-600"> · {u.parent}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function RefLink({ entry }: { entry: EntryRef }) {
  return (
    <a href={tvHref(entry.slug)} data-tv={entry.slug}>
      {entry.title}
    </a>
  );
}

function RefList({ title, items, H }: { title: string; items: EntryRef[]; H: 'h2' | 'h3' }) {
  if (!items.length) return null;
  return (
    <section className="space-y-2">
      <H className="text-base font-semibold text-gray-900">{title}</H>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((e) => (
          <li key={e.slug}>
            <RefLink entry={e} />
          </li>
        ))}
      </ul>
    </section>
  );
}
