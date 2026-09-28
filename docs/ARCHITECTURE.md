# TepUp — Architecture Overview

TepUp is a free, anonymous, Vietnamese-language civic-literacy learning site. Learners work through short, interactive, mobile-first lessons; community contributors author courses through a block editor, and reviewers approve them before publication.

The app lives in [`tepup/`](../tepup). Everything else in the repo root is supporting material.

| Path | What it is |
|---|---|
| `tepup/` | The Next.js application (the only thing that is deployed) |
| `docs/` | Course source material, lesson-structure guideline, content-authoring workflow |
| `tepup-design-system/` | Design tokens, brand guide and UI-kit previews, packaged as a Claude skill. Not used by the build |
| `_backups/` | Ad-hoc JSON snapshots of lesson content taken before bulk rewrites |

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript 5**, **Tailwind CSS 4**
- **Prisma 7** on **Supabase Postgres** (via `@prisma/adapter-pg`); schema applied with `prisma db push` (no migrations folder)
- **NextAuth v5** (beta), credentials provider, JWT sessions, bcrypt password hashes
- **Supabase Storage** bucket `course_images` for lesson images
- **Groq** for the learner-facing AI chat; **Anthropic** for admin-only block-authoring helpers
- **BlockNote** editor, **Sandpack** for custom interactive blocks
- Deployed on **Vercel**, region `sin1` (Singapore). Installable as a PWA

## Content model

```
Category → Course → Level → Lesson → LessonContent.blocks (JSON)
Character → Story → StoryPart → Chapter → ChapterContent.blocks (JSON)
Course ⇄ Story via CourseStoryRecommendation
LibraryDocument (reference articles, rendered server-side)
```

All runtime content is stored in Postgres as JSON arrays of **blocks**. Block types are defined in [`tepup/lib/types/content.ts`](../tepup/lib/types/content.ts):

- **Core:** `text`, `image`, `callout`, `question`, `library-document`
- **Interactive:** `calculator`, `slider-simulator`, `budget-allocator`, `bias-detector`, `perspective-switch`, `hot-cold-guess`, `pair-match`, `flip-card`, `sort-bucket`
- **Native (Notion-style):** `heading`, `quote`, `code`, `bullet-list`, `numbered-list`, `check-list`, `toggle`, `table`, `video`, `audio`, `file`, `step-break`
- **Custom:** admin-defined `CustomBlockType`, rendered in a Sandpack iframe

Per-block length limits live in [`tepup/lib/blockLimits.ts`](../tepup/lib/blockLimits.ts). Every lesson follows the Mở–Thân–Kết (open–body–close) structure described in [`docs/(key-doc)-cấu-trúc-một-bài-học.md`](<(key-doc)-cấu-trúc-một-bài-học.md>).

`tepup/data/*.ts` holds legacy static content that is only read by migration/seed scripts.

## Learner experience

| Route | Purpose |
|---|---|
| `/` | Landing page (`app/(landing)/`) — three pillars: Thuế & Ta, Tư Duy & Ta, Quyền Số & Ta |
| `/courses`, `/courses/[slug]` | Course catalogue and learning path (all lessons unlocked) |
| `/courses/[slug]/[lessonSlug]` | Lesson player (`components/learn/LessonPlayer.tsx`, `BlockRenderer.tsx`) |
| `/story/[characterId]/[storySlug]/[chapterSlug]` | Character-driven story chapters |
| `/library` | Reference documents |

Learners have **no accounts**. Progress is kept only in the browser (`localStorage` key `tepup_progress_v2`, see `lib/contexts/ProgressContext.tsx`) and is carried into the installed PWA via the manifest URL. (`UserProgress` table and `/api/progress` exist but are not wired to any client.)

An AI chat panel (Groq) is available on every page, with a neutral assistant and several historical-figure personas (`lib/ai/personas.ts`). Learners can select lesson text and ask the AI to explain or fact-check it.

## Roles and contribution workflow

Roles (`UserRole`): `USER` < `CONTRIBUTOR` < `TRUSTED_CONTRIBUTOR` < `REVIEWER` < `ADMIN`. Helpers in [`lib/role-utils.ts`](../tepup/lib/role-utils.ts) and [`lib/admin-auth.ts`](../tepup/lib/admin-auth.ts). Accounts can be banned by admins.

