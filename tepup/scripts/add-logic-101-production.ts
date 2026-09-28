/**
 * Seed the "Logic 101 — Não Bạn Đang Lừa Bạn" course.
 *
 * Creates the full 20-lesson / 5-level skeleton and authors lesson B01
 * (Confirmation Bias) in full from
 *   docs/content-course-Logic-101/lessons/B01-confirmation-bias/01.lesson/final.md
 * with checkpoint questions drawn from the sibling 02.practice/practice-final.md.
 *
 * B02–B20 are created as shells with no LessonContent. The player renders those as
 * "Bài học này chưa có nội dung." — a deliberate, reviewed choice, not an oversight.
 *
 * Everything is upserted by slug, so re-running is safe and idempotent.
 *
 *   npx tsx scripts/add-logic-101-production.ts --env=<path>              # dry run
 *   npx tsx scripts/add-logic-101-production.ts --env=<path> --apply      # writes
 *
 * `--env` is REQUIRED and must be given explicitly — this script can target the live
 * production database, so there is no default and no silent fallback to `.env`.
 *
 *   staging:    --env=.env
 *   production: --env='tepup-(.env)/.env.production'
 */

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import type { ContentBlock } from '../lib/types/content';
import { CATEGORY, COURSE, LEVELS } from './logic-101/structure';
import { B01_LIBRARY_DOCS } from './logic-101/library-docs';
import { B02_LIBRARY_DOCS } from './logic-101/library-docs-b02';
import { buildB01Blocks } from './logic-101/b01-blocks';
import { buildB02Blocks } from './logic-101/b02-blocks';
import { B01_IMAGES, B02_IMAGES } from './logic-101/images';

/**
 * Lessons that have authored content. Everything else in LEVELS is created as a shell.
 * Adding a lesson means adding one entry here — no other part of this script changes.
 */
const AUTHORED: {
  id: string;
  title: string;
  images: Record<string, string>;
  build: (deps: { libraryDocId: (slug: string) => string; images: never }) => ContentBlock[];
}[] = [
  {
    id: 'B01',
    title: 'Confirmation Bias — Bạn chỉ thấy cái bạn muốn thấy',
    images: B01_IMAGES,
    build: (d) => buildB01Blocks(d as never),
  },
  {
    id: 'B02',
    title: 'Ngụy biện là gì? — Tiền đề, kết luận, valid & sound',
    images: B02_IMAGES,
    build: (d) => buildB02Blocks(d as never),
  },
];

const ALL_LIBRARY_DOCS = [...B01_LIBRARY_DOCS, ...B02_LIBRARY_DOCS];

// ─── args ─────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');
const envArg = process.argv.find((a) => a.startsWith('--env='));

if (!envArg) {
  console.error('ERROR: --env=<path to env file> is required.');
  console.error("  staging:    --env=.env");
  console.error("  production: --env='tepup-(.env)/.env.production'");
  process.exit(1);
}

const envPath = envArg.slice('--env='.length);
const parsed = dotenv.config({ path: envPath, override: true });
const databaseUrl = parsed.parsed?.DATABASE_URL;

if (!databaseUrl) {
  console.error(`ERROR: no DATABASE_URL found in ${envPath}`);
  process.exit(1);
}

const projectRef = databaseUrl.match(/postgres\.([a-z]+)/)?.[1] ?? 'unknown';
const KNOWN: Record<string, string> = {}; // add your Supabase project refs: { '<ref>': 'STAGING' | 'PRODUCTION' }
const targetLabel = KNOWN[projectRef as keyof typeof KNOWN] ?? `UNKNOWN (${projectRef})`;

// Prisma 7 routes through the pg driver adapter, so the connection string is
// supplied to the Pool rather than via `datasources`. Building the client here
// (instead of importing lib/prisma) is what lets --env pick the target DB.
const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 15_000 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ['error'] });

// ─── helpers ──────────────────────────────────────────────────────────────────

const log: string[] = [];
function plan(msg: string) {
  log.push(msg);
  console.log(`  ${msg}`);
}

