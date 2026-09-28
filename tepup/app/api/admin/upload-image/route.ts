import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getSupabaseAdmin, IMAGES_BUCKET } from '@/lib/supabase-storage';
import { IMAGE_LIMITS, ImageRejectedError, sanitizeImage } from '@/lib/security/image-sanitize';
import { MEDIA_MAX_BYTES, contentHashName, detectMedia } from '@/lib/security/media-type';

const FETCH_TIMEOUT_MS = 15_000;

function toWikimediaThumbnailUrl(src: string, width = 800): string {
  const match = src.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/([^/]+)\/([^/]+)\/(.+)$/
  );
  if (!match) return src;
  const [, h1, h2, filename] = match;
  if (!filename.toLowerCase().endsWith('.svg')) return src;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${h1}/${h2}/${filename}/${width}px-${filename}.png`;
}

/** True for a URL that already points at a public object in our own bucket. */
function isOwnStorageUrl(url: URL): boolean {
  if (!process.env.SUPABASE_URL) return false;
  const own = new URL(process.env.SUPABASE_URL);
  return (
    url.protocol === 'https:' &&
    url.host === own.host &&
    url.pathname.startsWith(`/storage/v1/object/public/${IMAGES_BUCKET}/`)
  );
}

/** Only fetch from public https hosts: no IP literals, localhost or internal names. */
function isFetchableUrl(url: URL): boolean {
  if (url.protocol !== 'https:' || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) return false;
  if (/^[\d.]+$/.test(host) || host.includes(':') || host.startsWith('[')) return false; // IPv4/IPv6 literal
  return host.includes('.');
}

/** Download at most IMAGE_LIMITS.maxBytes, with a timeout. */
async function fetchImage(url: string): Promise<Buffer> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': 'Tepup/1.0 (https://tepup.space; admin image upload) Node.js' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') throw new ImageRejectedError('Tải ảnh quá lâu');
    throw new ImageRejectedError('Không tải được ảnh từ đường dẫn này');
  }
  if (!response.ok || !response.body) {
    throw new ImageRejectedError(`Không tải được ảnh (${response.status})`);
  }
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > IMAGE_LIMITS.maxBytes) throw new ImageRejectedError('Ảnh quá lớn');

  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > IMAGE_LIMITS.maxBytes) {
      await reader.cancel();
      throw new ImageRejectedError('Ảnh quá lớn');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contentType = request.headers.get('content-type') || '';

  try {
    let input: Buffer;

    if (contentType.includes('multipart/form-data')) {
      // File upload (drag & drop). The client's file name and type are ignored.
      const formData = await request.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 });
      if (file.size > MEDIA_MAX_BYTES) throw new ImageRejectedError('Tệp quá lớn (tối đa 50 MB)');
      input = Buffer.from(await file.arrayBuffer());
    } else {
      // URL upload (paste URL → fetch → sanitise → store)
      const body = (await request.json().catch(() => ({}))) as { url?: unknown };
      if (typeof body.url !== 'string' || !body.url) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 });
      }
      let url: URL;
      try {
        url = new URL(body.url);
      } catch {
        return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 });
      }

      // Already in our bucket: nothing to do.
      if (isOwnStorageUrl(url)) return NextResponse.json({ publicUrl: url.toString() });

      if (!isFetchableUrl(url)) {
        return NextResponse.json({ error: 'Chỉ nhận đường dẫn https tới máy chủ công khai' }, { status: 400 });
      }
      input = await fetchImage(toWikimediaThumbnailUrl(url.toString()));
    }

    const supabase = getSupabaseAdmin();
    // Content-addressed names: re-uploading the same file maps to the same object, the
    // original file name is never stored, and nobody can overwrite another file by name.
    const store = async (name: string, buf: Buffer, type: string) => {
      const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(name, buf, { contentType: type, upsert: true });
      if (error) throw new Error(`storage: ${error.message}`);
      return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(name).data.publicUrl;
    };

    // Video / audio / PDF for media and file blocks: type checked from the bytes,
    // renamed, but NOT metadata-stripped (see lib/security/media-type.ts).
    const media = detectMedia(input);
    if (media) {
      if (input.length > MEDIA_MAX_BYTES) throw new ImageRejectedError('Tệp quá lớn (tối đa 50 MB)');
      const publicUrl = await store(contentHashName(input, media.ext), input, media.contentType);
      return NextResponse.json({ publicUrl, metadataRemoved: false });
    }

    // Images: strips EXIF/GPS/XMP/IPTC, verifies the real format, re-encodes.
    const image = await sanitizeImage(input);
    const publicUrl = await store(image.filename, image.buffer, image.contentType);
    return NextResponse.json({
      publicUrl,
      width: image.width,
      height: image.height,
      // Lets the editor tell the author their photo's location data was removed.
      metadataRemoved: image.removed,
    });
  } catch (err) {
    if (err instanceof ImageRejectedError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      return NextResponse.json({ error: 'Tải ảnh quá lâu' }, { status: 400 });
    }
    console.error('Image upload failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Không xử lý được ảnh' }, { status: 500 });
  }
}
