import { createHash } from 'crypto';
import sharp from 'sharp';

/**
 * Re-encode an uploaded image so nothing identifying survives into the public bucket.
 *
 * Phone photos carry EXIF: GPS coordinates, device make/model/serial, capture time,
 * sometimes the owner's name. For a contributor that can be enough to identify them.
 * Decoding and re-encoding with sharp drops ALL metadata (EXIF, XMP, IPTC, ICC,
 * comments); orientation is applied to the pixels first so photos stay upright.
 *
 * It also:
 *  - identifies the format from the bytes (magic numbers), never from the client's
 *    Content-Type or file name — so an .html or .svg can't be smuggled in as an image;
 *  - rejects SVG (it can carry script) and anything that isn't a raster image;
 *  - caps size and pixel count (decompression bombs), and downscales oversized images;
 *  - names the file after the hash of its content, so the original file name (which
 *    may contain a real name) is never stored or published.
 */

export const IMAGE_LIMITS = {
  maxBytes: 15 * 1024 * 1024,
  maxInputPixels: 50_000_000, // ~7000×7000
  maxDimension: 2560, // longest side after processing; lessons never need more
} as const;

type OutFormat = 'jpeg' | 'png' | 'webp' | 'gif';

// Input format (as sharp detects it from the bytes) → what we store.
const OUTPUT_FOR: Record<string, OutFormat> = {
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  tiff: 'jpeg',
  avif: 'webp', // sharp reports AVIF as "heif"; see below
};

const MIME: Record<OutFormat, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export class ImageRejectedError extends Error {}

export interface SanitizedImage {
  buffer: Buffer;
  contentType: string;
  /** Content-addressed name, e.g. `3f9a…c1.webp` — no trace of the original file name. */
  filename: string;
  width: number;
  height: number;
  /** What was removed, for logging/UX. Never includes the metadata values themselves. */
  removed: { exif: boolean; gps: boolean; xmp: boolean; iptc: boolean; icc: boolean };
}

export async function sanitizeImage(input: Buffer): Promise<SanitizedImage> {
  if (input.length === 0) throw new ImageRejectedError('Tệp rỗng / empty file');
  if (input.length > IMAGE_LIMITS.maxBytes) {
    throw new ImageRejectedError(`Ảnh quá lớn (tối đa ${IMAGE_LIMITS.maxBytes / 1024 / 1024} MB)`);
  }

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: IMAGE_LIMITS.maxInputPixels }).metadata();
  } catch {
    throw new ImageRejectedError('Không đọc được tệp ảnh / not a valid image');
  }

  let inFormat: string = meta.format ?? '';
  // sharp reports both HEIC and AVIF as "heif"; only AVIF (AV1) can be decoded by the
  // prebuilt binaries. HEIC (iPhone default) must be converted by the uploader.
  if (inFormat === 'heif') {
    if (meta.compression !== 'av1') {
      throw new ImageRejectedError('Ảnh HEIC chưa được hỗ trợ — vui lòng chuyển sang JPEG/PNG trước khi tải lên');
    }
    inFormat = 'avif';
  }
  if (inFormat === 'svg') {
    throw new ImageRejectedError('Không nhận ảnh SVG (có thể chứa mã) — vui lòng dùng PNG/JPEG/WebP');
  }
  const outFormat = OUTPUT_FOR[inFormat];
  if (!outFormat) throw new ImageRejectedError(`Định dạng ảnh không được hỗ trợ: ${inFormat || 'không rõ'}`);

  const animated = (meta.pages ?? 1) > 1 && (outFormat === 'gif' || outFormat === 'webp');

  const exifText = meta.exif ? meta.exif.toString('latin1') : '';
  const removed = {
    exif: !!meta.exif,
    // GPS IFD tag 0x8825, in either byte order.
    gps: exifText.includes('\x25\x88') || exifText.includes('\x88\x25'),
    xmp: !!meta.xmp,
    iptc: !!meta.iptc,
    icc: !!meta.icc,
  };

  let pipeline = sharp(input, { limitInputPixels: IMAGE_LIMITS.maxInputPixels, animated });
  // Apply EXIF orientation to the pixels before the EXIF block is dropped.
  if (!animated) pipeline = pipeline.rotate();
  pipeline = pipeline.resize({
    width: IMAGE_LIMITS.maxDimension,
    height: IMAGE_LIMITS.maxDimension,
    fit: 'inside',
    withoutEnlargement: true,
  });
  // No .withMetadata()/.keepMetadata(): sharp writes no EXIF/XMP/IPTC/ICC by default.
  switch (outFormat) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 85 });
      break;
    case 'gif':
      pipeline = pipeline.gif();
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

  // Belt and braces: refuse to publish if any metadata block survived.
  const check = await sharp(data, { animated }).metadata();
  if (check.exif || check.xmp || check.iptc) {
    throw new Error('Image metadata was not fully removed; refusing to store it');
  }

  const hash = createHash('sha256').update(data).digest('hex').slice(0, 32);
  const ext = outFormat === 'jpeg' ? 'jpg' : outFormat;
  return {
    buffer: data,
    contentType: MIME[outFormat],
    filename: `${hash}.${ext}`,
    width: info.width,
    height: animated && info.pageHeight ? info.pageHeight : info.height,
    removed,
  };
}
