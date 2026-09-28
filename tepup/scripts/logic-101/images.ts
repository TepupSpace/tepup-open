/**
 * Public URLs for the lesson illustrations.
 *
 * Produced by `scripts/logic-101/upload-images.ts`, which uploads the SVGs in
 * ./assets to the target project's `course_images` Supabase Storage bucket.
 * These point at the PRODUCTION project (nuvetzmapgwvplsglgik); the same files
 * also exist in staging's bucket at the identical path.
 *
 * `add-logic-101-production.ts --apply` refuses to run while any value still
 * starts with "TODO" — a lesson must never ship with placeholder image URLs.
 * (The previous `add-logic-101-v2-course.ts` shipped `/images/placeholder/wason-2-4-6.png`,
 * which is a live 404 on staging to this day. Hence the guard.)
 */

const BUCKET_BASE =
  'https://nuvetzmapgwvplsglgik.supabase.co/storage/v1/object/public/course_images/logic-101';

export const B01_IMAGES = {
  hero: `${BUCKET_BASE}/b01-confirmation-bias-hero.svg`,
  loopDiagram: `${BUCKET_BASE}/b01-vong-lap-3-giai-doan.svg`,
};

export const B02_IMAGES = {
  hero: `${BUCKET_BASE}/b02-nguy-bien-hero.svg`,
  bridgeDiagram: `${BUCKET_BASE}/b02-so-do-cay-cau.svg`,
};
