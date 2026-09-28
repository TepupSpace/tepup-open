/**
 * Slug generation for Vietnamese content.
 *
 * Slugs are URL path segments: `/courses/<courseSlug>/<lessonSlug>`. They are
 * generated once at creation time and then frozen — renaming a lesson does not
 * move its URL. Uniqueness is scoped to the parent (course for lessons, story
 * for chapters), which is exactly the scope the URL disambiguates.
 */

const MAX_LENGTH = 60;

/** Convert a Vietnamese title into an ASCII slug, truncated at a word boundary. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (base.length <= MAX_LENGTH) return base;

  // Cut at the last hyphen inside the budget so we never split a word in half.
  const clipped = base.slice(0, MAX_LENGTH);
  const lastBoundary = clipped.lastIndexOf('-');
  return (lastBoundary > 0 ? clipped.slice(0, lastBoundary) : clipped).replace(/-$/, '');
}

/**
 * Return `base`, or `base-2` / `base-3` / … if it collides with `taken`.
 * `taken` must hold every slug already used within the same uniqueness scope.
 */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;

  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Slugify `name` and de-duplicate it against `taken` in one step.
 * Falls back to `fallback` when the name has no sluggable characters at all
 * (e.g. a title made entirely of punctuation).
 */
export function slugifyUnique(
  name: string,
  taken: Iterable<string>,
  fallback = 'untitled'
): string {
  return uniqueSlug(slugify(name) || fallback, taken);
}