async function main() {
  console.log('');
  console.log('═'.repeat(72));
  console.log(`  Logic 101 seed`);
  console.log(`  target : ${targetLabel}  [${projectRef}]`);
  console.log(`  env    : ${envPath}`);
  console.log(`  mode   : ${APPLY ? '*** APPLY — WILL WRITE ***' : 'dry run (no writes)'}`);
  console.log('═'.repeat(72));

  // Guard: never write broken image URLs into a live lesson.
  const missingImages = AUTHORED.flatMap((l) =>
    Object.entries(l.images)
      .filter(([, url]) => !url || url.startsWith('TODO'))
      .map(([k]) => `${l.id}.${k}`)
  );
  if (missingImages.length && APPLY) {
    console.error('');
    console.error(`ERROR: image URL(s) not set: ${missingImages.join(', ')}`);
    console.error('Fill scripts/logic-101/images.ts (run scripts/logic-101/upload-images.ts first).');
    console.error('Refusing to seed a lesson with placeholder images.');
    process.exit(1);
  }
  if (missingImages.length) {
    console.log('');
    console.log(`  ⚠ image URL(s) still unset: ${missingImages.join(', ')} — --apply will refuse until filled`);
  }

  // ── 1. Category ────────────────────────────────────────────────────────────
  console.log('\n▸ Category');
  const existingByLegacy = await prisma.category.findUnique({ where: { slug: CATEGORY.legacySlug } });
  const existingByTarget = await prisma.category.findUnique({ where: { slug: CATEGORY.slug } });

  let categoryId: string | null = null;

  if (existingByTarget) {
    categoryId = existingByTarget.id;
    plan(`reuse "${CATEGORY.slug}" (already correct)`);
  } else if (existingByLegacy) {
    categoryId = existingByLegacy.id;
    const courseCount = await prisma.course.count({ where: { categoryId: existingByLegacy.id } });
    plan(`rename slug "${CATEGORY.legacySlug}" → "${CATEGORY.slug}" (holds ${courseCount} course(s))`);
    if (APPLY) {
      await prisma.category.update({
        where: { id: existingByLegacy.id },
        data: { slug: CATEGORY.slug, name: CATEGORY.name, description: CATEGORY.description, icon: CATEGORY.icon },
      });
    }
  } else {
    plan(`create category "${CATEGORY.slug}"`);
    if (APPLY) {
      const created = await prisma.category.create({
        data: {
          slug: CATEGORY.slug,
          name: CATEGORY.name,
          description: CATEGORY.description,
          icon: CATEGORY.icon,
          sortOrder: CATEGORY.sortOrder,
        },
      });
      categoryId = created.id;
    }
  }

  // ── 2. Library documents ───────────────────────────────────────────────────
  console.log('\n▸ Library documents');
  const libraryIds = new Map<string, string>();
  for (const doc of ALL_LIBRARY_DOCS) {
    const existing = await prisma.libraryDocument.findUnique({ where: { slug: doc.slug } });
    plan(`${existing ? 'update' : 'create'}  ${doc.slug}`);
    if (APPLY) {
      const saved = await prisma.libraryDocument.upsert({
        where: { slug: doc.slug },
        create: {
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          category: doc.category,
          icon: doc.icon,
          content: doc.content,
          sortOrder: doc.sortOrder,
        },
        update: {
          title: doc.title,
          description: doc.description,
          category: doc.category,
          icon: doc.icon,
          content: doc.content,
        },
      });
      libraryIds.set(doc.slug, saved.id);
    } else if (existing) {
      libraryIds.set(doc.slug, existing.id);
    }
  }

  // ── 3. Course ──────────────────────────────────────────────────────────────
  console.log('\n▸ Course');
  const existingCourse = await prisma.course.findUnique({ where: { slug: COURSE.slug } });
  plan(`${existingCourse ? 'update' : 'create'}  ${COURSE.slug} — "${COURSE.name}" (isActive=${COURSE.isActive})`);

  let courseId = existingCourse?.id ?? null;
  if (APPLY) {
    if (!categoryId) throw new Error('categoryId unresolved');
    const saved = await prisma.course.upsert({
      where: { slug: COURSE.slug },
      create: {
        slug: COURSE.slug,
        name: COURSE.name,
        description: COURSE.description,
        icon: COURSE.icon,
        sortOrder: COURSE.sortOrder,
        isActive: COURSE.isActive,
        categoryId,
      },
      update: {
        name: COURSE.name,
        description: COURSE.description,
        icon: COURSE.icon,
        isActive: COURSE.isActive,
        categoryId,
      },
    });
    courseId = saved.id;
  }

  // ── 4. Levels + lessons ────────────────────────────────────────────────────
  console.log('\n▸ Levels & lessons');
  const lessonIds = new Map<string, string>();

  for (const level of LEVELS) {
    let levelId: string | null = null;

    if (APPLY) {
      if (!courseId) throw new Error('courseId unresolved');
      // Level has no unique key beyond id — match on (courseId, name).
      const found = await prisma.level.findFirst({ where: { courseId, name: level.name } });
      levelId = found
        ? (await prisma.level.update({ where: { id: found.id }, data: { sortOrder: level.sortOrder } })).id
        : (await prisma.level.create({ data: { courseId, name: level.name, sortOrder: level.sortOrder } })).id;
    }
    plan(`level ${level.sortOrder} — ${level.name}`);

    for (const [i, lesson] of level.lessons.entries()) {
      const authored = AUTHORED.some((a) => a.id === lesson.id);
      plan(`   ${lesson.id}  ${lesson.slug}${authored ? '   ← full content' : '   (shell)'}`);

      if (APPLY) {
        if (!courseId || !levelId) throw new Error('ids unresolved');
        const saved = await prisma.lesson.upsert({
          where: { courseId_slug: { courseId, slug: lesson.slug } },
          create: {
            courseId,
            levelId,
            slug: lesson.slug,
            name: lesson.name,
            sortOrder: i,
            isActive: true,
          },
          update: { levelId, name: lesson.name, sortOrder: i, isActive: true },
        });
        lessonIds.set(lesson.id, saved.id);
      }
    }
  }

  // ── 5. Lesson content ──────────────────────────────────────────────────────
  // Every type here must exist in components/learn/BlockRenderer.tsx, otherwise the
  // block silently renders as nothing. This is not hypothetical — logic-101 B02/B03/B04
  // on staging each lose 2 blocks this way (argument-mapper, fact-or-opinion, …).
  const RENDERABLE = new Set([
    'text', 'callout', 'image', 'question', 'library-document', 'step-break',
    'heading', 'quote', 'code', 'bullet-list', 'numbered-list', 'check-list',
    'toggle', 'table', 'video', 'audio', 'file',
    'calculator', 'slider-simulator', 'budget-allocator',
    'bias-detector', 'perspective-switch', 'hot-cold-guess', 'custom',
  ]);
  const INTERACTIVE = ['calculator', 'slider-simulator', 'budget-allocator', 'bias-detector', 'perspective-switch', 'hot-cold-guess', 'custom'];

  for (const lesson of AUTHORED) {
    console.log(`\n▸ ${lesson.id} content`);

    const blocks = lesson.build({
      libraryDocId: (slug) => {
        const id = libraryIds.get(slug);
        if (!id) {
          if (APPLY) throw new Error(`library document "${slug}" has no id`);
          return `<${slug}>`;
        }
        return id;
      },
      images: lesson.images as never,
    });

    const unrenderable = [...new Set(blocks.map((b) => b.type))].filter((t) => !RENDERABLE.has(t));
    if (unrenderable.length) {
      throw new Error(
        `${lesson.id}: block type(s) with no renderer — would be invisible to learners: ${unrenderable.join(', ')}`
      );
    }

    const counts = blocks.reduce<Record<string, number>>((acc, b) => {
      acc[b.type] = (acc[b.type] ?? 0) + 1;
      return acc;
    }, {});
    plan(`${blocks.length} blocks: ${Object.entries(counts).map(([t, n]) => `${t}×${n}`).join(', ')}`);

    const questions = blocks.filter((b) => b.type === 'question').length;
    const interactive = blocks.filter((b) => INTERACTIVE.includes(b.type)).length;
    plan(`${questions} question block(s) (1 gợi mở + ${questions - 1} checkpoint), ${interactive} interactive`);

    if (APPLY) {
      const lessonId = lessonIds.get(lesson.id);
      if (!lessonId) throw new Error(`${lesson.id} lesson id unresolved`);
      await prisma.lessonContent.upsert({
        where: { lessonId },
        create: { lessonId, title: lesson.title, blocks: blocks as never },
        update: { title: lesson.title, blocks: blocks as never },
      });
    }
  }

  console.log('\n' + '─'.repeat(72));
  console.log(`  ${log.length} operation(s) ${APPLY ? 'applied' : 'planned'}`);
  if (!APPLY) console.log('  Dry run — nothing was written. Re-run with --apply to commit.');
  console.log('─'.repeat(72) + '\n');
}

main()
  .catch((e) => {
    console.error('\nFAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
