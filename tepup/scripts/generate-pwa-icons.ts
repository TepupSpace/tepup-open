/**
 * Sinh bộ icon PWA từ logo gốc.
 *
 * Logo trong public/ là bản dựng có lưới hướng dẫn màu tím, nên script này:
 *   1. xoá các nét tím (giữ lại đúng hoạ tiết con tôm),
 *   2. cắt sát vào hoạ tiết,
 *   3. đặt lên nền đỏ đặc — icon nền trắng nét mảnh gần như tàng hình ở 60px.
 *
 * Chạy: npx tsx scripts/generate-pwa-icons.ts
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE = path.join(process.cwd(), 'public', 'Tepup-Color-Logo-0.png');
const OUT_DIR = path.join(process.cwd(), 'public', 'icons');

/** Đỏ thương hiệu, lấy từ nét vẽ của logo gốc. */
const BRAND_RED = { r: 237, g: 40, b: 42 };

/**
 * Tách hoạ tiết khỏi lưới hướng dẫn.
 *
 * File gốc vẽ nét trên nền trong suốt, nên độ phủ của nét chính là kênh alpha —
 * không được suy độ mờ từ RGB, vì vùng trong suốt lưu RGB đen bên dưới và sẽ
 * bị hiểu nhầm thành nét đậm.
 *
 * Lưới tím nhận diện bằng b vượt trội so với r và g: nét đỏ (b thấp nhất) và nét
 * đen (ba kênh bằng nhau) đều không dính điều kiện này.
 */
async function extractArtwork(keepOriginalColour: boolean) {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const s = i * channels;
    const r = data[s];
    const g = data[s + 1];
    const b = data[s + 2];
    const a = data[s + 3];

    const isGuide = b > r + 15 && b > g + 15;

    const d = i * 4;
    if (keepOriginalColour) {
      out[d] = r;
      out[d + 1] = g;
      out[d + 2] = b;
    } else {
      out[d] = 255;
      out[d + 1] = 255;
      out[d + 2] = 255;
    }
    out[d + 3] = isGuide ? 0 : a;
  }

  return sharp(out, { raw: { width, height, channels: 4 } })
    .png()
    .trim({ threshold: 1 })
    .toBuffer({ resolveWithObject: true });
}

/**
 * Đặt hoạ tiết lên nền đỏ.
 *
 * `coverage` là tỉ lệ hoạ tiết chiếm so với cạnh icon. Với icon maskable, Android
 * cắt theo hình tròn đường kính 80% cạnh, nên ta ép đường chéo khung hoạ tiết
 * nằm gọn trong đường tròn đó thay vì chỉ ép chiều cao.
 */
async function compose(
  artwork: Buffer,
  artWidth: number,
  artHeight: number,
  size: number,
  maskable: boolean
) {
  const target = maskable ? 0.76 * size : 0.82 * size;
  const scale = maskable
    ? target / Math.hypot(artWidth, artHeight)
    : target / Math.max(artWidth, artHeight);

  const w = Math.round(artWidth * scale);
  const h = Math.round(artHeight * scale);
  const resized = await sharp(artwork).resize(w, h).toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { ...BRAND_RED, alpha: 1 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((size - w) / 2),
        top: Math.round((size - h) / 2),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const white = await extractArtwork(false);
  const { width: aw, height: ah } = white.info;
  console.log(`Hoạ tiết sau khi cắt: ${aw}×${ah}`);

  const targets: Array<[string, number, boolean]> = [
    ['icon-192.png', 192, false],
    ['icon-512.png', 512, false],
    ['icon-maskable-512.png', 512, true],
    ['apple-touch-icon.png', 180, false],
    ['icon-32.png', 32, false],
  ];

  for (const [name, size, maskable] of targets) {
    // apple-touch-icon không được có kênh alpha: iOS không tự vẽ nền, ảnh trong
    // suốt sẽ ra icon đen.
    const pipeline = sharp(await compose(white.data, aw, ah, size, maskable));
    const buf =
      name === 'apple-touch-icon.png'
        ? await pipeline.flatten({ background: BRAND_RED }).png().toBuffer()
        : await pipeline.toBuffer();
    await writeFile(path.join(OUT_DIR, name), buf);
    console.log(`  ✓ icons/${name} (${size}×${size}${maskable ? ', maskable' : ''})`);
  }

  // Logo sạch cho header — vẫn là bản gốc nhiều màu, chỉ bỏ lưới hướng dẫn.
  const colour = await extractArtwork(true);
  await writeFile(
    path.join(process.cwd(), 'public', 'tepup-logo.png'),
    await sharp(colour.data).resize({ height: 256 }).png().toBuffer()
  );
  console.log('  ✓ tepup-logo.png (logo sạch cho header)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
