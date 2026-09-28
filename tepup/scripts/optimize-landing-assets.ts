/**
 * Nén bộ ảnh landing v2 từ tepup-demo-v2/demo-v2-assets sang public/landing.
 *
 * Ảnh gốc là PNG 32-bit đã tách nền (7.1MB tổng) — nặng vì định dạng chứ không
 * phải vì kích thước, nên ở đây chỉ đổi sang WebP và giữ nguyên số pixel. Riêng
 * bg.jpg là texture giấy phủ opacity .5 nên hạ chất lượng sâu cũng không ai thấy.
 *
 * Chạy một lần:  npx tsx scripts/optimize-landing-assets.ts
 */
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SRC = '/Users/macbookpro/dev/01-TEPUP/tepup-demo-v2/demo-v2-assets';
const OUT = join(process.cwd(), 'public', 'landing');

// Ảnh nhân vật giữ alpha nên phải dùng WebP có alpha; texture nền thì không.
const QUALITY_ALPHA = 82;
const QUALITY_FLAT = 72;
const BG_MAX_WIDTH = 1200;

async function main() {
  if (!existsSync(SRC)) throw new Error(`Không tìm thấy thư mục nguồn: ${SRC}`);
  mkdirSync(OUT, { recursive: true });

  let before = 0;
  let after = 0;

  for (const file of readdirSync(SRC).sort()) {
    const { name, ext } = parse(file);
    const src = join(SRC, file);
    const srcSize = statSync(src).size;

    // SVG và font copy thẳng — nén lại không được gì.
    if (ext === '.svg' || ext === '.otf') {
      copyFileSync(src, join(OUT, file));
      before += srcSize;
      after += srcSize;
      console.log(`${file.padEnd(18)} copy nguyên bản  ${kb(srcSize)}`);
      continue;
    }
    if (ext !== '.png' && ext !== '.jpg') continue;

    const isTexture = name === 'bg';
    const dest = join(OUT, `${name}.webp`);

    let pipeline = sharp(src);
    if (isTexture) pipeline = pipeline.resize({ width: BG_MAX_WIDTH, withoutEnlargement: true });

    await pipeline
      .webp({ quality: isTexture ? QUALITY_FLAT : QUALITY_ALPHA, alphaQuality: 100, effort: 6 })
      .toFile(dest);

    const outSize = statSync(dest).size;
    before += srcSize;
    after += outSize;
    console.log(
      `${file.padEnd(18)} ${kb(srcSize).padStart(8)} → ${kb(outSize).padStart(8)}  (−${pct(srcSize, outSize)})`
    );
  }

  console.log('─'.repeat(58));
  console.log(`TỔNG               ${kb(before).padStart(8)} → ${kb(after).padStart(8)}  (−${pct(before, after)})`);
}

const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`;
const pct = (a: number, b: number) => `${(((a - b) / a) * 100).toFixed(0)}%`;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
