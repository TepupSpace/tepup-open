# Design: references, glossary and toolbox in the library

**Status:** approved 13.10.2026; being built on `feat/reference-library` · **Date:** 13.10.2026 · **Scope:** platform-wide (every course and every story)

## 1. Summary

Lessons today cite sources in four different ways: plain external links, a `library-document` card that opens a whole article in a modal, nothing at all, or a URL pasted into the text. This design replaces those with **one reference system built on the library**:

- **Every reference is a library entry.** There are five entry types: topic, source, glossary term, acronym and tool. Every external source has its own entry, and the relationships between entries are defined once, in the library.
- **Lessons link to entries with one link form, `/tv/<slug>`.** That form works in every block type.
- **Two levels of detail when a learner follows a link.**
  - A **preview** (at most two sentences) appears on hover (desktop) or one tap (phone).
  - A **side panel** with the full entry opens on click, or from the preview's "Mở" button on a phone. Links inside a panel open a narrower panel stacked on top, and the lesson stays visible on the left.
- **One glossary for the whole platform.** Every term belongs to exactly one framework or topic, and acronyms are a separate list.
- **Learner features.** Learners can:
  - suggest a term;
  - save terms to a personal list (kept in the browser, since learners have no accounts);
  - see every lesson and chapter that uses a term.
- **The toolbox (Tủ công cụ)** becomes an entry type with a named owner and a review-by date, so time-sensitive advice says when it was last checked.

Existing content keeps working. Every current `library-document` block keeps opening the same document, and every course and story is regression-tested before and after each phase (§10).

---

## 2. What exists today

The design depends on these facts about the current code and content.

|Area|Current state|Consequence for this design|
|---|---|---|
|`LibraryDocument` (prisma/schema.prisma)|`slug`, `title`, `description`, `category`, `icon`, `content` (JSON: `sections[{heading, paragraphs[]}]`, `relatedConcepts`, `furtherReading`), `updatedAt`. No owner, review date or relations.|Many-to-many relations (one source under several topics) need new tables.|
|`library-document` block (`components/learn/LibraryDocumentBlock.tsx`)|Reference mode (`documentId` or `documentSlug`, fetched from `/api/library/[id]`, which accepts both) or inline mode. Shows a card that opens the **whole document in a modal**. No section anchors, and no date shown.|It stays, for backward compatibility (§9). New references use links instead.|
|`/library` page (`components/library/LibraryBrowser.tsx`)|Server-rendered list, client-side category filter and search. The open document lives in component state, so **no URL opens a specific document**.|The new panel gets a shareable URL state (§6.5).|
|Rich text in `text` blocks (`BlockRenderer.tsx` → `sanitizeInlineHtml`)|**The sanitiser (`lib/security/sanitize-html.ts`) only allows `http`, `https` and `mailto` links.** It removes every `data-*` attribute and forces every link to open in a new tab.|An internal link such as `/tv/slug` is **stripped today**. The sanitiser needs one narrow exception (§5.2).|
|Plain-string fields (question explanations, callouts, flip-cards, sort, pair, perspective, bias, calculator, simulator, hot-cold, `TextBlock.paragraphs`)|Rendered with `lib/utils/renderInlineMarkdown.tsx` (bold, italics, code, `[text](href)` and bare URLs). `SAFE_HREF` already allows `/` paths, but links always open in a new tab.|This is the **second renderer**. Both renderers must route `/tv/` links to the same component, or references work in some block types and not others.|
|Learners|**No accounts.** Progress lives in `localStorage` (`tepup_progress_v2`) and travels into the installed PWA.|Saved terms are stored the same way (§7.2).|
|Anonymous suggestions (`Suggestion`, `SuggestionTarget = LESSON \| CHAPTER`)|Learners can already suggest fixes without an account. Editors review them.|"Suggest a term" extends this table instead of adding a new one (§7.1).|
|Schema changes|`prisma db push` with no migrations folder. Every table has RLS plus grants (`docker/after-push.sql`). Production schema SQL runs from a developer machine with the owner connection.|New tables need RLS and grants in `after-push.sql` and in the production SQL.|
|Tests|**No test runner.** There are ad-hoc scripts (`audit-block-schemas.ts`, `find-used-library-docs.ts`, `test-*.ts`).|Phase 0 adds a test harness before anything else changes (§10).|
|Content using the library (local Docker DB, 13.10.2026; **recount on staging before migrating**)|23 library documents in 12 categories. 24 `library-document` blocks in lessons, across three courses. **90 story chapters** contain a `library-document` block. 26 lesson blocks contain raw `http` URLs.|Stories are in scope, and they are the largest group of existing references.|

