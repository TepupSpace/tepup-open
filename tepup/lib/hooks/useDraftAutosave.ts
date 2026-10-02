'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AutosaveStatus } from '@/lib/types/drafts';

/**
 * Tự lưu nháp cho trình soạn bài học / chương.
 *
 * Lưu sau `debounceMs` kể từ lần sửa cuối, và trong lúc gõ liên tục thì ít nhất
 * mỗi `maxWaitMs` một lần. So sánh bằng JSON.stringify với bản đã lưu gần nhất
 * (hoặc mốc do `resetBaseline` đặt), giống nhau thì không gọi `save`.
 *
 * Không bao giờ chạy hai lần lưu cùng lúc: lần lưu đến hạn khi đang có lần khác
 * chạy sẽ đợi lần đó xong rồi mới lưu giá trị mới nhất. Lưu lỗi thì giữ trạng
 * thái 'error', thử lại sau 15 giây hoặc theo nhịp hẹn giờ của lần sửa kế tiếp,
 * tuỳ cái nào đến trước.
 *
 * Mọi thứ thay đổi theo thời gian nằm trong AutosaveController (không phụ thuộc
 * React); hook chỉ nối nó vào vòng đời component. Hàm `save` và giá trị mới nhất
 * được đọc lúc lưu, nên bên gọi truyền hàm inline cũng không làm hẹn giờ chạy lại.
 */

const RETRY_MS = 15_000;
const FALLBACK_ERROR = 'Không lưu được bản nháp. Vui lòng thử lại.';

interface AutosaveSnapshot {
  status: AutosaveStatus;
  isDirty: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

interface ControllerOptions<T> {
  save: (value: T) => Promise<void>;
  debounceMs: number;
  maxWaitMs: number;
}

type Timer = ReturnType<typeof setTimeout>;

const UNSET = Symbol('unset');

class AutosaveController<T> {
  private options: ControllerOptions<T>;
  private enabled = false;
  private attached = false;
  private listener: ((snapshot: AutosaveSnapshot) => void) | null = null;

  /** Tham chiếu giá trị nhận lần trước, để khỏi stringify lại khi không đổi. */
  private lastInput: T | typeof UNSET = UNSET;
  private latestValue: T | typeof UNSET = UNSET;
  private latestJson: string | null = null;
  /** Bản đã lưu thành công gần nhất hoặc mốc từ resetBaseline. null = chưa có mốc. */
  private savedJson: string | null = null;
  /** Tăng mỗi lần resetBaseline, để bỏ qua kết quả của lần lưu bắt đầu trước đó. */
  private generation = 0;
  private savedSinceBaseline = false;

  private inFlight: Promise<boolean> | null = null;
  private debounceTimer: Timer | null = null;
  private maxWaitTimer: Timer | null = null;
  private retryTimer: Timer | null = null;

  private status: AutosaveStatus = 'idle';
  private error: string | null = null;
  private lastSavedAt: Date | null = null;

  constructor(options: ControllerOptions<T>) {
    this.options = options;
  }

  get isDirty(): boolean {
    return this.savedJson !== null && this.latestJson !== this.savedJson;
  }

  snapshot(): AutosaveSnapshot {
    return {
      status: this.status,
      isDirty: this.isDirty,
      lastSavedAt: this.lastSavedAt,
      error: this.error,
    };
  }

  setOptions(options: ControllerOptions<T>) {
    this.options = options;
  }

  attach(listener: (snapshot: AutosaveSnapshot) => void) {
    this.attached = true;
    this.listener = listener;
    // StrictMode gỡ rồi gắn lại: hẹn lại giờ nếu vẫn còn thay đổi chưa lưu.
    if (this.canSchedule() && this.isDirty && !this.inFlight) this.scheduleAfterChange();
    this.emit();
  }

  detach() {
    this.attached = false;
    this.listener = null;
    this.clearTimers();
  }

  setEnabled(enabled: boolean) {
    if (enabled === this.enabled) return;
    this.enabled = enabled;
    if (!enabled) {
      this.clearTimers();
      return;
    }
    // Bên gọi quên resetBaseline: coi nội dung vừa tải là mốc, đừng lưu nó thành nháp.
    if (this.savedJson === null && this.latestJson !== null) this.savedJson = this.latestJson;
    if (this.isDirty && !this.inFlight) this.scheduleAfterChange();
    this.emit();
  }

  setValue(value: T) {
    if (value === this.lastInput) return;
    this.lastInput = value;
    const json = JSON.stringify(value);
    if (json === this.latestJson) return;
    this.latestValue = value;
    this.latestJson = json;

    if (!this.isDirty) {
      // Sửa rồi hoàn tác về đúng bản đã lưu: không còn gì để lưu.
      this.clearTimers();
      if (!this.inFlight) {
        this.error = null;
        this.status = this.savedSinceBaseline ? 'saved' : 'idle';
      }
    } else {
      // Đang lỗi thì giữ 'error' cho người dùng thấy, tới lần lưu kế tiếp.
      if (!this.inFlight && this.status !== 'error') this.status = 'dirty';
      if (this.canSchedule()) this.scheduleAfterChange();
    }
    this.emit();
  }

  resetBaseline(value: T) {
    const json = JSON.stringify(value);
    this.generation += 1;
    this.savedJson = json;
    this.latestValue = value;
    this.latestJson = json;
    // Buộc lần commit sau so lại với giá trị thật của trình soạn: nếu nó khác
    // `value` (vd. người dùng gõ tiếp trong lúc xuất bản) thì vẫn bị coi là chưa lưu.
    this.lastInput = UNSET;
    this.savedSinceBaseline = false;
    this.clearTimers();
    this.error = null;
    this.status = this.inFlight ? 'saving' : 'idle';
    this.emit();
  }

