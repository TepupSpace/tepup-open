/**
 * Shared shapes for the story rewrite (6 nhân vật × 4 course).
 *
 * A story file exports one `StorySeed`. The runner (scripts/seed-stories-v2.ts)
 * upserts it by slug, so re-running is safe.
 */
import type { ContentBlock } from '../../lib/types/content';

export interface CharacterSeed {
  slug: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  sortOrder: number;
}

export interface ChapterSeed {
  slug: string;
  title: string;
  blocks: ContentBlock[];
}

export interface StorySeed {
  slug: string;
  characterSlug: string;
  title: string;
  teaser: string;
  icon: string;
  estimatedTime: string;
  sortOrder: number;
  /** Course slugs this story is recommended from. Usually one; Đức's story has two. */
  courseSlugs: string[];
  /** Every story is a single StoryPart. Đức's merged story is the only multi-chapter-heavy one. */
  part: { name: string; chapters: ChapterSeed[] };
}

/** Course slugs as they exist on production. */
export const COURSE = {
  logic: 'logic-101',
  thue: 'thue',
  riengtu: 'nguoi-la-biet-gi-ve-ban',
} as const;
