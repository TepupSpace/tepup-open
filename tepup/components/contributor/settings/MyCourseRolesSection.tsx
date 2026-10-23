'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/components/ui/AppLink';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';
import { COURSE_ROLE_LABEL, DISCLOSURE_LABEL } from '@/lib/contribution-labels';

type Role = 'COURSE_LEAD' | 'TRUSTED_REVIEWER';
type Disclosure = 'NONE' | 'ANONYMOUS' | 'CREDENTIAL' | 'FULL';

interface MyRole {
  courseId: string;
  courseName: string;
  courseActive: boolean;
  role: Role;
  disclosure: Disclosure | null;
  createdAt: string;
}

/**
 * Settings: the user's course roles, with "Rời vai trò" (step down) and, for trusted
 * reviewers, a per-course override of what learners see (proposal §6.8, §6.14a).
 * Renders nothing for users without course roles.
 */
export default function MyCourseRolesSection() {
  const [roles, setRoles] = useState<MyRole[] | null>(null);
  const [profileDisclosure, setProfileDisclosure] = useState<Disclosure>('NONE');
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState<MyRole | null>(null);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/user/course-roles', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRoles(data.roles);
      setProfileDisclosure(data.profileDisclosure);
      setLoadError('');
    } catch {
      setLoadError('Không tải được vai trò trong khóa học.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setOverride = async (r: MyRole, value: string) => {
    setError('');
    setStatus('');
    const disclosure = value === '' ? null : (value as Disclosure);
    try {
      const res = await fetch(`/api/user/course-roles/${encodeURIComponent(r.courseId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disclosure }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không lưu được.');
      setRoles((rs) => rs?.map((x) => (x.courseId === r.courseId ? { ...x, disclosure } : x)) ?? rs);
      setStatus(`Đã lưu cách hiển thị cho khóa “${r.courseName}”. Trang khóa học cập nhật trong khoảng 10 phút.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không lưu được.');
    }
  };

  const stepDown = async () => {
    if (!leaving || leaveBusy) return;
    setLeaveBusy(true);
    setLeaveError('');
    try {
      const res = await fetch(`/api/user/course-roles/${encodeURIComponent(leaving.courseId)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không rời được vai trò.');
      setStatus(`Bạn đã rời vai trò ${COURSE_ROLE_LABEL[leaving.role].toLowerCase()} ở khóa “${leaving.courseName}”.`);
      // Reload first, then close: the dialog returns focus after the row (and its
      // "Rời vai trò" button) is gone, so it lands on the heading or the status instead of
      // on a button that a later reload would remove.
      await load();
      setLeaving(null);
    } catch (e) {
      setLeaveError(e instanceof Error ? e.message : 'Không rời được vai trò.');
    } finally {
      setLeaveBusy(false);
    }
  };

  if (loadError) {
    return (
      <p id="my-course-roles-status" role="alert" tabIndex={-1} className="text-sm text-red-700">
        {loadError}
      </p>
    );
  }
  if (!roles || roles.length === 0) {
    // Keep the live region mounted so a "you stepped down" message is still read.
    return (
      <p
        id="my-course-roles-status"
        role="status"
        tabIndex={-1}
        className={status ? 'text-sm text-green-800' : 'sr-only'}
      >
        {status}
      </p>
    );
  }

  return (
    <section aria-labelledby="my-course-roles-heading" className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
      <h2 id="my-course-roles-heading" tabIndex={-1} className="text-lg font-semibold text-gray-900 mb-1">
        Vai trò trong khóa học
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Quản trị viên giao các vai trò này. Bạn có thể rời vai trò bất cứ lúc nào; muốn nhận lại thì liên hệ quản trị viên.
      </p>

      <p role="status" className={status ? 'mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800' : 'sr-only'}>
        {status}
      </p>
      <p role="alert" className={error ? 'mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700' : 'sr-only'}>
        {error}
      </p>

      <ul className="divide-y divide-gray-100">
        {roles.map((r) => {
          const selectId = `disclosure-${r.courseId}`;
          return (
            <li key={r.courseId} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/contributor/maintain/${r.courseId}`} className="font-medium text-gray-900 underline-offset-2 hover:underline">
                    {r.courseName}
                  </Link>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {COURSE_ROLE_LABEL[r.role]} · từ {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    {!r.courseActive && ' · khóa đang ẩn'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLeaveError('');
                    setLeaving(r);
                  }}
                  className="rounded-lg border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                >
                  Rời vai trò<span className="sr-only"> ở khóa {r.courseName}</span>
                </button>
              </div>
              {r.role === 'TRUSTED_REVIEWER' && (
                <div className="mt-3">
                  <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
                    Người học thấy gì về bạn ở khóa này
                  </label>
                  <select
                    id={selectId}
                    value={r.disclosure ?? ''}
                    onChange={(e) => setOverride(r, e.target.value)}
                    aria-describedby={`${selectId}-hint`}
                    className="w-full max-w-sm rounded-lg border border-gray-500 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
                  >
                    <option value="">Theo hồ sơ của bạn ({DISCLOSURE_LABEL[profileDisclosure]})</option>
                    {(['NONE', 'ANONYMOUS', 'CREDENTIAL', 'FULL'] as const).map((d) => (
                      <option key={d} value={d}>
                        {DISCLOSURE_LABEL[d]}
                      </option>
                    ))}
                  </select>
                  <p id={`${selectId}-hint`} className="mt-1 text-xs text-gray-600">
                    Các mức được giải thích ở phần &ldquo;Hồ sơ người duyệt tin cậy&rdquo; bên dưới. Chuyên môn và tên chỉ hiện
                    sau khi quản trị viên xác minh.
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {leaving && (
        <ConfirmDialog
          title="Rời vai trò trong khóa học?"
          confirmLabel="Rời vai trò"
          busyLabel="Đang rời…"
          busy={leaveBusy}
          error={leaveError}
          onConfirm={stepDown}
          onCancel={() => setLeaving(null)}
          fallbackFocus={() =>
            // No roles left: the section (and its heading) is gone; the status text remains.
            document.getElementById('my-course-roles-heading') ?? document.getElementById('my-course-roles-status')
          }
        >
          Bạn sẽ không còn là {COURSE_ROLE_LABEL[leaving.role].toLowerCase()} của khóa &ldquo;{leaving.courseName}&rdquo;
          {leaving.role === 'COURSE_LEAD'
            ? ': không duyệt đề xuất, không xử lý góp ý, không hiện/ẩn bài của khóa này nữa.'
            : ': không duyệt đề xuất và không đưa ý kiến cho khóa này nữa, và tên bạn không còn trong danh sách người thẩm định.'}{' '}
          Muốn nhận lại vai trò, bạn cần quản trị viên giao lại.
        </ConfirmDialog>
      )}
    </section>
  );
}
