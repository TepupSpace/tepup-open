import Link from '@/components/ui/AppLink';
import { requireAdmin } from '@/lib/admin-auth';
import PageHeader from '@/components/staff/PageHeader';
import Card from '@/components/staff/Card';
import Badge from '@/components/staff/Badge';
import { staffButtonClass } from '@/components/staff/Button';
import { AnalyticsNav, formatSeconds, pct, rateTone, Stat, Table } from '@/components/admin/analytics/AnalyticsUi';
import { blockLabel, contentInfo, courseJourney, courseOptions, lessonJourney } from '@/lib/analytics/journey';
import { optionTally, questionStats } from '@/lib/analytics/reports';

export const metadata = { title: 'Hành trình người học — Số liệu học' };
export const dynamic = 'force-dynamic';

const RANGES = [7, 30, 90, 365] as const;
const ID = /^[A-Za-z0-9_-]{1,64}$/;

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; lesson?: string; days?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r) === sp.days) ?? 30;
  const lessonId = sp.lesson && ID.test(sp.lesson) ? sp.lesson : null;

  const [courses, info] = await Promise.all([courseOptions(), lessonId ? contentInfo(lessonId) : null]);
  const courseParam = sp.course && ID.test(sp.course) ? sp.course : null;
  const courseId = courseParam ?? info?.courseId ?? null;
  const course = courses.find((c) => c.id === courseId) ?? null;

  const [lessons, journey, questions, options] = await Promise.all([
    course ? courseJourney(course.id, days) : null,
    info ? lessonJourney(info.id, days) : null,
    info ? questionStats(info.id, days) : null,
    info ? optionTally(info.id) : null,
  ]);
  const href = (q: { course?: string | null; lesson?: string | null }) => {
    const p = new URLSearchParams({ days: String(days) });
    if (q.course) p.set('course', q.course);
    if (q.lesson) p.set('lesson', q.lesson);
    return `/admin/analytics/journey?${p.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        kicker="Số liệu học"
        title="Hành trình người học"
        description="Chọn một khoá để xem người học đi qua các bài thế nào, rồi chọn một bài để xem từng block. Chỉ tính người đang bật số liệu; mỗi người là một trình duyệt."
      />
      <AnalyticsNav current="/admin/analytics/journey" />

      <Card className="p-5">
        <form method="get" action="/admin/analytics/journey" className="flex flex-wrap items-end gap-3">
          <div className="min-w-0">
            <label htmlFor="journey-course" className="block text-xs font-medium text-gray-700 mb-1">
              Khoá học
            </label>
            <select
              id="journey-course"
              name="course"
              defaultValue={course?.id ?? ''}
              className="max-w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
            >
              <option value="">Chọn khoá…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.isActive ? '' : ' (đang ẩn)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="journey-days" className="block text-xs font-medium text-gray-700 mb-1">
              Khoảng thời gian
            </label>
            <select
              id="journey-days"
              name="days"
              defaultValue={String(days)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
            >
              {RANGES.map((r) => (
                <option key={r} value={r}>
                  {r} ngày qua
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={staffButtonClass('secondary', 'sm')}>
            Xem
          </button>
        </form>
      </Card>

      {!course && !info && <p className="text-gray-700">Chọn một khoá học để bắt đầu.</p>}

      {course && lessons && (
        <Table
          title={`Các bài của khoá “${course.name}”`}
          description="Người bắt đầu và học xong từng bài (bài đang hiển thị, theo thứ tự trong khoá). “Sang bài kế” là trong số người học xong, bao nhiêu người đã mở bài tiếp theo. “Dừng xa nhất ở đây”: số người mà bài xa nhất họ đã mở là bài này."
          head={['#', 'Bài', 'Bắt đầu', 'Học xong', 'Tỉ lệ học xong', 'Sang bài kế', 'Dừng xa nhất ở đây', '']}
          rows={lessons.map((l, i) => [
            l.position,
            l.name,
            l.starters,
            l.completers,
            <Badge key="r" tone={rateTone(l.completers, l.starters)}>{pct(l.completers, l.starters)}</Badge>,
            i === lessons.length - 1 ? '—' : pct(l.continued, l.completers),
            l.furthestHere,
            <Link
              key="d"
              href={href({ course: course.id, lesson: l.lessonId })}
              aria-current={l.lessonId === info?.id ? 'true' : undefined}
              className="underline underline-offset-2 text-gray-800 hover:text-gray-900"
            >
              Từng block<span className="sr-only">: {l.name}</span>
            </Link>,
          ])}
        />
      )}

      {lessonId && !info && <p className="text-gray-700">Không tìm thấy bài hoặc chương này (có thể đã bị xoá).</p>}

      {info && journey && (
        <section aria-labelledby="lesson-journey" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="lesson-journey" className="text-xl font-semibold text-gray-900">
              {info.parentName} › {info.name}
            </h2>
            <Link
              href={`/admin/analytics/learners?lesson=${info.id}`}
              prefetch={false}
              className="text-sm underline underline-offset-2 text-gray-800 hover:text-gray-900"
            >
              Người đã mở bài này
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Người bắt đầu" value={journey.starters.toLocaleString('vi-VN')} />
            <Stat label="Người học xong" value={journey.completers.toLocaleString('vi-VN')} />
            <Stat label="Tỉ lệ học xong" value={pct(journey.completers, journey.starters)} />
          </div>
          <Table
            title="Từng block"
            headingLevel={3}
            description={
              <>
                “Tới”: số người đã thấy block, so với người bắt đầu bài. “Dừng ở đây”: người chưa học xong mà block xa
                nhất họ thấy là block này. “Làm xong”: người đã trả lời câu hỏi hoặc làm xong block tương tác. Thời
                gian: trung vị từ lúc block hiện ra đến lúc bấm tiếp; các block hiện ra cùng lúc dùng chung một khoảng;
                khoảng trên 30 phút bị bỏ ra. “Nội dung” lấy từ bản đang xuất bản, nên có thể lệch nếu bài đã sửa.
              </>
            }
            head={['Block #', 'Loại', 'Nội dung', 'Tới', '% tới', 'Dừng ở đây', 'Làm xong', 'Thời gian (trung vị)']}
            rows={journey.blocks.map((b) => [
              b.blockIndex + 1,
              b.blockType,
              <span key="c" className="text-gray-700">{blockLabel(info.blocks[b.blockIndex])}</span>,
              b.reached,
              <Badge key="p" tone={rateTone(b.reached, journey.starters)}>{pct(b.reached, journey.starters)}</Badge>,
              b.stoppedHere,
              b.done === null ? '—' : `${b.done} (${pct(b.done, b.reached)})`,
              <span key="t">
                {formatSeconds(b.medianSeconds)}
                {b.idle > 0 && <span className="block text-xs text-gray-600">{b.idle} lượt trên 30 phút</span>}
              </span>,
            ])}
          />
          {questions && questions.length > 0 && (
            <Table
              title="Câu hỏi"
              headingLevel={3}
              description="Tỉ lệ trả lời đúng ở lần kiểm tra đầu (theo lượt trả lời)."
              head={['Block #', 'Lượt trả lời', 'Đúng', 'Tỉ lệ đúng']}
              rows={questions.map((q) => [q.blockIndex + 1, q.answers, q.correct, pct(q.correct, q.answers)])}
            />
          )}
          {options && options.length > 0 && (
            <Table
              title="Phân bố đáp án"
              headingLevel={3}
              description="Toàn thời gian. Bộ đếm này không gắn ngày hay người học nào."
              head={['Block', 'Đáp án', 'Số lượt chọn']}
              rows={options.map((o) => {
                const [block, option] = o.key.split(':');
                // `i<n>`: block không có id, n là chỉ số 0-based → hiện như "Block #" ở các bảng khác.
                const m = /^i(\d+)$/.exec(block);
                return [m ? `#${Number(m[1]) + 1}` : block, option, o.count];
              })}
            />
          )}
        </section>
      )}
    </div>
  );
}
