## Tepup Design System

> **Tép riu · stép up · stép out** — a brand whose name turns a Vietnamese word for "tiny shrimp" into a manifesto for everyday learners.

Tepup is a Vietnamese-language platform for **practical civic knowledge** — the basics of **tax, critical thinking, and digital rights**. **Free, anonymous, in Vietnamese.** UX is inspired by Brilliant.org (gamified roadmaps, progressive content reveal) and Wikipedia (open, community-contributed content). It is built as a Next.js 16 + Tailwind 4 web app and consists of three product surfaces: a **learner-facing site**, an **admin / contributor dashboard**, and a **lesson reader** with 25+ interactive content-block types.

The current product `<title>` and `<meta description>`:

> **Tepup — Kiến thức công dân thực dụng bằng tiếng Việt**
> *Học những điều cơ bản về thuế, tư duy, và quyền số — miễn phí, ẩn danh, bằng tiếng Việt.*

## Sources

This design system was reverse-engineered from a single source — please explore it for deeper context:

- **GitHub** — the TepUp app repository (`tepup/`)
  - `tepup/app/` — Next.js App Router pages (homepage, courses, learn, story, admin)
  - `tepup/components/` — React components (`Header`, `LessonNode`, `CharacterCard`, admin sidebars, 24+ interactive block types under `components/blocks/`)
  - `tepup/app/globals.css` — animation keyframes (`slide-up`, `fade-in`, `pulse-ring`)
  - `tepup/public/` — three brand logos (color, alt, B&W)
  - `docs/PLAN.md` + `docs/01-ui-ux/tasks/*/PRD.md` — Vietnamese-language PRDs that describe the product roadmap

Stack: Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4 · Lucide React icons · Geist font · Prisma 7 + Supabase Postgres · NextAuth v5.

---

## What this folder contains (index)

| File | What's in it |
|---|---|
| `README.md` | This file — product context, content fundamentals, visual foundations, iconography |
| `SKILL.md` | Agent-Skill manifest — drop this folder into Claude Code and invoke as a skill |
| `colors_and_type.css` | All color + typography CSS variables, semantic tokens, font import |
| `assets/` | Tepup logos (PNG, color + B&W), favicon |
| `fonts/` | Empty — Tepup uses Geist via Google Fonts (no local font files exist in source) |
| `preview/` | Cards rendered in the project's Design System tab (colors, type, components, brand) |
| `ui_kits/web/` | High-fidelity recreation of the learner-facing site (homepage, courses, lesson reader, story) |
| `ui_kits/admin/` | High-fidelity recreation of the admin dashboard |

---

## Product context (deeper)

### The brand promise
The homepage opens with three lines that read as one tagline:

> **Tép riu** *(teal)* — **stép up** *(blue)* — **stép out** *(orange)*

"Tép riu" literally means "tiny freshwater shrimp" — a Vietnamese idiom for small, ordinary people. The pun "stép" replaces the Vietnamese "tép" with the English "step", and the three lines stack as a tiny manifesto: *little shrimp → step up → step out (of the familiar pond)*.

The brand promise is **practical civic knowledge** — not academic theory. Three core topics:

- **Thuế** (tax) — what gets withheld, why, where it goes
- **Tư duy** (thinking) — bias, evidence, argument
- **Quyền số** (digital rights) — privacy, data, online identity

Delivered **free**, **anonymous** (Tepup intentionally collects no personal learner data), in **Vietnamese**.

### Three product surfaces
1. **Learner site** (`/`, `/courses`, `/learn/[id]`, `/story/[character]`) — public-facing, gamified, Vietnamese.
2. **Admin / contributor dashboard** (`/admin/...`) — content review, course/lesson/story CRUD, user management.
3. **Lesson reader** — full-screen, progress-bar header, progressive-reveal content blocks (text, callout, question, library document, **plus 24 interactive gamification blocks**: `calculator`, `slider-simulator`, `budget-allocator`, `bias-detector`, `stat-trick`, `perspective-switch`, `hot-cold-guess`, `redacted-document`, `hidden-pattern`, `debate-arena`, `argument-mapper`, `fact-or-opinion`, `decision-tree`, `prisoner-dilemma`, `policy-lab`, `source-ranker`, `propaganda-detector`, `correlation-causation`, `timeline-sorter`, `cause-effect-chain`, `spectrum-placer`, `socratic-dialog`, `ai-essay-review`, `scenario-what-if`). This is the most distinctive surface — it's what makes Tepup different from a static MOOC.

