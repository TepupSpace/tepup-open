# Learner pages accessibility audit (WCAG 2.2 AA), 2026-10-07

Scope: course pages, lesson player, interactive blocks, story pages and the chapter player, plus the chrome they share (learn header, tab bar, AI chat, text-selection popover, lesson/chapter popups). File:line references are to commit `68f2023`; later commits shift them.

**Already fixed on `feat/learner-a11y`:** the player footer buttons' contrast (S4: "Hoàn thành" and the new "Học bài tiếp" use green-700, "Kiểm tra" uses blue-600); the chapter player's "bài học" labels (m5); reduced motion for the player's reveal scroll (m2, player only); the touch path of the text-selection popover (part of M9; the keyboard path is still open); the Vietnamese subset for Geist. Everything else below is open.

## Summary

| Severity | Count | Meaning |
|---|---|---|
| Critical | 2 | Some users cannot complete a task |
| Serious | 8 | A task is very hard, or a large group of users is affected |
| Moderate | 15 | A real barrier, with a workaround or a narrower reach |
| Minor | 9 | Polish or best practice |

The two biggest problems:

1. **Screen readers don't get quiz and exercise results.** Right and wrong are shown only by colour and by icons hidden from assistive technology.
2. **Focus handling in the lesson player.** Pressing "Tiếp tục" often leaves keyboard focus on a button that just became disabled, and the new content is never announced.

Automated linting found almost nothing (3 hits). Nearly every finding comes from reading the code.

## Critical

### C1. Quiz results are not exposed to screen readers
- **WCAG:** 1.3.1, 4.1.2, 1.4.1.
- **Where:**
  - `components/learn/QuestionBlock.tsx:61-118`: right and wrong are shown by border/fill colour and by `Check`/`X` icons that are `aria-hidden`. Options become `disabled` after checking.
  - `QuestionBlock.tsx:124-136`: the live region only renders when the block has an `explanation`. When it does, a wrong answer is announced only as "Giải thích:".
  - `components/blocks/PerspectiveSwitchBlock.tsx:150-181`: the option buttons have no `aria-pressed`, so even the selection is invisible to assistive technology.
- **Impact:**
  - A blind learner who picks a wrong answer is never told it was wrong, or which answer was right.
  - On questions without an explanation they hear nothing at all.
- **Fix:**
  - Add a visually hidden status to each option's name after checking: `<span className="sr-only">— đáp án đúng</span>`, `— bạn chọn, sai`, `— còn thiếu`.
  - Always announce a verdict in a persistent live region: "Đúng" or "Chưa đúng. Đáp án đúng: …", followed by the explanation if there is one.
  - Add `aria-pressed` (or radio/checkbox roles) to the PerspectiveSwitch options.

### C2. Calculator inputs have no accessible name
- **WCAG:** 1.3.1, 4.1.2, 3.3.2.
- **Where:** `components/blocks/CalculatorBlock.tsx:89-113`. The `<label>` is a sibling of the field, with no `htmlFor`/`id`.
- **Impact:** Screen-reader and voice-control users hear "spin button, 50000" and can't tell what the field is.
- **Fix:** Link the label and field with `useId()` and `htmlFor`/`id`, and put the unit inside the label.

## Serious

### S1. Revealing the next step drops keyboard focus, and the new content isn't announced
- **WCAG:** 2.4.3, 4.1.3.
- **Where:** `components/learn/LessonPlayer.tsx`: `handleContinue`, the footer button state and the footer button.
- **Impact:**
  - When the next group holds a question or an exercise, the button just pressed turns `disabled` ("Chọn đáp án" / "Hoàn thành bài tập"). Focus falls to `<body>`, and the next Tab skips the new content.
  - Screen-reader users hear nothing after "Tiếp tục".
- **Fix:**
  - Give the group-start wrapper `tabIndex={-1}` and call `focus({ preventScroll: true })` on it after the scroll.
  - Use `aria-disabled` and a no-op handler instead of `disabled`.
  - Optionally announce "Phần 3/7" in a polite live region.

