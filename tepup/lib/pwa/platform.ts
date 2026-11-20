'use client';

/**
 * Nhận biết thiết bị cho hướng dẫn cài Tépup (bảng Cài đặt) và giữ lại sự kiện
 * `beforeinstallprompt` của Chromium.
 *
 * Sự kiện đó chỉ bắn MỘT lần, rất sớm sau khi tải trang. Nghe ở đây, lúc module
 * được nạp (header nạp nó ngay), thì bảng Cài đặt mở muộn bao lâu vẫn dùng được
 * nút "Cài đặt ngay".
 */

export type Platform = 'ios' | 'android' | 'other';

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  // iPadOS 13+ tự nhận là Macintosh: phân biệt bằng màn hình cảm ứng.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

/** Trình duyệt nhúng trong ứng dụng khác (Facebook, Messenger, Instagram, Zalo, TikTok…): không cài được. */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /FBAN|FBAV|FB_IAB|Messenger|Instagram|Zalo|Line\/|TikTok|musical_ly|BytedanceWebview/i.test(
    navigator.userAgent,
  );
}

/** Đang mở từ biểu tượng trên màn hình chính (đã cài). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Sự kiện riêng của Chromium, chưa có trong định nghĩa kiểu chuẩn. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Chặn thanh mời mặc định; Tépup tự hỏi đúng lúc (nút trong bảng Cài đặt).
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export function subscribeInstallPrompt(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}

/** Gọi hộp thoại cài của Chromium. Trả `true` nếu người dùng đồng ý. */
export async function runInstallPrompt(): Promise<boolean> {
  const ev = deferred;
  if (!ev) return false;
  await ev.prompt();
  const { outcome } = await ev.userChoice;
  deferred = null; // mỗi sự kiện chỉ prompt được một lần
  notify();
  return outcome === 'accepted';
}

// ---------- mở bảng Cài đặt từ chỗ khác (vd. lời mời cài ở /courses) ----------

export const OPEN_SETTINGS_EVENT = 'tepup:open-settings';
export type SettingsSection = 'install' | 'reading';

export function openSettings(section: SettingsSection = 'install'): void {
  window.dispatchEvent(new CustomEvent<SettingsSection>(OPEN_SETTINGS_EVENT, { detail: section }));
}
