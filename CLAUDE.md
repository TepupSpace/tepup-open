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
- Groq's **free tier** powers the learner AI chat (`app/api/ai/chat`, personas in `lib/ai/personas.ts`). See [AI chat](#ai-chat-low-priority-free-tier) before touching it. Anthropic powers the admin-only block builder (`app/api/admin/ai/build-block`). Authors can also paste JSON produced by their own AI: `lib/ai-import/` normalises it, and `checkBlock` in `lib/schemas/blocks.ts` checks its structure.
- BlockNote (admin editor), Sandpack (admin-defined `custom` blocks), zod 4, isomorphic-dompurify
- Vercel (Hobby plan), region `sin1`, deployed by GitHub Actions on every push to `main` (see [Deployment](#deployment-every-push-to-main-goes-to-production)). Cloudflare sits in front: DNS, plus a 5-minute edge cache for public pages (see [Edge caching](#edge-caching-cloudflare)). Installable as a PWA.

## Commands (from `tepup/`)
- `npm run dev` — dev server on :3000
- `npm run build` — `prisma generate && next build` (`postinstall` also runs `prisma generate`)
- `npm run lint` — ESLint (next core-web-vitals + typescript)
- `npx tsc --noEmit` — type-check
- ⚠️ **Prefer reviewed SQL over `npx prisma db push`.** There is no migrations folder, and `db push` applies whatever differs from the live DB, which has gone wrong before (drifted image columns nearly got dropped). Preview with `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, apply the SQL deliberately (see `tepup/prisma/sql/`), and enable RLS on every new table.
- ⚠️ **Schema changes reach the databases before the code does.** Merging to `main` deploys immediately, so code that needs a new column or table returns errors until the SQL is applied. Apply the SQL to staging, then production, then merge.
- `npx prisma studio`
- `npx tsx scripts/<name>.ts` — seed, migration and audit scripts
- `npx tsx scripts/test-safe-expr.ts` — the only automated check (no test framework). Run it after touching `lib/security/safe-expr.ts` or any block formula.
- `docker compose up --build` — the full app against a **local, disposable** Postgres, production-like (`next build` + `next start`), on http://localhost:3000. See [Local Docker stack](#local-docker-stack). Use it to test anything that writes to the database, instead of staging.

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
  admin/editor/         BlockEditor, NotionBlockEditor (BlockNote), one *BlockEditor.tsx per type, EditorSaveBar
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

## Security invariants
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

## Admin editors: drafts and publishing
- The lesson and chapter editors (`app/admin/(restricted)/lessons/[id]/content`, `…/chapters/[chapterId]/content`) have two actions.
  - **"Lưu nháp"** (also autosave, about 3s after typing stops, and Ctrl+S) writes a `ContentDraft` row via `PUT …/draft`. **Learners never see drafts.**
  - **"Xuất bản"** (`PUT …/content`) validates and publishes to `LessonContent`/`ChapterContent`, then deletes the draft in the same transaction.
  - "Bỏ nháp" (`DELETE …/draft`) returns to the live version.
  - The sticky bar is `components/admin/editor/EditorSaveBar.tsx`. The hooks are `lib/hooks/useDraftAutosave.ts` and `lib/hooks/useUnsavedChangesGuard.ts` (a leave warning on link clicks and tab close; browser back/forward isn't blocked).
- ⚠️ **Drafts are stored unvalidated on purpose**, so half-written blocks can autosave. Never render a `ContentDraft` to learners or copy it to live content without going through the publish route's validation (`prepareBlocksForSave` plus `sanitizeAdminBlocks`). Lesson settings (slug, visibility, order) are part of the draft and only apply on publish.
- **Publishing checks for conflicts.** The client sends the live `updatedAt` it started from (`baseUpdatedAt`). If live content changed since then (another admin, or an approved contributor edit), the API returns 409 and the editor asks before overwriting (`force: true`). Anything else that writes `LessonContent`/`ChapterContent` should leave `updatedAt` to Prisma, so this check keeps working.
- Shared types are in `lib/types/drafts.ts`, and server helpers in `lib/services/draft-service.ts`. The table comes from `prisma/sql/2026-10-02-content-drafts.sql`.

## Local Docker stack
- `tepup/compose.yaml` runs `db` (Postgres 16, data in a named volume) and `app` (`tepup/Dockerfile`, built on start by `docker/entrypoint.mjs`). The entrypoint does: wait for the database → `prisma db push` as the owner → `docker/after-push.sql` (RLS on every table plus grants, as in production) → `scripts/docker-seed.ts --apply` → `next build` → `next start`.
  - `db push` is fine **only** here, because the database is disposable. Live databases still get reviewed SQL from `prisma/sql/`.
- The app connects as `tepup_app`, which can read and write rows (bypassing RLS) but not change the schema, just like production (`docker/db-init/01-roles.sql`). Permission and RLS mistakes show up locally first.
- Login is `admin` / `tepup-local-admin`; override it with `LOCAL_ADMIN_PASSWORD`. The seed creates `demo-101` (one visible and one hidden lesson) and the story `cau-chuyen-mau` (one chapter).
  - The seed and the entrypoint refuse to run unless `TEPUP_LOCAL_DOCKER=1` and the database host is `db`, so they can't touch staging or production.
- Ports are bound to 127.0.0.1. Use `TEPUP_PORT` and `TEPUP_DB_PORT` (default 3000 and 54322) to change them. Postgres is reachable at `postgresql://postgres:postgres@127.0.0.1:54322/postgres`.
- `docker compose down -v` wipes the local database.
  - No image uploads: Supabase Storage isn't part of the stack.
  - No AI chat answers unless you pass `GROQ_API_KEY`; without it the chat fails gracefully.
  - Not used by Vercel. `.dockerignore` keeps every `.env*` file and `tepup-(.env)/` out of the image.

## Deployment: every push to `main` goes to production
- `.github/workflows/deploy-production.yml` runs on every push to `main` (and on **Actions → deploy-production → Run workflow**). It uploads the repo with the Vercel CLI and a token, Vercel builds it, and the result **replaces tepup.space**. There are no preview deployments, so **pushing to `main` is a production release**. Test locally against staging first.
- **Keep the `Drop Git metadata` step (`rm -rf .git`).** On Vercel's Hobby plan, a deployment that carries commit metadata is blocked unless the commit author is the Vercel account owner ("Deployment Blocked … commit email could not be matched"). The CLI then just hangs at `Building...` until the job times out. Without `.git` the token alone authorises the upload, so anyone's commits deploy.
- **Don't use Vercel's *Redeploy* button.** It reuses the old commit metadata and gets blocked. Re-run the workflow instead. To undo a bad release: Vercel → Deployments → previous production deployment → **Instant Rollback**.
- The run ends with a **smoke test** (`/`, `/courses`, `/api/library`, `/api/suggestions`). Red means the live site returned a wrong status: check it now. A yellow warning only means Cloudflare challenged GitHub's runner.
- **The website's database role is restricted.** Production `DATABASE_URL` logs in as a role that can read and write rows (it bypasses RLS), but can't create, alter or drop anything. Schema SQL therefore runs from a developer machine with the owner connection, never from Vercel. **Don't put `DIRECT_URL` or any `postgres`-owner URL in Vercel.**
- **Vercel environment variables:** add secrets as **Type: Secret** for **Production only**.
  - Never use *All Environments*: Development values stay readable and `vercel env pull` copies them to laptops. Never point Development at the production database.
  - Changing a variable only takes effect on the next deployment.
  - Rotating `AUTH_SECRET` logs everyone out (JWT sessions).
  - `SUPABASE_SERVICE_ROLE_KEY` holds a Supabase **secret key** (`sb_secret_…`). Supabase rejects it from browsers, so `lib/supabase-storage.ts` must stay server-only.

## Edge caching (Cloudflare)
- Cloudflare caches the public pages for 5 minutes. Two parts must agree: the `Cloudflare-CDN-Cache-Control` header in `tepup/next.config.ts` (`publicPages`), and the Cloudflare Cache Rule "Public pages, anonymous only" (dashboard). Browsers still get `max-age=0`.
- ⚠️ **Pages in `publicPages` must render the same HTML for everyone.** Never read cookies, the session, request headers or `searchParams` on the server in those routes or their layouts. Per-user UI belongs in client components. A personalised server render there would be cached and **shown to every learner**.
- ⚠️ **Signed-in requests are never cached, and that protects hidden content.** `tepup/proxy.ts` serves signed-in users the staff view, hidden lessons included, **at the public lesson URL**. Cloudflare's cache ignores cookies. Caching is only safe because both the app header (`anonymousPageLoad`: the session cookies and the `rsc` header) and the Cloudflare rule skip requests that carry the session cookie, the `RSC` header or `?_rsc`. If you rename the session cookie, change `proxy.ts`, or add another per-user view at a public URL, **update `anonymousPageLoad` and the Cloudflare rule together**.
- To cache a new public route, add it to `publicPages` **and** the rule's path list; until then it's simply not cached. Never add `/api`, `/admin`, `/contributor`, `/staff-view` or auth pages.
- Content edits show within about 10 minutes (5 minutes at Cloudflare plus `revalidate = 300`). **For an urgent takedown**, hide the content in the admin, then Cloudflare → Caching → Configuration → **Purge cache** (custom URLs, or Purge Everything).
- **Don't return 502 or 504 from route handlers.** Cloudflare replaces an origin's 502/504 with its own `error code: 502` page, which hides your JSON error. Use 500 or 503.

## AI chat (low priority, free tier)
- Not a focus of the site. Keep it on free resources and make it **fail gracefully**; don't invest more without a decision.
- It runs on **Groq's free plan**: `openai/gpt-oss-120b`, falling back to `openai/gpt-oss-20b` on 404/413/429 (`app/api/ai/chat/route.ts`). `llama-3.3-70b-versatile` became enterprise-only and returns 404. Mixtral, Llama 3 8B and Gemma 2 were retired.
  - Each model's free quota is 8K tokens/minute and 200K tokens/day, **shared by every learner**. The request sizes in the route (`MAX_TOTAL_CHARS`, `MAX_REPLY_TOKENS`, `reasoning_effort: 'low'`) are tuned to fit. Don't raise them without checking Groq's current limits.
  - Check Groq's model list before changing the models; free-plan models change without notice.
- The browser shows the route's `{ error }` text **verbatim** (`ChatApiError` in `lib/contexts/AIChatContext.tsx`). So error strings must be short, Vietnamese and non-technical: no keys, model names or upstream messages. Groq SDK retries are off on purpose (`maxRetries: 0`).
- Learner text goes to an external AI service. Keep the disclaimer under the chat input, and never send an IP, user id or other identity to the AI.

## Grill me
- Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