### Three story characters (color-coded throughout)
| Character | Role | Color |
|---|---|---|
| **Minh** | Sinh viên (Student) | Teal |
| **Hương** | Nhân viên VP (Office worker) | Blue |
| **Bác Tư** | Bán hàng rong (Street vendor) | Orange |
| *(Gig driver — extensible 4th)* | | Purple |

Lessons can be entered "by topic" (course detail) or "by character" (story narrative) — same lesson nodes, different framing.

---

## Content fundamentals

**Language: Vietnamese only.** All UI strings, course content, and copy are in Vietnamese. Diacritics matter — never strip them, never substitute (e.g. `ạ`, `ầ`, `ễ`, `ơ`, `ư` must render exactly). The Geist font supports full Latin Extended including Vietnamese.

**Tone: warm, modest, encouraging.** The brand voice talks *with* the learner, not down to them. The opening slogan literally calls them "tiny shrimp" — affectionate, never patronising. Compare:

> ✅ *"Tiếp tục hành trình học tập của bạn"* — "Continue your learning journey"
> ✅ *"Lắng nghe câu chuyện của Minh"* — "Listen to Minh's story"
> ✅ *"Khám phá hành trình"* — "Explore the journey"
> ❌ Never: "Master the material", "Unlock your potential", marketing-y power verbs

**Person: 2nd-person `bạn` (you), informal-friendly.** Login says *"Tên tài khoản của **bạn**"*. The CTA on each character card says *"Khám phá hành trình"* (Explore the journey) — implicit "you". No `Quý khách` (formal "you"), no `chúng tôi/chúng ta` (corporate "we") in core UX copy.

**Casing.** Vietnamese Title Case for nouns ("Lộ trình Học", "Chủ đề nổi bật"), sentence case for body, **never SHOUTY UPPERCASE** except a single visual eyebrow: `CẤP ĐỘ 1` above level names (`text-xs uppercase tracking-wide`). The "NEW" badge on course cards is the only uppercase Latin token in the UI.

**Vocabulary: gentle gamification.**
- `Bắt đầu` ("Begin") — primary action verbs (start a lesson)
- `Tiếp tục` ("Continue") — primary action in the lesson reader
- `Kiểm tra` ("Check") — answer-checking, never `Submit`
- `Nhảy cóc` ("Frog-leap") — the orange-coded action for **skipping ahead** to a future lesson. Playful, not punitive.
- `Hoàn thành` ("Complete") — turns the action button green at the end of a lesson
- `Quay lại` ("Go back") — universal back-button label
- `Khám phá` ("Discover/Explore") — discovery CTAs
- `Lắng nghe` ("Listen to") — used for story entry: *"Lắng nghe câu chuyện của [character]"*

**Quotation style.** Vietnamese typographic quotes `"…"` for character voicing ("nó là một..."). The homepage uses `&ldquo;tép riu&rdquo;` for the brand name in context.

**No emoji.** I searched the codebase: zero emoji in product UI, marketing, or content. Lucide icons carry every glyph role. **Do not add emoji to any Tepup artifact.**

**Bilingual brand pun.** The name itself toggles Vietnamese (`tép`) and English (`step`). Marketing copy occasionally code-switches on this single pun. Do not extend the bilingualism elsewhere — keep all other copy Vietnamese.

**No corporate filler.** No "Built with ❤️ in...", no "Trusted by 10,000+ learners", no testimonial slop. The platform's pitch is *open / free / safe / community-built*, modelled on Wikipedia, not on a SaaS landing page.

---

## Visual foundations