- **Sign-up** (`/register-contributor`) takes a username and password only — no email — and creates a `CONTRIBUTOR`.
- **Contribute:** a contributor drafts a `Contribution` (status `DRAFT`), then submits it (`PENDING_REVIEW`).
- **Review:** a `REVIEWER` or `ADMIN` approves, rejects, or requests changes (feedback is required for the latter two). Nobody can review their own contribution. Each decision writes a `Review` row.
- **Publish:** approval runs `publishContribution`, which re-validates the content and creates new courses hidden (`isActive: false`) until an admin activates them. It lives in [`lib/services/contribution-service.ts`](../tepup/lib/services/contribution-service.ts). Implemented types: `NEW_COURSE` and `EDIT_LESSON_CONTENT`. (`NEW_LEVEL`, `NEW_LESSON`, `EDIT_COURSE` are defined but not yet supported.)
- **Promotion:** manual. Admins grant `TRUSTED_CONTRIBUTOR` and `REVIEWER` in Admin → Users; automatic promotion was removed.

**Anonymous suggestions:** learners, with no account needed, can suggest a fix on any published lesson or chapter. They use the pencil button in the lesson header, or "Góp ý sửa" after selecting text.
- Suggestions go to the `Suggestion` table and appear in the reviewer queue on the review pages. They never change content directly.
- Reviewers accept or reject a suggestion. An admin applies accepted ones in the content editor, then marks them applied.
- No IP or identity is stored (`app/api/suggestions`, `components/learn/SuggestEditDialog.tsx`, `components/review/SuggestionQueue.tsx`).

Not yet implemented: revision history, diffs, rollback, reader flagging, and direct edits without an account.

Admins manage everything under `/admin` (course, story, library, custom-block and user management). All `app/api/admin/**` routes check for an admin session.

## Code map

```
tepup/
├── app/
│   ├── (landing)/        landing page
│   ├── (learn)/          course catalogue, library, story index
│   ├── (player)/         lesson and story-chapter players
│   ├── (auth)/           login, contributor registration, banned notice, feature requests
│   ├── (marketing)/      contributor guide and static pages
│   ├── admin/            admin dashboard; (restricted)/ requires ADMIN
│   ├── contributor/      contributor dashboard, drafts, reviews
│   ├── dev/blocks/       block preview playground
│   └── api/              REST route handlers (admin/, contributor/, ai/, library/, register, …)
├── components/           UI; blocks/ = interactive blocks, learn/ = player, admin/editor/ = BlockNote editor
├── lib/
│   ├── services/         content-, library-, contribution-, promotion-service
│   ├── types/            block and content type definitions
│   ├── schemas/          zod schemas for blocks
│   ├── auth.ts           NextAuth config
│   ├── prisma.ts         Prisma client
│   └── supabase-storage.ts
├── prisma/schema.prisma  single schema file
└── scripts/              seeding, migration and audit scripts (run with `npx tsx`)
```

Reads go through `lib/services/content-service.ts`, cached with `unstable_cache` (5-minute TTL plus tag revalidation, `lib/cache.ts`).

## Running locally

From `tepup/`:

```bash
cp .env.example tepup-(.env)/.env   # fill in values; never commit
npm install
npx prisma db push                  # sync schema to the database in DATABASE_URL
npm run dev                         # http://localhost:3000
```

Environment variables are listed in [`tepup/.env.example`](../tepup/.env.example): database URLs, NextAuth secret/URL, Supabase URL and service-role key (server-only), Groq and Anthropic API keys, optional Google OAuth, and admin-bootstrap variables for `scripts/create-admin.ts` / `scripts/cleanup-and-setup-admin.ts`.

### Scripts

`tepup/scripts/` contains one-off seeding and maintenance scripts (≈50). Newer scripts require explicit `--env <staging|production>` and `--apply` flags and write a JSON snapshot to `_backups/` before modifying content. Course material and a Python authoring pipeline for Logic 101 live in `docs/content-course-Logic-101/`.

## Deployment

- Vercel builds with `prisma generate && next build` (`postinstall` also runs `prisma generate`).
- `vercel.json` pins the region to `sin1`; `.vercelignore` excludes `docs/`, drafts and env folders.
- Prisma and `pg` are marked as server-external packages in `next.config.ts`.
