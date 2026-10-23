'use client';

import { useEffect, useState } from 'react';
import { Save, ShieldCheck, AlertTriangle } from 'lucide-react';

type Disclosure = 'NONE' | 'ANONYMOUS' | 'CREDENTIAL' | 'FULL';

interface Profile {
  publicName: string | null;
  credential: string | null;
  affiliation: string | null;
  disclosure: Disclosure;
  verifiedAt: string | null;
}

/** The four levels (proposal §6.14a), with what learners would see. */
const LEVELS: { value: Disclosure; title: string; shows: string; note: string }[] = [
  {
    value: 'NONE',
    title: 'Không hiển thị (mặc định)',
    shows: 'Người học không biết có người duyệt.',
    note: 'Không có rủi ro cho bạn, nhưng người học không biết bài đã được kiểm tra.',
  },
  {
    value: 'ANONYMOUS',
    title: 'Ẩn danh',
    shows: '“Bài này đã được người duyệt tin cậy kiểm tra”.',
    note: 'Cho người học biết bài đã được kiểm tra mà không lộ bạn là ai.',
  },
  {
    value: 'CREDENTIAL',
    title: 'Chuyên môn, không tên',
    shows: 'Ví dụ: “Đã được một luật sư (đã xác minh) kiểm tra”.',
    note: 'Đáng tin hơn mà không nêu tên. Lưu ý: chuyên môn quá hẹp vẫn có thể giúp người khác đoán ra bạn.',
  },
  {
    value: 'FULL',
    title: 'Tên và chuyên môn',
    shows: 'Ví dụ: “Kiểm tra bởi TS. Nguyễn Văn A, luật sư”.',
    note: 'Đáng tin nhất, nhưng tên bạn hiện công khai, kể cả với chủ đề nhạy cảm.',
  },
];

const inputClass =
  'w-full rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700';

/**
 * Settings: a trusted reviewer's public details and how learners see them (proposal §6.14a).
 * Shown only to users holding at least one TRUSTED_REVIEWER grant (the API says so).
 */