### Color
- **Primary action = `--blue-500` (#3b82f6).** It's the workhorse: hero CTAs, current-lesson rings, active nav, primary buttons, focus rings.
- **Brand trio = teal · blue · orange.** Used in the slogan and as the three character accents. A fourth, purple, slots in for the gig-driver character and for the **library / reading** surface (purple side panel for library documents).
- **Tinted backgrounds, not white-on-color.** Cards use `bg-{color}-50` with a `text-{color}-500` glyph — a "tile" pattern. White cards with subtle border `border-gray-100/200` dominate the surface; color appears in small contained patches (icon tiles, badges, status nodes).
- **Three semantic statuses with strict color jobs:**
  - **Green** (`--green-500`) — completed lessons, success callouts, the "Hoàn thành" final-step button. Always paired with `Check` glyph.
  - **Yellow** (`--yellow-500`) — warning callouts only. Used sparingly.
  - **Red** (`--red-500`) — wrong-answer state, error banners. Never decorative.
- **Background palette = white + `--gray-50`.** Sections alternate `bg-white` and `bg-gray-50` for visual rhythm. The bottom CTA on the homepage uses `bg-gray-900` (near-black) — the only deep tone in the layout.
- **Imagery vibe.** No photography in the codebase; the only visual asset is the logo. The "imagery" budget is spent entirely on **Lucide icon tiles in soft `-50` backgrounds**. Warm, clean, daylight — never moody, never dark.

### Type
- **Geist Sans** for everything except codeblocks (Geist Mono). Both loaded via `next/font/google` (no local font files exist in the source).
- **Weight system:** 400 body · 500 medium (nav, meta) · 600 semibold (default CTA) · 700 bold (headings, card titles, brand tagline). 800 unused.
- **Sizes (Tailwind):** `text-7xl` only for the homepage slogan; `text-3xl` page H1; `text-2xl` section H2 / lesson titles; `text-xl` card H3; `text-lg` lead paragraphs and CTAs; `text-sm` meta; `text-xs` eyebrows.
- **Letter-spacing.** Default for body. `tracking-tight` for the slogan; `tracking-wide` on uppercase eyebrows.
- **No serif.** No display font. Geist is the entire personality — modern, geometric, neutral, Vietnamese-aware.

### Spacing
- Tailwind 4-base scale. Section padding is `py-16 sm:py-20`; card padding is `p-5` or `p-6`; container is `max-w-7xl` with `px-4 sm:px-6 lg:px-8`.
- Cards are **never dense** — generous breathing room (`gap-4` to `gap-8`) is the rule. The grid is `gap-4` for course cards, `gap-6` for hero cards, `gap-8` for big section gaps.

### Backgrounds + decoration
- **Solid + tinted only.** No photographic backdrops. No noise textures. No repeating patterns.
- The homepage hero has a signature touch: three `bg-{teal|blue|orange}-50` circles, `blur-3xl`, positioned absolutely behind the hero, opacity 40–60%. This is the **only** gradient/blur effect anywhere — and even this is a *soft glow*, not a hard gradient. Document this so it isn't overused.
- One spot uses `bg-gradient-to-br from-purple-500 to-pink-500` (the "Stories" section header icon tile). Single, ten-pixel-wide instance — treat it as a sparing accent, not a pattern.
- **Never** use full-bleed gradient page backgrounds, glassmorphism panels, hand-drawn doodles inside the UI (the logo carries all the hand-drawn personality), animated SVG backdrops, or stylised "blob" hero shapes other than the `blur-3xl` glow.

### Animation
- **Sparing, soft, fast.** Three keyframes total in `globals.css`: `slide-up` (popup, 250ms `cubic-bezier(0.32, 0.72, 0, 1)`), `fade-in` (block reveal, 400ms ease-out), `pulse-ring` (the active-lesson halo, infinite). Also `slideInRight` for the library document side panel, `scaleIn` for the mobile modal variant.
- **The current-lesson node has a `animate-ping` ring** — a 2-second outward pulse at 30% opacity. This is the platform's heartbeat; do not remove it from active states.
- All animations respect `prefers-reduced-motion: reduce` — globally clamped to `0.01ms` in `globals.css`.
- Transitions are 150–300ms with `ease-out` curves. No bounces, no springs, no scale-up bigger than 1.05.

### Hover + press states
- **Hover.** Three styles in rotation: (a) `hover:bg-gray-50` for nav items, (b) `hover:shadow-lg + hover:-translate-y-1` for cards (a subtle 4px lift), (c) `hover:bg-{color}-600` for primary buttons (darken one step). Icon-tile cards add `hover:bg-{color}-100` (the tinted background goes one step darker).
- **Active card border.** Cards transition `border-gray-200 → hover:border-gray-300` or to a character-tinted border like `hover:border-teal-300`.
- **Press.** No global press state (no `active:` styles in source). For touch we'd recommend `active:scale-[0.98]` but the codebase doesn't define one — flag this as a gap.
- **Focus.** `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent` on inputs. A skip-link in `layout.tsx` materialises on focus with `focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg`.

### Borders
- **Default border = `1px solid var(--gray-100)` or `var(--gray-200)`.** Use `border-gray-100` for very subtle (header bottom, decorative cards) and `border-gray-200` for primary card borders.
- **Status nodes use thick borders.** The active lesson node is a `4px` `border-blue-500` ring on a white fill — the platform's signature shape. Story nodes mirror this with character colors.
- **Callouts use `border-2`** in a single status color (`border-blue-200`, `border-yellow-200`, `border-green-200`, `border-purple-200`).

### Shadow system
- **Four tiers.** `shadow-sm` (card baseline, sticky info card on course detail) · `shadow-md` (admin cards on hover) · `shadow-lg` (card hover) · `shadow-2xl` (lesson popup; the only "big" shadow in the app).
- **Tinted shadows on active states.** Active lesson nodes get `shadow-lg shadow-blue-200` — the blue tint is part of the focus signal. Character story nodes mirror this with their character color.
- **No inner shadows. No "neumorphic" effects. No glow rings except the `animate-ping` halo.**

### Transparency + blur
- **Used in exactly three places:** the popup backdrop (`bg-black/20` for lesson popup, `bg-black/50` for the library document side-panel modal); the hero glow circles (`blur-3xl opacity-60`); the `animate-ping` ring (`opacity-30`).
- Never use frosted glass / `backdrop-blur` on persistent UI chrome. The header is **opaque white** with a bottom border — no blur.

### Corner radii
| Token | px | Used for |
|---|---|---|
| `rounded-md` | 6 | small tags |
| `rounded-lg` | 8 | nav items, inline inputs, skip-link |
| `rounded-xl` | 12 | buttons, form inputs, callout pill backgrounds |
| `rounded-2xl` | 16 | **the signature corner** — cards, callouts, popups, hero plates |
| `rounded-3xl` | 24 | category container, course info plate |
| `rounded-full` | ∞ | lesson nodes, avatars, "NEW" badge, progress thumb |

The `2xl` (16px) corner is the soul of the visual language. When in doubt, that's the radius.

### Card anatomy
A canonical Tepup card:
```
bg-white  /  border  border-gray-200  /  rounded-2xl
p-6  (sometimes p-5 or p-8)
hover:shadow-lg  hover:-translate-y-1  hover:border-gray-300
transition-all duration-200
```
…with an **icon tile** in the top-left: a `w-14 h-14 bg-{color}-50 rounded-2xl flex items-center justify-center` block holding a `w-7 h-7 text-{color}-500` Lucide icon. This icon-tile + title + body + CTA composition is the design system's most-repeated module.

### Layout rules
- Single `max-w-7xl mx-auto` container (1280px). Course detail uses a narrower `max-w-6xl`; lesson reader uses `max-w-3xl`.
- Header is **sticky `top-0 z-50`**, 64px tall (`h-16`), white with a `border-b border-gray-100`. The lesson reader also has a sticky header and a sticky footer (the action button).
- Grids: course cards use a `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` rhythm; feature cards use `grid-cols-1 md:grid-cols-3`; character cards use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
- Course/Story detail pages use a `lg:grid-cols-3` 2-column layout: 1/3 sticky info card on the left, 2/3 zigzag lesson roadmap on the right.

### The signature shape: the zigzag roadmap
On any course or story detail page, lessons stack vertically with `gap-8`, alternating `translate-x-0` and `translate-x-16` — a soft zigzag. A grey 1px×32px connector line drops between each node. **This is the most recognisable Tepup visual**; preserve it in any mock of the learning surfaces.

### A11y
- Skip-link is shipped (`Chuyển đến nội dung chính`).
- Every interactive Lucide icon has `aria-hidden="true"` and a sibling label or `aria-label`.
- `FocusTrap` (`focus-trap-react`) is used on popups.
- `role="progressbar"` / `aria-valuenow` on lesson progress bar.
- `aria-current="page"` on the active nav item.

---

## Iconography

**System: Lucide React.** The codebase uses [`lucide-react`](https://lucide.dev/) at `^0.563.0`. Every glyph in the product UI — nav, callouts, cards, character avatars, admin sidebar, lesson nodes — is a Lucide icon. There is no custom icon font, no SVG sprite, no PNG icon set.

**Sizes.**
- `w-4 h-4` (16px) — inline / meta, e.g. `Quay lại` arrow, "5 chương" meta
- `w-5 h-5` (20px) — nav items, buttons, action icons
- `w-6 h-6` (24px) — section dividers, modal-close `X`, callout glyphs
- `w-7 h-7` to `w-8 h-8` (28–32px) — inside icon tiles
- `w-10 h-10`+ (40+) — hero icon plates, lesson-node `Check` glyphs

**Stroke weight.** Lucide default (`stroke-width=2`). Never thinner — the brand reads "approachable", not "delicate".

**Color rule.** An icon takes the color of its semantic role: blue for primary, green for success, red for danger, character color when inside a character context. Icons are never multi-color (the logo is the only multi-color glyph in the system).

**The Lucide icons in active use** (so you know what's already in the visual vocabulary):

| Domain | Icons |
|---|---|
| Nav / chrome | `Home`, `BookOpen`, `Library`, `Menu`, `ArrowLeft`, `ArrowRight`, `X`, `ChevronRight`, `ChevronLeft` |
| Actions / state | `Check`, `Lock`, `Eye`, `EyeOff`, `LogOut`, `User`, `Settings`, `Clock` |
| Course tiles | `Lightbulb`, `Binary`, `Receipt`, `Building`, `PieChart`, `Scale`, `Coins`, `TrendingUp`, `Brain`, `Landmark` |
| Characters | `GraduationCap`, `Briefcase`, `Store`, `Bike` |
| Callouts | `Lightbulb`, `MessageCircle`, `AlertCircle`, `CheckCircle` |
| Story / library | `BookOpen`, `BookMarked`, `Headphones`, `Sparkles`, `Heart` |
| Admin | `LayoutDashboard`, `FolderTree`, `GraduationCap`, `Users`, `UserCog`, `CheckSquare`, `Lightbulb` |
| Marketing | `Shield`, `Sparkles`, `Lock`, `Gift`, `Users`, `Heart`, `Map` |

**Emoji.** None. Anywhere. Don't add any.

**Unicode chars as icons.** None used. Bullet dots in document lists are styled `<span>` characters (`•` in purple) — that's the only stylised non-icon glyph.

**Logo asset.** The Tepup logo is a hand-drawn red shrimp doubling as a stylised "T" (Vietnamese pun: "Tép" = shrimp). Three PNG versions are shipped in `assets/`:
- `tepup-logo.png` — full color, signature variant (used in `Header.tsx`)
- `tepup-logo-alt.png` — color shrimp inside a purple square frame (alternate lockup)
- `tepup-logo-bw.png` — monochrome
- The favicon is a 32×32 reduction of the same shrimp.

The hand-drawn logo is the **only** hand-drawn element in the entire system — it carries all of the brand's "human" personality. Do not extend hand-drawn / sketch / doodle aesthetics into other surfaces; they'd compete with the logo.

---

## Font substitution flag

**No local font files exist in the source repo.** Tepup loads Geist Sans + Geist Mono via `next/font/google` in `app/layout.tsx` (subset `latin` — Google Fonts auto-includes Vietnamese diacritics via Unicode-range CSS, so no extra subset is required). This design system imports both from Google Fonts in `colors_and_type.css` — same source, same byte content. If you want fully offline fidelity, please drop `.woff2` files for Geist into `fonts/` and we'll update the `@font-face` rules.

---

## What's intentionally **not** here

- **No mobile-app UI kit.** Tepup is a web product (Next.js, no React Native). Recreate the responsive web kit instead.
- **No marketing site.** The product *is* the marketing site — the homepage doubles as the brand surface.
- **No dark mode.** The code only defines a light-mode palette. `globals.css` has commented-out `@media (prefers-color-scheme: dark)` hooks but they're not wired up.
- **No icon library file.** Lucide is consumed directly from `lucide-react` — no curation layer.
