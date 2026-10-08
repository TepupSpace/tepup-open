# Accessibility and dark mode: admin, contributor and sign-in (2026-10-08)

These areas now follow the same rules as the learner pages ([accessibility.md](accessibility.md)):

- **Dark mode and reading settings:** both layouts have the `.reader` class and both headers have the "Aa" button. The lesson editor (BlockNote) follows the reading theme through `components/admin/editor/useReaderTheme.ts`.
- **Lint gate:** `npm run lint:a11y` now also covers `app/admin`, `app/contributor`, `app/(auth)`, `components/admin`, `components/contributor`, `components/review` and `components/pwa`. It went from 333 errors in these folders to 0, and production deploys still wait for it.
- **Page titles:** every admin and contributor page has its own title through a layout template ("Khoá học — Quản trị | Tepup"). Client pages were split into a server `page.tsx` (with metadata) and a `*Client.tsx`.

## What changed

- **Contributor findings fixed:** audit part 2 items C1, C2, A1, the form errors, page titles, skip link and `<main>`, DesktopOnlyNotice, InstallPrompt, the English UI words and the double h1.
- **Admin, newly audited:**
  - **Critical:** the level and lesson reordering was drag-only. Move up and move down buttons now save through the same API and announce the new position.
  - **Serious:**
    - Modals had no focus trap, Escape or focus return. There is now a shared `AdminDialog` and a `ConfirmDialog` that names the item.
    - 47 form labels were not linked to their fields.
    - Icon-only buttons had no names.
    - Buttons were disabled right after being pressed, which dropped focus.
    - Errors and success messages weren't announced.
    - Feature-request rows opened only on mouse click.
    - The block builder had an English iframe title, "Làm mới" deleted everything without asking, and errors went to `alert()`.
    - White text on -500 fills and gray-400 text failed contrast.
  - **Moderate:** status was shown by colour alone, tables lacked headers and captions, heading order was off, and there was English in the UI ("Bảng điều khiển", "Cấp độ", "Khoá/Mở khoá", role names in Vietnamese).
- **Admin components and the editor:**
  - The sidebar drawer is now `inert` when closed, traps focus when open and closes with Escape. Navigation links have `aria-current`.
  - The header's h1 is now plain text, so each page has exactly one h1.
  - The block-edit drawer is a real modal.
  - Widget blocks can be opened by keyboard (arrows, then Enter), and there is keyboard help text.
  - The 16 block forms: about 75 labels linked, toggles expose their state, and a keyboard alternative to image drag-and-drop.
  - Typing in an "id" field no longer remounts the row and loses focus.
  - Hard-coded hex colours in the editor are replaced by palette classes.
- **Shared review components** (`components/review`): contrast fixes, a labelled note field, and buttons that don't drop focus.

## Verified

- **Browser kit:** 789 checks completed, with no failures.
- **axe:** **0 findings on every admin and contributor page**, in light and dark (signed in, with the production content).
- **Reflow:** 0 overflows.
- **Suggest-edit regression:** after "Góp ý sửa" from a selection and "Huỷ", the page moves 0 px and focus returns to the paragraph being read.

## Still open

- **The editor (BlockNote's own UI):**
  - The drag handle and side menu are mouse-only. Keyboard users move blocks with Shift+Mod+Arrow and insert with "/".
  - Learner widgets inside the editor preview are reached with Enter → drawer, not with Tab.
- **Native dialogs:** `prompt()` and `confirm()` remain for the ban reason, admin note, publish conflict and discarding drafts. They are accessible.
- **Focus after deleting a list row** in the block forms falls to the page.
- **Sandpack previews** (custom blocks, block builder) stay light in dark mode.
- **Pages outside this round:** the landing page, the `/courses` hub, the contributor guide and the 404 page. See part 2, H1/H2 and the moderate items. The contributor guide and the 404 page still lack `<main>`.
- **Manual pass:** keyboard, NVDA or VoiceOver, and dark mode by eye on the admin editor.
