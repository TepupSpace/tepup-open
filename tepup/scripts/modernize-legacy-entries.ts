/**
 * Đưa các mục chuyển từ "Bài đọc" cũ (LibraryEntry cùng id với một LibraryDocument) sang dạng
 * mới (docs/design-reference-library.md §9.2). Dạng cũ viết liên kết và nguồn thành chữ trong
 * thân bài; dạng mới có trường riêng:
 *
 * - "Khái niệm liên quan" (mục từ): khái niệm trùng một mục từ có sẵn → liên kết Liên quan
 *   (RELATED); khái niệm chưa có mục → đề xuất "Mục từ mới" trong hàng đợi góp ý.
 * - "Đọc thêm" (mục từ): tên tài liệu không có link/số hiệu, không thành mục Nguồn đúng chuẩn
 *   được mà không bịa → đề xuất "Nguồn mới" trong hàng đợi góp ý.
 * - "Nguồn" trong mục từ: nguồn ghi trong scripts/library-reclassification.json › citedSources
 *   (chép đúng chữ và link cũ) → mục Nguồn, mục từ trích nó (CITES). Không có trong bảng thì giữ.
 * - "Nguồn", "Tác giả & xuất bản" trong mục Nguồn: đã có trong trường trích dẫn (tác giả, năm,
 *   tạp chí, link) → bỏ; link khác với link chính được liệt kê ra.
 *
 * Phần bị bỏ khỏi thân bài nằm trong bản lưu (../_backups) và trong hàng đợi góp ý, không mất gì.
 * Chạy thử mặc định. Chạy lại an toàn: phần đã chuyển không còn để chuyển.
 *
 *   npx tsx scripts/modernize-legacy-entries.ts --env=<file env>            (chạy thử)
 *   npx tsx scripts/modernize-legacy-entries.ts --env=<file env> --apply
 */
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const envArg = process.argv.find((a) => a.startsWith('--env='))?.slice('--env='.length);
if (!envArg || !existsSync(path.resolve(envArg))) {
  console.error('Thiếu hoặc sai --env=<file env>');
  process.exit(1);
}
config({ path: path.resolve(envArg), quiet: true, override: true });
const dbUrl = process.env.DATABASE_URL ?? '';
const ref =
  dbUrl.match(/\/\/[a-z_]+\.([a-z0-9]{20}):/)?.[1] ??
  (/(127\.0\.0\.1|localhost|@db:)/.test(dbUrl) ? 'LOCAL' : '(không nhận ra)');
console.log(`File env    : ${envArg}`);
console.log(`Project ref : ${ref}`);
console.log(APPLY ? 'GHI THẬT' : 'Chạy thử (thêm --apply để ghi)');

type Section = { heading?: string; paragraphs: string[] };
type Cited = { slug: string; title: string; summary: string; meta: Record<string, unknown> };

const RELATED_H = 'Khái niệm liên quan';
const READING_H = 'Đọc thêm';
const SOURCE_H = 'Nguồn';
const AUTHOR_H = 'Tác giả & xuất bản';
const norm = (s: string) => s.normalize('NFC').toLocaleLowerCase('vi').replace(/\s+/g, ' ').trim();

