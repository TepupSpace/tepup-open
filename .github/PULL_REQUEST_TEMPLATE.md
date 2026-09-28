## What does this change?

<!-- A short description. Link any related issue. -->

## Checklist

- [ ] `npx tsc --noEmit` passes (run from `tepup/`)
- [ ] `npx tsx scripts/test-safe-expr.ts` and `scripts/test-image-sanitize.ts` pass
- [ ] `npx tsx scripts/check-committed-media.ts --all` is clean: no EXIF/GPS or author metadata in any image or file I added
- [ ] No real names, locations, emails or secrets in code, comments, commits or screenshots
- [ ] I agree my code is MIT-licensed and any lesson content is CC BY-SA 4.0

<!-- After review, this PR is imported into the maintainers' repository. When merged, it appears here in the next sync commit, and this PR is closed with a link and a Co-authored-by credit. -->
