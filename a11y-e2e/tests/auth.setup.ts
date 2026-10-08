import { test as setup } from '@playwright/test';
import { ADMIN_STATE } from './helpers';

setup('log in as local admin', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#identifier').fill('admin');
  await page.locator('#password').fill(process.env.LOCAL_ADMIN_PASSWORD ?? 'tepup-local-admin');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30_000 });
  await page.context().storageState({ path: ADMIN_STATE });
});
