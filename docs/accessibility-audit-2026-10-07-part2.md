# Accessibility audit, part 2: browser run and the areas part 1 skipped (2026-10-07)

Part 1 ([accessibility-audit-2026-10-07.md](accessibility-audit-2026-10-07.md)) read the learner-page code. Part 2 covers what part 1 didn't:

1. **A real-browser run.** Playwright with Chromium and WebKit, against the local Docker stack, using the **real production content** (imported content-only).
2. **Areas not reviewed before:**
   - dark mode and the reading settings;
   - custom blocks;
   - the `/courses` hub and the landing page;
   - sign-in and register;
   - the contributor area;
   - error pages and the PWA prompts.

The browser kit lives in [`a11y-e2e/`](../a11y-e2e/README.md) and can be re-run at any time with `bash a11y-e2e/run.sh`.

## What was run

| Check | Scope |
|---|---|
| axe-core 4.13, WCAG 2.2 A/AA + best practice | Every public page, light and dark; 128 lessons and chapters with all blocks shown (via "Đọc toàn bộ"), light and dark; signed-in contributor pages |
| Reflow | 320 px wide, text at 150% and readable font: every public page and every lesson and chapter |
| Keyboard | Tab walks (focus visible, not hidden under sticky bars); a whole lesson done by keyboard only; the reading-settings panel; the suggest-edit dialog |
| Touch | Pixel 7 (Chromium) and iPhone 14 (WebKit): 24 px target size; the text-selection bar |
| Reading settings | Screenshots of each combination. `html` font size and fonts applied on learner pages, unchanged on `/courses`. No flash of light theme with "Theo máy" + dark OS |
| Custom blocks | Local fixture lesson. axe inside the sandbox iframe, region label, the "Bỏ qua bài tập" keyboard escape |

**Not covered:** real screen readers and physical phones. The accessibility-tree snapshots in `a11y-e2e/results/aria/` show what a screen reader is given, but a short manual pass is still needed: NVDA with Chrome, and VoiceOver on an iPhone, through one lesson with a quiz and one exercise.

## Results on learner pages

The first browser run (before the fixes below) found the learner pages largely clean after part 1. The remaining issues, all now fixed on `feat/learner-a11y`:

| Finding | WCAG | Fix |
|---|---|---|
| Dark mode: text pasted into lessons as `color: rgb(0,0,0)` (21 Thuế 101 lessons) became black on near-black, 1.2:1 | 1.4.3 | In dark mode, inline author colours follow the theme (`app/reader.css`) |
| Dark mode: indigo/violet/purple -500 text was under 4.5:1 on the dark card; `bg-black/50` backdrops became white veils; white focus-ring halo | 1.4.3, 1.4.11 | Palette generator lifts -500 for darker hues, keeps black, and sets the ring-offset colour |
| Dark mode: transparent diagrams (dark line art) disappeared | 1.1.1 | White backing behind images in dark mode |
| Every chapter overflowed 7 px at 320 px / 150%: "Về câu chuyện" + "Đọc chương tiếp" didn't fit | 1.4.10 | The buttons wrap |
| PerspectiveSwitch tabs scrolled sideways with a hidden scrollbar | 1.4.10 | The tabs wrap |
| gray-500 text on tinted panels: 4.39–4.44:1 (it passes on white, not on -50/-100 tints) | 1.4.3 | gray-600 on tints (also added to the guide) |
| Heading levels skipped from the lesson h1 to h3 (text and heading blocks, block titles, callouts, library cards) | 1.3.1 | Section and block titles are h2, their parts h3. Callout titles are bold text |
| Teal/orange "Bắt đầu" on story cards 3.7:1 | 1.4.3 | -700 |
| Calculator result label in dark mode 4.39:1 | 1.4.3 | gray-700 |
| Reading settings: +/− dropped focus at the limits; Escape there stole focus from other dialogs; the panel stayed open after tabbing away | 2.4.3 | `aria-disabled`; Escape only when focus is inside; closes when focus leaves |
| Custom-block sandbox page was `lang="en"` titled "Document", so Vietnamese was read with English rules | 3.1.1 | The sandbox gets `lang="vi"` and the block's name; the iframe title is kept up to date |
| Quiz verdict read "…bạn.. Đáp án" (doubled full stop) | — | Trailing punctuation stripped |

**Keyboard and focus:**
- Focus never fell to the page body during the keyboard-only lesson. After "Tiếp tục" it lands on the new content. After "Kiểm tra" it stays on the button, and the verdict and explanation are announced.
- The suggest-edit dialog keeps focus inside and returns it on Escape. So does the reading-settings panel.
- The "Bỏ qua bài tập" escape on custom blocks is reachable by Tab and unblocks "Tiếp tục".

**Content note (not accessibility):** three live Thuế 101 lessons have no content, so learners see "Bài học này chưa có nội dung":
- `ngan-sach-nha-nuoc-la-gi`
- `ai-quyet-dinh-muc-thue`
- `nguoi-nop-thue-co-nhung-quyen-gi`

## Custom blocks

- **Production has no custom blocks:** zero block types, and no lesson or chapter uses one.
- **The risk was in how blocks get made:**
  - The AI generator's instructions told it to use `#3b82f6` (white text on it is 3.8:1) and had no accessibility rules.
  - The browser run on a fixture written that way found what you'd expect inside the sandbox: an unlabelled input, `outline: none`, a `div` with only a click handler, and pale text.
- **Fixed:**
  - The generator's instructions now require native controls, full keyboard use, labels, visible focus, 4.5:1 contrast, no colour-only feedback, a live region, 44 px targets and reduced motion.
  - The sandbox is `lang="vi"`.
  - Learners always have the keyboard escape.
