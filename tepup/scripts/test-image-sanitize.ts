/**
 * Checks lib/security/image-sanitize.ts and lib/security/media-type.ts.
 * No network, no DB. Run: npx tsx scripts/test-image-sanitize.ts
 */
import sharp from 'sharp';
import { ImageRejectedError, sanitizeImage, IMAGE_LIMITS } from '../lib/security/image-sanitize';
import { detectMedia } from '../lib/security/media-type';

let failures = 0;
const ok = (cond: boolean, label: string) => {
  console.log(`${cond ? '  ok  ' : ' FAIL '} ${label}`);
  if (!cond) failures++;
};
const rejects = async (p: Promise<unknown>, label: string) => {
  try {
    await p;
    ok(false, `${label} (was accepted)`);
  } catch (e) {
    ok(e instanceof ImageRejectedError, `${label} — ${(e as Error).message}`);
  }
};

const IDENTIFYING = ['Nguyen Van A', 'iPhone 15 Pro', 'SERIAL-12345', 'Ha Noi'];
const containsIdentifying = (buf: Buffer) => IDENTIFYING.some((s) => buf.includes(Buffer.from(s)));

async function main() {
  // A 400×200 photo with camera, owner and GPS EXIF, rotated 90° via orientation 6.
  const base = sharp({ create: { width: 400, height: 200, channels: 3, background: '#3a7' } });
  const exif = {
    IFD0: { Make: 'Apple', Model: 'iPhone 15 Pro', Artist: 'Nguyen Van A', Copyright: 'Nguyen Van A', ImageDescription: 'Ha Noi' },
    IFD2: { BodySerialNumber: 'SERIAL-12345', DateTimeOriginal: '2026:09:28 10:00:00' },
    IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '21/1 1/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '105/1 51/1 0/1' },
  };
  const phoneJpeg = await base.clone().jpeg().withExif(exif).withMetadata({ orientation: 6 }).toBuffer();
  const inMeta = await sharp(phoneJpeg).metadata();
  ok(!!inMeta.exif && containsIdentifying(phoneJpeg), 'fixture: JPEG really carries identifying EXIF');

  const out = await sanitizeImage(phoneJpeg);
  const outMeta = await sharp(out.buffer).metadata();
  ok(!outMeta.exif && !outMeta.xmp && !outMeta.iptc, 'JPEG: no EXIF/XMP/IPTC after sanitising');
  ok(!containsIdentifying(out.buffer), 'JPEG: no identifying strings left in the bytes');
  ok(out.removed.exif && out.removed.gps, 'JPEG: reports EXIF and GPS removed');
  ok(out.width === 200 && out.height === 400, `JPEG: orientation applied to pixels (${out.width}×${out.height})`);
  ok(/^[0-9a-f]{32}\.jpg$/.test(out.filename), `JPEG: content-hash filename (${out.filename})`);
  ok(out.contentType === 'image/jpeg', 'JPEG: content type from bytes');

  // PNG and WebP with EXIF + XMP
  const xmp = Buffer.from('<x:xmpmeta xmlns:x="adobe:ns:meta/"><dc:creator>Nguyen Van A</dc:creator></x:xmpmeta>');
  for (const fmt of ['png', 'webp'] as const) {
    const img = await base.clone()[fmt]().withExif(exif).withXmp(xmp.toString()).toBuffer();
    const r = await sanitizeImage(img);
    const m = await sharp(r.buffer).metadata();
    ok(!m.exif && !m.xmp && !containsIdentifying(r.buffer), `${fmt.toUpperCase()}: EXIF+XMP stripped`);
  }

  // Oversized image is downscaled
  const big = await sharp({ create: { width: 5000, height: 1000, channels: 3, background: '#000' } }).png().toBuffer();
  const bigOut = await sanitizeImage(big);
  ok(bigOut.width === IMAGE_LIMITS.maxDimension, `large image downscaled to ${bigOut.width}px wide`);

  // Animated GIF keeps its frames
  const frames = await sharp({ create: { width: 20, height: 40, channels: 4, background: '#f00' } }).gif().toBuffer();
  const anim = await sharp(frames, { animated: true }).gif().toBuffer();
  const animOut = await sanitizeImage(anim);
  ok(animOut.contentType === 'image/gif', 'GIF: stays GIF');

  // Rejections
  await rejects(sanitizeImage(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="10" height="10"/></svg>')), 'SVG rejected');
  await rejects(sanitizeImage(Buffer.from('<html><script>alert(1)</script></html>')), 'HTML disguised as image rejected');
  await rejects(sanitizeImage(Buffer.alloc(0)), 'empty file rejected');
  await rejects(sanitizeImage(Buffer.alloc(IMAGE_LIMITS.maxBytes + 1)), 'over size limit rejected');
  await rejects(sanitizeImage(phoneJpeg.subarray(0, 200)), 'truncated JPEG rejected');

  // Media detection (video/audio/PDF path)
  const ftyp = (brand: string) => Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftyp' + brand), Buffer.alloc(16)]);
  ok(detectMedia(ftyp('isom'))?.contentType === 'video/mp4', 'MP4 detected from bytes');
  ok(detectMedia(ftyp('qt  '))?.contentType === 'video/quicktime', 'MOV detected');
  ok(detectMedia(ftyp('M4A '))?.contentType === 'audio/mp4', 'M4A detected');
  ok(detectMedia(ftyp('heic')) === null, 'HEIC still NOT accepted through the media path');
  ok(detectMedia(Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj')) ?.contentType === 'application/pdf', 'PDF detected');
  ok(detectMedia(phoneJpeg) === null, 'JPEG is not mistaken for media');
  ok(detectMedia(Buffer.from('<html><body>not media</body></html>')) === null, 'HTML is not media');

  console.log(`\n${failures === 0 ? 'all checks passed' : `${failures} failure(s)`}`);
  process.exit(failures ? 1 : 0);
}

main();
