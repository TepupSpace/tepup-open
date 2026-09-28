# Tepup — Vietnamese Civic-Literacy Learning Platform

Free, anonymous, mobile-first lessons in Vietnamese. Learners have no accounts; contributors author content, reviewers approve it, admins manage everything. For a longer tour (content model, roles, routes) see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Repo layout
- `tepup/` — the Next.js app. **The only thing that builds or deploys.** All commands below run from here.
- `docs/` — lesson-structure guideline, course source material, Logic 101 authoring pipeline (Python). Excluded from Vercel uploads.
- `tepup-design-system/` — design tokens, fonts, UI-kit previews. Not imported by the build.
- `_backups/` — JSON snapshots that scripts write before bulk content rewrites.

## Stack
- Next.js 16 (App Router only), React 19, TypeScript 5, Tailwind CSS 4, Lucide icons
- Prisma 7 on Supabase Postgres via `@prisma/adapter-pg` (pooler, see `lib/prisma.ts`)
- NextAuth v5 beta: credentials provider (username + password, **no email, Google OAuth removed on purpose**), JWT sessions, bcryptjs
- Supabase Storage for lesson images (`lib/supabase-storage.ts`, `app/api/admin/upload-image`)
- Groq powers the learner AI chat (`app/api/ai/chat`, personas in `lib/ai/personas.ts`). Anthropic powers the admin-only block builder (`app/api/admin/ai/build-block`). Authors can also paste JSON produced by their own AI: `lib/ai-import/` normalises it, and `checkBlock` in `lib/schemas/blocks.ts` checks its structure.
- BlockNote (admin editor), Sandpack (admin-defined `custom` blocks), zod 4, isomorphic-dompurify
- Vercel, region `sin1`. Installable as a PWA.