export default function ReviewerProfileSection() {
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [publicName, setPublicName] = useState('');
  const [credential, setCredential] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [disclosure, setDisclosure] = useState<Disclosure>('NONE');
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [saved, setSaved] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const apply = (p: Profile | null) => {
    setPublicName(p?.publicName ?? '');
    setCredential(p?.credential ?? '');
    setAffiliation(p?.affiliation ?? '');
    setDisclosure(p?.disclosure ?? 'NONE');
    setVerifiedAt(p?.verifiedAt ?? null);
    setSaved(p);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/user/reviewer-profile', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        setEligible(!!data.eligible);
        apply(data.profile);
      } catch {
        if (!cancelled) setEligible(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!eligible) return null;

  const identityChanged =
    !!saved &&
    ((saved.publicName ?? '') !== publicName.trim() ||
      (saved.credential ?? '') !== credential.trim() ||
      (saved.affiliation ?? '') !== affiliation.trim());

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setStatus('');
    try {
      const res = await fetch('/api/user/reviewer-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicName, credential, affiliation, disclosure }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không lưu được.');
      apply(data.profile);
      setStatus(
        data.verificationCleared
          ? 'Đã lưu. Vì bạn đổi thông tin đã xác minh, quản trị viên cần xác minh lại; trong lúc chờ, người học chỉ thấy mức ẩn danh.'
          : 'Đã lưu. Trang khóa học cập nhật trong khoảng 10 phút.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lưu được.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="reviewer-profile-heading" className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
      <h2 id="reviewer-profile-heading" className="text-lg font-semibold text-gray-900 mb-1">
        Hồ sơ người duyệt tin cậy
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Bạn tự chọn người học thấy gì về việc bạn duyệt nội dung. Mặc định họ không thấy gì. Bạn có thể đổi riêng cho
        từng khóa ở phần &ldquo;Vai trò trong khóa học&rdquo;.
      </p>

      <div
        className={`mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
          verifiedAt ? 'border-green-200 bg-green-50 text-green-900' : 'border-gray-200 bg-gray-50 text-gray-800'
        }`}
      >
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          {verifiedAt ? (
            <>
              <strong>Đã xác minh</strong> ngày {new Date(verifiedAt).toLocaleDateString('vi-VN')}. Mức &ldquo;Chuyên
              môn&rdquo; và &ldquo;Tên và chuyên môn&rdquo; có thể hiển thị.
            </>
          ) : (
            <>
              <strong>Chưa xác minh.</strong> Quản trị viên cần xác minh chuyên môn của bạn (ví dụ gặp trực tiếp, xem bằng
              cấp) trước khi chuyên môn hoặc tên hiện ra. Trong lúc chờ, người học thấy nhiều nhất là mức ẩn danh.
            </>
          )}
        </p>
      </div>

      <p role="status" className={status ? 'mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800' : 'sr-only'}>
        {status}
      </p>
      <p role="alert" className={error ? 'mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' : 'sr-only'}>
        {error}
      </p>

      <form onSubmit={save} className="space-y-4">
        <div>
          <label htmlFor="rp-credential" className="block text-sm font-medium text-gray-700 mb-1">
            Chuyên môn
          </label>
          <input
            id="rp-credential"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            maxLength={150}
            placeholder="Ví dụ: Luật sư, Tiến sĩ kinh tế học"
            aria-describedby="rp-credential-hint"
            className={inputClass}
          />
          <p id="rp-credential-hint" className="mt-1 text-xs text-gray-600">
            Hiện ở mức &ldquo;Chuyên môn&rdquo; và &ldquo;Tên và chuyên môn&rdquo;, sau khi được xác minh.
          </p>
        </div>
        <div>
          <label htmlFor="rp-name" className="block text-sm font-medium text-gray-700 mb-1">
            Tên công khai
          </label>
          <input
            id="rp-name"
            value={publicName}
            onChange={(e) => setPublicName(e.target.value)}
            maxLength={100}
            placeholder="Ví dụ: TS. Nguyễn Văn A"
            aria-describedby="rp-name-hint"
            className={inputClass}
          />
          <p id="rp-name-hint" className="mt-1 text-xs text-gray-600">
            Bạn tự gõ; không lấy từ tên đăng nhập. Chỉ hiện ở mức &ldquo;Tên và chuyên môn&rdquo;.
          </p>
        </div>
        <div>
          <label htmlFor="rp-affiliation" className="block text-sm font-medium text-gray-700 mb-1">
            Nơi công tác (không bắt buộc)
          </label>
          <input
            id="rp-affiliation"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            maxLength={150}
            aria-describedby="rp-affiliation-hint"
            className={inputClass}
          />
          <p id="rp-affiliation-hint" className="mt-1 text-xs text-gray-600">
            Chỉ hiện ở mức &ldquo;Tên và chuyên môn&rdquo;.
          </p>
        </div>

        {verifiedAt && identityChanged && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Bạn đang đổi thông tin đã xác minh. Khi lưu, trạng thái xác minh bị gỡ và quản trị viên cần xác minh lại.</span>
          </p>
        )}

        <fieldset>
          <legend className="text-sm font-medium text-gray-700 mb-2">Người học thấy gì (mặc định cho mọi khóa)</legend>
          <div className="space-y-2">
            {LEVELS.map((l) => {
              const id = `rp-level-${l.value}`;
              return (
                <div key={l.value} className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                  <input
                    id={id}
                    type="radio"
                    name="rp-disclosure"
                    value={l.value}
                    checked={disclosure === l.value}
                    onChange={() => setDisclosure(l.value)}
                    aria-describedby={`${id}-desc`}
                    className="mt-1 h-4 w-4 accent-teal-700"
                  />
                  <div>
                    <label htmlFor={id} className="text-sm font-medium text-gray-900">
                      {l.title}
                    </label>
                    <p id={`${id}-desc`} className="text-xs text-gray-600">
                      Người học thấy: {l.shows} {l.note}
                      {(l.value === 'CREDENTIAL' || l.value === 'FULL') && ' Chỉ hiện sau khi quản trị viên xác minh.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>

        {disclosure === 'FULL' && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Mức này hiện <strong>tên của bạn công khai</strong> trên trang khóa học, cho bất kỳ ai.
            </span>
          </p>
        )}
        <p className="text-xs text-gray-600">
          Bạn có thể rút lại bất cứ lúc nào; trang TepUp cập nhật trong khoảng 10 phút. Nhưng những bản sao người khác đã
          tạo (bản lưu trữ, trang sao chép, ảnh chụp màn hình) thì không thu hồi được.
        </p>

        <button
          type="submit"
          aria-disabled={busy || undefined}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 aria-disabled:cursor-wait aria-disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {busy ? 'Đang lưu…' : 'Lưu hồ sơ'}
        </button>
      </form>
    </section>
  );
}
