/**
 * Content service that fetches data from the database.
 * Replaces the static data imports from /data/courses.ts
 */

import { prisma } from '../prisma';
import { unstable_cache } from 'next/cache';
import { CONTENT_TAG } from '../cache';
import { canReviewContent, isContributorOrAbove } from '../role-utils';
import type { UserRole } from '@prisma/client';
import type {
  CategoryDisplay,
  CourseDisplay,
  CharacterDisplay,
  StoryDisplay,
  LessonPage,
  ChapterPage,
  ContentBlock,
} from '../types/content';

// Cache duration in seconds.
// Giữ được 5 phút là nhờ admin lưu bài sẽ gọi `revalidateContent()` xoá tag ngay;
// nếu không có lối xoá tường minh đó thì con số này phải nhỏ như trước (60s).
const CACHE_DURATION = 300; // 5 minutes

// ============================================================
// Shared Mapping Helpers
// ============================================================

/** Safely parse JSON blocks from Prisma content field */
function parseBlocks(content: { blocks: unknown } | null): ContentBlock[] {
  return ((content?.blocks as ContentBlock[]) ?? []);
}

/** Map a course (with levels/lessons counts) to CourseDisplay */
function mapCourseToDisplay(course: {
  id: string; slug: string; name: string; description: string | null;
  icon: string; isNew: boolean; imageUrl: string | null;
  levels: {
    id: string; name: string;
    lessons: { id: string; slug: string; name: string }[];
  }[];
}): CourseDisplay {
  // Đếm ngay trên các dòng đã lấy về. Trước đây mỗi level còn kèm một `_count`
  // riêng — thêm một subquery tương quan để ra đúng con số mà chính các dòng bên
  // cạnh đã nói lên (cả hai đều lọc `isActive: true`).
  const lessonsCount = course.levels.reduce((sum, lvl) => sum + lvl.lessons.length, 0);
  return {
    id: course.id, slug: course.slug, name: course.name,
    description: course.description || '', icon: course.icon, isNew: course.isNew,
    imageUrl: course.imageUrl,
    lessonsCount,
    levels: course.levels.map((lvl) => ({
      id: lvl.id, name: lvl.name,
      lessons: lvl.lessons.map((les) => ({
        id: les.id, slug: les.slug, name: les.name,
        isCompleted: false, isLocked: false,
      })),
    })),
  };
}

/** Map a story (with parts/chapters counts) to StoryDisplay */
function mapStoryToDisplay(story: {
  id: string; slug: string; title: string; teaser: string | null;
  icon: string; estimatedTime: string | number | null;
  parts: {
    id: string; name: string;
    chapters: { id: string; slug: string; title: string }[];
  }[];
}, characterSlug: string): StoryDisplay {
  // Như `mapCourseToDisplay`: đếm từ chính các dòng đã lấy, bỏ subquery `_count`.
  const chaptersCount = story.parts.reduce((sum, part) => sum + part.chapters.length, 0);
  return {
    id: story.id, slug: story.slug, characterId: characterSlug,
    title: story.title, teaser: story.teaser || '', icon: story.icon,
    estimatedTime: String(story.estimatedTime ?? ''), chaptersCount,
    parts: story.parts.map((part) => ({
      id: part.id, name: part.name,
      chapters: part.chapters.map((ch) => ({
        id: ch.id, slug: ch.slug, title: ch.title,
        isCompleted: false, isLocked: false,
      })),
    })),
  };
}

/** Map a character to CharacterDisplay */
function mapCharacterToDisplay(char: {
  id: string; slug: string; name: string; role: string;
  description: string | null; icon: string; color: string; bgColor: string;
  avatarUrl: string | null; imageUrl: string | null;
  stories: { slug: string }[];
}): CharacterDisplay {
  return {
    id: char.id, slug: char.slug, name: char.name, role: char.role,
    description: char.description || '', icon: char.icon,
    color: char.color, bgColor: char.bgColor,
    avatarUrl: char.avatarUrl, imageUrl: char.imageUrl,
    stories: char.stories.map((s) => s.slug),
  };
}

// ============================================================
// Category & Course Functions
// ============================================================

// Lightweight query for homepage - only fetch what's needed for cards
async function getCategoriesLightweight(): Promise<CategoryDisplay[]> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      courses: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          levels: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              lessons: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description || '',
    icon: cat.icon,
    courses: cat.courses.map(mapCourseToDisplay),
  }));
}

