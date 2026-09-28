/**
 * Audit Scripts — Check which one-time scripts have been run on the current database.
 *
 * Read-only: does NOT modify any data.
 * Run: cd tepup && npx tsx scripts/audit-scripts.ts
 * Run on production: cd tepup && npx tsx scripts/audit-scripts.ts --production
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Load env: --production flag loads .env.production, otherwise .env
const isProduction = process.argv.includes('--production');
dotenv.config({ path: isProduction ? '.env.production' : '.env' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 5,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type Status = 'DONE' | 'NOT_RUN' | 'PARTIAL';
type AuditResult = { script: string; status: Status; detail: string };

// ── Helpers ──────────────────────────────────────────────────────────

function blocksToString(blocks: unknown): string {
  return JSON.stringify(blocks);
}

function statusIcon(s: Status) {
  return s === 'DONE' ? '✅' : s === 'NOT_RUN' ? '❌' : '⚠️';
}

// ── Check 1: fix-image-urls.ts ──────────────────────────────────────

const OLD_URLS_V1 = [
  'commons/0/0c/Nicolas_de_Condorcet.PNG',
  'commons/4/40/Trias_Politica_en.svg',
  'commons/b/bd/Checks_and_Balances.svg',
  'commons/4/4a/ElectoralCollege2024.svg',
];

async function checkFixImageUrls(): Promise<AuditResult> {
  const contents = await prisma.lessonContent.findMany({ select: { blocks: true } });
  const allBlocks = contents.map(c => blocksToString(c.blocks)).join('\n');

  const found = OLD_URLS_V1.filter(url => allBlocks.includes(url));
  if (found.length === 0) return { script: 'fix-image-urls.ts', status: 'DONE', detail: `All 4 URLs fixed` };
  if (found.length === OLD_URLS_V1.length) return { script: 'fix-image-urls.ts', status: 'NOT_RUN', detail: `All 4 old URLs still present` };
  return { script: 'fix-image-urls.ts', status: 'PARTIAL', detail: `${found.length}/4 old URLs remain` };
}

// ── Check 2: fix-broken-image-urls-v2.ts ────────────────────────────

const OLD_URLS_V2 = [
  'commons/0/08/Map_of_unitary_and_federal_states.svg',
  'commons/a/ac/Alexis_de_Tocqueville',
  'commons/5/5c/US_2016_presidential_election',
  'commons/6/6e/France_2002_presidential_election',
  'commons/8/87/Suffragette_City_NYC_1913',
  'commons/4/4e/Democracy_Index_2022_complete',
];

async function checkFixImageUrlsV2(): Promise<AuditResult> {
  const contents = await prisma.lessonContent.findMany({ select: { blocks: true } });
  const allBlocks = contents.map(c => blocksToString(c.blocks)).join('\n');

  const found = OLD_URLS_V2.filter(url => allBlocks.includes(url));
  if (found.length === 0) return { script: 'fix-broken-image-urls-v2.ts', status: 'DONE', detail: `All 6 URLs fixed` };
  if (found.length === OLD_URLS_V2.length) return { script: 'fix-broken-image-urls-v2.ts', status: 'NOT_RUN', detail: `All 6 old URLs still present` };
  return { script: 'fix-broken-image-urls-v2.ts', status: 'PARTIAL', detail: `${found.length}/6 old URLs remain` };
}

// ── Check 3: migrate-images-to-supabase.ts ──────────────────────────

async function checkMigrateImages(): Promise<AuditResult> {
  const lessonContents = await prisma.lessonContent.findMany({ select: { blocks: true } });
  const chapterContents = await prisma.chapterContent.findMany({ select: { blocks: true } });

  const allBlocks = [...lessonContents, ...chapterContents];
  let supabaseCount = 0;
  let externalCount = 0;

  for (const content of allBlocks) {
    const blocks = content.blocks as { type: string; src?: string }[];
    if (!Array.isArray(blocks)) continue;
    for (const block of blocks) {
      if (block.type === 'image' && block.src) {
        if (block.src.includes('supabase.co/storage')) supabaseCount++;
        else if (block.src.startsWith('http')) externalCount++;
      }
    }
  }

  if (externalCount === 0 && supabaseCount > 0) return { script: 'migrate-images-to-supabase.ts', status: 'DONE', detail: `${supabaseCount} supabase, 0 external` };
  if (supabaseCount === 0 && externalCount > 0) return { script: 'migrate-images-to-supabase.ts', status: 'NOT_RUN', detail: `0 supabase, ${externalCount} external` };
  if (externalCount === 0 && supabaseCount === 0) return { script: 'migrate-images-to-supabase.ts', status: 'NOT_RUN', detail: `No images found` };
  return { script: 'migrate-images-to-supabase.ts', status: 'PARTIAL', detail: `${supabaseCount} supabase, ${externalCount} external` };
}

// ── Check 4: merge-duc-stories.ts ───────────────────────────────────

async function checkMergeDucStories(): Promise<AuditResult> {
  const oldStory = await prisma.story.findFirst({ where: { slug: 'duc-thuattoan' } });
  const mergedStory = await prisma.story.findFirst({ where: { slug: 'duc-canhlao' }, include: { parts: true } });

  if (!oldStory && mergedStory && mergedStory.parts.length >= 2) {
    return { script: 'merge-duc-stories.ts', status: 'DONE', detail: `duc-thuattoan deleted, duc-canhlao has ${mergedStory.parts.length} parts` };
  }
  if (oldStory) {
    return { script: 'merge-duc-stories.ts', status: 'NOT_RUN', detail: `duc-thuattoan still exists` };
  }
  return { script: 'merge-duc-stories.ts', status: 'PARTIAL', detail: `duc-thuattoan gone but duc-canhlao has ${mergedStory?.parts.length ?? 0} parts` };
}

// ── Check 5: update-danchu101-level*.ts (5 scripts) ─────────────────

const SENTINELS: { script: string; lessonSlug: string; search: string }[] = [
  { script: 'update-danchu101-level1.ts', lessonSlug: 'danchu101-1', search: 'gần 50 năm (1962–2011)' },
  { script: 'update-danchu101-level1-v2.ts', lessonSlug: 'danchu101-1', search: 'Ba làn sóng dân chủ' },
  { script: 'update-danchu101-level2.ts', lessonSlug: 'danchu101-5', search: '2013' },
  { script: 'update-danchu101-level3.ts', lessonSlug: 'danchu101-9', search: "De l'esprit des lois" },
  { script: 'update-danchu101-level4.ts', lessonSlug: 'danchu101-13', search: '1,1%' },
];

async function checkUpdateDanchu101(): Promise<AuditResult> {
  const results: string[] = [];
  let doneCount = 0;

  for (const s of SENTINELS) {
    const lesson = await prisma.lesson.findFirst({ where: { slug: s.lessonSlug }, select: { id: true } });
    if (!lesson) {
      results.push(`${s.script.replace('update-danchu101-', '').replace('.ts', '')}❓`);
      continue;
    }
    const content = await prisma.lessonContent.findFirst({ where: { lessonId: lesson.id }, select: { blocks: true } });
    if (!content) {
      results.push(`${s.script.replace('update-danchu101-', '').replace('.ts', '')}❓`);
      continue;
    }
    const found = blocksToString(content.blocks).includes(s.search);
    const label = s.script.replace('update-danchu101-', '').replace('.ts', '');
    results.push(found ? `${label}✅` : `${label}❌`);
    if (found) doneCount++;
  }

  const status: Status = doneCount === SENTINELS.length ? 'DONE' : doneCount === 0 ? 'NOT_RUN' : 'PARTIAL';
  return { script: 'update-danchu101-* (5 scripts)', status, detail: results.join(' ') };
}

// ── Check 6: cleanup-and-setup-admin.ts ─────────────────────────────

async function checkCleanupAdmin(): Promise<AuditResult> {
  const script = 'cleanup-and-setup-admin.ts';
  const adminUsername = process.env.ADMIN_USERNAME;
  if (!adminUsername) {
    return { script, status: 'PARTIAL', detail: 'không xác định được: chưa set ADMIN_USERNAME' };
  }

  // cleanup-and-setup-admin.ts tạo admin theo username (auth username-only), không set email.
  const admin = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (admin && admin.role === 'ADMIN') return { script, status: 'DONE', detail: `${adminUsername} exists (ADMIN)` };
  if (admin) return { script, status: 'PARTIAL', detail: `${adminUsername} exists but role=${admin.role}` };
  return { script, status: 'NOT_RUN', detail: `${adminUsername} not found` };
}

// ── Check 7: migrate-static-to-db.ts ────────────────────────────────

async function checkMigrateStaticToDb(): Promise<AuditResult> {
  const [catCount, courseCount] = await Promise.all([
    prisma.category.count(),
    prisma.course.count(),
  ]);

  if (catCount > 0 && courseCount > 0) return { script: 'migrate-static-to-db.ts', status: 'DONE', detail: `${catCount} categories, ${courseCount} courses` };
  return { script: 'migrate-static-to-db.ts', status: 'NOT_RUN', detail: `${catCount} categories, ${courseCount} courses` };
}

// ── ScriptLog history ───────────────────────────────────────────────

async function checkScriptLog(): Promise<void> {
  try {
    const logs = await prisma.scriptLog.findMany({ orderBy: { ranAt: 'desc' }, take: 20 });
    if (logs.length === 0) {
      console.log('\n📋 ScriptLog entries: (none found)');
    } else {
      console.log(`\n📋 ScriptLog entries (${logs.length}):`);
      for (const log of logs) {
        const date = log.ranAt.toISOString().slice(0, 19).replace('T', ' ');
        console.log(`   ${date}  ${log.status.padEnd(7)}  ${log.name}${log.message ? ` — ${log.message}` : ''}`);
      }
    }
  } catch {
    console.log('\n📋 ScriptLog table: not yet created (run prisma db push)');
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  const dbHint = dbUrl.includes('nreigcbw') ? 'staging' : dbUrl.includes('prod') ? 'production' : 'unknown';
  const dbHost = dbUrl.match(/@([^:\/]+)/)?.[1] ?? 'unknown';

  console.log(`\n🔍 Audit Scripts — Checking database...`);
  console.log(`   DB host: ${dbHost} (${dbHint})\n`);

  const results: AuditResult[] = await Promise.all([
    checkFixImageUrls(),
    checkFixImageUrlsV2(),
    checkMigrateImages(),
    checkMergeDucStories(),
    checkUpdateDanchu101(),
    checkCleanupAdmin(),
    checkMigrateStaticToDb(),
  ]);

  // Print table
  const maxScript = Math.max(...results.map(r => r.script.length));
  const maxDetail = Math.max(...results.map(r => r.detail.length));

  const sep = `${'─'.repeat(maxScript + 2)}┼────────┼${'─'.repeat(maxDetail + 2)}`;
  console.log(`┌${sep.replace(/┼/g, '┬')}┐`);
  console.log(`│ ${'Script'.padEnd(maxScript)} │ Status │ ${'Detail'.padEnd(maxDetail)} │`);
  console.log(`├${sep}┤`);

  for (const r of results) {
    const icon = statusIcon(r.status);
    console.log(`│ ${r.script.padEnd(maxScript)} │   ${icon}   │ ${r.detail.padEnd(maxDetail)} │`);
  }

  console.log(`└${sep.replace(/┼/g, '┴')}┘`);

  // ScriptLog history
  await checkScriptLog();

  // Summary
  const done = results.filter(r => r.status === 'DONE').length;
  const notRun = results.filter(r => r.status === 'NOT_RUN').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  console.log(`\n📊 Summary: ${done} done, ${partial} partial, ${notRun} not run\n`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