## Commands (from `tepup/`)
- `npm run dev` — dev server on :3000
- `npm run build` — `prisma generate && next build` (`postinstall` also runs `prisma generate`)
- `npm run lint` — ESLint (next core-web-vitals + typescript)
- `npx tsc --noEmit` — type-check
- ⚠️ **Prefer reviewed SQL over `npx prisma db push`.** There is no migrations folder, and `db push` applies whatever differs from the live DB, which has gone wrong before (drifted image columns nearly got dropped). Preview with `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, apply the SQL deliberately (see `tepup/prisma/sql/`), and enable RLS on every new table.
- `npx prisma studio`
- `npx tsx scripts/<name>.ts` — seed, migration and audit scripts
- `npx tsx scripts/test-safe-expr.ts` — the only automated check (no test framework). Run it after touching `lib/security/safe-expr.ts` or any block formula.

## Environments & databases
- `tepup/.env` → your development database (a Supabase project). `next dev` and the Prisma CLI read it.
- Variables are listed in `tepup/.env.example`. Never commit `.env*` (gitignored).

### Script safety conventions (follow these for new scripts)
Newer scripts (`add-block-test-course.ts`, `add-logic-101-production.ts`, `seed-stories-v2.ts`, `resolve-library-doc-slugs.ts`, …) follow these rules:
- **`--env=<path>` is required.** There is no default and no silent fallback to `.env`. Staging: `--env=.env`. Production: `--env='tepup-(.env)/.env.production'`.
- **Dry run by default.** Nothing is written without `--apply`.
- Print the target (map the Supabase project ref to STAGING/PRODUCTION) before doing anything.
- Upsert by slug so re-runs are idempotent. Snapshot affected content to `../_backups/` before bulk rewrites.
- Scripts create their own `PrismaClient` with `PrismaPg` after loading the env file. Don't import `lib/prisma.ts`, which reads `process.env` at import time.
- Older scripts (`add-*-course.ts`, `update-danchu101-*`) read `.env` implicitly. Check which DB they hit before running one.
- **Never run a script against production unless the user asks for that specific run.**

## Code map (`tepup/`)
```
app/
  (landing)/            homepage
  (courses-hub)/        /courses (course hub: paper background, character strip, cover shelf)
  (learn)/              /courses/[slug], /library, /story/[characterId]/...
  (player)/             lesson player  /courses/[slug]/[lessonSlug]
                        story player   /story/[characterId]/[storySlug]/[chapterSlug]
  (auth)/               login, register(-contributor), banned, feature-request
  (marketing)/          contributor-guide (+ /block-demo showing every interactive block)
  admin/                layout = requireAuth(); (restricted)/ = requireAdmin(); reviews/ & settings/ sit outside it
  contributor/          contributor dashboard, drafts, submissions, reviews
  dev/blocks/           block preview playground
  api/                  route handlers: admin/**, contributor/**, ai/chat, library, register, user, progress, feature-requests
components/
  learn/                LessonPlayer, BlockRenderer (the block → component map), core blocks
  blocks/               interactive block components
  admin/editor/         BlockEditor, NotionBlockEditor (BlockNote), one *BlockEditor.tsx per type
  review/               ContributionPreview, SuggestionQueue
lib/
  services/             content- (reads, cached), library-, contribution- (publish), promotion-service
  types/content.ts      ContentBlock union: the source of truth for block shapes
  schemas/              blocks.ts (zod, incl. STRICT_BLOCK_SCHEMAS), content-validation.ts
  security/             sanitize-html, safe-url, safe-expr, rate-limit, password-policy
  editor/               blocknote-converter, inline-html
  cache.ts              CONTENT_TAG / LIBRARY_TAG + revalidateContent()/revalidateLibrary()
  admin-auth.ts         requireAuth/requireAdmin/requireContributor/requireReviewer, get*Session
  role-utils.ts         USER < CONTRIBUTOR < TRUSTED_CONTRIBUTOR < REVIEWER < ADMIN
  blockLimits.ts        per-block length limits (shared by editor + scripts/audit-block-limits.ts)
prisma/schema.prisma    single schema file
scripts/                seeding / migration / audit; stories-v2/ has its own validate.ts
data/                   legacy static content, read only by migration/seed scripts
```
Path alias: `@/*` → `tepup/*`.

## Content model
```
Category → Course → Level → Lesson → LessonContent.blocks (JSON array)
Character → Story → StoryPart → Chapter → ChapterContent.blocks (JSON array)
Course ⇄ Story via CourseStoryRecommendation;  LibraryDocument (reference articles)
```
- Block types (`lib/types/content.ts`):
  - Core: `text`, `image`, `callout`, `question`, `library-document`
  - Interactive: `calculator`, `slider-simulator`, `budget-allocator`, `bias-detector`, `perspective-switch`, `hot-cold-guess`, `pair-match`, `flip-card`, `sort-bucket`, plus `custom` (Sandpack)
  - Native: `heading`, `quote`, `code`, `bullet-list`, `numbered-list`, `check-list`, `toggle`, `table`, `video`, `audio`, `file`, `step-break`
- The editor groups interactive blocks into **question** blocks (checkpoints, e.g. `question`, `pair-match`, `sort-bucket`) and **explainer** blocks (simulations that replace body text). The grouping lives in the `group` field of `blockTypes` in `components/admin/editor/block-utils.ts`.
- **Only types in `INTERACTIVE_BLOCK_MAP` (`components/learn/BlockRenderer.tsx`) render. Any other type silently renders nothing.** The key doc's "only 6 types" list is out of date; the map is the source of truth.
- Learner queries filter `isActive: true`, so an inactive course is admin-only.
- Learner progress lives only in `localStorage` (`lib/contexts/ProgressContext.tsx`). `UserProgress` and `/api/progress` exist but no client uses them.

### Adding a new block type
Touch all of these, or the block breaks somewhere:
1. Interface in `lib/types/content.ts`
2. Component in `components/blocks/` + entry in both `INTERACTIVE_BLOCK_MAP` and `BLOCK_PRELOADERS` in `BlockRenderer.tsx`
3. Strict zod schema in `lib/schemas/blocks.ts`. Contributor content is rejected otherwise.
4. Editor in `components/admin/editor/` + wiring in `BlockEditor`/`NotionBlockEditor`/`block-utils.ts`/`types.ts` + `lib/editor/blocknote-converter.ts`
5. Length limits in `lib/blockLimits.ts` if layout depends on text length

## Security invariants (branch `security/stage-1-hardening`)
Author content is untrusted: contributors self-register. Keep these rules:
- **Never `new Function`/`eval` author strings.** Calculator, slider and budget formulas and conditions go through `lib/security/safe-expr.ts` (`^` is rejected; use `**`).
- **Every `dangerouslySetInnerHTML` must go through `sanitizeInlineHtml`** (`lib/security/sanitize-html.ts`). Rich text is inline HTML only.
- **Media URLs must pass `isAllowedMediaUrl`** (`lib/security/safe-url.ts`). Only the two Supabase projects and `upload.wikimedia.org/wikipedia/` are allowed. Anything else renders `BlockedMedia` and never fetches, so the learner's IP doesn't leak. Don't add wildcard hosts.
- **Validate on save.** `validateContributionData` checks contributor content strictly and rejects `custom` and unknown types. `sanitizeAdminBlocks` handles admin saves (HTML plus media only; legacy/`custom` blocks are kept).
- Every `app/api/admin/**` route checks `getAdminSession()` itself; the layouts don't protect API routes. Contributor routes use `getContributorSession()`.
- Login, register, change-password and AI chat are rate-limited in memory (`lib/security/rate-limit.ts`, per instance). Password rules live in `lib/security/password-policy.ts`.
- Baseline security headers are set in `next.config.ts`. There is no script-src CSP yet, because Sandpack and the image hosts need testing first.
- The JWT callback in `lib/auth.ts` re-reads role and ban status every 60s, so a ban ends the session.
- **Anonymous suggestions** (`app/api/suggestions`, table `Suggestion`) must stay identity-free: never store an IP, user agent or user id on them, and always render them as plain text. They go to the reviewer queue and are never applied to content automatically. Only an ADMIN marks one APPLIED.
- **Uploads go through `sanitizeImage`** (`lib/security/image-sanitize.ts`), which strips all EXIF/GPS/XMP and uses content-hash names. Never store an uploader's original file name, and never add `.withMetadata()`/`.keepMetadata()`. Video, audio and PDF (`lib/security/media-type.ts`) are type-checked but not stripped. Before publishing the repo, `npx tsx scripts/check-committed-media.ts --all` must be clean.
- Every new `public` table needs RLS enabled with no policies, and no `anon`/`authenticated` grants. The nightly backup guard fails otherwise.

## Conventions
- Server components by default; `"use client"` only when needed. App Router only, never the Pages Router.
- Route handlers live in `app/api/<resource>/route.ts` and export GET/POST/PUT/DELETE.
- Reads go through `lib/services/content-service.ts` (`unstable_cache`, tagged). **After every successful admin content mutation, call `revalidateContent()` (or `revalidateLibrary()`)** from `lib/cache.ts`. Otherwise edits stay stale until the TTL expires.
- Slugs: use the helpers in `lib/api-helpers.ts` (`lessonSlugInCourse`, `uniqueSlugForModel`, `chapterSlugInStory`). Lesson slugs are unique per course; course and story slugs are globally unique.
- Contribution publish (`publishContribution` in `contribution-service.ts`) supports only `NEW_COURSE` and `EDIT_LESSON_CONTENT`. It re-validates the content, creates new courses hidden (`isActive: false`) until an admin activates them, and forbids self-review. Promotion is manual (auto-promotion was removed).
- Code comments and UI copy are often in Vietnamese. Match the language of the surrounding file.
- Don't edit `node_modules/`, `.next/` or the generated Prisma client.

## Course content
- **Vietnamese content: preserve diacritics exactly.**
- Creating or editing lessons **MUST** follow [`docs/(key-doc)-cấu-trúc-một-bài-học.md`](<docs/(key-doc)-cấu-trúc-một-bài-học.md>). The rules:
  - Mở-Thân-Kết structure.
  - A bias/misconception `question` at the very top; its `explanation` leads into the lesson.
  - A mandatory `question` checkpoint after every main idea (4 options).
  - 0–2 optional **explainer** blocks per lesson, replacing body text, and only types that render.
  - An `inline` `library-document` for further reading, and a `success` callout as the summary.
  - A neutral tone, with sources cited.
- Reference seed: `scripts/add-thue101v2-course.ts`. Story seeds must pass `scripts/stories-v2/validate.ts`.
- `scripts/audit-block-limits.ts` checks existing DB content against `lib/blockLimits.ts`.

## Git remotes & deployment
- **IMPORTANT**: Only push or deploy to the remotes the user explicitly requests. Do NOT auto-push to all remotes; features may need testing on staging before going to production.
- Vercel builds from `tepup/`; `.vercelignore` excludes `docs/`, `_workspace/` and env folders. Prisma and `pg` are `serverExternalPackages`.

## Grill me
- Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