// Cached version of getCategories
export const getCategories = unstable_cache(
  getCategoriesLightweight,
  ['categories'],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
);

async function getCourseBySlugInternal(slug: string): Promise<CourseDisplay | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      levels: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          lessons: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;
  return mapCourseToDisplay(course);
}

// Cached version
export const getCourseBySlug = (slug: string) => unstable_cache(
  () => getCourseBySlugInternal(slug),
  ['course-by-slug', slug],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
)()

// ============================================================
// Lesson Functions
// ============================================================

/**
 * Everything the lesson player needs, in one query.
 *
 * A lesson is addressed by (course slug, lesson slug) — the same pair that forms
 * its URL — so the slug only has to be unique inside its course.
 */
async function getLessonPageInternal(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonPage | null> {
  const row = await findLessonRow(courseSlug, lessonSlug, false);
  return row ? mapLessonRow(row) : null;
}

/**
 * Bài đang ẩn chỉ người có quyền mới xem được, qua đúng URL của bài (proxy.ts
 * rewrite sang route staff). Reviewer/Admin xem mọi bài; contributor chỉ xem bài
 * trong khoá do chính họ tạo (`Course.createdById`).
 *
 * Không cache: kết quả phụ thuộc người xem.
 */
export async function getLessonPageForViewer(
  courseSlug: string,
  lessonSlug: string,
  viewer: { id: string; role: UserRole } | null
): Promise<{ page: LessonPage; isHidden: boolean } | null> {
  if (!viewer || !isContributorOrAbove(viewer.role)) {
    const page = await getLessonPage(courseSlug, lessonSlug);
    return page ? { page, isHidden: false } : null;
  }

  const row = await findLessonRow(courseSlug, lessonSlug, true);
  if (!row) return null;

  // Chỉ bài ẩn mới cần tra tác giả khoá — query công khai không đụng tới createdById.
  if (!row.isActive && !canReviewContent(viewer.role)) {
    const owned = await prisma.course.count({
      where: { id: row.level.course.id, createdById: viewer.id },
    });
    if (!owned) return null;
  }

  return { page: mapLessonRow(row), isHidden: !row.isActive };
}

function findLessonRow(courseSlug: string, lessonSlug: string, includeHidden: boolean) {
  return prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      ...(includeHidden ? {} : { isActive: true }),
      course: { slug: courseSlug },
    },
    // `select` chứ không phải `include`: trước đây `course: true` kéo nguyên
    // dòng cho 6 field, còn `level.lessons` kéo mọi cột dù chỉ dùng id/slug/name.
    select: {
      id: true,
      slug: true,
      name: true,
      isActive: true,
      content: { select: { title: true, blocks: true } },
      level: {
        select: {
          id: true,
          name: true,
          course: {
            select: {
              id: true,
              slug: true,
              name: true,
              description: true,
              icon: true,
              isNew: true,
              imageUrl: true,
            },
          },
          lessons: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: { id: true, slug: true, name: true },
          },
        },
      },
    },
  });
}

type LessonRow = NonNullable<Awaited<ReturnType<typeof findLessonRow>>>;

function mapLessonRow(lesson: LessonRow): LessonPage {
  const course = lesson.level.course;

  return {
    lesson: {
      id: lesson.id,
      slug: lesson.slug,
      name: lesson.name,
      isCompleted: false,
      isLocked: false,
    },
    course: {
      id: course.id,
      slug: course.slug,
      name: course.name,
      description: course.description || '',
      icon: course.icon,
      isNew: course.isNew,
      imageUrl: course.imageUrl,
      lessonsCount: 0,
      levels: [],
    },
    level: {
      id: lesson.level.id,
      name: lesson.level.name,
      lessons: lesson.level.lessons.map((l) => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        isCompleted: false,
        isLocked: false,
      })),
    },
    content: lesson.content
      ? {
          lessonId: lesson.slug,
          title: lesson.content.title,
          blocks: parseBlocks(lesson.content),
        }
      : null,
  };
}

/**
 * Cached. Đây là query đứng sau cú bấm "Bắt đầu" — cú bấm được thực hiện nhiều
 * nhất và cũng là cú người dùng thấy chậm nhất. Trước đây nó là một trong hai
 * hàm nội dung duy nhất không hề được cache.
 */
