import type { UserRole } from '@prisma/client';
import { getMemberships } from '@/lib/permissions/course-roles';
import { canReviewContent } from '@/lib/role-utils';
import SectionTabs, { reviewTabs } from './SectionTabs';

/**
 * Tabs of the "Việc duyệt" group (server). Shows only the tabs the viewer may use, with the
 * same rule as the sidebar; each page checks access again.
 */
export default async function ReviewSectionTabs({
  viewer,
  current,
}: {
  viewer: { id: string; role: UserRole | string };
  current: string;
}) {
  const global = canReviewContent(viewer.role as UserRole);
  const roles = global ? null : [...(await getMemberships(viewer.id)).values()];
  const reviewer = global || (roles?.length ?? 0) > 0;
  const requests = global || !!roles?.includes('TRUSTED_REVIEWER');
  return <SectionTabs label="Việc duyệt" tabs={reviewTabs({ reviewer, requests })} current={current} />;
}
