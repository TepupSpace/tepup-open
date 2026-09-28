import { createHash } from 'crypto';

/**
 * Non-image uploads (video, audio, PDF) for the editor's media/file blocks.
 *
 * The type is identified from the file's bytes, never from the client's Content-Type or
 * file name, and the stored name is a content hash, so the original file name is dropped.
 *
 * LIMITATION: unlike images (lib/security/image-sanitize.ts), these files are stored
 * as-is. Phone videos can contain GPS location, and PDFs can contain the author's name.
 * Removing that needs ffmpeg or a PDF rewriter, which aren't available here. The upload
 * response reports `metadataRemoved: false` so the editor can warn the author.
 */

export const MEDIA_MAX_BYTES = 50 * 1024 * 1024; // Supabase Free per-file limit

export interface DetectedMedia {
  contentType: string;
  ext: string;
}

function ascii(buf: Buffer, start: number, end: number): string {
  return buf.subarray(start, end).toString('latin1');
}

/** Returns the media type for allowed video/audio/PDF bytes, or null. */
export function detectMedia(buf: Buffer): DetectedMedia | null {
  if (buf.length < 12) return null;

  // ISO base media (MP4 / MOV / M4A): "ftyp" at offset 4, brand after it.
  if (ascii(buf, 4, 8) === 'ftyp') {
    const brand = ascii(buf, 8, 12);
    if (brand === 'M4A ' || brand === 'M4B ') return { contentType: 'audio/mp4', ext: 'm4a' };
    if (brand === 'qt  ') return { contentType: 'video/quicktime', ext: 'mov' };
    // Don't let HEIC/AVIF stills in through the video path.
    if (/^(heic|heix|hevc|hevx|mif1|msf1|avif|avis)$/.test(brand)) return null;
    return { contentType: 'video/mp4', ext: 'mp4' };
  }
  // WebM / Matroska (EBML header)
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) {
    return { contentType: 'video/webm', ext: 'webm' };
  }
  // MP3: ID3 tag or MPEG frame sync
  if (ascii(buf, 0, 3) === 'ID3' || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) {
    return { contentType: 'audio/mpeg', ext: 'mp3' };
  }
  // WAV
  if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WAVE') return { contentType: 'audio/wav', ext: 'wav' };
  // Ogg (Vorbis/Opus)
  if (ascii(buf, 0, 4) === 'OggS') return { contentType: 'audio/ogg', ext: 'ogg' };
  // PDF
  if (ascii(buf, 0, 5) === '%PDF-') return { contentType: 'application/pdf', ext: 'pdf' };

  return null;
}

export function contentHashName(buf: Buffer, ext: string): string {
  return `${createHash('sha256').update(buf).digest('hex').slice(0, 32)}.${ext}`;
}
