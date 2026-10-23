import type { ContributionType } from '@prisma/client';
import { publishNewCourse } from './new-course';
import { publishLessonContent } from './lesson-content';
import { publishChapterContent } from './chapter-content';
import { publishLibraryEntry } from './library-entry';
import { publishCourseOutline } from './course-outline';
import type { Publisher } from './types';

export * from './types';

/** Contribution type → publisher. Types without one can't be approved. */
export const PUBLISHERS: Partial<Record<ContributionType, Publisher>> = {
  NEW_COURSE: publishNewCourse,
  EDIT_LESSON_CONTENT: publishLessonContent,
  EDIT_CHAPTER_CONTENT: publishChapterContent,
  EDIT_LIBRARY_ENTRY: publishLibraryEntry,
  EDIT_COURSE: publishCourseOutline,
};
