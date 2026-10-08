# Browser accessibility checks

These are Playwright tests that run in Docker against the local stack. They use real Chromium and WebKit, not jsdom. They complement `npm run lint:a11y`, which only reads the code: here the pages are actually rendered and used.

## What it checks

- **axe-core (WCAG 2.2 A/AA + best practice):**
  - every public page, in the light and dark reading themes;
  - every lesson and chapter in "Đọc toàn bộ" mode (all blocks at once), in light and dark;
  - the contributor pages, signed in.
- **Reflow:** 320 px wide, text at 150% and the readable font, with no horizontal scrolling.
- **Keyboard:**
  - Tab walks, logging focus visibility and whether sticky bars cover the focused element.
  - A whole lesson done by keyboard only.
  - The reading-settings panel and the suggest-edit dialog: focus trap, Escape, focus return.
- **Touch (Pixel 7 Chromium, iPhone 14 WebKit):** 24 px target size, and the text-selection toolbar.
- **Reading settings:** screenshots of each combination. Pages without `.reader` are unchanged.
- **Custom blocks:** a local-only fixture lesson. Covers axe inside the sandbox iframe, the region label, and the keyboard "Bỏ qua bài tập" escape.

**Not covered:**
- A real screen reader. The `results/aria/` snapshots show the accessibility tree a screen reader reads, but a short NVDA or VoiceOver pass is still needed.
- Physical phones, the OS selection menu, and real long-press.

## Run

1. Start the local stack from `tepup/`:
   ```bash
   docker compose -p tepup-local up -d
   ```
   Importing real content first (`scripts/docker-import-content.sh`) makes the run meaningful.
2. From the repo root, run everything:
   ```bash
   bash a11y-e2e/run.sh
   ```
   Or run one file:
   ```bash
   bash a11y-e2e/run.sh tests/keyboard.spec.ts
   ```

Read `a11y-e2e/results/summary.md`. `results/screens/` has the screenshots and `results/aria/` the accessibility-tree snapshots. Test "failures" there are crashes, not findings: findings are written to the results, so the run always completes.

The script writes one local-only fixture lesson into the **local Docker database**, in the inactive `sandbox-block` course. Nothing touches staging or production.