export const getLessonPage = (courseSlug: string, lessonSlug: string) =>
  unstable_cache(
    () => getLessonPageInternal(courseSlug, lessonSlug),
    ['lesson-page', courseSlug, lessonSlug],
    { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
  )();

// ============================================================
// Character Functions
// ============================================================

async function getCharactersInternal(): Promise<CharacterDisplay[]> {
  const characters = await prisma.character.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      role: true,
      description: true,
      icon: true,
      color: true,
      bgColor: true,
      avatarUrl: true,
      imageUrl: true,
      stories: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  });

  return characters.map(mapCharacterToDisplay);
}

// Cached version
export const getCharacters = unstable_cache(
  getCharactersInternal,
  ['characters'],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
);

async function getCharacterBySlugInternal(slug: string): Promise<CharacterDisplay | null> {
  const character = await prisma.character.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      role: true,
      description: true,
      icon: true,
      color: true,
      bgColor: true,
      avatarUrl: true,
      imageUrl: true,
      stories: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  });

  if (!character) return null;
  return mapCharacterToDisplay(character);
}

// Cached version
export const getCharacterBySlug = (slug: string) => unstable_cache(
  () => getCharacterBySlugInternal(slug),
  ['character-by-slug', slug],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
)()

async function getCharactersBySlugsInternal(slugs: string[]): Promise<CharacterDisplay[]> {
  if (slugs.length === 0) return [];

  const characters = await prisma.character.findMany({
    where: { slug: { in: slugs }, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      role: true,
      description: true,
      icon: true,
      color: true,
      bgColor: true,
      avatarUrl: true,
      imageUrl: true,
      stories: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  });

  return characters.map(mapCharacterToDisplay);
}

/**
 * Nhiều nhân vật trong MỘT query.
 *
 * Trang chi tiết khoá học trước đây bắn một `getCharacterBySlug` cho mỗi nhân vật
 * xuất hiện trong các truyện liên quan. Vì `pg.Pool` giới hạn 5 kết nối, đó không
 * chỉ là N+1 mà là N+1 có xếp hàng: query thứ 6 phải chờ.
 */
export const getCharactersBySlugs = (slugs: string[]) => {
  const key = [...new Set(slugs)].sort();
  return unstable_cache(
    () => getCharactersBySlugsInternal(key),
    ['characters-by-slugs', key.join(',')],
    { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
  )();
};

// ============================================================
// Story Functions
// ============================================================

async function getStoriesByCharacterInternal(characterSlug: string): Promise<StoryDisplay[]> {
  // Một query thay vì hai. Character.slug là @unique nên lọc qua quan hệ khớp
  // đúng một nhân vật — y hệt lần tra id trước đây. Cố ý KHÔNG lọc isActive trên
  // nhân vật: bản cũ cũng không lọc, thêm vào sẽ âm thầm làm biến mất truyện của
  // một nhân vật đang tắt.
  const stories = await prisma.story.findMany({
    where: { isActive: true, character: { slug: characterSlug } },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      teaser: true,
      icon: true,
      estimatedTime: true,
      parts: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          chapters: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
      },
    },
  });

  return stories.map((story) => mapStoryToDisplay(story, characterSlug));
}

// Cached version
export const getStoriesByCharacter = (characterSlug: string) => unstable_cache(
  () => getStoriesByCharacterInternal(characterSlug),
  ['stories-by-character', characterSlug],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
)()

async function getStoryBySlugInternal(slug: string): Promise<StoryDisplay | null> {
  const story = await prisma.story.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      title: true,
      teaser: true,
      icon: true,
      estimatedTime: true,
      character: {
        select: { slug: true },
      },
      parts: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          chapters: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!story) return null;
  return mapStoryToDisplay(story, story.character.slug);
}

// Cached version
export const getStoryBySlug = (slug: string) => unstable_cache(
  () => getStoryBySlugInternal(slug),
  ['story-by-slug', slug],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
)()

