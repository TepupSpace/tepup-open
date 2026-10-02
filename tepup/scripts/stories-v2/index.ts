/**
 * Registry of every authored story.
 *
 * Stories are written one course at a time (see the plan's "chia đợt"): each
 * batch adds its imports here and nothing else in the seeder changes.
 */
import type { StorySeed } from './types';

// Story content is not part of the public mirror. Add your own StorySeed files
// (see ./types.ts; check them with ./validate.ts) and list them here.
export const ALL_STORIES: StorySeed[] = [];

/** Stories that no longer map to any live course. Hidden, never deleted. */
export const ORPHAN_STORY_SLUGS = ['minh-kinh-te', 'huong-dau-tu', 'bactu-kinhdoanh'];

/** Đức's merged story is authored in the DB, not in a seed file — see --merge-duc. */
export const DUC_STORY_SLUG = 'duc-lao-dong-so';
export const DUC_COURSE_SLUGS = ['nguoi-la-biet-gi-ve-ban'];
