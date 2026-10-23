/** A course's outline (pure type; safe in client and server). See lib/services/outline-service.ts. */
export interface CourseOutline {
  course: { name: string; description: string | null };
  levels: { id: string; name: string; sortOrder: number }[];
  lessons: { id: string; name: string; levelId: string; sortOrder: number; isActive: boolean }[];
}
