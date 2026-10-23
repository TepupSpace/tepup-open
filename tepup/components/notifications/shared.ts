/** Fired on `window` after notifications are marked read, so the bell refreshes its count. */
export const NOTIFICATIONS_CHANGED_EVENT = 'tepup:notifications-changed';

export function announceNotificationsChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
const absolute = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

/** "3 phút trước", "hôm qua"…; older than a week falls back to the date. */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return 'vừa xong';
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), 'day');
  return absolute.format(new Date(iso));
}

export function absoluteTime(iso: string): string {
  return absolute.format(new Date(iso));
}
