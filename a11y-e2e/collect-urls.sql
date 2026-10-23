-- Pages for the browser audit, from the local Docker database (only what learners can reach).
-- `types` lists the block types in each lesson/chapter, so tests can pick flows by content.
SELECT json_build_object(
  'courses', (
    SELECT coalesce(json_agg(c.slug ORDER BY c."sortOrder"), '[]')
    FROM "Course" c WHERE c."isActive"
  ),
  'lessons', (
    SELECT coalesce(json_agg(json_build_object(
      'id', l.id,
      'url', '/courses/' || c.slug || '/' || l.slug,
      'name', l.name,
      'types', (SELECT coalesce(json_agg(DISTINCT b->>'type'), '[]')
                FROM jsonb_array_elements(lc.blocks::jsonb) b)
    ) ORDER BY c."sortOrder", v."sortOrder", l."sortOrder"), '[]')
    FROM "Lesson" l
    JOIN "Course" c ON c.id = l."courseId"
    JOIN "Level" v ON v.id = l."levelId"
    JOIN "LessonContent" lc ON lc."lessonId" = l.id
    WHERE l."isActive" AND c."isActive"
  ),
  'characters', (
    SELECT coalesce(json_agg(DISTINCT ch.slug), '[]')
    FROM "Character" ch JOIN "Story" s ON s."characterId" = ch.id
    WHERE ch."isActive" AND s."isActive"
  ),
  'stories', (
    SELECT coalesce(json_agg('/story/' || ch.slug || '/' || s.slug ORDER BY s."sortOrder"), '[]')
    FROM "Story" s JOIN "Character" ch ON ch.id = s."characterId"
    WHERE s."isActive" AND ch."isActive"
  ),
  'chapters', (
    SELECT coalesce(json_agg(json_build_object(
      'id', k.id,
      'url', '/story/' || ch.slug || '/' || s.slug || '/' || k.slug,
      'name', k.title,
      'types', (SELECT coalesce(json_agg(DISTINCT b->>'type'), '[]')
                FROM jsonb_array_elements(cc.blocks::jsonb) b)
    ) ORDER BY s."sortOrder", p."sortOrder", k."sortOrder"), '[]')
    FROM "Chapter" k
    JOIN "Story" s ON s.id = k."storyId"
    JOIN "StoryPart" p ON p.id = k."partId"
    JOIN "Character" ch ON ch.id = s."characterId"
    JOIN "ChapterContent" cc ON cc."chapterId" = k.id
    WHERE k."isActive" AND s."isActive" AND ch."isActive"
  ),
  -- One real record of each kind, for the admin editing pages.
  'admin', json_build_object(
    'category', (SELECT id FROM "Category" ORDER BY "sortOrder" LIMIT 1),
    'character', (SELECT id FROM "Character" ORDER BY "sortOrder" LIMIT 1),
    'course', (SELECT id FROM "Course" WHERE "isActive" ORDER BY "sortOrder" LIMIT 1),
    'story', (SELECT id FROM "Story" WHERE "isActive" ORDER BY "sortOrder" LIMIT 1),
    'library', (SELECT id FROM "LibraryEntry" ORDER BY slug LIMIT 1),
    'lesson', (SELECT lc."lessonId" FROM "LessonContent" lc WHERE lc.blocks::text LIKE '%"question"%' LIMIT 1),
    'chapter', (SELECT cc."chapterId" FROM "ChapterContent" cc WHERE jsonb_array_length(cc.blocks::jsonb) > 3 LIMIT 1)
  ),
  -- Contributor-system pages (tests/contributor-system.spec.ts): any record of each kind.
  'contrib', json_build_object(
    'course', (SELECT id FROM "Course" ORDER BY "sortOrder" LIMIT 1),
    'lesson', (SELECT "lessonId" FROM "LessonContent" ORDER BY "updatedAt" DESC LIMIT 1),
    'chapter', (SELECT "chapterId" FROM "ChapterContent" ORDER BY "updatedAt" DESC LIMIT 1),
    'library', (SELECT id FROM "LibraryEntry" WHERE "isActive" ORDER BY slug LIMIT 1),
    'lessonEdit', (SELECT id FROM "Contribution" WHERE type = 'EDIT_LESSON_CONTENT' ORDER BY "createdAt" DESC LIMIT 1),
    'chapterEdit', (SELECT id FROM "Contribution" WHERE type = 'EDIT_CHAPTER_CONTENT' ORDER BY "createdAt" DESC LIMIT 1),
    'entryEdit', (SELECT id FROM "Contribution" WHERE type = 'EDIT_LIBRARY_ENTRY' ORDER BY "createdAt" DESC LIMIT 1),
    'outlineEdit', (SELECT id FROM "Contribution" WHERE type = 'EDIT_COURSE' ORDER BY "createdAt" DESC LIMIT 1),
    'reviewRequest', (SELECT id FROM "ReviewRequest" ORDER BY "createdAt" DESC LIMIT 1)
  )
);
