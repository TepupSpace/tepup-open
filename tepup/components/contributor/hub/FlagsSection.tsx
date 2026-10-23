import type { UserRole } from '@prisma/client';
import { auth } from '@/lib/auth';
import { canOnCourse } from '@/lib/permissions/course-roles';
import { listLessonFlags } from '@/lib/services/flags-service';
import FlagsSectionClient from './FlagsSectionClient';

/**
 * Hub section: maintenance flags of a lesson (proposal §6.21). Users with FLAG on the course
 * set and resolve flags and read the staff notes; everyone else who can open the hub sees the
 * open flags read-only. The hub page has already checked that the user may see the lesson.
 */
export default async function FlagsSection({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const session = await auth();
  if (!session?.user) return null;
  const canFlag = await canOnCourse({ id: session.user.id, role: session.user.role as UserRole }, courseId, 'FLAG');
  const flags = await listLessonFlags(lessonId, canFlag);
  return <FlagsSectionClient lessonId={lessonId} canFlag={canFlag} initial={flags} />;
}