---

## 3. Vocabulary

|Term (UI, Vietnamese)|Meaning|
|---|---|
|**Mục thư viện**|Any library entry, of any type|
|**Mục từ**|Any piece of knowledge: a concept, term, topic or framework. One type, no hierarchy; entries link to each other as a network (§4.2). *(Replaces Chủ đề, Thuật ngữ, Lĩnh vực and Bài đọc, 14.10.2026.)*|
|**Nguồn**|One external source: a book, paper, article, law, podcast, dataset or website|
|**Viết tắt**|An acronym, which points to a Mục từ|
|**Công cụ**|A toolbox entry (Tủ công cụ): time-sensitive, practical advice with a review date|
|**Xem nhanh**|The hover or tap preview|
|**Bảng bên**|The side panel|

---

## 4. Data model

### 4.1 Tables

One entry table with a `type` column, plus one link table. This keeps a **single slug namespace**, so `/tv/<slug>` resolves without knowing the type, and gives one place for search, RLS and admin. Type-specific fields live in a `meta` JSON column, validated by one schema per type (§4.4).

```prisma
enum LibraryEntryType { CONCEPT SOURCE ACRONYM TOOL }
// CONCEPT = Mục từ: every concept/term/topic, including migrated LibraryDocuments (§9.2).

model LibraryEntry {
  id        String           @id @default(cuid())
  slug      String           @unique            // lowercase a-z0-9-, no diacritics
  type      LibraryEntryType
  title     String                              // shown in the preview and the panel header
  summary   String                              // the preview: at most 2 sentences / 200 chars, written separately
  body      Json?                               // sections[{heading?, paragraphs[]}] -- same shape as today
  meta      Json             @default("{}")     // per-type fields, §4.4
  isActive  Boolean          @default(true)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  linksFrom LibraryLink[]    @relation("from")
  linksTo   LibraryLink[]    @relation("to")
  usages    LibraryUsage[]
  @@index([type])
}

enum LibraryLinkKind {
  RELATED     // CONCEPT|TOOL <-> CONCEPT|TOOL  (undirected, stored once; shown on both entries)
  CITES       // CONCEPT|TOOL -> SOURCE         (the "static" link from an entry to its source)
  EXPANDS_TO  // ACRONYM -> CONCEPT|TOOL
  MENTIONS    // any -> any: a /tv/ link inside the entry's own text. Built by the server on
              // every save, never edited by hand; gives backlinks ("Được nhắc đến trong").
}

model LibraryLink {
  fromId String
  toId   String
  kind   LibraryLinkKind
  order  Int @default(0)
  from   LibraryEntry @relation("from", fields: [fromId], references: [id], onDelete: Cascade)
  to     LibraryEntry @relation("to",   fields: [toId],   references: [id], onDelete: Cascade)
  @@id([fromId, toId, kind])
  @@index([toId, kind])
}

/// Reverse index: which lessons and chapters link to an entry. Rebuilt on publish (§7.3).
model LibraryUsage {
  entryId    String
  targetType SuggestionTarget   // LESSON | CHAPTER (reuses the existing enum)
  targetId   String
  count      Int
  entry      LibraryEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  @@id([entryId, targetType, targetId])
  @@index([targetType, targetId])
}
```

`LibraryDocument` is never altered. Its rows are copied into `LibraryEntry` as Mục từ or Nguồn entries **with the same `id` and `slug`** (§9.2).

### 4.2 Mục từ: one type, linked as a network (decided 14.10.2026)

