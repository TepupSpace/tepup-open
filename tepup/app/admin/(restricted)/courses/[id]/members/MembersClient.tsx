'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Ban } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import AdminDialog from '@/app/admin/_components/AdminDialog';
import ConfirmDialog from '@/app/admin/_components/ConfirmDialog';
import { BackLink, FormError, labelClass } from '@/app/admin/_components/form';
import { useAnnouncer } from '@/components/blocks/useAnnouncer';
import { COURSE_ROLE_LABEL, DISCLOSURE_LABEL } from '@/lib/contribution-labels';
import InfoToggle from '@/components/ui/InfoToggle';

type Role = 'COURSE_LEAD' | 'TRUSTED_REVIEWER';
type Disclosure = 'NONE' | 'ANONYMOUS' | 'CREDENTIAL' | 'FULL';

interface Profile {
  publicName: string | null;
  credential: string | null;
  affiliation: string | null;
  disclosure: Disclosure;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationNote: string | null;
  updatedAt: string;
}

interface Member {
  userId: string;
  username: string | null;
  name: string;
  globalRole: string;
  isBanned: boolean;
  deleted: boolean;
  role: Role;
  disclosure: Disclosure | null;
  addedBy: string | null;
  createdAt: string;
  profile: Profile | null;
}

interface Block {
  userId: string;
  name: string;
  reason: string | null;
  blockedBy: string | null;
  createdAt: string;
}

const fieldClass =
  'w-full px-3 py-2 border border-gray-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600';
const smallButton =
  'rounded-lg border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600';
const primaryButton =
  'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 aria-disabled:cursor-wait aria-disabled:opacity-60';

const date = (s: string) => new Date(s).toLocaleDateString('vi-VN');

async function call(url: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Không thực hiện được.');
  return data;
}

/**
 * Admin → Courses → (course) → "Trưởng khóa học và người duyệt" (proposal §6.8, §6.14a, §6.20).
 * Every action is checked and audited by the API; this page only calls it.
 */
