/**
 * Đặt ảnh tem cho nhân vật (design "paper", sổ tem ở /courses và /story/<nhân vật>).
 *
 *   - Character.imageUrl  ← <from>/photo-<key>.webp   (ảnh trong tem, ~262×266)
 *   - Character.avatarUrl ← <from>/thumb-<key>.webp   (ảnh nhỏ trên thẻ câu chuyện)
 *
 * Ảnh đi qua `sanitizeImage` (bỏ hết EXIF/GPS/XMP, tên theo hash nội dung) rồi lên
 * bucket `course_images` của CHÍNH môi trường trong file env, đường dẫn
 * `stamps/<hash>.<ext>`. Tên theo hash → chạy lại không tạo file trùng.
 *
 * Trường nhân vật không có lịch sử phiên bản (ContentRevision chỉ dành cho nội dung
 * bài/chương/thư viện/outline) và AuditLog chỉ ghi hành động của người dùng trong app,
 * nên script không ghi vào hai bảng đó. Giá trị cũ được in ra để còn khôi phục tay.
 *
 *   npx tsx scripts/set-character-stamps.ts --env=<path>                  # dry run
 *   npx tsx scripts/set-character-stamps.ts --env=<path> --apply          # ghi thật
 *   npx tsx scripts/set-character-stamps.ts --env=<path> --from=<thư mục ảnh>
 *
 * `--env` là BẮT BUỘC, không có mặc định:
 *   staging:    --env=.env
 *   production: --env='tepup-(.env)/.env.production'
 * Mặc định `--from` = thư mục ảnh của bản demo bàn giao (xem DEFAULT_FROM).
 * Chỉ chạy production khi được yêu cầu đích danh lần chạy đó.
 */

import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const envArg = process.argv.find((a) => a.startsWith('--env='));
if (!envArg) {
  console.error('ERROR: --env=<path to env file> is required.');
  console.error('  staging:    --env=.env');
  console.error("  production: --env='tepup-(.env)/.env.production'");
  process.exit(1);
}
const ENV_PATH = envArg.slice('--env='.length);
const APPLY = process.argv.includes('--apply');
const DEFAULT_FROM = '/Users/macbookpro/dev/demo-all-in-one/demo-course-stories/demo-course-stories-assets';
const FROM = path.resolve(process.argv.find((a) => a.startsWith('--from='))?.slice('--from='.length) ?? DEFAULT_FROM);

if (!existsSync(ENV_PATH)) {
  console.error(`ERROR: không thấy file env: ${ENV_PATH}`);
  process.exit(1);
}
const parsed = dotenv.config({ path: ENV_PATH, override: true, quiet: true });
const databaseUrl = parsed.parsed?.DATABASE_URL;
if (!databaseUrl) {
  console.error(`ERROR: no DATABASE_URL found in ${ENV_PATH}`);
  process.exit(1);
}

const projectRef =
  databaseUrl.match(/postgres\.([a-z0-9]+)[:@]/)?.[1] ?? databaseUrl.match(/db\.([a-z0-9]+)\.supabase/)?.[1] ?? 'unknown';
const KNOWN: Record<string, string> = {}; // add your Supabase project refs: { '<ref>': 'STAGING' | 'PRODUCTION' }
const target = KNOWN[projectRef as keyof typeof KNOWN] ?? `UNKNOWN (${projectRef})`;

/**
 * Khoá ảnh trong bản demo → slug nhân vật trong DB.
 * Slug lấy từ scripts/stories-v2/characters.ts (cũng là bảng trong
 * scripts/upload-courses-hub-images.ts); không tra DB để đoán.
 */
const STAMPS: Array<{ key: string; slug: string }> = [
  { key: 'minh', slug: 'student' },
  { key: 'huong', slug: 'office-worker' },
  { key: 'bactu', slug: 'street-vendor' },
  { key: 'duc', slug: 'gig-driver' },
  { key: 'babay', slug: 'retiree' },
  { key: 'conga', slug: 'homemaker' },
];
const PREFIX = 'stamps';

async function main() {
  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — target ${target} — env ${ENV_PATH}`);
  console.log(`Ảnh từ: ${FROM}\n`);
  if (!existsSync(FROM)) {
    console.error(`ERROR: không thấy thư mục ảnh ${FROM} (dùng --from=<thư mục>)`);
    process.exit(1);
  }

  // Import sau khi nạp env.
  const { PrismaClient } = await import('@prisma/client');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const pg = (await import('pg')).default;
  const { createClient } = await import('@supabase/supabase-js');
  const { sanitizeImage } = await import('../lib/security/image-sanitize');
  const { IMAGES_BUCKET } = await import('../lib/supabase-storage');

  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2, connectionTimeoutMillis: 15_000 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool), log: ['error'] });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('ERROR: thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong file env');
    process.exit(1);
  }
  const storage = createClient(supabaseUrl, serviceKey).storage.from(IMAGES_BUCKET);
  console.log(`Storage: ${new URL(supabaseUrl).host} / ${IMAGES_BUCKET}/${PREFIX}\n`);

  async function prepare(file: string): Promise<string | null> {
    const full = path.join(FROM, file);
    if (!existsSync(full)) {
      console.log(`      thiếu file ${file}`);
      return null;
    }
    const img = await sanitizeImage(readFileSync(full));
    const key = `${PREFIX}/${img.filename}`;
    if (APPLY) {
      const { error } = await storage.upload(key, img.buffer, { contentType: img.contentType, upsert: true });
      if (error) throw new Error(`Upload ${key} thất bại: ${error.message}`);
    }
    return storage.getPublicUrl(key).data.publicUrl;
  }

  let changed = 0;
  try {
    for (const { key, slug } of STAMPS) {
      const character = await prisma.character.findUnique({
        where: { slug },
        select: { id: true, name: true, imageUrl: true, avatarUrl: true },
      });
      if (!character) {
        console.log(`  bỏ qua  ${key} → ${slug}: không có nhân vật này trong DB`);
        continue;
      }
      const imageUrl = await prepare(`photo-${key}.webp`);
      const avatarUrl = await prepare(`thumb-${key}.webp`);
      const data: { imageUrl?: string; avatarUrl?: string } = {};
      if (imageUrl && imageUrl !== character.imageUrl) data.imageUrl = imageUrl;
      if (avatarUrl && avatarUrl !== character.avatarUrl) data.avatarUrl = avatarUrl;

      console.log(`  ${Object.keys(data).length ? '✓' : '='} ${key.padEnd(6)} → ${slug.padEnd(14)} ${character.name}`);
      console.log(`      imageUrl  ${character.imageUrl ?? '(trống)'}\n             → ${imageUrl ?? '(giữ nguyên)'}`);
      console.log(`      avatarUrl ${character.avatarUrl ?? '(trống)'}\n             → ${avatarUrl ?? '(giữ nguyên)'}`);
      if (!Object.keys(data).length) continue;
      changed++;
      if (APPLY) await prisma.character.update({ where: { slug }, data });
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  if (APPLY) {
    console.log(`\nXong: ${changed} nhân vật. /courses và /story/** thấy ảnh mới sau tối đa ~10 phút (cache Next + Cloudflare).`);
  } else {
    console.log(`\nDry run: ${changed} nhân vật sẽ đổi. Thêm --apply để upload và ghi DB.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