### S2. Feedback in interactive blocks is visual-only or not announced
- **WCAG:** 4.1.3, 1.4.1, 1.3.1.
- **Where:**
  - SortBucket (`SortBucketBlock.tsx:78-81, 259-261`; counter at `297-307`): a wrong move is only a 600 ms red flash.
  - PairMatch (`PairMatchBlock.tsx:113-116`): the same 600 ms flash.
  - HotColdGuess (`HotColdGuessBlock.tsx:85-102`): guess results go into a list that isn't live.
  - Five blocks mount their live region together with its content, so it is often not read: `HotColdGuessBlock.tsx:168`, `PerspectiveSwitchBlock.tsx:195`, `BiasDetectorBlock.tsx:207`, `BudgetAllocatorBlock.tsx:195`, `CalculatorBlock.tsx:141`.
- **Fix:**
  - Give each block one always-mounted `<p className="sr-only" aria-live="polite">` and write messages into it ("Sai rổ, thử lại", "Còn 3 thẻ", "Lạnh! Cao hơn").
  - Keep live wrappers mounted permanently and render only their children conditionally.

### S3. Dialog focus management
- **WCAG:** 2.4.3, 4.1.3.
- **LibraryDocument** (`LibraryDocumentBlock.tsx:180-195`): doesn't move focus in on open, has no trap, and doesn't return focus on close.
- **SuggestEdit** (`SuggestEditDialog.tsx:81-88`):
  - There's no trap, and focus isn't returned on close.
  - The error at `:172` isn't announced.
  - The thank-you message replaces the focused button, so focus is lost.
- **AIChatBox** (`AIChatBox.tsx:67-78`):
  - It has `aria-modal` but isn't modal, and there's no Escape handler.
  - The textarea is `disabled` while a reply streams, so focus is lost.
- **Fix:**
  - Use `focus-trap-react` (already used by `LessonPopup`) with `initialFocus` and `returnFocusOnDeactivate`.
  - Give errors `role="alert"`.
  - For chat: drop `aria-modal`, add Escape, and use `readOnly` plus `aria-busy` while streaming.

### S4. Primary buttons fail text contrast (4.5:1 needed)

| Button | Colours | Ratio | Where |
|---|---|---|---|
| ~~"Hoàn thành"~~ (fixed) | white / green-500 | 2.22:1 | `LessonPlayer.tsx` |
| ~~"Kiểm tra"~~ (fixed) | white / blue-500 | 3.76:1 | `LessonPlayer.tsx` |
| "Bắt đầu" | white / blue-500 | 3.76:1 | `LessonPopup.tsx:68` |
| "Nhảy cóc" | white / orange-500 | 2.89:1 | `LessonPopup.tsx:67`, `ChapterPopup.tsx:37` |
| Chapter "Bắt đầu" | white / teal-500 | 2.42:1 | `ChapterPopup.tsx:31` |
| "Kiểm tra tất cả" | white / yellow-500 | 1.91:1 | `BiasDetectorBlock.tsx:193` |
| "Xem kết quả" | white / lime-600 | 3.06:1 | `BudgetAllocatorBlock.tsx:185` |
| "Gửi góp ý" | white / teal-600 | 3.66:1 | `SuggestEditDialog.tsx:185` |

Fix: use the -700 shades (blue-600 is 5.26:1).

### S5. Small grey text below 3:1
- **Contrast:** gray-400 is 2.6:1 on white and about 2.4–2.5:1 on tinted backgrounds, often at 10–11 px.
- **Where:**
  - `LessonNode.tsx:61`, `ChapterNode.tsx:69`
  - `AIChatBox.tsx:85, 134, 206` (the AI privacy notice)
  - `FlipCardBlock.tsx:106`
  - `SliderSimulatorBlock.tsx:132`
  - `BiasDetectorBlock.tsx:171, 200`
  - `SortBucketBlock.tsx:217`
  - `CalculatorBlock.tsx:91`
  - `HotColdGuessBlock.tsx:119`
  - `AIChatSettings.tsx:13, 40`
