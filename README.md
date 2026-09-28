# TepUp

**Free, anonymous, Vietnamese-language civic-literacy lessons**: taxes, logical reasoning and digital privacy, as short, interactive, mobile-first lessons. Live at **[tepup.space](https://tepup.space)**.

- **Learners need no account.** Progress stays in the browser.
- **Contributors write courses in a block editor, under a pseudonym.** Reviewers approve content before it's published.
- **Anyone can suggest a correction** to a lesson, without an account.

This repository is the **public mirror** of the TepUp codebase. See [How changes flow](#how-changes-flow).

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 · Prisma 7 on PostgreSQL (Supabase) · NextAuth v5 · Supabase Storage · BlockNote editor · deployed on Vercel.

A tour of the code is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), and developer notes are in [`CLAUDE.md`](CLAUDE.md).

## Running it locally

You need Node 22+ and your own Supabase project, on the free tier.

```bash
cd tepup
cp .env.example .env          # fill in your own values
npm ci
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > /tmp/schema.sql
# apply /tmp/schema.sql to your database, then run the RLS lockdown below
npm run dev                   # http://localhost:3000
```

**Security defaults you should keep:**
- **Lock down the Supabase Data API.** Enable RLS on every table with no policies, revoke `anon`/`authenticated`, or switch the Data API off. The app talks to Postgres directly and doesn't need it.
- **Allowlist your own storage hosts.** Set `NEXT_PUBLIC_MEDIA_STORAGE_HOSTS` to them, e.g. `<your-ref>.supabase.co`. Media from any other host is refused, so lessons can't carry tracking pixels.

**Checks** (from `tepup/`):
```bash
npx tsc --noEmit
npx tsx scripts/test-safe-expr.ts
npx tsx scripts/test-image-sanitize.ts
npx tsx scripts/check-committed-media.ts --all
```

## How changes flow

The maintainers work in a private repository, which also holds deployment configuration. This public repository is updated from it automatically, after privacy and secret checks.

1. **Open a pull request here.** CI runs the type-check and tests. It runs with no secrets, so it's safe for forks.
2. **A maintainer imports your PR** into the private repository for review. PRs that touch CI, deployment config or dependency scripts are handled manually.
3. **When it's merged there**, it appears here in the next **sync commit**. Your PR is then closed with a link to that commit, and you're credited in it with a `Co-authored-by` line using your GitHub noreply address.

Because every commit here is a sync commit, history looks linear and authored by the mirror bot. That's intentional.

**Not a developer?** You can still help: open any lesson on [tepup.space](https://tepup.space) and use **"Góp ý sửa"** to suggest a fix, or become a contributor.

## Privacy

Many people here contribute under pseudonyms. See [`CONTRIBUTING.md`](CONTRIBUTING.md#privacy) for how to keep your identity out of your commits, images and files. To report a vulnerability, see [`SECURITY.md`](SECURITY.md).

## Licence

- **Code:** [MIT](LICENSE).
- **Lesson and story content:** [CC BY-SA 4.0](LICENSE-CONTENT.md). Credit it as "TepUp contributors".

Some fonts used on the hosted site are commercially licensed and are not included; the public build falls back to open fonts.
