/**
 * Migrate all external image URLs in LessonContent & ChapterContent
 * to Supabase Storage (course_images bucket).
 *
 * Run: cd tepup && npx tsx scripts/migrate-images-to-supabase.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { getSupabaseAdmin, IMAGES_BUCKET } from '../lib/supabase-storage';

// Replace deleted/moved Wikimedia files with working alternatives
const URL_REPLACEMENTS: Record<string, string> = {
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ikea_work_environment.jpg/1280px-Ikea_work_environment.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/8/8f/Coworking_Space_in_Berlin.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Plato-raphael.jpg/800px-Plato-raphael.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Nationaal_Archief_-_Verzameling_Spaarnestad_-_SFA002004006.jpg/1280px-Nationaal_Archief_-_Verzameling_Spaarnestad_-_SFA002004006.jpg':
    'https://upload.wikimedia.org/wikipedia/commons/6/60/Lewis_Hine_Power_house_mechanic_working_on_steam_pump.jpg',
};

/**
 * For Wikimedia Commons SVGs, convert to PNG thumbnail URL.
 * Handles both direct URLs (/commons/H1/H2/file.svg) and
 * already-thumbnailed URLs (/commons/thumb/...).
 */
function toFetchableUrl(src: string): string {
  // Already a thumbnail URL — use as-is
  if (src.includes('/commons/thumb/')) return src;

  // Direct Wikimedia SVG → convert to PNG thumbnail
  const match = src.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([^/]+)\/([^/]+)\/(.+)$/
  );
  if (!match) return src;
  const [, h1, h2, filename] = match;
  if (!filename.toLowerCase().endsWith('.svg')) return src;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${h1}/${h2}/${filename}/800px-${filename}.png`;
}

function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co/storage');
}

async function ensureBucketExists() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.storage.getBucket(IMAGES_BUCKET);
  if (!data) {
    console.log(`Creating bucket "${IMAGES_BUCKET}"...`);
    const { error } = await supabase.storage.createBucket(IMAGES_BUCKET, {
      public: true,
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log('Bucket created.\n');
  } else {
    console.log(`Bucket "${IMAGES_BUCKET}" exists.\n`);
  }
}

async function uploadToSupabase(src: string): Promise<string> {
  const replaced = URL_REPLACEMENTS[src] || src;
  const fetchUrl = toFetchableUrl(replaced);

  const response = await fetch(fetchUrl, {
    headers: {
      'User-Agent':
        'Tepup/1.0 (https://tepup.space; image migration) Node.js',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${fetchUrl} (${response.status})`);
  }

  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await response.arrayBuffer());

  const rawName = decodeURIComponent(
    fetchUrl.split('/').pop()!.split('?')[0]
  );
  // Sanitize: replace non-ASCII and special chars with underscores
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const hash = Buffer.from(src).toString('base64url').slice(0, 8);
  const ext = safeName.includes('.') ? '' : '.jpg';
  const filename = `${hash}-${safeName}${ext}`;

  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(filename, buffer, { contentType: mimeType, upsert: true });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

type Block = { type: string; src?: string; [key: string]: unknown };

async function migrateBlocks(
  blocks: Block[]
): Promise<{ blocks: Block[]; changed: boolean }> {
  let changed = false;
  const updatedBlocks: Block[] = [];

  for (const block of blocks) {
    if (block.type !== 'image' || !block.src || isSupabaseUrl(block.src)) {
      updatedBlocks.push(block);
      continue;
    }

    try {
      // Delay between requests to avoid Wikimedia rate limiting (429)
      await new Promise((r) => setTimeout(r, 2000));
      const publicUrl = await uploadToSupabase(block.src);
      console.log(`  ✅ ${decodeURIComponent(block.src.split('/').pop()!)}`);
      console.log(`     → ${publicUrl.split('/').pop()}`);
      updatedBlocks.push({ ...block, src: publicUrl });
      changed = true;
    } catch (err) {
      console.log(
        `  ❌ FAILED: ${decodeURIComponent(block.src.split('/').pop()!)}`
      );
      console.log(`     ${(err as Error).message}`);
      updatedBlocks.push(block); // keep original on failure
    }
  }

  return { blocks: updatedBlocks, changed };
}

async function main() {
  console.log('=== Migrating images to Supabase Storage ===\n');

  await ensureBucketExists();

  // Migrate LessonContent
  const lessons = await prisma.lessonContent.findMany({
    select: { lessonId: true, blocks: true },
  });

  let lessonUpdated = 0;
  for (const lesson of lessons) {
    const blocks = lesson.blocks as Block[];
    const hasExternalImages = blocks.some(
      (b) => b.type === 'image' && b.src && !isSupabaseUrl(b.src)
    );
    if (!hasExternalImages) continue;

    console.log(`Lesson: ${lesson.lessonId}`);
    const result = await migrateBlocks(blocks);
    if (result.changed) {
      await prisma.lessonContent.update({
        where: { lessonId: lesson.lessonId },
        data: { blocks: result.blocks as object[] },
      });
      lessonUpdated++;
      console.log(`  Saved.\n`);
    }
  }

  // Migrate ChapterContent
  const chapters = await prisma.chapterContent.findMany({
    select: { chapterId: true, blocks: true },
  });

  let chapterUpdated = 0;
  for (const chapter of chapters) {
    const blocks = chapter.blocks as Block[];
    const hasExternalImages = blocks.some(
      (b) => b.type === 'image' && b.src && !isSupabaseUrl(b.src)
    );
    if (!hasExternalImages) continue;

    console.log(`Chapter: ${chapter.chapterId}`);
    const result = await migrateBlocks(blocks);
    if (result.changed) {
      await prisma.chapterContent.update({
        where: { chapterId: chapter.chapterId },
        data: { blocks: result.blocks as object[] },
      });
      chapterUpdated++;
      console.log(`  Saved.\n`);
    }
  }

  console.log(
    `\nDone. Updated ${lessonUpdated} lesson(s), ${chapterUpdated} chapter(s).`
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
