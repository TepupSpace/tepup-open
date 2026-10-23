import Link from '@/components/ui/AppLink';
import { auth } from '@/lib/auth';
import { findOpenProposal, type ProposalTargetType } from '@/lib/services/proposal-service';
import ProposeEditButton from '@/components/contributor/proposal/ProposeEditButton';

const TYPE_OF: Record<'LESSON' | 'CHAPTER' | 'LIBRARY_ENTRY', ProposalTargetType> = {
  LESSON: 'EDIT_LESSON_CONTENT',
  CHAPTER: 'EDIT_CHAPTER_CONTENT',
  LIBRARY_ENTRY: 'EDIT_LIBRARY_ENTRY',
};

const NOUN = { LESSON: 'bài này', CHAPTER: 'chương này', LIBRARY_ENTRY: 'mục này' } as const;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Bản nháp',
  PENDING_REVIEW: 'Chờ duyệt',
  CHANGES_REQUESTED: 'Cần chỉnh sửa',
};

/**
 * Hub section: start or continue an edit proposal for this lesson/chapter/entry. The page
 * that mounts it has already checked that the user may see the target; the API checks again.
 */
export default async function ProposeEditSection({
  targetType,
  targetId,
}: {
  targetType: 'LESSON' | 'CHAPTER' | 'LIBRARY_ENTRY';
  targetId: string;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const type = TYPE_OF[targetType];
  const open = await findOpenProposal(session.user.id, type, targetId);

  return (
    <section aria-labelledby="hub-propose" className="rounded-xl border border-gray-100 bg-white p-5">
      <h2 id="hub-propose" className="mb-2 text-lg font-semibold text-gray-900">
        Đề xuất sửa
      </h2>
      {open ? (
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            Bạn đang có một đề xuất cho {NOUN[targetType]}:{' '}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
              {STATUS_LABEL[open.status] ?? open.status}
            </span>{' '}
            (cập nhật {open.updatedAt.toLocaleDateString('vi-VN')}).
          </p>
          <Link
            href={`/contributor/contributions/${open.id}/edit`}
            className="inline-flex items-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            {open.status === 'PENDING_REVIEW' ? 'Xem đề xuất' : 'Tiếp tục sửa'}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Bản đề xuất bắt đầu từ nội dung đang chạy. Người duyệt xem thay đổi của bạn trước khi nó lên trang.
          </p>
          <ProposeEditButton type={type} targetId={targetId} />
        </div>
      )}
    </section>
  );
}
