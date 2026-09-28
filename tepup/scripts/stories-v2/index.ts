/**
 * Registry of every authored story.
 *
 * Stories are written one course at a time (see the plan's "chia đợt"): each
 * batch adds its imports here and nothing else in the seeder changes.
 */
import type { StorySeed } from './types';

// đợt 1 — Riêng Tư 101
import { MINH_RIENGTU } from './riengtu/minh-riengtu';
import { HUONG_RIENGTU } from './riengtu/huong-riengtu';
import { BACTU_RIENGTU } from './riengtu/bactu-riengtu';
import { BABAY_RIENGTU } from './riengtu/babay-riengtu';
import { CONGA_RIENGTU } from './riengtu/conga-riengtu';
// đợt 2 — Logic 101
import { MINH_LOGIC } from './logic/minh-logic';
import { HUONG_LOGIC } from './logic/huong-logic';
import { BACTU_LOGIC } from './logic/bactu-logic';
import { DUC_LOGIC } from './logic/duc-logic';
import { BABAY_LOGIC } from './logic/babay-logic';
import { CONGA_LOGIC } from './logic/conga-logic';
// đợt 3 — Thuế 101
import { MINH_THUE } from './thue/minh-thue';
import { HUONG_THUE } from './thue/huong-thue';
import { BACTU_THUE } from './thue/bactu-thue';
import { DUC_THUE } from './thue/duc-thue';
import { BABAY_THUE } from './thue/babay-thue';
import { CONGA_THUE } from './thue/conga-thue';
// đợt 4 — Dân chủ 101

export const ALL_STORIES: StorySeed[] = [
  MINH_RIENGTU,
  HUONG_RIENGTU,
  BACTU_RIENGTU,
  BABAY_RIENGTU,
  CONGA_RIENGTU,
  MINH_LOGIC,
  HUONG_LOGIC,
  BACTU_LOGIC,
  DUC_LOGIC,
  BABAY_LOGIC,
  CONGA_LOGIC,
  MINH_THUE,
  HUONG_THUE,
  BACTU_THUE,
  DUC_THUE,
  BABAY_THUE,
  CONGA_THUE,
];

/** Stories that no longer map to any live course. Hidden, never deleted. */
export const ORPHAN_STORY_SLUGS = ['minh-kinh-te', 'huong-dau-tu', 'bactu-kinhdoanh'];

/** Đức's merged story is authored in the DB, not in a seed file — see --merge-duc. */
export const DUC_STORY_SLUG = 'duc-lao-dong-so';
export const DUC_COURSE_SLUGS = ['nguoi-la-biet-gi-ve-ban'];