export default function MembersClient({ courseId }: { courseId: string }) {
  const base = `/api/admin/courses/${encodeURIComponent(courseId)}`;
  const [course, setCourse] = useState<{ name: string; isActive: boolean } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [message, announce] = useAnnouncer();

  // Add member form
  const [addUsername, setAddUsername] = useState('');
  const [addRole, setAddRole] = useState<Role>('COURSE_LEAD');
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState('');

  // Block form
  const [blockUsername, setBlockUsername] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockBusy, setBlockBusy] = useState(false);
  const [blockError, setBlockError] = useState('');

  // Dialogs
  const [removing, setRemoving] = useState<Member | null>(null);
  const [unblocking, setUnblocking] = useState<Block | null>(null);
  const [verifying, setVerifying] = useState<Member | null>(null);
  const [unverifying, setUnverifying] = useState<Member | null>(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [dialogBusy, setDialogBusy] = useState(false);
  const [dialogError, setDialogError] = useState('');

  const load = useCallback(async () => {
    try {
      const [m, b] = await Promise.all([call(`${base}/members`), call(`${base}/blocks`)]);
      setCourse(m.course as { name: string; isActive: boolean });
      setMembers(m.members as Member[]);
      setBlocks(b.blocks as Block[]);
      setLoadError('');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Không tải được.');
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    load();
  }, [load]);

  const closeDialogs = () => {
    setRemoving(null);
    setUnblocking(null);
    setVerifying(null);
    setUnverifying(null);
    setDialogError('');
    setVerifyNote('');
  };

  /** Runs a dialog action; closes the dialog and reloads on success. */
  const runDialog = async (fn: () => Promise<string>) => {
    if (dialogBusy) return;
    setDialogBusy(true);
    setDialogError('');
    try {
      const text = await fn();
      announce(text);
      // Reload before closing: the dialog then returns focus to a DOM where the opener
      // (e.g. the removed row's "Gỡ") is already gone, so its fallbackFocus is used.
      await load();
      closeDialogs();
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : 'Không thực hiện được.');
    } finally {
      setDialogBusy(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addBusy) return;
    setAddBusy(true);
    setAddError('');
    try {
      await call(`${base}/members`, { method: 'POST', body: JSON.stringify({ username: addUsername, role: addRole }) });
      announce(`Đã thêm ${addUsername.trim()} làm ${COURSE_ROLE_LABEL[addRole].toLowerCase()}.`);
      setAddUsername('');
      await load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Không thêm được.');
    } finally {
      setAddBusy(false);
    }
  };

  const changeRole = async (m: Member, role: Role) => {
    setError('');
    try {
      const data = await call(`${base}/members/${encodeURIComponent(m.userId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      announce(
        `Đã đổi vai trò của ${m.name} thành ${COURSE_ROLE_LABEL[role].toLowerCase()}.` +
          (data.orphaned ? ' Khóa học hiện không còn trưởng khóa học nào.' : '')
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đổi được vai trò.');
    }
  };

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blockBusy) return;
    setBlockBusy(true);
    setBlockError('');
    try {
      const data = await call(`${base}/blocks`, {
        method: 'POST',
        body: JSON.stringify({ username: blockUsername, reason: blockReason }),
      });
      const closed = Number(data.closed ?? 0);
      announce(
        `Đã chặn ${blockUsername.trim()} ở khóa học này.` + (closed ? ` Đã đóng ${closed} đề xuất đang mở của họ.` : '')
      );
      setBlockUsername('');
      setBlockReason('');
      await load();
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : 'Không chặn được.');
    } finally {
      setBlockBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Đang tải thành viên khóa học…" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <BackLink href={`/admin/courses/${courseId}`} label="Quay lại khóa học" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trưởng khóa học và người duyệt</h1>
          {course && (
            <p className="text-gray-600 mt-1">
              {course.name}
              {!course.isActive && ' · đang ẩn'}
            </p>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      <FormError message={loadError || error} />

      {/* ---------------- Members ---------------- */}
      <section aria-labelledby="members-heading" className="mb-10">
        <InfoToggle
          accent="blue"
          label="Giải thích các vai trò"
          storageKey="tepup:help-open:course-members"
          className="mb-4"
          heading={
            <h2 id="members-heading" className="text-lg font-semibold text-gray-900">
              Thành viên
            </h2>
          }
        >
          <p className="text-sm text-gray-700">
            Trưởng khóa học: duyệt đề xuất, xử lý góp ý, hiện/ẩn bài khi khóa đang hiển thị, khôi phục phiên bản. Người duyệt
            tin cậy: duyệt đề xuất và cho ý kiến, không hiện/ẩn bài hay xử lý góp ý. Thay đổi có hiệu lực ngay ở lượt tải
            trang kế tiếp của họ.
          </p>
        </InfoToggle>

        <form onSubmit={addMember} className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Thêm thành viên</h3>
          <FormError message={addError} className="mb-3" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="add-username" className={labelClass}>
                Tên đăng nhập
              </label>
              <input
                id="add-username"
                value={addUsername}
                onChange={(e) => setAddUsername(e.target.value)}
                required
                autoComplete="off"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="add-role" className={labelClass}>
                Vai trò
              </label>
              <select id="add-role" value={addRole} onChange={(e) => setAddRole(e.target.value as Role)} className={fieldClass}>
                <option value="COURSE_LEAD">{COURSE_ROLE_LABEL.COURSE_LEAD}</option>
                <option value="TRUSTED_REVIEWER">{COURSE_ROLE_LABEL.TRUSTED_REVIEWER}</option>
              </select>
            </div>
            <button type="submit" aria-disabled={addBusy || undefined} className={primaryButton}>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {addBusy ? 'Đang thêm…' : 'Thêm'}
            </button>
          </div>
        </form>

        {members.length === 0 ? (
          <p className="text-sm text-gray-600">Khóa học chưa có trưởng khóa học hay người duyệt tin cậy.</p>
        ) : (
          <ul className="space-y-3">
            {members.map((m) => {
              const roleId = `role-${m.userId}`;
              const p = m.profile;
              return (
                <li key={m.userId} className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {m.name}
                        {m.isBanned && <span className="ml-2 text-xs font-normal text-red-700">(đang bị khóa)</span>}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {m.addedBy ? `Thêm bởi ${m.addedBy}` : 'Tự động (tác giả khóa học)'} · {date(m.createdAt)}
                        {m.role === 'TRUSTED_REVIEWER' &&
                          ` · Hiển thị ở khóa này: ${m.disclosure ? DISCLOSURE_LABEL[m.disclosure] : 'theo hồ sơ'}`}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor={roleId} className="sr-only">
                        Vai trò của {m.name}
                      </label>
                      <select
                        id={roleId}
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value as Role)}
                        className="rounded-lg border border-gray-500 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="COURSE_LEAD">{COURSE_ROLE_LABEL.COURSE_LEAD}</option>
                        <option value="TRUSTED_REVIEWER">{COURSE_ROLE_LABEL.TRUSTED_REVIEWER}</option>
                      </select>
                      <button type="button" onClick={() => setRemoving(m)} className={smallButton}>
                        Gỡ<span className="sr-only"> {m.name} khỏi khóa học</span>
                      </button>
                    </div>
                  </div>

                  {m.role === 'TRUSTED_REVIEWER' && (
                    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                      <p className="flex items-center gap-1 font-medium text-gray-900">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        Hồ sơ người duyệt
                      </p>
                      {!p ? (
                        <p className="mt-1 text-gray-600">Người này chưa điền hồ sơ (người học không thấy gì).</p>
                      ) : (
                        <>
                          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-gray-800">
                            <dt className="text-gray-600">Chuyên môn</dt>
                            <dd className="break-words">{p.credential || '—'}</dd>
                            <dt className="text-gray-600">Tên công khai</dt>
                            <dd className="break-words">{p.publicName || '—'}</dd>
                            <dt className="text-gray-600">Nơi công tác</dt>
                            <dd className="break-words">{p.affiliation || '—'}</dd>
                            <dt className="text-gray-600">Mức hiển thị mặc định</dt>
                            <dd>{DISCLOSURE_LABEL[p.disclosure]}</dd>
                            <dt className="text-gray-600">Xác minh</dt>
                            <dd className="break-words">
                              {p.verifiedAt
                                ? `Đã xác minh ${date(p.verifiedAt)}${p.verifiedBy ? ` bởi ${p.verifiedBy}` : ''}${
                                    p.verificationNote ? ` — ${p.verificationNote}` : ''
                                  }`
                                : 'Chưa xác minh (người học thấy nhiều nhất là mức ẩn danh)'}
                            </dd>
                          </dl>
                          <div className="mt-3">
                            {p.verifiedAt ? (
                              <button type="button" onClick={() => setUnverifying(m)} className={smallButton}>
                                Bỏ xác minh<span className="sr-only"> {m.name}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setDialogError('');
                                  setVerifyNote('');
                                  setVerifying(m);
                                }}
                                className={smallButton}
                              >
                                Xác minh<span className="sr-only"> {m.name}</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------------- Blocks ---------------- */}
      <section aria-labelledby="blocks-heading">
        <InfoToggle
          accent="blue"
          label="Giải thích việc chặn"
          storageKey="tepup:help-open:course-blocks"
          className="mb-4"
          heading={
            <h2 id="blocks-heading" className="text-lg font-semibold text-gray-900">
              Chặn khỏi khóa học
            </h2>
          }
        >
          <p className="text-sm text-gray-700">
            Người bị chặn không gửi đề xuất, bình luận hay nhận góp ý ở khóa này. Khi chặn, các đề xuất đang mở của họ cho
            khóa này bị đóng (từ chối). Muốn chặn toàn trang, dùng khóa tài khoản ở Quản trị → Người dùng.
          </p>
        </InfoToggle>

        <form onSubmit={addBlock} className="mb-6 rounded-xl border border-gray-100 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Chặn một tài khoản</h3>
          <FormError message={blockError} className="mb-3" />
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1">
              <label htmlFor="block-username" className={labelClass}>
                Tên đăng nhập
              </label>
              <input
                id="block-username"
                value={blockUsername}
                onChange={(e) => setBlockUsername(e.target.value)}
                required
                autoComplete="off"
                className={fieldClass}
              />
            </div>
            <div className="min-w-[14rem] flex-[2]">
              <label htmlFor="block-reason" className={labelClass}>
                Lý do (chỉ quản trị viên thấy)
              </label>
              <input
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                maxLength={500}
                className={fieldClass}
              />
            </div>
            <button type="submit" aria-disabled={blockBusy || undefined} className={primaryButton}>
              <Ban className="h-4 w-4" aria-hidden="true" />
              {blockBusy ? 'Đang chặn…' : 'Chặn'}
            </button>
          </div>
        </form>

        {blocks.length === 0 ? (
          <p className="text-sm text-gray-600">Không ai bị chặn ở khóa học này.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
            {blocks.map((b) => (
              <li key={b.userId} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5 break-words">
                    {date(b.createdAt)}
                    {b.blockedBy && ` · bởi ${b.blockedBy}`}
                    {b.reason && ` · ${b.reason}`}
                  </p>
                </div>
                <button type="button" onClick={() => setUnblocking(b)} className={smallButton}>
                  Bỏ chặn<span className="sr-only"> {b.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------------- Dialogs ---------------- */}
      {removing && (
        <ConfirmDialog
          title="Gỡ vai trò?"
          confirmLabel="Gỡ"
          busyLabel="Đang gỡ…"
          busy={dialogBusy}
          error={dialogError}
          onCancel={closeDialogs}
          onConfirm={() =>
            runDialog(async () => {
              const data = await call(`${base}/members/${encodeURIComponent(removing.userId)}`, { method: 'DELETE' });
              return (
                `Đã gỡ ${removing.name} khỏi khóa học.` +
                (data.orphaned ? ' Khóa học hiện không còn trưởng khóa học nào.' : '')
              );
            })
          }
          fallbackFocus={() => document.getElementById('add-username')}
        >
          {removing.name} sẽ không còn là {COURSE_ROLE_LABEL[removing.role].toLowerCase()} của khóa học này, có hiệu lực
          ngay.
        </ConfirmDialog>
      )}

      {unblocking && (
        <ConfirmDialog
          title="Bỏ chặn?"
          confirmLabel="Bỏ chặn"
          busyLabel="Đang bỏ chặn…"
          busy={dialogBusy}
          error={dialogError}
          onCancel={closeDialogs}
          onConfirm={() =>
            runDialog(async () => {
              await call(`${base}/blocks?userId=${encodeURIComponent(unblocking.userId)}`, { method: 'DELETE' });
              return `Đã bỏ chặn ${unblocking.name}.`;
            })
          }
          fallbackFocus={() => document.getElementById('block-username')}
        >
          {unblocking.name} sẽ lại được đề xuất, bình luận và nhận góp ý ở khóa học này. Các đề xuất đã đóng không mở lại.
        </ConfirmDialog>
      )}

      {unverifying && (
        <ConfirmDialog
          title="Bỏ xác minh?"
          confirmLabel="Bỏ xác minh"
          busyLabel="Đang lưu…"
          busy={dialogBusy}
          error={dialogError}
          onCancel={closeDialogs}
          onConfirm={() =>
            runDialog(async () => {
              await call(`/api/admin/reviewers/${encodeURIComponent(unverifying.userId)}/verify`, { method: 'DELETE' });
              return `Đã bỏ xác minh ${unverifying.name}.`;
            })
          }
        >
          Chuyên môn và tên của {unverifying.name} sẽ không còn hiện cho người học (nhiều nhất là mức ẩn danh), ở mọi khóa
          học, trong khoảng 10 phút.
        </ConfirmDialog>
      )}

      {verifying && (
        <AdminDialog title={`Xác minh ${verifying.name}`} onClose={closeDialogs} busy={dialogBusy} initialFocus="#verify-note">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runDialog(async () => {
                await call(`/api/admin/reviewers/${encodeURIComponent(verifying.userId)}/verify`, {
                  method: 'PUT',
                  // The version shown above: the API refuses (409) if the profile changed since.
                  body: JSON.stringify({ note: verifyNote, profileUpdatedAt: verifying.profile?.updatedAt }),
                });
                return `Đã xác minh ${verifying.name}.`;
              });
            }}
          >
            <p className="mb-3 text-sm text-gray-700">
              Chuyên môn: <strong>{verifying.profile?.credential || '—'}</strong>
              {verifying.profile?.publicName && (
                <>
                  {' '}
                  · Tên công khai: <strong>{verifying.profile.publicName}</strong>
                </>
              )}
            </p>
            <label htmlFor="verify-note" className={labelClass}>
              Đã kiểm tra bằng cách nào
            </label>
            <textarea
              id="verify-note"
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              required
              maxLength={1000}
              rows={3}
              aria-describedby="verify-note-hint"
              className={fieldClass}
            />
            <p id="verify-note-hint" className="mt-1 mb-4 text-xs text-gray-600">
              Ví dụ: &ldquo;gặp trực tiếp, xem bằng&rdquo;. Chỉ quản trị viên thấy. Không ghi số giấy tờ, không đính kèm bản
              sao.
            </p>
            <div role="alert" className="empty:hidden mb-4">
              {dialogError && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{dialogError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeDialogs} className="rounded-xl px-4 py-2 text-gray-600 hover:bg-gray-100">
                Hủy
              </button>
              <button type="submit" aria-disabled={dialogBusy || undefined} className={primaryButton}>
                {dialogBusy ? 'Đang lưu…' : 'Xác minh'}
              </button>
            </div>
          </form>
        </AdminDialog>
      )}
    </div>
  );
}