- **Still open:**
  - **CB1 (Serious):** a generated block is saved to the library without any check. Add a required review checklist to the save dialog: done by keyboard only, including completion; labels; contrast; live region. Record who reviewed it and when, and run jsx-a11y on `App.jsx` when saving, showing warnings.
  - **CB2 (Moderate):** the sandbox doesn't follow dark mode or text size, since its iframe can't inherit them. Pass the reading settings into the sandbox (`window.__TEPUP_PREFS` in `setup.js`) and require generated blocks to honour them, or at least set their own light background. The fixed 300 px iframe height also means larger text scrolls inside the frame; resize the iframe via postMessage.
  - **CB3 (Moderate):** the instructions don't yet forbid autofocus on load, trapping or intercepting Tab or Escape, time limits or auto-advance, autoplaying audio, and flashing.

## Open findings outside the learner pages

Found by the browser run and the code review. None blocks learners from completing a lesson. Contributors and first-time visitors are affected.

### Serious

- **H1. `/courses` hub carousel can't be paused.**
  - WCAG 2.2.2, 4.1.2. `components/courses-hub/StoryShowcase.tsx`.
  - The character showcase auto-advances every 5 s and pauses only on mouse hover.
  - Keyboard and screen-reader users hear "pressed / not pressed" flip under them.
  - The "Khám phá hành trình" link can change destination while focused.
  - **Fix:** a visible pause control, stop on any focus or touch inside, tablist semantics, and "Khám phá hành trình của {tên}".
- **H2. Contrast on the hub, landing and contributor pages.**
  - Hub:
    - the "Câu chuyện" accent is pink on paper, 2.8:1 (large text, so 3:1 is needed);
    - the nav current item and "Khám phá hành trình" are red, 4.3 and 3.5:1;
    - the "Mới" badge is 2.9:1.
  - Landing:
    - the section eyebrows are 2.4–3.1:1;
    - the pink note is 2.8:1;
    - the footer legal text is 2.7:1;
    - the CTA is 4.3:1.
  - Contributor and auth: primary buttons are white on teal-500 (2.4:1) or blue-500 (3.8:1), and teal-600 links are 3.5–3.7:1.
  - **Fix:** darker brand tokens and -700 fills.
- **A1. Password show/hide button has no name or state.**
  - WCAG 4.1.2, 2.5.8. `app/(auth)/login/LoginForm.tsx`, `register-contributor/page.tsx`.
  - It is also a 20×20 px target.
- **C1. Review decision is shown by colour only.**
  - WCAG 1.3.1, 3.3.1. `app/contributor/reviews/[id]/page.tsx`.
  - Approve, request changes and reject show the selection by colour only.
  - The required feedback field isn't linked to its label.
  - Errors aren't announced.
- **C2. Contributor sidebar and drawer.**
  - WCAG 2.4.3, 2.4.11, 4.1.2. `components/contributor/ContributorSidebar.tsx`.
  - When the drawer is closed, its links stay in the Tab order, off-screen.
  - The drawer has no focus handling or Escape.
  - The collapse button has no name; axe confirms this on every contributor page.
  - The active link isn't exposed.

### Moderate

- **Auth and contributor forms:** no `aria-invalid` or `aria-describedby`; success and error messages aren't announced; a minimum length is only revealed on error; the feature-request role picker is colour-only.
- **Page titles:** login, register, banned, the 404 page and every contributor page share a generic title, so navigation isn't announced.
- **Skip link and main landmark:** the skip link has no target on contributor, auth, 404 and error pages, and there's no `<main>` (axe: `skip-link`, `landmark-one-main`, `region`).
- **Hub focus indicators** are under 3:1 on the paper background.
- **DesktopOnlyNotice:**
  - The app behind it isn't `inert`.
  - It triggers on CSS width, so zoomed desktop users get it.
  - It adds a third h1.
- **Landing page:**
  - Hero text is sized from the viewport, so it doesn't grow with browser zoom (inferred).
  - The marquee and character sway are infinite motion with no pause, apart from the OS reduced-motion setting.
- **Error boundaries and InstallPrompt:**
  - Error boundaries aren't announced.
  - The InstallPrompt iOS guide has no focus handling.
- **Hub nav at 320 px** clips "Sắp có" (inferred).

### Minor

- **Landing:**
  - the h1's accessible name runs words together ("Tép riuStép up…");
  - "Giới thiệu" is always styled active;
  - the mobile menu has no Escape.
- **Contributor pages:**
  - English UI words (Dashboard, Username, Feedback, Level);
  - two h1s on contributor screens;
  - logo links named "T";
  - new tabs open without a warning;
  - autosave status is announced on every save.
- **RouteProgressBar** is silent on slow navigations.

## Fine as is (checked)

- **Root layout:** `lang="vi"`, zoom isn't blocked.
- **Auth forms:** proper labels and `autocomplete`, password managers work, no CAPTCHA.
- **Landing:** reduced motion is handled well.
- **Hub:** shelves are named groups.
- **Reading settings:** real radios, settings applied before paint, the system theme followed.
- **Dark palette:** following the light-mode colour rules carries over safely; -600/-700 fills flip to light fills with dark text at 5.6–10:1.
- **Submission status badges:** text plus icon, not colour alone.

## Keeping it this way

The lint gate (`npm run lint:a11y`) currently covers learner-facing code only. That's why the hub, landing, auth and contributor issues above got through. Once those are fixed, widen `a11yFiles` in `tepup/eslint.a11y.mjs` to include `app/(landing)`, `app/(auth)`, `app/contributor`, `components/landing` and `components/contributor`. CSS-module colours (`courses-hub.css`, `landing-v2.css`) aren't linted; the browser kit's axe run is what catches them, so re-run it after visual changes.
