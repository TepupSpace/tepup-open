# Contributing to TepUp

Thank you! Code, content fixes, translations, accessibility and design help are all welcome.

## Ways to contribute

| You want to… | Do this |
|---|---|
| Fix a typo or fact in a lesson | On [tepup.space](https://tepup.space), select the text → **Góp ý sửa**. No account needed. |
| Write or co-write a course | Register as a contributor on tepup.space (username only, no email) and use the block editor. |
| Change the code | Open a pull request here (see below). |
| Report a security problem | **Don't** open an issue. See [`SECURITY.md`](SECURITY.md). |

## Pull requests

1. **Fork, create a branch, and make your change.** Keep PRs focused.
2. **Before pushing, run these from `tepup/`:**
   ```bash
   npx tsc --noEmit
   npx tsx scripts/test-safe-expr.ts
   npx tsx scripts/test-image-sanitize.ts
   npx tsx scripts/check-committed-media.ts --all
   ```
3. **Open the PR.** CI repeats those checks, with no secrets.
4. **A maintainer imports it** into the private repository for review. When it's merged there, it lands here in the next sync commit, and your PR is closed with a link and a `Co-authored-by` credit.

**Handled manually, and slower:** PRs that change `.github/`, `tepup/vercel.json`, `package.json` scripts or dependencies, `prisma/schema.prisma`, or the security modules in `tepup/lib/security/`. That's not because they're unwelcome, but because they affect deployment and safety.

**Security rules that apply to every PR** (details in `CLAUDE.md` → *Security invariants*):
- **Never `eval`/`new Function`** anything an author wrote. Formulas go through `lib/security/safe-expr.ts`.
- **Every `dangerouslySetInnerHTML`** goes through `sanitizeInlineHtml`.
- **Media URLs must pass `isAllowedMediaUrl`**. No new wildcard hosts.
- **Never store identifying data about learners or suggesters:** no IPs, user agents or emails.

## Privacy

Contributing under a pseudonym is normal here. To keep it that way:

- **Commit email.** Use your GitHub **noreply** address (GitHub → Settings → Emails → *Keep my email address private*):
  ```bash
  git config user.email "<id>+<username>@users.noreply.github.com"
  git config user.name  "<your pseudonym>"
  ```
- **Strip metadata from images, videos and PDFs before committing or uploading.** Phone photos carry GPS location and device serial numbers; PDFs and Office files carry author names.
  - `exiftool -all= -overwrite_original <file>`, or the desktop app [ExifCleaner](https://github.com/szTheory/exifcleaner).
  - For PDFs, re-export them afterwards (exiftool's PDF edits can be undone).
  - `scripts/check-committed-media.ts` will flag what's left.
- **Check what's visible,** not just the metadata: screenshots can show usernames, browser tabs, notifications or file paths.
- **Don't include real names, workplaces or locations** in code comments, commit messages or content.

## Content guidelines

Lessons follow the Mở–Thân–Kết structure in [`docs/(key-doc)-cấu-trúc-một-bài-học.md`](<docs/(key-doc)-cấu-trúc-một-bài-học.md>). Keep a neutral tone, cite sources, and stay practical: civic knowledge as self-protection, not political commentary.

## Licence of contributions

By contributing, you agree that:
- **code** is licensed under [MIT](LICENSE);
- **lesson content** is licensed under [CC BY-SA 4.0](LICENSE-CONTENT.md).