- **Fix:** Use gray-500 as the floor (4.6–4.8:1), with a minimum size of `text-xs`.

### S6. The learning path doesn't expose lesson or chapter state
- **WCAG:** 1.3.1, 4.1.2.
- **Where:** `LessonNode.tsx:30-62`, `ChapterNode.tsx:33-70`. Completed, current and ahead are shown only by colour and icons.
- **Also:** the lock icon suggests that lessons are locked when they are open.
- **Fix:**
  - Add the state to the accessible name ("…, đã hoàn thành" / "bài hiện tại" / "chưa học").
  - Put `aria-current="step"` on the current node.
  - Replace the lock with a neutral icon.

### S7. Course, lesson, story and chapter pages share one generic `<title>`
- **WCAG:** 2.4.2, 4.1.3.
- **Where:** there is no `generateMetadata` in those routes.
- **Impact:** Next's route announcer speaks only when `document.title` changes, so moving course → lesson → next lesson announces nothing.
- **Fix:** Add `generateMetadata`, e.g. `${lesson.name} — ${course.name} | Tepup`.

### S8. Sticky player bars can hide the focused element (inferred)
- **WCAG:** 2.4.11, 1.4.10.
- **Where:** player header (about 64 px) and footer (about 92 px); there is no `scroll-padding`. The `BottomTabBar` has the same issue.
- **Fix:**
  - Set `html { scroll-padding-top: <header>; scroll-padding-bottom: var(--bottom-chrome) }`.
  - Consider un-sticking the bars below `max-height: 480px`.

## Moderate

- **M1. Video and audio have no captions or transcript.**
  - WCAG 1.2.1–1.2.3.
  - Where: `NativeBlock.tsx:156, 177`. The video and audio block types have no captions field.
  - Fix: add an optional WebVTT `<track kind="captions" srclang="vi">` and a transcript.
- **M2. Image alt text falls back to the upload file name.**
  - WCAG 1.1.1.
  - Where: `lib/editor/blocknote-converter.ts:121`.
  - Fix: add an explicit alt field in the editor, and allow an empty value as a deliberate "decorative" choice.
- **M3. Heading structure.**
  - WCAG 1.3.1, 2.4.6.
  - The player has no `<h1>` (the title only appears in the progress bar label).
  - Course and story pages jump from h1 to h3 (`LearningPath.tsx:81`, `ChapterPath.tsx:67`).
- **M4. The skip link target is missing on story pages.**
  - WCAG 2.4.1.
  - Where: `story/[characterId]/page.tsx:80`, `[storySlug]/page.tsx:124`. `<main>` has no `id="main-content"`.
- **M5. Selection state and grouping aren't exposed.**
  - WCAG 4.1.2.
  - PerspectiveSwitch "tabs" have no tab roles.
  - AIChatSettings persona and model buttons show the selection only by colour.
  - Quiz options aren't grouped with their question.
- **M6. FlipCard.**
  - Both faces sit inside the button, so both are read before flipping.
  - Overflow scrolls inside the button.
  - A `<div>` inside a `<button>` is invalid HTML.
  - Where: `FlipCardBlock.tsx:90, 157-180`.
- **M7. Focus indicators are too faint where the outline is removed.**
  - WCAG 2.4.7, 1.4.11.
  - Calculator (cyan-400, 1.8:1), chat input (blue-400), SuggestEdit fields (teal-500).
  - Fix: `focus-visible:ring-2 ring-offset-2` in a colour of at least 3:1.
- **M8. Table header rows use `<td>`.**
  - WCAG 1.3.1.
  - Where: `NativeBlock.tsx:130-145`.
  - Fix: render `<thead>`/`<th scope="col">` when `headerRow` is set.
