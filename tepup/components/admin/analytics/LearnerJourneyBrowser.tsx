'use client';

import { useRef, useState } from 'react';
import Card from '@/components/staff/Card';
import Button from '@/components/staff/Button';
import type { LearnerJourney } from '@/lib/analytics/learners';

/**
 * Danh sách mã gần đây + hành trình của một mã. Mã chỉ đi trong body của POST
 * /api/admin/analytics/learners/journey, không bao giờ lên URL. Server ghi AuditLog mỗi lần xem.
 */

export type LearnerListRow = {
  anonId: string;
  short: string;
  lastAt: string;
  firstAt: string;
  sessions: number;
  started: number;
  completed: number;
  country: string;
  device: string;
};

const hourFmt = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function offset(t: number): string {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `+${m}:${String(s).padStart(2, '0')}`;
}

export default function LearnerJourneyBrowser({ rows }: { rows: LearnerListRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [journey, setJourney] = useState<LearnerJourney | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  async function open(row: LearnerListRow, button: HTMLButtonElement) {
    if (busy) return;
    openerRef.current = button;
    setBusy(row.anonId);
    setError(null);
    setStatus(`Đang mở hành trình ${row.short}…`);
    try {
      const res = await fetch('/api/admin/analytics/learners/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.anonId }),
        cache: 'no-store',
      });
      const data = (await res.json().catch(() => ({}))) as LearnerJourney & { error?: string };
      if (!res.ok) {
        setJourney(null);
        setError(data.error ?? 'Không mở được hành trình.');
        setStatus(data.error ?? 'Không mở được hành trình.');
      } else {
        setJourney(data);
        setStatus(`Đã mở hành trình ${data.short}.`);
      }
    } catch {
      setJourney(null);
      setError('Không mở được hành trình. Kiểm tra kết nối rồi thử lại.');
      setStatus('Không mở được hành trình.');
    } finally {
      setBusy(null);
      // Đưa focus tới nội dung vừa hiện (CLAUDE.md › Accessibility).
      requestAnimationFrame(() => headingRef.current?.focus());
    }
  }

  function close() {
    setJourney(null);
    setError(null);
    setStatus('Đã đóng hành trình.');
    openerRef.current?.focus();
  }

  return (
    <div className="space-y-6">
      <p className="sr-only" aria-live="polite">
        {status}
      </p>

      {(journey || error) && (
        <Card as="section" aria-labelledby="journey-title" className="p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 id="journey-title" ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-gray-900">
              {journey ? `Hành trình của ${journey.short}…` : 'Không mở được hành trình'}
            </h2>
            <Button variant="secondary" size="sm" onClick={close}>
              Đóng
            </Button>
          </div>
          {error && <p className="text-gray-800">{error}</p>}
          {journey && (
            <>
              <p className="text-sm text-gray-600">
                {journey.sessions.length} phiên, mới nhất trước. Giờ bắt đầu phiên chỉ ghi đến giờ; “+phút:giây” là thời
                gian tính từ đầu phiên.
                {journey.truncated && ' Chỉ hiện 3.000 sự kiện gần nhất.'}
              </p>
              <ol className="space-y-4">
                {journey.sessions.map((s, i) => (
                  <li key={`${s.sessionHour}-${i}`} className="border-l-2 border-gray-200 pl-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Phiên bắt đầu khoảng {hourFmt.format(new Date(s.sessionHour))}
                      <span className="font-normal text-gray-600">
                        {' '}
                        · {s.country ?? '??'} · {s.device ?? 'không rõ thiết bị'}
                      </span>
                    </h3>
                    <ul className="mt-1 space-y-0.5 text-sm text-gray-800">
                      {s.lines.map((l, j) => (
                        <li key={j}>
                          <span className="inline-block w-16 tabular-nums text-gray-600">{offset(l.t)}</span>
                          {l.text}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </>
          )}
        </Card>
      )}

      <Card as="section" flat aria-labelledby="learners-title" className="overflow-hidden">
        <div className="px-5 pt-4 pb-3">
          <h2 id="learners-title" className="text-lg font-semibold text-gray-900">
            Mã hoạt động gần đây
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Tối đa 100 mã, 90 ngày qua, mới nhất trước. Chỉ hiện 8 ký tự đầu của mỗi mã.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Mã hoạt động gần đây</caption>
            <thead className="bg-gray-50 border-y border-gray-100">
              <tr>
                {['Mã', 'Hoạt động gần nhất', 'Lần đầu thấy', 'Phiên', 'Bài đã mở', 'Bài học xong', 'Quốc gia', 'Thiết bị', ''].map((h, i) => (
                  <th key={i} scope="col" className="text-left px-5 py-2.5 text-xs font-medium text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-4 text-gray-600">
                    Chưa có số liệu.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.anonId} className="border-b border-gray-100 last:border-0">
                    <td className="px-5 py-2.5 font-mono text-gray-800">{r.short}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.lastAt}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.firstAt}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.sessions}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.started}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.completed}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.country}</td>
                    <td className="px-5 py-2.5 text-gray-800">{r.device}</td>
                    <td className="px-5 py-2.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-disabled={busy !== null}
                        onClick={(e) => void open(r, e.currentTarget)}
                      >
                        {busy === r.anonId ? 'Đang mở…' : 'Xem hành trình'}
                        <span className="sr-only">: mã {r.short}</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
