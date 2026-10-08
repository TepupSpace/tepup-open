import { test } from '@playwright/test';
import { ADMIN_STATE, record, runAxe, screenshot } from './helpers';

// The fixture lesson (fixtures/custom-block.mjs) lives in an inactive course, so it is
// opened signed in (staff view renders the same player).
const URL = '/courses/sandbox-block/a11y-custom-block-fixture';

test.use({ storageState: ADMIN_STATE });

test('custom block: wrapper, sandbox content, keyboard escape', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  await page.goto(URL);
  const footer = page.locator('footer button').first();
  // Reveal until the custom block is on screen.
  for (let i = 0; i < 5 && !(await page.locator('iframe').count()); i++) {
    await footer.press('Enter');
    await page.waitForTimeout(600);
  }
  const frame = page.locator('iframe').first();
  await frame.waitFor({ timeout: 60_000 });
  // Sandpack bundles in the iframe; give it time to render the component.
  await page.frameLocator('iframe').first().locator('button, h3').first().waitFor({ timeout: 90_000 }).catch(() => {});

  const log: Record<string, unknown> = {
    regionLabel: await page.locator('section[aria-label]').filter({ has: frame }).getAttribute('aria-label').catch(() => null),
    iframeTitle: await frame.getAttribute('title'),
    footerBefore: (await footer.textContent())?.trim(),
    footerAriaDisabled: await footer.getAttribute('aria-disabled'),
  };

  // axe covers the iframe too (cross-origin frames are analysed by @axe-core/playwright).
  log.axe = (await runAxe(page, testInfo, 'custom block lesson')).map((v) => `${v.id} (${v.impact}) ×${v.count}`);
  await screenshot(page, testInfo, 'custom block');

  // Keyboard escape hatch: Tab until "Bỏ qua bài tập" (it is reachable at once for keyboard users).
  let reached = false;
  for (let t = 0; t < 30 && !reached; t++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => /Bỏ qua bài tập/.test(document.activeElement?.textContent ?? ''));
  }
  log.skipReachableByTab = reached;
  if (reached) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    log.afterSkipFocus = await page.evaluate(() => (document.activeElement?.textContent ?? '').trim().slice(0, 60));
    log.footerAfter = (await footer.textContent())?.trim();
    log.footerAriaDisabledAfter = await footer.getAttribute('aria-disabled');
  }
  record(testInfo, 'custom', 'custom block', log);
});
