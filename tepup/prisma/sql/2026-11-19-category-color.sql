-- Category colour ("Màu danh mục"): each course category has one dominant colour on /courses
-- (the folder cards and the gradient panel of its shelf). Admins pick it from a fixed preset in
-- Quản trị › Danh mục; no free hex. The preset list lives in tepup/lib/paper/category-colors.ts
-- and must match the CHECK constraint below (add a value to both if the preset grows).
--
-- Apply with psql as `postgres` (owner), staging first, then production. Idempotent.
-- The code depends on it: apply to both databases BEFORE merging to main.
-- Not `prisma db push`: see 2026-09-28-suggestions.sql for why.
--
-- Existing table, no new grants: RLS and privileges on "Category" stay as they are.

begin;

ALTER TABLE "Category"
    ADD COLUMN IF NOT EXISTS "color" TEXT NOT NULL DEFAULT 'blue';

do $$ begin
  ALTER TABLE "Category"
    ADD CONSTRAINT "Category_color_check"
    CHECK ("color" IN ('blue', 'purple', 'teal', 'orange', 'red', 'green', 'pink', 'amber'));
exception when duplicate_object then null; end $$;

-- Initial colours, inferred from the seed scripts (slugs differ between databases, so every
-- known slug is listed; a slug that doesn't exist simply updates nothing). Only rows still on
-- the default are touched, so re-running never overwrites a colour an admin chose.
--   Tư duy / nền tảng ('nen-tang-khoa-hoc-xa-hoi', 'logic-t-duy-phn-bin', 'critical-thinking',
--   'foundations') → blue, which is the default, so no UPDATE is needed for them.
--   Chính trị, thể chế, kinh tế & thuế → purple
UPDATE "Category" SET "color" = 'purple'
 WHERE "color" = 'blue'
   AND "slug" IN ('politics', 'chnh-tr-x-hi', 'economics', 'kinh-te-xa-hoi', 'philosophy');

commit;

-- Check:
--   select slug, name, color from "Category" order by "sortOrder";
