'use client';

import { useEffect, useRef, useState } from 'react';
import Link from '@/components/ui/AppLink';
import { publicCredit } from '@/lib/credit-display';
import { LICENCE_CHECKBOX_LABEL, LICENCE_SUMMARY } from '@/lib/licence';

/**
 * Settings: public credit mode (NAME / PSEUDONYM) with a preview (proposal §6.12), and the
 * content licence consent for accounts that have none yet (§6.11).
 */

type CreditMode = 'NAME' | 'PSEUDONYM';

interface Settings {
  username: string | null;
  role: string;
  creditMode: CreditMode;
  publicHandle: string;
  licenceVersion: string | null;
  licenceAcceptedAt: string | null;
}

const OPTIONS: { value: CreditMode; label: string; hint: string }[] = [
  {
    value: 'PSEUDONYM',
    label: 'Bút danh ngẫu nhiên (mặc định)',
    hint: 'Người học không biết tài khoản nào đứng sau bút danh này.',
  },
  {
    value: 'NAME',
    label: 'Tên tài khoản',
    hint: 'Người học thấy tên tài khoản của bạn trên trang khoá học.',
  },
];

export default function CreditSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState<'credit' | 'licence' | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  // Accepting the licence removes its block (and the pressed "Đồng ý"): focus moves to the
  // success message once it has rendered.
  const statusRef = useRef<HTMLParagraphElement>(null);
  const focusStatus = useRef(false);
  useEffect(() => {
    if (!focusStatus.current || !status) return;
    focusStatus.current = false;
    statusRef.current?.focus();
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/settings')
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = (await res.json()) as Settings;
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Không tải được cài đặt ghi công.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (body: { creditMode?: CreditMode; acceptLicence?: true }, kind: 'credit' | 'licence') => {
    if (saving || !settings) return;
    const previous = settings;
    // Optimistic: the radio moves at once; it moves back if the save fails.
    if (body.creditMode) setSettings({ ...settings, creditMode: body.creditMode });
    setSaving(kind);
    setError('');
    setStatus('');
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSettings(previous);
        setError(data?.error || 'Không lưu được. Vui lòng thử lại.');
        return;
      }
      setSettings(data as Settings);
      if (kind === 'licence') focusStatus.current = true;
      setStatus(
        kind === 'licence'
          ? 'Đã ghi nhận bạn đồng ý giấy phép. Bạn có thể gửi đóng góp.'
          : 'Đã lưu cách ghi công. Trang khoá học cập nhật trong khoảng 10 phút.'
      );
    } catch {
      setSettings(previous);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setSaving(null);
    }
  };

  const preview = (mode: CreditMode) =>
    settings
      ? publicCredit({
          username: settings.username,
          creditMode: mode,
          publicHandle: settings.publicHandle,
          deletedAt: null,
        })
      : '';

  return (
    <section aria-labelledby="credit-settings-heading" className="bg-white rounded-xl border border-gray-100 p-6 max-w-lg">
      <h2 id="credit-settings-heading" className="text-lg font-semibold text-gray-900 mb-2">
        Ghi công công khai
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Trang mỗi khoá học có mục &ldquo;Tác giả và người đóng góp&rdquo;. Chọn cách tên bạn hiện ở đó. Bạn có thể
        đổi bất cứ lúc nào.
      </p>

      <div role="alert" className="empty:hidden mb-4">
        {(error || loadError) && (
          <p className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error || loadError}</p>
        )}
      </div>
      <div role="status" className="empty:hidden mb-4">
        {status && (
          <p
            ref={statusRef}
            tabIndex={-1}
            className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            {status}
          </p>
        )}
      </div>

      {!settings && !loadError && <p className="text-sm text-gray-600">Đang tải…</p>}

      {settings && (
        <>
          {!settings.licenceVersion && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              <h3 className="font-semibold mb-2">Giấy phép nội dung</h3>
              <p className="mb-2">Bạn cần đồng ý giấy phép trước khi gửi đóng góp đi duyệt.</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                {LICENCE_SUMMARY.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="mb-3">
                <Link href="/contributor-guide" className="underline hover:text-amber-950">
                  Đọc giải thích về giấy phép và cách ghi công
                </Link>
              </p>
              <p className="mb-3 font-medium">{LICENCE_CHECKBOX_LABEL}.</p>
              <button
                type="button"
                onClick={() => save({ acceptLicence: true }, 'licence')}
                aria-disabled={saving !== null || undefined}
                className="px-4 py-2 bg-teal-700 text-white rounded-xl text-sm font-medium hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 aria-disabled:opacity-60 aria-disabled:cursor-wait"
              >
                {saving === 'licence' ? 'Đang lưu…' : 'Đồng ý'}
              </button>
            </div>
          )}

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">Người học thấy bạn là</legend>
            <div className="space-y-3">
              {OPTIONS.map((opt) => {
                const id = `credit-mode-${opt.value}`;
                return (
                  <div key={opt.value} className="flex items-start gap-3">
                    <input
                      id={id}
                      type="radio"
                      name="credit-mode"
                      value={opt.value}
                      checked={settings.creditMode === opt.value}
                      onChange={() => save({ creditMode: opt.value }, 'credit')}
                      aria-describedby={`${id}-hint`}
                      className="mt-1 h-4 w-4 accent-teal-700"
                    />
                    <div>
                      <label htmlFor={id} className="text-sm font-medium text-gray-900">
                        {opt.label}
                      </label>
                      <p id={`${id}-hint`} className="text-xs text-gray-600">
                        Hiện là: <span className="font-medium text-gray-800">{preview(opt.value)}</span>.{' '}
                        {opt.hint}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-900">
            <p>
              Xem trước — người học đang thấy: <strong>{preview(settings.creditMode)}</strong>
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Bút danh không bao giờ đổi và không suy ra từ tên tài khoản. Nếu xóa tài khoản, đóng góp của bạn luôn
            được ghi dưới bút danh.
          </p>
        </>
      )}
    </section>
  );
}
