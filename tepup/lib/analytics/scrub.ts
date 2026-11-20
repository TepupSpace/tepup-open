/**
 * Làm sạch thông báo lỗi trước khi gửi: thông báo lỗi có thể vô tình chứa URL có
 * query, email, số điện thoại hay đoạn chữ người học vừa gõ. Chỉ giữ phần chung.
 */
export function scrubErrorMessage(raw: unknown): string {
  let s = typeof raw === 'string' ? raw : raw instanceof Error ? raw.message : String(raw ?? '');
  s = s
    // URL: giữ host + path, bỏ query và fragment
    .replace(/\b(https?:\/\/[^\s?#"'<>]+)[?#][^\s"'<>]*/gi, '$1')
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    // Chuỗi số dài (số điện thoại, mã định danh)
    .replace(/\d[\d\s.-]{6,}\d/g, '[số]')
    // Đoạn trong ngoặc kép thường là dữ liệu, không phải loại lỗi
    .replace(/"[^"]{20,}"/g, '"…"')
    .replace(/\s+/g, ' ')
    .trim();
  return s.length > 200 ? `${s.slice(0, 199)}…` : s;
}

export function scrubErrorName(raw: unknown): string {
  const name = raw instanceof Error ? raw.name : typeof raw === 'string' ? 'Error' : 'Unknown';
  return /^[A-Za-z][\w.]{0,59}$/.test(name) ? name : 'Error';
}

export function safeDigest(raw: unknown): string | undefined {
  return typeof raw === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(raw) ? raw : undefined;
}