- **M9. The text-selection popover is pointer-only.**
  - WCAG 2.1.1.
  - Touch is fixed on this branch. Selecting text with the keyboard still never opens "Hỏi AI / Kiểm chứng / Góp ý sửa".
- **M10. The chat transcript doesn't identify speakers.**
  - Speakers are shown only by alignment and colour.
  - Streaming updates inside `aria-live` (inferred to read in fragments).
  - Fix: add a hidden "Bạn:" / persona prefix, and announce the finished reply once.
- **M11. Checklist checkboxes are focusable but unnamed.**
  - They are `readOnly` checkboxes (`NativeBlock.tsx:45`).
  - Fix: use an icon plus hidden "(đã xong)" text.
- **M12. A chat button target is too small.**
  - WCAG 2.5.8.
  - The 14×14 px clear-selection button (`AIChatBox.tsx:156-162`).
- **M13. Non-text contrast.**
  - WCAG 1.4.11.
  - Progress fill: green-500 on gray-100 is 2.0:1.
  - Input borders: gray-200 on white is 1.24:1.
- **M14. Custom (Sandpack) blocks can block a lesson.**
  - "Hoàn thành bài tập" waits for a message from author code, so content that isn't keyboard-operable stops keyboard users.
  - The iframe title is the generic "Sandpack Preview".
  - Fix: add a "Bỏ qua bài tập" escape and an authoring checklist.
- **M15. Lesson and chapter popups have no visible close button.**
  - They can only be dismissed by the hidden backdrop or Escape.

## Minor

- **m1. English strings without `lang`.** "Fact Check", "bias", "highlight", "Click". Prefer Vietnamese.
- **m2. JS smooth scrolling ignores reduced motion.** Fixed for the player reveal. Still open in `LearningPath.tsx:64` and `AIChatBox.tsx:26`.
- **m3. Warning callouts use `role="alert"`** (`CalloutBlock.tsx:43`). They interrupt the screen reader when revealed. Use `role="note"`.
- **m4. Disabled footer button text is 2.1:1.** It carries an instruction ("Chọn đáp án").
- **m5. Chapter player labels said "bài học".** Fixed.
- **m6. Range sliders have no `aria-valuetext`** (`SliderSimulatorBlock.tsx:122-131`).
- **m7. Path nodes are buttons, not links**, so they can't be opened in a new tab or found in a links list.
- **m8. File links open a new tab without warning** (`NativeBlock.tsx:194`).
- **m9. Duplicate landmark name on `/courses`.** There are two `<nav aria-label="Điều hướng chính">` elements.

## What's already good

- **Page structure:** `lang="vi"`, a working skip link on course and lesson pages, and header/main/footer landmarks in the player.
- **Motion and icons:** a global `prefers-reduced-motion` rule covers CSS animations, lucide icons are `aria-hidden` by default, and icon-only buttons have labels.
- **Progress bar:** `role="progressbar"` with values and a label.
- **Exercises:** SortBucket and PairMatch work by tap, click or keyboard as well as by dragging.
- **Quiz and popups:** QuestionBlock's live region is persistent, and LessonPopup and ChapterPopup trap focus.
- **No time pressure:** there are no timeouts or auto-advance.

## Method and limits

- **Linting:** jsx-a11y 6.10.2 `strict` over 61 files found 3 issues: `media-has-caption` ×2, and an acceptable backdrop click handler.
- **Static checks:** axe-core (in jsdom) on server-rendered HTML from the local Docker build.
- **Contrast:** computed from Tailwind 4.1.18 oklch values, plus a manual code review against WCAG 2.2 AA.
- **Not done:**
  - No real browser, screen reader, zoom or touch testing; items marked *inferred* need confirming.
  - Custom-block content wasn't audited.
  - Dark mode and the reading settings were built after this audit, so they weren't covered.
