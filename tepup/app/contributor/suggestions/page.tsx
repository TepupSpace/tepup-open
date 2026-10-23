import type { Metadata } from 'next';
import type { UserRole } from '@prisma/client';
import { requireContributor } from '@/lib/admin-auth';
import { CLAIM_TTL_DAYS } from '@/lib/suggestions';
import { listClaimableSuggestions } from '@/app/api/contributor/suggestions/claimable/list-claimable';
import SuggestionsClient from './SuggestionsClient';
import SectionTabs, { FIND_WORK_TABS, NewCourseButton } from '@/components/contributor/SectionTabs';

export const metadata: Metadata = { title: 'Góp ý chờ người làm' };

/**
 * Accepted reader suggestions any contributor can take on ("Nhận làm", proposal §6.9).
 * Claiming creates an edit proposal linked to the suggestion; approving it marks the
 * suggestion APPLIED.
 */
export default async function SuggestionsPage() {
  const session = await requireContributor();
  const items = await listClaimableSuggestions({ id: session.user.id, role: session.user.role as UserRole });

  return (
    <div className="max-w-4xl">
      <SectionTabs label="Tìm bài để sửa" tabs={FIND_WORK_TABS} current="/contributor/suggestions">
        <NewCourseButton />
      </SectionTabs>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Góp ý chờ người làm</h1>
      <p className="mb-6 text-sm text-gray-600">
        Người đọc gửi những góp ý này ẩn danh, và người duyệt đã chấp nhận chúng. Bấm &ldquo;Nhận làm&rdquo; để mở một đề
        xuất sửa có sẵn góp ý bên cạnh. Lượt nhận hết hạn sau {CLAIM_TTL_DAYS} ngày nếu bạn chưa gửi đề xuất.
      </p>
      <SuggestionsClient initialItems={items} />
    </div>
  );
}
