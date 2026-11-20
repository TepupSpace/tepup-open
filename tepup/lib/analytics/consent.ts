/**
 * Công tắc "Đóng góp số liệu ẩn danh" (mặc định bật) + Global Privacy Control.
 * Tắt: không gửi event có mã, chỉ còn bộ đếm tổng và lỗi (không mã). Xem /du-lieu.
 */
export const TRACKING_OFF_KEY = 'tepup_analytics_off';
export const TRACKING_PREF_EVENT = 'tepup_analytics_pref';

export function hasGlobalPrivacyControl(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

export function isSwitchedOff(): boolean {
  try {
    return window.localStorage.getItem(TRACKING_OFF_KEY) === '1';
  } catch {
    return false;
  }
}

export function isTrackingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return !hasGlobalPrivacyControl() && !isSwitchedOff();
}

export function setTrackingSwitchedOff(off: boolean): void {
  try {
    if (off) window.localStorage.setItem(TRACKING_OFF_KEY, '1');
    else window.localStorage.removeItem(TRACKING_OFF_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(TRACKING_PREF_EVENT));
}
