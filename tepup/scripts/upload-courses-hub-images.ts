/**
 * Upload ảnh cho trang /courses (design "demo-course-stories") và ghi URL vào DB.
 *
 *   - Character.avatarUrl  ← scripts/courses-hub-assets/av-*.webp
 *   - Character.imageUrl   ← scripts/courses-hub-assets/hero-*.webp
 *   - Course.imageUrl      ← scripts/courses-hub-assets/course-*.webp
 *
 * Ảnh được đẩy lên bucket `course_images` của CHÍNH môi trường đang trỏ tới
 * (staging và production có Supabase Storage riêng), đường dẫn `hub/…`, upsert
 * nên chạy lại bao nhiêu lần cũng được. Slug nào không có trong DB thì bỏ qua.
 *
 *   npx tsx scripts/upload-courses-hub-images.ts --env=<path>            # dry run
 *   npx tsx scripts/upload-courses-hub-images.ts --env=<path> --apply    # ghi thật
 *
 * `--env` là BẮT BUỘC — script có thể ghi vào production nên không có mặc định.
 *
 *   staging:    --env=.env
 *   production: --env='tepup-(.env)/.env.production'
 */

import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const envArg = process.argv.find((a) => a.startsWith('--env='));
if (!envArg) {
  console.error('Thiếu --env=<path>. Xem hướng dẫn ở đầu file.');
  process.exit(1);
}
const ENV_PATH = envArg.slice('--env='.length);
const APPLY = process.argv.includes('--apply');
dotenv.config({ path: ENV_PATH, override: true, quiet: true });

const ASSETS = path.join(__dirname, 'courses-hub-assets');
const PREFIX = 'hub';

/** slug nhân vật → tên file (bỏ tiền tố av-/hero-) */
const CHARACTERS: Record<string, string> = {
  student: 'minh',
  'office-worker': 'huong',
  'street-vendor': 'bactu',
  'gig-driver': 'duc',
  retiree: 'babay',
  homemaker: 'conga',
};

/** slug khoá học → tên file (bỏ tiền tố course-) */
const COURSES: Record<string, string> = {
  'logic-101': 'logic',
  thue: 'thue',
  'nguoi-la-biet-gi-ve-ban': 'riengtu',
};

async function main() {
  // Import sau khi nạp env: cả hai module đọc process.env lúc khởi tạo.
  const { prisma } = await import('../lib/prisma');
  const { getSupabaseAdmin, IMAGES_BUCKET } = await import('../lib/supabase-storage');
  const storage = getSupabaseAdmin().storage.from(IMAGES_BUCKET);

  const host = new URL(process.env.SUPABASE_URL!).host;
  console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} — env ${ENV_PATH} — storage ${host}\n`);

  async function upload(file: string): Promise<string> {
    const key = `${PREFIX}/${file}`;
    if (APPLY) {
      const { error } = await storage.upload(key, readFileSync(path.join(ASSETS, file)), {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw new Error(`Upload ${key} thất bại: ${error.message}`);
    }
    return storage.getPublicUrl(key).data.publicUrl;
  }

  for (const [slug, name] of Object.entries(CHARACTERS)) {
    const character = await prisma.character.findUnique({ where: { slug } });
    if (!character) {
      console.log(`  bỏ qua  nhân vật ${slug} — không có trong DB`);
      continue;
    }
    const avatarUrl = await upload(`av-${name}.webp`);
    const imageUrl = await upload(`hero-${name}.webp`);
    if (APPLY) {
      await prisma.character.update({ where: { slug }, data: { avatarUrl, imageUrl } });
    }
    console.log(`  ✓ nhân vật ${slug.padEnd(24)} ${character.name}`);
    console.log(`      avatar ${character.avatarUrl ?? '(trống)'} → ${avatarUrl}`);
    console.log(`      image  ${character.imageUrl ?? '(trống)'} → ${imageUrl}`);
  }

  for (const [slug, name] of Object.entries(COURSES)) {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      console.log(`  bỏ qua  khoá học ${slug} — không có trong DB`);
      continue;
    }
    const imageUrl = await upload(`course-${name}.webp`);
    if (APPLY) {
      await prisma.course.update({ where: { slug }, data: { imageUrl } });
    }
    console.log(`  ✓ khoá học ${slug.padEnd(24)} ${course.name}`);
    console.log(`      image  ${course.imageUrl ?? '(trống)'} → ${imageUrl}`);
  }

  if (APPLY) {
    // Trang /courses cache 5 phút; không gọi được revalidateTag ngoài Next nên chỉ nhắc.
    console.log('\nXong. Trang /courses sẽ thấy ảnh mới sau tối đa 5 phút (cache).');
  } else {
    console.log('\nDry run — thêm --apply để upload và ghi DB.');
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