  /** Lưu ngay. true khi giá trị hiện tại đã nằm trên server (hoặc chẳng có gì để lưu). */
  saveNow(): Promise<boolean> {
    this.clearTimers();
    return this.flush(true);
  }

  private async flush(manual: boolean): Promise<boolean> {
    // Nhiều lời gọi cùng đợi một lần lưu: lời gọi tỉnh dậy đầu tiên bắt đầu lần
    // lưu mới, các lời gọi sau thấy inFlight khác null nên đợi tiếp lần đó.
    while (this.inFlight) await this.inFlight;
    if (!this.isDirty) return true;
    if (!this.enabled) return false;
    // Hẹn giờ tự lưu bị gỡ khi component đã unmount; saveNow thì vẫn được lưu.
    if (!manual && !this.attached) return false;
    return this.startSave();
  }

  private startSave(): Promise<boolean> {
    if (this.latestValue === UNSET || this.latestJson === null) return Promise.resolve(true);
    const value = this.latestValue;
    const json = this.latestJson;
    const generation = this.generation;

    // Lần lưu này đã bao gồm mọi thay đổi tới giờ; thay đổi sau đó tự hẹn giờ mới.
    this.clearTimers();
    this.status = 'saving';
    this.emit();

    const run = async (): Promise<boolean> => {
      let ok: boolean;
      try {
        // Gọi `save` qua một microtask: nếu nó ném lỗi đồng bộ thì `this.inFlight = null`
        // bên dưới vẫn chạy sau phép gán `this.inFlight = run()`, không kẹt mãi.
        await Promise.resolve().then(() => this.options.save(value));
        ok = true;
        if (generation === this.generation) {
          this.savedJson = json;
          this.savedSinceBaseline = true;
          this.lastSavedAt = new Date();
          this.error = null;
        }
      } catch (err) {
        ok = false;
        if (generation === this.generation) {
          this.error = err instanceof Error && err.message ? err.message : FALLBACK_ERROR;
        }
      }
      this.inFlight = null;
      this.afterSave(ok, generation);
      return ok;
    };

    this.inFlight = run();
    return this.inFlight;
  }

  private afterSave(ok: boolean, generation: number) {
    if (generation !== this.generation) {
      // resetBaseline đã chạy trong lúc lưu: kết quả này không còn ý nghĩa.
      this.status = this.isDirty ? 'dirty' : 'idle';
    } else if (!this.isDirty) {
      this.error = null;
      this.status = this.savedSinceBaseline ? 'saved' : 'idle';
    } else if (ok) {
      this.status = 'dirty';
    } else {
      this.status = 'error';
      if (this.canSchedule()) {
        if (this.retryTimer) clearTimeout(this.retryTimer);
        this.retryTimer = setTimeout(() => {
          this.retryTimer = null;
          void this.flush(false);
        }, RETRY_MS);
      }
    }
    // Có thay đổi trong lúc lưu mà không còn hẹn giờ nào chờ (vd. hoàn tác về một
    // bản cũ hơn bản vừa lưu): hẹn lại để không sót.
    if (this.isDirty && this.canSchedule() && !this.hasTimer()) this.scheduleAfterChange();
    this.emit();
  }

  private scheduleAfterChange() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flush(false);
    }, this.options.debounceMs);
    if (!this.maxWaitTimer) {
      this.maxWaitTimer = setTimeout(() => {
        this.maxWaitTimer = null;
        void this.flush(false);
      }, this.options.maxWaitMs);
    }
  }

  private canSchedule() {
    return this.enabled && this.attached;
  }

  private hasTimer() {
    return this.debounceTimer !== null || this.maxWaitTimer !== null || this.retryTimer !== null;
  }

  private clearTimers() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.maxWaitTimer) clearTimeout(this.maxWaitTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.debounceTimer = null;
    this.maxWaitTimer = null;
    this.retryTimer = null;
  }

  private emit() {
    this.listener?.(this.snapshot());
  }
}

export function useDraftAutosave<T>(opts: {
  value: T;
  enabled: boolean;
  save: (value: T) => Promise<void>;
  debounceMs?: number;
  maxWaitMs?: number;
}): {
  status: AutosaveStatus;
  isDirty: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  saveNow: () => Promise<boolean>;
  resetBaseline: (value: T) => void;
} {
  const { value, enabled, save, debounceMs = 3_000, maxWaitMs = 20_000 } = opts;

  const [controller] = useState(
    () => new AutosaveController<T>({ save, debounceMs, maxWaitMs }),
  );
  const [snapshot, setSnapshot] = useState<AutosaveSnapshot>(() => controller.snapshot());

  // Thứ tự effect có chủ ý: gắn listener, rồi nạp giá trị mới nhất, rồi mới bật/tắt
  // (bật lần đầu mà chưa có mốc thì lấy giá trị hiện tại làm mốc).
  useEffect(() => {
    controller.attach(setSnapshot);
    return () => controller.detach();
  }, [controller]);

  // Không có deps: chạy sau mỗi commit. Cùng tham chiếu thì bỏ qua ngay, khác tham
  // chiếu mới stringify — bên gọi nên useMemo `value` nếu nội dung lớn.
  useEffect(() => {
    controller.setOptions({ save, debounceMs, maxWaitMs });
    controller.setValue(value);
  });

  useEffect(() => {
    controller.setEnabled(enabled);
  }, [controller, enabled]);

  const saveNow = useCallback(() => controller.saveNow(), [controller]);
  const resetBaseline = useCallback((next: T) => controller.resetBaseline(next), [controller]);

  return { ...snapshot, saveNow, resetBaseline };
}