async function main() {
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { parseMeta } = await import('../lib/library/schemas');
  const { sourceKeyOf } = await import('../lib/library/source-key');
  const { baseTitle } = await import('../lib/library/refs');
  const { slugifyEntry } = await import('../lib/library/slugify');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: dbUrl }) });

  const mapping = JSON.parse(readFileSync(path.resolve('scripts/library-reclassification.json'), 'utf8')) as {
    citedSources?: Record<string, Cited[]>;
  };
  const docIds = new Set((await prisma.libraryDocument.findMany({ select: { id: true } })).map((d) => d.id));
  const entries = await prisma.libraryEntry.findMany({
    select: { id: true, slug: true, type: true, title: true, body: true, meta: true, isActive: true, sourceKey: true },
  });
  const legacy = entries.filter((e) => docIds.has(e.id));

  // Tìm mục từ theo tên: tiêu đề, tiêu đề bỏ ngoặc, chữ viết tắt trong ngoặc ("Thuế TNCN"
  // ↔ "Thuế Thu nhập Cá nhân (TNCN)"), slug, rồi đầu tiêu đề nếu chỉ khớp đúng một mục.
  const concepts = entries.filter((e) => e.type === 'CONCEPT' && e.isActive);
  const keys = new Map<string, Set<string>>();
  const addKey = (k: string, id: string) => keys.set(norm(k), (keys.get(norm(k)) ?? new Set()).add(id));
  for (const c of concepts) {
    addKey(c.title, c.id);
    addKey(baseTitle(c.title), c.id);
    const abbr = /\(([^)]{2,15})\)\s*$/.exec(c.title)?.[1];
    if (abbr) {
      addKey(abbr, c.id);
      addKey(`${c.title.split(/\s+/)[0]} ${abbr}`, c.id);
    }
  }
  const bySlug = new Map(concepts.map((c) => [c.slug, c.id]));
  const findConcept = (name: string, selfId: string): string | null => {
    const exact = [...(keys.get(norm(name)) ?? [])].filter((id) => id !== selfId);
    if (exact.length === 1) return exact[0];
    // "Gross vs Net" ↔ /tv/gross-vs-net, "Thuế GTGT" ↔ /tv/thue-gtgt.
    const slugHit = bySlug.get(slugifyEntry(name));
    if (slugHit && slugHit !== selfId) return slugHit;
    const n = norm(name);
    const prefix = concepts.filter((c) => c.id !== selfId && (norm(c.title) + ' ').startsWith(n + ' '));
    return prefix.length === 1 ? prefix[0].id : null;
  };
  const titleOf = new Map(entries.map((e) => [e.id, e.title]));

  const existingSuggestions = await prisma.suggestion.findMany({
    where: { targetType: 'NEW_ENTRY', targetId: 'thu-vien' },
    select: { quote: true, suggestedType: true },
  });
  const suggested = new Set(existingSuggestions.map((s) => `${s.suggestedType}|${s.quote}`));

  type Plan = {
    id: string;
    slug: string;
    sections: Section[];
    related: string[];
    cite: Cited[];
    suggestions: { type: 'CONCEPT' | 'SOURCE'; quote: string; proposal: string }[];
    notes: string[];
    removed: string[];
  };
  const plans: Plan[] = [];
  const problems: string[] = [];

  for (const e of legacy) {
    const body = (e.body ?? { sections: [] }) as { sections: Section[] };
    const keep: Section[] = [];
    const plan: Plan = { id: e.id, slug: e.slug, sections: [], related: [], cite: [], suggestions: [], notes: [], removed: [] };
    for (const s of body.sections ?? []) {
      const h = s.heading ?? '';
      if (e.type === 'CONCEPT' && h === RELATED_H) {
        for (const name of s.paragraphs) {
          const to = findConcept(name, e.id);
          if (to) plan.related.push(to);
          else
            plan.suggestions.push({
              type: 'CONCEPT',
              quote: name,
              proposal: `Khái niệm “${name}” được nhắc trong mục “${e.title}” (/tv/${e.slug}) nhưng chưa có mục từ. (Chuyển từ phần “Khái niệm liên quan” của bài đọc cũ.)`,
            });
        }
        plan.removed.push(h);
      } else if (e.type === 'CONCEPT' && h === READING_H) {
        for (const item of s.paragraphs)
          plan.suggestions.push({
            type: 'SOURCE',
            quote: item,
            proposal: `Tài liệu đọc thêm cho mục “${e.title}” (/tv/${e.slug}). Cần link hoặc số hiệu để thành mục Nguồn. (Chuyển từ phần “Đọc thêm” của bài đọc cũ.)`,
          });
        plan.removed.push(h);
      } else if (e.type === 'CONCEPT' && h === SOURCE_H) {
        const cited = mapping.citedSources?.[e.slug];
        if (cited?.length) {
          plan.cite.push(...cited);
          plan.removed.push(h);
        } else {
          keep.push(s);
          plan.notes.push(`giữ phần “Nguồn” (chưa có trong citedSources): ${s.paragraphs.join(' / ').slice(0, 120)}`);
        }
      } else if (e.type === 'SOURCE' && (h === SOURCE_H || h === AUTHOR_H)) {
        const main = (e.meta as { url?: string }).url;
        const mainKey = main ? sourceKeyOf({ url: main }) : null;
        for (const p of s.paragraphs) {
          const url = /(https?:\/\/\S+)/.exec(p)?.[1];
          if (url && sourceKeyOf({ url }) !== mainKey) plan.notes.push(`bỏ link phụ: ${p}`);
        }
        plan.removed.push(h);
      } else keep.push(s);
    }
    if (!plan.removed.length) continue;
    plan.sections = keep;
    plans.push(plan);
  }

  // Nguồn mới từ citedSources: kiểm tra như khi lưu, và không trùng nguồn có sẵn.
  const newSources = new Map<string, Cited & { key: string | null; existingId?: string }>();
  for (const c of plans.flatMap((p) => p.cite)) {
    if (newSources.has(c.slug)) continue;
    const parsed = parseMeta('SOURCE', c.meta);
    if (!parsed.ok) {
      problems.push(`${c.slug}: ${parsed.errors.join('; ')}`);
      continue;
    }
    const key = sourceKeyOf(parsed.meta as { url?: string; identifier?: string });
    const same = entries.find((x) => (key && x.sourceKey === key) || x.slug === c.slug);
    newSources.set(c.slug, { ...c, meta: parsed.meta, key, existingId: same?.id });
  }

  // ---------- Báo cáo ----------
  for (const p of plans) {
    console.log(`\n/tv/${p.slug}: bỏ ${p.removed.map((r) => `“${r}”`).join(', ')}`);
    if (p.related.length) console.log(`  Liên quan → ${p.related.map((id) => titleOf.get(id)).join('; ')}`);
    for (const c of p.cite) console.log(`  Nguồn → ${c.title}${newSources.get(c.slug)?.existingId ? ' (dùng mục có sẵn)' : ' (mục mới)'}`);
    const sc = p.suggestions.filter((s) => s.type === 'CONCEPT').map((s) => s.quote);
    const ss = p.suggestions.filter((s) => s.type === 'SOURCE').map((s) => s.quote);
    if (sc.length) console.log(`  Đề xuất mục từ mới: ${sc.join('; ')}`);
    if (ss.length) console.log(`  Đề xuất nguồn mới: ${ss.join('; ')}`);
    for (const n of p.notes) console.log(`  · ${n}`);
  }
  // Một đề xuất cho mỗi tên (cùng loại), liệt kê mọi mục nhắc tới nó.
  const grouped = new Map<string, { type: 'CONCEPT' | 'SOURCE'; quote: string; where: string[] }>();
  for (const p of plans)
    for (const sg of p.suggestions) {
      const k = `${sg.type}|${norm(sg.quote)}`;
      const g = grouped.get(k) ?? { type: sg.type, quote: sg.quote, where: [] };
      g.where.push(`“${titleOf.get(p.id)}” (/tv/${p.slug})`);
      grouped.set(k, g);
    }
  const allSug = [...grouped.values()]
    .filter((g) => !suggested.has(`${g.type}|${g.quote}`))
    .map((g) => ({
      type: g.type,
      quote: g.quote,
      proposal:
        g.type === 'CONCEPT'
          ? `Khái niệm “${g.quote}” được nhắc trong ${g.where.join(', ')} nhưng chưa có mục từ. (Chuyển từ phần “Khái niệm liên quan” của bài đọc cũ.)`
          : `Tài liệu đọc thêm cho ${g.where.join(', ')}. Cần link hoặc số hiệu để thành mục Nguồn. (Chuyển từ phần “Đọc thêm” của bài đọc cũ.)`,
    }));
  console.log(
    `\n${plans.length} mục đổi dạng; ${plans.reduce((n, p) => n + p.related.length, 0)} liên kết Liên quan; ` +
      `${[...newSources.values()].filter((s) => !s.existingId).length} mục Nguồn mới; ${allSug.length} đề xuất vào hàng đợi góp ý.`,
  );

  if (problems.length) {
    console.error(`\nDỪNG — ${problems.length} vấn đề:\n  - ${problems.join('\n  - ')}`);
    await prisma.$disconnect();
    process.exit(1);
  }
  if (!APPLY || !plans.length) {
    console.log(APPLY ? '\nKhông có gì để đổi.' : '\nChạy thử xong. Thêm --apply để ghi.');
    await prisma.$disconnect();
    return;
  }

  const dir = path.resolve('../_backups');
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `legacy-entries-before-modernize-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  writeFileSync(file, JSON.stringify(legacy.filter((e) => plans.some((p) => p.id === e.id)), null, 1));
  console.log(`\nBản lưu    : ${file}`);

  await prisma.$transaction(
    async (tx) => {
      const sourceId = new Map<string, string>();
      for (const s of newSources.values()) {
        if (s.existingId) {
          sourceId.set(s.slug, s.existingId);
          continue;
        }
        const row = await tx.libraryEntry.create({
          data: { slug: s.slug, type: 'SOURCE', title: s.title, summary: s.summary, meta: s.meta as object, sourceKey: s.key },
        });
        sourceId.set(s.slug, row.id);
      }
      for (const p of plans) {
        await tx.libraryEntry.update({ where: { id: p.id }, data: { body: { sections: p.sections } } });
        for (const to of p.related) {
          const has = await tx.libraryLink.findFirst({
            where: { kind: 'RELATED', OR: [{ fromId: p.id, toId: to }, { fromId: to, toId: p.id }] },
          });
          if (!has) await tx.libraryLink.create({ data: { fromId: p.id, toId: to, kind: 'RELATED' } });
        }
        for (const c of p.cite)
          await tx.libraryLink.upsert({
            where: { fromId_toId_kind: { fromId: p.id, toId: sourceId.get(c.slug)!, kind: 'CITES' } },
            create: { fromId: p.id, toId: sourceId.get(c.slug)!, kind: 'CITES' },
            update: {},
          });
      }
      for (const s of allSug)
        await tx.suggestion.create({
          data: { targetType: 'NEW_ENTRY', targetId: 'thu-vien', quote: s.quote, proposal: s.proposal, suggestedType: s.type },
        });
    },
    { timeout: 120_000 },
  );
  console.log(`Đã ghi. Mục đổi dạng: ${plans.length}; đề xuất: ${allSug.length}.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
