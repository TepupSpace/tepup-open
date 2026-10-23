import { getCourseCredits, type CreditRole } from '@/lib/services/credits-service';
import { LICENCE_NAME, LICENCE_URL } from '@/lib/licence';

const ROLE_TEXT: Record<CreditRole, string> = {
  CREATOR: 'tạo khóa học',
  COURSE_LEAD: 'trưởng khóa học',
  CONTRIBUTOR: 'đóng góp',
};

/**
 * Course page: "Tác giả và người đóng góp" + "Người thẩm định" (proposal §6.12, §6.14a).
 * Server component on a publicly cached page: no session, cookies or searchParams; the data
 * is cached (getCourseCredits) and the HTML is the same for every visitor.
 */
export default async function CourseCredits({ courseId }: { courseId: string }) {
  const { people, reviewers, anonymousReviewers } = await getCourseCredits(courseId);
  const hasReviewers = reviewers.length > 0 || anonymousReviewers > 0;

  return (
    <section aria-labelledby="course-credits-heading" className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
      <h2 id="course-credits-heading" className="text-lg font-bold text-gray-900">
        Tác giả và người đóng góp
      </h2>
      {people.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-800">
          {people.map((p) => (
            <li key={p.key}>
              <span className="font-medium">{p.name}</span>{' '}
              <span className="text-gray-600">({p.roles.map((r) => ROLE_TEXT[r]).join(', ')})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-600">Đội ngũ TepUp.</p>
      )}

      {hasReviewers && (
        <>
          <h3 className="mt-5 text-base font-semibold text-gray-900">Người thẩm định</h3>
          {reviewers.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-gray-800">
              {reviewers.map((r) => (
                <li key={r.key}>
                  {r.name ? (
                    <>
                      <span className="font-medium">{r.name}</span>, {r.credential}
                      {r.affiliation ? ` (${r.affiliation})` : ''}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{r.credential}</span>{' '}
                      <span className="text-gray-600">(không công khai tên)</span>
                    </>
                  )}{' '}
                  <span className="text-gray-600">· chuyên môn đã được TepUp xác minh</span>
                </li>
              ))}
            </ul>
          )}
          {anonymousReviewers > 0 && (
            <p className="mt-2 text-sm text-gray-700">
              {reviewers.length > 0 ? 'Cùng ' : ''}
              {anonymousReviewers} người duyệt tin cậy đã kiểm tra nội dung khóa học này.
            </p>
          )}
        </>
      )}

      <p className="mt-5 text-xs text-gray-600">
        Nội dung khóa học được phát hành theo giấy phép{' '}
        <a href={LICENCE_URL} rel="license noopener noreferrer" target="_blank" className="underline text-gray-800">
          {LICENCE_NAME}
          <span className="sr-only"> (mở trong thẻ mới)</span>
        </a>
        . Khi chia sẻ lại, hãy ghi công TepUp và những người có tên ở trên.
      </p>
    </section>
  );
}
