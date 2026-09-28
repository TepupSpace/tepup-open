'use client';

/**
 * Nhớ xem trang trước đó trong app là trang nào.
 *
 * App Router điều hướng bằng `pushState`, nên `document.referrer` đứng yên ở giá
 * trị của lần tải trang cứng đầu tiên — không dùng để biết "vừa từ đâu tới" được.
 * Trạng thái ở đây sống trong scope module: còn khi điều hướng mềm, CHẾT khi tải
 * lại trang. Đó đúng là ngữ nghĩa cần: mở thẳng link hoặc F5 thì coi như không có
 * đường lùi trong app.
 */

let prevPath: string | null = null;
let currentPath: string | null = null;

export function recordPath(path: string) {
  // StrictMode chạy effect hai lần ở dev; không chặn thì `prevPath` bị ghi đè
  // bằng chính trang hiện tại.
  if (path === currentPath) return;
  prevPath = currentPath;
  currentPath = path;
}

export function getPreviousPath(): string | null {
  return prevPath;
}

/**
 * Là trang player (bài học/chương truyện) hay không?
 *
 * Player nằm sâu hơn đúng một segment so với trang dẫn vào nó:
 *   /courses/<course>            trang khoá học
 *   /courses/<course>/<lesson>   player
 *   /story/<char>/<story>            trang truyện
 *   /story/<char>/<story>/<chapter>  player
 */
export function isPlayerPath(url: string): boolean {
  let pathname: string;
  try {
    pathname = new URL(url, 'http://localhost').pathname;
  } catch {
    return false;
  }
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'courses') return parts.length === 3;
  if (parts[0] === 'story') return parts.length === 4;
  return false;
}
