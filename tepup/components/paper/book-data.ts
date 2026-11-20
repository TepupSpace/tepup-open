import { isAllowedMediaUrl } from '@/lib/security/safe-url';
import type { CharacterDisplay } from '@/lib/types/content';

/** Một nhân vật trên sổ tem (đã lọc ảnh qua allow-list, chỉ giữ trường cần hiển thị). */
export interface BookCharacter {
  slug: string;
  name: string;
  role: string;
  /** Trích dẫn trên tem, đã có ngoặc kép cong. Rỗng nếu nhân vật chưa có mô tả. */
  quote: string;
  /** Ảnh tem (~262×266). null → ô giấy xám trung tính. */
  photo: string | null;
  /** Ảnh nhỏ cho thẻ câu chuyện. null → ô xám trung tính. */
  thumb: string | null;
}

/** Một câu chuyện trên thẻ giấy ở trang nhân vật. */
export interface BookTopic {
  slug: string;
  title: string;
  teaser: string;
}

function quoteOf(description: string): string {
  const d = description.trim();
  if (!d) return '';
  return /^["“]/.test(d) ? d : `“${d}”`;
}

/**
 * Chuyển dữ liệu DB sang props cho StoryBook. Chạy ở server: URL ảnh không qua
 * `isAllowedMediaUrl` thì bỏ hẳn, trình duyệt không bao giờ tải (lộ IP người học).
 */
export function toBookCharacters(characters: CharacterDisplay[]): BookCharacter[] {
  return characters.map((c) => ({
    slug: c.slug,
    name: c.name,
    role: c.role,
    quote: quoteOf(c.description),
    photo: isAllowedMediaUrl(c.imageUrl) ? c.imageUrl : null,
    thumb: isAllowedMediaUrl(c.avatarUrl) ? c.avatarUrl : null,
  }));
}
