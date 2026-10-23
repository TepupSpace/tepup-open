import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { CONTENT_TAG } from '@/lib/cache';
import { getPublicLessonFlags } from '@/lib/services/flags-service';
import { getLessonEndorsements } from '@/lib/services/review-request-service';
import type { LessonNoticesData } from '@/lib/types/lesson-notices';

/**
 * What learners see above a lesson: maintenance flags with a public banner (proposal §6.21)
 * and reviewer endorsements the reviewers chose to disclose (§6.14a). Cached under
 * CONTENT_TAG and identical for every visitor, so it is safe on edge-cached pages; every
 * mutation of flags, endorsements or reviewer disclosure calls revalidateContent().
 */
async function getLessonNoticesInternal(lessonId: string): Promise<LessonNoticesData> {
  const [flags, endorsements] = await Promise.all([getPublicLessonFlags(lessonId), getLessonEndorsements(lessonId)]);
  return { flags, endorsements };
}

export const getLessonNotices = cache((lessonId: string) =>
  unstable_cache(() => getLessonNoticesInternal(lessonId), ['lesson-notices-v1', lessonId], {
    revalidate: 300,
    tags: [CONTENT_TAG],
  })()
);