The first design had four overlapping kinds of knowledge entry: Chủ đề (topic, with sub-kinds concept / framework / issue), Thuật ngữ (term, defined inside exactly one topic), Lĩnh vực (a parent topic for browsing) and Bài đọc (a migrated document). The lines between them were not definite, so authors and learners could not tell which to use. Like Wikipedia, the library now has **one** kind, the Mục từ, and organises it as a **network, not a hierarchy** (think Obsidian's graph view):

- **Liên quan** (`RELATED`): an author links two entries that belong together. The link is undirected: it is stored once and shown on both entries.
- **Links in the text** (`MENTIONS`): any `/tv/` link inside an entry's summary or body also connects the two entries. The server rebuilds these on every save, so the linked entry shows "Được nhắc đến trong" (backlinks) without anyone maintaining it.
- **Nguồn** (`CITES`): an entry cites its sources; a source lists "Được trích trong".
- **Viết tắt** (`EXPANDS_TO`): an acronym points to the entries it stands for.

**Same word, different meaning.** Two entries may share a word; the meaning goes in brackets at the end of the title, as on Wikipedia: "Giám sát (thông tin)", "Giám sát (dịch tễ)". An entry's panel lists the others under "Cùng tên" (same title once the bracket is dropped).

**Browsing.** `/thu-vien` lists every Mục từ A–Z. The network itself is browsed by following links in the panels, and as a whole on the map (§7.5).

### 4.3 How the static linkage works

A reference source is defined once, as a SOURCE entry. An entry that needs it holds a `CITES` link to that source. A lesson never links a source to an entry itself: lessons link to the entry (or to the source), and the entry's citations come from the library. Fixing a source's details is one edit, and every term and lesson that uses it updates.

### 4.4 Per-type fields (`meta`, validated in `lib/schemas/`)

|Type|`meta` fields|
|---|---|
|CONCEPT|`titleEn?` (English or original name, shown beside the title), `pronunciation?`|
|SOURCE|`sourceType: 'sach' \| 'bai-bao-khoa-hoc' \| 'bao-chi' \| 'van-ban-phap-luat' \| 'podcast' \| 'video' \| 'trang-web' \| 'du-lieu'`, `authors: string[]`, `year?`, `date?` (ISO), `containerTitle?` (journal, outlet, show), `publisher?`, `url?`, `archivedUrl?`, `accessedAt?`, `language: 'vi' \| 'en' \| …`, `identifier?` (DOI, ISBN, document number), `durationMin?` (audio and video), `lastCheckedAt?` *(reserved for the parked link checker, §11)*|
|ACRONYM|`expansion`, `expansionVi?`|
|TOOL|`owner`, `reviewBy` (ISO date), `tiers: [{level: 'co-ban' \| 'tot-hon' \| 'ky-luong', what, minutes, limits, picks: [{name, url}]}]`|

Validation rules:

- `summary` is 200 characters at most and ends with a full sentence.
- An ACRONYM has at least one `EXPANDS_TO` link.
- A SOURCE has a `url`, unless its `sourceType` is `sach` or `van-ban-phap-luat` with an `identifier`.
- **No two SOURCE entries for the same document** *(added 14.10.2026)*. On save the server computes `LibraryEntry.sourceKey` (unique column) from the URL, or from the identifier when there is no URL (`lib/library/source-key.ts`). The key ignores what does not change the document: http/https, `www.`/`m.`, a trailing slash, `#fragment`, tracking parameters (`utm_*`, `fbclid`, …) and parameter order. It also unwraps web.archive.org copies, unifies DOI links with `doi:` identifiers, ISBN-10 with ISBN-13, and youtu.be with youtube.com. Authors are warned before they save, in three places:
  - pasting a link into the editor's reference search shows the existing source first ("Đã có nguồn cho link này") and hides "Tạo mục Nguồn từ link này";
  - the quick-create form and the full entry editor check the URL and identifier as they are typed (`/api/admin/library-entries/check-source`) and offer the existing entry;
  - the save itself is refused with a link to the existing entry.

---

## 5. Linking from content

### 5.1 Link form

The form is `/tv/<slug>`, where *tv* stands for thư viện. Authors write it as an ordinary link, in both rich text and markdown fields:

- Rich text: select the phrase → "Chèn tham chiếu" → pick an entry. The editor writes `<a href="/tv/legibility">tính khả đọc</a>`.
- Markdown fields: `[tính khả đọc](/tv/legibility)`. The same picker inserts this.

Optional section anchor: `/tv/<slug>#<section-index>` opens the panel scrolled to that section of the body.

Why slugs and not ids: slugs are readable in content JSON, they survive export and import between environments, and they make the reverse index and link checks a plain text scan.

### 5.2 Changes to the two renderers

1. **Sanitiser** (`lib/security/sanitize-html.ts`):
   - Allow `href` values that match **exactly** `^/tv/[a-z0-9-]+(#[0-9]+)?$`, and nothing else relative.
   - In the post-sanitise hook, give those links `data-tv="<slug>"` and do **not** force `target=_blank` on them.
   - Every other rule stays as it is: `javascript:`, `data:`, protocol-relative `//` and other paths are still stripped.
2. **`renderInlineMarkdown`:** when `linkHref` matches the same pattern, render `<RefLink slug>` instead of `<a target=_blank>`.
3. **One component handles both.** A `ReferenceProvider` wraps the lesson and chapter players. Markdown fields render `<RefLink>` directly. Sanitised HTML (rendered with `dangerouslySetInnerHTML`, so no React components inside) is handled by **event delegation**: the provider listens for pointer, focus and click events on `a[data-tv]`. Both paths open the same preview and panel.

### 5.3 Rule: every external link has an entry

New content may not contain raw external URLs. The editor offers "Tạo nguồn từ link này", which pre-fills a SOURCE entry from the URL and replaces the link with `/tv/<slug>`.

The rule is enforced in two steps:

- **Warn first:** the editor shows a warning, and an audit script reports violations.
- **Then error:** once phase 5 has converted existing content, the warning becomes a publish-blocking error.

The 26 blocks that currently contain raw URLs are converted in phase 5.

---

## 6. Interaction design

### 6.1 States

|Trigger|Desktop|Phone (≤ 768 px)|
|---|---|---|
|Discover|Reference links get a subtle dotted underline, which marks them apart from external links. External links (allowed only inside entries) get ↗.|Same.|
|**Xem nhanh**|Hover for 150 ms, or keyboard focus. Closes when the pointer leaves the link and the card.|**One tap** opens the preview card, anchored to the link. A tap outside closes it.|
|**Bảng bên**|Click opens the panel on the right.|The preview card's **"Mở"** button opens a full-height sheet.|
|Nested link|Opens a **narrower panel stacked on top**: the first panel is 440 px, and each further panel is offset 32 px and 24 px narrower. The lesson stays visible on the left.|Pushes a new layer on the sheet, with a breadcrumb (*Bài học › Chủ đề › Nguồn*) for jumping back.|
|Close|× closes the top panel, Esc closes one layer at a time, and clicking the lesson closes them all.|Swipe down or ‹ goes back one layer; × closes them all.|

**Why not double-tap on phones:** it conflicts with browser double-tap zoom, nobody discovers it, and a slow double-tap registers as two single taps. One tap plus an explicit "Mở" button does the same job.

**Depth limit:** 4 panels. A fifth link replaces the top panel, so the stack never covers the lesson.

### 6.2 Preview card contents by type

|Type|Preview card|
|---|---|
|CONCEPT|Title (with the English name, if any), summary|
|ACRONYM|Acronym → its expansion, plus the summary of the term or topic it expands to|
|SOURCE|Formatted short citation (§8), type icon, summary|
|TOOL|Title, summary, "Cập nhật: dd/mm/yyyy", plus an "Cần rà soát" badge if `reviewBy` has passed|

### 6.3 Panel contents

- **Header:** type label, title, and a ☆ button that saves the entry (§7.2).
- **Body sections**, with any references inside them live (nested panels).
- **Per-type blocks:**
  - Mục từ and Công cụ: "Nguồn" (its `CITES` links, as formatted citations), "Liên quan" (both directions), "Được nhắc đến trong" (backlinks from other entries' text), "Viết tắt" (acronyms pointing here), "Cùng tên", and "Xem trên bản đồ thư viện".
  - SOURCE: full citation, "Mở nguồn ↗" (and "Bản lưu trữ" if archived), "Được trích trong".
  - TOOL: the tiers (Cơ bản / Tốt hơn / Kỹ lưỡng) with time needed, limits and picks, owner, review date.
- **Footer:**
  - "Xuất hiện trong" (from the reverse index, §7.3);
  - "Góp ý về mục này" (opens a suggestion, §7.1).

### 6.4 Accessibility

- The preview has `role="tooltip"`, is linked to its link with `aria-describedby`, and is reachable by keyboard focus.
- The panel has `role="dialog"`, takes focus on open, returns focus to its link on close, and traps focus within the top panel.
- Tap targets are at least 44 px. Reduced-motion preferences disable the slide animations.
- Colours come from theme tokens (dark mode is planned), never from literals.

### 6.5 URL state

An open panel stack is reflected as `?tv=slug1,slug2`. A shared or reloaded URL reopens the same panels over the lesson. The `/library` page uses the same parameter, which also fixes "no URL opens a document".

### 6.6 Performance and offline use

- When a lesson loads, one request (`GET /api/tv/preview?slugs=a,b,c`) fetches the previews for every reference in it. Hovering is then instant, and previews work offline in the installed app.
- Full entries load on panel open (`GET /api/tv/<slug>`). Both endpoints are public and fit the existing 5-minute edge cache.

---

## 7. Learner features

### 7.1 Suggest a term

The existing anonymous `Suggestion` gets two new targets:

- `SuggestionTarget.LIBRARY_ENTRY`: a suggestion about an existing entry, with `targetId` = the entry id.
- `SuggestionTarget.NEW_ENTRY`: a new term. `targetId` = the lesson or chapter where the learner made the suggestion; `quote` = the phrase; `proposal` = the proposed term or definition.

Both flow into the existing review queue, so no new moderation surface is needed.

**Entry points:**

- "Đề xuất thuật ngữ" in the selection menu, next to the existing "Góp ý sửa".
- "Góp ý về mục này" in the panel footer.

### 7.2 Personal saved list

Saved terms live in `localStorage` under `tepup_saved_entries_v1` (a list of `{slug, savedAt}`), the same model as progress, and carry into the PWA.

- Saving is the ☆ in the panel header.
- The list is at **/thu-vien/da-luu**, and shows current titles and previews fetched from the batch endpoint.
- If an entry is deleted or renamed, the list shows "Mục này không còn" with an option to remove it.
- The list is not synced across devices. That follows from having no accounts, and the page says so.

### 7.3 Where an entry is used (reverse index)

`LibraryUsage` is rebuilt for a lesson or chapter **whenever it is published**: a scan of its block JSON for `/tv/<slug>` (and for `library-document` references). Admin and seed scripts that write content call the same rebuild function. A full rebuild script (`scripts/rebuild-library-usage.ts`) backfills every lesson and chapter, and runs after the phase 5 migration.

The panel footer lists **"Xuất hiện trong"** with course or story, lesson or chapter title, and a link. Only active, published content is listed.

### 7.4 Library pages

All tabs share one layout (`app/(learn)/thu-vien/(tabs)/layout.tsx`): the "Thư viện" heading, the search box, "Đề xuất mục mới" and the tab bar sit in the layout, so they do not move when switching tabs, and every tab uses the same column width. The page also reserves the scrollbar's space (`scrollbar-gutter: stable`), so a long tab and a short tab line up.

|Page|Shows|
|---|---|
|**/thu-vien** (Mục từ)|Every Mục từ A–Z (Vietnamese collation), with a letter index|
|**/thu-vien/nguon**|Every source, grouped by kind (sách, bài báo khoa học, báo chí…), with its short citation|
|**/thu-vien/viet-tat**|All acronyms with their expansions|
|**/thu-vien/tu-cong-cu**|The toolbox (§9.1)|
|**/thu-vien/ban-do**|The map (§7.5)|
|**/thu-vien/da-luu**|The learner's saved entries (§7.2)|
|**/thu-vien/muc/<slug>**|Any entry's full page (the same content as its panel), for sharing and SEO|

`/library` and `/thu-vien/thuat-ngu` redirect to `/thu-vien`.

### 7.5 Map (Bản đồ)

`/thu-vien/ban-do` draws every entry as a dot and every link (of any kind) as a line, like Obsidian's graph view. Dot size grows with the number of links; colour shows the type, and checkboxes hide a type or the entries that have no links yet. Hovering or focusing a dot lights it and its neighbours and dims the rest; clicking (or Enter) opens the entry in the side panel, because each dot is an ordinary `/tv/` link. `?muc=<slug>` (the "Xem trên bản đồ thư viện" link in a panel) centres and highlights one entry. The layout follows Obsidian's graph view (its `sim.js` is d3-force in a Web Worker): a pull to the centre, springs along links with strength 1/min(degree) so a hub doesn't drag its leaves around, repulsion between every pair, and collision so dots never overlap. It cools over about 300 ticks (`lib/library/graph-layout.ts`, no extra dependency). The starting layout is computed once on the server and cached with the graph data. Repulsion is stronger than Obsidian's scaled default, because at the library's size the default lets clusters run into each other.

Behaviour on the page (`components/reference/LibraryGraph.tsx`):
- **Filtering doesn't re-lay the map.** The remaining dots keep their places and glide to new ones when the simulation is reheated.
- **Dragging a dot** pins it under the pointer, and the dots linked to it follow. A drag only starts after the pointer moves 5px, so a click still opens the entry.
- **Zoom** is Ctrl/⌘ + scroll (trackpad pinch counts as this), a two-finger pinch, or the buttons. It eases toward the pointer. A plain scroll still scrolls the page.
- **Hover and focus** fade everything unrelated to 20% opacity. Edges run from rim to rim, and dots grow with √zoom.
- **Labels never overlap.** Priority goes to the highlighted dot, then its neighbours, then the most-linked entries, so more labels appear as you zoom in. They are text-xs (rem), so they follow the reading-size setting.
- **With `?muc=`, a "Phạm vi" control** limits the map to entries 1–3 links away, like Obsidian's local graph.
- **Reduced motion:** with "prefers-reduced-motion", nothing animates; dots and the view jump straight to their new places.

A "Xem dạng danh sách" list gives the same information to keyboard and screen-reader users.

---

## 8. Citation display

The goal is the friendliest possible format. That means plain Vietnamese labels, no academic punctuation puzzles, and the most useful facts first. One formatter (`lib/library/formatCitation.ts`) produces both a **short form** (previews, topic lists) and a **full form** (the source panel).

|sourceType|Short form|Full form|
|---|---|---|
|sach|James C. Scott (1998). *Seeing Like a State*.|📕 Sách · James C. Scott · 1998 · *Seeing Like a State* · Yale University Press · ISBN …|
|bai-bao-khoa-hoc|Kramer và cộng sự (2014), *PNAS*.|📄 Bài báo khoa học · Adam Kramer, Jamie Guillory, Jeffrey Hancock · 2014 · "Experimental evidence of massive-scale emotional contagion…" · *PNAS* · DOI …|
|bao-chi|*TIME*, 06/10/2026.|📰 Báo chí · Harry Booth · *TIME* · 06/10/2026 · "Meta's Muse AI Agent Is Building a Dossier On You"|
|van-ban-phap-luat|Luật số 91/2025/QH15.|⚖️ Văn bản pháp luật · Luật Bảo vệ dữ liệu cá nhân · số 91/2025/QH15 · ban hành …, hiệu lực 01/01/2026|
|podcast|*Planet Money* (NPR), 02/09/2026.|🎧 Podcast · *Planet Money* (NPR) · "Love in the time of Palantir" · 02/09/2026 · 25 phút · có bản ghi lời|
|trang-web / video / du-lieu|Tên trang, năm.|Matching pattern, with type icon|

Formatting rules:

- Authors: one or two names are listed in full; three or more become "X và cộng sự" in the short form and are listed in full in the full form.
- Dates use dd/mm/yyyy.
- A non-Vietnamese source shows a language badge (EN, FR…).
- A source with an archived copy shows "Bản lưu trữ".
- Titles stay in their original language; an optional Vietnamese gloss can follow in brackets.

---

## 9. Toolbox (Tủ công cụ) and legacy library documents

### 9.1 Toolbox

Each toolbox topic is a TOOL entry, e.g. `cong-cu-mat-khau`, `cong-cu-xac-thuc-hai-lop`. Lessons describe the *property* to look for (for example "dùng trình quản lý mật khẩu") and link to the TOOL entry, which names the current picks.

- **Review dates:** when `reviewBy` passes, the preview and panel show "Mục này đã quá hạn rà soát; hãy tin bài học hơn tin tủ". The admin library list shows overdue entries first.
- **Toolbox front page:** **/thu-vien/tu-cong-cu** lists all TOOL entries with their "Cập nhật" dates.

### 9.2 Legacy library documents: one library (decided 14.10.2026, §12 decisions 4 and 6)

The old "Bài đọc" documents (`LibraryDocument`) are folded into the library instead of living beside it:

- **Converted, not copied.** `scripts/reclassify-library-documents.ts` turns each document into a Mục từ, except those listed in `scripts/library-reclassification.json`, which become Nguồn entries with proper citation fields (papers, a book, a news story, encyclopedia entries). Each **keeps its `id` and `slug`**. "Khái niệm liên quan" that match another entry's title become `RELATED` links (the text is kept in the body too). The script also fills `sourceKey` on older SOURCE entries. Dry run by default; refuses on any slug or source-key clash; snapshots to `_backups/`; verifies afterwards; only adds links. `LibraryDocument` itself is left untouched as the way back.
- **Blocks keep working.** `/api/library` and `/api/library/[id]` read `LibraryEntry` first (by id or slug) and fall back to `LibraryDocument` (`lib/library/document-compat.ts`). Inside a lesson, the card's "Xem tài liệu" opens the entry in the same side panel as a `/tv/` link (`useOpenEntry()` from `ReferenceProvider`); without the provider (flag off) it opens the old modal. The block editor lists entries.
- **One place to browse and one to edit.** `/library` permanently redirects to `/thu-vien`. In admin, the sidebar has a single "Thư viện" (`/admin/library-entries`); `/admin/library` redirects there, and `/admin/library/<id>` redirects to the entry editor once that document has been converted.
- `LibraryDocument` is dropped only after a full release in which every lesson and story check (§10) passes reading from the new table.
- **Optional, per course, never automatic:** an editor may convert a `library-document` card into an inline `/tv/` link where that reads better.

### 9.3 "Làm ngay" steps

This part is lesson content, not code. A lesson's action step is a `question` block ("Bạn đã làm bước nào?") whose explanation does the teaching and links to the TOOL entry. Making the native `check-list` block interactive (and saving ticks in `localStorage`) is a separate, later change.

---

## 10. Testing (no course or story may break)

The repo has no test runner today. **Phase 0 builds the harness before anything else changes.**

|Layer|Tooling|What it proves|
|---|---|---|
|**Golden render baseline**|`scripts/snapshot-render.ts`. It renders **every published lesson and chapter** (all courses, all stories) from a staging export with the *current* code, to normalised HTML and plain text plus block-count manifests, saved under `_backups/render-baseline-<date>/`.|There is a "before" to compare against.|
|**Regression diff**|The same script, run with the new code. CI-style comparison against the baseline.|Output is **identical** except where content deliberately gained `/tv/` links. Block counts per lesson are unchanged. Any other difference fails.|
|**Unit tests**|Add **Vitest**.|Sanitiser: `/tv/slug` allowed; `javascript:`, `data:`, `//evil`, `/tv/../x` and `/admin` still stripped. Markdown parser routes `/tv/` links. Citation formatter output per source type. Slug and anchor parsing. `meta` validation per type.|
|**Content audits**|Extend `audit-block-schemas.ts`; add `audit-library-links.ts`.|Every `/tv/<slug>` in content resolves to an active entry. Every legacy `library-document` reference resolves. No orphan entries (warning). Raw external URLs in content are reported (warning, then error after phase 5). Every ACRONYM has an `EXPANDS_TO` link.|
|**Migration checks (phase 5)**|`reclassify-library-documents.ts` (verifies after writing)|Every `LibraryDocument` has an entry with the same id, slug, title, status and planned type. All 24 lesson and 90 chapter `library-document` blocks (local count; recount on staging) open the same title and content as before.|
|**End-to-end**|Add **Playwright**, run against the local Docker stack.|For **every course and every story**: the first lesson or chapter loads, every block renders, and Continue works. For a reference-heavy sample: hover preview, click panel, nested stack, Esc and focus, `?tv=` reload. Phone viewport (375 px): tap preview, "Mở", sheet layers, breadcrumb, swipe-close. Offline PWA: previews still show.|
|**Performance**|Lighthouse on 3 representative lessons|No regression in load time; the preview batch response stays small.|

**Rollout per phase:**

1. Run in the local Docker stack and get your explicit OK.
2. Deploy to staging, re-run the full suite there, and get your explicit OK.
3. Deploy to production, with the new reader UI behind a feature flag (`NEXT_PUBLIC_TV_REFERENCES`) for the first release.
4. Take a pre-migration JSON snapshot in `_backups/`, on top of the nightly B2 backups.
5. Apply schema SQL (with RLS and grants added to `docker/after-push.sql` and the production SQL) from a developer machine with the owner connection, never from Vercel.

---

## 11. Phases

|Phase|Delivers|Learner-visible?|
|---|---|---|
|**0 · Harness**|Vitest, Playwright, golden render baseline, audit scripts|No|
|**1 · Model and admin**|`LibraryEntry`, `LibraryLink`, `LibraryUsage` with RLS; admin CRUD for all five types with link pickers; `meta` validation; citation formatter|No|
|**2 · References in lessons**|Sanitiser and markdown changes; `ReferenceProvider`; preview card; side panel and phone sheet; `?tv=` URL state; editor "Chèn tham chiếu" and "Tạo nguồn từ link này"; preview batch API. Behind the flag.|Yes (flagged)|
|**3 · Glossary and learners**|Glossary, acronym and topic pages; reverse index and its rebuild; saved list; `Suggestion` targets for entries|Yes|
|**4 · Toolbox**|TOOL entries, review banner, toolbox page; the first toolbox entries|Yes|
|**5 · Migrate and convert**|`LibraryDocument` → Mục từ / Nguồn (same ids, §9.2); `/api/library` fallback; convert the 26 raw-URL blocks to SOURCE entries; raw-URL rule becomes an error; drop `LibraryDocument` one release later|No visible change|

### Build status (13.10.2026, branch `feat/reference-library`)

|Phase|Status|
|---|---|
|0|Done: Vitest (`npm test`), `scripts/snapshot-render.ts`, `scripts/audit-library-links.ts`, browser tests in `a11y-e2e/tests/references*.spec.ts`.|
|1|Done. SQL in `tepup/prisma/sql/2026-10-13-library-entries.sql`, applied locally only.|
|2|Done, behind `TEPUP_TV_REFERENCES`. Route names as decided in §12: `/tv/<slug>` → `/thu-vien/muc/<slug>`.|
|3|Done: glossary, acronyms, saved list, reverse index on every publish path, suggestions (`LIBRARY_ENTRY`, `NEW_ENTRY`).|
|4|Done: TOOL entries, overdue banner, `/thu-vien/tu-cong-cu`.|
|5|Replaced by Option B (§9.2, 14.10.2026): `scripts/reclassify-library-documents.ts` with `scripts/library-reclassification.json` (all 29 staging documents mapped; dry run clean on staging; applied locally). `/api/library*` read entries first. Converting the existing raw URLs into SOURCE entries is editorial work (83 URLs in 25 staging lessons on 13.10.2026).|

Not built from this design: an in-editor warning for raw external URLs (the audit script reports them instead).

### Parked (not in scope now)

- **Dead-link checker:** a scheduled job that fills `meta.lastCheckedAt` and flags failing SOURCE URLs. The fields are reserved in §4.4, so nothing about this design blocks it.
- **Tickable `check-list`.**
- **Saved list synced across devices.** It would need accounts.

---

## 12. Decisions (13.10.2026)

1. **Path names:** links in content are `/tv/<slug>`. A direct visit to `/tv/<slug>` redirects to the entry's page at `/thu-vien/muc/<slug>` (one page route for every type). The list pages live under `/thu-vien/...` (§7.4).
2. **Glossary terms are never linked automatically.** Every reference is a link an author added on purpose.
3. **Previews are not inlined into the lesson's server render.** They come from the batch endpoint (§6.6), so lessons and entries keep separate caches.
4. **One library (14.10.2026, "Option B").** Old documents become library entries with the same id and slug; format categories ("Paper academic", "Sách", "Báo VN") are dropped because the SOURCE type and its citation already say that. One learner hub at `/thu-vien`, one admin section "Thư viện". See §9.2. *(The subject areas and two-level browsing first built for this were replaced the same day by decision 6.)*
6. **One kind of knowledge entry, linked as a network (14.10.2026).** Chủ đề, Thuật ngữ, Lĩnh vực and Bài đọc are merged into one type, Mục từ, because the lines between them were not definite. There is no hierarchy: entries connect through "Liên quan" links, through `/tv/` links in their text (automatic backlinks) and through shared sources, and the whole network can be seen on the map (§4.2, §7.5). Same-word entries are told apart by a bracket in the title, as on Wikipedia. Nguồn, Viết tắt and Công cụ stay separate types because they carry different fields.
7. **Suggestions name their kind (14.10.2026).** The learner's "Góp ý" form has one "Loại góp ý" choice: fix the lesson, or propose a new Mục từ / Nguồn / Viết tắt / Công cụ. The kind is stored in `Suggestion.suggestedType`; the reviewer's "create" link opens the entry editor on that type. The library has its own "Đề xuất mục mới" button with the four entry kinds.
5. **Editor links (14.10.2026).** BlockNote's own "Tạo liên kết" button (and its Ctrl+K shortcut) is removed from the formatting toolbar: it linked straight to an external URL without a SOURCE entry. "Tham chiếu" is the only way to add a link; pasting a bare URL is still autolinked by BlockNote and is reported by the audit. In the editor, library links show purple with a dotted underline; other links blue with a solid underline and "↗".
