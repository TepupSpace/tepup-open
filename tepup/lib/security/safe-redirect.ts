/**
 * Validates a post-login `?callbackUrl=`. Only same-origin relative paths are accepted,
 * so a crafted link like `/login?callbackUrl=https://evil.example` can't send someone
 * to a look-alike site right after they typed their password (open redirect).
 *
 * Accepted: `/`, `/contributor/drafts?x=1#y`. Rejected: absolute URLs, `//host`, `/\host`
 * (browsers treat `\` as `/`), and anything with control characters or whitespace, which
 * browsers strip before parsing (`/\t/host` becomes `//host`). Shared by client and server.
 */
export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 2048) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  // Backslashes, whitespace and control characters (incl. DEL and Unicode line separators).
  if (/[\\\s\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const base = 'http://same-origin.invalid';
    const url = new URL(raw, base);
    if (url.origin !== base) return null;
    const path = `${url.pathname}${url.search}${url.hash}`;
    // Dot segments can normalise into a protocol-relative URL (`/a/../..//host` → `//host`).
    return path.startsWith('//') ? null : path;
  } catch {
    return null;
  }
}
