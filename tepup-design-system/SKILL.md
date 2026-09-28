---
name: tepup-design
description: Use this skill to generate well-branded interfaces and assets for Tepup — a Vietnamese-language platform for practical civic knowledge (tax, critical thinking, digital rights — free, anonymous, in Vietnamese). The visual language is built around a hand-drawn red-shrimp logo, the Tép riu / stép up / stép out slogan trio (teal · blue · orange), Geist typography, generous rounded-2xl cards, Lucide icons at 2px stroke, and a signature gamified zigzag lesson roadmap. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. Either for production code or throwaway prototypes / mocks.
user-invocable: true
---

Read the `README.md` in this skill first — it covers the brand context, content fundamentals (Vietnamese-only copy, tone, vocabulary, no-emoji rule), visual foundations (colors, type, spacing, shadows, motion, the zigzag signature), iconography (Lucide React @ ^0.563), and an index pointing to every other file.

Then explore on demand:
- `colors_and_type.css` — all color + typography CSS variables and semantic tokens. Import this anywhere.
- `assets/` — the three Tepup logo variants (color, framed, mono) + favicon.
- `ui_kits/web/` — recreation of the learner site (Header, HeroSlogan, CourseCard, CharacterCard, LearningPath zigzag, LessonNode, LessonPopup, LessonReader with content blocks). Open `index.html` for an interactive demo.
- `ui_kits/admin/` — recreation of the admin dashboard (AdminSidebar, AdminHeader, StatCard, ReviewsList, CoursesScreen). Open `index.html` for an interactive demo.
- `preview/` — small HTML cards for each token / component, used by the project's Design System tab.

If creating **visual artifacts** (slides, mocks, throwaway prototypes, demo HTML), copy the assets you need out (`assets/tepup-logo.png`, etc.) and create static HTML files that import `colors_and_type.css`. The UI kits are written in plain React + inline styles via `@babel/standalone` so they work offline with no build step.

If working on **production code**, the source codebase is Next.js 16 + Tailwind CSS 4. The CSS variables in `colors_and_type.css` map 1:1 to the Tailwind color/space/radius scale the codebase uses — `--blue-500` is `bg-blue-500`, `--r-lg` is `rounded-2xl`, etc.

If the user invokes this skill **without any other guidance**, ask them what they want to build or design, ask 4–8 clarifying questions (audience, screen, fidelity, variations, copy tone), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

## Inviolable rules (from the brand)
- **Vietnamese copy only** for in-product strings. Preserve all diacritics exactly. The brand pun "Tép" ↔ "stép" is the only bilingual touch.
- **No emoji.** Use Lucide React icons for every glyph role.
- **No hand-drawn elements** other than the logo itself — the shrimp logo carries all the personality.
- **rounded-2xl (16px) is the signature corner.** When in doubt, use that radius.
- **The active lesson node has an `animate-ping` ring** — preserve this heartbeat on active states in any roadmap mock.
- **No emoji. No emoji. No emoji.** (Saying it three times because new AI tools love adding 🎉 to Tepup screens. Don't.)