async function getStoriesByCourseInternal(courseSlug: string): Promise<StoryDisplay[]> {
  // Một query thay vì hai, và isActive lọc ở DB thay vì lọc bằng JS sau khi các
  // dòng đã tốn công đi về. Không lọc isActive trên course — giữ đúng như bản cũ.
  const recommendations = await prisma.courseStoryRecommendation.findMany({
    where: { course: { slug: courseSlug }, story: { isActive: true } },
    orderBy: { sortOrder: 'asc' },
    select: {
      story: {
        select: {
          id: true,
          slug: true,
          title: true,
          teaser: true,
          icon: true,
          estimatedTime: true,
          character: {
            select: { slug: true },
          },
          parts: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              chapters: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return recommendations.map((rec) => mapStoryToDisplay(rec.story, rec.story.character.slug));
}

// Cached version
export const getStoriesByCourse = (courseSlug: string) => unstable_cache(
  () => getStoriesByCourseInternal(courseSlug),
  ['stories-by-course', courseSlug],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
)()

// Get courses recommended for a story
async function getCoursesByStoryInternal(storySlug: string): Promise<CourseDisplay[]> {
  // Một query thay vì hai; isActive của course lọc ở DB. Không lọc isActive trên
  // story — giữ đúng như bản cũ.
  const recommendations = await prisma.courseStoryRecommendation.findMany({
    where: { story: { slug: storySlug }, course: { isActive: true } },
    orderBy: { sortOrder: 'asc' },
    select: {
      course: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          icon: true,
          isNew: true,
          imageUrl: true,
          levels: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              lessons: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return recommendations.map((rec) => mapCourseToDisplay(rec.course));
}

// Cached version
export const getCoursesByStory = (storySlug: string) => unstable_cache(
  () => getCoursesByStoryInternal(storySlug),
  ['courses-by-story', storySlug],
  { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
)()

// ============================================================
// Chapter Functions
// ============================================================

/**
 * Everything the chapter player needs, in one query.
 *
 * Addressed by (character slug, story slug, chapter slug) — the URL path — so a
 * chapter slug only has to be unique inside its story.
 */
async function getChapterPageInternal(
  characterSlug: string,
  storySlug: string,
  chapterSlug: string
): Promise<ChapterPage | null> {
  const chapter = await prisma.chapter.findFirst({
    where: {
      slug: chapterSlug,
      isActive: true,
      story: { slug: storySlug, character: { slug: characterSlug } },
    },
    // Trước đây cây truyện bị kéo về HAI lần — một lần qua `part.story.parts.chapters`
    // và một lần nữa qua `part.chapters` — với đủ mọi cột. `part.chapters` vốn là
    // tập con của nhánh đầu, nên lấy một lần rồi tự lọc ra là đủ.
    select: {
      id: true,
      slug: true,
      title: true,
      content: { select: { title: true, blocks: true } },
      part: {
        select: {
          id: true,
          name: true,
          story: {
            select: {
              id: true,
              slug: true,
              title: true,
              teaser: true,
              icon: true,
              estimatedTime: true,
              character: { select: { slug: true } },
              parts: {
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  name: true,
                  chapters: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    select: { id: true, slug: true, title: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!chapter) return null;

  const story = chapter.part.story;
  const chaptersCount = story.parts.reduce((sum, part) => sum + part.chapters.length, 0);
  const currentPart = story.parts.find((part) => part.id === chapter.part.id);

  const toChapterDisplay = (ch: { id: string; slug: string; title: string }) => ({
    id: ch.id,
    slug: ch.slug,
    title: ch.title,
    isCompleted: false,
    isLocked: false,
  });

  return {
    chapter: {
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      isCompleted: false,
      isLocked: false,
    },
    story: {
      id: story.id,
      slug: story.slug,
      characterId: story.character.slug,
      title: story.title,
      teaser: story.teaser || '',
      icon: story.icon,
      estimatedTime: story.estimatedTime,
      chaptersCount,
      parts: story.parts.map((part) => ({
        id: part.id,
        name: part.name,
        chapters: part.chapters.map(toChapterDisplay),
      })),
    },
    part: {
      id: chapter.part.id,
      name: chapter.part.name,
      chapters: (currentPart?.chapters ?? []).map(toChapterDisplay),
    },
    content: chapter.content
      ? {
          chapterId: chapter.slug,
          title: chapter.content.title,
          blocks: parseBlocks(chapter.content),
        }
      : null,
  };
}

/** Cached — hàm anh em của `getLessonPage`, đứng sau cú bấm mở chương. */
export const getChapterPage = (
  characterSlug: string,
  storySlug: string,
  chapterSlug: string
) =>
  unstable_cache(
    () => getChapterPageInternal(characterSlug, storySlug, chapterSlug),
    ['chapter-page', characterSlug, storySlug, chapterSlug],
    { revalidate: CACHE_DURATION, tags: [CONTENT_TAG] }
  )();
